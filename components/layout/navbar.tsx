"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Layers } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -96 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div
        className={`mx-auto mt-3 flex w-[calc(100%-1.5rem)] max-w-7xl items-center justify-between rounded-md border-2 border-black px-4 py-3 transition-all md:px-6 ${
          scrolled
            ? "bg-yellow-200 shadow-neo-md"
            : "bg-white/95 shadow-neo-sm backdrop-blur"
        }`}
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-md border-2 border-black bg-violet-200 p-1.5 shadow-neo-sm">
            <Layers className="h-5 w-5" />
          </div>
          <span className="text-xl font-black tracking-tight">
            VnSME<span className="text-violet-700">Match</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-bold md:flex">
          <Link href="#features" className="hover:underline">
            Tính năng
          </Link>
          <Link href="#benefits" className="hover:underline">
            Lợi ích
          </Link>
          <Link href="/about" className="hover:underline">
            Về chúng tôi
          </Link>
          <Link href="/quality-assurance" className="hover:underline text-orange-600">
            Quy trình QA
          </Link>
          <Link href="/ai-standardization" className="hover:underline text-rose-600">
            AI Chuẩn hóa
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="outline" className="hidden sm:inline-flex">
              Đăng nhập
            </Button>
          </Link>
          <Link href="/register">
            <Button>
              Bắt đầu ngay <Sparkles className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
