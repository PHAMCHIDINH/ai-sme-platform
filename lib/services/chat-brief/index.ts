import { parseChatMessages } from "@/lib/services/chat-brief/message-parser";
import { CHAT_BRIEF_SYSTEM_PROMPT } from "@/lib/services/chat-brief/prompt-builder";
import { buildFallbackParsedData } from "@/lib/services/chat-brief/profile-inference";
import { buildAssistantReply, normalizeResponse, safeParseJSON } from "@/lib/services/chat-brief/response-normalizer";
import type { ChatBriefResponse, ChatMessageInput } from "@/lib/services/chat-brief/types";

export function parseIncomingMessages(rawMessages: unknown): ChatMessageInput[] | null {
  return parseChatMessages(rawMessages);
}

export function toAIChatMessages(messages: ChatMessageInput[]) {
  return messages.map((message): { role: "assistant" | "user"; content: string } => ({
    role: message.role === "assistant" ? "assistant" : "user",
    content: message.content,
  }));
}

export function buildOfflineResponse(messages: ChatMessageInput[]): ChatBriefResponse {
  const parsedData = buildFallbackParsedData(messages);
  const reply = buildAssistantReply(parsedData, messages);

  return {
    message: reply.message,
    suggestions: reply.suggestions,
    parsedData,
  };
}

export function normalizeAIResponseContent(aiText: string, messages: ChatMessageInput[]): ChatBriefResponse {
  const parsedPayload = safeParseJSON(aiText);
  return normalizeResponse(parsedPayload, messages);
}

export { CHAT_BRIEF_SYSTEM_PROMPT };
export type { ChatBriefResponse, ChatMessageInput };
