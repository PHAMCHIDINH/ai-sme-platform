import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent } from "@/components/retroui/Card";
import { Badge } from "@/components/retroui/Badge";
import { ArrowLeft, Sparkles, Code2, GraduationCap, Users } from "lucide-react";
import { rankBySimilarity } from "@/lib/matching";
import { CandidateActions } from "./candidate-actions";
import { InviteAction } from "./invite-action";

type ProjectApplication = {
  studentId: string;
  status: "PENDING" | "INVITED" | "ACCEPTED" | "REJECTED";
  initiatedBy: "SME" | "STUDENT";
};

export default async function CandidatesPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const smeUserId = getSessionUserIdByRole(session, "SME");
  if (!smeUserId) return <div>Unauthorized</div>;

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      sme: true,
      applications: {
        select: {
          studentId: true,
          status: true,
          initiatedBy: true,
        },
      },
    },
  });

  if (!project) return notFound();
  if (project.sme.userId !== smeUserId) return <div>Unauthorized</div>;

  const applicantIds = project.applications.map((app) => app.studentId);
  const applicationMap = new Map(project.applications.map((app) => [app.studentId, app]));

  const applicantsPool = applicantIds.length
    ? await prisma.studentProfile.findMany({
        where: {
          id: {
            in: applicantIds,
          },
        },
        select: {
          id: true,
          university: true,
          skills: true,
          embedding: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      })
    : [];

  const suggestionsPool = await prisma.studentProfile.findMany({
    where: {
      ...(applicantIds.length
        ? {
            id: {
              notIn: applicantIds,
            },
          }
        : {}),
    },
    select: {
      id: true,
      university: true,
      skills: true,
      embedding: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  const applicants = rankBySimilarity(project.embedding, applicantsPool).map((student) => ({
    ...student,
    applicationData: applicationMap.get(student.id),
  }));
  const suggestions = rankBySimilarity(project.embedding, suggestionsPool).slice(0, 5);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Link href={`/sme/projects/${project.id}`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ứng viên & Matching</h2>
          <p className="text-muted-foreground text-sm">Quản lý ứng viên cho dự án: {project.title}</p>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center">
          <Users className="w-6 h-6 mr-2 text-primary" /> Sinh viên đã ứng tuyển ({applicants.length})
        </h3>
        
        {applicants.length === 0 ? (
          <div className="p-8 text-center bg-muted/30 rounded-2xl border border-dashed">
            <p className="text-muted-foreground">Chưa có sinh viên nào ứng tuyển dự án này.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {applicants.map(student => (
              <StudentCard key={student.id} student={student} projectId={project.id} />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6 mt-12">
        <h3 className="text-xl font-bold flex items-center">
          <Sparkles className="w-6 h-6 mr-2 text-indigo-500" /> Gợi ý từ AI 
          <Badge className="ml-3 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors">Top Match</Badge>
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.map(student => (
            <StudentCard key={student.id} student={student} projectId={project.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

type CandidateStudent = {
  id: string;
  user: {
    name: string;
  };
  university: string;
  skills: string[];
  embedding: number[];
  matchScore: number;
  applicationData?: ProjectApplication;
};

function StudentCard({ student, projectId }: { student: CandidateStudent, projectId: string }) {
  // Lấy % match (nếu 0 thì chỉ hiển thị "N/A" hoặc 0%)
  const matchScore = student.matchScore;
  let colorClass = "text-muted-foreground";
  if (matchScore >= 80) colorClass = "text-green-600";
  else if (matchScore >= 60) colorClass = "text-amber-600";

  return (
    <Card className="bg-white transition-transform hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3 items-center">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
              {student.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-lg leading-tight">{student.user.name}</h4>
              <p className="text-sm text-muted-foreground flex items-center">
                <GraduationCap className="w-3 h-3 mr-1" /> {student.university || "Chưa cập nhật trường"}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className={`text-xl font-black ${colorClass}`}>{matchScore}%</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Độ phù hợp</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-muted-foreground font-semibold mb-2 flex items-center">
            <Code2 className="w-3 h-3 mr-1" /> Kỹ năng nổi bật
          </p>
          <div className="flex flex-wrap gap-1.5">
            {student.skills && student.skills.length > 0 ? (
              student.skills.slice(0, 4).map((skill: string) => (
                <Badge key={skill} variant="secondary" className="text-[10px] px-1.5 font-normal bg-muted">
                  {skill}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">Chưa cập nhật kỹ năng</span>
            )}
            {student.skills && student.skills.length > 4 && <Badge variant="secondary" className="text-[10px] px-1.5">+{student.skills.length - 4}</Badge>}
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          {student.applicationData ? (
             student.applicationData.status === "PENDING" ? (
                <CandidateActions projectId={projectId} studentId={student.id} />
             ) : (
                <div className="w-full rounded-xl border border-border-subtle bg-surface-muted p-3 text-center text-xs font-medium text-text-muted shadow-neo-sm">
                  {student.applicationData.status === "INVITED" ? "Đã gửi lời mời" : 
                   student.applicationData.status === "ACCEPTED" ? "Đã NHẬN VÀO DỰ ÁN" : "Đã từ chối"}
                </div>
             )
          ) : (
            <InviteAction projectId={projectId} studentId={student.id} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
