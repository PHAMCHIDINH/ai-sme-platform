import { Prisma, ProgressStatus } from "@prisma/client";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Clock, CheckCircle2, FileText, ListTodo } from "lucide-react";

import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/retroui/Card";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { ProjectProgressActions } from "./project-progress-actions";
import { SmeEvaluationDialog } from "./sme-evaluation-dialog";

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

type ActionResult = {
  success?: true;
  error?: string;
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

function statusLabel(status: ProgressStatus) {
  switch (status) {
    case "COMPLETED":
      return "Hoàn thành";
    case "SUBMITTED":
      return "Chờ nghiệm thu";
    case "IN_PROGRESS":
      return "Đang làm";
    default:
      return "Chưa bắt đầu";
  }
}

function statusClassName(status: ProgressStatus) {
  if (status === "COMPLETED") {
    return "border-green-500 text-green-600";
  }
  if (status === "SUBMITTED") {
    return "border-amber-500 text-amber-600";
  }
  return "border-blue-500 text-blue-600";
}

function statusBarClassName(status: ProgressStatus) {
  if (status === "COMPLETED") {
    return "bg-green-500";
  }
  if (status === "SUBMITTED") {
    return "bg-amber-500";
  }
  return "bg-blue-500";
}

function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString("vi-VN");
}

function parseRating(value: FormDataEntryValue | null): number | null {
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return null;
  }
  return rating;
}

async function getOwnedProgressEntry(progressId: string, userId: string) {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return { error: "Không tìm thấy hồ sơ sinh viên." } as const;
  }

  const progress = await prisma.projectProgress.findUnique({
    where: { id: progressId },
    include: { project: true },
  });

  if (!progress || progress.studentId !== profile.id) {
    return { error: "Bạn không có quyền cập nhật tiến độ này." } as const;
  }

  return { progress } as const;
}

