import { getLastUserMessage, getUserMessages } from "@/lib/services/chat-brief/message-parser";
import {
  buildFallbackParsedData,
  inferProjectProfile,
  isAdviceRequest,
  normalizeDifficulty,
  rebuildStandardizedBrief,
} from "@/lib/services/chat-brief/profile-inference";
import { EMPTY_PARSED_DATA, type ChatBriefResponse, type ChatMessageInput, type NextField, type ParsedData, type ProjectProfile } from "@/lib/services/chat-brief/types";

const FIELD_ALIASES: Record<keyof ParsedData, string[]> = {
  title: ["title", "projectTitle", "name", "tenDuAn", "ten_du_an"],
  description: ["description", "rawBrief", "problem", "moTa", "mota", "nhatKyTho"],
  standardizedBrief: ["standardizedBrief", "standardized_brief", "brief", "moTaChuanHoa", "mo_ta_chuan_hoa"],
  expectedOutput: ["expectedOutput", "deliverables", "output", "ketQuaBanGiao", "ket_qua_ban_giao"],
  requiredSkills: ["requiredSkills", "required_skills", "skills", "kyNangCanCo", "ky_nang_can_co"],
  difficulty: ["difficulty", "level", "mucDoKho", "muc_do_kho"],
  duration: ["duration", "timeline", "thoiGianTrienKhai", "thoi_gian_trien_khai", "time"],
  budget: ["budget", "budgetRange", "nganSach", "ngan_sach"],
};

function valueToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    return value
      .map((item) => valueToString(item))
      .filter(Boolean)
      .join(", ")
      .trim();
  }

  if (typeof value === "object") {
    const nestedValues = Object.values(value as Record<string, unknown>)
      .map((item) => valueToString(item))
      .filter(Boolean);
    return nestedValues.join("\n").trim();
  }

  return "";
}

function asObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function getByAliases(source: Record<string, unknown>, aliases: string[]): unknown {
  const table = new Map<string, unknown>();
  Object.entries(source).forEach(([key, value]) => {
    table.set(key.toLowerCase(), value);
  });

  for (const alias of aliases) {
    const hit = table.get(alias.toLowerCase());
    if (hit !== undefined) return hit;
  }

  return undefined;
}

function sanitizeExtractedValue(field: keyof ParsedData, value: unknown) {
  const text = valueToString(value);
  if (!text) return "";
  if (field !== "description" && field !== "standardizedBrief" && isAdviceRequest(text)) {
    return "";
  }
  return text;
}

function normalizeParsedData(rawObject: Record<string, unknown>, messages: ChatMessageInput[]): ParsedData {
  const parsedDataObject = asObject(rawObject.parsedData);
  const fallback = buildFallbackParsedData(messages);

  const normalized: ParsedData = { ...EMPTY_PARSED_DATA };

  (Object.keys(EMPTY_PARSED_DATA) as Array<keyof ParsedData>).forEach((field) => {
    if (field === "difficulty" || field === "description" || field === "standardizedBrief") return;

    const rawValue =
      getByAliases(parsedDataObject, FIELD_ALIASES[field]) ??
      getByAliases(rawObject, FIELD_ALIASES[field]);

    normalized[field] = sanitizeExtractedValue(field, rawValue) || fallback[field];
  });

  normalized.description = fallback.description;

  const rawDifficulty =
    sanitizeExtractedValue("difficulty", getByAliases(parsedDataObject, FIELD_ALIASES.difficulty)) ||
    sanitizeExtractedValue("difficulty", getByAliases(rawObject, FIELD_ALIASES.difficulty));

  normalized.difficulty = rawDifficulty ? normalizeDifficulty(rawDifficulty) : fallback.difficulty;
  normalized.standardizedBrief = rebuildStandardizedBrief(normalized, messages);

  return normalized;
}

export function safeParseJSON(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const sliced = text.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(sliced);
      } catch {
        return {};
      }
    }
    return {};
  }
}

export function getNextField(parsedData: ParsedData): NextField {
  if (!parsedData.requiredSkills) return "requiredSkills";
  if (!parsedData.expectedOutput) return "expectedOutput";
  if (!parsedData.duration) return "duration";
  return "completed";
}

function buildSuggestions(nextField: NextField, profile: ProjectProfile) {
  if (nextField === "requiredSkills") return profile.skillSuggestions;
  if (nextField === "expectedOutput") return profile.outputSuggestions;
  if (nextField === "duration") return profile.durationSuggestions;
  return [];
}

export function buildAssistantReply(
  parsedData: ParsedData,
  messages: ChatMessageInput[],
): Pick<ChatBriefResponse, "message" | "suggestions"> {
  const userMessages = getUserMessages(messages);
  const profile = inferProjectProfile(userMessages, parsedData.title, parsedData.description);
  const nextField = getNextField(parsedData);
  const lastUserMessage = getLastUserMessage(messages);
  const needsAdvice = isAdviceRequest(lastUserMessage);

  if (nextField === "completed") {
    if (!parsedData.budget) {
      return {
        message:
          "Mình đã điền đủ các trường chính để đăng dự án. Nếu có ngân sách hoặc quyền lợi thì bạn bổ sung thêm ở form bên phải, còn không có thể bấm Đăng Dự Án luôn.",
        suggestions: [],
      };
    }

    return {
      message: "Mình đã điền đủ thông tin form bên cạnh, bạn hãy kiểm tra lại và bấm Đăng Dự Án nhé!",
      suggestions: [],
    };
  }

  if (needsAdvice) {
    if (nextField === "requiredSkills") {
      return {
        message: `Với ${profile.label}, mình gợi ý vài hướng triển khai phổ biến bên dưới. Bạn chọn 1 hướng gần nhất để mình chốt tiếp form nhé.`,
        suggestions: buildSuggestions(nextField, profile),
      };
    }

    if (nextField === "expectedOutput") {
      return {
        message: `Mình gợi ý vài kiểu bàn giao thường gặp cho ${profile.label}. Bạn chọn phương án gần nhất nhé.`,
        suggestions: buildSuggestions(nextField, profile),
      };
    }

    return {
      message: "Nếu chưa chốt thời gian, bạn có thể chọn một mốc gần đúng bên dưới để mình ước lượng độ khó phù hợp.",
      suggestions: buildSuggestions(nextField, profile),
    };
  }

  if (nextField === "requiredSkills") {
    return {
      message: `Để tuyển đúng sinh viên cho ${profile.label}, bạn muốn ưu tiên nhóm kỹ năng hoặc công nghệ nào là chính?`,
      suggestions: buildSuggestions(nextField, profile),
    };
  }

  if (nextField === "expectedOutput") {
    return {
      message: "Bạn muốn sinh viên bàn giao cụ thể những gì khi hoàn thành dự án?",
      suggestions: buildSuggestions(nextField, profile),
    };
  }

  return {
    message: "Bạn dự kiến thời gian triển khai khoảng bao lâu để mình chốt mức độ phù hợp?",
    suggestions: buildSuggestions(nextField, profile),
  };
}

export function normalizeResponse(rawPayload: unknown, messages: ChatMessageInput[]): ChatBriefResponse {
  const rawObject = asObject(rawPayload);
  const parsedData = normalizeParsedData(rawObject, messages);
  const reply = buildAssistantReply(parsedData, messages);

  return {
    message: reply.message,
    suggestions: reply.suggestions.slice(0, 4),
    parsedData,
  };
}

export { EMPTY_PARSED_DATA };
export type { ChatMessageInput };
