import { ApplicationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { rankBySimilarity } from "@/lib/matching";
import { prisma } from "@/lib/prisma";
import { formatPercent } from "@/lib/utils";

async function applyProject(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return;
  }

  const profile = await prisma.studentProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) {
    return;
  }

  const projectId = String(formData.get("projectId") ?? "");
  const matchScore = Number(formData.get("matchScore") ?? 0);

  await prisma.application.upsert({
    where: { projectId_studentId: { projectId, studentId: profile.id } },
    update: { status: ApplicationStatus.PENDING, matchScore },
    create: {
      projectId,
      studentId: profile.id,
      status: ApplicationStatus.PENDING,
      matchScore,
    },
  });

  revalidatePath("/student/projects");
  revalidatePath("/student/my-projects");
}

export default async function StudentProjectsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: { applications: true },
  });

  if (!profile) {
    redirect("/student/profile");
  }

  const projects = await prisma.project.findMany({
    where: { status: "OPEN" },
    include: { sme: true },
  });

  const ranked = rankBySimilarity(profile.embedding, projects, 20);

  return (
    <div className="page-stack fade-in">
      <div>
        <h2 className="section-title">Dự án gợi ý cho bạn</h2>
        <p className="section-subtitle">Sắp xếp theo độ phù hợp giữa hồ sơ năng lực của bạn và yêu cầu của dự án.</p>
      </div>

      {!profile.embedding.length ? (
        <Card className="text-sm text-warning-700" tone="muted">
          Bạn cần cập nhật hồ sơ năng lực để hệ thống tạo embedding matching chính xác hơn.
        </Card>
      ) : null}

      <div className="grid gap-4">
        {ranked.map((project) => {
          const applied = profile.applications.find((application) => application.projectId === project.id);

          return (
            <Card className="space-y-4" key={project.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-ink-900">{project.title}</h3>
                  <p className="text-sm text-ink-600">{project.description}</p>
                </div>
                <Badge tone="success">{formatPercent(project.matchScore)}</Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {project.requiredSkills.map((skill) => (
                  <Badge key={`${project.id}-${skill}`} tone="neutral">
                    {skill}
                  </Badge>
                ))}
              </div>

              <p className="text-sm text-ink-600">
                <span className="font-semibold text-ink-900">Doanh nghiệp:</span> {project.sme.companyName}
              </p>

              {applied ? (
                <Badge tone={applied.status === "ACCEPTED" ? "success" : applied.status === "REJECTED" ? "danger" : "warning"}>{applied.status}</Badge>
              ) : (
                <form action={applyProject}>
                  <input name="projectId" type="hidden" value={project.id} />
                  <input name="matchScore" type="hidden" value={project.matchScore} />
                  <Button size="sm" type="submit">
                    Ứng tuyển
                  </Button>
                </form>
              )}
            </Card>
          );
        })}

        {!ranked.length ? (
          <Card className="text-sm text-ink-600" tone="muted">
            Chưa có dự án OPEN hoặc chưa đủ dữ liệu embedding để gợi ý.
          </Card>
        ) : null}
      </div>
    </div>
  );
}
