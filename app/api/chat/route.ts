import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Sử dụng model gemini-1.5-flash - nhanh hơn và rẻ hơn
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        maxOutputTokens: 2000, // Giới hạn độ dài response để tăng tốc độ
        temperature: 0.7, // Giữ mức sáng tạo vừa phải
      },
    });

    // System prompt ngắn gọn hơn để giảm thời gian xử lý
    const systemPrompt = `Bạn là TasteMuse, trợ lý AI tư vấn món ăn và nhà hàng tại Cần Thơ, Việt Nam. 
Trả lời ngắn gọn, thân thiện bằng tiếng Việt, không in đậm`;

    // Giới hạn history chỉ gửi 6 message gần nhất để giảm payload
    const limitedHistory = history.length > 1 
      ? history.slice(-6).slice(1) // Lấy 6 message cuối, bỏ welcome message đầu
      : [];
    
    const chatHistory = limitedHistory.map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Tạo cuộc trò chuyện với lịch sử và system prompt
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "Xin chào! Tôi là TasteMuse, trợ lý AI của bạn. Tôi có thể giúp gì cho bạn về món ăn và nhà hàng tại Cần Thơ?" }],
        },
        ...chatHistory,
      ],
    });

    // Gửi message mới
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ message: text });
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get response from AI" },
      { status: 500 }
    );
  }
}
