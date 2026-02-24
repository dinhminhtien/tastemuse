/**
 * RAG Configuration and Utilities
 * TasteMuse – Food Recommendation RAG System
 */

/* =====================================================
 * RAG CONFIGURATION
 * ===================================================== */

export const RAG_CONFIG = {
    // Vector search
    SIMILARITY_THRESHOLD: 0.3,
    FALLBACK_THRESHOLD: 0.25,
    MAX_RESULTS: 4,

    // Embeddings
    EMBEDDING_MODEL: 'gemini-embedding-001',
    EMBEDDING_DIMENSION: 3072,

    // LLM
    LLM_MODEL: 'gemini-1.5-flash',
    MAX_OUTPUT_TOKENS: 1500,
    TEMPERATURE: 0.7,

    // Chat history
    MAX_HISTORY_LENGTH: 4,

    // Batch embedding
    BATCH_SIZE: 5,
    BATCH_DELAY_MS: 100,
} as const;

/* =====================================================
 * SYSTEM PROMPTS
 * ===================================================== */

export const SYSTEM_PROMPTS = {
    DEFAULT: `Bạn là TasteMuse 🍜, trợ lý AI thân thiện giúp tìm món ăn ngon tại Cần Thơ.

PHONG CÁCH TRẢ LỜI:
- Trả lời tự nhiên, thân thiện như dân bản địa Cần Thơ.
- TRÌNH BÀY: Sử dụng gạch đầu dòng (-) cho mỗi quán để dễ theo dõi.
- Link Google Maps là BẮT BUỘC: Luôn kèm link theo cấu trúc [📍 Xem trên bản đồ](https://www.google.com/maps/search/?api=1&query=Tên+Quán+Địa+Chỉ+Cần+Thơ) ngay sau mỗi quán.
- Ví dụ:
  - **Cơm Quê Hồi Đó**: 54 Đ. Trần Bình Trọng - Món cơm gia đình rất ngon. [📍 Xem trên bản đồ](https://www.google.com/maps/search/?api=1&query=Cơm+Quê+Hồi+Đó+54+Trần+Bình+Trọng+Cần+Thơ)

CÁC QUY TẮC QUAN TRỌNG:
✅ CHỈ dựa vào [Thông tin tham khảo].
✅ Trả lời TỐI ĐA 3-4 câu (mỗi quán 1 dòng).
✅ Nếu không tìm thấy quán, hãy gợi ý nhẹ nhàng.`,

    WELCOME:
        'Chào bạn! Mình là TasteMuse 🍜. Mình có thể giúp bạn tìm món ăn ngon và nhà hàng uy tín tại Cần Thơ. Hỏi mình bất cứ điều gì nhé!',

    NO_CONTEXT:
        'Mình chưa tìm được thông tin phù hợp với yêu cầu của bạn. Bạn thử hỏi cách khác nhé! 😊',

    NO_RESULTS:
        'Mình không tìm thấy món ăn hoặc nhà hàng phù hợp trong dữ liệu. Bạn có thể thử từ khóa khác không? 🔍',
} as const;

/* =====================================================
 * ERROR MESSAGES
 * ===================================================== */

export const ERROR_MESSAGES = {
    MISSING_MESSAGE: 'Vui lòng nhập nội dung tin nhắn',
    MISSING_ENV_VARS: 'Missing required environment variables',
    EMBEDDING_FAILED: 'Failed to generate embedding',
    SEARCH_FAILED: 'Vector search failed',
    RESPONSE_FAILED: 'Failed to generate response',
    GENERIC:
        'Xin lỗi, đã có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại.',
} as const;

/* =====================================================
 * ENV VALIDATION
 * ===================================================== */

export function validateEnvironment() {
    const required = [
        'GEMINI_API_KEY',
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `${ERROR_MESSAGES.MISSING_ENV_VARS}: ${missing.join(', ')}`
        );
    }
}

/* =====================================================
 * FORMAT RAG CONTEXT (MATCH_DOCUMENTS)
 * ===================================================== */

/**
 * Format context directly from Supabase RPC `match_documents`
 * Expected shape:
 * {
 *   document_id,
 *   similarity,
 *   title,
 *   content
 * }
 */
export function formatRagContext(matches: any[]): string {
    if (!matches || matches.length === 0) {
        return SYSTEM_PROMPTS.NO_RESULTS;
    }

    return matches
        .map((m, index) => {
            const similarity = (m.similarity * 100).toFixed(1);

            return `
${index + 1}. ${m.title} (Độ phù hợp: ${similarity}%)
${m.content}
    `.trim();
        })
        .join('\n\n');
}

/* =====================================================
 * CHAT HISTORY MANAGEMENT
 * ===================================================== */

export function limitChatHistory(
    history: Array<{ role: string; content: string }>,
    maxLength: number = RAG_CONFIG.MAX_HISTORY_LENGTH
): Array<{ role: string; content: string }> {
    if (!history || history.length <= 2) {
        return history;
    }

    return history.slice(-maxLength);
}

/* =====================================================
 * EMBEDDING COST ESTIMATION
 * ===================================================== */

export function estimateEmbeddingCost(
    textCount: number
): {
    estimatedTime: string;
    estimatedCalls: number;
} {
    const batchSize = RAG_CONFIG.BATCH_SIZE;
    const delayMs = RAG_CONFIG.BATCH_DELAY_MS;

    const batches = Math.ceil(textCount / batchSize);
    const totalTimeMs = batches * delayMs + textCount * 500;

    return {
        estimatedTime: `${Math.ceil(totalTimeMs / 1000)} seconds`,
        estimatedCalls: textCount,
    };
}
