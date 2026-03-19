"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Sparkles, Loader2, Info } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projectFormSchema, type ProjectFormInput } from "@/lib/validators/project";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }

  return fallback;
}

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    control,
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormInput>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      standardizedBrief: "",
      expectedOutput: "",
      requiredSkills: "",
      difficulty: "MEDIUM",
      duration: "",
      budget: "",
    },
  });

  const description = watch("description");
  const standardizedBrief = watch("standardizedBrief");

  const standardizeMutation = useMutation({
    mutationFn: async (payload: { description: string }) => {
      const response = await fetch("/api/ai/standardize-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as unknown;
      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Lỗi khi kết nối AI."));
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !("brief" in data) ||
        typeof data.brief !== "string"
      ) {
        throw new Error("AI không trả về brief hợp lệ.");
      }

      return data.brief;
    },
    onSuccess: (brief) => {
      setValue("standardizedBrief", brief, { shouldDirty: true, shouldValidate: true });
      toast.success("AI đã chuẩn hóa mô tả.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Lỗi khi kết nối AI.");
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (values: ProjectFormInput) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as unknown;
      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Có lỗi khi đăng bài."));
      }

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sme-projects"] });
      router.push("/sme/projects");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Có lỗi khi đăng bài.");
    },
  });

  const onSubmit = handleSubmit((values) => {
    createProjectMutation.mutate(values);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tạo Dự Án Mới</h2>
        <p className="text-muted-foreground text-sm">
          Đăng yêu cầu số hóa để sinh viên IT ứng tuyển
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Mô tả bài toán</CardTitle>
                <CardDescription>Mô tả chi tiết những gì bạn cần giải quyết</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tên dự án</Label>
                  <Input
                    id="title"
                    placeholder="VD: Chatbot FAQ cho Fanpage phòng khám"
                    {...register("title")}
                  />
                  <FieldError message={errors.title?.message} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Mô tả thực tế (thô)</Label>
                    <Button
                      className="h-8 text-xs font-medium text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 uppercase tracking-wider"
                      disabled={standardizeMutation.isPending || !description.trim()}
                      onClick={() =>
                        standardizeMutation.mutate({
                          description,
                        })
                      }
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      {standardizeMutation.isPending ? (
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-2" />
                      )}
                      AI Chuẩn hóa
                    </Button>
                  </div>
                  <Textarea
                    className="min-h-[120px]"
                    id="description"
                    placeholder="VD: Mình đang bán mỹ phẩm, dạo này đông khách hỏi trùng câu trên page nên rep mỏi tay. Mình muốn có 1 con bot tự chat..."
                    {...register("description")}
                  />
                  <FieldError message={errors.description?.message} />
                </div>

                {standardizedBrief ? (
                  <div className="space-y-2 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50 animate-in fade-in">
                    <Label className="text-indigo-700 font-semibold flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" /> Brief Chuẩn Hóa Bằng AI
                    </Label>
                    <Textarea
                      className="bg-transparent border-indigo-200 min-h-[150px] shadow-none"
                      {...register("standardizedBrief")}
                    />
                    <p className="text-xs text-indigo-500 flex items-center mt-2">
                      <Info className="w-3 h-3 mr-1" /> Bạn có thể chỉnh sửa lại text này để chính xác hơn.
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1 space-y-6">
            <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Cấu hình dự án</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expectedOutput">Kết quả bàn giao</Label>
                  <Input
                    id="expectedOutput"
                    placeholder="VD: Website, Source code, Báo cáo"
                    {...register("expectedOutput")}
                  />
                  <FieldError message={errors.expectedOutput?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requiredSkills">Kỹ năng cần có</Label>
                  <Input
                    id="requiredSkills"
                    placeholder="VD: React, Node.js, AI (cách nhau dấu phẩy)"
                    {...register("requiredSkills")}
                  />
                  <FieldError message={errors.requiredSkills?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Mức độ khó</Label>
                  <Controller
                    control={control}
                    name="difficulty"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn mức độ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EASY">Dễ (1-2 tuần)</SelectItem>
                          <SelectItem value="MEDIUM">Vừa (2-4 tuần)</SelectItem>
                          <SelectItem value="HARD">Khó (4-8 tuần)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError message={errors.difficulty?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Thời gian (chữ)</Label>
                  <Input id="duration" placeholder="VD: 3 tuần" {...register("duration")} />
                  <FieldError message={errors.duration?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Ngân sách / Quyền lợi</Label>
                  <Input
                    id="budget"
                    placeholder="VD: 2.000.000 VNĐ hoặc Team building"
                    {...register("budget")}
                  />
                  <FieldError message={errors.budget?.message} />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full rounded-xl shadow-lg"
                  disabled={createProjectMutation.isPending}
                  type="submit"
                >
                  {createProjectMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Đăng Dự Án
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
