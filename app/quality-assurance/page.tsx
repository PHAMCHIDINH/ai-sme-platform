import Link from "next/link";
import {
  ArrowRight,
  CheckSquare,
  Medal,
  Microscope,
  ShieldCheck,
  Target,
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { PageHeader, SectionCard, WorkflowStep } from "@/components/patterns/b2b";
import { Button } from "@/components/retroui/Button";

export default function QualityAssurancePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <Navbar />

      <main className="page-wrap flex flex-1 flex-col gap-16 pb-16 pt-28 md:pt-32">
        <PageHeader
          eyebrow="Đảm bảo chất lượng"
          title="Một quy trình để doanh nghiệp không phải đánh cược với năng lực được tự khai báo."
          description="Matching chỉ có giá trị khi đi kèm với tín hiệu chất lượng. Trang này mô tả cách hệ thống có thể mở rộng theo hướng kiểm tra, xác nhận và ưu tiên ứng viên phù hợp hơn."
        />

        <section className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="Rủi ro cần giải quyết"
            description="Hồ sơ có thể thể hiện tốt hơn năng lực thực tế nếu thiếu lớp xác minh."
          >
            <p className="text-sm leading-7 text-text-muted">
              Với SME, sai lệch giữa mô tả kỹ năng và khả năng thực hiện là một rủi ro vận hành. Điều đó làm mất thời gian,
              tăng chi phí điều phối và ảnh hưởng trực tiếp tới chất lượng đầu ra của dự án.
            </p>
          </SectionCard>

          <SectionCard
            title="Nguyên tắc QA"
            description="QA không thay thế matching; QA bổ sung tín hiệu để matching đáng tin hơn."
          >
            <p className="text-sm leading-7 text-text-muted">
              Hệ thống ưu tiên một quy trình gồm tự khai báo, kiểm tra, xác thực tín hiệu và chỉ khi đó mới dùng các dữ liệu đó
              để nâng chất lượng gợi ý cho doanh nghiệp.
            </p>
          </SectionCard>
        </section>

        <section className="space-y-6">
          <div className="space-y-3">
            <span className="eyebrow">Luồng đề xuất</span>
            <h2 className="section-title text-3xl md:text-4xl">Bốn bước để biến matching thành một tín hiệu có thể tin dùng hơn.</h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-4">
            <WorkflowStep
              step="Bước 1"
              title="Self-assessment"
              description="Sinh viên khai báo kỹ năng, lĩnh vực quan tâm và các sản phẩm đã thực hiện."
              icon={Target}
            />
            <WorkflowStep
              step="Bước 2"
              title="Platform testing"
              description="Năng lực có thể được kiểm tra bằng quiz hoặc bài thực hành phù hợp với từng nhóm kỹ năng."
              icon={CheckSquare}
            />
            <WorkflowStep
              step="Bước 3"
              title="Verified signal"
              description="Kết quả kiểm tra tạo thêm một tín hiệu để hiển thị trên hồ sơ và hỗ trợ sắp xếp ứng viên."
              icon={Medal}
            />
            <WorkflowStep
              step="Bước 4"
              title="Quality matching"
              description="Doanh nghiệp có thêm một lớp dữ liệu trước khi quyết định mời, phỏng vấn hoặc giao việc."
              icon={Microscope}
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Giá trị cho doanh nghiệp" description="Tăng khả năng ra quyết định dựa trên nhiều tín hiệu hơn.">
            <ul className="space-y-3 text-sm leading-7 text-text-muted">
              <li>Giảm thời gian sàng lọc ban đầu trước khi trao đổi sâu hơn với ứng viên.</li>
              <li>Có thêm dữ liệu để phân biệt giữa mức độ phù hợp trên hồ sơ và năng lực thực hiện.</li>
              <li>Đưa chất lượng ứng viên về gần hơn với yêu cầu thực tế của dự án.</li>
            </ul>
          </SectionCard>

          <SectionCard title="Giá trị cho sinh viên" description="Năng lực được thể hiện bằng tín hiệu có cấu trúc, không chỉ bằng mô tả.">
            <ul className="space-y-3 text-sm leading-7 text-text-muted">
              <li>Hồ sơ đáng tin hơn khi đi kèm với kết quả kiểm tra hoặc đánh giá thực tế.</li>
              <li>Dễ nổi bật hơn nhờ tín hiệu chất lượng thay vì chỉ cạnh tranh bằng cách viết CV.</li>
              <li>Biết mình đang ở đâu và cần cải thiện kỹ năng nào để phù hợp hơn với dự án doanh nghiệp.</li>
            </ul>
          </SectionCard>
        </section>

        <section className="surface-card flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="eyebrow">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Trust-first workflow
            </div>
            <h2 className="text-2xl font-semibold text-text-strong">Bắt đầu với một quy trình giao việc rõ ràng hơn.</h2>
            <p className="max-w-2xl text-sm leading-7 text-text-muted">
              Nếu bạn muốn thử hành trình từ chuẩn hóa brief đến quản lý tiến độ, có thể bắt đầu bằng luồng tạo dự án trong hệ thống.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/register">
              Vào nền tảng <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-border-subtle bg-white/90 py-6 text-center text-sm text-text-muted">
        VnSMEMatch © 2026. Tập trung vào matching có kiểm soát và tín hiệu chất lượng rõ ràng hơn.
      </footer>
    </div>
  );
}
