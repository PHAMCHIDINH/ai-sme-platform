"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  UserCircle,
  Layers,
  LogOut,
  Loader2,
} from "lucide-react";
import { useState } from "react";

const routes = {
  SME: [
    { name: "Tổng quan", href: "/sme/dashboard", icon: LayoutDashboard },
    { name: "Dự án của tôi", href: "/sme/projects", icon: FolderKanban },
    { name: "Đăng dự án mới", href: "/sme/projects/new", icon: PlusCircle },
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
    <div className="flex h-full w-64 flex-col border-r bg-muted/30">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1 border rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg">
            VnSME<span className="text-primary">Match</span>
          </span>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 rounded-xl bg-primary/10 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shrink-0">
            <UserCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{userName}</div>
            <div className="text-xs text-muted-foreground">
              {role === "SME" ? "Doanh nghiệp" : "Sinh viên"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href) &&
              item.href !== "/sme/dashboard" &&
              item.href !== "/student/dashboard");
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start font-medium",
                  isActive
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t space-y-1">
        <ThemeToggle className="w-full justify-start" showLabel />
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="mr-3 h-5 w-5" />
          )}
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
