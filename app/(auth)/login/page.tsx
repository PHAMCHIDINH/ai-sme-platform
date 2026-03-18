"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SessionResponse = {
  user?: {
    role?: "SME" | "STUDENT";
  };
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Thông tin đăng nhập không đúng.");
      setLoading(false);
      return;
    }

    try {
      const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" });
      const session = (await sessionResponse.json()) as SessionResponse;

      if (session?.user?.role === "SME") {
        router.push("/sme/dashboard");
      } else if (session?.user?.role === "STUDENT") {
        router.push("/student/dashboard");
      } else {
        router.push("/");
      }

      router.refresh();
    } catch {
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-wrap flex min-h-screen items-center py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="glass-panel p-7 md:p-8">
          <p className="kicker">Welcome Back</p>
          <h1 className="mt-4 text-3xl font-bold text-ink-900">Đăng nhập</h1>
          <p className="mt-2 text-sm text-ink-600">Sử dụng email và mật khẩu đã đăng ký để vào workspace của bạn.</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700" htmlFor="email">
                Email
              </label>
              <Input id="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700" htmlFor="password">
                Mật khẩu
              </label>
              <Input
                id="password"
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </div>

            {error ? <p className="rounded-md border border-danger-100 bg-danger-100 px-3 py-2 text-sm text-danger-700">{error}</p> : null}

            <Button className="w-full" loading={loading} type="submit">
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          <p className="mt-5 text-sm text-ink-600">
            Chưa có tài khoản?{" "}
            <Link className="font-semibold text-brand-700" href="/register">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
