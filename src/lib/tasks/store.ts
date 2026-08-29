import { JsonFileRepository } from "@/lib/data";
import type { OperationalTask } from "@/lib/tasks/types";

type TaskStore = { tasks: OperationalTask[] };

const repository = new JsonFileRepository<TaskStore>({
  fileName: "tasks.json",
  createDefault: () => ({ tasks: [] }),
  normalize(value) {
    const parsed = (value ?? {}) as Partial<TaskStore>;
    return { tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [] };
  },
});

export async function readTasks() {
  return (await repository.read()).tasks;
}

export async function replaceTasks(tasks: OperationalTask[]) {
  await repository.write({ tasks });
  return tasks;
}

export async function updateTaskStore(updater: (tasks: OperationalTask[]) => OperationalTask[]) {
  const result = await repository.update((store) => ({ tasks: updater(store.tasks) }));
  return result.tasks;
}
