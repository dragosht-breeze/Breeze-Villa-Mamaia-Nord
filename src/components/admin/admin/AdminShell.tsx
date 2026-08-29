"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Gauge,
  Menu,
  PanelsTopLeft,
  RefreshCw,
  Settings,
  Tags,
  X,
} from "lucide-react";
import { useState } from "react";

const nav = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/operations", label: "Operațional", icon: PanelsTopLeft },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/reservations", label: "Rezervări", icon: ClipboardList },
  { href: "/admin/rates", label: "Tarife", icon: Tags },
  { href: "/admin/payments", label: "Încasări", icon: CreditCard },
  { href: "/admin/booking-sync", label: "Booking Sync", icon: RefreshCw },
  { href: "/admin/settings", label: "Setări", icon: Settings },
];

function NavLinks({ close }: { close?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="grid gap-1.5">
      {nav.map((item) => {
        const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={close}
            className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black transition ${
              active ? "bg-[#D9B56D] text-[#071B2D]" : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-3"><Icon size={18} />{item.label}</span>
            {active ? <ChevronRight size={16} /> : null}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed inset-0 z-[100] min-h-screen overflow-y-auto bg-[#F4F3EE] text-[#071B2D]">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 bg-[#071B2D] p-5 lg:block">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#D9B56D]">Breeze PMS</p>
          <p className="mt-2 text-2xl font-black text-white">Breeze Villa</p>
          <p className="mt-1 text-xs font-semibold text-white/50">Mamaia Nord</p>
        </div>
        <div className="mt-6"><NavLinks /></div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)}>
          <aside className="h-full w-[86%] max-w-sm bg-[#071B2D] p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#D9B56D]">Breeze PMS</p><p className="mt-1 text-xl font-black text-white">Breeze Villa</p></div>
              <button onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"><X size={20} /></button>
            </div>
            <div className="mt-6"><NavLinks close={() => setOpen(false)} /></div>
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-black/5 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button onClick={() => setOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071B2D] text-white lg:hidden"><Menu size={20} /></button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#158F91]">Administrare</p>
            <p className="font-black text-[#071B2D]">Centru operațional</p>
          </div>
          <Link href="/" className="rounded-full border border-black/10 px-4 py-2 text-xs font-black text-[#071B2D] hover:bg-[#071B2D] hover:text-white">Vezi site-ul</Link>
        </header>
        {children}
      </div>
    </div>
  );
}
