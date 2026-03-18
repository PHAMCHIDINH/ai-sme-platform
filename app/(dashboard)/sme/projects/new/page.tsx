"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Info } from "lucide-react";
import { toast } from "react-hot-toast"; // assuming user will add this later, or use simple alert for now

export default function NewProjectPage() {
  const router = useRouter();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rawDescription, setRawDescription] = useState("");
  const [standardizedBrief, setStandardizedBrief] = useState("");
  
  const handleAiStandardize = async () => {
    if (!rawDescription) return;
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai/standardize-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: rawDescription })
      });
      const data = await res.json();
      if (data.brief) {
        setStandardizedBrief(data.brief);
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi khi kết nối AI. Vui lòng thử lại.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    payload.standardizedBrief = standardizedBrief;
    
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        router.push("/sme/projects");
      } else {
        alert("Có lỗi khi đăng bài.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tạo Dự Án Mới</h2>
        <p className="text-muted-foreground text-sm">Đăng yêu cầu số hóa để sinh viên IT ứng tuyển</p>
      </div>

      <form onSubmit={handleSubmit}>
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
                  <Input id="title" name="title" placeholder="VD: Chatbot FAQ cho Fanpage phòng khám" required />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Mô tả thực tế (thô)</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAiStandardize}
                      disabled={isAiLoading || !rawDescription}
                      className="h-8 text-xs font-medium text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 uppercase tracking-wider"
                    >
                      {isAiLoading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Sparkles className="w-3 h-3 mr-2" />}
                      AI Chuẩn hóa
                    </Button>
                  </div>
                  <Textarea 
                    id="description" 
                    name="description"
                    placeholder="VD: Mình đang bán mỹ phẩm, dạo này đông khách hỏi trùng câu trên page nên rep mỏi tay. Mình muốn có 1 con bot tự chat..."
                    className="min-h-[120px]"
                    value={rawDescription}
                    onChange={(e) => setRawDescription(e.target.value)}
                    required
                  />
                </div>

                {standardizedBrief && (
                  <div className="space-y-2 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50 animate-in fade-in">
                    <Label className="text-indigo-700 font-semibold flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" /> Brief Chuẩn Hóa Bằng AI
                    </Label>
                    <Textarea 
                      name="standardizedBrief"
                      value={standardizedBrief}
                      onChange={(e) => setStandardizedBrief(e.target.value)}
                      className="bg-transparent border-indigo-200 min-h-[150px] shadow-none"
                    />
                    <p className="text-xs text-indigo-500 flex items-center mt-2"><Info className="w-3 h-3 mr-1" /> Bạn có thể chỉnh sửa lại text này để chính xác hơn.</p>
                  </div>
                )}
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
                  <Input id="expectedOutput" name="expectedOutput" placeholder="VD: Website, Source code, Báo cáo" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="requiredSkills">Kỹ năng cần có</Label>
                  <Input id="requiredSkills" name="requiredSkills" placeholder="VD: React, Node.js, AI (cách nhau dấu phẩy)" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Mức độ khó</Label>
                  <Select name="difficulty" defaultValue="MEDIUM">
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mức độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Dễ (1-2 tuần)</SelectItem>
                      <SelectItem value="MEDIUM">Vừa (2-4 tuần)</SelectItem>
                      <SelectItem value="HARD">Khó (4-8 tuần)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Thời gian (chữ)</Label>
                  <Input id="duration" name="duration" placeholder="VD: 3 tuần" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="budget">Ngân sách / Quyền lợi</Label>
                  <Input id="budget" name="budget" placeholder="VD: 2.000.000 VNĐ hoặc Team building" />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full rounded-xl shadow-lg" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
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
