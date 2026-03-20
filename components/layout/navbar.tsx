"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Layers, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/retroui/Button";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4"
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl border-2 border-border px-4 py-3 transition-all md:px-6 ${
          scrolled ? "bg-white shadow-neo-md" : "bg-white shadow-neo-sm"
        }`}
      >
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-xl border-2 border-border bg-violet-300 p-2 shadow-neo-sm">
            <Layers className="h-5 w-5 text-violet-950" />
          </div>
          <div className="space-y-0.5">
            <div className="text-lg font-semibold tracking-tight text-text-strong">
              VnSME<span className="text-primary">Match</span>
            </div>
            <div className="hidden text-xs text-text-muted sm:block">
              Kết nối bài toán SME với năng lực sinh viên
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-text-muted md:flex">
          <Link href="#features" className="transition-colors hover:text-text-strong">
            Cách vận hành
          </Link>
          <Link href="#benefits" className="transition-colors hover:text-text-strong">
            Giá trị
          </Link>
          <Link href="/about" className="transition-colors hover:text-text-strong">
            Sản phẩm
          </Link>
          <Link href="/quality-assurance" className="transition-colors hover:text-text-strong">
            Đảm bảo chất lượng
          </Link>
          <Link href="/ai-standardization" className="transition-colors hover:text-text-strong">
            Chuẩn hóa brief
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild className="hidden sm:inline-flex" variant="outline">
            <Link href="/login">Đăng nhập</Link>
          </Button>
          <Button asChild>
            <Link href="/register">
              Bắt đầu <Sparkles className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
