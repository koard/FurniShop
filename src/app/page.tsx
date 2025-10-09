import Link from "next/link";
import type { Route } from "next";

import { CategoryCard } from "@/components/cards/category-card";
import { ProductCard } from "@/components/cards/product-card";
import { Hero } from "@/components/sections/hero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listProducts } from "@server/products";
import { db } from "@server/db";

const CATEGORY_IMAGES: Record<string, string> = {
  "Living Room": "https://lh3.googleusercontent.com/aida-public/AB6AXuAtwrzyYcrED6P9fdJ2JEX3UM-oAR_QdyPAAKIWe17phEoYuMlf0Fh__YoC84Z874RX9-x-hndjykYvaSiF04mdD9ew_1BlK4xOSvVF8BqovQQISsojvmvi1XhIzyijxxXC0kLqP28cvQePtuqUxdSGrPfCQmIGDfYgr6HiDLCLlYydPCECZHXR6C8iDLa3lctpOx7G12XPyqWBylwsSw-MGfwJpYN3Ni-Cn97wduDeoevkn7cZSEH4F4RgxOj4fevrcXAlXMp52tN2",
  Bedroom: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5Z4Obkl8THBsXBxHx6Ta8kevuwaPkKqYYeHJB_uz3SVyc7hgvoW_lPka_M9t78rpzqQBMxMAaZkEA3cESbmGS7VqK6bFMpYN1mbDnCWb_S7wfa7ob53uZABTzl70Gi_j14loJNtq4yyIMxVMyFYQ302DGL0pff0r00_QFxIhcnBgfGopWWzooh80JsqrH1HMXuP83Pch4crpNAQUVLPEbauIkqyuMBWjdcAgbbHP4zXaiN6mHLBKbelEj_75jeTUIEiOW22zVVrWH",
  "Dining Room": "https://lh3.googleusercontent.com/aida-public/AB6AXuAIX2dG5sDJQp64VwmWU5rkjXobJXDviuzfhSK_ueAxhM8dUzIaBZzlPb3pC2Q2V9c6qgjedBxhOx0bFm2nhWwW1PkhxIad9FjozoMEGap8bfi0INzygQIrCAzdaTJzdm6L28t8HfgMkS2BfCAoXfjVVL3bvRw1fIc40k1paqL6osrc-S76E4wtXoct4uyDLBBPpawr5cx-ElOZgSi0RGTPY_mXAcVGtSi8SUc-RHZnRUHRl7cbopSV3z2BxzcteCTDTijJcOftNU0m",
  Office: "https://lh3.googleusercontent.com/aida-public/AB6AXuCKqxmV6eUMdtwrwqbecqlNYpIf_1KlITXZNTTqlnn-Mw3aIa7yuP1D8j3a25fnMKCHSp_S79FCEvCVgc73gl05M533KnvqH09F5CiHfMEWu0mGu19FfAsZM4P8i5VN-33PENCv4ZOhE33YJXOqRdWM6I-Vj_vTkT_bs0joGvqi2qzn9KZqvdw4xbSLltU-CcTaSkubNkse6CZZkuVag8M7qJXTOknbd0wazbakNm7eTSjGTTN9fsad7b0tv_0w7MVxjHC1lNR3DHX6",
};

type HighlightSection = {
  title: string;
  href: Route<string>;
  description: string;
};

const HIGHLIGHTS: HighlightSection[] = [
  {
    title: "เพิ่มความพิเศษให้มุมโปรด",
    description: "ค้นหาแรงบันดาลใจจากการจัดวางจริง พร้อมเฟอร์นิเจอร์ที่คัดสรรเพื่อทุกพื้นที่ของบ้าน.",
    href: "/catalog" as Route<string>,
  },
  {
    title: "โปรโมชันพิเศษประจำเดือน",
    description: "รับส่วนลดสูงสุด 20% เมื่อซื้อสินค้าหมวด Living Room และ Bedroom ภายในสิ้นเดือนนี้.",
    href: "/promotions" as Route<string>,
  },
];

