import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPTS } from '@/lib/ai/rag-config';

// Initialize Vertex AI clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
                maxOutputTokens: 3072,
                temperature: 0.7,
            },
        });

        const systemPrompt = `${SYSTEM_PROMPTS.DEFAULT}

[Thông tin tham khảo]
${context}

Hãy trả lời câu hỏi dựa trên thông tin trên một cách tự nhiên nhất!`;

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
