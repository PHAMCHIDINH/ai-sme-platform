import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X, Sparkles, Code2, GraduationCap } from "lucide-react";
import { rankBySimilarity } from "@/lib/matching";

export default async function CandidatesPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "SME") return <div>Unauthorized</div>;

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { applications: { include: { student: { include: { user: true } } } } }
  });

  if (!project) return notFound();

  // Lấy tất cả sinh viên
  const allStudents = await prisma.studentProfile.findMany({
    include: { user: true }
  });

  // Tính điểm match với project hiện tại
  const rankedStudents = rankBySimilarity(project.embedding, allStudents);
  
  // Phân tách sinh viên đã ứng tuyển và sinh viên gợi ý
  const applicantIds = new Set(project.applications.map(a => a.studentId));
  const applicants = rankedStudents.filter(s => applicantIds.has(s.id));
  const suggestions = rankedStudents.filter(s => !applicantIds.has(s.id)).slice(0, 5); // top 5 gợi ý

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
              <StudentCard key={student.id} student={student} projectId={project.id} isApplied />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6 mt-12">
        <h3 className="text-xl font-bold flex items-center">
          <Sparkles className="w-6 h-6 mr-2 text-indigo-500" /> Gợi ý từ AI 
          <Badge className="ml-3 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none transition-colors">Top Match</Badge>
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

function StudentCard({ student, projectId, isApplied = false }: { student: any, projectId: string, isApplied?: boolean }) {
  // Lấy % match (nếu 0 thì chỉ hiển thị "N/A" hoặc 0%)
  const matchScore = student.matchScore;
  let colorClass = "text-muted-foreground";
  if (matchScore >= 80) colorClass = "text-green-600 dark:text-green-400";
  else if (matchScore >= 60) colorClass = "text-amber-600 dark:text-amber-400";

  return (
    <Card className="border-none shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3 items-center">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold text-lg">
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
          {isApplied ? (
            <>
              <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white"><Check className="w-4 h-4 mr-1" /> Chấp nhận</Button>
              <Button size="sm" variant="outline" className="flex-1 text-red-600 hover:text-red-700"><X className="w-4 h-4 mr-1" /> Từ chối</Button>
            </>
          ) : (
            <Button size="sm" variant="secondary" className="w-full text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100">
              Mời tham gia dự án
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Giả lập icon thay vì import (do lúc nãy quên import Users)
function Users(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
