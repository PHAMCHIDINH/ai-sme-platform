"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_DEADLINE_MS = 30 * 24 * 60 * 60 * 1000;

export async function applyProject(projectId: string, matchScore: number) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") {
      return { error: "Bạn không có quyền thực hiện thao tác này." };
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return { error: "Không tìm thấy hồ sơ sinh viên." };
    }

    await prisma.application.upsert({
      where: {
        projectId_studentId: {
          projectId,
          studentId: profile.id,
        },
      },
      create: {
        projectId,
        studentId: profile.id,
        status: "PENDING",
        matchScore,
      },
      update: {},
    });

    revalidatePath("/student/projects");
    return { success: true as const };
  } catch (error) {
    console.error("applyProject error:", error);
    return { error: "Không thể ứng tuyển lúc này. Vui lòng thử lại." };
  }
}

export async function updateCandidateStatus(
  projectId: string,
  studentId: string,
  status: "ACCEPTED" | "REJECTED",
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SME") {
      return { error: "Bạn không có quyền thực hiện thao tác này." };
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { sme: true },
    });

    if (!project) {
      return { error: "Không tìm thấy dự án." };
    }

    if (project.sme.userId !== session.user.id) {
      return { error: "Bạn không sở hữu dự án này." };
    }

    const deadline = project.deadline ?? new Date(Date.now() + DEFAULT_DEADLINE_MS);

    await prisma.$transaction(async (tx) => {
      if (status === "ACCEPTED") {
        await tx.application.update({
          where: {
            projectId_studentId: {
              projectId,
              studentId,
            },
          },
          data: { status: "ACCEPTED" },
        });

        await tx.application.updateMany({
          where: {
            projectId,
            studentId: { not: studentId },
          },
          data: { status: "REJECTED" },
        });

        await tx.projectProgress.upsert({
          where: { projectId },
          create: {
            projectId,
            studentId,
            status: "NOT_STARTED",
            deadline,
          },
          update: {
            studentId,
            deadline,
          },
        });

        await tx.project.update({
          where: { id: projectId },
          data: { status: "IN_PROGRESS" },
        });
      } else {
        await tx.application.update({
          where: {
            projectId_studentId: {
              projectId,
              studentId,
            },
          },
          data: { status: "REJECTED" },
        });
      }
    });

    revalidatePath(`/sme/projects/${projectId}/candidates`);
    return { success: true as const };
  } catch (error) {
    console.error("updateCandidateStatus error:", error);
    return { error: "Không thể cập nhật trạng thái ứng viên. Vui lòng thử lại." };
  }
}
