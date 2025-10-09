import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Thai, Kanit } from "next/font/google";
import "../../styles/globals.css";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  display: "swap",
  variable: "--font-noto-sans-thai",
});

const kanit = Kanit({
  subsets: ["latin", "thai"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-kanit",
});

export const metadata: Metadata = {
  title: {
    default: "FurniShop · Premium Furniture Marketplace",
    template: "%s · FurniShop",
  },
  description:
    "Discover curated modern furniture, manage orders, and streamline delivery with FurniShop.",
  applicationName: "FurniShop",
  authors: [{ name: "FurniShop" }],
  keywords: [
    "furniture",
    "interior",
    "e-commerce",
    "admin dashboard",
    "delivery",
    "FurniShop",
  ],
};

export const viewport: Viewport = {
  themeColor: [{ color: "#0f172a" }],
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoSansThai.variable} ${kanit.variable} flex min-h-screen flex-col bg-background font-sans antialiased`}
      >
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
