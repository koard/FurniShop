"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Route } from "next";

import { signUpSchema } from "@/lib/validators";
import { signUp } from "@server/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    };
    const parsed = signUpSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
      return;
    }
    startTransition(async () => {
      try {
        await signUp({ name: parsed.data.name, email: parsed.data.email, password: parsed.data.password });
        window.location.href = "/";
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "สมัครสมาชิกไม่สำเร็จ";
        setError(message);
      }
    });
  }

  return (
    <div className="mx-auto max-w-sm px-4 pb-16 pt-10">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">สมัครสมาชิก</h1>
      {error ? (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <form action={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium text-foreground">ชื่อ-นามสกุล</label>
          <Input id="name" name="name" placeholder="Your name" autoComplete="name" />
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-foreground">อีเมล</label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-foreground">รหัสผ่าน</label>
          <Input id="password" name="password" type="password" placeholder="••••••••" autoComplete="new-password" />
        </div>
        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">ยืนยันรหัสผ่าน</label>
          <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" autoComplete="new-password" />
        </div>
        <Button type="submit" disabled={pending} className="w-full">สมัครสมาชิก</Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        มีบัญชีอยู่แล้ว? {" "}
        <Link href={"/auth/sign-in" as Route<string>} className="text-primary hover:underline">เข้าสู่ระบบ</Link>
      </p>
    </div>
  );
}
