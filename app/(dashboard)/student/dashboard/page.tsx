import Link from "next/link";
import { Award, Code2, FolderKanban, Layers, Star } from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/retroui/Button";
import { MetricCard, PageHeader, SectionCard } from "@/components/patterns/b2b";
import { getSessionUserIdByRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function StudentDashboardPage() {
  const session = await auth();
  const studentUserId = getSessionUserIdByRole(session, "STUDENT");
  if (!studentUserId) return <div>Unauthorized</div>;

  let profile:
    | {
        skills: string[];
        _count: { applications: number };
        progressEntries: { status: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED" }[];
      }
    | null = null;
  let avgRating = "Chưa có";

  try {
    const [profileResult, evaluationSummary] = await Promise.all([
      prisma.studentProfile.findUnique({
        where: { userId: studentUserId },
        select: {
          skills: true,
          _count: {
            select: {
              applications: true,
            },
          },
          progressEntries: {
            select: {
              status: true,
            },
          },
        },
      }),
      prisma.evaluation.aggregate({
        where: { evaluateeId: studentUserId, type: "SME_TO_STUDENT" },
        _avg: {
          overallFit: true,
        },
        _count: {
          overallFit: true,
        },
      }),
    ]);

    profile = profileResult;
    avgRating =
      evaluationSummary._count.overallFit > 0 && evaluationSummary._avg.overallFit !== null
        ? evaluationSummary._avg.overallFit.toFixed(1)
        : "Chưa có";
  } catch (error) {
    console.error("StudentDashboardPage load error:", error);
  }

  const activeProjects = profile?.progressEntries.filter((p) => p.status !== "COMPLETED").length || 0;
  const completedProjects = profile?.progressEntries.filter((p) => p.status === "COMPLETED").length || 0;
  const profileCompletion = profile?.skills.length ? 80 : 30;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Bảng điều phối cá nhân"
        title="Theo dõi cơ hội phù hợp, project đang làm và mức độ hoàn thiện hồ sơ của bạn."
        description="Dashboard này tập trung vào các tín hiệu giúp bạn biết mình đang ở đâu trong quá trình phát triển năng lực thực chiến."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Đang thực hiện"
          value={activeProjects}
          description="Các project chưa hoàn tất"
          icon={Layers}
          tone="brand"
        />
        <MetricCard
          label="Đã ứng tuyển"
          value={profile?._count.applications || 0}
          description="Tổng số lần gửi ứng tuyển"
          icon={FolderKanban}
          tone="neutral"
        />
        <MetricCard
          label="Đã hoàn thành"
          value={completedProjects}
          description="Các đầu việc đã hoàn tất"
          icon={Award}
          tone="success"
        />
        <MetricCard
          label="Đánh giá trung bình"
          value={
            <span>
              {avgRating}
              <span className="ml-1 text-sm font-medium text-text-muted">/ 5.0</span>
            </span>
          }
          description="Điểm từ SME sau các lần hợp tác"
          icon={Star}
          tone="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Dự án gợi ý mới nhất"
          description="Các cơ hội phù hợp hơn sẽ xuất hiện khi hồ sơ và kỹ năng của bạn được cập nhật rõ ràng."
          action={
            <Button asChild size="sm" variant="outline">
              <Link href="/student/projects">Xem danh sách</Link>
            </Button>
          }
        >
          <div className="surface-card-muted flex min-h-[220px] flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-2xl border border-border-subtle bg-white p-4 shadow-neo-sm">
              <Code2 className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-base font-semibold text-text-strong">Hệ thống đang gợi ý project phù hợp với hồ sơ của bạn</p>
              <p className="max-w-md text-sm leading-7 text-text-muted">
                Xem danh sách dự án để kiểm tra các bài toán đang mở, mức độ phù hợp và thông tin từ doanh nghiệp.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Mức độ hoàn thiện hồ sơ"
          description="Hồ sơ càng rõ, matching và khả năng được mời càng tốt hơn."
          action={
            !profile?.skills.length ? (
              <Button asChild size="sm">
                <Link href="/student/profile">Cập nhật hồ sơ</Link>
              </Button>
            ) : null
          }
        >
          <div className="space-y-4">
            <div className="surface-card-muted p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-text-muted">Độ hoàn thiện hiện tại</span>
                <span className="text-sm font-semibold text-primary">{profileCompletion}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-primary" style={{ width: `${profileCompletion}%` }} />
              </div>
            </div>
            <p className="text-sm leading-7 text-text-muted">
              Khi kỹ năng, định hướng và thông tin hồ sơ được điền đầy đủ hơn, hệ thống sẽ có thêm tín hiệu để gợi ý project sát hơn.
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
