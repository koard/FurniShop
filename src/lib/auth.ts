import type { Role } from "../../types/user";
import { ROLE_REDIRECT } from "./roles";

export const SESSION_COOKIE_NAME = "furnishop_session";
export const PASSWORD_POLICY = {
  minLength: 8,
  requireNumber: true,
  requireUppercase: true,
};

export function getRedirectPath(role: Role) {
  return ROLE_REDIRECT[role];
}

export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const maskedLocal = local.length <= 2 ? `${local[0]}*` : `${local.slice(0, 2)}***`;
  return `${maskedLocal}@${domain}`;
}
