import { redirect } from "next/navigation";

import { auth } from "@/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (session) {
    redirect(session.user.role === "SME" ? "/sme/dashboard" : "/student/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.15),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.15),transparent_24%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
