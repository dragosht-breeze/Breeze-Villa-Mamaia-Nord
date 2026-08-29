import type { UserRole } from "./types";

export type AdminModule =
  | "dashboard" | "analytics" | "operations" | "calendar" | "reservations"
  | "crm" | "rates" | "payments" | "housekeeping" | "booking-sync" | "tasks" | "notifications" | "settings";

const permissions: Record<UserRole, AdminModule[]> = {
  ADMIN: ["dashboard","analytics","operations","calendar","reservations","crm","rates","payments","housekeeping","booking-sync","tasks","notifications","settings"],
  MANAGER: ["dashboard","analytics","operations","calendar","reservations","crm","rates","payments","housekeeping","booking-sync","tasks","notifications"],
  RECEPTION: ["dashboard","operations","calendar","reservations","crm","payments","notifications"],
  HOUSEKEEPING: ["dashboard","operations","calendar","housekeeping","tasks","notifications"],
};

export function canAccessModule(role: UserRole, module: AdminModule): boolean {
  return permissions[role].includes(module);
}

export function moduleFromPath(pathname: string): AdminModule {
  if (pathname.startsWith("/admin/analytics")) return "analytics";
  if (pathname.startsWith("/admin/operations")) return "operations";
  if (pathname.startsWith("/admin/calendar")) return "calendar";
  if (pathname.startsWith("/admin/reservations")) return "reservations";
  if (pathname.startsWith("/admin/crm")) return "crm";
  if (pathname.startsWith("/admin/rates")) return "rates";
  if (pathname.startsWith("/admin/payments")) return "payments";
  if (pathname.startsWith("/admin/housekeeping")) return "housekeeping";
  if (pathname.startsWith("/admin/tasks")) return "tasks";
  if (pathname.startsWith("/admin/notifications")) return "notifications";
  if (pathname.startsWith("/admin/booking-sync")) return "booking-sync";
  if (pathname.startsWith("/admin/settings")) return "settings";
  return "dashboard";
}
