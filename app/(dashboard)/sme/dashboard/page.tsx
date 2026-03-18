import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Users, Clock, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SMEDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tổng quan Doanh nghiệp</h2>
          <p className="text-muted-foreground text-sm">Quản lý hiệu quả các bài toán chuyển đổi số của bạn</p>
        </div>
        <Link href="/sme/projects/new">
          <Button className="rounded-full shadow-md"><PlusCircle className="w-4 h-4 mr-2" /> Đăng dự án mới</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng dự án</CardTitle>
            <FolderKanban className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Đang diễn ra</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sinh viên ứng tuyển</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Dự án gần đây</h3>
        <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur flex flex-col items-center justify-center h-48 text-muted-foreground">
          <FolderKanban className="w-10 h-10 mb-4 opacity-20" />
          <p>Bạn chưa đăng dự án nào.</p>
          <Link href="/sme/projects/new">
            <Button variant="link" className="text-primary mt-2">Bắt đầu tạo dự án đầu tiên</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
