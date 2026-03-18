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
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { university, major, skills, technologies, githubUrl, portfolioUrl, availability, description, interests } = body;

    // Tách mảng
    const skillsArray = typeof skills === "string" ? skills.split(",").map(s => s.trim()).filter(Boolean) : skills || [];
    const techArray = typeof technologies === "string" ? technologies.split(",").map(s => s.trim()).filter(Boolean) : technologies || [];
    const interestsArray = typeof interests === "string" ? interests.split(",").map(s => s.trim()).filter(Boolean) : interests || [];

    let embedding: number[] = [];

    // Tạo embedding để matching nếu có API Key
    if (process.env.OPENAI_API_KEY) {
      const textToEmbed = `Chuyên ngành: ${major}. Kỹ năng: ${skillsArray.join(", ")}. Công nghệ: ${techArray.join(", ")}. Lĩnh vực quan tâm: ${interestsArray.join(", ")}. Mô tả: ${description}`;
      const embedResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: textToEmbed,
        dimensions: 1536,
      });
      embedding = embedResponse.data[0].embedding;
    }

    // Upsert Student Profile
    const profile = await prisma.studentProfile.upsert({
      where: { userId: session.user.id },
      update: {
        university,
        major,
        skills: skillsArray,
        technologies: techArray,
        githubUrl,
        portfolioUrl,
        availability,
        description,
        interests: interestsArray,
        ...(embedding.length > 0 && { embedding }),
      },
      create: {
        userId: session.user.id,
        university,
        major,
        skills: skillsArray,
        technologies: techArray,
        githubUrl,
        portfolioUrl,
        availability,
        description,
        interests: interestsArray,
        embedding: embedding.length > 0 ? embedding : [],
      }
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Update Student Profile Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}