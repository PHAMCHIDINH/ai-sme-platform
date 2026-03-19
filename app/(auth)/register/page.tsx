"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, Layers, Loader2, Building2, GraduationCap } from "lucide-react";

import { register as registerAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
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
    if (presetRole === "sme") {
      setValue("role", "SME");
    }
    if (presetRole === "student") {
      setValue("role", "STUDENT");
    }
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
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-center mb-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-primary-foreground p-2 rounded-xl group-hover:scale-105 transition-transform">
            <Layers className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight">
            VnSME<span className="text-primary">Match</span>
          </span>
        </Link>
      </div>

      <Card className="shadow-xl bg-background/60 backdrop-blur-xl border-white/20 dark:border-white/10 rounded-3xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Tham gia nền tảng</CardTitle>
          <CardDescription>
            Đăng ký để bắt đầu trải nghiệm kết nối doanh nghiệp và sinh viên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <input type="hidden" {...register("role")} />

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                className={`flex flex-col items-center justify-center p-4 border rounded-2xl transition-all ${
                  role === "STUDENT"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted hover:border-primary/50 text-muted-foreground"
                }`}
                onClick={() => setValue("role", "STUDENT", { shouldValidate: true })}
                type="button"
              >
                <GraduationCap className="h-6 w-6 mb-2" />
                <span className="font-semibold">Sinh viên</span>
              </button>
              <button
                className={`flex flex-col items-center justify-center p-4 border rounded-2xl transition-all ${
                  role === "SME"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted hover:border-primary/50 text-muted-foreground"
                }`}
                onClick={() => setValue("role", "SME", { shouldValidate: true })}
                type="button"
              >
                <Building2 className="h-6 w-6 mb-2" />
                <span className="font-semibold">Doanh nghiệp</span>
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
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                {...register("email")}
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                autoComplete="new-password"
                id="password"
                type="password"
                {...register("password")}
              />
              <FieldError message={errors.password?.message} />
            </div>

            {serverError ? (
              <div className="mt-4 p-3 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm rounded-lg">
                {serverError}
              </div>
            ) : null}

            <Button className="w-full mt-6" disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo tài khoản...
                </>
              ) : (
                <>
                  Tạo tài khoản <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground">
          <div>
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Suspense
        fallback={
          <div className="animate-spin text-primary">
            <Loader2 className="h-8 w-8" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
