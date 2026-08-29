"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, BadgeCheck, Brain, CalendarDays, CircleDollarSign, Clock3, ExternalLink,
  Loader2, Mail, MessageCircle, Phone, Plus, Save, Sparkles, Star, Tags, Target, TrendingUp, WalletCards,
} from "lucide-react";
import type { CustomerTier } from "@/lib/crm/types";
import type { DomainReservation } from "@/lib/domain/types";

type CustomerIntelligence = {
  guestScore: number; relationshipScore: number; loyaltyLevel: "new" | "returning" | "loyal" | "vip" | "elite";
  currentLifetimeValue: number; estimatedLifetimeValue3Years: number;
  returnProbability: "low" | "medium" | "high" | "very_high"; returnProbabilityScore: number;
  segments: string[];
  recommendations: { id: string; title: string; reason: string; action: string; priority: "low" | "medium" | "high" }[];
};

type TimelineItem = { id: string; at: string; category: string; title: string; note?: string; reservationCode: string };
type CustomerDetails = {
  id: string; name: string; phone: string; email?: string; tier: CustomerTier; score: number;
  reservationCount: number; completedStayCount: number; totalNights: number; totalValue: number; totalPaid: number;
  outstandingBalance: number; averageStayNights: number; averageReservationValue: number; firstStay?: string; lastStay?: string;
  nextStay?: string; favoriteApartment?: string; preferredPaymentMethod: string; favoriteMonth?: number; comesWithChildren: boolean;
  directReservationCount: number; bookingReservationCount: number; tags: string[]; manualTags: string[]; notes: string[];
  reservations: DomainReservation[]; timeline: TimelineItem[]; intelligence: CustomerIntelligence;
};

