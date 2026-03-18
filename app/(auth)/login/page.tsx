"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ArrowRight, Layers, Loader2 } from "lucide-react";
import { authenticate } from "@/app/actions/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full mt-6" type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang đăng nhập...
        </>
      ) : (
        <>
          Đăng nhập <ArrowRight className="ml-2 w-4 h-4" />
        </>
      )}
    </Button>
  );
}

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState("");

  async function action(formData: FormData) {
    const res = await authenticate(undefined, formData);
    if (res) {
      setErrorMessage(res);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
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
            <CardTitle className="text-2xl font-bold">Chào mừng trở lại</CardTitle>
            <CardDescription>
              Đăng nhập để tiếp tục với tài khoản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={action}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    required 
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Link href="#" className="text-sm font-medium text-primary hover:underline">
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    required 
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="mt-4 p-3 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm rounded-lg">
                  {errorMessage}
                </div>
              )}

              <LoginButton />
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground">
            <div>
              Chưa có tài khoản?{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Đăng ký ngay
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
