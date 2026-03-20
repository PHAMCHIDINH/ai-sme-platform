import Link from "next/link";
import {
  ArrowRight,
  Bolt,
  FileJson,
  MessageSquareCode,
  Sparkles,
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { PageHeader, SectionCard, WorkflowStep } from "@/components/patterns/b2b";
import { Button } from "@/components/retroui/Button";

export default function AIStandardizationPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <Navbar />

      <main className="page-wrap flex flex-1 flex-col gap-16 pb-16 pt-28 md:pt-32">
        <PageHeader
          eyebrow="AI chuẩn hóa brief"
          title="Từ mô tả ban đầu của SME đến một đầu bài có thể giao cho người triển khai."
          description="Trang này mô tả lớp AI dùng để hỏi lại, làm rõ và chuyển nhu cầu kinh doanh thành một brief có cấu trúc hơn cho quá trình đăng dự án."
        />

        <section className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="Đầu vào thực tế"
            description="SME thường diễn đạt bằng mục tiêu kinh doanh và mong muốn kết quả, không phải bằng tài liệu kỹ thuật."
          >
            <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-muted p-5 font-mono text-sm leading-7 text-text-muted">
              “Tôi cần một công cụ quản lý đơn hàng và báo cáo cơ bản cho đội bán hàng, ưu tiên triển khai nhanh, phạm vi vừa phải và dễ bàn giao.”
            </div>
          </SectionCard>

          <SectionCard
            title="Mục tiêu của lớp AI"
            description="Không tự quyết thay người dùng, mà làm rõ những gì còn mơ hồ trước khi tạo brief."
          >
            <p className="text-sm leading-7 text-text-muted">
              AI đóng vai trò như một lớp hỏi lại: mục tiêu sử dụng là gì, đầu ra mong muốn là gì, thời gian kỳ vọng ra sao,
              cần kỹ năng nào và giới hạn nào cần được ghi rõ trước khi mở dự án.
            </p>
          </SectionCard>
        </section>

        <section className="space-y-6">
          <div className="space-y-3">
            <span className="eyebrow">Tiến trình chuẩn hóa</span>
            <h2 className="section-title text-3xl md:text-4xl">Ba bước để biến mô tả thô thành brief có cấu trúc.</h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <WorkflowStep
              step="Bước 1"
              title="Tương tác"
              description="AI hỏi lại các điểm thiếu rõ: mục tiêu, phạm vi, nhóm người dùng, đầu ra kỳ vọng và ưu tiên triển khai."
              icon={MessageSquareCode}
            />
            <WorkflowStep
              step="Bước 2"
              title="Cấu trúc hóa"
              description="Hội thoại được bóc tách thành các trường dữ liệu như mô tả, kỹ năng, thời gian, ngân sách và kết quả bàn giao."
              icon={FileJson}
            />
            <WorkflowStep
              step="Bước 3"
              title="Xuất brief"
              description="Từ dữ liệu đã cấu trúc, hệ thống sinh ra một brief rõ hơn để SME kiểm tra, sửa và dùng cho việc đăng dự án."
              icon={Sparkles}
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Trước khi chuẩn hóa" description="Mô tả có thể đúng ý nhưng chưa đủ để giao việc an toàn.">
            <p className="text-sm leading-7 text-text-muted">
              Khi yêu cầu chỉ dừng ở mức “làm một ứng dụng giống X” hoặc “có thêm vài tính năng”, sinh viên rất khó hiểu phạm vi,
              ưu tiên và mức độ hoàn thiện mong đợi. Đây là nguồn gốc của nhiều sai lệch kỳ vọng.
            </p>
          </SectionCard>

          <SectionCard title="Sau khi chuẩn hóa" description="Đầu bài rõ hơn để cả hai bên cùng nhìn vào một cấu trúc chung.">
            <p className="text-sm leading-7 text-text-muted">
              Brief được tách thành các phần rõ ràng như mục tiêu dự án, tính năng chính, kỹ năng cần có, thời lượng triển khai,
              đầu ra bàn giao và các giới hạn cần lưu ý. Người dùng vẫn là người xác nhận cuối cùng trước khi đăng.
            </p>
          </SectionCard>
        </section>

        <section className="surface-card flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="eyebrow">
              <Bolt className="h-4 w-4 text-primary" />
              Brief-first workflow
            </div>
            <h2 className="text-2xl font-semibold text-text-strong">Trải nghiệm luồng tạo project với AI hỗ trợ.</h2>
            <p className="max-w-2xl text-sm leading-7 text-text-muted">
              Luồng tạo project trong dashboard đã được thiết kế để AI đóng vai trò trợ lý vận hành, giúp người dùng đi từ nhu cầu đến form xác nhận.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/register?role=sme">
              Tạo tài khoản doanh nghiệp <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-border-subtle bg-white/90 py-6 text-center text-sm text-text-muted">
        VnSMEMatch © 2026. Brief rõ hơn để phối hợp doanh nghiệp và người triển khai hiệu quả hơn.
      </footer>
    </div>
  );
}
