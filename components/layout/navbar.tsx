"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Layers } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-background/70 backdrop-blur-lg border-b border-border shadow-sm py-3" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-xl group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">VnSME<span className="text-primary">Match</span></span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">Tính năng</Link>
          <Link href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">Cách hoạt động</Link>
          <Link href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">Đánh giá</Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:flex rounded-full px-5">Đăng nhập</Button>
          </Link>
          <Link href="/register">
            <Button className="rounded-full px-6 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all">
              Bắt đầu ngay <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
