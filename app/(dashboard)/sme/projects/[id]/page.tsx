import { Prisma, ProgressStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  ListTodo,
  Users,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MilestoneItem = {
  id: string;
  title: string;
  createdAt: string;
};

type ProgressUpdateItem = {
  id: string;
  content: string;
  createdAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseMilestones(value: Prisma.JsonValue): MilestoneItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    if (
      typeof item.id !== "string" ||
      typeof item.title !== "string" ||
      typeof item.createdAt !== "string"
    ) {
      return [];
    }

    return [
      {
        id: item.id,
        title: item.title,
        createdAt: item.createdAt,
      },
    ];
  });
}

function parseProgressUpdates(value: Prisma.JsonValue): ProgressUpdateItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    if (
      typeof item.id !== "string" ||
      typeof item.content !== "string" ||
      typeof item.createdAt !== "string"
    ) {
      return [];
    }

    return [
      {
        id: item.id,
        content: item.content,
        createdAt: item.createdAt,
      },
    ];
  });
}

function progressStatusLabel(status: ProgressStatus) {
  switch (status) {
    case "COMPLETED":
      return "Hoàn thành";
    case "SUBMITTED":
      return "Đã bàn giao";
    case "IN_PROGRESS":
      return "Đang thực hiện";
    default:
      return "Chưa bắt đầu";
  }
}

function progressStatusClassName(status: ProgressStatus) {
  if (status === "COMPLETED") {
    return "border-green-500 text-green-600 dark:text-green-400";
  }
  if (status === "SUBMITTED") {
    return "border-amber-500 text-amber-600 dark:text-amber-400";
  }
  return "border-blue-500 text-blue-600 dark:text-blue-400";
}

function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString("vi-VN");
}

