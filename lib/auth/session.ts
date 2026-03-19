import type { auth } from "@/auth";

export type AppRole = "SME" | "STUDENT";
export type AuthSession = Awaited<ReturnType<typeof auth>>;

export function getSessionUserId(session: AuthSession) {
  const userId = session?.user?.id;
  if (typeof userId !== "string" || userId.length === 0) {
    return null;
  }

  return userId;
}

export function getSessionUserIdByRole(session: AuthSession, role: AppRole) {
  const userId = getSessionUserId(session);
  if (!userId || session?.user?.role !== role) {
    return null;
  }

  return userId;
}
