"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { subscribeAdminLiveEvents } from "@/lib/admin/admin-live-events";
import {
  AlertTriangle,
  ArrowRight,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FolderOpen,
  LogIn,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";

type Summary = {
  code: string;
  guestName: string;
  apartmentTitles: string[];
  checkIn: string;
  health: { level: "ok" | "attention" | "critical"; label: string; reasons: string[] };
  nextAction: { label: string; code: string; priority: string };
};

type DashboardData = {
  generatedAt: string;
  stats: { checkIns: number; checkOuts: number; newReservations: number; unpaid: number; outstanding: number; active: number };
  priorities: Summary[];
  tasks: Summary[];
  apartmentStatus: { slug: string; title: string; status: string; label: string; reservationCode: string | null }[];
  recent: { code: string; guestName: string; action: string; at: string; paymentStatus: string }[];
};

function money(value: number) { return new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 0 }).format(value); }
function time(value: string) { return new Intl.DateTimeFormat("ro-RO", { timeZone: "Europe/Bucharest", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }
function greeting(value: string) {
  const hour = Number(
    new Intl.DateTimeFormat("ro-RO", {
      timeZone: "Europe/Bucharest",
      hour: "2-digit",
      hour12: false,
    }).format(new Date(value))
  );
  return hour < 12 ? "Bună dimineața" : hour < 18 ? "Bună ziua" : "Bună seara";
}

const statusTone: Record<string, string> = {
  free: "bg-emerald-50 text-emerald-700 border-emerald-100",
  occupied: "bg-[#E9F8F8] text-[#0F696A] border-[#158F91]/20",
  check_in: "bg-blue-50 text-blue-700 border-blue-100",
  check_out: "bg-amber-50 text-amber-800 border-amber-100",
};

export default function DashboardPro() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
      if (!response.ok) throw new Error("Dashboard-ul nu a putut fi actualizat.");
      setData((await response.json()) as DashboardData);
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Eroare necunoscută."); }
  }

  useEffect(() => {
    void load();

    const intervalId = window.setInterval(
      () => void load(),
      30_000
    );

    const unsubscribe = subscribeAdminLiveEvents(
      () => void load()
    );

    const refreshOnFocus = () => void load();
    const refreshOnVisibility = () => {
      if (document.visibilityState === "visible") {
        void load();
      }
    };

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener(
      "visibilitychange",
      refreshOnVisibility
    );

    return () => {
      window.clearInterval(intervalId);
      unsubscribe();
      window.removeEventListener(
        "focus",
        refreshOnFocus
      );
      document.removeEventListener(
        "visibilitychange",
        refreshOnVisibility
      );
    };
  }, []);

  if (!data) return <main className="p-6 lg:p-8"><div className="mx-auto max-w-7xl rounded-[2rem] bg-white p-10 text-center shadow-sm"><RefreshCw className="mx-auto animate-spin text-[#158F91]" /><p className="mt-4 font-black">Se încarcă centrul operațional...</p></div></main>;

  const urgent = data.priorities.filter((item) => item.health.level === "critical");
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <section className="rounded-[2rem] bg-[#071B2D] p-6 text-white shadow-[0_24px_70px_rgba(7,27,45,.18)] sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#D9B56D]"><Sparkles size={15} /> Breeze PMS • Mission Control</p>
              <h1 className="mt-3 text-3xl font-black sm:text-4xl">{greeting(data.generatedAt)}, Dragoș!</h1>
              <p className="mt-2 text-sm font-semibold text-white/65">Datele se actualizează automat la fiecare 30 de secunde.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex">
              <Link href="/#rezervare" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D9B56D] px-5 py-3 text-sm font-black text-[#071B2D]"><Plus size={17}/>Rezervare nouă</Link>
              <Link href="/admin/reservations" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-black"><Search size={17}/>Caută</Link>
              <Link href="/admin/calendar" className="col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-black"><CalendarDays size={17}/>Calendar</Link>
            </div>
          </div>
        </section>

        {error ? <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}

        {urgent.length > 0 ? (
          <section className="mt-5 rounded-[1.7rem] border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700"><AlertTriangle size={21}/></span><div className="flex-1"><p className="text-xs font-black uppercase tracking-[.18em] text-red-700">Prioritate imediată</p><p className="mt-1 font-black text-red-950">{urgent[0].nextAction.label} • {urgent[0].code} • {urgent[0].guestName}</p></div><Link href={`/admin/reservations/${urgent[0].code}`} className="hidden rounded-full bg-red-700 px-5 py-2.5 text-xs font-black text-white sm:inline-flex">Deschide</Link></div>
          </section>
        ) : null}

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {[
            { label: "Check-in azi", value: data.stats.checkIns, icon: LogIn, tone: "bg-blue-50 text-blue-700" },
            { label: "Check-out azi", value: data.stats.checkOuts, icon: LogOut, tone: "bg-slate-100 text-slate-700" },
            { label: "Rezervări noi", value: data.stats.newReservations, icon: FolderOpen, tone: "bg-[#E9F8F8] text-[#158F91]" },
            { label: "Plăți restante", value: data.stats.unpaid, icon: CreditCard, tone: "bg-amber-50 text-amber-800" },
            { label: "Sold restant", value: `${money(data.stats.outstanding)} lei`, icon: Clock3, tone: "bg-rose-50 text-rose-700" },
            { label: "Dosare active", value: data.stats.active, icon: BedDouble, tone: "bg-violet-50 text-violet-700" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-[1.5rem] border border-black/5 bg-white p-5 shadow-sm">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.tone}`}><Icon size={20}/></span>
                <p className="mt-4 text-2xl font-black">{card.value}</p>
                <p className="mt-1 text-xs font-black uppercase tracking-[.12em] text-gray-500">{card.label}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
          <div className="rounded-[1.8rem] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.22em] text-[#158F91]">Daily operations</p><h2 className="mt-1 text-2xl font-black">Ce am de făcut astăzi</h2></div><span className="rounded-full bg-[#E9F8F8] px-3 py-1.5 text-xs font-black text-[#158F91]">{data.tasks.length} acțiuni</span></div>
            <div className="mt-5 grid gap-3">
              {data.tasks.length ? data.tasks.map((item, index) => (
                <div key={item.code} className="flex flex-col gap-3 rounded-2xl bg-[#FAFAF7] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black shadow-sm">{index+1}</span><div><p className="font-black">{item.nextAction.label}</p><p className="mt-1 text-sm font-semibold text-gray-600">{item.code} • {item.guestName}</p><p className="mt-1 text-xs text-gray-500">{item.apartmentTitles.join(" + ")}</p></div></div><Link href={`/admin/reservations/${item.code}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#071B2D] px-4 py-2.5 text-xs font-black text-white">Rezolvă <ArrowRight size={14}/></Link></div>
              )) : <div className="rounded-2xl bg-emerald-50 p-6 text-center text-emerald-800"><CheckCircle2 className="mx-auto"/><p className="mt-2 font-black">Totul este în regulă.</p></div>}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#158F91]">Locația acum</p><h2 className="mt-1 text-2xl font-black">Starea apartamentelor</h2>
            <div className="mt-5 grid gap-3">
              {data.apartmentStatus.map((item) => {
                const body = <div className={`rounded-2xl border p-4 ${statusTone[item.status] ?? statusTone.free}`}><p className="font-black">{item.title}</p><p className="mt-1 text-xs font-bold">{item.label}</p></div>;
                return item.reservationCode ? <Link key={item.slug} href={`/admin/reservations/${item.reservationCode}`}>{body}</Link> : <div key={item.slug}>{body}</div>;
              })}
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[1.8rem] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.22em] text-[#158F91]">Flux live</p><h2 className="mt-1 text-2xl font-black">Activitate recentă</h2></div><button onClick={() => void load()} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAFAF7] text-[#071B2D]" aria-label="Actualizează"><RefreshCw size={17}/></button></div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {data.recent.map((item) => <Link key={item.code} href={`/admin/reservations/${item.code}`} className="flex items-center gap-4 rounded-2xl bg-[#FAFAF7] p-4 hover:bg-[#E9F8F8]"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-black shadow-sm">{time(item.at)}</span><div className="min-w-0"><p className="truncate font-black">{item.guestName} • {item.code}</p><p className="mt-1 truncate text-xs font-semibold text-gray-500">{item.action}</p></div></Link>)}
          </div>
        </section>
      </div>
    </main>
  );
}
