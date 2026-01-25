import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateEmbedding, generateRAGResponse } from '@/lib/vertex-ai';
import { RAG_CONFIG, ERROR_MESSAGES } from '@/lib/rag-config';

/**
 * RAG-enabled Chat API Route
 * 
 * Flow:
 * 1. Generate embedding for user query
 * 2. Perform vector similarity search in documents table
 * 3. Retrieve matched documents
 * 4. Build context string from matched documents
 * 5. Send context + query to Vertex AI Gemini
 * 6. Return LLM response
 */

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.MISSING_MESSAGE },
        { status: 400 }
      );
    }

    console.log('📩 Received message:', message);

    // Step 1: Generate embedding for the user query
    console.log('🔄 Generating query embedding...');
    const queryEmbedding = await generateEmbedding(message);
    console.log(`✅ Query embedding generated (dimension: ${queryEmbedding.length})`);

    // Step 2: Perform vector similarity search on documents (via chunks)
    console.log('🔍 Searching for similar documents...');
    const { data: matches, error: searchError } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: RAG_CONFIG.SIMILARITY_THRESHOLD,
      match_count: RAG_CONFIG.MAX_RESULTS,
    });

    if (searchError) {
      console.error('❌ Search error:', searchError);
      throw new Error(`${ERROR_MESSAGES.SEARCH_FAILED}: ${searchError.message}`);
    }

    console.log(`✅ Found ${matches?.length || 0} similar documents`);

    // Step 3: Build context from matched documents
    // match_documents already returns title and content, so we can use them directly
    let context = '';

    if (matches && matches.length > 0) {
      console.log('📝 Building context from matched documents...');

      context = matches.map((match: any, index: number) => {
        const similarity = (match.similarity * 100).toFixed(1);
        return `${index + 1}. ${match.title} (Độ phù hợp: ${similarity}%)
${match.content}`;
      }).join('\n\n');

      console.log(`✅ Context built with ${matches.length} documents`);
    } else {
      context = 'Không tìm thấy thông tin phù hợp với yêu cầu của bạn. Vui lòng thử lại với từ khóa khác.';
      console.log('⚠️  No matches from vector search');
    }

    // Step 5: Generate response using RAG
    console.log('🤖 Generating RAG response...');
    const response = await generateRAGResponse(message, context, history);
    console.log('✅ Response generated successfully');

    // Step 6: Return response
    return NextResponse.json({
      message: response,
      // Optional: include metadata for debugging
      metadata: {
        matchCount: matches?.length || 0,
        topSimilarity: matches?.[0]?.similarity || 0,
        sources: matches?.map((m: any) => ({
          document_id: m.document_id,
          similarity: m.similarity,
          source_type: m.source_type,
          title: m.title,
        })) || [],
      }
    });

  } catch (error: any) {
    console.error('❌ Error in RAG chat API:', error);

    // Return user-friendly error message
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.GENERIC,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    // Check database connection
    const { data, error } = await supabase
      .from('documents')
      .select('count')
      .limit(1);

    if (error) {
      throw error;
    }

    // Check if match_documents function exists
    const { data: functionExists, error: funcError } = await supabase.rpc('match_documents', {
      query_embedding: new Array(768).fill(0),
      match_threshold: 0.1,
      match_count: 1,
    });

    return NextResponse.json({
      status: 'ok',
      message: 'RAG Chat API is running',
      features: ['vector-search', 'embeddings', 'rag', 'documents'],
      database: {
        connected: !error,
        matchFunctionExists: !funcError,
      },
      config: {
        embeddingModel: RAG_CONFIG.EMBEDDING_MODEL,
        embeddingDimension: RAG_CONFIG.EMBEDDING_DIMENSION,
        llmModel: RAG_CONFIG.LLM_MODEL,
        similarityThreshold: RAG_CONFIG.SIMILARITY_THRESHOLD,
        maxResults: RAG_CONFIG.MAX_RESULTS,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
    }, { status: 500 });
  }
}
