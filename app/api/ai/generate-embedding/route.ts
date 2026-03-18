import { NextResponse } from "next/server";
import { z } from "zod";

import { generateEmbedding } from "@/lib/openai";

const schema = z.object({
  text: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const embedding = await generateEmbedding(parsed.data.text);
    return NextResponse.json({ embedding });
  } catch (error) {
    return NextResponse.json(
      { error: "Khong the tao embedding", details: String(error) },
      { status: 500 },
    );
  }
}