import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ReactNode } from "react";

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
    <div className="flex h-screen bg-yellow-100/70">
      <div className="hidden md:flex">
        <DashboardSidebar role={role} userName={userName} />
      </div>

      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b-2 border-black bg-yellow-200 px-4 md:hidden">
          <span className="text-base font-black">
            VnSME<span className="text-violet-700">Match</span>
          </span>
          <div className="max-w-[180px] truncate text-sm font-semibold">{userName}</div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto h-full max-w-6xl space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
