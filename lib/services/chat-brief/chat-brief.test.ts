import { describe, expect, it } from "vitest";

import { CHAT_BRIEF_SYSTEM_PROMPT } from "@/lib/services/chat-brief/prompt-builder";
import { inferProjectProfile } from "@/lib/services/chat-brief/profile-inference";
import {
  EMPTY_PARSED_DATA,
  getNextField,
  normalizeResponse,
  type ChatMessageInput,
} from "@/lib/services/chat-brief/response-normalizer";

describe("chat-brief modules", () => {
  it("infers ecommerce profile from selling website intent", () => {
    const profile = inferProjectProfile(["Cần làm website bán hàng cho SME"]);
    expect(profile.category).toBe("ecommerce");
    expect(profile.defaultOutput).toContain("Website");
  });

  it("returns requiredSkills as next field when missing", () => {
    expect(getNextField(EMPTY_PARSED_DATA)).toBe("requiredSkills");
  });

  it("normalizes unknown payload into fallback parsed data", () => {
    const messages: ChatMessageInput[] = [
      { role: "user", content: "Mình cần website bán hàng cho shop nhỏ" },
    ];

    const response = normalizeResponse({}, messages);

    expect(response.parsedData.title.length).toBeGreaterThan(0);
    expect(Array.isArray(response.suggestions)).toBe(true);
    expect(response.message.length).toBeGreaterThan(0);
  });

  it("keeps system prompt constraints", () => {
    expect(CHAT_BRIEF_SYSTEM_PROMPT).toContain("JSON object");
    expect(CHAT_BRIEF_SYSTEM_PROMPT).toContain("parsedData");
  });
});
