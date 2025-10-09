import Link from "next/link";
import type { Route } from "next";

import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: Route<string>;
};

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, subtitle, breadcrumbs, className, actions }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 border-b border-border pb-6", className)}>
      {breadcrumbs?.length ? (
        <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
          {breadcrumbs.map((item, index) => (
            <span key={item.label} className="flex items-center gap-2">
              {item.href ? (
                <Link href={item.href} className="hover:text-primary">
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}
              {index < breadcrumbs.length - 1 ? <span className="text-border">/</span> : null}
            </span>
          ))}
        </nav>
      ) : null}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          {subtitle ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
