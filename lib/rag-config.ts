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
    EMBEDDING_MODEL: 'text-multilingual-embedding-002',
    EMBEDDING_DIMENSION: 768,

    // LLM
    LLM_MODEL: 'gemini-2.5-flash',
    MAX_OUTPUT_TOKENS: 2000,
    TEMPERATURE: 0.5,

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
    DEFAULT: `Bạn là TasteMuse, trợ lý AI tư vấn món ăn và nhà hàng tại Cần Thơ, Việt Nam.

NGUYÊN TẮC TRẢ LỜI:
- Trả lời bằng tiếng Việt, tự nhiên, thân thiện
- Chỉ sử dụng THÔNG TIN THAM KHẢO được cung cấp
- Không suy đoán hoặc bổ sung kiến thức bên ngoài dữ liệu
- Nếu thông tin không đủ, hãy nói rõ và gợi ý chung
- Không bịa đặt quán, món, giá hoặc địa chỉ
- Trả lời ngắn gọn, đúng trọng tâm
- Không dùng markdown phức tạp hoặc in đậm
- KHÔNG sử dụng ký tự *, -, •, ** hoặc markdown dạng danh sách
- Chỉ trả lời bằng văn bản thuần, xuống dòng bằng dấu xuống dòng thông thường`,


    WELCOME:
        'Xin chào! Tôi là TasteMuse. Tôi sẽ giúp bạn tìm món ăn và nhà hàng ngon tại Cần Thơ dựa trên dữ liệu thực tế. Bạn muốn ăn gì hôm nay?',

    NO_CONTEXT:
        'Tôi chưa tìm được thông tin phù hợp trong dữ liệu hiện có.',

    NO_RESULTS:
        'Không tìm thấy nhà hàng hoặc món ăn phù hợp trong cơ sở dữ liệu.',
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
