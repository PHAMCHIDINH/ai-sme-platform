"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  UserCircle,
  Layers,
  LogOut,
  Loader2,
  Search,
} from "lucide-react";
import { useState } from "react";

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
    <aside className="flex h-full w-72 flex-col border-r-4 border-black bg-yellow-200/70 p-4">
      <div className="mb-4 rounded-md border-2 border-black bg-white p-4 shadow-neo-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-md border-2 border-black bg-violet-200 p-1 shadow-neo-sm">
            <Layers className="h-5 w-5" />
          </div>
          <span className="text-lg font-black">
            VnSME<span className="text-violet-700">Match</span>
          </span>
        </Link>
      </div>

      <div className="mb-4 rounded-md border-2 border-black bg-cyan-200 p-3 shadow-neo-sm">
        <div className="mb-1 text-xs font-extrabold uppercase tracking-[0.08em] text-foreground/70">
          Người dùng
        </div>
        <div className="truncate text-sm font-bold">{userName}</div>
        <div className="text-xs font-semibold text-foreground/70">
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
                variant={isActive ? "default" : "outline"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-pink-200 hover:bg-pink-300"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 border-t-2 border-black pt-4">
        <Button
          variant="destructive"
          className="w-full justify-start"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Đăng xuất
        </Button>
      </div>
    </aside>
  );
}
