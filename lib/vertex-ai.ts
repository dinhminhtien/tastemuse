import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Vertex AI clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Vertex AI configuration
const PROJECT_ID = process.env.VERTEX_AI_PROJECT_ID || '';
const LOCATION = process.env.VERTEX_AI_LOCATION || 'us-central1';

/**
 * Generate embeddings for text using Vertex AI text-multilingual-embedding-002
 * Note: Using Gemini's embedding model as a fallback since direct Vertex AI requires service account
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        // For now, we'll use a simple approach with Gemini
        // In production, you should use the official Vertex AI embedding endpoint

        // Using text-embedding-004 model from Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

        const result = await model.embedContent(text);
        const embedding = result.embedding;

        return embedding.values;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw new Error('Failed to generate embedding');
    }
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];

    // Process in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const batchPromises = batch.map(text => generateEmbedding(text));
        const batchResults = await Promise.all(batchPromises);
        embeddings.push(...batchResults);

        // Add a small delay to avoid rate limiting
        if (i + batchSize < texts.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return embeddings;
}

/**
 * Generate a response using Vertex AI Gemini with context
 */
export async function generateRAGResponse(
    query: string,
    context: string,
    history: Array<{ role: string; content: string }> = []
): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                maxOutputTokens: 2000,
                temperature: 0.7,
            },
        });

        // Enhanced system prompt with context
        const systemPrompt = `Bạn là TasteMuse 🍜, trợ lý AI thân thiện giúp tìm món ăn ngon tại Cần Thơ.

PHONG CÁCH TRẢ LỜI:
- Trả lời ngắn gọn, tự nhiên như đang chat với bạn bè
- Tập trung CHÍNH XÁC vào điều người dùng hỏi (ví dụ: nếu hỏi "đặc sản Cần Thơ" thì CHỈ giới thiệu món ĐẶC SẢN của Cần Thơ, KHÔNG nói về món Thái, món Bắc hay món khác vùng)
- Chỉ đề xuất 2-3 món phù hợp nhất, đừng liệt kê quá nhiều
- Dùng emoji phù hợp để sinh động hơn
- Nói chuyện thân mật, dùng "mình", "bạn" thay vì "tôi"

CÁC QUY TẮC QUAN TRỌNG:
✅ CHỈ dựa vào THÔNG TIN THAM KHẢO bên dưới
✅ Nếu không tìm thấy thông tin phù hợp, hãy thừa nhận và gợi ý cách hỏi khác
✅ KHÔNG bịa đặt thông tin
✅ Trả lời TỐI ĐA 3-4 câu, trừ khi người dùng yêu cầu chi tiết
✅ Tránh format markdown phức tạp (**, ##, etc.)

THÔNG TIN THAM KHẢO:
${context}

Hãy trả lời câu hỏi dựa trên thông tin trên một cách tự nhiên và hữu ích nhất!`;

        // Limit history to last 6 messages
        const limitedHistory = history.length > 1
            ? history.slice(-6).slice(1)
            : [];

        const chatHistory = limitedHistory.map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'Chào bạn! Mình là TasteMuse 🍜. Mình có thể giúp bạn tìm món ăn ngon và nhà hàng uy tín tại Cần Thơ. Hỏi mình bất cứ điều gì nhé!' }],
                },
                ...chatHistory,
            ],
        });

        const result = await chat.sendMessage(query);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating RAG response:', error);
        throw new Error('Failed to generate response');
    }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
