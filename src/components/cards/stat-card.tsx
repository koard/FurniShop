import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
  className?: string;
};

export function StatCard({ label, value, helper, icon, className }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="flex items-center justify-between gap-3 p-5">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
          {helper ? <span className="text-xs text-muted-foreground">{helper}</span> : null}
        </div>
        {icon ? <div className="rounded-full bg-primary/10 p-3 text-primary">{icon}</div> : null}
      </CardContent>
    </Card>
  );
}
