import type { Role } from "../../types/user";

export type NavItem = {
  label: string;
  href: string;
  roles?: Role[];
};

export type DashboardNavItem = NavItem & {
  icon?: string;
};

export const MAIN_NAV: NavItem[] = [
  { label: "หน้าแรก", href: "/" },
  { label: "สินค้า", href: "/catalog" },
  { label: "โปรโมชั่น", href: "/promotions" },
  { label: "ติดต่อเรา", href: "/about" },
];

export const AUTH_NAV: NavItem[] = [
  { label: "เข้าสู่ระบบ", href: "/auth/sign-in", roles: ["GUEST"] },
  { label: "สมัครสมาชิก", href: "/auth/sign-up", roles: ["GUEST"] },
  { label: "บัญชีของฉัน", href: "/(customer)/account", roles: ["CUSTOMER"] },
  { label: "แดชบอร์ดผู้ดูแล", href: "/(admin)/admin", roles: ["ADMIN"] },
  { label: "งานจัดส่ง", href: "/(delivery)/delivery", roles: ["DELIVERY"] },
];

export const ADMIN_NAV: DashboardNavItem[] = [
  { label: "ภาพรวม", href: "/(admin)/admin", icon: "grid_view" },
  { label: "สินค้า", href: "/(admin)/admin/products", icon: "chair" },
  { label: "คำสั่งซื้อ", href: "/(admin)/admin/orders", icon: "receipt_long" },
  { label: "ลูกค้า", href: "/(admin)/admin/customers", icon: "group" },
  { label: "โปรโมชัน", href: "/(admin)/admin/promotions", icon: "percent" },
  { label: "ความปลอดภัย", href: "/(admin)/admin/security", icon: "shield_person" },
];

export const DELIVERY_NAV: DashboardNavItem[] = [
  { label: "งานวันนี้", href: "/(delivery)/delivery", icon: "route" },
  { label: "ประวัติการจัดส่ง", href: "/(delivery)/delivery/history", icon: "history" },
  { label: "โปรไฟล์", href: "/(delivery)/delivery/profile", icon: "account_circle" },
];
