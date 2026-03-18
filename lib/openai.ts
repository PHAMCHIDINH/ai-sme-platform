import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY?.trim();
const baseURL = process.env.OPENAI_BASE_URL?.trim();
const chatModel = process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4o-mini";

const isOpenRouter = Boolean(baseURL?.includes("openrouter.ai"));
const embeddingModel =
  process.env.OPENAI_EMBEDDING_MODEL?.trim() || (isOpenRouter ? "" : "text-embedding-3-small");

const openai = apiKey
  ? new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
    })
  : null;

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

  if (!openai) {
    return fallbackBrief();
  }

  try {
    const completion = await openai.chat.completions.create({
      model: chatModel,
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

    return completion.choices[0]?.message?.content ?? fallbackBrief();
  } catch {
    return fallbackBrief();
  }
}

export async function generateEmbedding(text: string) {
  if (!text.trim() || !openai || !embeddingModel) {
    return [] as number[];
  }

  try {
    const response = await openai.embeddings.create({
      model: embeddingModel,
      input: text,
    });

    return response.data[0]?.embedding ?? [];
  } catch {
    return [] as number[];
  }
}
