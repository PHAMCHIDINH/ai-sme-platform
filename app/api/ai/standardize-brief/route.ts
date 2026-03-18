import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      // Mock mode for local testing if no key is provided
      return NextResponse.json({ 
        brief: "💡 [MOCK AI] Đề xuất từ AI:\n- Mục tiêu: ...\n- Nền tảng: ...\n- Đầu ra: ...\n(Vui lòng cung cấp OPENAI_API_KEY trong file .env để AI hoạt động thật)." 
      });
    }

    const { description } = await req.json();

    if (!description) {
      return NextResponse.json({ error: "Missing description" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Bạn là một chuyên gia quản lý dự án công nghệ, có nhiệm vụ giúp các Doanh nghiệp Vừa và Nhỏ (SME) chuẩn hóa mô tả bài toán thành một tài liệu yêu cầu (brief) rõ ràng, dễ hiểu đối với sinh viên IT.
Hãy trả lời tóm tắt, rõ ràng, chia làm các gạch đầu dòng báo gồm: Mục tiêu chính, Yêu cầu hệ thống/nền tảng, và Đầu ra mong muốn.`
        },
        {
          role: "user",
          content: `Đây là mô tả thô của bài toán:\n"${description}"\n\nHãy chuẩn hóa nó giúp tôi.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const brief = response.choices[0]?.message?.content;

    return NextResponse.json({ brief });
  } catch (error) {
    console.error("AI Standardize Error:", error);
    return NextResponse.json({ error: "Failed to standardize brief" }, { status: 500 });
  }
}