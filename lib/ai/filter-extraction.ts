/**
 * Filter Extraction – Extract structured filters from natural language
 * Uses Gemini to parse user messages into actionable filters
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChatFilters } from '@/types/database';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Extract structured filters from a user's natural language message
 * Examples:
 *   "Tìm quán bún bò dưới 50k ở Ninh Kiều" →
 *   { cuisineType: "bún bò", budget: { max: 50000 }, ward: "Ninh Kiều" }
 *
 *   "Muốn ăn gì đó vui vẻ với bạn bè, ngon và gần đây" →
 *   { mood: "vui vẻ, bạn bè", maxDistance: 3 }
 */
export async function extractFilters(message: string): Promise<ChatFilters> {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.2,
                responseMimeType: "application/json",
            },
        });

        const prompt = `Phân tích tin nhắn người dùng và trích xuất các bộ lọc tìm kiếm món ăn.

Tin nhắn: "${message}"

Cấu trúc JSON yêu cầu:
{
  "mood": "string hoặc null - tâm trạng/dịp (vui vẻ, lãng mạn, gia đình, bạn bè, một mình)",
  "budget": { "min": number hoặc null, "max": number hoặc null } hoặc null - ngân sách VNĐ,
  "maxDistance": number hoặc null - khoảng cách tối đa tính bằng km,
  "cuisineType": "string hoặc null - loại món ăn (bún bò, phở, lẩu, hải sản, chay, etc.)",
  "tags": ["array of strings"] hoặc null - tags phù hợp,
  "isSignature": boolean hoặc null - chỉ tìm món đặc sản,
  "ward": "string hoặc null - quận/phường ở Cần Thơ (Ninh Kiều, Bình Thủy, Cái Răng, Ô Môn, Thốt Nốt, etc.)",
  "time": "string hoặc null - thời gian muốn ăn định dạng HH:mm (ví dụ: 12:00, 18:30)"
}

Chú ý:
- "dưới 100k" → budget.max = 100000
- "từ 100-200k" → budget.min = 100000, budget.max = 200000
- "gần đây" / "gần" → maxDistance = 3
- "đặc sản" / "nổi tiếng" → isSignature = true
- "ăn trưa" → time = "12:00"
- "ăn tối" → time = "19:00"
- "ăn sáng" → time = "08:00"    
- "mở cửa lúc 10h" → time = "10:00"
- Nếu không rõ, trả null cho field đó`;

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();

        // Robust JSON extraction: Find the first { and last }
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');

        if (start === -1 || end === -1) {
            throw new Error('No JSON object found in response');
        }

        const jsonStr = text.substring(start, end + 1);
        const filters: ChatFilters = JSON.parse(jsonStr);

        // Clean up null values
        const cleaned: ChatFilters = {};
        if (filters.mood) cleaned.mood = filters.mood;
        if (filters.budget && (filters.budget.min !== null || filters.budget.max !== null)) {
            cleaned.budget = {
                min: filters.budget.min ?? 0,
                max: filters.budget.max ?? undefined,
            };
        }
        if (filters.maxDistance) cleaned.maxDistance = filters.maxDistance;
        if (filters.cuisineType) cleaned.cuisineType = filters.cuisineType;
        if (filters.tags && filters.tags.length > 0) cleaned.tags = filters.tags;
        if (filters.isSignature === true) cleaned.isSignature = true;
        if (filters.ward) cleaned.ward = filters.ward;
        if (filters.time) cleaned.time = filters.time;

        console.log('🔍 Extracted filters:', JSON.stringify(cleaned));
        return cleaned;

    } catch (error) {
        console.error('⚠️ Filter extraction failed:', error);
        // Return empty filters on failure — chatbot still works without filters
        return {};
    }
}

/**
 * Check if a message is a general greeting/chitchat vs a food search query
 */
export function isSearchQuery(message: string): boolean {
    const greetings = [
        /^(hi|hello|xin chào|chào|hey|yo)\s*[!.?]?$/i,
        /^(cảm ơn|thank|thanks|ok)\s*[!.?]?$/i,
        /^(tạm biệt|bye|goodbye)\s*[!.?]?$/i,
    ];

    return !greetings.some(regex => regex.test(message.trim()));
}
