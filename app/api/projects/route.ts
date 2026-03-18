import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { auth } from "@/auth";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SME") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, standardizedBrief, expectedOutput, requiredSkills, difficulty, duration, budget } = body;

    let embedding: number[] = [];

    // Tách mảng kỹ năng
    const skillsArray = typeof requiredSkills === "string" 
      ? requiredSkills.split(",").map(s => s.trim()).filter(Boolean) 
      : requiredSkills || [];

    // Tạo embedding nếu có API key
    if (process.env.OPENAI_API_KEY) {
      const textToEmbed = `${title}. ${description}. Kỹ năng yêu cầu: ${skillsArray.join(", ")}`;
      const embedResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: textToEmbed,
        dimensions: 1536,
      });
      embedding = embedResponse.data[0].embedding;
    }

    // Tìm SME profile ID
    const smeProfile = await prisma.sMEProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!smeProfile) {
      return NextResponse.json({ error: "SME Profile not found" }, { status: 404 });
    }

    const project = await prisma.project.create({
      data: {
        smeId: smeProfile.id,
        title,
        description,
        standardizedBrief: standardizedBrief || null,
        expectedOutput,
        requiredSkills: skillsArray,
        difficulty,
        duration,
        budget: budget || null,
        status: "OPEN",
        embedding: embedding, // Lưu array float
      }
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Create Project Error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "SME") {
      const smeProfile = await prisma.sMEProfile.findUnique({
        where: { userId: session.user.id }
      });
      if (!smeProfile) return NextResponse.json({ projects: [] });

      const projects = await prisma.project.findMany({
        where: { smeId: smeProfile.id },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { applications: true } } }
      });
      return NextResponse.json({ projects });
    }
    
    // Nếu là STUDENT, sẽ gọi API GET /api/projects để lấy dự án gợi ý (trong api route khác, hoặc logic tại đây)
    const projects = await prisma.project.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    return NextResponse.json({ projects });
    
  } catch (error) {
    console.error("Get Projects Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}