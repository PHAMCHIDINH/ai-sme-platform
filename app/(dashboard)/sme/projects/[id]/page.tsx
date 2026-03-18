import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Clock, Users, ArrowRight } from "lucide-react";

export default async function SMEProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  if (!session || session.user.role !== "SME") {
    return <div>Unauthorized</div>;
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      sme: true,
      applications: {
        include: { student: { include: { user: true } } }
      },
      progress: true
    }
  });

  if (!project) return notFound();

  // Đảm bảo user này là chủ project
  if (project.sme.userId !== session.user.id) {
    return <div>Unauthorized access to this project</div>;
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/sme/projects">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">{project.title}</h2>
            <Badge variant={project.status === "OPEN" ? "default" : "secondary"}>{project.status}</Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Đăng ngày: {new Date(project.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Nội dung dự án</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Mô tả bài toán</h4>
                <div className="p-4 bg-muted/30 rounded-xl text-sm leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </div>
              </div>
              
              {project.standardizedBrief && (
                <div>
                  <h4 className="font-semibold text-sm text-indigo-600 dark:text-indigo-400 mb-2 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Brief đã chuẩn hóa (Bằng AI)
                  </h4>
                  <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-sm leading-relaxed whitespace-pre-wrap">
                    {project.standardizedBrief}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-xl">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1">Mức độ khó</span>
                  <span className="font-semibold">{project.difficulty === "EASY" ? "Dễ" : project.difficulty === "MEDIUM" ? "Trung bình" : "Khó"}</span>
                </div>
                <div className="p-4 bg-muted/30 rounded-xl">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1">Thời gian dự kiến</span>
                  <span className="font-semibold">{project.duration}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 backdrop-blur border-blue-100 dark:border-blue-900/50">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800 dark:text-blue-300">
                <Users className="w-5 h-5 mr-2" />
                Ứng viên & Matching
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-2">
                  {project.applications.length}
                </div>
                <p className="text-sm font-medium text-blue-800/70 dark:text-blue-300/70 mb-6">
                  Sinh viên đã ứng tuyển
                </p>
                <Link href={`/sme/projects/${project.id}/candidates`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30">
                    Xem ứng viên & Gợi ý AI <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Clock className="w-4 h-4 mr-2 text-muted-foreground" /> Tiến độ hiện tại
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.status === "OPEN" ? (
                <div className="text-sm text-center text-muted-foreground py-4">
                  Dự án đang mở, đợi chốt ứng viên.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Trạng thái</span>
                    <Badge variant="secondary">{project.progress?.status || "Đang thực hiện"}</Badge>
                  </div>
                  {/* Có thể thêm UI progress line ở đây */}
                  <Link href={`/sme/projects/${project.id}/progress`}>
                    <Button variant="outline" className="w-full mt-2 text-xs h-8">Chi tiết tiến độ</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
