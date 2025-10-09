"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import type { DashboardNavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import {
  Armchair,
  History,
  LayoutDashboard,
  Megaphone,
  Percent,
  ReceiptText,
  Route as RouteIcon,
  ShieldCheck,
  UserCircle2,
  UsersRound,
  Boxes,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  grid_view: LayoutDashboard,
  chair: Armchair,
  receipt_long: ReceiptText,
  group: UsersRound,
  campaign: Megaphone,
  promotions: Percent,
  percent: Percent,
  security: ShieldCheck,
  shield_person: ShieldCheck,
  route: RouteIcon,
  history: History,
  account_circle: UserCircle2,
  packages: Boxes,
};

function resolveIcon(name?: string) {
  if (!name) return LayoutDashboard;
  return iconMap[name] ?? LayoutDashboard;
}

const toRoute = (href: string): Route<string> => href as Route<string>;

type DashboardSidebarProps = {
  items: DashboardNavItem[];
  footer?: React.ReactNode;
  title?: string;
};

export function DashboardSidebar({ items, footer, title }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-background/70 p-4">
      {title ? (
        <h2 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
      ) : null}
      <nav className="mt-4 flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const Icon = resolveIcon(item.icon);
          const isActive = pathname === item.href;
          return (
            <Fragment key={item.href}>
              <Link
                href={toRoute(item.href)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </Fragment>
          );
        })}
      </nav>
      {footer ? <div className="border-t border-border/60 pt-4">{footer}</div> : null}
    </aside>
  );
}
