import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

const statusTone: Record<string, "neutral" | "info" | "success" | "warning" | "danger"> = {
  OPEN: "info",
  IN_PROGRESS: "warning",
  SUBMITTED: "neutral",
  COMPLETED: "success",
};

export default async function SmeProjectsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SME") {
    redirect("/login");
  }

  const profile = await prisma.sMEProfile.findUnique({ where: { userId: session.user.id } });

  const projects = profile
    ? await prisma.project.findMany({
        where: { smeId: profile.id },
        include: { _count: { select: { applications: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="page-stack fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="section-title">Dự án của doanh nghiệp</h2>
          <p className="section-subtitle">Quản lý trạng thái từng dự án và số lượng hồ sơ ứng tuyển.</p>
        </div>
        <Link href="/sme/projects/new">
          <Button>Tạo dự án</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <Card className="space-y-4" key={project.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-ink-900">{project.title}</h3>
                <p className="mt-1 text-sm text-ink-600">{project.description}</p>
              </div>
              <Badge tone={statusTone[project.status] ?? "neutral"}>{project.status}</Badge>
            </div>

            <div className="grid gap-3 text-sm text-ink-600 md:grid-cols-3">
              <p>
                <span className="font-semibold text-ink-900">Ứng viên:</span> {project._count.applications}
              </p>
              <p>
                <span className="font-semibold text-ink-900">Deadline:</span>{" "}
                {project.deadline ? new Date(project.deadline).toLocaleDateString("vi-VN") : "Chưa đặt"}
              </p>
              <p>
                <span className="font-semibold text-ink-900">Độ khó:</span> {project.difficulty}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={`/sme/projects/${project.id}`}>
                <Button size="sm" variant="secondary">
                  Chi tiết
                </Button>
              </Link>
              <Link href={`/sme/projects/${project.id}/candidates`}>
                <Button size="sm">Xem ứng viên</Button>
              </Link>
            </div>
          </Card>
        ))}

        {!projects.length ? (
          <Card className="space-y-2 text-center" tone="muted">
            <h3 className="text-lg font-bold text-ink-900">Chưa có dự án nào</h3>
            <p className="text-sm text-ink-600">Tạo dự án đầu tiên để bắt đầu tìm ứng viên phù hợp bằng AI matching.</p>
            <Link className="mx-auto" href="/sme/projects/new">
              <Button size="sm">Tạo dự án ngay</Button>
            </Link>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
