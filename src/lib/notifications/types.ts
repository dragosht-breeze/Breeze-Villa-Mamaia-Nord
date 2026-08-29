export type NotificationType = "reservation" | "payment" | "task" | "operation" | "system";
export type NotificationSeverity = "info" | "warning" | "critical" | "success";

export type AdminNotification = {
  id: string;
  sourceKey: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  href?: string;
  reservationCode?: string;
  createdAt: string;
  readAt?: string;
  dismissedAt?: string;
};

export type NotificationState = {
  read: Record<string, string>;
  dismissed: Record<string, string>;
};

export type NotificationSummary = {
  total: number;
  unread: number;
  critical: number;
  warnings: number;
};
