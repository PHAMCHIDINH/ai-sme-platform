"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, MessageSquareDashed, Send, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";

import { FormSection, PageHeader, WorkflowStep } from "@/components/patterns/b2b";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Label } from "@/components/retroui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/retroui/Select";
import { Textarea } from "@/components/retroui/Textarea";
import { projectFormSchema, type ProjectFormInput } from "@/lib/validators/project";
import { cn } from "@/lib/utils";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm font-medium text-danger">{message}</p>;
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "object" && payload !== null && "error" in payload && typeof payload.error === "string") {
    return payload.error;
  }
  return fallback;
}

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "init",
    role: "assistant",
    content:
      "Chào bạn, tôi sẽ giúp làm rõ nhu cầu dự án. Hãy mô tả bài toán doanh nghiệp đang cần giải quyết, kết quả mong muốn hoặc hạn chế chính hiện tại.",
    suggestions: [
      "Tôi cần một website bán hàng cơ bản cho doanh nghiệp nhỏ",
      "Tôi muốn hệ thống quản lý đơn hàng nội bộ",
      "Tôi cần dashboard theo dõi dữ liệu khách hàng",
    ],
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    control,
    register,
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (newHistory: Message[]) => {
      const response = await fetch("/api/ai/chat-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory.map((message) => ({ role: message.role, content: message.content })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, "Lỗi khi kết nối AI."));
      return data;
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: data.message || "Bạn kiểm tra lại thông tin đã được chuẩn hóa trong form.",
          suggestions: data.suggestions || [],
        },
      ]);

      if (data.parsedData) {
        Object.entries(data.parsedData).forEach(([key, value]) => {
          if (value && typeof value === "string" && value.trim() !== "" && value !== "null") {
            setValue(key as keyof ProjectFormInput, value, { shouldValidate: true, shouldDirty: true });
          }
        });
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (values: ProjectFormInput) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, "Có lỗi khi đăng bài."));
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sme-projects"] });
      toast.success("Dự án đã được tạo thành công.");
      router.push("/sme/projects");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Có lỗi khi đăng bài.");
    },
  });

  const handleSendMessage = (text: string) => {
    if (!text.trim() || chatMutation.isPending) return;

    const nextMessage: Message = { id: Date.now().toString(), role: "user", content: text };
    const history = [...messages, nextMessage];
    setMessages(history);
    setChatInput("");
    chatMutation.mutate(history);
  };

  const onSubmit = handleSubmit((values) => {
    createProjectMutation.mutate(values);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tạo dự án mới"
        title="Mô tả nhu cầu, nhận hỗ trợ chuẩn hóa bằng AI và xác nhận lại form trước khi đăng."
        description="AI chỉ hỗ trợ làm rõ và điền nháp. Bạn vẫn là người kiểm tra cuối cùng trước khi tạo dự án."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <WorkflowStep
          step="Bước 1"
          title="Mô tả nhu cầu"
          description="Viết ngắn gọn vấn đề kinh doanh, đầu ra mong muốn hoặc bối cảnh doanh nghiệp đang gặp."
          icon={MessageSquareDashed}
        />
        <WorkflowStep
          step="Bước 2"
          title="AI chuẩn hóa"
          description="Hệ thống hỏi lại và chuyển thông tin thành brief có cấu trúc hơn để bạn dễ kiểm tra."
          icon={Sparkles}
        />
        <WorkflowStep
          step="Bước 3"
          title="Xác nhận form"
          description="Bạn rà soát lại title, output, kỹ năng, thời lượng và ngân sách trước khi tạo dự án."
          icon={CheckCircle2}
        />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="surface-card overflow-hidden">
          <div className="border-b border-border-subtle px-6 py-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-strong">
              <Sparkles className="h-4 w-4 text-primary" />
              Trợ lý chuẩn hóa brief
            </div>
            <p className="mt-2 text-sm leading-7 text-text-muted">
              AI sẽ hỗ trợ làm rõ mục tiêu, phạm vi, đầu ra và các yêu cầu chính để bạn không phải bắt đầu từ một form trống.
            </p>
          </div>

          <div className="grid gap-4 border-b border-border-subtle bg-surface-muted px-6 py-5 md:grid-cols-3">
            {[
              "Mục tiêu kinh doanh",
              "Đầu ra bàn giao",
              "Kỹ năng và thời lượng",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-border-subtle bg-white px-4 py-3 text-sm text-text-muted shadow-neo-sm">
                {item}
              </div>
            ))}
          </div>

          <div className="max-h-[520px] space-y-4 overflow-y-auto px-6 py-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn("flex flex-col gap-3", message.role === "user" ? "items-end" : "items-start")}
              >
                <div
                  className={cn(
                    "max-w-[92%] rounded-2xl border px-4 py-3 text-sm leading-7 shadow-neo-sm",
                    message.role === "user"
                      ? "border-primary/15 bg-brand-100 text-text-strong"
                      : "border-border-subtle bg-white text-text-muted",
                  )}
                >
                  {message.content}
                </div>

                {message.role === "assistant" &&
                message.suggestions &&
                message.suggestions.length > 0 &&
                index === messages.length - 1 ? (
                  <div className="flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        className="rounded-full border border-border-subtle bg-white px-3 py-2 text-xs font-medium text-text-muted transition-colors hover:bg-surface-muted"
                        disabled={chatMutation.isPending}
                        onClick={() => handleSendMessage(suggestion)}
                        type="button"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {chatMutation.isPending ? (
              <div className="flex items-start">
                <div className="rounded-2xl border border-border-subtle bg-white px-4 py-3 shadow-neo-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border-subtle px-6 py-5">
            <form
              className="flex gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                handleSendMessage(chatInput);
              }}
            >
              <Input
                className="bg-white"
                disabled={chatMutation.isPending}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Mô tả thêm nhu cầu của doanh nghiệp..."
                value={chatInput}
              />
              <Button
                disabled={!chatInput.trim() || chatMutation.isPending}
                size="icon"
                type="submit"
                variant="secondary"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </section>

        <form className="space-y-5" onSubmit={onSubmit}>
          <FormSection
            title="Thông tin dự án"
            description="Các trường này được AI điền nháp khi đủ dữ liệu, nhưng bạn có thể sửa trực tiếp trước khi tạo dự án."
          >
            <div className="space-y-2">
              <Label htmlFor="title">Tên dự án</Label>
              <Input id="title" placeholder="Ví dụ: Quản lý đơn hàng nội bộ cho doanh nghiệp nhỏ" {...register("title")} />
              <FieldError message={errors.title?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="standardizedBrief">Brief đã chuẩn hóa</Label>
              <Textarea
                id="standardizedBrief"
                placeholder="Hệ thống sẽ tổng hợp mục tiêu, phạm vi và đầu ra của dự án tại đây."
                {...register("standardizedBrief")}
              />
              <FieldError message={errors.standardizedBrief?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả gốc để lưu nội bộ</Label>
              <Textarea id="description" readOnly className="bg-white" {...register("description")} />
            </div>
          </FormSection>

          <FormSection
            title="Phạm vi triển khai"
            description="Những thông tin này giúp sinh viên hiểu mức độ công việc và giúp hệ thống matching chính xác hơn."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="expectedOutput">Kết quả bàn giao</Label>
                <Input id="expectedOutput" placeholder="Ví dụ: Website nội bộ, dashboard, tài liệu hướng dẫn" {...register("expectedOutput")} />
                <FieldError message={errors.expectedOutput?.message} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="requiredSkills">Kỹ năng cần có</Label>
                <Input id="requiredSkills" placeholder="Ví dụ: React, Node.js, SQL" {...register("requiredSkills")} />
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
                        <SelectItem value="EASY">Dễ</SelectItem>
                        <SelectItem value="MEDIUM">Trung bình</SelectItem>
                        <SelectItem value="HARD">Khó</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Thời gian triển khai</Label>
                <Input id="duration" placeholder="Ví dụ: 3 tuần" {...register("duration")} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="budget">Ngân sách / quyền lợi</Label>
                <Input id="budget" placeholder="Ví dụ: 3.000.000 VNĐ hoặc hỗ trợ chứng nhận thực tập" {...register("budget")} />
                <FieldError message={errors.budget?.message} />
              </div>
            </div>
          </FormSection>

          <div className="surface-card flex flex-col gap-4 p-5">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-text-strong">Xác nhận trước khi tạo dự án</h3>
              <p className="text-sm leading-7 text-text-muted">
                Sau khi tạo, dự án sẽ được hiển thị trong dashboard doanh nghiệp và dùng cho các luồng matching / ứng tuyển hiện có.
              </p>
            </div>
            <Button className="w-full" disabled={createProjectMutation.isPending} type="submit">
              {createProjectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tạo dự án...
                </>
              ) : (
                "Tạo dự án"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
