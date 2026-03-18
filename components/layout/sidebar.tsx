"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

export type SidebarRole = "SME" | "STUDENT";

const SME_ITEMS = [
  { href: "/sme/dashboard", label: "Tổng quan" },
  { href: "/sme/projects", label: "Dự án" },
  { href: "/sme/projects/new", label: "Đăng dự án" },
];

const STUDENT_ITEMS = [
  { href: "/student/dashboard", label: "Tổng quan" },
  { href: "/student/profile", label: "Hồ sơ năng lực" },
  { href: "/student/projects", label: "Dự án gợi ý" },
  { href: "/student/my-projects", label: "Dự án của tôi" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNav({ pathname, role, onNavigate }: { pathname: string; role: SidebarRole; onNavigate?: () => void }) {
  const items = role === "SME" ? SME_ITEMS : STUDENT_ITEMS;

  return (
    <nav className="space-y-1.5">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            className={cn(
              "block rounded-md px-3 py-2.5 text-sm font-semibold transition",
              active ? "bg-brand-600 text-white shadow-card" : "text-ink-700 hover:bg-ink-50",
            )}
            href={item.href}
            key={item.href}
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

type SidebarProps = {
  role: SidebarRole;
  pathname: string;
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ role, pathname, open, onClose }: SidebarProps) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-ink-100 bg-white/90 px-5 py-6 backdrop-blur lg:block">
        <p className="kicker">AI SME Platform</p>
        <h2 className="mt-4 text-2xl font-bold text-ink-900">Workspace</h2>
        <p className="mt-1 text-sm text-ink-500">Vai trò: {role === "SME" ? "Doanh nghiệp" : "Sinh viên"}</p>
        <div className="mt-6">
          <SidebarNav pathname={pathname} role={role} />
        </div>
      </aside>

      {open ? <button aria-label="Đóng điều hướng" className="fixed inset-0 z-30 bg-ink-900/50 lg:hidden" onClick={onClose} type="button" /> : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-ink-100 bg-white px-5 py-6 transition-transform duration-200 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <p className="kicker">AI SME Platform</p>
          <button className="rounded-md p-1 text-ink-500 hover:bg-ink-50" onClick={onClose} type="button">
            Đóng
          </button>
        </div>
        <h2 className="mt-4 text-xl font-bold text-ink-900">Điều hướng</h2>
        <p className="mt-1 text-sm text-ink-500">{role === "SME" ? "Doanh nghiệp" : "Sinh viên"}</p>
        <div className="mt-6">
          <SidebarNav onNavigate={onClose} pathname={pathname} role={role} />
        </div>
      </aside>
    </>
  );
}
