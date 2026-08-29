"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Bot,
  CalendarSearch,
  CheckCircle2,
  CircleHelp,
  Loader2,
  MessageSquareText,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

type DashboardData = {
  generatedAt: string;
  stats: {
    conversationsToday: number;
    activeConversations: number;
    availabilityChecksToday: number;
    bookingStartedToday: number;
    bookingCompletedToday: number;
    unknownQuestionsToday: number;
  };
  topEvents: Array<{ type: string; total: number }>;
  recent: Array<{
    id: string;
    type: string;
    timestamp: string;
    channel: string;
    label: string | null;
  }>;
  unknown: Array<{
    id: string;
    question: string;
    timestamp: string;
    channel: string;
  }>;
};

type LearnedAnswer = {
  id: string;
  question: string;
  answer: string;
  aliases: string[];
  approved: boolean;
  createdAt: string;
  updatedAt: string;
};

const labels: Record<string, string> = {
  ConversationStarted: "Conversație începută",
  ConversationEnded: "Conversație încheiată",
  AvailabilityChecked: "Disponibilitate verificată",
  BookingStarted: "Rezervare începută",
  BookingCompleted: "Rezervare finalizată",
  UnknownQuestion: "Întrebare fără răspuns",
  LocalGuideRequested: "Ghid local solicitat",
  WeatherRequested: "Vreme verificată",
  SupportRequested: "Suport solicitat",
  PaymentRequested: "Plată solicitată",
  PaymentCompleted: "Plată finalizată",
  TransferRequested: "Transfer solicitat",
  LateCheckoutRequested: "Late check-out solicitat",
  EarlyCheckinRequested: "Early check-in solicitat",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Bucharest",
  }).format(new Date(value));
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof Bot;
}) {
  return (
    <article className="rounded-[1.6rem] border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E9F8F8] text-[#158F91]">
          <Icon size={20} />
        </span>
        <span className="rounded-full bg-[#F4F3EE] px-2.5 py-1 text-[9px] font-black uppercase tracking-[.12em] text-gray-400">
          azi
        </span>
      </div>
      <p className="mt-4 text-3xl font-black text-[#071B2D]">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[.14em] text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-xs font-semibold leading-5 text-gray-500">{detail}</p>
    </article>
  );
}

