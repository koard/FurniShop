import Link from "next/link";
import type { Route } from "next";
import type { UrlObject } from "url";

import { cn } from "@/lib/utils";

type LogoProps = {
  href?: Route<string> | UrlObject;
  className?: string;
};

const logoMark = (
  <svg
    aria-hidden
    className="h-6 w-6 text-primary"
    fill="none"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor" />
  </svg>
);

export function Logo({ href = "/" as Route<string>, className }: LogoProps) {
  const content = (
    <div className={cn("flex items-center gap-2 font-semibold", className)}>
      {logoMark}
      <span className="tracking-tight">FurniShop</span>
    </div>
  );

  if (!href) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}
