import { JsonFileRepository } from "@/lib/data";
import { deliverQueuedGuestAutomations } from "@/lib/guest-automation/delivery";
import { queueGuestAutomations } from "@/lib/guest-automation/queue";

export type GuestAutomationSchedulerState = {
  lastStatus: "never" | "running" | "success" | "failed";
  totalRuns: number;
  lastStartedAt?: string;
  lastCompletedAt?: string;
  lastToday?: string;
  lastError?: string;
  lastQueue?: {
    candidates: number;
    queued: number;
    skipped: number;
  };
  lastDelivery?: {
    deliveryEnabled: boolean;
    attempted: number;
    sent: number;
    failed: number;
    skipped: number;
    disabled: number;
  };
};

type StoreShape = {
  state: GuestAutomationSchedulerState;
};

const repository = new JsonFileRepository<StoreShape>({
  fileName: "guest-automation-scheduler.json",
  createDefault: () => ({
    state: {
      lastStatus: "never",
      totalRuns: 0,
    },
  }),
  normalize(value) {
    const parsed = (value ?? {}) as Partial<StoreShape>;
    const state = parsed.state ?? ({ lastStatus: "never", totalRuns: 0 } as GuestAutomationSchedulerState);

    return {
      state: {
        lastStatus: state.lastStatus ?? "never",
        totalRuns: Number.isFinite(state.totalRuns) ? Number(state.totalRuns) : 0,
        lastStartedAt: state.lastStartedAt,
        lastCompletedAt: state.lastCompletedAt,
        lastToday: state.lastToday,
        lastError: state.lastError,
        lastQueue: state.lastQueue,
        lastDelivery: state.lastDelivery,
      },
    };
  },
});

let activeRun: Promise<GuestAutomationSchedulerState> | null = null;

function now() {
  return new Date().toISOString();
}

export async function getGuestAutomationSchedulerState() {
  return (await repository.read()).state;
}

async function executeCycle(input: {
  date?: Date;
  deliveryLimit?: number;
}) {
  const previous = await getGuestAutomationSchedulerState();
  const startedAt = now();

  await repository.write({
    state: {
      ...previous,
      lastStatus: "running",
      lastStartedAt: startedAt,
      lastError: undefined,
    },
  });

  try {
    const queue = await queueGuestAutomations(input.date ?? new Date());
    const delivery = await deliverQueuedGuestAutomations({
      limit: input.deliveryLimit ?? 25,
    });

    const completed: GuestAutomationSchedulerState = {
      lastStatus: "success",
      totalRuns: previous.totalRuns + 1,
      lastStartedAt: startedAt,
      lastCompletedAt: now(),
      lastToday: queue.today,
      lastQueue: {
        candidates: queue.candidates,
        queued: queue.queued,
        skipped: queue.skipped,
      },
      lastDelivery: {
        deliveryEnabled: delivery.deliveryEnabled,
        attempted: delivery.attempted,
        sent: delivery.sent,
        failed: delivery.failed,
        skipped: delivery.skipped,
        disabled: delivery.disabled,
      },
    };

    await repository.write({ state: completed });
    return completed;
  } catch (error) {
    const failed: GuestAutomationSchedulerState = {
      ...previous,
      lastStatus: "failed",
      totalRuns: previous.totalRuns + 1,
      lastStartedAt: startedAt,
      lastCompletedAt: now(),
      lastError: error instanceof Error ? error.message : "Eroare necunoscută în scheduler.",
    };

    await repository.write({ state: failed });
    return failed;
  }
}

export async function runGuestAutomationScheduler(input: {
  date?: Date;
  deliveryLimit?: number;
} = {}) {
  if (activeRun) {
    return {
      alreadyRunning: true,
      state: await activeRun,
    };
  }

  activeRun = executeCycle(input);

  try {
    return {
      alreadyRunning: false,
      state: await activeRun,
    };
  } finally {
    activeRun = null;
  }
}