export default function AiOwnerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [learned, setLearned] = useState<LearnedAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const [dashboardResponse, learningResponse] = await Promise.all([
        fetch("/api/admin/ai-dashboard", { cache: "no-store" }),
        fetch("/api/admin/ai-learning", { cache: "no-store" }),
      ]);
      if (!dashboardResponse.ok || !learningResponse.ok) {
        throw new Error("Dashboard-ul AI nu a putut fi încărcat.");
      }
      const dashboard = (await dashboardResponse.json()) as DashboardData;
      const learning = (await learningResponse.json()) as { items: LearnedAnswer[] };
      setData(dashboard);
      setLearned(learning.items);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Dashboard-ul AI nu a putut fi încărcat."
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

  async function saveLearnedAnswer() {
    if (!question.trim() || !answer.trim()) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/ai-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
      });
      const payload = (await response.json()) as {
        item?: LearnedAnswer;
        error?: string;
      };
      if (!response.ok || !payload.item) {
        throw new Error(payload.error ?? "Răspunsul nu a putut fi salvat.");
      }
      setLearned((current) => [payload.item!, ...current]);
      setQuestion("");
      setAnswer("");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Răspunsul nu a putut fi salvat.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleApproved(item: LearnedAnswer) {
    const response = await fetch("/api/admin/ai-learning", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, approved: !item.approved }),
    });
    if (response.ok) {
      setLearned((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, approved: !entry.approved } : entry
        )
      );
    }
  }

  async function removeLearnedAnswer(id: string) {
    if (!window.confirm("Ștergi acest răspuns învățat?")) return;
    const response = await fetch(`/api/admin/ai-learning?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setLearned((current) => current.filter((item) => item.id !== id));
    }
  }

  const normalizedLearnedQuestions = new Set(
    learned.map((item) => item.question.trim().toLocaleLowerCase("ro-RO"))
  );
  const unresolvedQuestions =
    data?.unknown.filter(
      (item) =>
        !normalizedLearnedQuestions.has(
          item.question.trim().toLocaleLowerCase("ro-RO")
        )
    ) ?? [];

  if (loading && !data) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 font-black shadow-sm ring-1 ring-black/5">
          <Loader2 className="animate-spin" size={20} /> Se încarcă activitatea AI...
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-[1700px]">
        <header className="rounded-[2rem] bg-[#071B2D] p-6 text-white shadow-[0_24px_70px_rgba(7,27,45,.18)] sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.24em] text-[#D9B56D]">
                <Sparkles size={15} /> Owner Intelligence
              </p>
              <h1 className="mt-3 text-3xl font-black sm:text-4xl">AI Owner Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/65">
                Vezi activitatea recepționerului și aprobă răspunsuri noi fără modificări de cod.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void load()}
              className="flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-xs font-black ring-1 ring-white/15 hover:bg-white/15"
            >
              <RefreshCw size={15} /> Actualizează
            </button>
          </div>
          {data ? (
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold text-white/65">
              <span className="rounded-full bg-white/8 px-3 py-2 ring-1 ring-white/10">
                Conversații active: <strong className="text-white">{data.stats.activeConversations}</strong>
              </span>
              <span className="rounded-full bg-white/8 px-3 py-2 ring-1 ring-white/10">
                Răspunsuri învățate: <strong className="text-white">{learned.filter((item) => item.approved).length}</strong>
              </span>
            </div>
          ) : null}
        </header>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        ) : null}

        {data ? (
          <>
            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <StatCard label="Conversații" value={data.stats.conversationsToday} detail="Discuții AI pornite astăzi" icon={MessageSquareText} />
              <StatCard label="Active acum" value={data.stats.activeConversations} detail="Conversații fără eveniment de încheiere" icon={Activity} />
              <StatCard label="Disponibilitate" value={data.stats.availabilityChecksToday} detail="Verificări live efectuate" icon={CalendarSearch} />
              <StatCard label="Rezervări începute" value={data.stats.bookingStartedToday} detail="Intenții de rezervare detectate" icon={Bot} />
              <StatCard label="Rezervări finalizate" value={data.stats.bookingCompletedToday} detail="Conversii înregistrate" icon={Sparkles} />
              <StatCard label="Fără răspuns" value={data.stats.unknownQuestionsToday} detail="Întrebări de revizuit" icon={CircleHelp} />
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
              <article className="rounded-[1.8rem] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-black text-[#071B2D]">Top activități AI</h2>
                <p className="mt-1 text-sm font-semibold text-gray-500">Evenimente cumulate de la activarea analytics.</p>
                <div className="mt-5 grid gap-3">
                  {data.topEvents.length ? (
                    data.topEvents.map((item, index) => (
                      <div key={item.type} className="flex items-center gap-4 rounded-2xl bg-[#F8F7F2] p-4">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-xs font-black text-[#158F91] ring-1 ring-black/5">{index + 1}</span>
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-[#071B2D]">{labels[item.type] ?? item.type}</p></div>
                        <strong className="text-lg text-[#071B2D]">{item.total}</strong>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-[#F8F7F2] p-5 text-sm font-semibold text-gray-500">Nu există încă evenimente.</p>
                  )}
                </div>
              </article>

              <article className="rounded-[1.8rem] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-black text-[#071B2D]">Activitate recentă</h2>
                <p className="mt-1 text-sm font-semibold text-gray-500">Ultimele acțiuni înregistrate de recepționer.</p>
                <div className="mt-5 max-h-[520px] space-y-3 overflow-y-auto pr-1">
                  {data.recent.length ? (
                    data.recent.map((item) => (
                      <div key={item.id} className="flex gap-4 rounded-2xl border border-black/5 p-4">
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#158F91]" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-[#071B2D]">{labels[item.type] ?? item.type}</p>
                          {item.label ? <p className="mt-1 truncate text-xs font-semibold text-gray-500">{item.label}</p> : null}
                          <p className="mt-1 text-[10px] font-black uppercase tracking-[.1em] text-gray-400">{item.channel} • {formatDate(item.timestamp)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-[#F8F7F2] p-5 text-sm font-semibold text-gray-500">Activitatea va apărea aici automat.</p>
                  )}
                </div>
              </article>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
              <article className="rounded-[1.8rem] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><CircleHelp size={20} /></span>
                  <div>
                    <h2 className="text-xl font-black text-[#071B2D]">Întrebări fără răspuns</h2>
                    <p className="text-sm font-semibold text-gray-500">Apasă pe o întrebare pentru a completa răspunsul.</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3">
                  {unresolvedQuestions.length ? (
                    unresolvedQuestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setQuestion(item.question)}
                        className="rounded-2xl bg-amber-50/70 p-4 text-left ring-1 ring-amber-100 transition hover:bg-amber-100/70"
                      >
                        <p className="text-sm font-black text-[#071B2D]">{item.question}</p>
                        <p className="mt-2 text-[10px] font-black uppercase tracking-[.1em] text-amber-700/70">{item.channel} • {formatDate(item.timestamp)}</p>
                      </button>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-[#F8F7F2] p-5 text-sm font-semibold text-gray-500">Nu există întrebări necunoscute înregistrate.</p>
                  )}
                </div>
              </article>

              <article className="rounded-[1.8rem] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#158F91]">AI Learning Center</p>
                    <h2 className="mt-1 text-xl font-black text-[#071B2D]">Adaugă un răspuns aprobat</h2>
                  </div>
                  {question || answer ? (
                    <button type="button" onClick={() => { setQuestion(""); setAnswer(""); }} className="rounded-full p-2 text-gray-400 hover:bg-gray-100"><X size={18} /></button>
                  ) : null}
                </div>
                <div className="mt-5 grid gap-4">
                  <label className="grid gap-2 text-xs font-black uppercase tracking-[.1em] text-gray-500">
                    Întrebarea clientului
                    <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ex.: Aveți încărcător pentru mașini electrice?" className="rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold normal-case tracking-normal text-[#071B2D] outline-none focus:border-[#158F91]" />
                  </label>
                  <label className="grid gap-2 text-xs font-black uppercase tracking-[.1em] text-gray-500">
                    Răspunsul oficial
                    <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} rows={5} placeholder="Scrie răspunsul exact pe care AI-ul trebuie să îl folosească." className="resize-none rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold normal-case tracking-normal text-[#071B2D] outline-none focus:border-[#158F91]" />
                  </label>
                  <button type="button" disabled={saving || !question.trim() || !answer.trim()} onClick={() => void saveLearnedAnswer()} className="flex items-center justify-center gap-2 rounded-2xl bg-[#158F91] px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">
                    {saving ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />} Salvează și activează
                  </button>
                </div>
              </article>
            </section>

            <section className="mt-6 rounded-[1.8rem] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#158F91]">Knowledge Improvement</p>
                  <h2 className="mt-1 text-xl font-black text-[#071B2D]">Răspunsuri învățate</h2>
                  <p className="mt-1 text-sm font-semibold text-gray-500">Răspunsurile active sunt folosite imediat în conversațiile noi.</p>
                </div>
                <span className="flex items-center gap-2 rounded-full bg-[#E9F8F8] px-3 py-2 text-xs font-black text-[#158F91]"><CheckCircle2 size={15} /> {learned.filter((item) => item.approved).length} active</span>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {learned.length ? (
                  learned.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-black/5 bg-[#F8F7F2] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-[#071B2D]">{item.question}</p>
                          <p className="mt-2 text-sm font-semibold leading-6 text-gray-600">{item.answer}</p>
                        </div>
                        <button type="button" onClick={() => void removeLearnedAnswer(item.id)} className="shrink-0 rounded-xl p-2 text-red-500 hover:bg-red-50" title="Șterge"><Trash2 size={17} /></button>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-black/5 pt-3">
                        <button type="button" onClick={() => void toggleApproved(item)} className={`flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] ${item.approved ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"}`}>
                          {item.approved ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                          {item.approved ? "Activ" : "Dezactivat"}
                        </button>
                        <span className="text-[10px] font-black uppercase tracking-[.08em] text-gray-400">Actualizat {formatDate(item.updatedAt)}</span>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="rounded-2xl bg-[#F8F7F2] p-5 text-sm font-semibold text-gray-500 lg:col-span-2">Nu ai adăugat încă răspunsuri. Folosește formularul de mai sus.</p>
                )}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