export default async function HomePage() {
  const [{ items: recommended }] = await Promise.all([
    listProducts({ limit: 4, sort: "top-rated" }),
  ]);

  const categories = db.categories.slice(0, 4);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <Hero
        eyebrow="คอลเลกชันใหม่ประจำฤดูกาล"
        title="เติมเต็มบ้านของคุณด้วยดีไซน์ที่ลงตัว"
        description="สำรวจเฟอร์นิเจอร์คุณภาพที่ผสมผสานความสบายและสไตล์ สร้างพื้นที่ที่สะท้อนตัวตนของคุณ."
        backgroundImage="https://lh3.googleusercontent.com/aida-public/AB6AXuDfAhUuIajWHuto_9tPJJQcHOQKD745RXJMvU_hfHBD5MPS0GjH15K5sptkOh8JHSyVg9lCI1uPegiAKl5Fm-6s-lWtHT7UWt-n-4GlggMlxbcbxjRCdJt7nBurwt5trpoZ0ZXetR5a9kPUKaDkkaGZesWiA8qw-WlZEGkQCW0khRjrrTxYls-HwTGLxflPjYfI2JSZcD67bYfyUyo3HqyRbmI7dAgv4gOfzp7K_TWacbj38UF6imVG5dMmwUPzuWZ-uTTf07E-MORi"
        ctaLabel="เลือกช้อปสินค้า"
        ctaHref={"/catalog" as Route<string>}
        secondaryCtaLabel="ดูคอลเลกชันล่าสุด"
        secondaryCtaHref={"/catalog?sort=newest" as Route<string>}
        features={["บริการจัดส่งทั่วประเทศ", "รับประกันคุณภาพ 2 ปี", "ปรึกษาดีไซน์เนอร์ฟรี"]}
      />

      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-1">
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">ช้อปตามหมวดหมู่</h2>
            <p className="text-sm text-muted-foreground sm:text-base">ตัวเลือกที่คัดสรรเพื่อช่วยคุณแต่งบ้านให้ครบทุกสไตล์</p>
          </div>
          <Button variant="secondary" size="sm" className="self-start rounded-full sm:self-auto" asChild>
            <Link href={"/catalog" as Route<string>}>ดูทั้งหมด</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category}
              title={category}
              image={
                CATEGORY_IMAGES[category] ??
                "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80"
              }
              href={`/catalog?category=${encodeURIComponent(category)}` as Route<string>}
            />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">แนะนำสำหรับคุณ</h2>
            <p className="text-sm text-muted-foreground sm:text-base">เลือกสินค้ายอดนิยมที่ผสานคุณภาพและดีไซน์ที่เข้ากันกับทุกมุมบ้าน</p>
          </div>
          <Button variant="ghost" size="sm" className="self-start sm:self-auto" asChild>
            <Link href={"/catalog?sort=top-rated" as Route<string>}>ดูสินค้าขายดี</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {recommended.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {HIGHLIGHTS.map((item) => (
          <Card
            key={item.title}
            className="group relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/15 via-background to-background p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div
              className="absolute h-48 w-48 rounded-full bg-primary/20 opacity-60 blur-3xl transition-opacity duration-300 group-hover:opacity-80"
              style={{ right: "-4rem", top: 0 }}
              aria-hidden
            />
            <div className="relative space-y-3">
              <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">ไฮไลต์</span>
              <h3 className="text-xl font-semibold text-foreground sm:text-2xl">{item.title}</h3>
              <p className="text-sm text-muted-foreground sm:text-base">{item.description}</p>
            </div>
            <Button variant="secondary" className="self-start rounded-full" asChild>
              <Link href={item.href}>ดูรายละเอียด</Link>
            </Button>
          </Card>
        ))}
      </section>
    </main>
  );
}
