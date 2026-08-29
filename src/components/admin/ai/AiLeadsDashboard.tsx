"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Flame,
  Loader2,
  MessageCircle,
  Search,
  Users,
} from "lucide-react";

import type {
  AiLeadRecord,
  AiLeadStatus,
  AiLeadSummary,
} from "@/lib/ai/leads/types";

type Payload = {
  ok: boolean;
  leads: AiLeadRecord[];
  summary: AiLeadSummary;
  message?: string;
};

type Filter = "all" | AiLeadStatus | "high_intent";

const statusLabels: Record<AiLeadStatus, string> = {
  new: "Nou",
  qualified: "Calificat",
  contacted: "Contactat",
  converted: "Convertit",
  dismissed: "Închis",
};

const statusClasses: Record<AiLeadStatus, string> = {
  new: "bg-sky-50 text-sky-700",
  qualified: "bg-amber-50 text-amber-800",
  contacted: "bg-violet-50 text-violet-700",
  converted: "bg-emerald-50 text-emerald-700",
  dismissed: "bg-slate-100 text-slate-600",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function money(value: number) {
  return new Intl.NumberFormat("ro-RO").format(value);
}

function intentLabel(score: number) {
  if (score >= 80) {
    return {
      text: "Foarte probabil să rezerve",
      className: "bg-emerald-50 text-emerald-700",
    };
  }

  if (score >= 60) {
    return {
      text: "Interes mediu",
      className: "bg-amber-50 text-amber-800",
    };
  }

  return {
    text: "În faza de informare",
    className: "bg-slate-100 text-slate-600",
  };
}

export default function AiLeadsDashboard() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/admin/ai-leads", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as Payload;

        if (!response.ok || !data.ok) {
          throw new Error(data.message || "Lead-uri indisponibile");
        }

        return data;
      })
      .then((data) => {
        if (active) setPayload(data);
      })
      .catch((reason) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Lead-uri indisponibile"
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const leads = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("ro-RO");

    return (payload?.leads ?? []).filter((lead) => {
      const matchesFilter =
        filter === "all" ||
        filter === lead.status ||
        (filter === "high_intent" && lead.sales.leadScore >= 70);

      const haystack = [
        lead.firstUserMessage,
        lead.lastUserMessage,
        lead.sales.intent,
        lead.sales.profile,
        lead.sales.preferredApartment,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("ro-RO");

      return matchesFilter && (!term || haystack.includes(term));
    });
  }, [filter, payload, query]);

  async function updateStatus(id: string, status: AiLeadStatus) {
    setBusy(`${id}:${status}`);

    try {
      const response = await fetch(`/api/admin/ai-leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        lead?: AiLeadRecord;
        message?: string;
      };

      if (!response.ok || !data.ok || !data.lead) {
        throw new Error(
          data.message || "Statusul nu a putut fi actualizat"
        );
      }

      setPayload((current) =>
        current
          ? {
              ...current,
              leads: current.leads.map((lead) =>
                lead.id === id ? data.lead! : lead
              ),
              summary: {
                ...current.summary,
                new: current.leads.filter(
                  (lead) =>
                    (lead.id === id ? status : lead.status) === "new"
                ).length,
                qualified: current.leads.filter(
                  (lead) =>
                    (lead.id === id ? status : lead.status) ===
                    "qualified"
                ).length,
                contacted: current.leads.filter(
                  (lead) =>
                    (lead.id === id ? status : lead.status) ===
                    "contacted"
                ).length,
                converted: current.leads.filter(
                  (lead) =>
                    (lead.id === id ? status : lead.status) ===
                    "converted"
                ).length,
                dismissed: current.leads.filter(
                  (lead) =>
                    (lead.id === id ? status : lead.status) ===
                    "dismissed"
                ).length,
              },
            }
          : current
      );
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Actualizare eșuată"
      );
    } finally {
      setBusy("");
    }
  }

  if (loading) {
    return (
      <main className="p-6 lg:p-10">
        <div className="flex min-h-[60vh] items-center justify-center gap-3 text-sm font-black text-[#071B2D]">
          <Loader2 className="animate-spin" /> Se încarcă lead-urile AI...
        </div>
      </main>
    );
  }

  if (error || !payload) {
    return (
      <main className="p-6 lg:p-10">
        <div className="rounded-3xl bg-red-50 p-6 font-bold text-red-800">
          {error || "Lead-urile AI nu sunt disponibile"}
        </div>
      </main>
    );
  }

  const cards = [
    ["Conversații", payload.summary.total, MessageCircle],
    ["Lead-uri noi", payload.summary.new, Bot],
    ["Calificate", payload.summary.qualified, Flame],
    ["Interes ridicat", payload.summary.highIntent, Users],
    ["Convertite", payload.summary.converted, CheckCircle2],
  ] as const;

  const filters: Array<{ id: Filter; label: string }> = [
    { id: "all", label: "Toate" },
    { id: "new", label: "Noi" },
    { id: "qualified", label: "Calificate" },
    { id: "contacted", label: "Contactate" },
    { id: "converted", label: "Convertite" },
    { id: "dismissed", label: "Închise" },
    { id: "high_intent", label: "Interes ridicat" },
  ];

  return (
    <main className="p-4 sm:p-6 lg:p-10">
      <section className="overflow-hidden rounded-[2rem] bg-[#071B2D] p-7 text-white shadow-[0_28px_80px_rgba(7,27,45,.18)] lg:p-10">
        <p className="text-[11px] font-black uppercase tracking-[.3em] text-[#D9B56D]">
          AI Sales CRM
        </p>

        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black sm:text-5xl">
              Lead-uri AI
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/65">
              Conversații persistente, intenție de rezervare, perioade
              căutate și variante recomandate de Recepția Breeze.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#D9B56D]">
              Conversii
            </p>
            <p className="mt-1 text-2xl font-black">
              {payload.summary.converted} / {payload.summary.total}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value, Icon]) => (
          <article
            key={label}
            className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E9F8F8] text-[#158F91]">
              <Icon size={19} />
            </div>

            <p className="mt-4 text-[10px] font-black uppercase tracking-[.18em] text-gray-500">
              {label}
            </p>
            <p className="mt-1 text-2xl font-black text-[#071B2D]">
              {value}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <label className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-[#F4F3EE] px-4 py-3 xl:max-w-xl">
            <Search size={18} className="text-[#158F91]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Caută în conversații..."
              className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`rounded-full px-4 py-2 text-xs font-black transition ${
                  filter === item.id
                    ? "bg-[#071B2D] text-white"
                    : "bg-[#F4F3EE] text-gray-600 hover:bg-[#E9F8F8]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4">
        {leads.map((lead) => {
          const recommendation =
            lead.availability?.recommendations[0];
          const isExpanded = expanded === lead.id;
          const probability = intentLabel(lead.sales.leadScore);

          return (
            <article
              key={lead.id}
              className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-black/5"
            >
              <div className="p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] ${statusClasses[lead.status]}`}
                      >
                        {statusLabels[lead.status]}
                      </span>

                      <span className="rounded-full bg-[#071B2D] px-3 py-1 text-[10px] font-black text-[#D9B56D]">
                        Scor {lead.sales.leadScore}/100
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black ${probability.className}`}
                      >
                        {probability.text}
                      </span>

                      <span className="text-xs font-bold text-gray-400">
                        {formatDate(lead.updatedAt)}
                      </span>
                    </div>

                    <h2 className="mt-4 text-xl font-black text-[#071B2D]">
                      {lead.lastUserMessage ||
                        "Conversație fără mesaj"}
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-gray-600">
                      <span className="rounded-full bg-[#F4F3EE] px-3 py-1.5">
                        {lead.sales.profile}
                      </span>
                      <span className="rounded-full bg-[#F4F3EE] px-3 py-1.5">
                        {lead.sales.intent}
                      </span>
                      <span className="rounded-full bg-[#F4F3EE] px-3 py-1.5">
                        {lead.sales.stage}
                      </span>
                      <span className="rounded-full bg-[#F4F3EE] px-3 py-1.5">
                        {lead.messageCount} mesaje
                      </span>
                    </div>

                    {(lead.sales.checkIn || recommendation) && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {lead.sales.checkIn &&
                          lead.sales.checkOut && (
                            <div className="rounded-2xl bg-[#F8F7F3] p-4">
                              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-gray-500">
                                <CalendarDays size={14} /> Perioadă
                              </p>
                              <p className="mt-2 text-sm font-black text-[#071B2D]">
                                {lead.sales.checkIn} →{" "}
                                {lead.sales.checkOut}
                              </p>
                            </div>
                          )}

                        {recommendation && (
                          <>
                            <div className="rounded-2xl bg-[#F8F7F3] p-4">
                              <p className="text-[10px] font-black uppercase tracking-[.14em] text-gray-500">
                                Recomandare
                              </p>
                              <p className="mt-2 text-sm font-black text-[#071B2D]">
                                {recommendation.apartments
                                  .map(
                                    (apartment) =>
                                      apartment.shortTitle
                                  )
                                  .join(" + ")}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-[#F8F7F3] p-4">
                              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-gray-500">
                                <CircleDollarSign size={14} /> Total
                              </p>
                              <p className="mt-2 text-sm font-black text-[#0F6466]">
                                {money(
                                  recommendation.totalPrice
                                )}{" "}
                                lei
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 xl:max-w-xs xl:justify-end">
                    {(
                      [
                        "new",
                        "qualified",
                        "contacted",
                        "converted",
                        "dismissed",
                      ] as AiLeadStatus[]
                    ).map((status) => (
                      <button
                        key={status}
                        type="button"
                        disabled={
                          busy === `${lead.id}:${status}`
                        }
                        onClick={() =>
                          void updateStatus(lead.id, status)
                        }
                        className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] transition disabled:opacity-50 ${
                          lead.status === status
                            ? "bg-[#071B2D] text-white"
                            : "bg-[#F4F3EE] text-gray-600 hover:bg-[#E9F8F8]"
                        }`}
                      >
                        {statusLabels[status]}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setExpanded(isExpanded ? null : lead.id)
                  }
                  className="mt-5 inline-flex items-center gap-2 text-xs font-black text-[#0F6466]"
                >
                  {isExpanded ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  {isExpanded
                    ? "Închide conversația"
                    : "Vezi conversația"}
                </button>
              </div>

              {isExpanded && (
                <div className="border-t border-black/5 bg-[#F8F7F3] p-5">
                  <div className="mx-auto max-w-3xl space-y-3">
                    {lead.messages.map((message, index) => (
                      <div
                        key={`${lead.id}:${index}`}
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div className="max-w-[88%]">
                          <p
                            className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                              message.role === "user"
                                ? "rounded-br-md bg-[#0F4C81] text-white"
                                : "rounded-bl-md bg-white text-[#243442] ring-1 ring-black/5"
                            }`}
                          >
                            {message.content}
                          </p>
                          <p
                            className={`mt-1 text-[10px] font-bold text-gray-400 ${
                              message.role === "user"
                                ? "text-right"
                                : "text-left"
                            }`}
                          >
                            {formatMessageTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>

      {leads.length === 0 && (
        <div className="mt-6 rounded-[2rem] bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
          <Bot className="mx-auto text-gray-300" size={42} />
          <p className="mt-4 text-lg font-black text-[#071B2D]">
            Nu există conversații în acest filtru
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Primele lead-uri vor apărea după conversațiile din chatbot.
          </p>
        </div>
      )}
    </main>
  );
}
