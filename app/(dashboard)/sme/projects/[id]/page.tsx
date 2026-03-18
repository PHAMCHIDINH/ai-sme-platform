import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

function formatProgressItem(item: unknown) {
  if (!item || typeof item !== "object") {
    return String(item ?? "");
  }

  const record = item as Record<string, unknown>;
  if (typeof record.content === "string") {
    return record.content;
  }

  return JSON.stringify(item);
}

const statusTone: Record<string, "neutral" | "info" | "success" | "warning" | "danger"> = {
  OPEN: "info",
  IN_PROGRESS: "warning",
  SUBMITTED: "neutral",
  COMPLETED: "success",
  ACCEPTED: "success",
  REJECTED: "danger",
  PENDING: "warning",
};

async function markAsCompleted(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SME") {
    return;
  }

  const projectId = String(formData.get("projectId") ?? "");

  await prisma.project.update({
    where: { id: projectId },
    data: { status: "COMPLETED" },
  });

  await prisma.projectProgress.updateMany({
    where: { projectId },
    data: { status: "COMPLETED" },
  });

  revalidatePath(`/sme/projects/${projectId}`);
  revalidatePath(`/sme/projects/${projectId}/evaluate`);
}

export default async function SmeProjectDetailPage({ params }: { params: { id: string } }) {
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
        include: { student: { include: { user: true } } },
      },
      progress: true,
      evaluations: true,
    },
  });

  if (!project) {
    redirect("/sme/projects");
  }

  const updates = Array.isArray(project.progress?.updates) ? project.progress?.updates : [];
  const milestones = Array.isArray(project.progress?.milestones) ? project.progress?.milestones : [];

  return (
    <div className="page-stack fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="section-title">{project.title}</h2>
          <p className="section-subtitle">Quản trị trạng thái dự án, ứng viên và bàn giao.</p>
        </div>
        <Badge tone={statusTone[project.status] ?? "neutral"}>{project.status}</Badge>
      </div>

      <Card className="space-y-4" padding="lg">
        <p className="text-sm text-ink-700">{project.description}</p>
        {project.standardizedBrief ? (
          <div className="rounded-md border border-brand-100 bg-brand-50/70 p-3 text-sm text-ink-700 whitespace-pre-wrap">{project.standardizedBrief}</div>
        ) : null}

        <div className="grid gap-2 text-sm text-ink-600 md:grid-cols-3">
          <p>
            <span className="font-semibold text-ink-900">Đầu ra:</span> {project.expectedOutput}
          </p>
          <p>
            <span className="font-semibold text-ink-900">Thời gian:</span> {project.duration}
          </p>
          <p>
            <span className="font-semibold text-ink-900">Ngân sách:</span> {project.budget ?? "Chưa đặt"}
          </p>
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-bold text-ink-900">Ứng viên</h3>
          <Link href={`/sme/projects/${project.id}/candidates`}>
            <Button size="sm" variant="secondary">
              Xem matching
            </Button>
          </Link>
        </div>

        <div className="space-y-2 text-sm text-ink-600">
          {project.applications.map((application) => (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-ink-100 bg-ink-50/40 px-3 py-2" key={application.id}>
              <span className="font-semibold text-ink-900">{application.student.user.name}</span>
              <Badge tone={statusTone[application.status] ?? "neutral"}>{application.status}</Badge>
            </div>
          ))}
          {!project.applications.length ? <p className="text-ink-500">Chưa có ứng viên.</p> : null}
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="text-xl font-bold text-ink-900">Tiến độ dự án</h3>

        <div className="grid gap-2 text-sm text-ink-600 md:grid-cols-2">
          <p>
            <span className="font-semibold text-ink-900">Trạng thái:</span> {project.progress?.status ?? "NOT_STARTED"}
          </p>
          <p>
            <span className="font-semibold text-ink-900">Deadline:</span>{" "}
            {project.progress?.deadline ? new Date(project.progress.deadline).toLocaleDateString("vi-VN") : "Chưa đặt"}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-500">Milestones</h4>
            <ul className="mt-2 space-y-1 text-sm text-ink-700">
              {milestones.map((milestone, index) => (
                <li className="rounded-md border border-ink-100 bg-white px-3 py-2" key={index}>
                  {formatProgressItem(milestone)}
                </li>
              ))}
              {!milestones.length ? <li className="text-ink-500">Chưa có milestone.</li> : null}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-500">Cập nhật</h4>
            <ul className="mt-2 space-y-1 text-sm text-ink-700">
              {updates.map((update, index) => (
                <li className="rounded-md border border-ink-100 bg-white px-3 py-2" key={index}>
                  {formatProgressItem(update)}
                </li>
              ))}
              {!updates.length ? <li className="text-ink-500">Chưa có cập nhật.</li> : null}
            </ul>
          </div>
        </div>

        {project.progress?.deliverableUrl ? (
          <a className="inline-flex w-fit rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700" href={project.progress.deliverableUrl} rel="noreferrer" target="_blank">
            Xem link bàn giao
          </a>
        ) : null}

        {project.status === "SUBMITTED" ? (
          <form action={markAsCompleted}>
            <input name="projectId" type="hidden" value={project.id} />
            <Button type="submit" variant="success">
              Chấp nhận bàn giao (Completed)
            </Button>
          </form>
        ) : null}
      </Card>

      <Link href={`/sme/projects/${project.id}/evaluate`}>
        <Button variant="secondary">Đi đến trang đánh giá</Button>
      </Link>
    </div>
  );
}