export default async function StudentMyProjectsPage() {
  const session = await auth();
  const studentUserId = getSessionUserIdByRole(session, "STUDENT");
  if (!studentUserId) return <div>Unauthorized</div>;

  async function addMilestone(progressId: string, formData: FormData): Promise<ActionResult> {
    "use server";

    const activeSession = await auth();
    const activeStudentUserId = getSessionUserIdByRole(activeSession, "STUDENT");

    if (!activeStudentUserId) {
      return { error: "Bạn không có quyền thực hiện thao tác này." };
    }

    const title = String(formData.get("title") ?? "").trim();
    if (!title) {
      return { error: "Milestone không được để trống." };
    }

    const result = await getOwnedProgressEntry(progressId, activeStudentUserId);
    if ("error" in result) {
      return result;
    }

    if (result.progress.status === "SUBMITTED" || result.progress.status === "COMPLETED") {
      return { error: "Dự án đã khóa cập nhật tiến độ." };
    }

    const milestones = parseMilestones(result.progress.milestones);
    const nextMilestones: MilestoneItem[] = [
      ...milestones,
      {
        id: crypto.randomUUID(),
        title,
        createdAt: new Date().toISOString(),
      },
    ];

    await prisma.projectProgress.update({
      where: { id: progressId },
      data: {
        milestones: nextMilestones,
        status:
          result.progress.status === "NOT_STARTED"
            ? "IN_PROGRESS"
            : result.progress.status,
      },
    });

    revalidatePath("/student/my-projects");
    revalidatePath("/student/dashboard");
    revalidatePath(`/sme/projects/${result.progress.projectId}`);
    return { success: true };
  }

  async function addProgressUpdate(progressId: string, formData: FormData): Promise<ActionResult> {
    "use server";

    const activeSession = await auth();
    const activeStudentUserId = getSessionUserIdByRole(activeSession, "STUDENT");

    if (!activeStudentUserId) {
      return { error: "Bạn không có quyền thực hiện thao tác này." };
    }

    const content = String(formData.get("content") ?? "").trim();
    if (!content) {
      return { error: "Nội dung cập nhật không được để trống." };
    }

    const result = await getOwnedProgressEntry(progressId, activeStudentUserId);
    if ("error" in result) {
      return result;
    }

    if (result.progress.status === "SUBMITTED" || result.progress.status === "COMPLETED") {
      return { error: "Dự án đã khóa cập nhật tiến độ." };
    }

    const updates = parseProgressUpdates(result.progress.updates);
    const nextUpdates: ProgressUpdateItem[] = [
      ...updates,
      {
        id: crypto.randomUUID(),
        content,
        createdAt: new Date().toISOString(),
      },
    ];

    await prisma.projectProgress.update({
      where: { id: progressId },
      data: {
        updates: nextUpdates,
        status:
          result.progress.status === "NOT_STARTED"
            ? "IN_PROGRESS"
            : result.progress.status,
      },
    });

    revalidatePath("/student/my-projects");
    revalidatePath("/student/dashboard");
    revalidatePath(`/sme/projects/${result.progress.projectId}`);
    return { success: true };
  }

  async function submitDeliverable(
    progressId: string,
    projectId: string,
    formData: FormData,
  ): Promise<ActionResult> {
    "use server";

    const activeSession = await auth();
    const activeStudentUserId = getSessionUserIdByRole(activeSession, "STUDENT");

    if (!activeStudentUserId) {
      return { error: "Bạn không có quyền thực hiện thao tác này." };
    }

    const deliverableUrl = String(formData.get("deliverableUrl") ?? "").trim();
    if (!deliverableUrl) {
      return { error: "Link bàn giao không được để trống." };
    }

    try {
      new URL(deliverableUrl);
    } catch {
      return { error: "Link bàn giao không hợp lệ." };
    }

    const result = await getOwnedProgressEntry(progressId, activeStudentUserId);
    if ("error" in result) {
      return result;
    }

    if (result.progress.projectId !== projectId) {
      return { error: "Dữ liệu dự án không hợp lệ." };
    }

    if (result.progress.status === "SUBMITTED" || result.progress.status === "COMPLETED") {
      return { error: "Dự án đã được bàn giao hoặc hoàn thành." };
    }

    await prisma.$transaction([
      prisma.projectProgress.update({
        where: { id: progressId },
        data: {
          deliverableUrl,
          status: "SUBMITTED",
        },
      }),
      prisma.project.update({
        where: { id: projectId },
        data: { status: "SUBMITTED" },
      }),
    ]);

    revalidatePath("/student/my-projects");
    revalidatePath("/student/dashboard");
    revalidatePath(`/sme/projects/${projectId}`);
    revalidatePath("/sme/projects");
    return { success: true };
  }

  async function submitSmeEvaluation(
    progressId: string,
    projectId: string,
    formData: FormData,
  ): Promise<ActionResult> {
    "use server";

    const activeSession = await auth();
    const activeStudentUserId = getSessionUserIdByRole(activeSession, "STUDENT");

    if (!activeStudentUserId) {
      return { error: "Bạn không có quyền thực hiện thao tác này." };
    }

    const result = await getOwnedProgressEntry(progressId, activeStudentUserId);
    if ("error" in result) {
      return result;
    }

    if (result.progress.projectId !== projectId) {
      return { error: "Dữ liệu dự án không hợp lệ." };
    }

    if (
      result.progress.status !== "COMPLETED" ||
      result.progress.project.status !== "COMPLETED"
    ) {
      return { error: "Chỉ có thể đánh giá khi dự án đã hoàn thành." };
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        sme: true,
        evaluations: {
          where: {
            type: "STUDENT_TO_SME",
            evaluatorId: activeStudentUserId,
          },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!project) {
      return { error: "Không tìm thấy dự án." };
    }

    if (project.evaluations.length > 0) {
      return { error: "Bạn đã đánh giá doanh nghiệp cho dự án này." };
    }

    const outputQuality = parseRating(formData.get("outputQuality"));
    const onTime = parseRating(formData.get("onTime"));
    const proactiveness = parseRating(formData.get("proactiveness"));
    const communication = parseRating(formData.get("communication"));
    const overallFit = parseRating(formData.get("overallFit"));

    if (
      outputQuality === null ||
      onTime === null ||
      proactiveness === null ||
      communication === null ||
      overallFit === null
    ) {
      return { error: "Vui lòng chọn điểm 1-5 cho tất cả tiêu chí." };
    }

    const comment = String(formData.get("comment") ?? "").trim();

    await prisma.evaluation.create({
      data: {
        projectId,
        evaluatorId: activeStudentUserId,
        evaluateeId: project.sme.userId,
        type: "STUDENT_TO_SME",
        outputQuality,
        onTime,
        proactiveness,
        communication,
        overallFit,
        comment: comment || null,
      },
    });

    revalidatePath("/student/my-projects");
    revalidatePath(`/sme/projects/${projectId}`);
    revalidatePath("/sme/projects");
    return { success: true };
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: studentUserId },
  });

  if (!profile) return <div>Hãy cập nhật profile trước.</div>;

  const progressEntries = await prisma.projectProgress.findMany({
    where: { studentId: profile.id },
    include: {
      project: {
        include: {
          sme: true,
          evaluations: {
            where: {
              type: "STUDENT_TO_SME",
              evaluatorId: studentUserId,
            },
            select: { id: true },
            take: 1,
          },
        },
      },
    },
    orderBy: { deadline: "asc" },
  });

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dự án đang tham gia</h2>
        <p className="text-muted-foreground text-sm">Cập nhật tiến độ và bàn giao sản phẩm</p>
      </div>

      {progressEntries.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center bg-muted/20 border-dashed">
          <Clock className="w-12 h-12 text-muted-foreground opacity-50 mb-4" />
          <p className="text-muted-foreground mb-4">Bạn chưa tham gia dự án nào.</p>
          <Link href="/student/projects">
            <Button>Tìm dự án ngay</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {progressEntries.map((entry) => {
            const milestones = parseMilestones(entry.milestones);
            const updates = parseProgressUpdates(entry.updates);
            const hasSmeEvaluation = entry.project.evaluations.length > 0;

            return (
              <Card
                key={entry.id}
                className="bg-white overflow-hidden"
              >
                <div className={`h-2 w-full ${statusBarClassName(entry.status)}`} />
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 justify-between">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold">{entry.project.title}</h3>
                        <Badge
                          className={statusClassName(entry.status)}
                          variant="outline"
                        >
                          {statusLabel(entry.status)}
                        </Badge>
                      </div>

                      <p className="text-sm font-medium text-muted-foreground">
                        Khách hàng: {entry.project.sme.companyName}
                      </p>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border bg-background/60 p-4">
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
                                  <p className="text-sm font-medium">
                                    {milestone.title}
                                  </p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {formatDateTime(milestone.createdAt)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="rounded-2xl border bg-background/60 p-4">
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
                      </div>

                      <div className="mt-2 rounded-2xl border bg-background/60 p-4 space-y-2">
                        <p className="text-sm">
                          <strong>Hạn chót:</strong>{" "}
                          {new Date(entry.deadline).toLocaleDateString("vi-VN")}
                        </p>
                        {entry.deliverableUrl ? (
                          <p className="text-sm">
                            <strong>Link bàn giao:</strong>{" "}
                            <a
                              className="text-primary hover:underline"
                              href={entry.deliverableUrl}
                              rel="noreferrer"
                              target="_blank"
                            >
                              Xem sản phẩm
                            </a>
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 md:min-w-[240px] md:border-l md:pl-6">
                      {entry.status === "COMPLETED" ? (
                        <>
                          <Button
                            className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100"
                            variant="outline"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Đã hoàn thành
                          </Button>

                          {hasSmeEvaluation ? (
                            <Button
                              className="border-green-200 text-green-700 bg-green-50 hover:bg-green-100"
                              variant="outline"
                            >
                              Đã đánh giá ✓
                            </Button>
                          ) : (
                            <SmeEvaluationDialog
                              companyName={entry.project.sme.companyName}
                              submitAction={submitSmeEvaluation.bind(
                                null,
                                entry.id,
                                entry.projectId,
                              )}
                            />
                          )}
                        </>
                      ) : entry.status === "SUBMITTED" ? (
                        <Button
                          className="border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"
                          variant="outline"
                        >
                          Đã nộp, chờ SME nghiệm thu
                        </Button>
                      ) : (
                        <ProjectProgressActions
                          addMilestoneAction={addMilestone.bind(null, entry.id)}
                          addProgressUpdateAction={addProgressUpdate.bind(null, entry.id)}
                          entryId={entry.id}
                          entryStatus={entry.status}
                          submitDeliverableAction={submitDeliverable.bind(
                            null,
                            entry.id,
                            entry.projectId,
                          )}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
