import { NextResponse } from "next/server";
import { z } from "zod";

import { standardizeBrief } from "@/lib/openai";

const schema = z.object({
  rawBrief: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const standardizedBrief = await standardizeBrief(parsed.data.rawBrief);
    return NextResponse.json({ standardizedBrief });
  } catch (error) {
    return NextResponse.json(
      { error: "Khong the chuan hoa brief", details: String(error) },
      { status: 500 },
    );
  }
}