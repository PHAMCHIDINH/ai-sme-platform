import OpenAI from "openai";

const OPENROUTER_KEY_PREFIX = "sk-or-v1-";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const OPENROUTER_CHAT_MODEL = "stepfun/step-3.5-flash:free";
const OPENROUTER_EMBEDDING_MODEL = "openai/text-embedding-3-small";
const OPENAI_CHAT_MODEL = "gpt-4o-mini";
const OPENAI_EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DISABLED_VALUES = new Set(["none", "off", "disabled", "false", "0"]);

const apiKey = process.env.OPENAI_API_KEY?.trim() || "";
const explicitBaseURL = process.env.OPENAI_BASE_URL?.trim() || "";
const shouldInferOpenRouter = apiKey.startsWith(OPENROUTER_KEY_PREFIX);
const baseURL = explicitBaseURL || (shouldInferOpenRouter ? OPENROUTER_BASE_URL : "");

const isOpenRouter = Boolean(baseURL.includes("openrouter.ai"));
const chatModel = process.env.OPENAI_CHAT_MODEL?.trim() || (isOpenRouter ? OPENROUTER_CHAT_MODEL : OPENAI_CHAT_MODEL);

const rawEmbeddingModel = process.env.OPENAI_EMBEDDING_MODEL?.trim() || "";
const embeddingModel = EMBEDDING_DISABLED_VALUES.has(rawEmbeddingModel.toLowerCase())
  ? ""
  : rawEmbeddingModel || (isOpenRouter ? OPENROUTER_EMBEDDING_MODEL : OPENAI_EMBEDDING_MODEL);
const fallbackCounts = new Map<string, number>();

export const chatModelStr = chatModel;
export const openaiInstance = apiKey
  ? new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
    })
  : null;


export function canUseAI() {
  return Boolean(openaiInstance);
}

export function canGenerateEmbedding() {
  return Boolean(openaiInstance && embeddingModel);
}

export function getAIConfigStatus() {
  return {
    provider: isOpenRouter ? "openrouter" : "openai",
    hasApiKey: Boolean(apiKey),
    baseURL: baseURL || null,
    chatModel: chatModelStr,
    embeddingModel: embeddingModel || null,
    canUseAI: canUseAI(),
    canGenerateEmbedding: canGenerateEmbedding(),
  };
}

function incrementFallbackCount(scope: "standardizeBrief" | "generateEmbedding", reason: string) {
  const key = `${scope}:${reason}`;
  const count = (fallbackCounts.get(key) ?? 0) + 1;
  fallbackCounts.set(key, count);
  return count;
}

function logAIFallback(
  scope: "standardizeBrief" | "generateEmbedding",
  reason: string,
  extra?: Record<string, unknown>,
) {
  const count = incrementFallbackCount(scope, reason);
  console.warn(`[AI:${scope}] fallback activated`, {
    reason,
    count,
    provider: isOpenRouter ? "openrouter" : "openai",
    chatModel: chatModelStr,
    embeddingEnabled: Boolean(embeddingModel),
    ...extra,
  });
}

function logAIFailure(scope: "standardizeBrief" | "generateEmbedding", error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown AI error";

  logAIFallback(scope, "provider_error", { message });
}

function fallbackBrief() {
  return [
    "Muc tieu: Lam ro bai toan SME dang gap.",
    "Nen tang su dung: Tuy theo nang luc sinh vien va nhu cau du an.",
    "Dau ra can ban giao: Tai lieu + source code + huong dan su dung.",
    "Ky nang goi y: Giao tiep, phan tich yeu cau, ky nang chuyen mon phu hop.",
  ].join("\n");
}

export async function standardizeBrief(rawBrief: string) {
  if (!rawBrief.trim()) {
    return "";
  }

  if (!openaiInstance) {
    logAIFallback("standardizeBrief", "missing_api_key");
    return fallbackBrief();
  }

  try {
    const completion = await openaiInstance.chat.completions.create({
      model: chatModelStr,
      messages: [
        {
          role: "system",
          content:
            "Ban la tro ly chuan hoa brief du an SME. Tra ve ngan gon, ro rang, theo cau truc: Muc tieu, Nen tang su dung, Dau ra can ban giao, Ky nang goi y.",
        },
        {
          role: "user",
          content: `Mo ta tho tu SME:\n${rawBrief}`,
        },
      ],
      temperature: 0.2,
    });

    const normalizedBrief = completion.choices[0]?.message?.content?.trim();
    if (normalizedBrief) {
      return normalizedBrief;
    }

    logAIFallback("standardizeBrief", "empty_provider_response");
    return fallbackBrief();
  } catch (error) {
    logAIFailure("standardizeBrief", error);
    return fallbackBrief();
  }
}

export async function generateEmbedding(text: string) {
  if (!text.trim()) {
    return [] as number[];
  }

  if (!openaiInstance) {
    logAIFallback("generateEmbedding", "missing_api_key");
    return [] as number[];
  }

  if (!embeddingModel) {
    logAIFallback("generateEmbedding", "embedding_disabled");
    return [] as number[];
  }

  try {
    const response = await openaiInstance.embeddings.create({
      model: embeddingModel,
      input: text,
    });

    const generatedEmbedding = response.data[0]?.embedding;
    if (generatedEmbedding && generatedEmbedding.length > 0) {
      return generatedEmbedding;
    }

    logAIFallback("generateEmbedding", "empty_provider_response");
    return [] as number[];
  } catch (error) {
    logAIFailure("generateEmbedding", error);
    return [] as number[];
  }
}
