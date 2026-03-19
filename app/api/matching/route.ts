import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/auth";
import { rankBySimilarity } from "@/lib/matching";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  projectId: z.string().cuid(),
});

function handlePrismaError(error: unknown, fallbackMessage: string) {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json(
      { error: "Database connection failed. Please check DATABASE_URL on Vercel." },
      { status: 503 },
    );
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2021" || error.code === "P2022")
  ) {
    return NextResponse.json(
      { error: "Database schema is out of date. Run prisma db push/migrate deploy." },
      { status: 500 },
    );
  }

  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SME") {
      return NextResponse.json(
        { error: "Chỉ doanh nghiệp mới có quyền dùng API matching." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "projectId không hợp lệ." },
        { status: 400 },
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: parsed.data.projectId },
      select: {
        id: true,
        embedding: true,
        title: true,
        sme: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.sme.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Bạn không có quyền xem matching của dự án này." },
        { status: 403 },
      );
    }

    if (project.embedding.length === 0) {
      return NextResponse.json(
        { error: "Dự án chưa có dữ liệu embedding để matching." },
        { status: 400 },
      );
    }

    const students = await prisma.studentProfile.findMany({
      where: { NOT: { embedding: { equals: [] } } },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const ranked = rankBySimilarity(project.embedding, students)
      .slice(0, 10)
      .map((student) => ({
        id: student.id,
        userId: student.userId,
        name: student.user.name,
        email: student.user.email,
        skills: student.skills,
        technologies: student.technologies,
        githubUrl: student.githubUrl,
        matchScore: student.matchScore,
      }));

    return NextResponse.json({ projectId: project.id, candidates: ranked });
  } catch (error) {
    console.error("Matching API Error:", error);
    return handlePrismaError(error, "Không thể lấy danh sách ứng viên lúc này.");
  }
}
