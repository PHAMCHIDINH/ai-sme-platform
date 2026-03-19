"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_DEADLINE_MS = 30 * 24 * 60 * 60 * 1000;

function getUserIdByRole(
  session: Awaited<ReturnType<typeof auth>>,
  role: "SME" | "STUDENT",
) {
  if (!session?.user?.id || session.user.role !== role) {
    return null;
  }

  return session.user.id;
}

export async function applyProject(projectId: string, matchScore: number) {
  try {
    const session = await auth();
    const studentUserId = getUserIdByRole(session, "STUDENT");

    if (!studentUserId) {
      return { error: "Bạn không có quyền thực hiện thao tác này." };
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });

    if (!profile) {
      return { error: "Không tìm thấy hồ sơ sinh viên." };
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!project) {
      return { error: "Dự án không tồn tại." };
    }

    if (project.status !== "OPEN") {
      return { error: "Dự án đã đóng ứng tuyển." };
    }

    const existingApplication = await prisma.application.findUnique({
      where: {
        projectId_studentId: {
          projectId,
          studentId: profile.id,
        },
      },
      select: {
        status: true,
      },
    });

    if (existingApplication) {
      if (existingApplication.status === "PENDING") {
        return { error: "Bạn đã ứng tuyển dự án này rồi." };
      }

      if (existingApplication.status === "ACCEPTED") {
        return { error: "Bạn đã được chấp nhận vào dự án này." };
      }

      return { error: "Hồ sơ ứng tuyển trước đó của bạn đã bị từ chối." };
    }

    const safeMatchScore = Number.isFinite(matchScore)
      ? Math.max(0, Math.min(100, Math.round(matchScore)))
      : 0;

    await prisma.application.create({
      data: {
        projectId,
        studentId: profile.id,
        status: "PENDING",
        matchScore: safeMatchScore,
      },
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
    const smeUserId = getUserIdByRole(session, "SME");

    if (!smeUserId) {
      return { error: "Bạn không có quyền thực hiện thao tác này." };
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { sme: true },
    });

    if (!project) {
      return { error: "Không tìm thấy dự án." };
    }

    if (project.sme.userId !== smeUserId) {
      return { error: "Bạn không sở hữu dự án này." };
    }

    if (project.status !== "OPEN") {
      return { error: "Dự án đã chốt ứng viên, không thể thay đổi trạng thái hồ sơ." };
    }

    const application = await prisma.application.findUnique({
      where: {
        projectId_studentId: {
          projectId,
          studentId,
        },
      },
      select: {
        status: true,
      },
    });

    if (!application) {
      return { error: "Ứng viên chưa nộp hồ sơ cho dự án này." };
    }

    if (application.status !== "PENDING") {
      if (application.status === "ACCEPTED") {
        return { error: "Ứng viên này đã được chấp nhận trước đó." };
      }

      return { error: "Ứng viên này đã bị từ chối trước đó." };
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
            status: "PENDING",
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
    revalidatePath(`/sme/projects/${projectId}`);
    revalidatePath("/sme/projects");
    revalidatePath("/student/projects");
    revalidatePath("/student/my-projects");
    return { success: true as const };
  } catch (error) {
    console.error("updateCandidateStatus error:", error);
    return { error: "Không thể cập nhật trạng thái ứng viên. Vui lòng thử lại." };
  }
}

export async function inviteStudent(projectId: string, studentId: string) {
  try {
    const session = await auth();
    const smeUserId = getUserIdByRole(session, "SME");

    if (!smeUserId) {
      return { error: "Bạn không có quyền thực hiện thao tác này." };
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { sme: true },
    });

    if (!project || project.sme.userId !== smeUserId) {
      return { error: "Dự án không tồn tại hoặc bạn không có quyền." };
    }
    if (project.status !== "OPEN") {
      return { error: "Dự án không còn tuyển người." };
    }

    const existingApplication = await prisma.application.findUnique({
      where: {
        projectId_studentId: { projectId, studentId },
      },
    });

    if (existingApplication) {
      return { error: "Đã có tương tác (đã mời / đã ứng tuyển) với sinh viên này." };
    }

    await prisma.application.create({
      data: {
        projectId,
        studentId,
        status: "INVITED",
        initiatedBy: "SME",
      },
    });

    revalidatePath("/sme/students");
    return { success: true as const };
  } catch (error) {
    console.error("inviteStudent error:", error);
    return { error: "Có lỗi xảy ra khi gửi lời mời." };
  }
}

export async function respondToInvitation(projectId: string, status: "ACCEPTED" | "REJECTED") {
  try {
    const session = await auth();
    const studentUserId = getUserIdByRole(session, "STUDENT");

    if (!studentUserId) {
      return { error: "Bạn không có quyền thực hiện thao tác này." };
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });

    if (!profile) {
      return { error: "Không tìm thấy hồ sơ của bạn." };
    }

    const application = await prisma.application.findUnique({
      where: {
        projectId_studentId: { projectId, studentId: profile.id },
      },
      include: { project: true },
    });

    if (!application || application.status !== "INVITED" || application.initiatedBy !== "SME") {
      return { error: "Không tìm thấy lời mời hợp lệ." };
    }

    if (application.project.status !== "OPEN") {
      return { error: "Dự án đã đóng hoặc đã có người nhận." };
    }

    const deadline = application.project.deadline ?? new Date(Date.now() + DEFAULT_DEADLINE_MS);

    await prisma.$transaction(async (tx) => {
      if (status === "ACCEPTED") {
        await tx.application.update({
          where: { id: application.id },
          data: { status: "ACCEPTED" },
        });

        await tx.application.updateMany({
          where: {
            projectId,
            studentId: { not: profile.id },
            status: { in: ["PENDING", "INVITED"] },
          },
          data: { status: "REJECTED" },
        });

        await tx.projectProgress.upsert({
          where: { projectId },
          create: {
            projectId,
            studentId: profile.id,
            status: "NOT_STARTED",
            deadline,
          },
          update: {
            studentId: profile.id,
            deadline,
          },
        });

        await tx.project.update({
          where: { id: projectId },
          data: { status: "IN_PROGRESS" },
        });
      } else {
        await tx.application.update({
          where: { id: application.id },
          data: { status: "REJECTED" },
        });
      }
    });

    revalidatePath("/student/dashboard");
    revalidatePath("/student/projects");
    return { success: true as const };
  } catch (error) {
    console.error("respondToInvitation error:", error);
    return { error: "Không thể phản hồi lúc này." };
  }
}
