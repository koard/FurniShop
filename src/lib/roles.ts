import type { Role } from "../../types/user";

export const ROLES: Role[] = ["GUEST", "CUSTOMER", "ADMIN", "DELIVERY"];

export const ROLE_REDIRECT: Record<Role, string> = {
  GUEST: "/",
  CUSTOMER: "/(customer)/account",
  ADMIN: "/(admin)/admin",
  DELIVERY: "/(delivery)/delivery",
};

export function isRoleAllowed(userRole: Role | undefined, permitted: Role[]) {
  if (!userRole) return permitted.includes("GUEST");
  return permitted.includes(userRole);
}

export function ensureRole<T extends Role>(role: Role | undefined, allowed: T[]): T {
  if (!role || !allowed.includes(role as T)) {
    throw new Error("ACCESS_DENIED");
  }
  return role as T;
}
