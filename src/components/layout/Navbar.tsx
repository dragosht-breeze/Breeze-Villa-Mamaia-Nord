"use client";

import Link from "next/link";
import { CalendarDays, Menu, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import BreezeVillaLogo from "@/components/brand/BreezeVillaLogo";

const navItems = [
  { label: "Acasă", href: "/" },
  { label: "Apartamente", href: "/#apartamente" },
  { label: "Facilități", href: "/#facilități" },
  { label: "Galerie", href: "/#galerie" },
  { label: "Recenzii", href: "/#recenzii" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#D9B56D]/20 bg-[#071B2D]/96 shadow-[0_12px_34px_rgba(7,27,45,0.24)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 lg:px-6">
        <Link
          href="/"
          aria-label="Breeze Villa Mamaia Nord"
          className="group flex items-center gap-3"
        >
          <div className="flex h-[84px] w-[100px] items-center justify-center rounded-[1.3rem] border border-[#D9B56D]/50 bg-white/96 px-2 py-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.2)] transition duration-300 group-hover:-translate-y-0.5 group-hover:border-[#E7C979] group-hover:shadow-[0_16px_34px_rgba(217,181,109,0.2)] md:h-[92px] md:w-[108px] lg:h-[98px] lg:w-[114px]">
            <BreezeVillaLogo priority />
          </div>

          <div className="hidden leading-none sm:block">
            <p className="text-[16px] font-black uppercase tracking-[0.16em] text-white md:text-[18px]">
              Breeze Villa
            </p>
            <p className="mt-1.5 text-[9px] font-black uppercase tracking-[0.32em] text-[#D9B56D] md:text-[10px]">
              Mamaia Nord
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-4 lg:flex xl:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="relative text-[11px] font-black uppercase tracking-[0.07em] text-white/85 transition after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-[#D9B56D] after:transition-all hover:text-[#D9B56D] hover:after:w-full xl:text-[12px]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="https://wa.me/40723253405"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/18 px-3.5 py-2 text-xs font-black text-white transition hover:border-[#25D366] hover:bg-[#25D366] hover:text-white xl:px-4"
          >
            <MessageCircle size={15} />
            WhatsApp
          </a>

          <Link
            href="/rezervare"
            className="inline-flex items-center gap-2 rounded-full bg-[#D9B56D] px-3.5 py-2 text-xs font-black text-[#071B2D] shadow-lg transition hover:-translate-y-0.5 hover:bg-white xl:px-4"
          >
            <CalendarDays size={15} />
            Rezervă acum
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white lg:hidden"
          aria-label={open ? "Închide meniul" : "Deschide meniul"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#071B2D] px-5 pb-5 lg:hidden">
          <div className="grid gap-2 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl bg-white/7 px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-white/12"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a
              href="https://wa.me/40723253405"
              target="_blank"
              rel="noreferrer"
              className="flex justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-black text-white"
            >
              WhatsApp
            </a>
            <Link
              href="/rezervare"
              onClick={() => setOpen(false)}
              className="flex justify-center rounded-full bg-[#D9B56D] px-5 py-3 text-sm font-black text-[#071B2D]"
            >
              Rezervă acum
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
