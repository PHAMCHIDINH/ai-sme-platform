"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, Building2, GraduationCap, Layers, Loader2 } from "lucide-react";

import { register as registerAction } from "@/app/actions/auth";
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
import { cn } from "@/lib/utils";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm font-medium text-danger">{message}</p>;
}

function RegisterForm() {
  const [serverError, setServerError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "STUDENT",
    },
  });

  const role = watch("role");

  useEffect(() => {
    const presetRole = searchParams.get("role");
    if (presetRole === "sme") setValue("role", "SME");
    if (presetRole === "student") setValue("role", "STUDENT");
  }, [searchParams, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError("");

    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("email", values.email);
    formData.set("password", values.password);
    formData.set("role", values.role);

    const result = await registerAction(undefined, formData);
    if (result === "SUCCESS") {
      router.push("/login?registered=true");
      return;
    }

    setServerError(result || "Lỗi không xác định");
  });

  return (
    <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="surface-card hidden flex-col justify-between p-8 lg:flex">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-2xl border border-border-subtle bg-brand-100 p-2 shadow-neo-sm">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-lg font-semibold text-text-strong">
                VnSME<span className="text-primary">Match</span>
              </div>
              <div className="text-xs text-text-muted">Thiết lập tài khoản để bắt đầu luồng làm việc</div>
            </div>
          </Link>

          <div className="space-y-3">
            <span className="eyebrow">Tạo tài khoản theo vai trò</span>
            <h1 className="text-4xl font-semibold leading-tight text-text-strong">
              Mỗi vai trò có một không gian điều phối riêng, nhưng cùng nằm trên một quy trình sản phẩm thống nhất.
            </h1>
            <p className="max-w-lg text-base leading-8 text-text-muted">
              Doanh nghiệp dùng hệ thống để chuẩn hóa brief và quản lý dự án. Sinh viên dùng hệ thống để xây hồ sơ,
              nhận gợi ý và theo dõi tiến độ công việc thực tế.
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="surface-card-muted p-4">
            <div className="text-sm font-semibold text-text-strong">Doanh nghiệp</div>
            <p className="mt-2 text-sm leading-7 text-text-muted">
              Tạo project, theo dõi ứng viên, quản lý tiến độ và nghiệm thu đầu ra.
            </p>
          </div>
          <div className="surface-card-muted p-4">
            <div className="text-sm font-semibold text-text-strong">Sinh viên</div>
            <p className="mt-2 text-sm leading-7 text-text-muted">
              Hoàn thiện hồ sơ, nhận gợi ý phù hợp và tham gia các dự án thực chiến từ SME.
            </p>
          </div>
        </div>
      </div>

      <Card className="bg-white">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Tạo tài khoản</CardTitle>
          <CardDescription>Chọn vai trò phù hợp để bắt đầu sử dụng nền tảng.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={onSubmit}>
            <input type="hidden" {...register("role")} />

            <div className="grid grid-cols-2 gap-3">
              <button
                className={cn(
                  "rounded-2xl border p-4 text-left transition-colors",
                  role === "STUDENT"
                    ? "border-primary/20 bg-brand-100 shadow-neo-sm"
                    : "border-border-subtle bg-white hover:bg-surface-muted",
                )}
                onClick={() => setValue("role", "STUDENT", { shouldValidate: true })}
                type="button"
              >
                <GraduationCap className="h-5 w-5 text-primary" />
                <div className="mt-3 text-sm font-semibold text-text-strong">Sinh viên</div>
                <div className="mt-1 text-xs leading-6 text-text-muted">Tìm dự án phù hợp và xây kinh nghiệm thực tế.</div>
              </button>

              <button
                className={cn(
                  "rounded-2xl border p-4 text-left transition-colors",
                  role === "SME"
                    ? "border-primary/20 bg-brand-100 shadow-neo-sm"
                    : "border-border-subtle bg-white hover:bg-surface-muted",
                )}
                onClick={() => setValue("role", "SME", { shouldValidate: true })}
                type="button"
              >
                <Building2 className="h-5 w-5 text-primary" />
                <div className="mt-3 text-sm font-semibold text-text-strong">Doanh nghiệp</div>
                <div className="mt-1 text-xs leading-6 text-text-muted">Chuẩn hóa nhu cầu và điều phối dự án với sinh viên.</div>
              </button>
            </div>
            <FieldError message={errors.role?.message} />

            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                placeholder={role === "STUDENT" ? "Nguyễn Văn A" : "Tên công ty / Người đại diện"}
                {...register("name")}
              />
              <FieldError message={errors.name?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="name@example.com" type="email" {...register("email")} />
              <FieldError message={errors.email?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input autoComplete="new-password" id="password" type="password" {...register("password")} />
              <FieldError message={errors.password?.message} />
            </div>

            {serverError ? (
              <div className="rounded-2xl border border-danger/20 bg-red-50 px-4 py-3 text-sm text-danger">
                {serverError}
              </div>
            ) : null}

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tạo tài khoản...
                </>
              ) : (
                <>
                  Tạo tài khoản
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 text-center text-sm text-text-muted">
          <div>
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="page-wrap flex min-h-screen items-center py-10">
      <Suspense
        fallback={
          <div className="mx-auto animate-spin text-foreground">
            <Loader2 className="h-8 w-8" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
