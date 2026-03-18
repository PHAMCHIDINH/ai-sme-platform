import { EvalType, ProgressStatus, ProjectStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rating } from "@/components/ui/rating";
import { prisma } from "@/lib/prisma";

function parseJsonArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function formatListItem(item: unknown) {
  if (!item || typeof item !== "object") {
    return String(item ?? "");
  }

  const record = item as Record<string, unknown>;
  if (typeof record.content === "string") {
    return record.content;
  }

  return JSON.stringify(item);
}

async function addProgressUpdate(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return;
  }

  const projectId = String(formData.get("projectId") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  if (!content) {
    return;
  }

  const profile = await prisma.studentProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) {
    return;
  }

  const current = await prisma.projectProgress.findUnique({ where: { projectId } });
  const updates = [...parseJsonArray(current?.updates), { content, at: new Date().toISOString() }];

  await prisma.projectProgress.upsert({
    where: { projectId },
    update: { updates },
    create: {
      projectId,
      studentId: profile.id,
      status: ProgressStatus.IN_PROGRESS,
      milestones: [],
      updates,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  revalidatePath("/student/my-projects");
}

async function addMilestone(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return;
  }

  const projectId = String(formData.get("projectId") ?? "");
  const milestone = String(formData.get("milestone") ?? "").trim();
  if (!milestone) {
    return;
  }

  const profile = await prisma.studentProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) {
    return;
  }

  const current = await prisma.projectProgress.findUnique({ where: { projectId } });
  const milestones = [...parseJsonArray(current?.milestones), { content: milestone, done: false }];

  await prisma.projectProgress.upsert({
    where: { projectId },
    update: { milestones },
    create: {
      projectId,
      studentId: profile.id,
      status: ProgressStatus.IN_PROGRESS,
      milestones,
      updates: [],
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  revalidatePath("/student/my-projects");
}

async function submitDeliverable(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return;
  }

  const projectId = String(formData.get("projectId") ?? "");
  const deliverableUrl = String(formData.get("deliverableUrl") ?? "").trim();

  const progress = await prisma.projectProgress.findUnique({ where: { projectId } });
  if (!progress) {
    return;
  }

  await prisma.projectProgress.update({
    where: { projectId },
    data: {
      deliverableUrl: deliverableUrl || null,
      status: ProgressStatus.SUBMITTED,
    },
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { status: ProjectStatus.SUBMITTED },
  });

  revalidatePath("/student/my-projects");
}

async function submitSmeEvaluation(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return;
  }

  const projectId = String(formData.get("projectId") ?? "");
  const evaluateeId = String(formData.get("evaluateeId") ?? "");

  await prisma.evaluation.create({
    data: {
      projectId,
      evaluatorId: session.user.id,
      evaluateeId,
      type: EvalType.STUDENT_TO_SME,
      outputQuality: Number(formData.get("outputQuality") ?? 3),
      onTime: Number(formData.get("onTime") ?? 3),
      proactiveness: Number(formData.get("proactiveness") ?? 3),
      communication: Number(formData.get("communication") ?? 3),
      overallFit: Number(formData.get("overallFit") ?? 3),
      comment: String(formData.get("comment") ?? "") || null,
    },
  });

  revalidatePath("/student/my-projects");
}

export default async function StudentMyProjectsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      applications: {
        where: { status: "ACCEPTED" },
        include: {
          project: {
            include: {
              progress: true,
              sme: { include: { user: true } },
            },
          },
        },
      },
    },
  });

  const projects = profile?.applications ?? [];

  return (
    <div className="page-stack fade-in">
      <div>
        <h2 className="section-title">Dự án đang tham gia</h2>
        <p className="section-subtitle">Cập nhật tiến độ, milestone và nộp bàn giao trực tiếp tại đây.</p>
      </div>

      <div className="grid gap-4">
        {projects.map((application) => {
          const project = application.project;
          const milestones = parseJsonArray(project.progress?.milestones);
          const updates = parseJsonArray(project.progress?.updates);

          return (
            <Card className="space-y-4" key={application.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-ink-900">{project.title}</h3>
                  <p className="text-sm text-ink-600">Doanh nghiệp: {project.sme.companyName}</p>
                </div>
                <Badge tone={project.status === "COMPLETED" ? "success" : project.status === "SUBMITTED" ? "warning" : "info"}>{project.status}</Badge>
              </div>

              <div className="grid gap-2 text-sm text-ink-600 md:grid-cols-2">
                <p>
                  <span className="font-semibold text-ink-900">Tiến độ:</span> {project.progress?.status ?? "NOT_STARTED"}
                </p>
                <p>
                  <span className="font-semibold text-ink-900">Deadline:</span>{" "}
                  {project.progress?.deadline ? new Date(project.progress.deadline).toLocaleDateString("vi-VN") : "Chưa đặt"}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <form action={addMilestone} className="space-y-2 rounded-md border border-ink-100 bg-ink-50/40 p-3">
                  <input name="projectId" type="hidden" value={project.id} />
                  <label className="text-sm font-semibold text-ink-700">Thêm milestone</label>
                  <input className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm" name="milestone" />
                  <Button size="sm" type="submit" variant="secondary">
                    Thêm
                  </Button>
                </form>

                <form action={addProgressUpdate} className="space-y-2 rounded-md border border-ink-100 bg-ink-50/40 p-3">
                  <input name="projectId" type="hidden" value={project.id} />
                  <label className="text-sm font-semibold text-ink-700">Cập nhật tiến độ ngắn</label>
                  <input className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm" name="content" />
                  <Button size="sm" type="submit" variant="secondary">
                    Gửi cập nhật
                  </Button>
                </form>
              </div>

              <form action={submitDeliverable} className="space-y-2 rounded-md border border-ink-100 bg-ink-50/40 p-3">
                <input name="projectId" type="hidden" value={project.id} />
                <label className="text-sm font-semibold text-ink-700">Link bàn giao</label>
                <input
                  className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm"
                  defaultValue={project.progress?.deliverableUrl ?? ""}
                  name="deliverableUrl"
                  type="url"
                />
                <Button size="sm" type="submit">
                  Nộp sản phẩm (Submitted)
                </Button>
              </form>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-500">Milestones</h4>
                  <ul className="mt-1 space-y-1 text-sm text-ink-700">
                    {milestones.map((item, index) => (
                      <li className="rounded-md border border-ink-100 bg-white px-3 py-2" key={index}>
                        {formatListItem(item)}
                      </li>
                    ))}
                    {!milestones.length ? <li className="text-ink-500">Chưa có milestone.</li> : null}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-500">Updates</h4>
                  <ul className="mt-1 space-y-1 text-sm text-ink-700">
                    {updates.map((item, index) => (
                      <li className="rounded-md border border-ink-100 bg-white px-3 py-2" key={index}>
                        {formatListItem(item)}
                      </li>
                    ))}
                    {!updates.length ? <li className="text-ink-500">Chưa có cập nhật.</li> : null}
                  </ul>
                </div>
              </div>

              {project.status === "COMPLETED" ? (
                <form action={submitSmeEvaluation} className="space-y-3 rounded-md border border-ink-100 bg-ink-50/40 p-3">
                  <input name="projectId" type="hidden" value={project.id} />
                  <input name="evaluateeId" type="hidden" value={project.sme.userId} />
                  <p className="text-sm font-semibold text-ink-700">Đánh giá SME</p>

                  <label className="text-xs text-ink-500">Mô tả rõ ràng</label>
                  <Rating label="Mô tả rõ ràng" name="outputQuality" />

                  <label className="text-xs text-ink-500">Phản hồi kịp thời</label>
                  <Rating label="Phản hồi kịp thời" name="onTime" />

                  <label className="text-xs text-ink-500">Trải nghiệm hợp tác</label>
                  <Rating label="Trải nghiệm hợp tác" name="overallFit" />

                  <input name="proactiveness" type="hidden" value={3} />
                  <input name="communication" type="hidden" value={3} />

                  <textarea className="min-h-20 w-full rounded-md border border-ink-200 bg-white p-2 text-sm" name="comment" placeholder="Phản hồi thêm" />

                  <Button size="sm" type="submit">
                    Gửi đánh giá SME
                  </Button>
                </form>
              ) : null}
            </Card>
          );
        })}

        {!projects.length ? <Card tone="muted">Bạn chưa tham gia dự án nào.</Card> : null}
      </div>
    </div>
  );
}
