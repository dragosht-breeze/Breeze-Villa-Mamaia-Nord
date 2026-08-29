"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MessageCircleMore,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
} from "lucide-react";

type Status = "queued" | "sending" | "sent" | "failed";

type AutomationItem = {
  reservationCode: string;
  guestName: string;
  apartmentTitles: string[];
  checkIn: string;
  checkOut: string;
  lifecycleStatus: string;
  communicationId: string;
  channel: string;
  template: string;
  trigger: string;
  status: Status;
  recipient: string;
  message: string;
  attempts: number;
  error?: string;
  providerMessageId?: string;
  createdAt: string;
  lastAttemptAt?: string;
  sentAt?: string;
  metaTemplateConfigured: boolean;
};

type Payload = {
  generatedAt: string;
  deliveryEnabled: boolean;
  whatsappConfigured: boolean;
  summary: {
    total: number;
    queued: number;
    sending: number;
    sent: number;
    failed: number;
  };
  items: AutomationItem[];
};

type Filter = "all" | Status;

type SchedulerState = {
  lastStatus: "never" | "running" | "success" | "failed";
  totalRuns: number;
  lastStartedAt?: string;
  lastCompletedAt?: string;
  lastToday?: string;
  lastError?: string;
  lastQueue?: { candidates: number; queued: number; skipped: number };
  lastDelivery?: {
    deliveryEnabled: boolean;
    attempted: number;
    sent: number;
    failed: number;
    skipped: number;
    disabled: number;
  };
};

type SchedulerPayload = {
  generatedAt: string;
  state: SchedulerState;
};


const triggerLabel: Record<string, string> = {
  PRE_STAY: "Pre-sejur",
  CHECK_IN_DAY: "Ziua sosirii",
  IN_STAY: "În timpul sejurului",
  PRE_CHECKOUT: "Înainte de check-out",
  POST_STAY: "După sejur",
};

const statusLabel: Record<Status, string> = {
  queued: "În coadă",
  sending: "Se trimite",
  sent: "Trimis",
  failed: "Eșuat",
};

const statusTone: Record<Status, string> = {
  queued: "bg-amber-50 text-amber-800 border-amber-200",
  sending: "bg-blue-50 text-blue-800 border-blue-200",
  sent: "bg-emerald-50 text-emerald-800 border-emerald-200",
  failed: "bg-red-50 text-red-800 border-red-200",
};

