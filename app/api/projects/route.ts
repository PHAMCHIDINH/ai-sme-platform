import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSessionUserId, getSessionUserIdByRole } from "@/lib/auth/session";
import { handlePrismaApiError, unauthorizedResponse } from "@/lib/http/prisma-api";
import { generateEmbedding } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { projectFormSchema } from "@/lib/validators/project";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const smeUserId = getSessionUserIdByRole(session, "SME");

    if (!smeUserId) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const parsed = projectFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu dự án không hợp lệ." },
        { status: 400 },
      );
    }

    const {
      title,
      description,
      standardizedBrief,
      expectedOutput,
      requiredSkills,
      difficulty,
      duration,
      budget,
    } = parsed.data;

    // Tách mảng kỹ năng
    const skillsArray = typeof requiredSkills === "string" 
      ? requiredSkills.split(",").map(s => s.trim()).filter(Boolean) 
      : requiredSkills || [];

    // Tìm SME profile ID
    const smeProfile = await prisma.sMEProfile.findUnique({
      where: { userId: smeUserId }
    });

    if (!smeProfile) {
      return NextResponse.json({ error: "SME Profile not found" }, { status: 404 });
    }

    const embedding = await generateEmbedding(
      `${title}. ${description}. Kỹ năng yêu cầu: ${skillsArray.join(", ")}`,
    );

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
    return handlePrismaApiError(error, "Failed to create project");
  }
}

export async function GET() {
  try {
    const session = await auth();
    const userId = getSessionUserId(session);
    const role = session?.user?.role;

    if (!userId || !role) {
      return unauthorizedResponse();
    }

    if (role === "SME") {
      const smeProfile = await prisma.sMEProfile.findUnique({
        where: { userId }
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
    return handlePrismaApiError(error, "Server Error");
  }
}
