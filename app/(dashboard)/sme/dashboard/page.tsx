import Link from "next/link";
import { ProjectStatus } from "@prisma/client";
import { Building2, Clock, FolderKanban, PlusCircle, Users } from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/retroui/Button";
import { EmptyState, MetricCard, PageHeader, SectionCard, StatusChip } from "@/components/patterns/b2b";
import { getSessionUserIdByRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

function projectStatusLabel(status: ProjectStatus) {
  switch (status) {
    case "OPEN":
      return "Đang mở";
    case "IN_PROGRESS":
      return "Đang tiến hành";
    case "SUBMITTED":
      return "Chờ nghiệm thu";
    case "COMPLETED":
      return "Hoàn thành";
    default:
      return "Nháp";
  }
}

function projectStatusTone(status: ProjectStatus) {
  if (status === "COMPLETED") return "success" as const;
  if (status === "SUBMITTED") return "warning" as const;
  if (status === "IN_PROGRESS") return "brand" as const;
  return "neutral" as const;
}

export default async function SMEDashboardPage() {
  const session = await auth();
  const smeUserId = getSessionUserIdByRole(session, "SME");

  if (!smeUserId) {
    return <div>Unauthorized</div>;
  }

  const smeProfile = await prisma.sMEProfile.findUnique({
    where: { userId: smeUserId },
    select: {
      id: true,
      companyName: true,
      _count: {
        select: {
          projects: true,
        },
      },
    },
  });

  if (!smeProfile) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Bảng điều phối doanh nghiệp"
          title="Thiết lập hồ sơ doanh nghiệp trước khi đăng dự án đầu tiên."
          description="Thông tin hồ sơ được dùng để quản lý project và điều phối ứng viên trong dashboard."
        />

        <EmptyState
          icon={Building2}
          title="Bạn chưa tạo hồ sơ doanh nghiệp"
          description="Cập nhật thông tin công ty để bắt đầu đăng dự án, nhận ứng viên và theo dõi tiến độ trong cùng một quy trình."
          action={
            <Button asChild>
              <Link href="/sme/profile">Tạo hồ sơ doanh nghiệp</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const [activeProjects, totalApplicants, recentProjects] = await Promise.all([
    prisma.project.count({
      where: {
        smeId: smeProfile.id,
        status: { in: ["IN_PROGRESS", "SUBMITTED"] },
      },
    }),
    prisma.application.count({
      where: {
        project: { smeId: smeProfile.id },
      },
    }),
    prisma.project.findMany({
      where: { smeId: smeProfile.id },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        _count: {
          select: { applications: true },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={smeProfile.companyName || "Bảng điều phối doanh nghiệp"}
        title="Theo dõi project, ứng viên và trạng thái nghiệm thu trong cùng một dashboard."
        description="Toàn bộ luồng từ tạo brief, mở dự án, nhận ứng viên đến theo dõi tiến độ được gom về một không gian làm việc thống nhất."
        actions={
          <Button asChild>
            <Link href="/sme/projects/new">
              <PlusCircle className="h-4 w-4" />
              Tạo dự án mới
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Tổng dự án"
          value={smeProfile._count.projects}
          description="Tất cả project doanh nghiệp đã tạo"
          icon={FolderKanban}
          tone="brand"
        />
        <MetricCard
          label="Đang triển khai"
          value={activeProjects}
          description="Bao gồm đang thực hiện và chờ nghiệm thu"
          icon={Clock}
          tone="warning"
        />
        <MetricCard
          label="Ứng viên đã nhận"
          value={totalApplicants}
          description="Tổng số lượt ứng tuyển trên các project"
          icon={Users}
          tone="neutral"
        />
      </div>

      <SectionCard
        title="Dự án gần đây"
        description="Các project mới nhất của doanh nghiệp và tình trạng hiện tại."
        action={
          <Button asChild size="sm" variant="outline">
            <Link href="/sme/projects">Xem tất cả</Link>
          </Button>
        }
      >
        {recentProjects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="Chưa có dự án nào"
            description="Bắt đầu bằng một project đầu tiên để trải nghiệm toàn bộ luồng chuẩn hóa brief và nhận ứng viên."
            action={
              <Button asChild>
                <Link href="/sme/projects/new">Tạo dự án đầu tiên</Link>
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-border-subtle overflow-hidden rounded-2xl border border-border-subtle">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col gap-4 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <Link href={`/sme/projects/${project.id}`} className="text-sm font-semibold text-text-strong hover:text-primary">
                    {project.title}
                  </Link>
                  <p className="text-sm text-text-muted">
                    Tạo ngày {new Date(project.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusChip tone={projectStatusTone(project.status)}>{projectStatusLabel(project.status)}</StatusChip>
                  <span className="text-sm text-text-muted">{project._count.applications} ứng viên</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
