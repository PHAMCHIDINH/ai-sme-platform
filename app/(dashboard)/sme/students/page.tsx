"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Search, Send, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

import { inviteStudent } from "@/app/actions/application";
import { EmptyState, PageHeader } from "@/components/patterns/b2b";
import { Badge } from "@/components/retroui/Badge";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/retroui/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/retroui/Dialog";
import { Input } from "@/components/retroui/Input";
import { Label } from "@/components/retroui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/retroui/Select";

type Student = {
  id: string;
  university: string;
  major: string;
  skills: string[];
  matchScore?: number;
  user: { name: string; email: string };
};

type ProjectLite = {
  id: string;
  title: string;
  status: "DRAFT" | "OPEN" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED";
};

export default function SmeStudentsPage() {
  const [search, setSearch] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ["sme-students", search],
    queryFn: async () => {
      const url = search ? `/api/sme/students?q=${encodeURIComponent(search)}` : "/api/sme/students";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch students");
      return response.json();
    },
  });

  const { data: myProjects } = useQuery<ProjectLite[]>({
    queryKey: ["sme-projects-lite"],
    queryFn: async () => {
      const response = await fetch("/api/projects");
      if (!response.ok) return [];
      const payload = (await response.json()) as { projects?: ProjectLite[] };
      const projects = Array.isArray(payload.projects) ? payload.projects : [];
      return projects.filter((project) => project.status === "OPEN");
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ projectId, studentId }: { projectId: string; studentId: string }) => {
      const result = await inviteStudent(projectId, studentId);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      toast.success("Đã gửi lời mời thành công.");
      setInviteModalOpen(false);
      setSelectedStudent(null);
      setSelectedProjectId("");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    },
  });

  const handleOpenInvite = (student: Student) => {
    setSelectedStudent(student);
    setInviteModalOpen(true);
  };

  const submitInvite = () => {
    if (!selectedProjectId || !selectedStudent) {
      toast.error("Vui lòng chọn dự án.");
      return;
    }

    inviteMutation.mutate({ projectId: selectedProjectId, studentId: selectedStudent.id });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tìm sinh viên"
        title="Tìm ứng viên theo nhu cầu dự án và mời tham gia trực tiếp từ dashboard."
        description="Danh sách được gợi ý dựa trên mô tả tìm kiếm và có thể đi tiếp ngay sang bước gửi lời mời cho project đang mở."
      />

      <div className="surface-card flex items-center gap-3 px-5 py-4">
        <Search className="h-4 w-4 text-text-muted" />
        <Input
          className="border-0 bg-transparent px-0 shadow-none focus:border-transparent focus:bg-transparent focus:ring-0"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nhập mô tả dự án hoặc kỹ năng để hệ thống gợi ý ứng viên..."
          value={search}
        />
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-text-muted" /> : null}
      </div>

      {students?.length === 0 && !isLoading ? (
        <EmptyState
          icon={Search}
          title="Chưa tìm thấy ứng viên phù hợp"
          description="Hãy thay đổi từ khóa tìm kiếm hoặc quay lại sau khi có thêm hồ sơ sinh viên được đồng bộ vào hệ thống."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {students?.map((student) => (
            <Card key={student.id} className="bg-white">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="line-clamp-1">{student.user.name}</CardTitle>
                    <p className="text-sm text-text-muted">{student.user.email}</p>
                  </div>
                  {student.matchScore !== undefined && student.matchScore > 0 ? (
                    <Badge className="bg-brand-100 text-primary">
                      <Star className="h-3.5 w-3.5" />
                      {student.matchScore}% phù hợp
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-1">
                  <p className="detail-kicker">Trường và chuyên ngành</p>
                  <p className="text-sm font-semibold text-text-strong">{student.university}</p>
                  <p className="text-sm text-text-muted">{student.major}</p>
                </div>

                <div className="space-y-2">
                  <p className="detail-kicker">Kỹ năng chính</p>
                  <div className="flex flex-wrap gap-2">
                    {student.skills.slice(0, 4).map((skill) => (
                      <Badge key={skill} variant="outline" className="bg-surface-muted text-text-muted">
                        {skill}
                      </Badge>
                    ))}
                    {student.skills.length > 4 ? (
                      <Badge variant="outline" className="bg-surface-muted text-text-muted">
                        +{student.skills.length - 4}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <Button className="w-full" onClick={() => handleOpenInvite(student)} variant="outline">
                  <Send className="h-4 w-4" />
                  Mời tham gia dự án
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gửi lời mời tham gia dự án</DialogTitle>
            <DialogDescription>
              {selectedStudent
                ? `Chọn một dự án đang mở để mời ${selectedStudent.user.name} tham gia.`
                : "Chọn dự án muốn gửi lời mời."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5">
            <div className="space-y-2">
              <Label htmlFor="invite-project">Dự án đang mở</Label>
              <Select onValueChange={setSelectedProjectId} value={selectedProjectId}>
                <SelectTrigger id="invite-project">
                  <SelectValue placeholder="Chọn dự án" />
                </SelectTrigger>
                <SelectContent>
                  {myProjects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {myProjects?.length === 0 ? (
                <p className="text-sm text-danger">Bạn chưa có dự án nào ở trạng thái mở để gửi lời mời.</p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setInviteModalOpen(false)} type="button" variant="outline">
              Hủy
            </Button>
            <Button
              disabled={!selectedProjectId || inviteMutation.isPending}
              onClick={submitInvite}
              type="button"
            >
              {inviteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Gửi lời mời
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
