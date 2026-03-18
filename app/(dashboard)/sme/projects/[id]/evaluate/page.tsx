"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Star } from "lucide-react";

export default function EvaluatePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratings, setRatings] = useState({
    outputQuality: 0,
    onTime: 0,
    proactiveness: 0,
    communication: 0,
    overallFit: 0,
  });

  const handleRating = (field: keyof typeof ratings, i: number) => {
    setRatings(prev => ({ ...prev, [field]: i }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: Connect to real API
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Đánh giá thành công!");
      router.push(`/sme/projects/${params.id}`);
    }, 1500);
  };

  const criteria = [
    { key: "outputQuality", label: "Chất lượng sản phẩm đầu ra" },
    { key: "onTime", label: "Đúng tiến độ / Deadline" },
    { key: "proactiveness", label: "Mức độ chủ động trong công việc" },
    { key: "communication", label: "Kỹ năng giao tiếp & Phản hồi" },
    { key: "overallFit", label: "Mức độ phù hợp với yêu cầu thực tế" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Link href={`/sme/projects/${params.id}`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Đánh giá sinh viên</h2>
          <p className="text-muted-foreground text-sm">Feedback sau khi nghiệm thu dự án</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Tiêu chí đánh giá</CardTitle>
            <CardDescription>Chọn từ 1 đến 5 sao cho mỗi hạng mục</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {criteria.map((item) => (
              <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="font-medium text-sm">{item.label}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star 
                      key={i} 
                      className={`w-6 h-6 cursor-pointer transition-colors ${
                        i <= ratings[item.key as keyof typeof ratings] 
                          ? "fill-amber-400 text-amber-400" 
                          : "text-muted-foreground/30 hover:text-amber-200"
                      }`}
                      onClick={() => handleRating(item.key as keyof typeof ratings, i)}
                    />
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t space-y-3">
              <label className="font-medium text-sm block">Nhận xét chi tiết (Tùy chọn)</label>
              <Textarea 
                placeholder="Bạn có đánh giá gì thêm về thái độ làm việc, kỹ năng của sinh viên không?" 
                className="min-h-[100px]"
              />
            </div>
            
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting || Object.values(ratings).some(v => v === 0)}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Gửi đánh giá
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
