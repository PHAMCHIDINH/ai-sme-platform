import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { chatModelStr, openaiInstance } from "@/lib/openai";
import {
  CHAT_BRIEF_SYSTEM_PROMPT,
  buildOfflineResponse,
  normalizeAIResponseContent,
  parseIncomingMessages,
  toAIChatMessages,
} from "@/lib/services/chat-brief";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
    }

    const body = await req.json();
    const messages = parseIncomingMessages(body?.messages);

    if (!messages) {
      return NextResponse.json({ error: "Định dạng hội thoại không hợp lệ." }, { status: 400 });
    }

    if (!openaiInstance) {
      return NextResponse.json(buildOfflineResponse(messages));
    }

    const response = await openaiInstance.chat.completions.create({
      model: chatModelStr,
      messages: [{ role: "system", content: CHAT_BRIEF_SYSTEM_PROMPT }, ...toAIChatMessages(messages)],
      response_format: { type: "json_object" },
      temperature: 0.25,
      max_tokens: 800,
    });

    const aiText = response.choices[0]?.message?.content || "{}";
    return NextResponse.json(normalizeAIResponseContent(aiText, messages));
  } catch (error) {
    console.error("[CHAT_BRIEF_ERROR]", error);
    return NextResponse.json({ error: "Không thể xử lý hội thoại lúc này." }, { status: 500 });
  }
}
