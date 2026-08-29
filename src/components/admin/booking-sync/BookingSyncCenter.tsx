"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Database,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldAlert,
  WifiOff,
} from "lucide-react";

type Connection = {
  apartmentSlug: string;
  apartmentName: string;
  envKey: string;
  provider: string;
  label: string;
  enabled: boolean;
  hasUrl: boolean;
};

type Conflict = {
  id: string;
  apartmentSlug: string;
  externalStart: string;
  externalEnd: string;
  directReservationCode: string;
  directGuestName: string;
  directStart: string;
  directEnd: string;
};

type ConnectionResult = {
  apartmentSlug: string;
  label: string;
  ok: boolean;
  eventCount: number;
  importedCount: number;
  removedCount: number;
  durationMs: number;
  message?: string;
};

type History = {
  id: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  ok: boolean;
  requestedApartmentSlug?: string;
  totalEvents: number;
  totalImported: number;
  totalRemoved: number;
  conflictCount: number;
  results: ConnectionResult[];
};

type Payload = {
  ok: boolean;
  connections: Connection[];
  updatedAt: string | null;
  eventCount: number;
  conflicts: Conflict[];
  history: History[];
  message?: string;
};

function formatDateTime(value: string | null) {
  if (!value) return "Niciodată";

  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function BookingSyncCenter() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/booking-sync", {
        cache: "no-store",
      });
      const payload = (await response.json()) as Payload;

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.message ?? "Booking Sync nu a putut fi încărcat."
        );
      }

      setData(payload);
      setError("");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Booking Sync nu a putut fi încărcat."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(timer);
  }, [load]);

  async function sync(apartmentSlug?: string) {
    setSyncing(apartmentSlug ?? "all");
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/booking-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apartmentSlug }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.message ?? "Sincronizarea nu a reușit."
        );
      }

      setMessage(payload.message ?? "Sincronizare finalizată.");
      await load();
    } catch (syncError) {
      setError(
        syncError instanceof Error
          ? syncError.message
          : "Sincronizarea nu a reușit."
      );
    } finally {
      setSyncing("");
    }
  }

  const connectedCount = useMemo(
    () => data?.connections.filter((item) => item.enabled).length ?? 0,
    [data]
  );

  if (loading && !data) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 font-black text-[#071B2D] shadow-sm ring-1 ring-black/5">
          <Loader2 className="animate-spin" size={20} />
          Se încarcă Booking Sync...
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-[1500px]">
        <header className="rounded-[2rem] bg-[#071B2D] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D9B56D]">
                Breeze PMS • Channel Sync
              </p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                Booking Sync
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/65">
                Importurile iCal sunt salvate permanent și utilizate în
                disponibilitatea site-ului. Tarifele și minimul de nopți
                rămân independente de Booking.com.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void sync()}
              disabled={Boolean(syncing)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D9B56D] px-5 py-3.5 text-sm font-black text-[#071B2D] disabled:opacity-60"
            >
              {syncing === "all" ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <RefreshCw size={18} />
              )}
              Sincronizează acum
            </button>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                label: "Conexiuni",
                value: `${connectedCount}/${data?.connections.length ?? 0}`,
                icon: Database,
              },
              {
                label: "Evenimente salvate",
                value: data?.eventCount ?? 0,
                icon: CalendarClock,
              },
              {
                label: "Conflicte",
                value: data?.conflicts.length ?? 0,
                icon: ShieldAlert,
              },
              {
                label: "Ultima sincronizare",
                value: data?.updatedAt
                  ? new Intl.DateTimeFormat("ro-RO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(data.updatedAt))
                  : "—",
                icon: Clock3,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10"
                >
                  <div className="flex items-center gap-2 text-white/55">
                    <Icon size={16} />
                    <span className="text-[9px] font-black uppercase tracking-[0.12em]">
                      {item.label}
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-black text-white">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </header>

        {error ? (
          <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-black text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-black text-emerald-700 ring-1 ring-emerald-200">
            {message}
          </div>
        ) : null}

        <section className="mt-5 rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#158F91]">
                iCal Manager
              </p>
              <h2 className="mt-1 text-2xl font-black text-[#071B2D]">
                Conexiuni apartamente
              </h2>
            </div>
            <p className="hidden text-xs font-bold text-gray-500 sm:block">
              Actualizat: {formatDateTime(data?.updatedAt ?? null)}
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {data?.connections.map((connection) => (
              <article
                key={connection.apartmentSlug}
                className="grid gap-4 rounded-2xl bg-[#FAFAF7] p-4 ring-1 ring-black/5 lg:grid-cols-[1.4fr_1fr_auto] lg:items-center"
              >
                <div>
                  <p className="font-black text-[#071B2D]">
                    {connection.apartmentName}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-gray-500">
                    {connection.envKey}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black ring-1 ${
                      connection.enabled
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-amber-50 text-amber-800 ring-amber-200"
                    }`}
                  >
                    {connection.enabled ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <WifiOff size={13} />
                    )}
                    {connection.enabled ? "Conectat" : "Neconectat"}
                  </span>

                  <a
                    href={`/api/ical/export/${connection.apartmentSlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-black text-[#071B2D] ring-1 ring-black/5"
                  >
                    <ExternalLink size={12} />
                    Export Breeze
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => void sync(connection.apartmentSlug)}
                  disabled={!connection.enabled || Boolean(syncing)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071B2D] px-4 py-3 text-xs font-black text-white disabled:opacity-40"
                >
                  {syncing === connection.apartmentSlug ? (
                    <Loader2 className="animate-spin" size={15} />
                  ) : (
                    <RefreshCw size={15} />
                  )}
                  Sincronizează
                </button>
              </article>
            ))}
          </div>
        </section>

        {(data?.conflicts.length ?? 0) > 0 ? (
          <section className="mt-5 rounded-[1.75rem] bg-red-50 p-5 ring-1 ring-red-200 sm:p-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle size={20} />
              <h2 className="text-xl font-black">
                Conflicte detectate
              </h2>
            </div>
            <div className="mt-4 grid gap-3">
              {data?.conflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className="rounded-2xl bg-white p-4 text-sm ring-1 ring-red-100"
                >
                  <p className="font-black text-red-800">
                    {conflict.apartmentSlug}
                  </p>
                  <p className="mt-1 font-semibold text-gray-600">
                    Booking {conflict.externalStart} → {conflict.externalEnd}
                  </p>
                  <p className="mt-1 font-semibold text-gray-600">
                    {conflict.directReservationCode} • {conflict.directGuestName}
                    {" "}
                    {conflict.directStart} → {conflict.directEnd}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-5 rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#158F91]">
            Jurnal sincronizări
          </p>
          <h2 className="mt-1 text-2xl font-black text-[#071B2D]">
            Ultimele rulări
          </h2>

          <div className="mt-5 grid gap-3">
            {(data?.history.length ?? 0) === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/10 bg-[#FAFAF7] p-5 text-center text-sm font-bold text-gray-500">
                Nu există încă sincronizări salvate.
              </div>
            ) : (
              data?.history.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-2xl bg-[#FAFAF7] p-4 ring-1 ring-black/5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-[#071B2D]">
                        {formatDateTime(entry.completedAt)}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-gray-500">
                        {entry.requestedApartmentSlug
                          ? `Doar ${entry.requestedApartmentSlug}`
                          : "Toate apartamentele"}
                        {" • "}
                        {entry.durationMs} ms
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1.5 text-[10px] font-black ring-1 ${
                        entry.ok
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-amber-50 text-amber-800 ring-amber-200"
                      }`}
                    >
                      {entry.ok ? "Reușit" : "Cu erori"}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-gray-600 sm:grid-cols-4">
                    <span>{entry.totalEvents} evenimente</span>
                    <span>{entry.totalImported} noi</span>
                    <span>{entry.totalRemoved} eliminate</span>
                    <span>{entry.conflictCount} conflicte</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
