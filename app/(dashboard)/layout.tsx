import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as { role?: "SME" | "STUDENT"; name?: string | null; email?: string | null };
  const role = user.role === "SME" ? "SME" : "STUDENT";
  const userName = user.name || user.email || "Người dùng";

  return (
    <div className="flex min-h-screen bg-transparent">
      <div className="hidden md:block">
        <DashboardSidebar role={role} userName={userName} />
      </div>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="mx-4 mt-4 flex items-center justify-between rounded-2xl border-2 border-border bg-white px-4 py-4 shadow-neo-sm md:hidden">
          <div className="space-y-0.5">
            <div className="text-base font-bold text-text-strong">
              VnSME<span className="text-primary">Match</span>
            </div>
            <div className="text-xs font-bold text-text-muted">{role === "SME" ? "Doanh nghiệp" : "Sinh viên"}</div>
          </div>
          <div className="max-w-[180px] truncate text-sm font-bold text-text-strong">{userName}</div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl retro-page">{children}</div>
        </main>
      </div>
    </div>
  );
}
