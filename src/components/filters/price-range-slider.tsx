"use client";

import * as Slider from "@radix-ui/react-slider";
import { useCallback, useEffect, useMemo, useState } from "react";

import { cn, formatCurrency } from "@/lib/utils";

type PriceRangeSliderProps = {
  min: number;
  max: number;
  step?: number;
  defaultValue?: [number | undefined, number | undefined];
  nameMin: string;
  nameMax: string;
  className?: string;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function PriceRangeSlider({
  min,
  max,
  step = 500,
  defaultValue,
  nameMin,
  nameMax,
  className,
}: PriceRangeSliderProps) {
  const resolvedDefault: [number, number] = useMemo(() => {
    const [start, end] = defaultValue ?? [];
    const safeStart = start != null ? clamp(start, min, max) : min;
    const safeEnd = end != null ? clamp(end, min, max) : max;
    if (safeStart > safeEnd) {
      return [safeEnd, safeEnd];
    }
    return [safeStart, safeEnd];
  }, [defaultValue, min, max]);

  const [range, setRange] = useState<[number, number]>(resolvedDefault);

  useEffect(() => {
    setRange(resolvedDefault);
  }, [resolvedDefault]);

  const handleValueChange = useCallback(
    (value: number[]) => {
      if (value.length < 2) return;
      const [start, end] = value as [number, number];
      setRange([clamp(Math.min(start, end), min, max), clamp(Math.max(start, end), min, max)]);
    },
    [min, max]
  );

  const handleReset = useCallback(() => {
    setRange([min, max]);
  }, [min, max]);

  const [start, end] = range;
  const hasCustomRange = start !== min || end !== max;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground/85">
        <span>
          {formatCurrency(start)} - {formatCurrency(end)}
        </span>
        <button
          type="button"
          onClick={handleReset}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition", 
            hasCustomRange
              ? "bg-primary/10 text-primary hover:bg-primary/15"
              : "text-muted-foreground/50"
          )}
          disabled={!hasCustomRange}
        >
          รีเซ็ต
        </button>
      </div>
      <Slider.Root
        className="relative flex h-8 w-full touch-none select-none items-center"
        min={min}
        max={max}
        step={step}
        value={range}
        onValueChange={handleValueChange}
      >
        <Slider.Track className="relative h-[6px] w-full grow overflow-hidden rounded-full bg-muted/70">
          <Slider.Range className="absolute h-full rounded-full bg-primary/80" />
        </Slider.Track>
        <Slider.Thumb className="h-4 w-4 rounded-full border-2 border-background bg-primary shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-primary/60" />
        <Slider.Thumb className="h-4 w-4 rounded-full border-2 border-background bg-primary shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-primary/60" />
      </Slider.Root>
      <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground/85">
        <div className="space-y-1">
          <span className="font-semibold text-foreground/90">ขั้นต่ำ</span>
          <span>{formatCurrency(start)}</span>
        </div>
        <div className="space-y-1 text-right">
          <span className="font-semibold text-foreground/90">สูงสุด</span>
          <span>{formatCurrency(end)}</span>
        </div>
      </div>
      <input type="hidden" name={nameMin} value={start} disabled={start === min} />
      <input type="hidden" name={nameMax} value={end} disabled={end === max} />
    </div>
  );
}
