"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo } from "react";
import { usePathname } from "next/navigation";

import type { Role } from "../../../types/user";
import type { NavItem } from "@/lib/navigation";
import { maskEmail } from "@/lib/auth";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@server/auth";
import { Heart, LogOut, Menu, Search, ShoppingCart, UserRound } from "lucide-react";

export type UserSummary = {
  name: string;
  email: string;
  avatar?: string | null;
  role: Role;
};

type HeaderClientProps = {
  role: Role;
  user?: UserSummary;
  mainNav: NavItem[];
  authNav: NavItem[];
};

function toRoute(href: string): Route<string> {
  return href as Route<string>;
}

function SearchBar() {
  return (
    <form
      action="/catalog"
      method="get"
      className="hidden w-full max-w-xs items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-sm text-muted-foreground transition focus-within:border-primary sm:flex"
    >
      <Search className="h-4 w-4 shrink-0" aria-hidden />
      <Input
        type="search"
        name="q"
        placeholder="ค้นหาสินค้า..."
        className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
      />
    </form>
  );
}

function GuestActions() {
  return (
    <div className="hidden items-center gap-2 md:flex">
      <Button variant="ghost" size="sm" asChild>
        <Link href={toRoute("/auth/sign-in")}>เข้าสู่ระบบ</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href={toRoute("/auth/sign-up")}>สมัครสมาชิก</Link>
      </Button>
    </div>
  );
}

function UserMenu({ user, links }: { user: UserSummary; links: NavItem[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-primary/10"
        >
          <Avatar className="h-9 w-9">
            {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
            <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="hidden flex-col items-start text-left text-xs font-medium text-foreground sm:flex">
            <span>{user.name}</span>
            <span className="text-[11px] text-muted-foreground">{maskEmail(user.email)}</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={toRoute("/(customer)/account")} className="flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            บัญชีของฉัน
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={toRoute("/cart")} className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            ตะกร้าสินค้า
          </Link>
        </DropdownMenuItem>
        {links.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={toRoute(item.href)} className="flex items-center gap-2">
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={signOut} className="flex w-full items-center gap-2">
            <button type="submit" className="flex w-full items-center gap-2 text-left text-sm">
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileMenu({ items }: { items: NavItem[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">เปิดเมนู</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>เมนู</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={toRoute(item.href)}>{item.label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function HeaderClient({ role, user, mainNav, authNav }: HeaderClientProps) {
  const pathname = usePathname();

  const combinedNav = useMemo(() => {
    return [
      ...mainNav,
      ...authNav.filter((item) => !item.roles || item.roles.includes(role)),
    ];
  }, [mainNav, authNav, role]);

  const roleSpecific = useMemo(
    () =>
      authNav.filter(
        (item) => item.roles && item.roles.includes(role) && !item.href.startsWith("/auth/")
      ),
    [authNav, role]
  );

  return (
    <div className="container flex h-20 items-center justify-between gap-4">
      <div className="flex items-center gap-8">
        <Logo className="text-lg" />
        <nav className="hidden items-center gap-6 md:flex">
          {mainNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={toRoute(item.href)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex flex-1 items-center justify-end gap-4">
        <SearchBar />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex" asChild>
            <Link href={toRoute("/wishlist")}>
              <Heart className="h-5 w-5" />
              <span className="sr-only">สินค้าที่ชอบ</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href={toRoute("/cart")}>
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">ตะกร้าสินค้า</span>
            </Link>
          </Button>
          {user ? <UserMenu user={user} links={roleSpecific} /> : <GuestActions />}
          <MobileMenu items={combinedNav} />
        </div>
      </div>
    </div>
  );
}
