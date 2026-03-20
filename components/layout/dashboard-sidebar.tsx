"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  FolderKanban,
  LayoutDashboard,
  Layers,
  Loader2,
  LogOut,
  PlusCircle,
  Search,
  UserCircle,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/retroui/Button";
import { cn } from "@/lib/utils";

const routes = {
  SME: [
    { name: "Tổng quan", href: "/sme/dashboard", icon: LayoutDashboard },
    { name: "Dự án của tôi", href: "/sme/projects", icon: FolderKanban },
    { name: "Đăng dự án mới", href: "/sme/projects/new", icon: PlusCircle },
    { name: "Tìm sinh viên", href: "/sme/students", icon: Search },
    { name: "Hồ sơ doanh nghiệp", href: "/sme/profile", icon: UserCircle },
  ],
  STUDENT: [
    { name: "Tổng quan", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "Việc làm gợi ý", href: "/student/projects", icon: FolderKanban },
    { name: "Dự án đang làm", href: "/student/my-projects", icon: Layers },
    { name: "Hồ sơ năng lực", href: "/student/profile", icon: UserCircle },
  ],
};

interface DashboardSidebarProps {
  role: "SME" | "STUDENT";
  userName: string;
}

export function DashboardSidebar({ role, userName }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const menuItems = routes[role] || routes.STUDENT;

  async function handleLogout() {
    setLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <aside className="sticky top-0 flex h-screen w-80 flex-col border-r-2 border-border bg-white px-5 py-5">
      <Link href="/" className="surface-card bg-yellow-100 mb-4 flex items-center gap-3 p-4 hover:shadow-neo-md transition-shadow">
        <div className="rounded-xl border-2 border-border bg-violet-300 p-2 shadow-neo-sm">
          <Layers className="h-5 w-5 text-violet-950" />
        </div>
        <div className="space-y-0.5">
          <div className="text-lg font-bold text-text-strong">
            VnSME<span className="text-primary">Match</span>
          </div>
          <div className="text-xs font-bold text-text-muted">Bảng điều phối dự án</div>
        </div>
      </Link>

      <div className="surface-card-muted bg-cyan-100 mb-4 p-4">
        <div className="detail-kicker font-bold text-cyan-950">Người dùng</div>
        <div className="mt-2 truncate text-base font-bold text-text-strong">{userName}</div>
        <div className="mt-1 text-sm font-bold text-cyan-900">
          {role === "SME" ? "Doanh nghiệp" : "Sinh viên"}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href) &&
              item.href !== "/sme/dashboard" &&
              item.href !== "/student/dashboard");

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start rounded-xl px-4 py-3 text-sm font-bold transition-all",
                  isActive && "border-2 border-border shadow-neo-sm text-white hover:scale-[1.02]",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 border-t-2 border-border pt-4">
        <Button
          variant="outline"
          className="w-full justify-start rounded-xl px-4 py-3 text-sm font-bold border-2 border-border shadow-neo-sm hover:translate-y-[2px] transition-transform"
          disabled={loggingOut}
          onClick={handleLogout}
        >
          {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Đăng xuất
        </Button>
      </div>
    </aside>
  );
}
