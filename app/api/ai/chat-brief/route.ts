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

type NextField = "requiredSkills" | "expectedOutput" | "duration" | "completed";

type ProjectCategory =
  | "ecommerce"
  | "website"
  | "internal-tool"
  | "mobile-app"
  | "marketing"
  | "data"
  | "automation"
  | "generic";

type ProjectProfile = {
  category: ProjectCategory;
  label: string;
  defaultTitle: string;
  defaultGoal: string;
  platformHint: string;
  defaultOutput: string;
  skillSuggestions: string[];
  outputSuggestions: string[];
  durationSuggestions: string[];
  budgetSuggestions: string[];
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

const UNKNOWN_PATTERNS = [
  "chua ro",
  "can tu van",
  "khong ro",
  "khong biet",
  "goi y giup",
  "tu van giup",
  "de xuat giup",
  "dua vao yeu cau de de xuat",
];

const TECH_KEYWORDS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bwordpress\b/i, label: "WordPress" },
  { pattern: /\bwoo ?commerce\b/i, label: "WooCommerce" },
  { pattern: /\bshopify\b/i, label: "Shopify" },
  { pattern: /\bnext\.?js\b/i, label: "Next.js" },
  { pattern: /(^|\W)react(\W|$)/i, label: "React" },
  { pattern: /\bvue(\.js)?\b/i, label: "Vue.js" },
  { pattern: /\bnuxt\b/i, label: "Nuxt.js" },
  { pattern: /\bnode(\.js)?\b/i, label: "Node.js" },
  { pattern: /\bnest(\.js)?\b/i, label: "NestJS" },
  { pattern: /\bexpress\b/i, label: "Express.js" },
  { pattern: /\bphp\b/i, label: "PHP" },
  { pattern: /\blaravel\b/i, label: "Laravel" },
  { pattern: /\bpython\b/i, label: "Python" },
  { pattern: /\bdjango\b/i, label: "Django" },
  { pattern: /\bflask\b/i, label: "Flask" },
  { pattern: /\bflutter\b/i, label: "Flutter" },
  { pattern: /react native/i, label: "React Native" },
  { pattern: /\bkotlin\b/i, label: "Kotlin" },
  { pattern: /\bswift\b/i, label: "Swift" },
  { pattern: /\bfigma\b/i, label: "Figma" },
  { pattern: /ui ?\/ ?ux|ux ?ui/i, label: "UI/UX" },
  { pattern: /business analysis|phan tich yeu cau|\bba\b/i, label: "Business Analysis" },
  { pattern: /\bqa\b|kiem thu|testing/i, label: "QA/Testing" },
  { pattern: /\bsql\b/i, label: "SQL" },
  { pattern: /\bpower ?bi\b/i, label: "Power BI" },
  { pattern: /\bexcel\b/i, label: "Excel" },
  { pattern: /\bseo\b/i, label: "SEO" },
  { pattern: /content/i, label: "Content Marketing" },
  { pattern: /facebook ads/i, label: "Facebook Ads" },
  { pattern: /google ads/i, label: "Google Ads" },
  { pattern: /chatbot/i, label: "Chatbot" },
  { pattern: /\bn8n\b/i, label: "n8n" },
  { pattern: /automation|tu dong hoa/i, label: "Automation" },
];

const OUTPUT_KEYWORDS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /website ban hang|web ban hang/i, label: "Website bán hàng" },
  { pattern: /\blanding page\b/i, label: "Landing page" },
  { pattern: /\bwebsite\b|\bweb\b/i, label: "Website" },
  { pattern: /mobile app|ung dung di dong/i, label: "Ứng dụng di động" },
  { pattern: /web app|phan mem quan ly|ung dung quan ly/i, label: "Web app quản lý" },
  { pattern: /dashboard/i, label: "Dashboard" },
  { pattern: /bao cao/i, label: "Báo cáo" },
  { pattern: /chatbot/i, label: "Chatbot" },
  { pattern: /source code/i, label: "Source code" },
  { pattern: /tai lieu|document/i, label: "Tài liệu hướng dẫn" },
  { pattern: /\bdemo\b|prototype/i, label: "Demo/Prototype" },
  { pattern: /content plan|ke hoach noi dung/i, label: "Kế hoạch nội dung" },
];

