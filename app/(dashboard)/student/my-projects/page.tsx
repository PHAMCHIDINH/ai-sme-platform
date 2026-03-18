import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Clock, CheckCircle2, PlayCircle, Loader2 } from "lucide-react";

export default async function StudentMyProjectsPage() {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") return <div>Unauthorized</div>;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!profile) return <div>Hãy cập nhật profile trước.</div>;

  const progressEntries = await prisma.projectProgress.findMany({
    where: { studentId: profile.id },
    include: { project: { include: { sme: true } } }
  });

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dự án đang tham gia</h2>
        <p className="text-muted-foreground text-sm">Cập nhật tiến độ và bàn giao sản phẩm</p>
      </div>

      {progressEntries.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center bg-muted/20 border-dashed">
          <Clock className="w-12 h-12 text-muted-foreground opacity-50 mb-4" />
          <p className="text-muted-foreground mb-4">Bạn chưa tham gia dự án nào.</p>
          <Link href="/student/projects">
            <Button>Tìm dự án ngay</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {progressEntries.map(entry => (
            <Card key={entry.id} className="border border-border/50 shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur overflow-hidden">
              <div className={`h-2 w-full ${entry.status === "COMPLETED" ? "bg-green-500" : entry.status === "SUBMITTED" ? "bg-amber-500" : "bg-blue-500"}`} />
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold">{entry.project.title}</h3>
                      <Badge variant="outline" className={
                        entry.status === "COMPLETED" ? "border-green-500 text-green-600" :
                        entry.status === "SUBMITTED" ? "border-amber-500 text-amber-600" :
                        "border-blue-500 text-blue-600"
                      }>
                        {entry.status === "COMPLETED" ? "Hoàn thành" : 
                         entry.status === "SUBMITTED" ? "Chờ nghiệm thu" : 
                         entry.status === "IN_PROGRESS" ? "Đang làm" : "Chưa bắt đầu"}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Khách hàng: {entry.project.sme.companyName}</p>
                    
                    <div className="mt-4 pt-4 border-t space-y-2">
                       <p className="text-sm"><strong>Hạn chót: </strong> {new Date(entry.deadline).toLocaleDateString("vi-VN")}</p>
                       {entry.deliverableUrl && (
                         <p className="text-sm"><strong>Link bàn giao: </strong> <a href={entry.deliverableUrl} target="_blank" className="text-primary hover:underline" rel="noreferrer">Xem sản phẩm</a></p>
                       )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 md:min-w-[200px] border-l md:pl-6">
                    {entry.status === "COMPLETED" ? (
                       <Button variant="outline" className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100">
                         <CheckCircle2 className="w-4 h-4 mr-2" /> Đã hoàn thành
                       </Button>
                    ) : (
                      <>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">Cập nhật tiến độ</Button>
                        <Button variant="outline" className="w-full">Nộp sản phẩm</Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
