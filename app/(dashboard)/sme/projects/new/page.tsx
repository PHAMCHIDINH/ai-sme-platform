"use client";

import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Sparkles, Loader2, Send, Bot, User, CheckCircle2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
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
    content: "Chào bạn! Mình là trợ lý AI VnSMEMatch. Bạn đang muốn tìm sinh viên giải quyết bài toán gì cho doanh nghiệp hôm nay?",
    suggestions: [
      "Xây dựng Web bán hàng",
      "Viết content Fanpage",
      "Làm App quản lý nội bộ",
      "Phân tích dữ liệu KH"
    ],
  }
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
        body: JSON.stringify({ messages: newHistory.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, "Lỗi khi kết nối AI."));
      return data;
    },
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: data.message || "Bạn kiểm tra thông tin form nhé.",
          suggestions: data.suggestions || [],
        }
      ]);

      if (data.parsedData) {
        Object.entries(data.parsedData).forEach(([key, val]) => {
          if (val && typeof val === "string" && val.trim() !== "" && val !== "null") {
            setValue(key as keyof ProjectFormInput, val, { shouldValidate: true, shouldDirty: true });
          }
        });
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    }
  });

  const handleSendMessage = (text: string) => {
    if (!text.trim() || chatMutation.isPending) return;
    
    const newMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const maxHist = [...messages, newMsg];
    setMessages(maxHist);
    setChatInput("");
    chatMutation.mutate(maxHist);
  };

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
      toast.success("Dự án đã được tạo thành công!");
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
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight">Cùng Trợ Lý Tối Ưu Đề Bài</h2>
        <p className="text-muted-foreground text-sm font-medium mt-1">
          Chat với AI để được khai thác yêu cầu tự động, hoặc điền Form thủ công bên phải.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: Chat Interface */}
        <div className="lg:col-span-5 h-[700px] flex flex-col bg-white border-2 border-black shadow-neo-md overflow-hidden rounded-xl">
          <div className="bg-cyan-300 border-b-2 border-black p-4 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 uppercase">
              <Sparkles className="w-5 h-5 text-black fill-current" /> AI Wizard
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('/grid.svg')] bg-center">
            {messages.map((msg, index) => (
              <div key={msg.id} className={cn("flex flex-col max-w-[90%]", msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start")}>
                <div className={cn(
                  "p-3 rounded-2xl border-2 border-black text-sm",
                  msg.role === "user" 
                    ? "bg-lime-300 rounded-br-sm shadow-neo-sm" 
                    : "bg-white rounded-bl-sm shadow-neo-sm"
                )}>
                  {msg.content}
                </div>
                
                {msg.role === "assistant" && msg.suggestions && msg.suggestions.length > 0 && index === messages.length - 1 && (
                  <div className="flex flex-wrap gap-2 mt-3 mb-2">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(sug)}
                        disabled={chatMutation.isPending}
                        className="bg-yellow-300 hover:bg-yellow-400 border-2 border-black px-3 py-1.5 text-xs font-bold rounded-full shadow-neo-sm transition-transform active:translate-y-[2px] active:shadow-none"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex max-w-[90%] mr-auto items-start">
                <div className="p-3 bg-white rounded-2xl rounded-bl-sm border-2 border-black shadow-neo-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t-2 border-black">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(chatInput); }}
              className="flex gap-2"
            >
              <Input 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Nhập câu trả lời..." 
                className="rounded-full shadow-neo-sm focus-visible:ring-0 focus-visible:bg-gray-50 bg-white"
                disabled={chatMutation.isPending}
              />
              <Button 
                type="submit" 
                disabled={!chatInput.trim() || chatMutation.isPending}
                size="icon" 
                className="rounded-full shadow-neo-sm hover:-translate-y-0.5 active:translate-y-[2px]"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Right Col: Form Interface */}
        <form onSubmit={onSubmit} className="lg:col-span-7 bg-white border-2 border-black p-6 rounded-xl shadow-neo-md gap-6 flex flex-col">
           <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-2">
            <h3 className="font-bold text-xl uppercase tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500 fill-current" /> Form Tự Động
            </h3>
            <span className="text-xs font-bold bg-pink-300 text-black px-2 py-1 border border-black shadow-neo-sm rounded-full">LIVE PREVIEW</span>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="md:col-span-2 space-y-2">
               <Label htmlFor="title" className="font-bold">Tên dự án</Label>
               <Input id="title" className="shadow-none bg-gray-50 focus-visible:bg-white" placeholder="Sẽ tự động điền bởi AI" {...register("title")} />
               <FieldError message={errors.title?.message} />
             </div>

             <div className="md:col-span-2 space-y-2">
               <Label htmlFor="standardizedBrief" className="font-bold flex items-center text-indigo-700">Mô tả chuẩn hoá <Sparkles className="w-3 h-3 ml-1" /></Label>
               <Textarea 
                id="standardizedBrief" 
                className="shadow-none bg-indigo-50/50 min-h-[100px] font-medium" 
                placeholder="AI sẽ sinh ra mô tả 4 bước chuyên nghiệp ở đây" 
                {...register("standardizedBrief")} 
               />
               <FieldError message={errors.standardizedBrief?.message} />
             </div>

             <div className="md:col-span-2 space-y-2">
               <Label htmlFor="description" className="font-bold">Nhật ký thô thuật (Ẩn với Dev)</Label>
               <Textarea id="description" className="shadow-none bg-gray-50 h-20 text-xs" readOnly {...register("description")} />
             </div>

             <div className="space-y-2">
               <Label htmlFor="expectedOutput" className="font-bold">Kết quả bàn giao</Label>
               <Input id="expectedOutput" className="shadow-none" placeholder="VD: Website, Báo cáo" {...register("expectedOutput")} />
               <FieldError message={errors.expectedOutput?.message} />
             </div>

             <div className="space-y-2">
               <Label htmlFor="requiredSkills" className="font-bold">Kỹ năng cần có</Label>
               <Input id="requiredSkills" className="shadow-none" placeholder="VD: React, Node.js" {...register("requiredSkills")} />
               <FieldError message={errors.requiredSkills?.message} />
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="difficulty" className="font-bold">Mức độ khó</Label>
               <Controller
                 control={control}
                 name="difficulty"
                 render={({ field }) => (
                   <Select onValueChange={field.onChange} value={field.value}>
                     <SelectTrigger className="shadow-none bg-white">
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
             </div>

             <div className="space-y-2">
               <Label htmlFor="duration" className="font-bold">Thời gian triển khai</Label>
               <Input id="duration" className="shadow-none" placeholder="VD: 3 tuần" {...register("duration")} />
             </div>

             <div className="md:col-span-2 space-y-2">
               <Label htmlFor="budget" className="font-bold">Ngân sách / Quyền lợi</Label>
               <Input id="budget" className="shadow-none" placeholder="VD: Bằng khen / 1tr VNĐ" {...register("budget")} />
               <FieldError message={errors.budget?.message} />
             </div>
           </div>

           <Button 
             className="w-full h-14 text-lg font-black uppercase tracking-widest bg-lime-400 hover:bg-lime-500 text-black border-2 border-black rounded-none shadow-neo-lg hover:shadow-neo-lg hover:-translate-y-1 active:translate-y-[2px] active:shadow-none transition-all mt-4" 
             disabled={createProjectMutation.isPending} 
             type="submit"
           >
             {createProjectMutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Chốt Đăng Nhanh"}
           </Button>
        </form>
      </div>
    </div>
  );
}
