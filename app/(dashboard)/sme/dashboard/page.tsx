import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function SmeDashboardPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SME") {
    redirect("/login");
  }

  const profile = await prisma.sMEProfile.findUnique({
    where: { userId: session.user.id },
    include: { projects: { include: { applications: true } } },
  });

  const totalProjects = profile?.projects.length ?? 0;
  const openProjects = profile?.projects.filter((project) => project.status === "OPEN").length ?? 0;
  const totalApplications =
    profile?.projects.reduce((sum, project) => sum + project.applications.length, 0) ?? 0;

  return (
    <div className="page-stack fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="section-title">Dashboard Doanh nghiệp</h2>
          <p className="section-subtitle">Theo dõi nhanh pipeline dự án và ứng viên đang xử lý.</p>
        </div>
        <Link href="/sme/projects/new">
          <Button>Tạo dự án mới</Button>
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card tone="highlight">
          <p className="text-sm font-medium text-ink-500">Tổng dự án</p>
          <p className="stat-value">{totalProjects}</p>
        </Card>
        <Card tone="highlight">
          <p className="text-sm font-medium text-ink-500">Dự án đang mở</p>
          <p className="stat-value">{openProjects}</p>
        </Card>
        <Card tone="highlight">
          <p className="text-sm font-medium text-ink-500">Tổng hồ sơ ứng viên</p>
          <p className="stat-value">{totalApplications}</p>
        </Card>
      </section>

      <Card className="space-y-3" tone="muted">
        <h3 className="text-xl font-bold text-ink-900">Bước tiếp theo đề xuất</h3>
        <p className="text-sm text-ink-600">Chuẩn hóa brief bằng AI trước khi mở tuyển để tăng độ chính xác của matching.</p>
        <Link href="/sme/projects/new">
          <Button size="sm" variant="secondary">
            Đăng dự án ngay
          </Button>
        </Link>
      </Card>
    </div>
  );
}
