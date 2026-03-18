import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

import { registerAction } from "./actions";

export default function RegisterPage() {
  return (
    <main className="page-wrap flex min-h-screen items-center py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="glass-panel p-7 md:p-8">
          <p className="kicker">Get Started</p>
          <h1 className="mt-4 text-3xl font-bold text-ink-900">Tạo tài khoản</h1>
          <p className="mt-2 text-sm text-ink-600">Đăng ký với vai trò Doanh nghiệp SME hoặc Sinh viên.</p>

          <form action={registerAction} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700" htmlFor="name">
                Họ tên
              </label>
              <Input id="name" name="name" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700" htmlFor="email">
                Email
              </label>
              <Input id="email" name="email" required type="email" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700" htmlFor="password">
                Mật khẩu
              </label>
              <Input id="password" minLength={6} name="password" required type="password" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700" htmlFor="role">
                Vai trò
              </label>
              <Select defaultValue="STUDENT" id="role" name="role">
                <option value="SME">Doanh nghiệp SME</option>
                <option value="STUDENT">Sinh viên</option>
              </Select>
            </div>

            <Button className="w-full" type="submit">
              Đăng ký
            </Button>
          </form>

          <p className="mt-5 text-sm text-ink-600">
            Đã có tài khoản?{" "}
            <Link className="font-semibold text-brand-700" href="/login">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
