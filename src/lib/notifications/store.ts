import { JsonFileRepository } from "@/lib/data";
import type { NotificationState } from "@/lib/notifications/types";

const repository = new JsonFileRepository<NotificationState>({
  fileName: "notification-state.json",
  createDefault: () => ({ read: {}, dismissed: {} }),
  normalize(value) {
    const parsed = (value ?? {}) as Partial<NotificationState>;
    return {
      read: parsed.read && typeof parsed.read === "object" ? parsed.read : {},
      dismissed: parsed.dismissed && typeof parsed.dismissed === "object" ? parsed.dismissed : {},
    };
  },
});

export async function readNotificationState() { return repository.read(); }
export async function updateNotificationState(updater: (state: NotificationState) => NotificationState) {
  return repository.update(updater);
}
