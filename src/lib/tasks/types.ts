export type TaskStatus = "open" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "critical" | "high" | "normal" | "low";
export type TaskCategory = "check_in" | "check_out" | "cleaning" | "payment" | "maintenance" | "manual";
export type TaskAssigneeRole = "administrator" | "manager" | "reception" | "housekeeping" | "unassigned";

export type OperationalTask = {
  id: string;
  source: "automatic" | "manual";
  sourceKey?: string;
  reservationCode?: string;
  category: TaskCategory;
  title: string;
  description?: string;
  apartmentTitles: string[];
  guestName?: string;
  dueAt: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeRole: TaskAssigneeRole;
  assigneeName?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskFilters = {
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  category?: TaskCategory | "all";
  assigneeRole?: TaskAssigneeRole | "all";
};

export type TaskSummary = {
  open: number;
  inProgress: number;
  overdue: number;
  dueToday: number;
  completed: number;
  critical: number;
};