function formatDateTime(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ro-RO", {
    timeZone: "Europe/Bucharest",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function GuestAutomationDashboard() {
  const [data, setData] = useState<Payload | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState("");
  const [schedulerBusy, setSchedulerBusy] = useState(false);
  const [scheduler, setScheduler] = useState<SchedulerPayload | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [statusResponse, schedulerResponse] = await Promise.all([
        fetch("/api/admin/guest-automation-status", { cache: "no-store" }),
        fetch("/api/admin/guest-automation-scheduler", { cache: "no-store" }),
      ]);

      if (!statusResponse.ok) throw new Error("Automatizările nu au putut fi încărcate.");
      if (!schedulerResponse.ok) throw new Error("Schedulerul nu a putut fi încărcat.");

      setData((await statusResponse.json()) as Payload);
      setScheduler((await schedulerResponse.json()) as SchedulerPayload);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare necunoscută.");
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(timer);
  }, [load]);

  async function runSchedulerNow() {
    setSchedulerBusy(true);
    try {
      const response = await fetch("/api/admin/guest-automation-scheduler", {
        method: "POST",
      });
      const result = (await response.json()) as { ok?: boolean; state?: SchedulerState; message?: string };
      if (!response.ok || result.ok === false) {
        throw new Error(result.message || result.state?.lastError || "Schedulerul nu a putut rula.");
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare necunoscută.");
    } finally {
      setSchedulerBusy(false);
    }
  }

  async function retry(item: AutomationItem) {
    setBusy(item.communicationId);
    try {
      const response = await fetch("/api/admin/guest-automation-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "retry",
          reservationCode: item.reservationCode,
          communicationId: item.communicationId,
        }),
      });
      const result = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok) throw new Error(result.message || "Mesajul nu a putut fi repus în coadă.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare necunoscută.");
    } finally {
      setBusy("");
    }
  }

  const visible = useMemo(() => {
    const items = data?.items ?? [];
    return filter === "all" ? items : items.filter((item) => item.status === filter);
  }, [data, filter]);

  if (!data) {
    return (
      <main className="p-6 lg:p-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-white p-10 text-center shadow-sm">
          <RefreshCw className="mx-auto animate-spin text-[#158F91]" />
          <p className="mt-4 font-black">Se încarcă Automation Center...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2rem] bg-[#071B2D] p-6 text-white shadow-[0_24px_70px_rgba(7,27,45,.18)] sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.25em] text-[#D9B56D]">
                <MessageCircleMore size={15} /> Breeze PMS
              </p>
              <h1 className="mt-3 text-3xl font-black sm:text-4xl">Guest Automation</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/65">
                Monitorizează mesajele automate pregătite pentru oaspeți, starea livrării și eventualele erori.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-black ${data.deliveryEnabled ? "bg-emerald-400 text-[#071B2D]" : "bg-white/10 text-white"}`}>
                {data.deliveryEnabled ? <Send size={16} /> : <PauseCircle size={16} />}
                Delivery {data.deliveryEnabled ? "ACTIV" : "OPRIT"}
              </span>
              <span className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-black ${data.whatsappConfigured ? "bg-[#D9B56D] text-[#071B2D]" : "bg-red-400/20 text-red-100"}`}>
                <ShieldCheck size={16} /> WhatsApp {data.whatsappConfigured ? "configurat" : "neconfigurat"}
              </span>
            </div>
          </div>
        </section>

        {!data.deliveryEnabled ? (
          <div className="mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
            <PauseCircle className="mt-0.5 shrink-0" size={19} />
            <div>
              Livrarea externă este oprită intenționat. Mesajele pot intra în coadă, dar nu sunt trimise către clienți până la activarea numărului WhatsApp dedicat și a template-urilor Meta.
            </div>
          </div>
        ) : null}

        {error ? <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}

        <section className="mt-5 rounded-[1.8rem] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#158F91]">Scheduler RC12.6</p>
              <h2 className="mt-1 text-xl font-black">Ciclu automat rezervări → coadă → delivery</h2>
              <p className="mt-1 text-xs font-semibold text-gray-500">
                {scheduler?.state.lastStatus === "never"
                  ? "Nu a rulat încă."
                  : `Ultima rulare: ${formatDateTime(scheduler?.state.lastCompletedAt ?? scheduler?.state.lastStartedAt)} • status ${scheduler?.state.lastStatus ?? "—"}`}
              </p>
              {scheduler?.state.lastQueue ? (
                <p className="mt-2 text-xs font-bold text-gray-600">
                  Ultimul ciclu: {scheduler.state.lastQueue.candidates} candidați • {scheduler.state.lastQueue.queued} puse în coadă • {scheduler.state.lastQueue.skipped} omise
                </p>
              ) : null}
              {scheduler?.state.lastError ? <p className="mt-2 text-xs font-bold text-red-700">{scheduler.state.lastError}</p> : null}
            </div>
            <button
              onClick={() => void runSchedulerNow()}
              disabled={schedulerBusy || scheduler?.state.lastStatus === "running"}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D9B56D] px-5 py-3 text-xs font-black text-[#071B2D] disabled:opacity-50"
            >
              {schedulerBusy || scheduler?.state.lastStatus === "running" ? <RefreshCw className="animate-spin" size={15} /> : <PlayCircle size={16} />}
              Rulează acum
            </button>
          </div>
          <p className="mt-4 rounded-2xl bg-[#F4F3EE] p-3 text-xs font-bold leading-5 text-gray-600">
            După lansare, acest ciclu va fi apelat periodic de schedulerul hostingului. Delivery WhatsApp respectă în continuare comutatorul de siguranță și rămâne oprit cât timp GUEST_AUTOMATION_DELIVERY_ENABLED=false.
          </p>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Total", value: data.summary.total, icon: MessageCircleMore, cls: "bg-[#E9F8F8] text-[#158F91]" },
            { label: "În coadă", value: data.summary.queued, icon: Clock3, cls: "bg-amber-50 text-amber-800" },
            { label: "Se trimit", value: data.summary.sending, icon: RefreshCw, cls: "bg-blue-50 text-blue-700" },
            { label: "Trimise", value: data.summary.sent, icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700" },
            { label: "Eșuate", value: data.summary.failed, icon: AlertTriangle, cls: "bg-red-50 text-red-700" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-[1.5rem] border border-black/5 bg-white p-5 shadow-sm">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.cls}`}><Icon size={20} /></span>
                <p className="mt-4 text-2xl font-black">{card.value}</p>
                <p className="mt-1 text-xs font-black uppercase tracking-[.12em] text-gray-500">{card.label}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-5 rounded-[1.8rem] border border-black/5 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#158F91]">Mesagerie automată</p>
              <h2 className="mt-1 text-2xl font-black">Coada și istoricul livrărilor</h2>
              <p className="mt-1 text-xs font-semibold text-gray-500">Ultima actualizare: {formatDateTime(data.generatedAt)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "queued", "sending", "sent", "failed"] as Filter[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-full px-4 py-2 text-xs font-black ${filter === item ? "bg-[#071B2D] text-white" : "bg-[#F4F3EE] text-gray-600"}`}
                >
                  {item === "all" ? "Toate" : statusLabel[item]}
                </button>
              ))}
              <button onClick={() => void load()} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F3EE]" aria-label="Actualizează">
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {visible.length === 0 ? (
              <div className="rounded-2xl bg-emerald-50 p-8 text-center text-emerald-800">
                <CheckCircle2 className="mx-auto" />
                <p className="mt-2 font-black">Nu există mesaje în această categorie.</p>
              </div>
            ) : visible.map((item) => (
              <article key={`${item.reservationCode}-${item.communicationId}`} className="rounded-[1.4rem] border border-black/5 bg-[#FAFAF7] p-4 sm:p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${statusTone[item.status]}`}>{statusLabel[item.status]}</span>
                      <span className="rounded-full bg-[#E9F8F8] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#158F91]">{triggerLabel[item.trigger] ?? item.trigger}</span>
                      {!item.metaTemplateConfigured ? <span className="rounded-full bg-gray-200 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-gray-600">Meta pending</span> : null}
                    </div>

                    <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <p className="text-lg font-black">{item.guestName || "Oaspete"}</p>
                      <p className="text-xs font-bold text-gray-500">{item.recipient}</p>
                    </div>
                    <p className="mt-1 text-sm font-bold text-gray-600">{item.apartmentTitles.join(" + ") || "Cazare"} • {item.checkIn} → {item.checkOut}</p>

                    {item.message ? <div className="mt-4 whitespace-pre-wrap rounded-2xl bg-white p-4 text-sm font-semibold leading-6 text-gray-700 ring-1 ring-black/5">{item.message}</div> : null}

                    {item.error ? <div className="mt-3 rounded-2xl bg-red-50 p-3 text-xs font-bold leading-5 text-red-700">{item.error}</div> : null}

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-bold text-gray-500">
                      <span>Creat: {formatDateTime(item.createdAt)}</span>
                      <span>Încercări: {item.attempts}</span>
                      {item.lastAttemptAt ? <span>Ultima încercare: {formatDateTime(item.lastAttemptAt)}</span> : null}
                      {item.sentAt ? <span>Trimis: {formatDateTime(item.sentAt)}</span> : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link href={`/admin/reservations/${encodeURIComponent(item.reservationCode)}`} className="inline-flex items-center gap-2 rounded-full bg-[#071B2D] px-4 py-2.5 text-xs font-black text-white">
                      Rezervare <ExternalLink size={13} />
                    </Link>
                    {item.status === "failed" ? (
                      <button
                        onClick={() => void retry(item)}
                        disabled={busy === item.communicationId}
                        className="inline-flex items-center gap-2 rounded-full bg-[#D9B56D] px-4 py-2.5 text-xs font-black text-[#071B2D] disabled:opacity-50"
                      >
                        <RotateCcw size={13} /> Reîncearcă
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
