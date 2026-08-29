"use client";

const CHANNEL_NAME = "breeze-admin-live";
const EVENT_NAME = "breeze:admin-data-changed";

export type AdminLiveEvent = {
  entity: "reservation" | "payment" | "request" | "operation";
  code?: string;
  action: string;
  at: string;
};

export function publishAdminLiveEvent(
  event: Omit<AdminLiveEvent, "at">
) {
  if (typeof window === "undefined") return;

  const payload: AdminLiveEvent = {
    ...event,
    at: new Date().toISOString(),
  };

  window.dispatchEvent(
    new CustomEvent<AdminLiveEvent>(EVENT_NAME, {
      detail: payload,
    })
  );

  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(payload);
    channel.close();
  } catch {}

  try {
    localStorage.setItem(
      EVENT_NAME,
      JSON.stringify(payload)
    );
  } catch {}
}

export function subscribeAdminLiveEvents(
  handler: (event: AdminLiveEvent) => void
) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const onCustomEvent = (rawEvent: Event) => {
    const event = rawEvent as CustomEvent<AdminLiveEvent>;
    if (event.detail) handler(event.detail);
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key !== EVENT_NAME || !event.newValue) return;

    try {
      handler(JSON.parse(event.newValue) as AdminLiveEvent);
    } catch {}
  };

  let channel: BroadcastChannel | null = null;

  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (
      event: MessageEvent<AdminLiveEvent>
    ) => handler(event.data);
  } catch {
    channel = null;
  }

  window.addEventListener(EVENT_NAME, onCustomEvent);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(EVENT_NAME, onCustomEvent);
    window.removeEventListener("storage", onStorage);
    channel?.close();
  };
}
