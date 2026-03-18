"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, GraduationCap, Code2, Sparkles } from "lucide-react";

export default function StudentProfilePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Thông thường sẽ load profile từ server, ở đây chỉ render form MVP
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    
    try {
      const res = await fetch("/api/student-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Cập nhật hồ sơ thành công! AI đã tạo embedding để matching.");
      } else {
        alert("Lỗi cập nhật hồ sơ.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Hồ sơ năng lực thực chiến</h2>
        <p className="text-muted-foreground text-sm flex items-center mt-1">
          <Sparkles className="w-4 h-4 mr-1 text-indigo-500" />
          Hồ sơ này sẽ được AI phân tích để ghép với các bài toán số hóa phù hợp từ doanh nghiệp
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-primary" /> Thông tin cơ bản
                </CardTitle>
                <CardDescription>Các thông tin trường đào tạo và định hướng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="university">Trường học / Cơ sở đào tạo</Label>
                    <Input id="university" name="university" placeholder="VD: Đại học Bách Khoa" defaultValue="Đại học RMIT" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="major">Chuyên ngành</Label>
                    <Input id="major" name="major" placeholder="VD: Kỹ thuật phần mềm" defaultValue="Khoa học máy tính" required />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="description">Giới thiệu bản thân (Mục tiêu nghề nghiệp)</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    placeholder="Hãy kể ngắn gọn điểm mạnh và định hướng học hỏi của bạn để Doanh nghiệp và AI hiểu bạn hơn."
                    className="min-h-[100px]"
                    defaultValue="Mình đang tìm kiếm các cơ hội thực hành thực tế liên quan đến Web Development và áp dụng Machine Learning vào sản phẩm thực."
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur border-t-4 border-t-indigo-500">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code2 className="w-5 h-5 mr-2 text-indigo-500" /> Kỹ năng và Công nghệ
                </CardTitle>
                <CardDescription>Quan trọng! Dữ liệu này giúp AI ghép dự án chính xác</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="skills">Kỹ năng chuyên môn (cách nhau dấu phẩy)</Label>
                  <Input id="skills" name="skills" placeholder="VD: Front-end, Back-end, UI/UX, Data Analysis" defaultValue="Fullstack Web, API Design" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="technologies">Công nghệ / Công cụ (cách nhau dấu phẩy)</Label>
                  <Input id="technologies" name="technologies" placeholder="VD: React, Node.js, Python, Figma" defaultValue="React, Next.js, TypeScript, PostgreSQL" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interests">Lĩnh vực mong muốn trải nghiệm</Label>
                  <Input id="interests" name="interests" placeholder="VD: E-commerce, EdTech, Healthcare" defaultValue="SaaS, E-commerce" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Liên kết & Thời gian</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input id="githubUrl" name="githubUrl" type="url" placeholder="https://github.com/..." defaultValue="https://github.com/example" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolioUrl">Portfolio / LinkedIn URL</Label>
                  <Input id="portfolioUrl" name="portfolioUrl" type="url" placeholder="https://linkedin.com/..." />
                </div>
                <div className="space-y-2 pt-4">
                  <Label htmlFor="availability">Khả năng đáp ứng thời gian</Label>
                  <Input id="availability" name="availability" placeholder="VD: 20h/tuần, các buổi tối" defaultValue="Sẵn sàng 15h/tuần" required />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full shadow-lg h-12 rounded-xl" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                  Lưu hồ sơ AI Profile
                </Button>
              </CardFooter>
            </Card>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border border-indigo-100 dark:border-indigo-900/50">
              <h4 className="font-semibold text-indigo-800 dark:text-indigo-400 mb-2">💡 Tips nhỏ</h4>
              <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 leading-relaxed">
                Hồ sơ càng chi tiết ở phần Kỹ năng và Công nghệ, AI sẽ càng gợi ý chính xác dự án có thể đáp ứng năng lực của bạn, tăng tỷ lệ matching x3.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