function stripAccents(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeText(value: string) {
  return stripAccents(value).toLowerCase().replace(/\s+/g, " ").trim();
}

function dedupeStrings(values: string[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = normalizeText(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeDifficulty(rawValue: string): ParsedData["difficulty"] {
  const normalized = normalizeText(rawValue);

  if (/\b(easy|de|don gian)\b/.test(normalized)) return "EASY";
  if (/\b(hard|kho|phuc tap)\b/.test(normalized)) return "HARD";
  if (/\b(medium|vua|trung binh)\b/.test(normalized)) return "MEDIUM";
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

function getLastUserMessage(messages: ChatMessageInput[]) {
  return [...messages].reverse().find((message) => message.role === "user")?.content.trim() ?? "";
}

function isAdviceRequest(value: string) {
  const normalized = normalizeText(value);
  if (!normalized) return false;
  return UNKNOWN_PATTERNS.some((pattern) => normalized.includes(pattern));
}

function inferProjectProfile(userMessages: string[], title = "", description = ""): ProjectProfile {
  const text = normalizeText([title, description, ...userMessages].filter(Boolean).join(" "));

  if (/(ban hang|thuong mai dien tu|ecommerce|gio hang|don hang|san pham)/.test(text)) {
    return {
      category: "ecommerce",
      label: "website bán hàng",
      defaultTitle: "Website bán hàng cho doanh nghiệp",
      defaultGoal: "Xây dựng website bán hàng giúp doanh nghiệp giới thiệu sản phẩm và tiếp nhận đơn online.",
      platformHint: "Ưu tiên nền tảng web responsive; có thể chọn giải pháp no-code hoặc custom tùy ngân sách.",
      defaultOutput: "Website bán hàng",
      skillSuggestions: ["WordPress + WooCommerce", "Next.js + Node.js", "Shopify / no-code"],
      outputSuggestions: ["Website bán hàng hoàn chỉnh", "Landing page + form liên hệ", "Website + trang quản trị đơn hàng"],
      durationSuggestions: ["2-3 tuần", "4-6 tuần", "6-8 tuần"],
      budgetSuggestions: ["3-5 triệu VNĐ", "5-10 triệu VNĐ", "Thỏa thuận theo phạm vi"],
    };
  }

  if (/(quan ly|noi bo|nhan su|kho|cong viec|crm|erp)/.test(text)) {
    return {
      category: "internal-tool",
      label: "ứng dụng quản lý nội bộ",
      defaultTitle: "Ứng dụng quản lý nội bộ",
      defaultGoal: "Số hoá quy trình nội bộ để theo dõi dữ liệu, thao tác và báo cáo nhanh hơn.",
      platformHint: "Ưu tiên web app nội bộ; có thể cân nhắc mobile nếu nhân sự dùng điện thoại thường xuyên.",
      defaultOutput: "Web app quản lý nội bộ",
      skillSuggestions: ["Business Analysis + UI/UX", "React/Next.js + Node.js", "PHP/Laravel + MySQL"],
      outputSuggestions: ["Web app quản lý hoàn chỉnh", "Dashboard + phân quyền cơ bản", "Demo + source code"],
      durationSuggestions: ["3-4 tuần", "4-6 tuần", "6-8 tuần"],
      budgetSuggestions: ["5-8 triệu VNĐ", "8-15 triệu VNĐ", "Thỏa thuận theo module"],
    };
  }

  if (/(mobile app|ung dung di dong|android|ios|flutter|react native)/.test(text)) {
    return {
      category: "mobile-app",
      label: "ứng dụng di động",
      defaultTitle: "Ứng dụng di động cho doanh nghiệp",
      defaultGoal: "Xây dựng ứng dụng di động hỗ trợ thao tác và theo dõi dữ liệu mọi lúc.",
      platformHint: "Ưu tiên mobile app; có thể kèm thêm trang quản trị web nếu cần quản lý dữ liệu.",
      defaultOutput: "Ứng dụng di động",
      skillSuggestions: ["Flutter", "React Native", "UI/UX + API integration"],
      outputSuggestions: ["Ứng dụng di động hoàn chỉnh", "Demo app + source code", "App + trang quản trị cơ bản"],
      durationSuggestions: ["4-6 tuần", "6-8 tuần", "8-10 tuần"],
      budgetSuggestions: ["8-12 triệu VNĐ", "12-20 triệu VNĐ", "Thỏa thuận theo tính năng"],
    };
  }

  if (/(chatbot|ai|tu dong hoa|automation|n8n)/.test(text)) {
    return {
      category: "automation",
      label: "chatbot hoặc luồng tự động",
      defaultTitle: "Chatbot / luồng tự động cho doanh nghiệp",
      defaultGoal: "Tự động hoá thao tác lặp lại và hỗ trợ tư vấn cơ bản cho doanh nghiệp.",
      platformHint: "Có thể triển khai trên web, fanpage hoặc qua workflow automation tùy kênh sử dụng.",
      defaultOutput: "Chatbot hoặc workflow tự động",
      skillSuggestions: ["Chatbot design", "n8n / Automation", "Node.js + API integration"],
      outputSuggestions: ["Chatbot hoạt động được", "Workflow tự động + tài liệu", "Demo + source code / cấu hình"],
      durationSuggestions: ["2-3 tuần", "3-5 tuần", "5-7 tuần"],
      budgetSuggestions: ["3-6 triệu VNĐ", "6-10 triệu VNĐ", "Thỏa thuận theo số luồng"],
    };
  }

  if (/(du lieu|bao cao|dashboard|phan tich|power bi|excel)/.test(text)) {
    return {
      category: "data",
      label: "dashboard hoặc bài toán dữ liệu",
      defaultTitle: "Dashboard / phân tích dữ liệu cho doanh nghiệp",
      defaultGoal: "Tổng hợp dữ liệu và trực quan hoá để doanh nghiệp ra quyết định nhanh hơn.",
      platformHint: "Có thể dùng dashboard web hoặc công cụ BI tùy nguồn dữ liệu hiện có.",
      defaultOutput: "Dashboard / báo cáo dữ liệu",
      skillSuggestions: ["SQL + Excel", "Power BI", "Python phân tích dữ liệu"],
      outputSuggestions: ["Dashboard quản trị", "Báo cáo phân tích", "Dashboard + tài liệu hướng dẫn"],
      durationSuggestions: ["2-3 tuần", "3-4 tuần", "4-6 tuần"],
      budgetSuggestions: ["2-4 triệu VNĐ", "4-8 triệu VNĐ", "Thỏa thuận theo số báo cáo"],
    };
  }

  if (/(content|fanpage|marketing|social|quang cao|seo)/.test(text)) {
    return {
      category: "marketing",
      label: "dự án marketing số",
      defaultTitle: "Dự án content / marketing số",
      defaultGoal: "Tạo nội dung và tài nguyên số giúp doanh nghiệp tiếp cận khách hàng tốt hơn.",
      platformHint: "Tùy mục tiêu có thể bàn giao bộ content, landing page hoặc tài nguyên truyền thông.",
      defaultOutput: "Bộ content marketing",
      skillSuggestions: ["Content Marketing", "Canva/Figma", "SEO / Facebook Ads"],
      outputSuggestions: ["Bộ content 1 tháng", "Kế hoạch nội dung + template", "Landing page + nội dung"],
      durationSuggestions: ["1-2 tuần", "2-4 tuần", "1 tháng"],
      budgetSuggestions: ["1-3 triệu VNĐ", "3-5 triệu VNĐ", "Thỏa thuận theo khối lượng"],
    };
  }

  if (/(website|web|landing page)/.test(text)) {
    return {
      category: "website",
      label: "website doanh nghiệp",
      defaultTitle: "Website cho doanh nghiệp",
      defaultGoal: "Xây dựng website giới thiệu doanh nghiệp, sản phẩm hoặc dịch vụ một cách chuyên nghiệp.",
      platformHint: "Ưu tiên web responsive, tối ưu hiển thị trên mobile và desktop.",
      defaultOutput: "Website doanh nghiệp",
      skillSuggestions: ["WordPress", "Next.js / React", "UI/UX + Frontend"],
      outputSuggestions: ["Website doanh nghiệp hoàn chỉnh", "Landing page + form liên hệ", "Website + trang quản trị nội dung"],
      durationSuggestions: ["2-3 tuần", "3-5 tuần", "5-7 tuần"],
      budgetSuggestions: ["2-4 triệu VNĐ", "4-8 triệu VNĐ", "Thỏa thuận theo phạm vi"],
    };
  }

  return {
    category: "generic",
    label: "dự án số hoá",
    defaultTitle: "Dự án số hoá cho doanh nghiệp",
    defaultGoal: "Xây dựng giải pháp số phù hợp với nhu cầu vận hành hoặc kinh doanh của doanh nghiệp.",
    platformHint: "Cần xác nhận thêm web, app hay workflow tự động dựa trên nguồn lực triển khai.",
    defaultOutput: "Giải pháp số cho doanh nghiệp",
    skillSuggestions: ["Business Analysis", "UI/UX + Frontend", "Backend / Database"],
    outputSuggestions: ["Sản phẩm hoàn chỉnh", "Demo + source code", "Tài liệu + hướng dẫn sử dụng"],
    durationSuggestions: ["2-3 tuần", "4-6 tuần", "6-8 tuần"],
    budgetSuggestions: ["2-5 triệu VNĐ", "5-10 triệu VNĐ", "Thỏa thuận"],
  };
}

function extractDistinctUserMessages(messages: ChatMessageInput[]) {
  return dedupeStrings(getUserMessages(messages));
}

function inferTitleFromMessages(userMessages: string[], profile: ProjectProfile) {
  if (userMessages.length === 0) return "";

  const meaningfulSeed = userMessages.find((message) => !isAdviceRequest(message)) ?? userMessages[0] ?? "";
  if (profile.category !== "generic") {
    return profile.defaultTitle;
  }

  const cleaned = meaningfulSeed.replace(/^l(am|àm)\s+/i, "").trim();
  if (!cleaned) return "";

  const shortTitle = cleaned.split(/\s+/).slice(0, 10).join(" ");
  return shortTitle.charAt(0).toUpperCase() + shortTitle.slice(1);
}

function buildDescriptionFromMessages(messages: ChatMessageInput[]) {
  const userMessages = extractDistinctUserMessages(messages);
  if (userMessages.length === 0) return "";
  return `Nhu cầu SME: ${userMessages.join(". ")}`;
}

function extractLabelsFromText(text: string, candidates: Array<{ pattern: RegExp; label: string }>) {
  return dedupeStrings(
    candidates
      .filter((candidate) => candidate.pattern.test(text))
      .map((candidate) => candidate.label)
  );
}

function extractRequiredSkillsFromMessages(messages: ChatMessageInput[]) {
  const joined = getUserMessages(messages).join(" ");
  const labels = extractLabelsFromText(joined, TECH_KEYWORDS);
  return labels.join(", ");
}

function extractExpectedOutputFromMessages(messages: ChatMessageInput[], profile: ProjectProfile) {
  const joined = getUserMessages(messages).join(" ");
  const labels = extractLabelsFromText(joined, OUTPUT_KEYWORDS);

  if (labels.length > 0) {
    return labels.join(", ");
  }

  const normalized = normalizeText(joined);
  if (profile.category !== "generic" && normalized) {
    return profile.defaultOutput;
  }

  return "";
}

function extractDurationFromMessages(messages: ChatMessageInput[]) {
  const joined = getUserMessages(messages).join(" ");
  const durationMatch = joined.match(/\b\d+\s*(?:-|đến|toi|to)\s*\d*\s*(ngày|ngay|tuần|tuan|tháng|thang)\b/i);
  if (durationMatch) {
    return durationMatch[0].replace(/\s+/g, " ").trim();
  }

  const simpleDurationMatch = joined.match(/\b\d+\s*(ngày|ngay|tuần|tuan|tháng|thang)\b/i);
  return simpleDurationMatch?.[0].replace(/\s+/g, " ").trim() ?? "";
}

function extractBudgetFromMessages(messages: ChatMessageInput[]) {
  const joined = getUserMessages(messages).join(" ");
  const normalized = normalizeText(joined);

  if (/\bthoa thuan\b/.test(normalized)) {
    return "Thỏa thuận";
  }

  if (/(khong co ngan sach|khong ngan sach|ho tro thuc tap|phu cap)/.test(normalized)) {
    return "Không cố định, trao đổi thêm";
  }

  const budgetMatch = joined.match(/\b\d+(?:[.,]\d+)?\s*(?:tr|triệu|trieu|k|nghìn|nghin|vnđ|vnd)\b/i);
  return budgetMatch?.[0].replace(/\s+/g, " ").trim() ?? "";
}

function inferDifficulty(parsedData: ParsedData) {
  const duration = normalizeText(parsedData.duration);
  const amount = Number(duration.match(/\d+/)?.[0] ?? "0");

  if (duration.includes("thang")) {
    if (amount >= 2) return "HARD";
    if (amount === 1) return "MEDIUM";
  }

  if (duration.includes("tuan")) {
    if (amount <= 2 && amount > 0) return "EASY";
    if (amount >= 6) return "HARD";
    if (amount >= 3) return "MEDIUM";
  }

  if (duration.includes("ngay")) {
    if (amount > 0 && amount <= 10) return "EASY";
  }

  return "MEDIUM";
}

function buildStandardizedBrief(parsedData: ParsedData, profile: ProjectProfile) {
  if (!parsedData.title && !parsedData.description) return "";

  const outputLine = parsedData.expectedOutput
    ? `${parsedData.expectedOutput}; ưu tiên bàn giao kèm source code và hướng dẫn sử dụng.`
    : `${profile.defaultOutput}; cần xác nhận thêm phạm vi bàn giao chi tiết.`;

  const skillLine = parsedData.requiredSkills
    ? parsedData.requiredSkills
    : "Chưa chốt công nghệ; cần xác nhận thêm stack hoặc nhóm kỹ năng phù hợp.";

  const platformLine = parsedData.requiredSkills
    ? `${profile.platformHint} Công nghệ ưu tiên: ${parsedData.requiredSkills}.`
    : `${profile.platformHint} Hiện chưa chốt stack cụ thể.`;

  return [
    `Mục tiêu: ${parsedData.title || profile.defaultGoal}.`,
    `Nền tảng sử dụng: ${platformLine}`,
    `Đầu ra cần bàn giao: ${outputLine}`,
    `Yêu cầu kỹ năng: ${skillLine}.`,
  ].join("\n");
}

function buildFallbackParsedData(messages: ChatMessageInput[]): ParsedData {
  const distinctUserMessages = extractDistinctUserMessages(messages);
  const profile = inferProjectProfile(distinctUserMessages);
  const title = inferTitleFromMessages(distinctUserMessages, profile);
  const description = buildDescriptionFromMessages(messages);
  const expectedOutput = extractExpectedOutputFromMessages(messages, profile);
  const requiredSkills = extractRequiredSkillsFromMessages(messages);
  const duration = extractDurationFromMessages(messages);
  const budget = extractBudgetFromMessages(messages);

  const parsedData: ParsedData = {
    ...EMPTY_PARSED_DATA,
    title,
    description,
    expectedOutput,
    requiredSkills,
    duration,
    budget,
    difficulty: "MEDIUM",
  };

  parsedData.difficulty = inferDifficulty(parsedData);
  parsedData.standardizedBrief = buildStandardizedBrief(parsedData, profile);

  return parsedData;
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

  const profile = inferProjectProfile(getUserMessages(messages), fallback.title, fallback.description);
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

  normalized.difficulty = rawDifficulty ? normalizeDifficulty(rawDifficulty) : inferDifficulty(normalized);
  normalized.standardizedBrief = buildStandardizedBrief(normalized, profile);

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

function getNextField(parsedData: ParsedData): NextField {
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

function buildAssistantReply(parsedData: ParsedData, messages: ChatMessageInput[]): Pick<ChatBriefResponse, "message" | "suggestions"> {
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

function normalizeResponse(rawPayload: unknown, messages: ChatMessageInput[]): ChatBriefResponse {
  const rawObject = asObject(rawPayload);
  const parsedData = normalizeParsedData(rawObject, messages);
  const reply = buildAssistantReply(parsedData, messages);

  return {
    message: reply.message,
    suggestions: reply.suggestions.slice(0, 4),
    parsedData,
  };
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
      const reply = buildAssistantReply(offlineParsedData, messages);

      return NextResponse.json({
        message: reply.message,
        suggestions: reply.suggestions,
        parsedData: offlineParsedData,
      });
    }

    const systemPrompt = `Bạn là trợ lý AI tên VnSMEMatch giúp Doanh nghiệp SME tạo dự án cho sinh viên.
Mục tiêu của bạn là TRÍCH XUẤT dữ liệu đáng tin để điền form đăng dự án.
Bạn BẮT BUỘC trả về đúng 1 JSON object thuần, không bọc markdown.

Yêu cầu quan trọng:
- Chỉ điền parsedData bằng những gì người dùng nói rõ hoặc có thể suy ra trực tiếp từ yêu cầu.
- Không tự bịa công nghệ, ngân sách, thời gian nếu người dùng chưa chốt.
- Không hỏi lại thông tin đã có.
- Nếu người dùng nói "chưa rõ", "cần tư vấn", "gợi ý giúp", hãy chuyển sang chế độ tư vấn và đưa ra lựa chọn ngắn gọn trong message/suggestions thay vì lặp lại cùng một câu hỏi.
- message tối đa 2 câu, tiếng Việt ngắn gọn, tự nhiên.
- suggestions nên là 3-4 phương án ngắn để người dùng có thể bấm chọn nhanh.

Format JSON:
{
  "message": "Câu hỏi hoặc tư vấn ngắn",
  "suggestions": ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3"],
  "parsedData": {
    "title": "",
    "description": "",
    "standardizedBrief": "",
    "expectedOutput": "",
    "requiredSkills": "",
    "difficulty": "EASY | MEDIUM | HARD",
    "duration": "",
    "budget": ""
  }
}`;

    const chatMessages = messages.map((message): { role: "assistant" | "user"; content: string } => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content,
    }));

    const response = await openaiInstance.chat.completions.create({
      model: chatModelStr,
      messages: [
        { role: "system", content: systemPrompt },
        ...chatMessages,
      ],
      response_format: { type: "json_object" },
      temperature: 0.25,
      max_tokens: 800,
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
