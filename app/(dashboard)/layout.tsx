import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex">
        <DashboardSidebar role={role} userName={userName} />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile header */}
        <header className="flex md:hidden h-14 border-b bg-background/95 backdrop-blur items-center justify-between px-4">
          <span className="font-bold text-base">
            VnSME<span className="text-primary">Match</span>
          </span>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">{userName}</div>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
