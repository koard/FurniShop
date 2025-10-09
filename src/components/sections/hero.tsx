/* eslint-disable tailwindcss/classnames-order */
import Link from "next/link";
import type { Route } from "next";

import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type HeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: Route<string>;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: Route<string>;
  features?: string[];
  backgroundImage: string;
  className?: string;
  overlayClassName?: string;
};

export function Hero({
  eyebrow,
  title,
  description,
  ctaLabel = "เลือกดูสินค้า",
  ctaHref = "/catalog" as Route<string>,
  secondaryCtaLabel,
  secondaryCtaHref,
  features,
  backgroundImage,
  className,
  overlayClassName,
}: HeroProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-[380px] items-center overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl sm:min-h-[460px] lg:min-h-[540px]",
        className
      )}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        aria-hidden
      />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-black/80 via-black/55 to-black/20",
          overlayClassName
        )}
      />
      <div
        className="absolute h-64 w-64 rounded-full bg-primary/40 opacity-60 blur-3xl"
        style={{ left: "-4rem", bottom: "-6rem" }}
        aria-hidden
      />
      <div
        className="absolute h-72 w-72 rounded-full bg-white/20 opacity-30 blur-3xl"
        style={{ right: "-2.5rem", top: "-4rem" }}
        aria-hidden
      />

      <div
        className={cn(
          "relative z-10 flex w-full flex-col gap-6 px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24",
          "text-balance"
        )}
      >
        <div className="max-w-2xl space-y-4">
          {eyebrow ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
              <span className="h-2 w-2 rounded-full bg-primary/70" aria-hidden />
              {eyebrow}
            </span>
          ) : null}
          <h1 className="text-balance text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
            {title}
          </h1>
          <p className="text-sm sm:text-lg text-white/80">
            {description}
          </p>
        </div>

        {features?.length ? (
          <ul className="flex flex-col gap-2 text-sm text-white/85 sm:flex-row sm:flex-wrap">
            {features.map((item) => (
              <li
                key={item}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white/90 backdrop-blur-sm transition hover:bg-white/15"
              >
                <CheckCircle2 className="h-4 w-4 text-white" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {(ctaLabel || secondaryCtaLabel) ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {ctaLabel ? (
              <Button asChild size="lg" className="h-12 w-full rounded-full bg-primary px-8 text-primary-foreground shadow-lg hover:bg-primary/90 sm:w-auto">
                <Link href={ctaHref}>{ctaLabel}</Link>
              </Button>
            ) : null}
            {secondaryCtaLabel && secondaryCtaHref ? (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 w-full rounded-full border-white/30 bg-white/10 px-8 text-white shadow-lg hover:bg-white/20 sm:w-auto"
              >
                <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
