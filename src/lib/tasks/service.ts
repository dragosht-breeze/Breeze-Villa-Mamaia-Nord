import { randomUUID } from "node:crypto";
import { listReservationFolders } from "@/lib/reservation-center/store";
import type { ReservationFolder } from "@/lib/reservation-center/types";
import { readTasks, updateTaskStore } from "@/lib/tasks/store";
import type { OperationalTask, TaskCategory, TaskPriority, TaskSummary } from "@/lib/tasks/types";

const ACTIVE_RESERVATION_STATUSES = new Set(["waiting_payment", "confirmed", "checked_in", "checked_out"]);

function nowIso() { return new Date().toISOString(); }
function atHour(date: string, hour: number) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d, hour, 0, 0, 0).toISOString();
}
function money(value: number) { return new Intl.NumberFormat("ro-RO").format(value); }
function sourceKey(code: string, category: TaskCategory) { return `${code}:${category}`; }

function automaticTask(input: {
  folder: ReservationFolder;
  category: TaskCategory;
  title: string;
  description?: string;
  dueAt: string;
  priority: TaskPriority;
  assigneeRole: OperationalTask["assigneeRole"];
}): OperationalTask {
  const timestamp = nowIso();
  return {
    id: randomUUID(),
    source: "automatic",
    sourceKey: sourceKey(input.folder.code, input.category),
    reservationCode: input.folder.code,
    category: input.category,
    title: input.title,
    description: input.description,
    apartmentTitles: input.folder.summary.apartments.map((item) => item.title),
    guestName: input.folder.summary.guest.name,
    dueAt: input.dueAt,
    priority: input.priority,
    status: "open",
    assigneeRole: input.assigneeRole,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function buildAutomaticTasks(folder: ReservationFolder): OperationalTask[] {
  if (!ACTIVE_RESERVATION_STATUSES.has(folder.lifecycleStatus)) return [];
  const tasks: OperationalTask[] = [];

  if (folder.operations.checkInStatus !== "completed" && folder.lifecycleStatus !== "checked_out") {
    tasks.push(automaticTask({
      folder,
      category: "check_in",
      title: `Pregătește check-in-ul – ${folder.summary.guest.name}`,
      description: `Rezervarea ${folder.code}. Verifică apartamentul, datele oaspeților și instrucțiunile de acces.`,
      dueAt: atHour(folder.summary.checkIn, 14),
      priority: "high",
      assigneeRole: "reception",
    }));
  }

  if (folder.operations.checkOutStatus !== "completed" && !["waiting_payment", "confirmed"].includes(folder.lifecycleStatus)) {
    tasks.push(automaticTask({
      folder,
      category: "check_out",
      title: `Finalizează check-out-ul – ${folder.summary.guest.name}`,
      description: `Rezervarea ${folder.code}. Confirmă plecarea și verifică eventualele observații.`,
      dueAt: atHour(folder.summary.checkOut, 10),
      priority: "high",
      assigneeRole: "reception",
    }));
  }

  if (folder.operations.cleaningStatus !== "ready") {
    tasks.push(automaticTask({
      folder,
      category: "cleaning",
      title: `Curățenie după sejur – ${folder.summary.apartments.map((item) => item.title).join(", ")}`,
      description: `Rezervarea ${folder.code}. Curățenie completă, lenjerie și verificarea apartamentului.`,
      dueAt: atHour(folder.summary.checkOut, 12),
      priority: folder.lifecycleStatus === "checked_out" ? "critical" : "normal",
      assigneeRole: "housekeeping",
    }));
  }

  if (folder.financial.balance > 0 && !["checked_out", "completed"].includes(folder.lifecycleStatus)) {
    tasks.push(automaticTask({
      folder,
      category: "payment",
      title: `Încasează soldul de ${money(folder.financial.balance)} lei`,
      description: `Rezervarea ${folder.code}, client ${folder.summary.guest.name}. Total ${money(folder.financial.total)} lei, achitat ${money(folder.financial.paid)} lei.`,
      dueAt: atHour(folder.summary.checkIn, 15),
      priority: folder.lifecycleStatus === "waiting_payment" ? "critical" : "high",
      assigneeRole: "reception",
    }));
  }

  if (folder.operations.maintenanceRequired) {
    tasks.push(automaticTask({
      folder,
      category: "maintenance",
      title: `Mentenanță necesară – ${folder.summary.apartments.map((item) => item.title).join(", ")}`,
      description: folder.operations.maintenanceNote || `Verificare semnalată pentru rezervarea ${folder.code}.`,
      dueAt: atHour(folder.summary.checkIn, 12),
      priority: "critical",
      assigneeRole: "manager",
    }));
  }

  return tasks;
}

export async function syncAutomaticTasks() {
  const [folders, existing] = await Promise.all([listReservationFolders(), readTasks()]);
  const generated = folders.flatMap(buildAutomaticTasks);
  const generatedByKey = new Map(generated.map((task) => [task.sourceKey!, task]));
  const existingByKey = new Map(existing.filter((task) => task.sourceKey).map((task) => [task.sourceKey!, task]));
  const timestamp = nowIso();

  const automatic = generated.map((task) => {
    const previous = existingByKey.get(task.sourceKey!);
    if (!previous) return task;
    return {
      ...task,
      id: previous.id,
      status: previous.status,
      assigneeName: previous.assigneeName,
      completedAt: previous.completedAt,
      createdAt: previous.createdAt,
      updatedAt: previous.updatedAt,
    };
  });

  const preservedAutomatic = existing.filter((task) =>
    task.source === "automatic" &&
    task.sourceKey &&
    !generatedByKey.has(task.sourceKey) &&
    ["completed", "cancelled"].includes(task.status)
  );
  const manual = existing.filter((task) => task.source === "manual");
  const next = [...manual, ...automatic, ...preservedAutomatic].map((task) => ({ ...task, updatedAt: task.updatedAt || timestamp }));
  await updateTaskStore(() => next);
  return next;
}

export async function listTasks() {
  const tasks = await syncAutomaticTasks();
  return [...tasks].sort((a, b) => {
    const priority = { critical: 0, high: 1, normal: 2, low: 3 };
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;
    return a.dueAt.localeCompare(b.dueAt) || priority[a.priority] - priority[b.priority];
  });
}

export async function createManualTask(input: {
  title: string; description?: string; dueAt: string; priority?: TaskPriority;
  category?: TaskCategory; assigneeRole?: OperationalTask["assigneeRole"];
  assigneeName?: string; apartmentTitles?: string[];
}) {
  const timestamp = nowIso();
  const task: OperationalTask = {
    id: randomUUID(), source: "manual", category: input.category ?? "manual",
    title: input.title.trim(), description: input.description?.trim(),
    apartmentTitles: input.apartmentTitles ?? [], dueAt: new Date(input.dueAt).toISOString(),
    priority: input.priority ?? "normal", status: "open",
    assigneeRole: input.assigneeRole ?? "unassigned", assigneeName: input.assigneeName?.trim(),
    createdAt: timestamp, updatedAt: timestamp,
  };
  await updateTaskStore((tasks) => [task, ...tasks]);
  return task;
}

export async function updateTask(id: string, input: Partial<Pick<OperationalTask, "title" | "description" | "dueAt" | "priority" | "status" | "assigneeRole" | "assigneeName">>) {
  let updated: OperationalTask | null = null;
  await updateTaskStore((tasks) => tasks.map((task) => {
    if (task.id !== id) return task;
    const status = input.status ?? task.status;
    updated = {
      ...task, ...input,
      title: input.title?.trim() || task.title,
      dueAt: input.dueAt ? new Date(input.dueAt).toISOString() : task.dueAt,
      status,
      completedAt: status === "completed" ? task.completedAt ?? nowIso() : undefined,
      updatedAt: nowIso(),
    };
    return updated;
  }));
  return updated;
}

export async function deleteManualTask(id: string) {
  let deleted = false;
  await updateTaskStore((tasks) => tasks.filter((task) => {
    if (task.id === id && task.source === "manual") { deleted = true; return false; }
    return true;
  }));
  return deleted;
}

export function summarizeTasks(tasks: OperationalTask[]): TaskSummary {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start); end.setDate(end.getDate() + 1);
  const active = tasks.filter((task) => !["completed", "cancelled"].includes(task.status));
  return {
    open: tasks.filter((task) => task.status === "open").length,
    inProgress: tasks.filter((task) => task.status === "in_progress").length,
    overdue: active.filter((task) => new Date(task.dueAt) < now).length,
    dueToday: active.filter((task) => { const due = new Date(task.dueAt); return due >= start && due < end; }).length,
    completed: tasks.filter((task) => task.status === "completed").length,
    critical: active.filter((task) => task.priority === "critical").length,
  };
}
