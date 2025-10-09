import { Suspense } from "react";

import type { Role } from "../../../types/user";
import { getSession } from "@server/auth";
import { MAIN_NAV, AUTH_NAV } from "@/lib/navigation";
import { Logo } from "./logo";
import { HeaderClient, type UserSummary } from "./header-client";

function resolveRole(role?: Role | null): Role {
  return role ?? "GUEST";
}

async function HeaderInner() {
  const session = await getSession();
  const role = resolveRole(session?.user?.role);
  const user: UserSummary | undefined = session?.user
    ? {
        name: session.user.name ?? "ผู้ใช้งาน",
        email: session.user.email,
        avatar: session.user.avatar,
        role,
      }
    : undefined;

  return <HeaderClient role={role} user={user} mainNav={MAIN_NAV} authNav={AUTH_NAV} />;
}

export async function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur">
      <Suspense
        fallback={
          <div className="container flex h-20 items-center justify-between">
            <Logo className="text-lg" />
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
          </div>
        }
      >
        <HeaderInner />
      </Suspense>
    </header>
  );
}
