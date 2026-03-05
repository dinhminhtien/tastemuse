import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { canUseFeature } from '@/lib/subscription';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * GET /api/reviews/summary?target_type=dish&target_id=xxx
 * Generate an AI summary of all reviews for a dish/restaurant.
 * Premium-only feature.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const targetType = searchParams.get('target_type');
        const targetId = searchParams.get('target_id');

        if (!targetType || !targetId) {
            return NextResponse.json(
                { error: 'Thiếu thông tin: target_type, target_id' },
                { status: 400 }
            );
        }

        // Authenticate user
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập' },
                { status: 401 }
            );
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(
            authHeader.replace('Bearer ', '')
        );

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Phiên đăng nhập không hợp lệ' },
                { status: 401 }
            );
        }

        // Check premium feature
        const hasFeature = await canUseFeature(user.id, 'ai_review_summary');
        if (!hasFeature) {
            return NextResponse.json(
                {
                    error: 'Tính năng Tóm tắt đánh giá bằng AI chỉ dành cho gói Premium.',
                    code: 'PREMIUM_REQUIRED',
                    upgrade: true,
                },
                { status: 403 }
            );
        }

        // Fetch reviews for the target
        const { data: reviews, error: reviewsError } = await supabaseAdmin
            .from('reviews')
            .select('content, sentiment, sentiment_score, created_at')
            .eq('target_type', targetType)
            .eq('target_id', targetId)
            .eq('is_flagged', false)
            .order('created_at', { ascending: false })
            .limit(50);

        if (reviewsError) {
            return NextResponse.json(
                { error: reviewsError.message },
                { status: 500 }
            );
        }

        if (!reviews || reviews.length === 0) {
            return NextResponse.json({
                success: true,
                summary: 'Chưa có đánh giá nào để tóm tắt.',
                review_count: 0,
                sentiment_breakdown: { positive: 0, neutral: 0, negative: 0 },
            });
        }

        // Compute sentiment breakdown
        const sentimentBreakdown = {
            positive: reviews.filter(r => r.sentiment === 'positive').length,
            neutral: reviews.filter(r => r.sentiment === 'neutral').length,
            negative: reviews.filter(r => r.sentiment === 'negative').length,
        };

        const avgScore = reviews.reduce((sum, r) => sum + (r.sentiment_score || 0), 0) / reviews.length;

        // Fetch target name for context
        let targetName = '';
        if (targetType === 'dish') {
            const { data } = await supabaseAdmin
                .from('dishes')
                .select('name')
                .eq('id', targetId)
                .single();
            targetName = data?.name || 'Món ăn';
        } else {
            const { data } = await supabaseAdmin
                .from('restaurants')
                .select('name')
                .eq('id', targetId)
                .single();
            targetName = data?.name || 'Nhà hàng';
        }

        // Generate AI summary using Gemini
        const reviewTexts = reviews
            .map((r, i) => `${i + 1}. [${r.sentiment || 'unknown'}] "${r.content}"`)
            .join('\n');

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.5,
            },
        });

        const prompt = `Bạn là trợ lý đánh giá ẩm thực. Hãy tóm tắt các đánh giá dưới đây cho "${targetName}" (${targetType === 'dish' ? 'món ăn' : 'nhà hàng'}).

Yêu cầu:
- Viết tóm tắt ngắn gọn (3-5 câu) bằng tiếng Việt
- Nêu rõ điểm mạnh và điểm yếu (nếu có)
- Đề cập đến xu hướng chung của các đánh giá
- Sử dụng emoji phù hợp để sinh động hơn

Thống kê: ${reviews.length} đánh giá (${sentimentBreakdown.positive} tích cực, ${sentimentBreakdown.neutral} trung lập, ${sentimentBreakdown.negative} tiêu cực)

Các đánh giá:
${reviewTexts}

Tóm tắt:`;

        const result = await model.generateContent(prompt);
        const summary = result.response.text().trim();

        return NextResponse.json({
            success: true,
            target_name: targetName,
            target_type: targetType,
            summary,
            review_count: reviews.length,
            sentiment_breakdown: sentimentBreakdown,
            avg_sentiment_score: Math.round(avgScore * 100) / 100,
        });
    } catch (error: any) {
        console.error('Review summary error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
