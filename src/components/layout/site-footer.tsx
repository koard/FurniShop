import Link from "next/link";
import type { Route } from "next";

import { Logo } from "./logo";
import { MAIN_NAV } from "@/lib/navigation";

const toRoute = (href: string): Route<string> => href as Route<string>;

const footerLinks = {
  shop: [
    { label: "ห้องรับแขก", href: "/catalog?category=Living%20Room" },
    { label: "ห้องนอน", href: "/catalog?category=Bedroom" },
    { label: "ออฟฟิศ", href: "/catalog?category=Office" },
  ],
  company: [
    { label: "เกี่ยวกับเรา", href: "/about" },
    { label: "ติดต่อเรา", href: "/contact" },
    { label: "คำถามที่พบบ่อย", href: "/faq" },
  ],
  legal: [
    { label: "เงื่อนไขการให้บริการ", href: "/legal/terms" },
    { label: "นโยบายความเป็นส่วนตัว", href: "/legal/privacy" },
  ],
};

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: "facebook" },
  { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
  { label: "Twitter", href: "https://twitter.com", icon: "twitter" },
];

function SocialIcon({ name }: { name: string }) {
  switch (name) {
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path
            d="M22 12.07C22 6.49 17.52 2 11.94 2S2 6.49 2 12.07c0 4.99 3.66 9.13 8.44 9.93v-7.03H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.77l-.44 2.9h-2.33v7.03C18.34 21.2 22 17.06 22 12.07Z"
            fill="currentColor"
          />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path
            d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7Zm10 2c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3h10Zm-5 3.5A5.5 5.5 0 1 0 17.5 13 5.51 5.51 0 0 0 12 7.5Zm0 2A3.5 3.5 0 1 1 8.5 13 3.5 3.5 0 0 1 12 9.5Zm5.25-3.75a1 1 0 1 0 1 1 1 1 0 0 0-1-1Z"
            fill="currentColor"
          />
        </svg>
      );
    case "twitter":
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path
            d="M22 5.92c-.77.34-1.6.57-2.47.67a4.33 4.33 0 0 0 1.89-2.39 8.59 8.59 0 0 1-2.73 1.05 4.28 4.28 0 0 0-7.37 2.92c0 .34.04.66.12.97A12.16 12.16 0 0 1 3 4.9a4.28 4.28 0 0 0 1.32 5.72 4.2 4.2 0 0 1-1.94-.54v.05c0 2 1.44 3.68 3.34 4.06a4.33 4.33 0 0 1-1.93.07 4.29 4.29 0 0 0 4 2.97 8.6 8.6 0 0 1-5.3 1.82c-.34 0-.67-.02-1-.06a12.13 12.13 0 0 0 6.57 1.93c7.88 0 12.2-6.53 12.2-12.2 0-.19-.01-.38-.02-.57A8.67 8.67 0 0 0 22 5.92Z"
            fill="currentColor"
          />
        </svg>
      );
  }
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="container grid gap-10 py-12 md:grid-cols-4 lg:grid-cols-5">
        <div className="space-y-3 md:col-span-2">
          <Logo className="text-lg" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FurniShop. ยกระดับทุกพื้นที่ในบ้านของคุณด้วยเฟอร์นิเจอร์คุณภาพ.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                aria-label={item.label}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <SocialIcon name={item.icon} />
              </a>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">หมวดหมู่สินค้า</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {footerLinks.shop.map((item) => (
              <li key={item.href}>
                <Link href={toRoute(item.href)}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">เกี่ยวกับ FurniShop</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {footerLinks.company.map((item) => (
              <li key={item.href}>
                <Link href={toRoute(item.href)}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">ข้อมูลทางกฎหมาย</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {footerLinks.legal.map((item) => (
              <li key={item.href}>
                <Link href={toRoute(item.href)}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 bg-background/60">
        <div className="container flex flex-col items-center justify-between gap-4 py-4 text-xs text-muted-foreground md:flex-row">
          <div className="flex items-center gap-6">
            {MAIN_NAV.map((item) => (
              <Link key={item.href} href={toRoute(item.href)} className="hover:text-primary">
                {item.label}
              </Link>
            ))}
          </div>
          <p>ออกแบบด้วยความใส่ใจสำหรับบ้านของคุณ</p>
        </div>
      </div>
    </footer>
  );
}
