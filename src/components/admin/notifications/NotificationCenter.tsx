"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bell, BellRing, CheckCheck, CircleDollarSign, ClipboardCheck, Clock3, ExternalLink, RefreshCw, Settings2, Trash2 } from "lucide-react";
import type { AdminNotification, NotificationSummary, NotificationType } from "@/lib/notifications/types";

type Payload = { notifications: AdminNotification[]; summary: NotificationSummary };
type Filter = "all" | "unread" | NotificationType;

const typeLabel: Record<NotificationType, string> = { reservation: "Rezervări", payment: "Plăți", task: "Taskuri", operation: "Operațional", system: "Sistem" };
const typeIcon = { reservation: BellRing, payment: CircleDollarSign, task: ClipboardCheck, operation: Clock3, system: Settings2 };
const tone = {
  critical: "border-red-200 bg-red-50 text-red-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ro-RO", { timeZone: "Europe/Bucharest", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function NotificationCenter() {
  const [data, setData] = useState<Payload | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState<string>("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const response = await fetch("/api/admin/notifications", { cache: "no-store" });
      if (!response.ok) throw new Error("Notificările nu au putut fi încărcate.");
      setData(await response.json() as Payload); setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Eroare necunoscută."); }
  }

  useEffect(() => { void load(); const id = window.setInterval(() => void load(), 30_000); return () => window.clearInterval(id); }, []);

  async function act(id: string, action: "read" | "unread" | "dismiss") {
    setBusy(id + action);
    try {
      const response = await fetch(`/api/admin/notifications/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      if (!response.ok) throw new Error("Acțiunea nu a putut fi salvată.");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Eroare necunoscută."); } finally { setBusy(""); }
  }

  async function markAllRead() {
    setBusy("all");
    try { const response = await fetch("/api/admin/notifications", { method: "PATCH" }); if (!response.ok) throw new Error("Notificările nu au putut fi marcate."); setData(await response.json() as Payload); }
    catch (e) { setError(e instanceof Error ? e.message : "Eroare necunoscută."); } finally { setBusy(""); }
  }

  const visible = useMemo(() => {
    const items = data?.notifications ?? [];
    if (filter === "all") return items;
    if (filter === "unread") return items.filter(item => !item.readAt);
    return items.filter(item => item.type === filter);
  }, [data, filter]);

  if (!data) return <main className="p-6 lg:p-8"><div className="mx-auto max-w-6xl rounded-[2rem] bg-white p-10 text-center shadow-sm"><RefreshCw className="mx-auto animate-spin text-[#158F91]"/><p className="mt-4 font-black">Se încarcă Notification Center...</p></div></main>;

  return <main className="p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-6xl">
    <section className="rounded-[2rem] bg-[#071B2D] p-6 text-white shadow-[0_24px_70px_rgba(7,27,45,.18)] sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.25em] text-[#D9B56D]"><BellRing size={15}/> Breeze PMS</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">Notification Center</h1><p className="mt-2 text-sm font-semibold text-white/65">Alerte importante din rezervări, plăți, taskuri și operațiuni.</p></div><button onClick={() => void markAllRead()} disabled={busy === "all" || data.summary.unread === 0} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D9B56D] px-5 py-3 text-sm font-black text-[#071B2D] disabled:opacity-50"><CheckCheck size={17}/>Marchează toate citite</button></div>
    </section>

    {error ? <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}

    <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: "Necitite", value: data.summary.unread, icon: Bell, cls: "bg-blue-50 text-blue-700" },
        { label: "Critice", value: data.summary.critical, icon: AlertTriangle, cls: "bg-red-50 text-red-700" },
        { label: "Atenționări", value: data.summary.warnings, icon: Clock3, cls: "bg-amber-50 text-amber-800" },
        { label: "Total active", value: data.summary.total, icon: BellRing, cls: "bg-[#E9F8F8] text-[#158F91]" },
      ].map(card => { const Icon = card.icon; return <div key={card.label} className="rounded-[1.5rem] border border-black/5 bg-white p-5 shadow-sm"><span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.cls}`}><Icon size={20}/></span><p className="mt-4 text-2xl font-black">{card.value}</p><p className="mt-1 text-xs font-black uppercase tracking-[.12em] text-gray-500">{card.label}</p></div>; })}
    </section>

    <section className="mt-5 rounded-[1.8rem] border border-black/5 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.22em] text-[#158F91]">Flux operațional</p><h2 className="mt-1 text-2xl font-black">Alerte active</h2></div><div className="flex flex-wrap gap-2">{(["all","unread","reservation","payment","task","operation"] as Filter[]).map(item => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-xs font-black ${filter === item ? "bg-[#071B2D] text-white" : "bg-[#F4F3EE] text-gray-600"}`}>{item === "all" ? "Toate" : item === "unread" ? "Necitite" : typeLabel[item]}</button>)}<button onClick={() => void load()} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F3EE]" aria-label="Actualizează"><RefreshCw size={15}/></button></div></div>

      <div className="mt-5 grid gap-3">
        {visible.length === 0 ? <div className="rounded-2xl bg-emerald-50 p-8 text-center text-emerald-800"><CheckCheck className="mx-auto"/><p className="mt-2 font-black">Nu există notificări în această categorie.</p></div> : visible.map(item => {
          const Icon = typeIcon[item.type];
          return <article key={item.id} className={`rounded-2xl border p-4 ${item.readAt ? "border-black/5 bg-[#FAFAF7] opacity-75" : tone[item.severity]}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 shadow-sm"><Icon size={20}/></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-black">{item.title}</p>{!item.readAt ? <span className="rounded-full bg-[#071B2D] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white">Nou</span> : null}<span className="text-xs font-bold opacity-65">{formatDate(item.createdAt)}</span></div><p className="mt-2 text-sm font-semibold leading-6">{item.message}</p>{item.reservationCode ? <p className="mt-1 text-xs font-bold opacity-60">Rezervare {item.reservationCode}</p> : null}</div><div className="flex shrink-0 flex-wrap gap-2">{item.href ? <Link href={item.href} onClick={() => { if (!item.readAt) void act(item.sourceKey, "read"); }} className="inline-flex items-center gap-2 rounded-full bg-[#071B2D] px-4 py-2.5 text-xs font-black text-white">Deschide <ExternalLink size={13}/></Link> : null}<button onClick={() => void act(item.sourceKey, item.readAt ? "unread" : "read")} disabled={busy.startsWith(item.sourceKey)} className="rounded-full bg-white px-4 py-2.5 text-xs font-black text-[#071B2D] ring-1 ring-black/10">{item.readAt ? "Marchează necitită" : "Marchează citită"}</button><button title="Ascunde" onClick={() => void act(item.sourceKey, "dismiss")} disabled={busy.startsWith(item.sourceKey)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-600 ring-1 ring-black/10"><Trash2 size={14}/></button></div></div>
          </article>;
        })}
      </div>
    </section>
  </div></main>;
}
