import { NextResponse } from "next/server";
import { openaiInstance, chatModelStr } from "@/lib/openai";
import { auth } from "@/auth";

type ChatMessageInput = {
  role: string;
  content: string;
};

type ParsedData = {
  title: string;
  description: string;
  standardizedBrief: string;
  expectedOutput: string;
  requiredSkills: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  duration: string;
  budget: string;
};

type ChatBriefResponse = {
  message: string;
  suggestions: string[];
  parsedData: ParsedData;
};

const EMPTY_PARSED_DATA: ParsedData = {
  title: "",
  description: "",
  standardizedBrief: "",
  expectedOutput: "",
  requiredSkills: "",
  difficulty: "MEDIUM",
  duration: "",
  budget: "",
};

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

function stripAccents(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeDifficulty(rawValue: string): ParsedData["difficulty"] {
  const upper = rawValue.trim().toUpperCase();
  const noAccent = stripAccents(upper);

  if (upper.includes("EASY") || noAccent.includes("DE")) return "EASY";
  if (upper.includes("HARD") || noAccent.includes("KHO")) return "HARD";
  if (upper.includes("MEDIUM") || noAccent.includes("VUA") || noAccent.includes("TRUNG")) return "MEDIUM";
  return "MEDIUM";
}

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

function getUserMessages(messages: ChatMessageInput[]): string[] {
  return messages
    .filter((message) => message.role === "user")
    .map((message) => message.content.trim())
    .filter(Boolean);
}

function inferTitleFromMessages(userMessages: string[]): string {
  const joined = userMessages.join(" ").toLowerCase();

  if (joined.includes("quản lý nhân sự") && joined.includes("công việc")) {
    return "App quản lý nhân sự và công việc";
  }

  if (joined.includes("quản lý nội bộ")) {
    return "App quản lý nội bộ";
  }

  if (joined.includes("app")) {
    return "App quản lý cho doanh nghiệp";
  }

  if (joined.includes("web") || joined.includes("website")) {
    return "Website cho doanh nghiệp";
  }

  const seed = userMessages[0] ?? "";
  const cleaned = seed.replace(/^làm\s+/i, "").trim();
  if (!cleaned) return "";
  const shortTitle = cleaned.split(/\s+/).slice(0, 10).join(" ");
  return shortTitle.charAt(0).toUpperCase() + shortTitle.slice(1);
}

function buildFallbackParsedData(messages: ChatMessageInput[]): ParsedData {
  const userMessages = getUserMessages(messages);
  const title = inferTitleFromMessages(userMessages);
  const description = userMessages.length
    ? `Nhu cầu SME: ${userMessages.join(". ")}`
    : "";

  const standardizedBrief = description
    ? [
        `Mục tiêu: ${title || "Xây dựng giải pháp số phù hợp nhu cầu SME."}`,
        "Nền tảng sử dụng: Web/App (xác nhận thêm theo nguồn lực triển khai).",
        "Đầu ra cần bàn giao: Source code, tài liệu hướng dẫn, hướng dẫn vận hành.",
        "Yêu cầu kỹ năng: Phân tích yêu cầu, lập trình, kiểm thử và phối hợp nhóm.",
      ].join("\n")
    : "";

  return {
    ...EMPTY_PARSED_DATA,
    title,
    description,
    standardizedBrief,
  };
}

function buildFallbackMessage(parsedData: ParsedData): string {
  if (!parsedData.requiredSkills) {
    return "Bạn cần sinh viên có kỹ năng/công nghệ gì chính cho dự án này?";
  }

  if (!parsedData.expectedOutput) {
    return "Bạn muốn kết quả bàn giao cụ thể gồm những gì?";
  }

  if (!parsedData.duration) {
    return "Bạn dự kiến thời gian triển khai khoảng bao lâu?";
  }

  if (!parsedData.budget) {
    return "Ngân sách hoặc quyền lợi cho sinh viên là bao nhiêu?";
  }

  return "Mình đã điền đủ thông tin form bên cạnh, bạn hãy kiểm tra lại và bấm Đăng Dự Án nhé!";
}

function buildFallbackSuggestions(parsedData: ParsedData): string[] {
  if (!parsedData.requiredSkills) {
    return ["Dựa vào yêu cầu để đề xuất", "Chưa rõ, cần tư vấn"];
  }

  if (!parsedData.expectedOutput) {
    return ["Sản phẩm hoàn chỉnh", "Bản nháp / Demo", "Document/Source code"];
  }

  if (!parsedData.duration) {
    return ["2 tuần", "1 tháng", "2 tháng"];
  }

  if (!parsedData.budget) {
    return ["2.000.000 VNĐ", "5.000.000 VNĐ", "Thỏa thuận"];
  }

  return [];
}

function normalizeSuggestions(rawValue: unknown, parsedData: ParsedData): string[] {
  let suggestions: string[] = [];

  if (Array.isArray(rawValue)) {
    suggestions = rawValue.map((item) => valueToString(item)).filter(Boolean);
  } else if (typeof rawValue === "string") {
    suggestions = rawValue
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (suggestions.length === 0) {
    suggestions = buildFallbackSuggestions(parsedData);
  }

  return suggestions.slice(0, 5);
}

function normalizeParsedData(rawObject: Record<string, unknown>, messages: ChatMessageInput[]): ParsedData {
  const parsedDataObject = asObject(rawObject.parsedData);
  const fallback = buildFallbackParsedData(messages);

  const normalized = { ...EMPTY_PARSED_DATA };

  (Object.keys(EMPTY_PARSED_DATA) as Array<keyof ParsedData>).forEach((field) => {
    if (field === "difficulty") return;

    const rawValue =
      getByAliases(parsedDataObject, FIELD_ALIASES[field]) ??
      getByAliases(rawObject, FIELD_ALIASES[field]);

    normalized[field] = valueToString(rawValue) || fallback[field];
  });

  const rawDifficulty =
    valueToString(getByAliases(parsedDataObject, FIELD_ALIASES.difficulty)) ||
    valueToString(getByAliases(rawObject, FIELD_ALIASES.difficulty));

  normalized.difficulty = rawDifficulty ? normalizeDifficulty(rawDifficulty) : fallback.difficulty;

  return normalized;
}

function safeParseJSON(text: string): unknown {
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

function normalizeResponse(rawPayload: unknown, messages: ChatMessageInput[]): ChatBriefResponse {
  const rawObject = asObject(rawPayload);
  const parsedData = normalizeParsedData(rawObject, messages);
  const message =
    valueToString(getByAliases(rawObject, ["message", "assistantMessage", "reply", "question"])) ||
    buildFallbackMessage(parsedData);
  const suggestions = normalizeSuggestions(
    getByAliases(rawObject, ["suggestions", "quickReplies", "options"]),
    parsedData
  );

  return { message, suggestions, parsedData };
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const rawMessages = body?.messages;

    if (!Array.isArray(rawMessages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const messages: ChatMessageInput[] = rawMessages
      .filter(
        (message: unknown) =>
          typeof message === "object" &&
          message !== null &&
          "role" in message &&
          "content" in message &&
          typeof (message as ChatMessageInput).role === "string" &&
          typeof (message as ChatMessageInput).content === "string"
      )
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    if (!openaiInstance) {
      const offlineParsedData = buildFallbackParsedData(messages);
      return NextResponse.json({
        message:
          "Hệ thống AI hiện đang offline nên chưa thể tư vấn sâu. Mình đã điền sẵn thông tin cơ bản từ cuộc trò chuyện để bạn chỉnh nhanh.",
        suggestions: buildFallbackSuggestions(offlineParsedData),
        parsedData: offlineParsedData,
      });
    }

    const systemPrompt = `Bạn là trợ lý AI tên VnSMEMatch giúp Doanh nghiệp SME tạo dự án cho sinh viên IT.
Mục tiêu của bạn là khai thác thông tin từ người dùng để điền vào một form đăng dự án.
Bạn BẮT BUỘC trả về dữ liệu thuần định dạng JSON (Tuyệt đối không bọc bằng markdown, không dùng \`\`\`json).
Ví dụ Format JSON:
{
  "message": "Câu nói của bạn để hỏi thêm hoặc tư vấn (Ngắn gọn, thân thiện, hỏi 1 câu 1 lúc)",
  "suggestions": ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3"] (BẮT BUỘC sinh ra 3-4 gợi ý CÂU TRẢ LỜI ngắn gọn cho người dùng dựa theo ngữ cảnh hiện tại),
  "parsedData": {
    "title": "Tên dự án ngắn gọn (Nếu đã trích xuất được, ngược lại để chuỗi rỗng \"\")",
    "description": "Mô tả thực tế thô tổng hợp lại (Vd: Cần xây dựng phần mềm abc dể làm xyz... ngược lại \"\")",
    "standardizedBrief": "Mô tả chuyên nghiệp chia dòng: Mục Tiêu/ Nền tảng/ Đầu ra/ Yêu cầu kỹ năng (nếu đã đủ ý để viết, ngược lại \"\")",
    "expectedOutput": "Kết quả bàn giao (VD: Website, Source code...) (nếu trích xuất được, ngược lại \"\")",
    "requiredSkills": "Kỹ năng cần có (VD: React, NodeJs...) (nếu trích xuất được, ngược lại \"\")",
    "difficulty": "EASY hoặc MEDIUM hoặc HARD (Luôn điền 1 trong 3)",
    "duration": "Thời gian (VD: 3 tuần) (nếu trích xuất được, ngược lại \"\")",
    "budget": "Ngân sách báo gồm đơn vị (VD: 2.000.000 VNĐ) (nếu trích xuất được, ngược lại \"\")"
  }
}

Luôn luôn đặt câu hỏi ngắn gọn thực tế. Liên tục trích xuất những thông tin ĐÃ BIẾT vào parsedData ngay lập tức ở MỖI LẦN TRẢ LỜI, những gì chưa biết thì để trống chuỗi "". Lời chào đầu tiên chưa có thông tin thì để rỗng hết. Khai thác từng bước:
1. Ý tưởng cốt lõi (Làm web/app gì, mục đích gì)
2. Công nghệ, Yêu cầu kỹ năng
3. Ngân sách và Thời gian.
Nếu dữ liệu đã đầy đủ, hãy tạo message thông báo "Mình đã điền đủ thông tin form bên cạnh, bạn hãy kiểm tra lại và bấm Đăng Dự Án nhé!" và suggestions rỗng.`;

    const response = await openaiInstance.chat.completions.create({
      model: chatModelStr,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((message) => ({ role: message.role, content: message.content } as any)),
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiText = response.choices[0]?.message?.content || "{}";
    const parsedResp = safeParseJSON(aiText);
    const normalizedResp = normalizeResponse(parsedResp, messages);

    return NextResponse.json(normalizedResp);
  } catch (error) {
    console.error("[CHAT_BRIEF_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
