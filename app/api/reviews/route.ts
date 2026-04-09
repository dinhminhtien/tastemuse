import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db/supabase';
import { checkRateLimit, getRateLimitKey } from '@/lib/utils/rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Analyze review sentiment using Gemini
 */
async function analyzeSentiment(content: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number;
}> {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: { maxOutputTokens: 100, temperature: 0.1 },
        });

        const result = await model.generateContent(
            `Phân tích cảm xúc của đánh giá sau (chỉ trả JSON, không giải thích):
"${content}"

Trả về: {"sentiment": "positive"|"neutral"|"negative", "score": -1.0 đến 1.0}`
        );

        const text = result.response.text().replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch {
        return { sentiment: 'neutral', score: 0 };
    }
}

/**
 * POST /api/reviews – Create a review with sentiment analysis
 */
export async function POST(req: NextRequest) {
    try {
        const limitKey = getRateLimitKey(req);
        const limit = checkRateLimit(limitKey, 'api');
        if (!limit.allowed) {
            return NextResponse.json(
                { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' },
                { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
            );
        }

        const authHeader = req.headers.get('authorization');
        const { data: { user }, error: authError } = await supabase.auth.getUser(
            authHeader?.replace('Bearer ', '')
        );

        if (authError || !user) {
            return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
        }

        const { target_type, target_id, content } = await req.json();

        if (!target_type || !target_id || !content) {
            return NextResponse.json(
                { error: 'Thiếu thông tin: target_type, target_id, content' },
                { status: 400 }
            );
        }

        if (content.length < 10) {
            return NextResponse.json(
                { error: 'Đánh giá phải có ít nhất 10 ký tự' },
                { status: 400 }
            );
        }

        // Analyze sentiment (async but we await for the insert)
        const sentimentResult = await analyzeSentiment(content);

        const { data, error } = await supabaseAdmin
            .from('reviews')
            .insert({
                user_id: user.id,
                target_type,
                target_id,
                content,
                sentiment: sentimentResult.sentiment,
                sentiment_score: sentimentResult.score,
            })
            .select()
            .single();

        if (error) {
            console.error('Review insert error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: {
                ...data,
                sentiment_analysis: sentimentResult,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * GET /api/reviews?target_type=dish&target_id=xxx
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const targetType = searchParams.get('target_type');
    const targetId = searchParams.get('target_id');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    try {
        let query = supabaseAdmin
            .from('reviews')
            .select('*', { count: 'exact' })
            .eq('is_flagged', false);

        if (targetType && targetId) {
            query = query.eq('target_type', targetType).eq('target_id', targetId);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data,
            count,
            pagination: { limit, offset },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
