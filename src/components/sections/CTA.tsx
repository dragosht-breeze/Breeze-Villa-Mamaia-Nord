"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Star,
  Waves,
} from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/40723253405?text=Bun%C4%83%20ziua!%20Doresc%20informa%C8%9Bii%20despre%20o%20rezervare%20la%20Breeze%20Villa.";

const benefits = [
  "Confirmare rapidă",
  "Rezervare directă, fără comisioane de platformă",
  "Plată disponibilă și cu carduri de vacanță",
];

const vacationCardBrands = ["Edenred", "Pluxee", "UP România"];

export default function CTA() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="cta-title"
      className="relative overflow-hidden bg-[#FAFAF7] px-5 py-24 sm:px-6 sm:py-28"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0F4C81]/12 to-transparent" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reduceMotion ? 0 : 0.65 }}
          className="relative overflow-hidden rounded-[2.25rem] bg-[#0B1F35] shadow-[0_34px_90px_rgba(7,27,45,0.24)] sm:rounded-[3rem]"
        >
          <div className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-[#27C5C3]/18 blur-3xl" />
          <div className="absolute -right-24 bottom-[-120px] h-96 w-96 rounded-full bg-[#D9B56D]/18 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.02]" />

          <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:gap-14 lg:p-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-[#7FE7E6]">
                <Star size={16} />
                Rezervare directă Breeze Villa
              </div>

              <h2
                id="cta-title"
                className="mt-6 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl"
              >
                Vacanța ta la Breeze Villa
                <span className="block text-[#D9B56D]">începe aici.</span>
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Verifică perioada și componența grupului, iar Planificatorul
                Breeze îți arată automat cea mai avantajoasă variantă disponibilă.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <Waves className="text-[#7FE7E6]" size={22} />
                  <p className="mt-3 text-sm font-black text-white">Piscină</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Relaxare direct la locație
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <CalendarDays className="text-[#7FE7E6]" size={22} />
                  <p className="mt-3 text-sm font-black text-white">
                    Planificator inteligent
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Cea mai bună combinație
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <ShieldCheck className="text-[#7FE7E6]" size={22} />
                  <p className="mt-3 text-sm font-black text-white">
                    Rezervare directă
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Simplu și fără comisioane
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-start gap-3 text-sm font-semibold text-slate-200"
                  >
                    <CheckCircle2
                      className="mt-0.5 shrink-0 text-[#7FE7E6]"
                      size={18}
                    />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Link
                href="/rezervare"
                className="group flex min-h-16 items-center justify-between rounded-2xl bg-white px-6 py-5 text-base font-black text-[#0F4C81] shadow-2xl transition hover:-translate-y-0.5 hover:bg-[#F8FBFD] focus:outline-none focus:ring-4 focus:ring-white/20 sm:px-7 sm:text-lg"
              >
                <span className="flex items-center gap-3">
                  <CalendarDays size={24} />
                  Verifică disponibilitatea
                </span>

                <ArrowRight
                  size={22}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-16 items-center justify-between rounded-2xl bg-[#25D366] px-6 py-5 text-base font-black text-white shadow-2xl transition hover:-translate-y-0.5 hover:bg-[#20C45A] focus:outline-none focus:ring-4 focus:ring-[#25D366]/25 sm:px-7 sm:text-lg"
              >
                <span className="flex items-center gap-3">
                  <MessageCircle size={25} />
                  Scrie-ne pe WhatsApp
                </span>

                <ArrowRight
                  size={22}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </a>

              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#7FE7E6]">
                  Contact direct
                </p>

                <a
                  href="tel:+40723253405"
                  className="mt-3 block text-3xl font-black text-white transition hover:text-[#D9B56D]"
                >
                  0723 253 405
                </a>

                <p className="mt-2 text-sm text-slate-400">
                  Răspundem rapid la întrebările despre rezervare.
                </p>
              </div>

              <div className="rounded-2xl border border-[#D9B56D]/20 bg-[#D9B56D]/8 p-5">
                <p className="text-center text-xs font-black uppercase tracking-[0.18em] text-[#E7C67B]">
                  Acceptăm carduri de vacanță
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {vacationCardBrands.map((brand) => (
                    <div
                      key={brand}
                      className="flex min-h-14 items-center justify-center rounded-xl bg-white px-2 text-center text-[11px] font-black text-[#071B2D] shadow-sm"
                    >
                      {brand}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
