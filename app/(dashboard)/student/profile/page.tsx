"use client";

import { useEffect, useMemo, useState } from "react";

import { TagInput } from "@/components/forms/tag-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ProfileResponse = {
  university: string;
  major: string;
  skills: string[];
  technologies: string[];
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  availability: string;
  description: string;
  interests: string[];
  completedProjectsCount: number;
  avgRating: number;
  completedProjects: Array<{ id: string; title: string; deliverableUrl: string | null }>;
} | null;

const listToString = (items: string[] = []) => items.join(", ");

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/student-profile");
      const data = await response.json();
      setProfile(data);
      setLoading(false);
    };

    void load();
  }, []);

  const defaults = useMemo(
    () => ({
      university: profile?.university ?? "",
      major: profile?.major ?? "",
      skills: listToString(profile?.skills),
      technologies: listToString(profile?.technologies),
      githubUrl: profile?.githubUrl ?? "",
      portfolioUrl: profile?.portfolioUrl ?? "",
      availability: profile?.availability ?? "",
      description: profile?.description ?? "",
      interests: listToString(profile?.interests),
    }),
    [profile],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);

    const payload = {
      university: String(formData.get("university") ?? ""),
      major: String(formData.get("major") ?? ""),
      skills: String(formData.get("skills") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      technologies: String(formData.get("technologies") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      githubUrl: String(formData.get("githubUrl") ?? ""),
      portfolioUrl: String(formData.get("portfolioUrl") ?? ""),
      availability: String(formData.get("availability") ?? ""),
      description: String(formData.get("description") ?? ""),
      interests: String(formData.get("interests") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    const response = await fetch("/api/student-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setMessage("Lưu hồ sơ thất bại.");
      setSaving(false);
      return;
    }

    setMessage("Đã cập nhật hồ sơ thành công.");
    setSaving(false);
  };

  if (loading) {
    return <p className="text-sm text-ink-600">Đang tải dữ liệu hồ sơ...</p>;
  }

  return (
    <div className="page-stack fade-in">
      <div>
        <h2 className="section-title">Hồ sơ năng lực</h2>
        <p className="section-subtitle">Tối ưu thông tin kỹ năng để tăng độ chính xác khi hệ thống matching dự án.</p>
      </div>

      <Card padding="lg">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700" htmlFor="university">
                Trường
              </label>
              <Input defaultValue={defaults.university} id="university" name="university" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700" htmlFor="major">
                Ngành học
              </label>
              <Input defaultValue={defaults.major} id="major" name="major" required />
            </div>
          </div>

          <TagInput defaultValue={profile?.skills ?? []} id="skills" label="Kỹ năng chính" />
          <TagInput defaultValue={profile?.technologies ?? []} id="technologies" label="Công nghệ đã biết" />
          <TagInput defaultValue={profile?.interests ?? []} id="interests" label="Lĩnh vực muốn trải nghiệm" />

          <div className="form-grid">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700" htmlFor="githubUrl">
                GitHub URL
              </label>
              <Input defaultValue={defaults.githubUrl} id="githubUrl" name="githubUrl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700" htmlFor="portfolioUrl">
                Portfolio URL
              </label>
              <Input defaultValue={defaults.portfolioUrl} id="portfolioUrl" name="portfolioUrl" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700" htmlFor="availability">
              Thời gian có thể tham gia
            </label>
            <Input defaultValue={defaults.availability} id="availability" name="availability" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700" htmlFor="description">
              Mô tả bản thân
            </label>
            <textarea
              className="min-h-28 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-brand-200"
              defaultValue={defaults.description}
              id="description"
              name="description"
              required
            />
          </div>

          <Button loading={saving} type="submit">
            {saving ? "Đang lưu..." : "Lưu hồ sơ"}
          </Button>
          {message ? <p className="text-sm text-ink-600">{message}</p> : null}
        </form>
      </Card>

      <Card className="space-y-3" tone="muted">
        <h3 className="text-xl font-bold text-ink-900">Thành tích thực chiến</h3>
        <p className="text-sm text-ink-600">Số dự án đã hoàn thành: {profile?.completedProjectsCount ?? 0}</p>
        <p className="text-sm text-ink-600">Điểm đánh giá trung bình từ SME: {(profile?.avgRating ?? 0).toFixed(1)}</p>
        <ul className="space-y-1 text-sm text-ink-700">
          {(profile?.completedProjects ?? []).map((project) => (
            <li className="rounded-md border border-ink-100 bg-white px-3 py-2" key={project.id}>
              {project.title}
            </li>
          ))}
          {!profile?.completedProjects?.length ? <li className="text-ink-500">Chưa có dự án hoàn thành.</li> : null}
        </ul>
      </Card>
    </div>
  );
}
