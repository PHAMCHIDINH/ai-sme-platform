import Link from "next/link";
import { Building2, CalendarDays, Sparkles, TriangleAlert } from "lucide-react";

import { auth } from "@/auth";
import { EmptyState, PageHeader, StatusChip } from "@/components/patterns/b2b";
import { Badge } from "@/components/retroui/Badge";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/retroui/Card";
import { rankBySimilarity } from "@/lib/matching";
import { prisma } from "@/lib/prisma";
import { getSessionUserIdByRole } from "@/lib/auth/session";
import { ApplyButton } from "./apply-button";
import { InvitationCard } from "./invitation-card";

type StudentInvitation = {
  id: string;
  projectId: string;
  project: {
    title: string;
    expectedOutput: string;
    budget: string | null;
    duration: string;
    sme: {
      companyName: string;
    };
  };
};

export default async function StudentProjectsPage() {
  const session = await auth();
  const studentUserId = getSessionUserIdByRole(session, "STUDENT");
  if (!studentUserId) return <div>Unauthorized</div>;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: studentUserId },
    select: {
      id: true,
      embedding: true,
    },
  });

  const availableProjects = await prisma.project.findMany({
    where: {
      status: "OPEN",
      ...(profile
        ? {
            applications: {
              none: {
                studentId: profile.id,
              },
            },
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      expectedOutput: true,
      requiredSkills: true,
      duration: true,
      embedding: true,
      sme: {
        select: {
          companyName: true,
        },
      },
    },
  });

  let invitations: StudentInvitation[] = [];
  if (profile) {
    invitations = await prisma.application.findMany({
      where: {
        studentId: profile.id,
        status: "INVITED",
        initiatedBy: "SME",
      },
      include: {
        project: {
          include: {
            sme: true,
          },
        },
      },
    });
  }

  type RankedProject = (typeof availableProjects)[number] & { matchScore: number };
  let rankedProjects: RankedProject[] = [];

  if (profile?.embedding && profile.embedding.length > 0) {
    rankedProjects = rankBySimilarity(profile.embedding, availableProjects) as RankedProject[];
  } else {
    rankedProjects = availableProjects.map((project) => ({ ...project, matchScore: 0 }));
  }

  return (
    <div className="space-y-6">
      {invitations.length > 0 ? (
        <div className="space-y-4">
          <PageHeader
            eyebrow="Lời mời trực tiếp"
            title="Một số doanh nghiệp đã chủ động mời bạn tham gia dự án."
            description="Bạn có thể phản hồi trực tiếp trên từng lời mời mà không cần rời khỏi dashboard."
          />
          <div>
            {invitations.map((invitation) => (
              <InvitationCard key={invitation.id} invitation={invitation} />
            ))}
          </div>
        </div>
      ) : null}

      <PageHeader
        eyebrow="Danh sách project gợi ý"
        title="Các cơ hội được sắp xếp theo mức độ phù hợp với hồ sơ hiện tại của bạn."
        description="Khi hồ sơ có embedding và kỹ năng rõ ràng, hệ thống sẽ xếp hạng dự án phù hợp hơn theo bối cảnh và tín hiệu kỹ năng."
      />

      {!profile?.embedding || profile.embedding.length === 0 ? (
        <div className="surface-card flex items-start gap-4 p-5">
          <div className="rounded-2xl border border-border-subtle bg-yellow-200 p-3 shadow-neo-sm">
            <TriangleAlert className="h-5 w-5 text-warning" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-text-strong">Hồ sơ của bạn chưa đủ tín hiệu để matching chính xác hơn.</p>
            <p className="text-sm leading-7 text-text-muted">
              Hãy cập nhật kỹ năng và thông tin hồ sơ để hệ thống có thể phân tích và gợi ý project sát hơn với năng lực của bạn.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/student/profile">Cập nhật hồ sơ</Link>
            </Button>
          </div>
        </div>
      ) : null}

      {rankedProjects.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Hiện chưa có dự án nào đang mở"
          description="Bạn có thể quay lại sau hoặc tiếp tục hoàn thiện hồ sơ để sẵn sàng nhận gợi ý mới khi có project phù hợp."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rankedProjects.map((project) => (
            <Card key={project.id} className="bg-white">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="inline-flex items-center gap-2 text-sm text-text-muted">
                    <Building2 className="h-4 w-4" />
                    {project.sme.companyName}
                  </div>
                  {project.matchScore > 0 ? (
                    <StatusChip tone={project.matchScore >= 80 ? "success" : "brand"}>
                      {project.matchScore}% phù hợp
                    </StatusChip>
                  ) : null}
                </div>
                <CardTitle className="line-clamp-2">{project.title}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                <p className="line-clamp-3 text-sm leading-7 text-text-muted">{project.expectedOutput}</p>

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
                    <div className="detail-kicker">Thời lượng dự kiến</div>
                    <div className="mt-1 text-sm font-semibold text-text-strong">{project.duration}</div>
                  </div>
                  <CalendarDays className="h-4 w-4 text-text-muted" />
                </div>

                <ApplyButton className="w-full" matchScore={project.matchScore} projectId={project.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
