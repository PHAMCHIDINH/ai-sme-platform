"use client";

import { useState, useEffect, Suspense } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Layers, Loader2, Building2, GraduationCap } from "lucide-react";
import { register } from "@/app/actions/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function RegisterButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full mt-6" type="submit" disabled={pending}>
      {pending ? (
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
  );
}

function RegisterForm() {
  const [errorMessage, setErrorMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [role, setRole] = useState<"STUDENT" | "SME">("STUDENT");

  useEffect(() => {
    const r = searchParams.get("role");
    if (r === "sme") setRole("SME");
    else if (r === "student") setRole("STUDENT");
  }, [searchParams]);

  async function action(formData: FormData) {
    formData.append("role", role);
    const res = await register(undefined, formData);
    if (res === "SUCCESS") {
      router.push("/login?registered=true");
    } else {
      setErrorMessage(res || "Lỗi không xác định");
    }
  }

  return (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-center mb-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-primary-foreground p-2 rounded-xl group-hover:scale-105 transition-transform">
            <Layers className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight">VnSME<span className="text-primary">Match</span></span>
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
          <form action={action}>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div 
                className={`flex flex-col items-center justify-center p-4 border rounded-2xl cursor-pointer transition-all ${role === "STUDENT" ? "border-primary bg-primary/10 text-primary" : "border-muted hover:border-primary/50 text-muted-foreground"}`}
                onClick={() => setRole("STUDENT")}
              >
                <GraduationCap className="h-6 w-6 mb-2" />
                <span className="font-semibold">Sinh viên</span>
              </div>
              <div 
                className={`flex flex-col items-center justify-center p-4 border rounded-2xl cursor-pointer transition-all ${role === "SME" ? "border-primary bg-primary/10 text-primary" : "border-muted hover:border-primary/50 text-muted-foreground"}`}
                onClick={() => setRole("SME")}
              >
                <Building2 className="h-6 w-6 mb-2" />
                <span className="font-semibold">Doanh nghiệp</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder={role === "STUDENT" ? "Nguyễn Văn A" : "Tên công ty / Người đại diện"} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password"
                  autoComplete="new-password"
                  required 
                  minLength={6}
                />
              </div>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm rounded-lg">
                {errorMessage}
              </div>
            )}

            <RegisterButton />
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
      <Suspense fallback={<div className="animate-spin text-primary"><Loader2 className="h-8 w-8" /></div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
