import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { rankBySimilarity } from "@/lib/matching";
import { Building2, CalendarDays, Sparkles } from "lucide-react";
import { ApplyButton } from "./apply-button";

export default async function StudentProjectsPage() {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") return <div>Unauthorized</div>;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
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

  // Xếp hạng bằng AI similarity nếu có profile embedding
  type RankedProject = (typeof availableProjects)[number] & { matchScore: number };
  let rankedProjects: RankedProject[] = [];

  if (profile?.embedding && profile.embedding.length > 0) {
    rankedProjects = rankBySimilarity(profile.embedding, availableProjects) as RankedProject[];
  } else {
    // Nếu chưa có profile, gán score = 0
    rankedProjects = availableProjects.map(p => ({ ...p, matchScore: 0 }));
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center">
            Việc làm gợi ý <Sparkles className="w-5 h-5 ml-2 text-indigo-500" />
          </h2>
          <p className="text-muted-foreground text-sm">Các bài toán từ doanh nghiệp được AI phân tích độ phù hợp với bạn</p>
        </div>
      </div>

      {!profile?.embedding || profile.embedding.length === 0 ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
          ⚠️ Bạn chưa cập nhật kỹ năng đầy đủ. Hãy <Link href="/student/profile" className="font-bold underline">cập nhật Profile</Link> để AI có thể phân tích và gợi ý chính xác nhất.
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rankedProjects.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-muted-foreground">
            Hiện chưa có dự án nào phù hợp hoặc đang mở. Vui lòng quay lại sau!
          </div>
        ) : rankedProjects.map((project) => (
          <Card key={project.id} className="flex flex-col overflow-hidden bg-white/50 backdrop-blur border-none shadow-sm hover:shadow-md transition-all group">
            <CardHeader className="pb-3 border-b bg-muted/20 relative">

              {/* AI Match Badge */}
              {project.matchScore > 0 && (
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg rotate-12 group-hover:rotate-0 transition-transform">
                  <div className="-rotate-12 group-hover:rotate-0 transition-transform">
                    {project.matchScore}%
                  </div>
                </div>
              )}

              <div className="flex justify-between items-start mb-2 pr-10">
                <span className="text-xs font-semibold text-primary flex items-center bg-primary/10 px-2 py-1 rounded">
                  <Building2 className="w-3 h-3 mr-1" /> {project.sme.companyName}
                </span>
              </div>
              <CardTitle className="line-clamp-2 text-lg leading-tight group-hover:text-primary transition-colors">
                {project.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow pt-4">
              <CardDescription className="line-clamp-3 mb-4 text-sm leading-relaxed">
                {project.expectedOutput}
              </CardDescription>

              <div className="flex flex-wrap gap-2 mb-4">
                {project.requiredSkills.slice(0, 3).map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="text-[10px] font-normal cursor-default">
                    {skill}
                  </Badge>
                ))}
                {project.requiredSkills.length > 3 && (
                  <Badge variant="secondary" className="text-[10px] font-normal">+{project.requiredSkills.length - 3}</Badge>
                )}
              </div>

              <div className="flex items-center text-xs text-muted-foreground">
                <CalendarDays className="w-3.5 h-3.5 mr-1" />
                Thời lượng: <span className="font-medium ml-1 text-foreground">{project.duration}</span>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-4 px-6 mt-auto flex gap-2">
              <ApplyButton matchScore={project.matchScore} projectId={project.id} />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
