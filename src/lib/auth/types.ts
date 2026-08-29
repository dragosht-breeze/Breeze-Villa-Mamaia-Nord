export const USER_ROLES = ["ADMIN", "MANAGER", "RECEPTION", "HOUSEKEEPING"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicAuthUser = Omit<AuthUser, "passwordHash">;

export type SessionPayload = {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
  exp: number;
};