type Payload = { ok: boolean; customer?: CustomerDetails; message?: string };
const tierLabel: Record<CustomerTier, string> = { new: "Client nou", returning: "Client recurent", loyal: "Client fidel", vip: "VIP Breeze" };
const loyaltyNames = { new: "Nou", returning: "Recurent", loyal: "Fidel", vip: "VIP", elite: "Elite" } as const;
const returnNames = { low: "Scăzută", medium: "Medie", high: "Mare", very_high: "Foarte mare" } as const;
const monthNames = ["", "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];

function money(value: number) { return new Intl.NumberFormat("ro-RO").format(value); }
function date(value?: string) { return value ? new Intl.DateTimeFormat("ro-RO", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value.slice(0, 10)}T12:00:00`)) : "—"; }
function initials(name: string) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }

export default function CustomerProfilePage({ customerId }: { customerId: string }) {
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newNote, setNewNote] = useState("");
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/crm/${encodeURIComponent(customerId)}`, { cache: "no-store" })
      .then(async (response) => { const data = await response.json() as Payload; if (!response.ok || !data.ok || !data.customer) throw new Error(data.message || "Profil indisponibil"); return data.customer; })
      .then((data) => { setCustomer(data); setNotes(data.notes); setTags(data.manualTags); })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Profil indisponibil"))
      .finally(() => setLoading(false));
  }, [customerId]);

  const automaticTags = useMemo(() => customer?.tags.filter((tag) => !tags.includes(tag)) ?? [], [customer, tags]);
  async function saveMetadata(nextNotes = notes, nextTags = tags) {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/crm/${encodeURIComponent(customerId)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notes: nextNotes, tags: nextTags }) });
      if (!response.ok) throw new Error("Nu am putut salva modificările.");
      setNotes(nextNotes); setTags(nextTags);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Eroare la salvare"); }
    finally { setSaving(false); }
  }

  if (loading) return <main className="flex min-h-[70vh] items-center justify-center gap-3 p-6 font-black text-[#071B2D]"><Loader2 className="animate-spin" /> Se deschide dosarul clientului...</main>;
  if (error && !customer) return <main className="p-6 lg:p-10"><div className="rounded-3xl bg-red-50 p-6 font-bold text-red-800">{error}</div></main>;
  if (!customer) return null;

  const whatsapp = customer.phone ? `https://wa.me/${customer.phone.replace(/\D/g, "")}` : undefined;
  const statCards = [
    ["Total rezervări", customer.reservationCount, CalendarDays], ["Total nopți", customer.totalNights, Clock3],
    ["Valoare client", `${money(customer.totalValue)} lei`, CircleDollarSign], ["Medie / sejur", `${money(customer.averageReservationValue)} lei`, WalletCards],
    ["Sold restant", `${money(customer.outstandingBalance)} lei`, BadgeCheck], ["Guest Score", `${customer.intelligence.guestScore}/100`, Star],
    ["Relație", `${customer.intelligence.relationshipScore}/100`, Target], ["Revenire", `${customer.intelligence.returnProbabilityScore}%`, TrendingUp],
  ] as const;

  return <main className="p-4 sm:p-6 lg:p-10">
    <Link href="/admin/crm" className="mb-5 inline-flex items-center gap-2 text-sm font-black text-[#0F6466]"><ArrowLeft size={17}/> Înapoi la CRM</Link>

    <section className="overflow-hidden rounded-[2rem] bg-[#071B2D] p-7 text-white shadow-[0_28px_80px_rgba(7,27,45,.18)] lg:p-10">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.6rem] bg-[#D9B56D] text-2xl font-black text-[#071B2D]">{initials(customer.name)}</div>
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><h1 className="truncate text-3xl font-black sm:text-4xl">{customer.name}</h1><span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.15em] text-[#D9B56D]">{tierLabel[customer.tier]}</span></div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-white/65">{customer.phone && <a href={`tel:${customer.phone}`} className="flex items-center gap-2"><Phone size={15}/>{customer.phone}</a>}{customer.email && <a href={`mailto:${customer.email}`} className="flex items-center gap-2"><Mail size={15}/>{customer.email}</a>}</div></div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          {whatsapp && <a href={whatsapp} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-xs font-black text-white"><MessageCircle size={17}/> WhatsApp</a>}
          {customer.email && <a href={`mailto:${customer.email}`} className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-xs font-black"><Mail size={17}/> Email</a>}
          <Link href="/admin/reservations" className="flex items-center justify-center gap-2 rounded-2xl bg-[#D9B56D] px-4 py-3 text-xs font-black text-[#071B2D]"><Plus size={17}/> Rezervare</Link>
        </div>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <HeroStat label="Prima rezervare" value={date(customer.firstStay)}/><HeroStat label="Ultima vizită" value={date(customer.lastStay)}/><HeroStat label="Următoarea vizită" value={date(customer.nextStay)}/><HeroStat label="Apartament preferat" value={customer.favoriteApartment ?? "Nedeterminat"}/>
      </div>
    </section>

    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">{statCards.map(([label, value, Icon]) => <article key={label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E9F8F8] text-[#158F91]"><Icon size={19}/></div><p className="mt-4 text-[10px] font-black uppercase tracking-[.16em] text-gray-500">{label}</p><p className="mt-1 text-xl font-black text-[#071B2D]">{value}</p></article>)}</section>

    <section className="mt-6 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
      <article className="rounded-[2rem] bg-[#071B2D] p-6 text-white shadow-sm">
        <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D9B56D] text-[#071B2D]"><Brain size={21}/></div><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#D9B56D]">Loyalty Engine</p><h2 className="text-xl font-black">{loyaltyNames[customer.intelligence.loyaltyLevel]} · CLV {money(customer.intelligence.estimatedLifetimeValue3Years)} lei</h2></div></div>
        <div className="mt-5 grid grid-cols-2 gap-3"><HeroStat label="Valoare actuală" value={`${money(customer.intelligence.currentLifetimeValue)} lei`}/><HeroStat label="Valoare estimată 3 ani" value={`${money(customer.intelligence.estimatedLifetimeValue3Years)} lei`}/><HeroStat label="Probabilitate revenire" value={returnNames[customer.intelligence.returnProbability]}/><HeroStat label="Relationship Score" value={`${customer.intelligence.relationshipScore}/100`}/></div>
        <div className="mt-5 flex flex-wrap gap-2">{customer.intelligence.segments.map(segment => <span key={segment} className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-black text-white/80">{segment}</span>)}</div>
      </article>
      <article className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E9F8F8] text-[#158F91]"><Sparkles size={21}/></div><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#158F91]">Recommendation Engine v1</p><h2 className="text-xl font-black text-[#071B2D]">Recomandări explicabile</h2></div></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">{customer.intelligence.recommendations.map(item => <div key={item.id} className="rounded-2xl bg-[#F8F7F3] p-4"><div className="flex items-start justify-between gap-3"><p className="font-black text-[#071B2D]">{item.title}</p><span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase ${item.priority === "high" ? "bg-red-50 text-red-700" : item.priority === "medium" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{item.priority === "high" ? "Prioritar" : item.priority === "medium" ? "Recomandat" : "Opțional"}</span></div><p className="mt-2 text-xs font-semibold text-gray-500">{item.reason}</p><p className="mt-2 text-xs font-black text-[#0F6466]">{item.action}</p></div>)}</div>
      </article>
    </section>

    <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
      <div className="space-y-6">
        <Panel title="Istoric rezervări" subtitle="Toate sejururile asociate acestui client">
          <div className="space-y-3">{customer.reservations.map((reservation) => <article key={reservation.code} className="rounded-2xl bg-[#F8F7F3] p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-black text-[#071B2D]">{reservation.apartments.map((a) => a.title).join(", ")}</p><p className="mt-1 text-xs font-bold text-gray-500">{date(reservation.checkIn)} – {date(reservation.checkOut)} · {reservation.nights} nopți · {reservation.source === "booking" ? "Booking" : "Direct"}</p></div><div className="flex items-center gap-3"><div className="text-right"><p className="font-black text-[#071B2D]">{money(reservation.total)} lei</p><p className={`text-xs font-bold ${reservation.balance > 0 ? "text-amber-700" : "text-emerald-700"}`}>{reservation.balance > 0 ? `Sold ${money(reservation.balance)} lei` : "Achitat"}</p></div><Link href={`/admin/reservations/${encodeURIComponent(reservation.code)}`} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0F6466] ring-1 ring-black/5"><ExternalLink size={17}/></Link></div></div></article>)}</div>
        </Panel>
        <Panel title="Timeline client" subtitle="Rezervări, plăți și evenimente într-o singură cronologie">
          <div className="space-y-4">{customer.timeline.slice(0, 40).map((event) => <div key={`${event.id}-${event.reservationCode}`} className="flex gap-4"><div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#158F91] ring-4 ring-[#E9F8F8]"/><div className="min-w-0 flex-1 border-b border-black/5 pb-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-black text-[#071B2D]">{event.title}</p><p className="text-[10px] font-black uppercase tracking-[.12em] text-gray-400">{date(event.at)}</p></div>{event.note && <p className="mt-1 text-sm font-semibold text-gray-500">{event.note}</p>}</div></div>)}</div>
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel title="Preferințe detectate" subtitle="Calcul automat din istoricul clientului">
          <div className="grid gap-3"><Info label="Metodă preferată" value={customer.preferredPaymentMethod}/><Info label="Luna preferată" value={customer.favoriteMonth ? monthNames[customer.favoriteMonth] : "Nedeterminată"}/><Info label="Durata medie" value={`${customer.averageStayNights} nopți`}/><Info label="Rezervări directe" value={`${customer.directReservationCount} din ${customer.reservationCount}`}/><Info label="Călătorește cu copii" value={customer.comesWithChildren ? "Da" : "Nu"}/></div>
        </Panel>
        <Panel title="Tag-uri client" subtitle="Automatizate și adăugate manual">
          <div className="flex flex-wrap gap-2">{automaticTags.map((tag) => <span key={tag} className="rounded-full bg-[#E9F8F8] px-3 py-2 text-xs font-black text-[#0F6466]">{tag}</span>)}{tags.map((tag) => <button key={tag} onClick={() => saveMetadata(notes, tags.filter((item) => item !== tag))} className="rounded-full bg-[#071B2D] px-3 py-2 text-xs font-black text-white">{tag} ×</button>)}</div>
          <div className="mt-4 flex gap-2"><input value={newTag} onChange={(event) => setNewTag(event.target.value)} placeholder="Adaugă tag..." className="min-w-0 flex-1 rounded-xl bg-[#F4F3EE] px-3 py-2 text-sm font-bold outline-none"/><button onClick={() => { const tag = newTag.trim(); if (tag) { void saveMetadata(notes, [...tags, tag]); setNewTag(""); } }} className="rounded-xl bg-[#071B2D] px-3 text-white"><Tags size={17}/></button></div>
        </Panel>
        <Panel title="Note private" subtitle="Vizibile doar în zona de administrare">
          <div className="space-y-2">{notes.map((note, index) => <div key={`${note}-${index}`} className="rounded-2xl bg-[#FFF8E8] p-3 text-sm font-semibold text-[#6D5421]"><div className="flex justify-between gap-3"><span>{note}</span><button onClick={() => saveMetadata(notes.filter((_, itemIndex) => itemIndex !== index), tags)} className="font-black">×</button></div></div>)}</div>
          <textarea value={newNote} onChange={(event) => setNewNote(event.target.value)} placeholder="Scrie o observație despre client..." className="mt-3 min-h-24 w-full rounded-2xl bg-[#F4F3EE] p-3 text-sm font-semibold outline-none"/>
          <button disabled={saving || !newNote.trim()} onClick={() => { const note = newNote.trim(); if (note) { void saveMetadata([...notes, note], tags); setNewNote(""); } }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#158F91] px-4 py-3 text-sm font-black text-white disabled:opacity-50">{saving ? <Loader2 size={17} className="animate-spin"/> : <Save size={17}/>} Salvează nota</button>
        </Panel>
      </div>
    </section>
  </main>;
}

function HeroStat({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[9px] font-black uppercase tracking-[.17em] text-[#D9B56D]">{label}</p><p className="mt-1 truncate font-black text-white">{value}</p></div>; }
function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6"><div className="mb-5"><h2 className="text-xl font-black text-[#071B2D]">{title}</h2><p className="mt-1 text-xs font-semibold text-gray-500">{subtitle}</p></div>{children}</section>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#F8F7F3] p-3"><span className="text-xs font-black uppercase tracking-[.12em] text-gray-400">{label}</span><span className="text-right text-sm font-black text-[#071B2D]">{value}</span></div>; }
