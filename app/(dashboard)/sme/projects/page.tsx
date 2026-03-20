import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { CalendarDays, FolderKanban, PlusCircle, Users } from "lucide-react";

import { auth } from "@/auth";
import { EmptyState, PageHeader, StatusChip } from "@/components/patterns/b2b";
import { Badge } from "@/components/retroui/Badge";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/retroui/Card";
import { getSessionUserIdByRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

function projectStatusTone(status: string) {
  if (status === "COMPLETED") return "success" as const;
  if (status === "SUBMITTED") return "warning" as const;
  if (status === "IN_PROGRESS") return "brand" as const;
  return "neutral" as const;
}

function projectStatusLabel(status: string) {
  if (status === "OPEN") return "Đang mở";
  if (status === "IN_PROGRESS") return "Đang tiến hành";
  if (status === "SUBMITTED") return "Chờ nghiệm thu";
  if (status === "COMPLETED") return "Hoàn thành";
  return "Nháp";
}

export default async function SMEProjectsPage() {
  const session = await auth();
  const smeUserId = getSessionUserIdByRole(session, "SME");

  if (!smeUserId) {
    return <div>Unauthorized</div>;
  }

  const smeProfile = await prisma.sMEProfile.findUnique({
    where: { userId: smeUserId },
  });

  const projects = smeProfile
    ? await prisma.project.findMany({
        where: { smeId: smeProfile.id },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { applications: true } } },
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Danh sách dự án"
        title="Quản lý project theo trạng thái, ứng viên và thời gian cập nhật."
        description="Mỗi project hiển thị thông tin đủ để bạn nhanh chóng xác định tình trạng hiện tại và hành động tiếp theo."
        actions={
          <Button asChild>
            <Link href="/sme/projects/new">
              <PlusCircle className="h-4 w-4" />
              Tạo dự án mới
            </Link>
          </Button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Chưa có dự án nào"
          description="Khi bạn tạo project đầu tiên, hệ thống sẽ dùng luồng chuẩn hóa brief và danh sách ứng viên để hỗ trợ điều phối."
          action={
            <Button asChild>
              <Link href="/sme/projects/new">Tạo dự án đầu tiên</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="bg-white">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <StatusChip tone={projectStatusTone(project.status)}>{projectStatusLabel(project.status)}</StatusChip>
                  <div className="inline-flex items-center gap-1 text-xs text-text-muted">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true, locale: vi })}
                  </div>
                </div>
                <div className="space-y-2">
                  <CardTitle className="line-clamp-2">{project.title}</CardTitle>
                  <p className="line-clamp-3 text-sm leading-7 text-text-muted">{project.description}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {project.requiredSkills.slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="outline" className="bg-surface-muted text-text-muted">
                      {skill}
                    </Badge>
                  ))}
                  {project.requiredSkills.length > 4 ? (
                    <Badge variant="outline" className="bg-surface-muted text-text-muted">
                      +{project.requiredSkills.length - 4}
                    </Badge>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-4 rounded-2xl border border-border-subtle bg-surface-muted px-4 py-3">
                  <div>
                    <div className="detail-kicker">Ứng viên</div>
                    <div className="mt-1 text-sm font-semibold text-text-strong">{project._count.applications} hồ sơ</div>
                  </div>
                  <Users className="h-4 w-4 text-text-muted" />
                </div>

                <Button asChild className="w-full" variant="outline">
                  <Link href={`/sme/projects/${project.id}`}>Xem chi tiết</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
