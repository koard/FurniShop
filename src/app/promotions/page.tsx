import { listPromotions } from "@server/promotions";

export default async function PromotionsPage() {
  const promotions = await listPromotions();
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-10">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">โปรโมชั่น</h1>
      <ul className="space-y-3">
        {promotions.map((p) => (
          <li key={p.id} className="rounded-md border border-border bg-card p-4">
            <div className="font-semibold text-foreground">{p.name} ({p.code})</div>
            <div className="text-sm text-muted-foreground">{p.active ? "Active" : "Inactive"}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
