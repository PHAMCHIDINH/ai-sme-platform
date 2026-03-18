"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { TagInput } from "@/components/forms/tag-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  expectedOutput: z.string().min(3),
  requiredSkills: z.array(z.string()),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  duration: z.string().min(2),
  budget: z.string().optional(),
});

export default function NewProjectPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [standardizedBrief, setStandardizedBrief] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleStandardize = async () => {
    setLoadingAI(true);
    setError("");
    try {
      const response = await fetch("/api/ai/standardize-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawBrief: description }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "AI request failed");
      }

      setStandardizedBrief(data.standardizedBrief);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoadingAI(false);
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      standardizedBrief,
      expectedOutput: String(formData.get("expectedOutput") ?? ""),
      requiredSkills: String(formData.get("requiredSkills") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      difficulty: String(formData.get("difficulty") ?? "MEDIUM") as "EASY" | "MEDIUM" | "HARD",
      duration: String(formData.get("duration") ?? ""),
      budget: String(formData.get("budget") ?? ""),
    };

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      setError("Dữ liệu chưa hợp lệ.");
      setSubmitting(false);
      return;
    }

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Không thể tạo dự án");
      setSubmitting(false);
      return;
    }

    router.push("/sme/projects");
    router.refresh();
  };

  return (
    <div className="page-stack fade-in">
      <div>
        <h2 className="section-title">Tạo dự án mới</h2>
        <p className="section-subtitle">Mô tả bài toán rõ ràng để hệ thống AI matching trả về danh sách ứng viên tốt hơn.</p>
      </div>

      <Card className="space-y-5" padding="lg">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700" htmlFor="title">
              Tên dự án
            </label>
            <Input id="title" name="title" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700" htmlFor="description">
              Mô tả bài toán
            </label>
            <textarea
              className="min-h-32 w-full rounded-md border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-brand-200"
              id="description"
              name="description"
              onChange={(event) => setDescription(event.target.value)}
              required
              value={description}
            />
          </div>

          <Button disabled={!description.trim()} loading={loadingAI} onClick={handleStandardize} type="button" variant="secondary">
            {loadingAI ? "Đang chuẩn hóa..." : "AI hỗ trợ chuẩn hóa brief"}
          </Button>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700" htmlFor="standardizedBrief">
              Brief đã chuẩn hóa
            </label>
            <textarea
              className="min-h-32 w-full rounded-md border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-brand-200"
              id="standardizedBrief"
              onChange={(event) => setStandardizedBrief(event.target.value)}
              value={standardizedBrief}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700" htmlFor="expectedOutput">
              Đầu ra mong muốn
            </label>
            <Input id="expectedOutput" name="expectedOutput" required />
          </div>

          <TagInput id="requiredSkills" label="Kỹ năng cần có" />

          <div className="form-grid">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700" htmlFor="difficulty">
                Mức độ khó
              </label>
              <Select defaultValue="MEDIUM" id="difficulty" name="difficulty">
                <option value="EASY">Dễ</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HARD">Khó</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700" htmlFor="duration">
                Thời gian dự kiến
              </label>
              <Input id="duration" name="duration" placeholder="4 tuần" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700" htmlFor="budget">
              Ngân sách (tùy chọn)
            </label>
            <Input id="budget" name="budget" placeholder="5,000,000 VND" />
          </div>

          {error ? <p className="rounded-md border border-danger-100 bg-danger-100 px-3 py-2 text-sm text-danger-700">{error}</p> : null}

          <Button loading={submitting} type="submit">
            {submitting ? "Đang lưu..." : "Lưu dự án"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
