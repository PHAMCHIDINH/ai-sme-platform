import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Building2, GraduationCap, Zap, Sparkles, Target, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect(session.user.role === "SME" ? "/sme/dashboard" : "/student/dashboard");
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="absolute top-0 inset-x-0 h-screen bg-gradient-to-b from-blue-50/50 via-white to-white -z-10 dark:from-slate-900 dark:via-background dark:to-background" />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-400/20 blur-[100px] -z-10 pointer-events-none" />

      <Navbar />

      <main className="flex-1 w-full flex flex-col items-center pt-32 lg:pt-40">
        
        {/* --- Hero Section --- */}
        <section className="w-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-blue-100/50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 mr-2 inline-block" /> Nền tảng kết nối số 1 Việt Nam
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance max-w-5xl leading-tight">
            Nơi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Thực Chiến</span> Gặp Gỡ <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Doanh Nghiệp</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-balance leading-relaxed">
            Kết nối sinh viên IT tài năng với các bài toán số hóa thực tế từ doanh nghiệp SME. Trải nghiệm làm việc chuyên nghiệp, xây dựng CV thực chiến và tạo ra giá trị doanh nghiệp.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
            <Link href="/register?role=student">
              <Button size="lg" className="w-full sm:w-auto text-base rounded-full px-8 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/20 transition-all hover:scale-105">
                <GraduationCap className="mr-2 w-5 h-5" /> Tôi là Sinh viên
              </Button>
            </Link>
            <Link href="/register?role=sme">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base rounded-full px-8 h-14 bg-background/50 backdrop-blur-sm border-2 hover:bg-muted transition-all hover:scale-105">
                <Building2 className="mr-2 w-5 h-5" /> Tôi là Doanh nghiệp
              </Button>
            </Link>
          </div>
          
          {/* Dashboard Preview Mockup */}
          <div className="w-full max-w-5xl mx-auto mt-16 p-2 md:p-4 rounded-3xl bg-gradient-to-b from-white/40 to-white/10 dark:from-slate-800/40 dark:to-slate-800/10 border border-white/20 dark:border-white/5 shadow-2xl backdrop-blur-md">
            <div className="rounded-2xl overflow-hidden border bg-background/95 shadow-inner">
              <div className="h-8 bg-muted border-b flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="p-8 grid md:grid-cols-3 gap-6 h-[400px]">
                {/* Mock UI elements */}
                <div className="col-span-1 space-y-4">
                  <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-24 bg-blue-100/50 dark:bg-blue-900/20 rounded-xl" />
                  <div className="h-24 bg-muted/50 rounded-xl" />
                  <div className="h-24 bg-muted/50 rounded-xl" />
                </div>
                <div className="col-span-2 space-y-4">
                  <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                  <div className="h-48 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 bg-muted/50 rounded-xl" />
                    <div className="h-32 bg-muted/50 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Partners/Trust Section --- */}
        <section className="w-full border-y bg-muted/30 mt-20 py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
              Được tin dùng bởi
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale">
              <span className="text-xl font-bold flex items-center"><Zap className="mr-2" />TechStartup</span>
              <span className="text-xl font-bold flex items-center"><Target className="mr-2" />SMESolutions</span>
              <span className="text-xl font-bold flex items-center"><Users className="mr-2" />EduConnect</span>
              <span className="text-xl font-bold flex items-center"><Building2 className="mr-2" />VNRetail</span>
            </div>
          </div>
        </section>

        {/* --- Features Section --- */}
        <section id="features" className="w-full max-w-7xl mx-auto px-4 md:px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Giải pháp <span className="text-primary">Win-Win</span></h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Nền tảng ứng dụng AI để ghép nối nhu cầu số hóa của doanh nghiệp với năng lực của sinh viên một cách hoàn hảo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* SME Features */}
            <Card className="p-8 rounded-3xl border-2 hover:border-blue-500/50 transition-colors bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Dành cho Doanh Nghiệp (SME)</h3>
              <ul className="space-y-4">
                {[
                  "Phát hành dự án số hóa đơn giản, dễ dàng.",
                  "AI hỗ trợ chuẩn hóa mô tả yêu cầu chuyên nghiệp.",
                  "Nhận ngay danh sách ứng viên phù hợp nhờ AI Matching.",
                  "Theo dõi tiến độ trực quan, nghiệm thu nhanh chóng."
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button variant="link" className="mt-6 px-0 text-blue-600">Tìm hiểu thêm <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </Card>

            {/* Student Features */}
            <Card className="p-8 rounded-3xl border-2 hover:border-indigo-500/50 transition-colors bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Dành cho Sinh Viên</h3>
              <ul className="space-y-4">
                {[
                  "Xây dựng hồ sơ năng lực thực chiến, chuyên nghiệp.",
                  "Nhận gợi ý dự án phù hợp với kỹ năng định hướng.",
                  "Tích lũy kinh nghiệm làm việc thực tế với doanh nghiệp.",
                  "Nhận đánh giá và xác thực năng lực sau mỗi dự án."
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button variant="link" className="mt-6 px-0 text-indigo-600">Bắt đầu ngay <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </Card>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <span className="font-bold text-xl tracking-tight mb-4 inline-block">VnSME<span className="text-primary">Match</span></span>
            <p className="text-muted-foreground text-sm max-w-sm">
              Nền tảng kết nối nhân tài ngành IT (sinh viên) với các nhu cầu chuyển đổi số thực tế từ doanh nghiệp vừa và nhỏ tại Việt Nam.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Sản phẩm</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Đăng dự án</Link></li>
              <li><Link href="#" className="hover:text-foreground">Tìm ứng viên</Link></li>
              <li><Link href="#" className="hover:text-foreground">Tạo hồ sơ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Hướng dẫn</Link></li>
              <li><Link href="#" className="hover:text-foreground">Chính sách</Link></li>
              <li><Link href="#" className="hover:text-foreground">Liên hệ</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 mt-8 border-t text-sm text-muted-foreground text-center md:text-left flex flex-col md:flex-row justify-between items-center">
          <p>© 2026 VnSMEMatch. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-foreground">Điều khoản</Link>
            <Link href="#" className="hover:text-foreground">Bảo mật</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
