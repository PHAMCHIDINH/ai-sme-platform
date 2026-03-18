import { ApplicationStatus, ProgressStatus, ProjectStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { rankBySimilarity } from "@/lib/matching";
import { prisma } from "@/lib/prisma";
import { formatPercent } from "@/lib/utils";

async function updateCandidateStatus(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SME") {
    return;
  }

  const projectId = String(formData.get("projectId") ?? "");
  const studentId = String(formData.get("studentId") ?? "");
  const status = String(formData.get("status") ?? "") as ApplicationStatus;
  const matchScore = Number(formData.get("matchScore") ?? 0);

  await prisma.application.upsert({
    where: { projectId_studentId: { projectId, studentId } },
    update: { status, matchScore },
    create: { projectId, studentId, status, matchScore },
  });

  if (status === "ACCEPTED") {
    await prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.IN_PROGRESS },
    });

    await prisma.projectProgress.upsert({
      where: { projectId },
      update: { studentId, status: ProgressStatus.IN_PROGRESS },
      create: {
        projectId,
        studentId,
        status: ProgressStatus.IN_PROGRESS,
        milestones: [],
        updates: [],
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });
  }

  revalidatePath(`/sme/projects/${projectId}/candidates`);
  revalidatePath(`/sme/projects/${projectId}`);
}

export default async function ProjectCandidatesPage({ params }: { params: { id: string } }) {
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
    include: { applications: true },
  });

  if (!project) {
    redirect("/sme/projects");
  }

  const students = await prisma.studentProfile.findMany({
    where: { NOT: { embedding: { equals: [] } } },
    include: { user: true },
  });

  const ranked = rankBySimilarity(project.embedding, students, 10);

  return (
    <div className="page-stack fade-in">
      <div>
        <h2 className="section-title">Ứng viên đề xuất</h2>
        <p className="section-subtitle">Dự án: {project.title}</p>
      </div>

      <div className="grid gap-4">
        {ranked.map((student) => {
          const existing = project.applications.find((item) => item.studentId === student.id);

          return (
            <Card className="space-y-4" key={student.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-ink-900">{student.user.name}</h3>
                  <p className="text-sm text-ink-600">
                    {student.major} - {student.university}
                  </p>
                </div>
                <Badge tone="success">{formatPercent(student.matchScore)}</Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {student.skills.slice(0, 6).map((skill) => (
                  <Badge key={`${student.id}-${skill}`} tone="neutral">
                    {skill}
                  </Badge>
                ))}
              </div>

              {student.githubUrl ? (
                <a className="inline-flex text-sm font-semibold text-brand-700" href={student.githubUrl} rel="noreferrer" target="_blank">
                  Xem GitHub profile
                </a>
              ) : null}

              <div className="flex flex-wrap items-center gap-2">
                <form action={updateCandidateStatus}>
                  <input name="projectId" type="hidden" value={project.id} />
                  <input name="studentId" type="hidden" value={student.id} />
                  <input name="matchScore" type="hidden" value={student.matchScore} />
                  <input name="status" type="hidden" value="ACCEPTED" />
                  <Button size="sm" type="submit">
                    Chấp nhận
                  </Button>
                </form>

                <form action={updateCandidateStatus}>
                  <input name="projectId" type="hidden" value={project.id} />
                  <input name="studentId" type="hidden" value={student.id} />
                  <input name="matchScore" type="hidden" value={student.matchScore} />
                  <input name="status" type="hidden" value="REJECTED" />
                  <Button size="sm" type="submit" variant="danger">
                    Từ chối
                  </Button>
                </form>

                {existing ? <Badge tone={existing.status === "ACCEPTED" ? "success" : existing.status === "REJECTED" ? "danger" : "warning"}>{existing.status}</Badge> : null}
              </div>
            </Card>
          );
        })}

        {!ranked.length ? (
          <Card className="text-sm text-ink-600" tone="muted">
            Chưa có dữ liệu embedding để matching. Vui lòng yêu cầu sinh viên cập nhật hồ sơ năng lực.
          </Card>
        ) : null}
      </div>
    </div>
  );
}
