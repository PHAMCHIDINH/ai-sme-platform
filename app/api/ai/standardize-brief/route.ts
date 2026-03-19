import { NextResponse } from "next/server";
import { standardizeBrief } from "@/lib/openai";
import { standardizeBriefSchema } from "@/lib/validators/project";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = standardizeBriefSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const brief = await standardizeBrief(parsed.data.description);

    return NextResponse.json({ brief });
  } catch (error) {
    console.error("AI Standardize Error:", error);
    return NextResponse.json({ error: "Failed to standardize brief" }, { status: 500 });
  }
}