export default async function SMEProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session || session.user.role !== "SME") {
    return <div>Unauthorized</div>;
  }

  async function markAsCompleted(projectId: string) {
    "use server";

    const activeSession = await auth();
    if (!activeSession || activeSession.user.role !== "SME") {
      return;
    }

    const ownedProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        sme: true,
        progress: true,
      },
    });

    if (!ownedProject || ownedProject.sme.userId !== activeSession.user.id) {
      return;
    }

    if (
      ownedProject.status !== "SUBMITTED" ||
      ownedProject.progress?.status !== "SUBMITTED" ||
      !ownedProject.progress.deliverableUrl
    ) {
      return;
    }

    await prisma.$transaction([
      prisma.project.update({
        where: { id: projectId },
        data: { status: "COMPLETED" },
      }),
      prisma.projectProgress.update({
        where: { projectId },
        data: { status: "COMPLETED" },
      }),
    ]);

    revalidatePath(`/sme/projects/${projectId}`);
    revalidatePath("/sme/projects");
    revalidatePath("/student/my-projects");
    revalidatePath("/student/dashboard");
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      sme: true,
      _count: {
        select: {
          applications: true,
        },
      },
      progress: true,
      evaluations: {
        where: { type: "SME_TO_STUDENT" },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!project) {
    return notFound();
  }

  if (project.sme.userId !== session.user.id) {
    return <div>Unauthorized access to this project</div>;
  }

  const milestones = project.progress
    ? parseMilestones(project.progress.milestones)
    : [];
  const updates = project.progress
    ? parseProgressUpdates(project.progress.updates)
    : [];
  const hasStudentEvaluation = project.evaluations.length > 0;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/sme/projects">
          <Button className="rounded-full" size="icon" variant="ghost">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">{project.title}</h2>
            <Badge
              variant={project.status === "OPEN" ? "default" : "outline"}
              className={
                project.status === "SUBMITTED" ? "border-amber-500 text-amber-600" :
                project.status === "COMPLETED" ? "border-green-500 text-green-600" :
                project.status === "IN_PROGRESS" ? "border-blue-500 text-blue-600" :
                project.status === "DRAFT" ? "border-gray-400 text-gray-500" :
                undefined
              }
            >
              {project.status === "OPEN" ? "Đang mở" :
               project.status === "IN_PROGRESS" ? "Đang tiến hành" :
               project.status === "SUBMITTED" ? "Chờ nghiệm thu" :
               project.status === "COMPLETED" ? "Hoàn thành" :
               "Nháp"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Đăng ngày: {new Date(project.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-none bg-white/50 shadow-sm backdrop-blur dark:bg-slate-900/50">
            <CardHeader>
              <CardTitle>Nội dung dự án</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                  Mô tả bài toán
                </h4>
                <div className="rounded-xl bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </div>
              </div>

              {project.standardizedBrief ? (
                <div>
                  <h4 className="mb-2 flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Brief đã chuẩn hóa (Bằng AI)
                  </h4>
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-sm leading-relaxed whitespace-pre-wrap dark:border-indigo-900/30 dark:bg-indigo-950/20">
                    {project.standardizedBrief}
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-muted/30 p-4">
                  <span className="mb-1 block text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    Mức độ khó
                  </span>
                  <span className="font-semibold">
                    {project.difficulty === "EASY"
                      ? "Dễ"
                      : project.difficulty === "MEDIUM"
                        ? "Trung bình"
                        : "Khó"}
                  </span>
                </div>
                <div className="rounded-xl bg-muted/30 p-4">
                  <span className="mb-1 block text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    Thời gian dự kiến
                  </span>
                  <span className="font-semibold">{project.duration}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <Card className="border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm backdrop-blur dark:border-blue-900/50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800 dark:text-blue-300">
                <Users className="mr-2 h-5 w-5" />
                Ứng viên & Matching
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-6 text-center">
                <div className="mb-2 text-4xl font-black text-blue-600 dark:text-blue-400">
                  {project._count.applications}
                </div>
                <p className="mb-6 text-sm font-medium text-blue-800/70 dark:text-blue-300/70">
                  Sinh viên đã ứng tuyển
                </p>
                <Link href={`/sme/projects/${project.id}/candidates`}>
                  <Button className="w-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700">
                    Xem ứng viên & Gợi ý AI <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white/50 shadow-sm backdrop-blur dark:bg-slate-900/50">
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                Tiến độ hiện tại
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.status === "OPEN" ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Dự án đang mở, đợi chốt ứng viên.
                </div>
              ) : !project.progress ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Chưa có dữ liệu tiến độ cho dự án này.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">Trạng thái</span>
                    <Badge
                      className={progressStatusClassName(project.progress.status)}
                      variant="outline"
                    >
                      {progressStatusLabel(project.progress.status)}
                    </Badge>
                  </div>

                  {project.status === "COMPLETED" ? (
                    hasStudentEvaluation ? (
                      <Badge
                        className="w-full justify-center border-green-200 bg-green-50 py-2 text-green-700"
                        variant="outline"
                      >
                        Đã đánh giá ✓
                      </Badge>
                    ) : (
                      <Link href={`/sme/projects/${project.id}/evaluate`}>
                        <Button className="w-full">Đánh giá sinh viên</Button>
                      </Link>
                    )
                  ) : null}

                  {project.progress.deliverableUrl ? (
                    <div className="rounded-xl border bg-background/60 p-4">
                      <p className="text-sm font-semibold">Link bàn giao</p>
                      <a
                        className="mt-2 inline-block text-sm text-primary hover:underline"
                        href={project.progress.deliverableUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Xem sản phẩm đã nộp
                      </a>
                    </div>
                  ) : (
                    <div className="rounded-xl border bg-background/60 p-4 text-sm text-muted-foreground">
                      Sinh viên chưa nộp link bàn giao.
                    </div>
                  )}

                  <div className="rounded-xl border bg-background/60 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <ListTodo className="h-4 w-4 text-primary" />
                      Milestones
                    </div>
                    {milestones.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Chưa có milestone nào.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {milestones.map((milestone) => (
                          <div
                            className="rounded-xl border bg-muted/20 px-3 py-2"
                            key={milestone.id}
                          >
                            <p className="text-sm font-medium">{milestone.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDateTime(milestone.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border bg-background/60 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <FileText className="h-4 w-4 text-primary" />
                      Cập nhật tiến độ
                    </div>
                    {updates.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Chưa có cập nhật nào.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {updates.map((update) => (
                          <div
                            className="rounded-xl border bg-muted/20 px-3 py-2"
                            key={update.id}
                          >
                            <p className="text-sm">{update.content}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDateTime(update.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {project.progress.deadline ? (
                    <div className="text-sm text-muted-foreground">
                      Hạn chót:{" "}
                      <span className="font-medium text-foreground">
                        {new Date(project.progress.deadline).toLocaleDateString(
                          "vi-VN",
                        )}
                      </span>
                    </div>
                  ) : null}

                  {project.status === "SUBMITTED" ? (
                    <form action={markAsCompleted.bind(null, project.id)}>
                      <Button className="w-full bg-green-600 text-white hover:bg-green-700">
                        Chấp nhận bàn giao
                      </Button>
                    </form>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
