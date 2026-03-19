import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, PlusCircle, Users } from "lucide-react";

export default async function SMEProjectsPage() {
  const session = await auth();

  if (!session || session.user.role !== "SME") {
    return <div>Unauthorized</div>;
  }

  const smeProfile = await prisma.sMEProfile.findUnique({
    where: { userId: session.user.id }
  });

  const projects = smeProfile ? await prisma.project.findMany({
    where: { smeId: smeProfile.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } }
  }) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dự án của tôi</h2>
          <p className="text-muted-foreground text-sm">Quản lý và theo dõi tiến độ các dự án đã đăng</p>
        </div>
        <Link href="/sme/projects/new">
          <Button className="rounded-full shadow-md"><PlusCircle className="w-4 h-4 mr-2" /> Tạo dự án mới</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center h-64 border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center text-center pt-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <PlusCircle className="w-8 h-8 opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Chưa có dự án nào</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">Hãy đăng bài toán số hóa đầu tiên của doanh nghiệp bạn để tìm kiếm sinh viên phù hợp.</p>
            <Link href="/sme/projects/new">
              <Button>Đăng dự án ngay</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={
                    project.status === "OPEN" ? "default" :
                      project.status === "IN_PROGRESS" ? "secondary" :
                        "outline"
                  } className={
                    project.status === "SUBMITTED" ? "border-amber-500 text-amber-600" :
                      project.status === "COMPLETED" ? "border-green-500 text-green-600" :
                        project.status === "DRAFT" ? "border-gray-400 text-gray-500" :
                          undefined
                  }>
                    {project.status === "OPEN" ? "Đang mở" :
                      project.status === "IN_PROGRESS" ? "Đang tiến hành" :
                        project.status === "SUBMITTED" ? "Chờ nghiệm thu" :
                          project.status === "COMPLETED" ? "Hoàn thành" :
                            "Nháp"}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <CalendarDays className="w-3 h-3 mr-1" />
                    {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true, locale: vi })}
                  </span>
                </div>
                <CardTitle className="line-clamp-2 text-lg leading-tight group-hover:text-primary transition-colors">
                  <Link href={`/sme/projects/${project.id}`}>{project.title}</Link>
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow pt-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.requiredSkills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs font-normal bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {skill}
                    </Badge>
                  ))}
                  {project.requiredSkills.length > 3 && (
                    <Badge variant="secondary" className="text-xs font-normal">+{project.requiredSkills.length - 3}</Badge>
                  )}
                </div>

                <div className="flex items-center text-sm font-medium text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 w-fit px-3 py-1.5 rounded-lg">
                  <Users className="w-4 h-4 mr-2" />
                  {project._count.applications} Ứng viên
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-4 px-6 border-t mt-auto">
                <Link href={`/sme/projects/${project.id}`} className="w-full mt-4">
                  <Button variant="outline" className="w-full shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors">
                    Xem chi tiết
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
