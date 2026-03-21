import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/lib/auth/session";
import { handlePrismaApiError, unauthorizedResponse } from "@/lib/http/prisma-api";
import { rankBySimilarity } from "@/lib/matching";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  projectId: z.string().cuid(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    const smeUserId = getSessionUserIdByRole(session, "SME");
    if (!smeUserId) {
      if (session?.user) {
        return NextResponse.json(
          { error: "Chỉ doanh nghiệp mới có quyền dùng API matching." },
          { status: 403 },
        );
      }

      return unauthorizedResponse();
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
      return NextResponse.json({ error: "Không tìm thấy dự án." }, { status: 404 });
    }

    if (project.sme.userId !== smeUserId) {
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
    return handlePrismaApiError(error, "Không thể lấy danh sách ứng viên lúc này.");
  }
}
