"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Sparkles,
  Wrench,
} from "lucide-react";
import {
  publishAdminLiveEvent,
  subscribeAdminLiveEvents,
} from "@/lib/admin/admin-live-events";

type CleaningStatus =
  | "scheduled"
  | "in_progress"
  | "ready";

type Task = {
  code: string;
  guestName: string;
  phone: string;
  apartmentTitles: string[];
  checkOut: string;
  cleaningStatus: CleaningStatus;
  internalNotes: string[];
  maintenanceRequired: boolean;
  maintenanceNote: string;
  updatedAt: string;
};

type ResponseData = {
  generatedAt: string;
  selectedDate: string;
  tasks: Task[];
  stats: {
    pending: number;
    inProgress: number;
    ready: number;
    maintenance: number;
  };
};

const columns: Array<{
  status: CleaningStatus;
  title: string;
  subtitle: string;
}> = [
  {
    status: "scheduled",
    title: "De curățat",
    subtitle: "Așteaptă începerea",
  },
  {
    status: "in_progress",
    title: "În curs",
    subtitle: "Curățenie începută",
  },
  {
    status: "ready",
    title: "Gata",
    subtitle: "Pregătit pentru check-in",
  },
];

export default function HousekeepingLite() {
  const [data, setData] = useState<ResponseData | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingCode, setSavingCode] = useState("");
  const [error, setError] = useState("");
  const [noteCode, setNoteCode] = useState("");
  const [note, setNote] = useState("");

  async function load(date = selectedDate) {
    setError("");

    try {
      const query = date
        ? `?date=${encodeURIComponent(date)}`
        : "";
      const response = await fetch(
        `/api/admin/housekeeping${query}`,
        { cache: "no-store" }
      );
      const payload = (await response.json()) as
        | ResponseData
        | { message?: string };

      if (!response.ok || !("tasks" in payload)) {
        throw new Error(
          "message" in payload && payload.message
            ? payload.message
            : "Lista de curățenie nu a putut fi încărcată."
        );
      }

      setData(payload);
      if (!selectedDate) setSelectedDate(payload.selectedDate);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Lista de curățenie nu a putut fi încărcată."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const timer = window.setInterval(
      () => void load(),
      30_000
    );
    const unsubscribe = subscribeAdminLiveEvents(
      () => void load()
    );

    return () => {
      window.clearInterval(timer);
      unsubscribe();
    };
  }, []);

  async function update(
    task: Task,
    patch: {
      cleaningStatus?: CleaningStatus;
      internalNote?: string;
      maintenanceRequired?: boolean;
      maintenanceNote?: string;
    }
  ) {
    setSavingCode(task.code);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/operations/${encodeURIComponent(
          task.code
        )}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        }
      );
      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.message ??
            "Statusul nu a putut fi actualizat."
        );
      }

      publishAdminLiveEvent({
        entity: "operation",
        code: task.code,
        action: "housekeeping_updated",
      });

      setNoteCode("");
      setNote("");
      await load();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Statusul nu a putut fi actualizat."
      );
    } finally {
      setSavingCode("");
    }
  }

  const grouped = useMemo(() => {
    const source = data?.tasks ?? [];
    return Object.fromEntries(
      columns.map((column) => [
        column.status,
        source.filter(
          (task) => task.cleaningStatus === column.status
        ),
      ])
    ) as Record<CleaningStatus, Task[]>;
  }, [data]);

  if (loading && !data) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 font-black text-[#071B2D] shadow-sm ring-1 ring-black/5">
          <Loader2 className="animate-spin" size={20} />
          Se încarcă Housekeeping...
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-[1700px]">
        <header className="rounded-[2rem] bg-[#071B2D] p-5 text-white shadow-xl sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D9B56D]">
                Breeze PMS • Housekeeping Lite
              </p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                Curățenie
              </h1>
              <p className="mt-2 text-sm font-semibold text-white/65">
                De curățat, în curs și gata. Fără pași inutili.
              </p>
            </div>

            <div className="flex items-end gap-3">
              <label className="grid gap-1">
                <span className="text-[9px] font-black uppercase tracking-[0.14em] text-white/45">
                  Ziua
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSelectedDate(value);
                    setLoading(true);
                    void load(value);
                  }}
                  className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white outline-none"
                />
              </label>

              <button
                type="button"
                onClick={() => void load()}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white hover:text-[#071B2D]"
                aria-label="Actualizează"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {data ? (
            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                ["De curățat", data.stats.pending],
                ["În curs", data.stats.inProgress],
                ["Gata", data.stats.ready],
                ["Mentenanță", data.stats.maintenance],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10"
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/50">
                    {label}
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </header>

        {error ? (
          <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-black text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-5 grid gap-5 xl:grid-cols-3">
          {columns.map((column) => {
            const tasks = grouped[column.status] ?? [];

            return (
              <section
                key={column.status}
                className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-black/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#158F91]">
                      {column.subtitle}
                    </p>
                    <h2 className="mt-1 text-xl font-black text-[#071B2D]">
                      {column.title}
                    </h2>
                  </div>
                  <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-[#071B2D] px-3 text-sm font-black text-white">
                    {tasks.length}
                  </span>
                </div>

                <div className="mt-4 grid gap-3">
                  {tasks.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-black/10 bg-[#FAFAF7] p-6 text-center text-sm font-bold text-gray-500">
                      Niciun apartament aici.
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <article
                        key={task.code}
                        className="rounded-2xl bg-[#FAFAF7] p-4 ring-1 ring-black/5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-black text-[#071B2D]">
                              {task.apartmentTitles.join(" • ")}
                            </p>
                            <p className="mt-1 text-xs font-bold text-gray-500">
                              După {task.guestName} • {task.code}
                            </p>
                          </div>

                          {task.maintenanceRequired ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[9px] font-black text-orange-800 ring-1 ring-orange-200">
                              <Wrench size={11} />
                              Mentenanță
                            </span>
                          ) : null}
                        </div>

                        {task.maintenanceNote ? (
                          <p className="mt-3 rounded-xl bg-orange-50 p-3 text-xs font-bold leading-5 text-orange-800 ring-1 ring-orange-200">
                            {task.maintenanceNote}
                          </p>
                        ) : null}

                        {task.internalNotes.length > 0 ? (
                          <p className="mt-3 line-clamp-2 text-xs font-semibold leading-5 text-gray-500">
                            Ultima notă: {task.internalNotes.at(-1)}
                          </p>
                        ) : null}

                        {noteCode === task.code ? (
                          <div className="mt-3 grid gap-2">
                            <textarea
                              value={note}
                              onChange={(event) =>
                                setNote(event.target.value)
                              }
                              placeholder="Ex.: lipsește telecomanda sau trebuie schimbat becul"
                              className="min-h-20 rounded-xl border border-black/10 bg-white p-3 text-sm font-semibold outline-none focus:border-[#158F91]"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setNoteCode("");
                                  setNote("");
                                }}
                                className="rounded-xl bg-white px-3 py-2.5 text-xs font-black ring-1 ring-black/5"
                              >
                                Renunță
                              </button>
                              <button
                                type="button"
                                disabled={!note.trim() || savingCode === task.code}
                                onClick={() =>
                                  void update(task, {
                                    internalNote: note,
                                  })
                                }
                                className="rounded-xl bg-[#D9B56D] px-3 py-2.5 text-xs font-black text-[#071B2D] disabled:opacity-50"
                              >
                                Salvează nota
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {task.cleaningStatus === "scheduled" ? (
                              <button
                                type="button"
                                disabled={savingCode === task.code}
                                onClick={() =>
                                  void update(task, {
                                    cleaningStatus: "in_progress",
                                  })
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-3 py-3 text-xs font-black text-amber-800 ring-1 ring-amber-200 disabled:opacity-50"
                              >
                                <Clock3 size={14} />
                                Începe
                              </button>
                            ) : null}

                            {task.cleaningStatus === "in_progress" ? (
                              <button
                                type="button"
                                disabled={savingCode === task.code}
                                onClick={() =>
                                  void update(task, {
                                    cleaningStatus: "ready",
                                  })
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-3 text-xs font-black text-emerald-700 ring-1 ring-emerald-200 disabled:opacity-50"
                              >
                                <Sparkles size={14} />
                                Finalizează
                              </button>
                            ) : null}

                            {task.cleaningStatus === "ready" ? (
                              <div className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-3 text-xs font-black text-emerald-700 ring-1 ring-emerald-200">
                                <CheckCircle2 size={14} />
                                Apartament gata
                              </div>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => {
                                setNoteCode(task.code);
                                setNote("");
                              }}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-xs font-black text-[#071B2D] ring-1 ring-black/5"
                            >
                              <MessageSquareText size={14} />
                              Notă
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          disabled={savingCode === task.code}
                          onClick={() => {
                            const next = !task.maintenanceRequired;
                            const maintenanceNote = next
                              ? window.prompt(
                                  "Ce necesită intervenție?",
                                  task.maintenanceNote
                                ) ?? task.maintenanceNote
                              : "";

                            void update(task, {
                              maintenanceRequired: next,
                              maintenanceNote,
                            });
                          }}
                          className={`mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black ring-1 disabled:opacity-50 ${
                            task.maintenanceRequired
                              ? "bg-orange-50 text-orange-800 ring-orange-200"
                              : "bg-white text-gray-600 ring-black/5"
                          }`}
                        >
                          {task.maintenanceRequired ? (
                            <>
                              <CheckCircle2 size={14} />
                              Marchează intervenția rezolvată
                            </>
                          ) : (
                            <>
                              <AlertTriangle size={14} />
                              Necesită mentenanță
                            </>
                          )}
                        </button>

                        {savingCode === task.code ? (
                          <div className="mt-3 flex items-center justify-center gap-2 text-xs font-black text-[#158F91]">
                            <Loader2 className="animate-spin" size={14} />
                            Se salvează...
                          </div>
                        ) : null}
                      </article>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
