import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  MessagesSquare,
  Sparkles,
  Target,
} from "lucide-react";

import { auth } from "@/auth";
import { Navbar } from "@/components/layout/navbar";
import { WorkflowStep } from "@/components/patterns/b2b";
import { Badge } from "@/components/retroui/Badge";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/retroui/Card";

const enterpriseBenefits = [
  "Mô tả nhu cầu theo ngôn ngữ kinh doanh, hệ thống hỗ trợ chuẩn hóa thành brief rõ ràng.",
  "Tìm ứng viên phù hợp dựa trên kỹ năng, mức độ phù hợp và tiến độ thực hiện.",
  "Theo dõi dự án từ lúc mở brief đến khi bàn giao và đánh giá kết quả.",
];

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect(session.user.role === "SME" ? "/sme/dashboard" : "/student/dashboard");
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <Navbar />

      <main className="page-wrap flex flex-1 flex-col gap-20 pb-16 pt-28 md:pt-32">
        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="page-hero flex flex-col justify-between gap-8">
            <div className="space-y-5">
              <span className="eyebrow">
                <Sparkles className="h-4 w-4 text-primary" />
                Nền tảng phối hợp giữa SME và sinh viên
              </span>

              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight tracking-tight text-text-strong md:text-6xl">
                  Giúp doanh nghiệp viết đúng bài toán, tìm đúng người thực hiện và theo dõi dự án rõ ràng hơn.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-text-muted">
                  VnSMEMatch hỗ trợ SME chuẩn hóa nhu cầu bằng AI, kết nối với sinh viên có năng lực phù hợp
                  và đưa toàn bộ quá trình triển khai về một luồng làm việc có cấu trúc.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/register?role=sme">
                    Tôi là doanh nghiệp <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/register?role=student">Tôi là sinh viên</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="surface-card-muted bg-violet-200 p-4">
                <div className="detail-kicker text-violet-950 font-bold">Đầu vào</div>
                <div className="mt-2 text-sm font-bold text-text-strong">Nhu cầu kinh doanh thô</div>
              </div>
              <div className="surface-card-muted bg-pink-200 p-4">
                <div className="detail-kicker text-pink-950 font-bold">Xử lý</div>
                <div className="mt-2 text-sm font-bold text-text-strong">AI chuẩn hóa brief và tiêu chí</div>
              </div>
              <div className="surface-card-muted bg-green-200 p-4">
                <div className="detail-kicker text-green-950 font-bold">Đầu ra</div>
                <div className="mt-2 text-sm font-bold text-text-strong">Ứng viên phù hợp và tiến độ minh bạch</div>
              </div>
            </div>
          </div>

          <Card className="bg-cyan-100">
            <CardHeader className="space-y-3">
              <Badge variant="secondary" className="w-fit bg-white border-2 border-border shadow-neo-sm font-bold text-text-strong hover:bg-white">
                Mô phỏng luồng vận hành
              </Badge>
              <CardTitle className="text-xl">Bảng điều phối dự án mẫu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="surface-card-muted bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="detail-kicker font-bold">Dự án</p>
                    <p className="mt-2 text-base font-bold text-text-strong">
                      Xây quy trình quản lý đơn hàng nội bộ cho SME bán lẻ
                    </p>
                  </div>
                  <Badge className="bg-green-300 text-green-950 border-2 border-border hover:bg-green-400 font-bold">Đang mở</Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="surface-card-muted p-4">
                  <div className="detail-kicker">Brief chuẩn hóa</div>
                  <p className="mt-2 text-sm leading-6 text-text-muted">
                    Mục tiêu, phạm vi, đầu ra và kỹ năng yêu cầu được cấu trúc lại trước khi đăng dự án.
                  </p>
                </div>
                <div className="surface-card-muted p-4">
                  <div className="detail-kicker">Ứng viên phù hợp</div>
                  <p className="mt-2 text-sm leading-6 text-text-muted">
                    Hệ thống hiển thị điểm phù hợp, kỹ năng nổi bật và trạng thái ứng tuyển.
                  </p>
                </div>
              </div>

              <div className="surface-card p-4">
                <div className="detail-kicker">Quy trình triển khai</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Chuẩn hóa nhu cầu", "Mở tuyển", "Theo dõi tiến độ", "Nghiệm thu"].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border-subtle bg-surface-muted px-3 py-1 text-xs font-medium text-text-muted"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="benefits" className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            <span className="eyebrow">Giá trị cho doanh nghiệp</span>
            <h2 className="section-title text-3xl md:text-4xl">
              Từ nhu cầu chưa rõ ràng đến một brief có thể giao việc và kiểm soát được.
            </h2>
            <p className="section-subtitle max-w-xl">
              Thay vì bắt SME tự chuyển ngôn ngữ kinh doanh sang ngôn ngữ kỹ thuật, hệ thống hỗ trợ làm rõ đầu
              bài, tiêu chí và đầu ra trước khi ghép nối.
            </p>
          </div>
          <div className="grid gap-4">
            {enterpriseBenefits.map((item, index) => {
              const bgColors = ["bg-yellow-200", "bg-orange-200", "bg-lime-200"];
              return (
                <div key={item} className={`surface-card flex items-start gap-4 p-5 ${bgColors[index]}`}>
                  <div className="rounded-xl border-2 border-border bg-white p-2 shadow-neo-sm shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-text-strong" />
                  </div>
                  <p className="text-sm font-medium leading-7 text-text-strong">{item}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="features" className="space-y-6">
          <div className="space-y-3">
            <span className="eyebrow">Cách sản phẩm vận hành</span>
            <h2 className="section-title text-3xl md:text-4xl">Một quy trình đủ rõ để SME tin tưởng giao việc.</h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <WorkflowStep
              step="Bước 1"
              title="Làm rõ nhu cầu bằng AI"
              description="Doanh nghiệp mô tả bài toán theo ngôn ngữ kinh doanh, hệ thống hỏi lại và chuẩn hóa thành brief có cấu trúc."
              icon={MessagesSquare}
            />
            <WorkflowStep
              step="Bước 2"
              title="Ghép nối theo năng lực"
              description="Sinh viên được hiển thị theo mức độ phù hợp và tín hiệu năng lực, thay vì chỉ dựa trên mô tả CV."
              icon={Target}
            />
            <WorkflowStep
              step="Bước 3"
              title="Theo dõi và nghiệm thu"
              description="Tiến độ, mốc công việc, trạng thái bàn giao và đánh giá được tập trung trong cùng một luồng làm việc."
              icon={LayoutDashboard}
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-yellow-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-xl border-2 border-border bg-white p-2 shadow-neo-sm">
                  <BriefcaseBusiness className="h-5 w-5 text-text-strong" />
                </div>
                Dành cho doanh nghiệp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Chuẩn hóa yêu cầu và giảm rủi ro giao việc sai đầu bài.",
                "Nhìn nhanh ứng viên phù hợp, trạng thái ứng tuyển và mức độ sẵn sàng.",
                "Tổ chức quá trình thực hiện theo mốc, cập nhật và bàn giao.",
              ].map((item) => (
                <p key={item} className="flex items-start gap-3 text-sm font-medium leading-7 text-text-strong">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-text-strong" />
                  <span>{item}</span>
                </p>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-pink-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-xl border-2 border-border bg-white p-2 shadow-neo-sm">
                  <GraduationCap className="h-5 w-5 text-text-strong" />
                </div>
                Dành cho sinh viên
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Tiếp cận bài toán thực tế có đầu ra và bối cảnh doanh nghiệp rõ ràng.",
                "Hiểu mình phù hợp với dự án nào thông qua tín hiệu matching và đánh giá.",
                "Tích lũy kinh nghiệm thực chiến thay vì chỉ làm bài tập mô phỏng.",
              ].map((item) => (
                <p key={item} className="flex items-start gap-3 text-sm font-medium leading-7 text-text-strong">
                  <FileCheck2 className="mt-1 h-5 w-5 shrink-0 text-text-strong" />
                  <span>{item}</span>
                </p>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border-subtle bg-white/90 py-10">
        <div className="page-wrap grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <div className="text-lg font-semibold text-text-strong">
              VnSME<span className="text-primary">Match</span>
            </div>
            <p className="max-w-sm text-sm leading-7 text-text-muted">
              Nền tảng kết nối bài toán thực tế của doanh nghiệp với sinh viên có năng lực phù hợp và quy trình làm việc rõ ràng.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-strong">Năng lực cốt lõi</h4>
            <ul className="mt-3 space-y-2 text-sm text-text-muted">
              <li>AI chuẩn hóa brief</li>
              <li>Matching theo kỹ năng</li>
              <li>Theo dõi tiến độ dự án</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-strong">Điểm vào chính</h4>
            <ul className="mt-3 space-y-2 text-sm text-text-muted">
              <li>Đăng ký doanh nghiệp</li>
              <li>Đăng ký sinh viên</li>
              <li>Đăng nhập hệ thống</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
