import { listReservationFolders } from "@/lib/reservation-center/store";
import { listTasks } from "@/lib/tasks/service";
import { readNotificationState, updateNotificationState } from "@/lib/notifications/store";
import type { AdminNotification, NotificationSummary } from "@/lib/notifications/types";

function dateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bucharest", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
function isoAt(date: string, hour = 8) { return new Date(`${date}T${String(hour).padStart(2,"0")}:00:00+03:00`).toISOString(); }
function money(value: number) { return new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 0 }).format(value); }

export async function listNotifications(): Promise<AdminNotification[]> {
  const [folders, tasks, state] = await Promise.all([listReservationFolders(), listTasks(), readNotificationState()]);
  const today = dateKey();
  const items: Omit<AdminNotification, "readAt" | "dismissedAt">[] = [];

  for (const folder of folders) {
    if (["cancelled", "expired", "completed"].includes(folder.lifecycleStatus)) continue;
    if (folder.lifecycleStatus === "new_request") items.push({ id: `reservation:${folder.code}`, sourceKey: `reservation:${folder.code}`, type: "reservation", severity: "info", title: "Rezervare nouă", message: `${folder.summary.guest.name} a trimis o cerere pentru ${folder.summary.apartments.map(a=>a.title).join(", ")}.`, href: `/admin/reservations/${folder.code}`, reservationCode: folder.code, createdAt: folder.createdAt });
    if (folder.financial.balance > 0 && folder.summary.checkIn <= today) items.push({ id: `payment:${folder.code}`, sourceKey: `payment:${folder.code}`, type: "payment", severity: folder.summary.checkIn < today ? "critical" : "warning", title: "Sold restant", message: `${folder.summary.guest.name} mai are de achitat ${money(folder.financial.balance)} lei.`, href: `/admin/reservations/${folder.code}`, reservationCode: folder.code, createdAt: isoAt(folder.summary.checkIn, 9) });
    if (folder.summary.checkIn === today && folder.operations.checkInStatus !== "completed") items.push({ id: `checkin:${folder.code}`, sourceKey: `checkin:${folder.code}`, type: "operation", severity: "warning", title: "Check-in astăzi", message: `${folder.summary.guest.name} sosește astăzi. Verifică pregătirea apartamentului și accesul.`, href: `/admin/reservations/${folder.code}`, reservationCode: folder.code, createdAt: isoAt(today, 7) });
    if (folder.summary.checkOut === today && folder.operations.checkOutStatus !== "completed") items.push({ id: `checkout:${folder.code}`, sourceKey: `checkout:${folder.code}`, type: "operation", severity: "info", title: "Check-out astăzi", message: `${folder.summary.guest.name} are plecarea programată astăzi.`, href: `/admin/reservations/${folder.code}`, reservationCode: folder.code, createdAt: isoAt(today, 7) });
    if (folder.operations.maintenanceRequired) items.push({ id: `maintenance:${folder.code}`, sourceKey: `maintenance:${folder.code}`, type: "operation", severity: "critical", title: "Mentenanță necesară", message: folder.operations.maintenanceNote || `Este necesară o verificare pentru rezervarea ${folder.code}.`, href: `/admin/reservations/${folder.code}`, reservationCode: folder.code, createdAt: folder.updatedAt });
  }

  const now = new Date();
  for (const task of tasks) {
    if (["completed", "cancelled"].includes(task.status)) continue;
    const due = new Date(task.dueAt);
    if (due < now || task.priority === "critical") items.push({ id: `task:${task.id}`, sourceKey: `task:${task.id}`, type: "task", severity: due < now ? "critical" : "warning", title: due < now ? "Task întârziat" : "Task critic", message: task.title, href: "/admin/tasks", reservationCode: task.reservationCode, createdAt: task.updatedAt });
  }

  return items
    .map(item => ({ ...item, readAt: state.read[item.sourceKey], dismissedAt: state.dismissed[item.sourceKey] }))
    .filter(item => !item.dismissedAt)
    .sort((a,b) => {
      const rank = { critical: 0, warning: 1, info: 2, success: 3 };
      return rank[a.severity] - rank[b.severity] || b.createdAt.localeCompare(a.createdAt);
    });
}

export function summarizeNotifications(items: AdminNotification[]): NotificationSummary {
  return { total: items.length, unread: items.filter(i=>!i.readAt).length, critical: items.filter(i=>i.severity==="critical" && !i.readAt).length, warnings: items.filter(i=>i.severity==="warning" && !i.readAt).length };
}

export async function markNotification(id: string, action: "read" | "unread" | "dismiss") {
  const timestamp = new Date().toISOString();
  await updateNotificationState(state => {
    const read = { ...state.read }; const dismissed = { ...state.dismissed };
    if (action === "read") read[id] = timestamp;
    if (action === "unread") delete read[id];
    if (action === "dismiss") dismissed[id] = timestamp;
    return { read, dismissed };
  });
}

export async function markAllNotificationsRead() {
  const items = await listNotifications(); const timestamp = new Date().toISOString();
  await updateNotificationState(state => ({ ...state, read: { ...state.read, ...Object.fromEntries(items.map(i=>[i.sourceKey, timestamp])) } }));
}
