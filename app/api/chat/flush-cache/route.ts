import { NextRequest, NextResponse } from 'next/server';
import { flushRagCache } from '@/lib/redis';

/**
 * POST /api/chat/flush-cache
 * Xóa tất cả RAG cache trong Redis.
 * Dùng khi thay đổi config LLM (maxOutputTokens, temperature, etc.)
 */
export async function POST(req: NextRequest) {
    try {
        const deleted = await flushRagCache();

        return NextResponse.json({
            success: true,
            message: `Đã xóa ${deleted} cache entries`,
            deleted,
        });
    } catch (error: any) {
        console.error('Error flushing cache:', error);
        return NextResponse.json(
            { error: 'Failed to flush cache' },
            { status: 500 }
        );
    }
}
