"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Eye, EyeOff, Loader2, AlertCircle, ArrowRight,
  Lock, Mail, User, CheckCircle2, XCircle, Sofa,
} from "lucide-react";

import { signUpSchema } from "@/lib/validators";
import { signInWithOAuth } from "@server/auth";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { PASSWORD_POLICY } from "@/lib/auth";

// Password strength rules
const RULES = [
  { label: `ขั้นต่ำ ${PASSWORD_POLICY.minLength} ตัวอักษร`, test: (p: string) => p.length >= PASSWORD_POLICY.minLength },
  { label: "มีตัวพิมพ์ใหญ่ (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "มีตัวเลข (0-9)", test: (p: string) => /\d/.test(p) },
];

function PasswordRule({ label, met }: { label: string; met: boolean }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs transition-colors ${met ? "text-green-600" : "text-muted-foreground"}`}>
      {met ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0 text-border" />}
      {label}
    </li>
  );
}

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordRulesMet = RULES.map((r) => r.test(password));
  const passwordStrength = passwordRulesMet.filter(Boolean).length;

  const strengthColor =
    passwordStrength === 0 ? "bg-border"
    : passwordStrength === 1 ? "bg-destructive"
    : passwordStrength === 2 ? "bg-amber-400"
    : "bg-green-500";

  const strengthLabel =
    passwordStrength === 0 ? ""
    : passwordStrength === 1 ? "อ่อน"
    : passwordStrength === 2 ? "ปานกลาง"
    : "แข็งแกร่ง";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const parsed = signUpSchema.safeParse({ name, email, password, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
      return;
    }

    startTransition(async () => {
      try {
        const cred = await createUserWithEmailAndPassword(auth, parsed.data.email, parsed.data.password);
        await updateProfile(cred.user, { displayName: parsed.data.name });
        
        await signInWithOAuth({
          id: cred.user.uid,
          email: cred.user.email ?? parsed.data.email,
          name: parsed.data.name,
          avatar: cred.user.photoURL,
        });
        
        window.location.href = "/";
      } catch (e: any) {
        let msg = "สมัครสมาชิกไม่สำเร็จ";
        if (e.code === "auth/email-already-in-use") {
          msg = "อีเมลนี้ถูกใช้งานแล้ว";
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
        {/* Background dots */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
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

        <div className="relative space-y-6">
          <h2 className="text-4xl font-bold leading-tight text-white">
            เริ่มต้นการ<br />ตกแต่งบ้าน
          </h2>
          <p className="text-lg text-white/70">
            สมัครสมาชิกฟรี เพื่อค้นหาเฟอร์นิเจอร์ที่ใช่สำหรับบ้านของคุณ
          </p>
          <ul className="space-y-3 text-sm text-white/80">
            {[
              "เลือกสินค้าจากหมวดหมู่กว่า 6 ประเภท",
              "รับโปรโมชั่นสมาชิกใหม่ทันที",
              "ติดตามออร์เดอร์และประวัติซื้อขายได้ตลอดเวลา",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">✓</span>
                {f}
              </li>
            ))}
          </ul>

          {/* Promo badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm text-white">
            🎁 ใช้โค้ด <span className="font-mono font-bold">WELCOME10</span> รับส่วนลด 10% ทันที
          </div>
        </div>

        <p className="relative text-xs text-white/40">© 2025 FurniShop — เฟอร์นิเจอร์คุณภาพ ส่งตรงถึงบ้าน</p>
      </div>

      {/* ── Form Panel ──────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-7">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <Sofa className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">FurniShop</span>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-foreground">สมัครสมาชิก</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              มีบัญชีอยู่แล้ว?{" "}
              <Link
                href={"/auth/sign-in" as Route<string>}
                className="font-medium text-primary transition hover:text-primary/80 hover:underline"
              >
                เข้าสู่ระบบ
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
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">ชื่อ-นามสกุล</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ชื่อจริง นามสกุล"
                  autoComplete="name"
                  className="pl-10"
                  disabled={pending}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">อีเมล</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
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
              <label htmlFor="password" className="text-sm font-medium text-foreground">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
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

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1 gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            passwordStrength >= i ? strengthColor : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                    {strengthLabel && (
                      <span className={`text-xs font-medium ${
                        passwordStrength === 1 ? "text-destructive"
                        : passwordStrength === 2 ? "text-amber-500"
                        : "text-green-600"
                      }`}>
                        {strengthLabel}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1">
                    {RULES.map((r, i) => (
                      <PasswordRule key={r.label} label={r.label} met={passwordRulesMet[i]} />
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">ยืนยันรหัสผ่าน</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`px-10 ${
                    confirmPassword.length > 0
                      ? confirmPassword === password
                        ? "border-green-400 focus-visible:ring-green-400"
                        : "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                  disabled={pending}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && confirmPassword !== password && (
                <p className="text-xs text-destructive">รหัสผ่านไม่ตรงกัน</p>
              )}
              {confirmPassword.length > 0 && confirmPassword === password && (
                <p className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> รหัสผ่านตรงกัน
                </p>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" className="group w-full" size="lg" disabled={pending}>
              {pending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />กำลังสมัครสมาชิก...</>
              ) : (
                <>สมัครสมาชิกฟรี <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              เมื่อสมัครสมาชิก คุณยอมรับ{" "}
              <span className="cursor-pointer text-primary hover:underline">เงื่อนไขการใช้บริการ</span>
              {" "}และ{" "}
              <span className="cursor-pointer text-primary hover:underline">นโยบายความเป็นส่วนตัว</span>
            </p>
          </form>

          {/* Divider */}
          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">หรือสมัครผ่านช่องทางอื่น</span>
            </div>
          </div>

          <div className="mt-6">
            <OAuthButtons mode="sign-up" />
          </div>
        </div>
      </div>
    </div>
  );
}
