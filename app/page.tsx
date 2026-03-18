import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  "SME đăng bài toán thực chiến trong vài phút",
  "Sinh viên tạo hồ sơ kỹ năng và nhận dự án phù hợp",
  "AI matching dựa trên embedding kỹ năng - yêu cầu",
  "Theo dõi tiến độ, bàn giao và đánh giá hai chiều",
];

export default async function Home() {
  const session = await auth();

  if (session?.user?.role === "SME") {
    redirect("/sme/dashboard");
  }

  if (session?.user?.role === "STUDENT") {
    redirect("/student/dashboard");
  }

  return (
    <main className="page-wrap py-14 md:py-20">
      <section className="fade-in grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div className="space-y-6">
          <p className="kicker">AI Matching Platform</p>
          <h1 className="text-4xl font-bold leading-tight text-ink-900 md:text-6xl">
            Kết nối sinh viên với bài tập thực chiến từ doanh nghiệp SME
          </h1>
          <p className="max-w-2xl text-base text-ink-600 md:text-lg">
            Một workspace duy nhất để SME đăng bài toán, sinh viên ứng tuyển, theo dõi tiến độ và đánh giá đầu ra sau dự án.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button size="lg">Tạo tài khoản</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary">
                Đăng nhập
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge tone="info">SME</Badge>
            <Badge tone="success">Sinh viên</Badge>
            <Badge tone="neutral">Realtime Collaboration</Badge>
          </div>
        </div>

        <Card className="space-y-4" tone="highlight" padding="lg">
          <h2 className="text-xl font-bold text-ink-900">Giá trị cốt lõi</h2>
          <ul className="space-y-2 text-sm text-ink-600">
            {features.map((feature) => (
              <li className="rounded-md border border-brand-100 bg-white/80 px-3 py-2" key={feature}>
                {feature}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3">
        <Card className="space-y-2" tone="muted">
          <h3 className="text-xl font-bold text-ink-900">Dành cho SME</h3>
          <p className="text-sm text-ink-600">Chuẩn hóa brief bằng AI, chọn ứng viên nhanh và theo dõi chất lượng bàn giao.</p>
        </Card>
        <Card className="space-y-2" tone="muted">
          <h3 className="text-xl font-bold text-ink-900">Dành cho sinh viên</h3>
          <p className="text-sm text-ink-600">Tích lũy kinh nghiệm thật từ bài toán doanh nghiệp và nhận đánh giá năng lực rõ ràng.</p>
        </Card>
        <Card className="space-y-2" tone="muted">
          <h3 className="text-xl font-bold text-ink-900">Dành cho hệ sinh thái</h3>
          <p className="text-sm text-ink-600">Rút ngắn khoảng cách kỹ năng và tạo pipeline nhân lực trẻ cho SME.</p>
        </Card>
      </section>
    </main>
  );
}
