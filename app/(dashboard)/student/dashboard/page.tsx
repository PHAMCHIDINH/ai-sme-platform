import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function StudentDashboardPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: { applications: { include: { project: true } } },
  });

  const activeProjects =
    profile?.applications.filter(
      (application) =>
        application.status === "ACCEPTED" &&
        ["IN_PROGRESS", "SUBMITTED", "COMPLETED"].includes(application.project.status),
    ).length ?? 0;

  const completedProjects =
    profile?.applications.filter(
      (application) => application.status === "ACCEPTED" && application.project.status === "COMPLETED",
    ).length ?? 0;

  const evaluations = await prisma.evaluation.findMany({
    where: { evaluateeId: session.user.id, type: "SME_TO_STUDENT" },
  });

  const avgScore = evaluations.length
    ? evaluations.reduce((sum, evaluation) => sum + evaluation.overallFit, 0) / evaluations.length
    : 0;

  return (
    <div className="page-stack fade-in">
      <div>
        <h2 className="section-title">Dashboard Sinh viên</h2>
        <p className="section-subtitle">Theo dõi hành trình thực chiến và tín hiệu đánh giá từ doanh nghiệp.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card tone="highlight">
          <p className="text-sm font-medium text-ink-500">Dự án đang tham gia</p>
          <p className="stat-value">{activeProjects}</p>
        </Card>
        <Card tone="highlight">
          <p className="text-sm font-medium text-ink-500">Dự án đã hoàn thành</p>
          <p className="stat-value">{completedProjects}</p>
        </Card>
        <Card tone="highlight">
          <p className="text-sm font-medium text-ink-500">Điểm đánh giá trung bình</p>
          <p className="stat-value">{avgScore.toFixed(1)}</p>
        </Card>
      </section>
    </div>
  );
}
