"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowRight, Layers, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { authenticate } from "@/app/actions/auth";
import { Button } from "@/components/retroui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import { Label } from "@/components/retroui/Label";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm font-medium text-danger">{message}</p>;
}

export default function LoginPage() {
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError("");

    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);

    const result = await authenticate(undefined, formData);
    if (result) {
      setServerError(result);
    }
  });

  return (
    <div className="page-wrap flex min-h-screen items-center py-10">
      <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="surface-card bg-yellow-100 hidden flex-col justify-between p-8 lg:flex">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 hover:scale-[1.02] transition-transform">
              <div className="rounded-xl border-2 border-border bg-violet-300 p-2 shadow-neo-sm">
                <Layers className="h-5 w-5 text-violet-950" />
              </div>
              <div>
                <div className="text-lg font-bold text-text-strong">
                  VnSME<span className="text-primary">Match</span>
                </div>
                <div className="text-xs font-bold text-text-muted">Đăng nhập để tiếp tục phiên làm việc</div>
              </div>
            </Link>

            <div className="space-y-3">
              <span className="eyebrow">Không gian làm việc tập trung</span>
              <h1 className="text-4xl font-semibold leading-tight text-text-strong">
                Quay lại dashboard để theo dõi dự án, ứng viên và tiến độ đang xử lý.
              </h1>
              <p className="max-w-lg text-base leading-8 text-text-muted">
                Tài khoản đăng nhập dùng chung cho SME và sinh viên. Sau khi vào hệ thống, bạn sẽ được chuyển
                đến không gian làm việc tương ứng với vai trò của mình.
              </p>
            </div>
          </div>

          <div className="surface-card-muted bg-white flex items-start gap-4 p-5">
            <div className="rounded-xl border-2 border-border bg-cyan-200 p-3 shadow-neo-sm shrink-0">
              <ShieldCheck className="h-5 w-5 text-cyan-950" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-text-strong">Truy cập theo quy trình</h2>
              <p className="text-sm font-medium leading-7 text-text-muted">
                Người dùng được điều hướng về đúng dashboard, giữ nguyên logic auth và quyền truy cập hiện tại.
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-white">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
            <CardDescription className="font-medium text-text-muted">Tiếp tục với tài khoản của bạn để truy cập không gian làm việc.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  autoComplete="email"
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  {...register("email")}
                />
                <FieldError message={errors.email?.message} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <span className="text-sm text-text-muted">Quên mật khẩu? (Sắp có)</span>
                </div>
                <Input
                  autoComplete="current-password"
                  id="password"
                  type="password"
                  {...register("password")}
                />
                <FieldError message={errors.password?.message} />
              </div>

              {serverError ? (
                <div className="rounded-2xl border border-danger/20 bg-red-50 px-4 py-3 text-sm text-danger">
                  {serverError}
                </div>
              ) : null}

              <Button className="mt-4 w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 text-center text-sm text-text-muted">
            <div>
              Chưa có tài khoản?{" "}
              <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
                Đăng ký ngay
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
