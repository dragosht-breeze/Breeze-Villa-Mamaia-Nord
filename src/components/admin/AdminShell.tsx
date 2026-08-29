"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  CreditCard,
  ContactRound,
  Gauge,
  Inbox,
  Menu,
  ListTodo,
  BellRing,
  PanelsTopLeft,
  RefreshCw,
  Rocket,
  Search,
  Sparkles,
  FlaskConical,
  Settings,
  Tags,
  X,
  LogOut,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import SearchEverywhere from "@/components/admin/search/SearchEverywhere";
import type { SessionPayload } from "@/lib/auth/types";
import { canAccessModule, type AdminModule } from "@/lib/auth/permissions";

const nav: { href: string; label: string; icon: typeof Gauge; module: AdminModule }[] = [
  { href: "/admin", label: "Dashboard", icon: Gauge, module: "dashboard" },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, module: "analytics" },
  { href: "/admin/inbox", label: "Inbox", icon: Inbox, module: "crm" },
  { href: "/admin/ai-dashboard", label: "AI Dashboard", icon: Sparkles, module: "analytics" },
  { href: "/admin/ai-quality", label: "Teste AI", icon: FlaskConical, module: "analytics" },
  { href: "/admin/operations", label: "Operațional", icon: PanelsTopLeft, module: "operations" },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays, module: "calendar" },
  { href: "/admin/reservations", label: "Rezervări", icon: ClipboardList, module: "reservations" },
  { href: "/admin/tasks", label: "Task Center", icon: ListTodo, module: "tasks" },
  { href: "/admin/notifications", label: "Notificări", icon: BellRing, module: "notifications" },
  { href: "/admin/automations", label: "Automatizări", icon: BellRing, module: "notifications" },
  { href: "/admin/launch-readiness", label: "Pregătire lansare", icon: Rocket, module: "settings" },
  { href: "/admin/crm", label: "CRM Clienți", icon: ContactRound, module: "crm" },
  { href: "/admin/ai-leads", label: "Lead-uri AI", icon: Sparkles, module: "crm" },
  { href: "/admin/rates", label: "Tarife", icon: Tags, module: "rates" },
  { href: "/admin/payments", label: "Încasări", icon: CreditCard, module: "payments" },
  { href: "/admin/housekeeping", label: "Curățenie", icon: Sparkles, module: "housekeeping" },
  { href: "/admin/booking-sync", label: "Booking Sync", icon: RefreshCw, module: "booking-sync" },
  { href: "/admin/settings", label: "Setări", icon: Settings, module: "settings" },
];

const mobileNav = nav.filter((item) => ["/admin", "/admin/calendar", "/admin/tasks", "/admin/notifications"].includes(item.href));

function NavLinks({ role, close }: { role: SessionPayload["role"]; close?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="grid gap-1.5">
      {nav.filter((item) => canAccessModule(role, item.module)).map((item) => {
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

export default function AdminShell({ children, user }: { children: React.ReactNode; user: SessionPayload }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <div className="fixed inset-0 z-[100] min-h-screen overflow-y-auto bg-[#F4F3EE] text-[#071B2D]">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col overflow-hidden bg-[#071B2D] p-5 lg:flex">
        <div className="shrink-0 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#D9B56D]">Breeze PMS</p>
          <p className="mt-2 text-2xl font-black text-white">Breeze Villa</p>
          <p className="mt-1 text-xs font-semibold text-white/50">Mamaia Nord</p>
        </div>
        <div className="mt-6 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 [scrollbar-color:rgba(255,255,255,0.22)_transparent] [scrollbar-width:thin]">
          <NavLinks role={user.role} />
          <div className="h-4" />
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)}>
          <aside className="flex h-full w-[86%] max-w-sm flex-col overflow-hidden bg-[#071B2D] p-5" onClick={(e) => e.stopPropagation()}>
            <div className="shrink-0 flex items-center justify-between">
              <div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#D9B56D]">Breeze PMS</p><p className="mt-1 text-xl font-black text-white">Breeze Villa</p></div>
              <button onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"><X size={20} /></button>
            </div>
            <div className="mt-6 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 [scrollbar-color:rgba(255,255,255,0.22)_transparent] [scrollbar-width:thin]">
              <NavLinks role={user.role} close={() => setOpen(false)} />
              <div className="h-4" />
            </div>
          </aside>
        </div>
      ) : null}

      <div className="pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pl-72">
        <header className="sticky top-0 z-40 flex min-h-16 items-center gap-2 border-b border-black/5 bg-white/90 px-3 py-2 backdrop-blur-xl sm:gap-3 sm:px-6 lg:px-8">
          <button onClick={() => setOpen(true)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#071B2D] text-white lg:hidden"><Menu size={20} /></button>

          <div className="hidden min-w-0 sm:block">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#158F91]">Administrare</p>
            <p className="truncate font-black text-[#071B2D]">Centru operațional</p>
          </div>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="mx-auto flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-black/5 bg-[#F4F3EE] px-4 py-2.5 text-left text-sm font-bold text-gray-500 transition hover:border-[#158F91]/25 hover:bg-[#E9F8F8] sm:max-w-xl"
          >
            <Search size={17} className="shrink-0 text-[#158F91]" />
            <span className="truncate"><span className="sm:hidden">Caută...</span><span className="hidden sm:inline">Caută în Breeze PMS...</span></span>
            <span className="ml-auto hidden shrink-0 rounded-lg bg-white px-2 py-1 text-[9px] font-black text-gray-500 ring-1 ring-black/5 sm:inline">Ctrl K</span>
          </button>

          <div className="hidden items-center gap-2 rounded-2xl bg-[#F4F3EE] px-3 py-2 md:flex"><UserRound size={16} className="text-[#158F91]"/><div><p className="max-w-32 truncate text-xs font-black">{user.name}</p><p className="text-[9px] font-bold uppercase text-gray-500">{user.role}</p></div></div>
          <button type="button" title="Deconectare" onClick={async()=>{await fetch("/api/auth/logout",{method:"POST"});window.location.href="/login"}} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/10 text-[#071B2D] hover:bg-[#071B2D] hover:text-white"><LogOut size={17}/></button>
          <Link href="/" className="hidden shrink-0 rounded-full border border-black/10 px-4 py-2 text-xs font-black text-[#071B2D] hover:bg-[#071B2D] hover:text-white sm:block">Vezi site-ul</Link>
        </header>
        {children}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-[80] grid grid-cols-4 border-t border-black/10 bg-white/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_35px_rgba(7,27,45,.12)] backdrop-blur-xl lg:hidden" aria-label="Navigare rapidă admin">
        {mobileNav.filter((item) => canAccessModule(user.role, item.module)).map((item) => {
          const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-black ${active ? "bg-[#E9F8F8] text-[#071B2D]" : "text-gray-500"}`}>
              <Icon size={19} className={active ? "text-[#158F91]" : ""} />
              <span className="max-w-full truncate">{item.label === "Calendar" ? "Calendar" : item.label === "Task Center" ? "Taskuri" : item.label === "Notificări" ? "Alerte" : "Acasă"}</span>
            </Link>
          );
        })}
      </nav>

      <SearchEverywhere
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />
    </div>
  );
}
