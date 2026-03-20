import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  BrainCircuit,
  Code,
  Lightbulb,
  Rocket,
  Users,
  Zap,
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { PageHeader, SectionCard, WorkflowStep } from "@/components/patterns/b2b";
import { Button } from "@/components/retroui/Button";

export default function AboutPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <Navbar />

      <main className="page-wrap flex flex-1 flex-col gap-16 pb-16 pt-28 md:pt-32">
        <PageHeader
          eyebrow="Về sản phẩm"
          title="Một nền tảng giúp SME làm rõ đầu bài và giúp sinh viên tiếp cận công việc thực tế."
          description="VnSMEMatch được thiết kế như một lớp trung gian vận hành giữa nhu cầu kinh doanh, brief kỹ thuật và năng lực thực thi của sinh viên."
        />

        <section className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="Bài toán thị trường"
            description="Nhiều SME hiểu rõ mục tiêu kinh doanh nhưng thiếu cấu trúc để mô tả nhu cầu cho người triển khai."
          >
            <p className="text-sm leading-7 text-text-muted">
              Chi phí thuê nhân sự phù hợp có thể cao, trong khi sinh viên lại thiếu cơ hội làm việc với yêu cầu thật.
              Điều còn thiếu không chỉ là một nơi đăng bài, mà là một quy trình để biến nhu cầu kinh doanh thành công việc có thể giao.
            </p>
          </SectionCard>

          <SectionCard
            title="Vai trò của VnSMEMatch"
            description="Sản phẩm đóng vai trò như lớp chuẩn hóa và điều phối quy trình, không chỉ là bảng tin tuyển cộng tác viên."
          >
            <p className="text-sm leading-7 text-text-muted">
              Hệ thống hỗ trợ SME làm rõ nhu cầu, hiển thị ứng viên phù hợp theo tín hiệu năng lực và tạo ra một không gian
              quản lý tiến độ, bàn giao, đánh giá trong cùng một hành trình sử dụng.
            </p>
          </SectionCard>
        </section>

        <section className="space-y-6">
          <div className="space-y-3">
            <span className="eyebrow">Ba lớp giá trị</span>
            <h2 className="section-title text-3xl md:text-4xl">AI được dùng để làm rõ, chuẩn hóa và ghép nối.</h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <WorkflowStep
              step="Lớp 1"
              title="Làm rõ nhu cầu"
              description="AI chat đóng vai trò như một lớp hỏi lại có cấu trúc để chuyển mô tả ban đầu thành brief rõ hơn."
              icon={Lightbulb}
            />
            <WorkflowStep
              step="Lớp 2"
              title="Chuẩn hóa đầu bài"
              description="Thông tin được sắp xếp thành mô tả dự án, kỳ vọng đầu ra, kỹ năng cần có và mức độ triển khai."
              icon={BrainCircuit}
            />
            <WorkflowStep
              step="Lớp 3"
              title="Ghép nối có kiểm soát"
              description="Hệ thống gợi ý ứng viên dựa trên tín hiệu kỹ năng và đưa toàn bộ tiến độ về cùng một dashboard."
              icon={Zap}
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <SectionCard title="Dành cho SME" description="Ưu tiên sự rõ ràng và khả năng kiểm soát.">
            <div className="space-y-3 text-sm leading-7 text-text-muted">
              <p className="flex gap-3">
                <BriefcaseBusiness className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <span>Giảm rủi ro giao việc sai yêu cầu bằng brief có cấu trúc.</span>
              </p>
              <p className="flex gap-3">
                <Rocket className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <span>Rút ngắn thời gian từ mô tả nhu cầu đến lúc mở dự án và nhận ứng viên.</span>
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Dành cho sinh viên" description="Ưu tiên bài toán thật và tín hiệu năng lực rõ hơn.">
            <div className="space-y-3 text-sm leading-7 text-text-muted">
              <p className="flex gap-3">
                <Code className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <span>Tiếp cận yêu cầu từ doanh nghiệp với đầu ra và bối cảnh sử dụng cụ thể.</span>
              </p>
              <p className="flex gap-3">
                <Users className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <span>Tích lũy kinh nghiệm thực chiến thay vì chỉ làm các đề bài mô phỏng.</span>
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Nguyên tắc sản phẩm" description="AI hỗ trợ quyết định, không thay thế trách nhiệm vận hành.">
            <p className="text-sm leading-7 text-text-muted">
              VnSMEMatch ưu tiên minh bạch đầu vào, cấu trúc dữ liệu rõ ràng và khả năng kiểm soát trạng thái dự án. AI là lớp
              hỗ trợ làm rõ, không phải một hộp đen thay người dùng ra quyết định.
            </p>
          </SectionCard>
        </section>

        <section className="surface-card flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-text-strong">Muốn xem sản phẩm vận hành như thế nào trong thực tế?</h2>
            <p className="max-w-2xl text-sm leading-7 text-text-muted">
              Bạn có thể bắt đầu bằng việc đăng vai trò phù hợp và trải nghiệm luồng tạo project hoặc luồng nhận việc trong hệ thống.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/register">
              Trải nghiệm nền tảng <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-border-subtle bg-white/90 py-6 text-center text-sm text-text-muted">
        VnSMEMatch © 2026. Nền tảng kết nối nhu cầu SME với năng lực thực thi của sinh viên.
      </footer>
    </div>
  );
}
