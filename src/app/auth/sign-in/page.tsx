"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight, Lock, Mail, Sofa } from "lucide-react";

import { signInSchema } from "@/lib/validators";
import { signInWithOAuth } from "@server/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OAuthButtons } from "@/components/auth/oauth-buttons";


export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
      return;
    }

    startTransition(async () => {
      try {
        const cred = await signInWithEmailAndPassword(auth, parsed.data.email, parsed.data.password);
        await signInWithOAuth({
          id: cred.user.uid,
          email: cred.user.email ?? parsed.data.email,
          name: cred.user.displayName || "ผู้ใช้",
          avatar: cred.user.photoURL,
        });
        window.location.href = "/";
      } catch (e: any) {
        let msg = "เข้าสู่ระบบไม่สำเร็จ";
        if (e.code === "auth/invalid-credential" || e.code === "auth/user-not-found" || e.code === "auth/wrong-password") {
          msg = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
        } else if (e.message) {
          msg = e.message;
        }
        setError(msg);
      }
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full">
      {/* ── Brand Panel ─────────────────────────────────────────── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 lg:flex lg:w-[45%]">
        {/* Background pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Floating shapes */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 -left-10 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute bottom-40 right-8 h-32 w-32 rounded-full bg-white/10" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Sofa className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">FurniShop</span>
        </div>

        {/* Center content */}
        <div className="relative space-y-6">
          <h2 className="text-4xl font-bold leading-tight text-white">
            ยินดีต้อนรับ<br />กลับมา
          </h2>
          <p className="text-lg text-white/70">
            เข้าสู่ระบบเพื่อดูออร์เดอร์ บันทึกรายการโปรด และรับส่วนลดพิเศษสำหรับสมาชิก
          </p>
          {/* Feature bullets */}
          <ul className="space-y-3 text-sm text-white/80">
            {["ติดตามสถานะออร์เดอร์แบบ Real-time", "บันทึกรายการโปรดของคุณ", "รับโปรโมชั่นสำหรับสมาชิกก่อนใคร"].map(
              (f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">✓</span>
                  {f}
                </li>
              )
            )}
          </ul>
        </div>

        {/* Bottom quote */}
        <p className="relative text-xs text-white/40">© 2025 FurniShop — เฟอร์นิเจอร์คุณภาพ ส่งตรงถึงบ้าน</p>
      </div>

      {/* ── Form Panel ──────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <Sofa className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">FurniShop</span>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-foreground">เข้าสู่ระบบ</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              ยังไม่มีบัญชี?{" "}
              <Link
                href={"/auth/sign-up" as Route<string>}
                className="font-medium text-primary transition hover:text-primary/80 hover:underline"
              >
                สมัครสมาชิกฟรี
              </Link>
            </p>
          </div>


          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                อีเมล
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="pl-10"
                  disabled={pending}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  รหัสผ่าน
                </label>
                <button
                  type="button"
                  className="text-xs text-muted-foreground transition hover:text-primary"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="px-10"
                  disabled={pending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="group w-full"
              size="lg"
              disabled={pending}
            >
              {pending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />กำลังเข้าสู่ระบบ...</>
              ) : (
                <>เข้าสู่ระบบ <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">หรือ</span>
            </div>
          </div>

          <OAuthButtons mode="sign-in" />

          <p className="text-center text-sm text-muted-foreground">
            ยังไม่มีบัญชี?{" "}
            <Link
              href={"/auth/sign-up" as Route<string>}
              className="font-semibold text-primary transition hover:underline"
            >
              สมัครสมาชิกฟรีเลย →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
