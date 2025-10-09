export type Role = "GUEST" | "CUSTOMER" | "ADMIN" | "DELIVERY";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  createdAt?: string;
  lastLoginAt?: string;
};

export type Session = {
  user: User | null;
  expiresAt: string | null;
};
