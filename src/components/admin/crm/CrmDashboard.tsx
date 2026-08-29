"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, CalendarCheck, CircleDollarSign, Crown, Loader2, Mail, Phone, Search, Sparkles, Star, TrendingUp, UserRound, UsersRound, WalletCards } from "lucide-react";
import type { CrmSummary, CustomerProfile, CustomerTier } from "@/lib/crm/types";

type Filter = "all" | CustomerTier | "balance" | "future" | "elite" | "high_return";
type Payload = { ok: boolean; customers: CustomerProfile[]; summary: CrmSummary; message?: string };

const tierLabels: Record<CustomerTier, string> = { new: "Client nou", returning: "Client recurent", loyal: "Client fidel", vip: "VIP Breeze" };
const loyaltyLabels = { new: "Nou", returning: "Recurent", loyal: "Fidel", vip: "VIP", elite: "Elite" } as const;

const tierClass: Record<CustomerTier, string> = {
  new: "bg-slate-100 text-slate-700",
  returning: "bg-sky-50 text-sky-700",
  loyal: "bg-amber-50 text-amber-800",
  vip: "bg-[#071B2D] text-[#D9B56D]",
};

function money(value: number) { return new Intl.NumberFormat("ro-RO").format(value); }
function normalize(value: string) { return value.toLocaleLowerCase("ro-RO").normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

export default function CrmDashboard() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/crm", { cache: "no-store" })
      .then(async response => { const data = await response.json() as Payload; if (!response.ok || !data.ok) throw new Error(data.message || "CRM indisponibil"); return data; })
      .then(data => active && setPayload(data))
      .catch(err => active && setError(err instanceof Error ? err.message : "CRM indisponibil"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const customers = useMemo(() => {
    const term = normalize(query.trim());
    return (payload?.customers ?? []).filter(customer => {
      const matchesFilter = filter === "all" || filter === customer.tier || (filter === "balance" && customer.outstandingBalance > 0) || (filter === "future" && customer.hasFutureReservation) || (filter === "elite" && customer.intelligence?.loyaltyLevel === "elite") || (filter === "high_return" && (customer.intelligence?.returnProbabilityScore ?? 0) >= 60);
      const haystack = normalize([customer.name, customer.phone, customer.email, customer.favoriteApartment, ...customer.aliases].filter(Boolean).join(" "));
      return matchesFilter && (!term || haystack.includes(term));
    });
  }, [payload, query, filter]);

  if (loading) return <main className="p-6 lg:p-10"><div className="flex min-h-[60vh] items-center justify-center gap-3 text-sm font-black text-[#071B2D]"><Loader2 className="animate-spin" /> Se construiește CRM-ul...</div></main>;
  if (error || !payload) return <main className="p-6 lg:p-10"><div className="rounded-3xl bg-red-50 p-6 font-bold text-red-800">{error || "CRM indisponibil"}</div></main>;

  const cards = [
    ["Total clienți", payload.summary.totalCustomers, UsersRound],
    ["Clienți recurenți", payload.summary.returningCustomers + payload.summary.loyalCustomers + payload.summary.vipCustomers, Star],
    ["VIP Breeze", payload.summary.vipCustomers, Crown],
    ["Valoare clienți", `${money(payload.summary.totalCustomerValue)} lei`, CircleDollarSign],
    ["Medie / client", `${money(payload.summary.averageCustomerValue)} lei`, WalletCards],
    ["Cu sold restant", payload.summary.customersWithBalance, CalendarCheck],
    ["Revenire probabilă", payload.summary.highReturnProbabilityCustomers, TrendingUp],
    ["Portofoliu estimat", `${money(payload.summary.estimatedPortfolioValue3Years)} lei`, Activity],
  ] as const;

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "Toți" }, { id: "elite", label: "Elite" }, { id: "vip", label: "VIP" }, { id: "loyal", label: "Fideli" }, { id: "returning", label: "Recurenți" }, { id: "new", label: "Noi" }, { id: "balance", label: "Sold restant" }, { id: "future", label: "Rezervări viitoare" }, { id: "high_return", label: "Revenire probabilă" },
  ];

  return <main className="p-4 sm:p-6 lg:p-10">
    <section className="overflow-hidden rounded-[2rem] bg-[#071B2D] p-7 text-white shadow-[0_28px_80px_rgba(7,27,45,.18)] lg:p-10">
      <p className="text-[11px] font-black uppercase tracking-[.3em] text-[#D9B56D]">RC1.9.3 · Loyalty & Intelligence</p>
      <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div><h1 className="text-4xl font-black sm:text-5xl">CRM Breeze Villa</h1><p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/65">CRM inteligent cu fidelitate, valoare estimată, probabilitate de revenire și recomandări explicabile.</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4"><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#D9B56D]">Bază actuală</p><p className="mt-1 text-2xl font-black">{payload.summary.totalCustomers} clienți</p></div>
      </div>
    </section>

    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-9">{cards.map(([label, value, Icon]) => <article key={label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E9F8F8] text-[#158F91]"><Icon size={19}/></div><p className="mt-4 text-[10px] font-black uppercase tracking-[.18em] text-gray-500">{label}</p><p className="mt-1 text-2xl font-black text-[#071B2D]">{value}</p></article>)}</section>

    <section className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-[#F4F3EE] px-4 py-3 xl:max-w-xl"><Search size={18} className="text-[#158F91]"/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Caută după nume, telefon, email sau apartament..." className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none"/></label>
        <div className="flex flex-wrap gap-2">{filters.map(item => <button key={item.id} onClick={() => setFilter(item.id)} className={`rounded-full px-4 py-2 text-xs font-black transition ${filter === item.id ? "bg-[#071B2D] text-white" : "bg-[#F4F3EE] text-gray-600 hover:bg-[#E9F8F8]"}`}>{item.label}</button>)}</div>
      </div>
    </section>

    <section className="mt-6 grid gap-4 xl:grid-cols-2">
      {customers.map(customer => <article key={customer.id} className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="flex items-start gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#071B2D] text-[#D9B56D]"><UserRound size={25}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-xl font-black text-[#071B2D]">{customer.name}</h2><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] ${tierClass[customer.tier]}`}>{tierLabels[customer.tier]}</span></div><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-gray-500">{customer.phone && <span className="flex items-center gap-1"><Phone size={13}/>{customer.phone}</span>}{customer.email && <span className="flex items-center gap-1"><Mail size={13}/>{customer.email}</span>}</div></div></div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><Stat label="Sejururi" value={customer.reservationCount}/><Stat label="Valoare" value={`${money(customer.totalValue)} lei`}/><Stat label="Guest Score" value={`${customer.intelligence?.guestScore ?? 0}/100`}/><Stat label="Revenire" value={`${customer.intelligence?.returnProbabilityScore ?? 0}%`}/></div>
        {customer.intelligence && <div className="mt-4 rounded-2xl bg-[#F8F7F3] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><Sparkles size={16} className="text-[#158F91]"/><span className="text-xs font-black uppercase tracking-[.12em] text-[#071B2D]">{loyaltyLabels[customer.intelligence.loyaltyLevel]}</span></div><span className="text-xs font-black text-[#0F6466]">CLV estimat: {money(customer.intelligence.estimatedLifetimeValue3Years)} lei</span></div><div className="mt-3 flex flex-wrap gap-2">{customer.intelligence.segments.slice(0, 4).map(segment => <span key={segment} className="rounded-full bg-white px-3 py-1 text-[10px] font-black text-gray-600 ring-1 ring-black/5">{segment}</span>)}</div></div>}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4"><div className="text-xs font-bold text-gray-500"><span className="text-[#071B2D]">Preferat:</span> {customer.favoriteApartment ?? "Încă nedeterminat"}{customer.outstandingBalance > 0 && <span className="ml-3 text-amber-700">Sold {money(customer.outstandingBalance)} lei</span>}</div><Link href={`/admin/crm/${customer.id}`} className="rounded-full bg-[#E9F8F8] px-4 py-2 text-xs font-black text-[#0F6466] hover:bg-[#158F91] hover:text-white">Deschide profilul clientului</Link></div>
      </article>)}
    </section>
    {customers.length === 0 && <div className="mt-6 rounded-[2rem] bg-white p-10 text-center shadow-sm ring-1 ring-black/5"><UserRound className="mx-auto text-gray-300" size={42}/><p className="mt-4 text-lg font-black text-[#071B2D]">Nu am găsit clienți</p><p className="mt-2 text-sm text-gray-500">Schimbă filtrul sau termenul de căutare.</p></div>}
  </main>;
}

function Stat({ label, value }: { label: string; value: string | number }) { return <div className="rounded-2xl bg-[#F8F7F3] p-3"><p className="text-[9px] font-black uppercase tracking-[.14em] text-gray-400">{label}</p><p className="mt-1 truncate text-sm font-black text-[#071B2D]">{value}</p></div>; }
