import { requireRole } from "@server/auth";
import { ADMIN_NAV } from "@/lib/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["ADMIN"]);
  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
        <DashboardSidebar title="แดชบอร์ดผู้ดูแล" items={ADMIN_NAV} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
