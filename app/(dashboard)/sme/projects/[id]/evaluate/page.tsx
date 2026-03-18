import { EvalType, ProjectStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rating } from "@/components/ui/rating";
import { prisma } from "@/lib/prisma";

async function submitEvaluation(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SME") {
    return;
  }

  const projectId = String(formData.get("projectId") ?? "");
  const evaluateeId = String(formData.get("evaluateeId") ?? "");

  await prisma.evaluation.create({
    data: {
      projectId,
      evaluatorId: session.user.id,
      evaluateeId,
      type: EvalType.SME_TO_STUDENT,
      outputQuality: Number(formData.get("outputQuality") ?? 3),
      onTime: Number(formData.get("onTime") ?? 3),
      proactiveness: Number(formData.get("proactiveness") ?? 3),
      communication: Number(formData.get("communication") ?? 3),
      overallFit: Number(formData.get("overallFit") ?? 3),
      comment: String(formData.get("comment") ?? "") || null,
    },
  });

  revalidatePath(`/sme/projects/${projectId}/evaluate`);
  revalidatePath(`/sme/projects/${projectId}`);
}

export default async function ProjectEvaluatePage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SME") {
    redirect("/login");
  }

  const profile = await prisma.sMEProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) {
    redirect("/sme/projects");
  }

  const project = await prisma.project.findFirst({
    where: { id: params.id, smeId: profile.id },
    include: {
      applications: {
        where: { status: "ACCEPTED" },
        include: { student: { include: { user: true } } },
      },
      evaluations: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    redirect("/sme/projects");
  }

  const accepted = project.applications[0];

  return (
    <div className="page-stack fade-in">
      <div>
        <h2 className="section-title">Đánh giá dự án</h2>
        <p className="section-subtitle">Project: {project.title}</p>
      </div>

      {project.status !== ProjectStatus.COMPLETED ? (
        <Card className="text-sm text-warning-700" tone="muted">
          Form đánh giá chỉ hiển thị đầy đủ khi dự án ở trạng thái COMPLETED.
        </Card>
      ) : null}

      {!accepted ? (
        <Card className="text-sm text-ink-600">Chưa có sinh viên được chấp nhận.</Card>
      ) : (
        <Card padding="lg">
          <form action={submitEvaluation} className="space-y-5">
            <input name="projectId" type="hidden" value={project.id} />
            <input name="evaluateeId" type="hidden" value={accepted.student.userId} />

            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Sinh viên được đánh giá</p>
              <p className="mt-1 text-base font-semibold text-ink-900">{accepted.student.user.name}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-ink-700">Chất lượng đầu ra</label>
                <Rating label="Chất lượng đầu ra" name="outputQuality" />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Đúng deadline</label>
                <Rating label="Đúng deadline" name="onTime" />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Mức độ chủ động</label>
                <Rating label="Mức độ chủ động" name="proactiveness" />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Kỹ năng giao tiếp</label>
                <Rating label="Kỹ năng giao tiếp" name="communication" />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Mức độ phù hợp tổng thể</label>
                <Rating label="Mức độ phù hợp" name="overallFit" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700" htmlFor="comment">
                Nhận xét
              </label>
              <textarea className="min-h-24 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-brand-200" id="comment" name="comment" />
            </div>

            <Button type="submit">Gửi đánh giá</Button>
          </form>
        </Card>
      )}

      <Card className="space-y-2">
        <h3 className="text-xl font-bold text-ink-900">Đánh giá đã gửi</h3>
        {project.evaluations.map((evaluation) => (
          <div className="rounded-md border border-ink-100 bg-ink-50/40 p-3 text-sm text-ink-600" key={evaluation.id}>
            <p>
              <span className="font-semibold text-ink-900">Overall fit:</span> {evaluation.overallFit}/5
            </p>
            <p>
              <span className="font-semibold text-ink-900">Nhận xét:</span> {evaluation.comment ?? "(không có)"}
            </p>
          </div>
        ))}
        {!project.evaluations.length ? <p className="text-sm text-ink-500">Chưa có đánh giá.</p> : null}
      </Card>
    </div>
  );
}
