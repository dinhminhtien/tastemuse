import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateEmbedding, generateRAGResponse } from '@/lib/gemini-ai';
import { RAG_CONFIG, ERROR_MESSAGES } from '@/lib/rag-config';
import { extractFilters, isSearchQuery } from '@/lib/filter-extraction';
import { hybridSearch, formatHybridContext } from '@/lib/hybrid-ranking';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { updateUserTaste } from '@/lib/user-taste';
import { checkUsageLimit, logUsage } from '@/lib/subscription';
import type { ChatFilters } from '@/types/database';
import { getCachedResponse, setCachedResponse } from '@/lib/redis';
import { addMessage, createConversation } from '@/lib/chat-history';
import { validateUserInput, validateOutput } from '@/lib/guardrails';

/**
 * Enhanced RAG Chat API Route
 *
 * Flow:
 * 1. Rate limit check
 * 2. Usage limit check
 * 3. Cache check
 * 4. Input Guardrails (Topic & Safety)
 * 5. Extract filters & Vector search
 * 6. Generate LLM response
 * 7. Output Guardrails (Grounding & Brand)
 * 8. Return response & Update history/taste
 */
export async function POST(req: NextRequest) {
  try {
    const { message, history = [], sessionId, userLocation, conversationId } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.MISSING_MESSAGE },
        { status: 400 }
      );
    }

    // Step 0: Rate limiting (anti-spam)
    const limitKey = getRateLimitKey(req);
    const limit = checkRateLimit(limitKey, 'chat');
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: 'Bạn đang gửi quá nhanh. Vui lòng chờ một chút nhé! 😊',
          retryAfter: limit.retryAfter,
        },
        { status: 429 }
      );
    }

    console.log('📩 Received message:', message);

    // Step 0.5: Authenticate user & check subscription limits
    let userId: string | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
      userId = user?.id || null;
    }

    // Server-side guest limit: 1 query per IP per day
    if (!userId) {
      const guestKey = getRateLimitKey(req);
      const guestLimit = checkRateLimit(guestKey, 'guest');
      if (!guestLimit.allowed) {
        return NextResponse.json(
          {
            error: '🔒 Bạn cần đăng nhập để tiếp tục sử dụng TasteMuse AI. Đăng nhập miễn phí để có 5 lượt hỏi AI mỗi ngày!',
            code: 'GUEST_LIMIT_EXCEEDED',
            requireLogin: true,
          },
          { status: 403 }
        );
      }
    }

    // Subscription-based usage limiting (logged-in users)
    if (userId) {
      const usageCheck = await checkUsageLimit(userId, 'ai_chat');
      if (!usageCheck.allowed) {
        return NextResponse.json(
          {
            error: 'Bạn đã hết lượt hỏi AI hôm nay. Nâng cấp Premium để không giới hạn! ✨',
            code: 'USAGE_LIMIT_EXCEEDED',
            usage: {
              used: usageCheck.used,
              limit: usageCheck.limit,
              remaining: 0,
            },
            upgrade: true,
          },
          { status: 403 }
        );
      }
    }

    // Cache Check: AFTER usage check so limits are still enforced
    const canCache = message && (!history || history.length <= 1) && !userLocation;
    const cacheKey = canCache ? `rag_cache:${message.trim().toLowerCase()}` : null;

    if (cacheKey) {
      const cachedData = await getCachedResponse(cacheKey);
      if (cachedData) {
        console.log(`⚡ REDIS CACHE HIT: ${message} (~50ms)`);
        // Still log usage for cached responses
        if (userId) {
          logUsage(userId, 'ai_chat', { message, cached: true }).catch(err =>
            console.error('Usage log error:', err)
          );
        }
        return NextResponse.json(cachedData);
      }
    }

    // Step 0.7: Input Guardrails
    const inputValidation = await validateUserInput(message);
    if (!inputValidation.passed) {
      console.warn('⚠️ Input guardrail triggered:', inputValidation.reason);
      
      // Log as fallback for analytics
      if (userId) {
        logUsage(userId, 'ai_chat', { 
          message, 
          fallback: true, 
          reason: inputValidation.reason,
          category: inputValidation.category 
        }).catch(err => console.error('Usage log error:', err));
      }

      return NextResponse.json({
        message: inputValidation.safeResponse || 'Yêu cầu không phù hợp.',
        guardrailTriggered: true,
        category: inputValidation.category,
      });
    }

    // Step 1: Extract filters from natural language (parallel with embedding)
    const [filters, queryEmbedding] = await Promise.all([
      isSearchQuery(message) ? extractFilters(message) : Promise.resolve({} as ChatFilters),
      generateEmbedding(message),
    ]);

    console.log(`✅ Query embedding generated (dim: ${queryEmbedding.length})`);
    if (Object.keys(filters).length > 0) {
      console.log('🔍 Extracted filters:', JSON.stringify(filters));
    }

    // Step 2: Hybrid search (semantic + rating + distance)
    let results;
    let context: string;

    try {
      results = await hybridSearch(queryEmbedding, {
        userLat: userLocation?.lat,
        userLng: userLocation?.lng,
        filters,
        matchThreshold: RAG_CONFIG.SIMILARITY_THRESHOLD,
        matchCount: RAG_CONFIG.MAX_RESULTS,
      });

      context = formatHybridContext(results);
      console.log(`✅ Hybrid search: ${results.length} results`);
    } catch (hybridError) {
      console.warn('⚠️ Hybrid search failed, falling back to basic search:', hybridError);

      const { data: matches, error: searchError } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: RAG_CONFIG.SIMILARITY_THRESHOLD,
        match_count: RAG_CONFIG.MAX_RESULTS,
      });

      if (searchError) {
        throw new Error(`${ERROR_MESSAGES.SEARCH_FAILED}: ${searchError.message}`);
      }

      results = matches || [];
      context = results.length > 0
        ? results.map((m: any, i: number) =>
          `${i + 1}. ${m.title} (Độ phù hợp: ${(m.similarity * 100).toFixed(1)}%)\n${m.content}`
        ).join('\n\n')
        : 'Không tìm thấy thông tin phù hợp với yêu cầu của bạn.';
    }

    // Step 3: Build enhanced prompt with filter context
    let enhancedContext = context;
    if (Object.keys(filters).length > 0) {
      const filterInfo: string[] = [];
      if (filters.mood) filterInfo.push(`Tâm trạng: ${filters.mood}`);
      if (filters.budget && (filters.budget.min !== undefined || filters.budget.max !== undefined)) {
        const minStr = filters.budget.min !== undefined && filters.budget.min !== null
          ? filters.budget.min.toLocaleString() + 'đ'
          : '0đ';
        const maxStr = filters.budget.max !== undefined && filters.budget.max !== null
          ? filters.budget.max.toLocaleString() + 'đ'
          : '?';
        filterInfo.push(`Ngân sách: ${minStr} - ${maxStr}`);
      }
      if (filters.maxDistance) filterInfo.push(`Khoảng cách tối đa: ${filters.maxDistance}km`);
      if (filters.cuisineType) filterInfo.push(`Loại ẩm thực: ${filters.cuisineType}`);
      if (filters.ward) filterInfo.push(`Khu vực: ${filters.ward}`);
      if (filters.isSignature) filterInfo.push(`Chỉ tìm món đặc sản`);
      if (filters.time) filterInfo.push(`Thời gian yêu cầu: ${filters.time}`);

      enhancedContext = `[Bộ lọc người dùng]\n${filterInfo.join('\n')}\n\n[Kết quả tìm kiếm]\n${context}`;
    }

    // Step 4: Generate LLM response
    console.log('🤖 Generating RAG response...');
    let response = await generateRAGResponse(message, enhancedContext, history);
    console.log('✅ Response generated successfully');

    // Step 4.5: Output Guardrails
    let guardrailTriggered = false;
    const outputValidation = await validateOutput(message, response, enhancedContext);
    if (!outputValidation.passed) {
      console.warn('⚠️ Output guardrail triggered:', outputValidation.reason);
      response = outputValidation.safeResponse || response;
      guardrailTriggered = true;
    }

    // Step 5: Log usage & update user taste (async, non-blocking)
    if (userId) {
      logUsage(userId, 'ai_chat', { 
        message,
        guardrailTriggered,
        fallback: guardrailTriggered,
        category: guardrailTriggered ? outputValidation.category : undefined
      }).catch(err =>
        console.error('Usage log error:', err)
      );
      if (isSearchQuery(message)) {
        updateUserTaste(userId, 'chat_query', {
          searchQuery: message,
        }).catch(err => console.error('Taste update error:', err));
      }

      // Save messages to chat history (async, non-blocking)
      if (conversationId) {
        Promise.all([
          addMessage(conversationId, 'user', message),
          addMessage(conversationId, 'assistant', response),
        ]).catch(err => console.error('Chat history save error:', err));
      }
    }

    // Step 6: Return response with rich metadata
    const responsePayload = {
      message: response,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      guardrailTriggered,
      metadata: {
        matchCount: results?.length || 0,
        topScore: results?.[0]?.hybrid_score || results?.[0]?.similarity || 0,
        sources: (results || []).slice(0, 5).map((r: any) => ({
          document_id: r.document_id,
          title: r.title,
          source_type: r.source_type,
          hybrid_score: r.hybrid_score,
          avg_rating: r.avg_rating,
          distance_km: r.distance_km,
        })),
        filtersApplied: Object.keys(filters).length > 0,
      },
    };

    if (cacheKey) {
      console.log(`💾 Caching RAG response to Redis for key: ${cacheKey}`);
      await setCachedResponse(cacheKey, responsePayload, 86400).catch(e => console.error('Cache set Error:', e));
    }

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error('❌ Error in RAG chat API:', error);

    return NextResponse.json(
      {
        error: ERROR_MESSAGES.GENERIC,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('count')
      .limit(1);

    if (error) throw error;

    const { data: functionExists, error: funcError } = await supabase.rpc('match_documents', {
      query_embedding: new Array(3072).fill(0),
      match_threshold: 0.1,
      match_count: 1,
    });

    // Check hybrid_search function
    let hybridAvailable = false;
    try {
      await supabase.rpc('hybrid_search', {
        query_embedding: new Array(3072).fill(0),
        match_threshold: 0.1,
        match_count: 1,
      });
      hybridAvailable = true;
    } catch { }

    return NextResponse.json({
      status: 'ok',
      message: 'TasteMuse RAG Chat API v2 – Guardrails Enabled',
      features: [
        'vector-search',
        'hybrid-ranking',
        'filter-extraction',
        'rate-limiting',
        'input-guardrails',
        'output-guardrails',
        'user-taste-tracking',
        hybridAvailable ? 'hybrid-search-sql' : 'fallback-semantic',
      ],
      database: {
        connected: !error,
        matchFunctionExists: !funcError,
        hybridSearchAvailable: hybridAvailable,
      },
      config: {
        embeddingModel: RAG_CONFIG.EMBEDDING_MODEL,
        embeddingDimension: RAG_CONFIG.EMBEDDING_DIMENSION,
        llmModel: RAG_CONFIG.LLM_MODEL,
        similarityThreshold: RAG_CONFIG.SIMILARITY_THRESHOLD,
        maxResults: RAG_CONFIG.MAX_RESULTS,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
    }, { status: 500 });
  }
}
