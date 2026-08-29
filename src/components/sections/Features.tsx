"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  Baby,
  Car,
  Check,
  Flame,
  Snowflake,
  Trees,
  Umbrella,
  Utensils,
  Waves,
  Wifi,
} from "lucide-react";

const features = [
  {
    icon: Waves,
    title: "Piscină privată",
    text: "Un spațiu de relaxare pentru zilele însorite și vacanțe fără grabă.",
  },
  {
    icon: Baby,
    title: "Kids Friendly",
    text: "Locație potrivită pentru familii cu copii, cu zone sigure și aerisite.",
  },
  {
    icon: Trees,
    title: "Curte verde",
    text: "Vegetație, liniște și spații unde te poți bucura de aerul de mare.",
  },
  {
    icon: Flame,
    title: "Zonă BBQ",
    text: "Seri relaxate la grătar, alături de familie sau prieteni.",
  },
  {
    icon: Car,
    title: "Parcare privată",
    text: "Parcare în incinta proprietății, pentru un sejur fără griji.",
  },
  {
    icon: Umbrella,
    title: "Aproape de plajă",
    text: "La doar câteva minute de mers până la mare.",
  },
  {
    icon: Snowflake,
    title: "Aer condiționat",
    text: "Confort în fiecare apartament, inclusiv în zilele foarte călduroase.",
  },
  {
    icon: Utensils,
    title: "Bucătării utilate",
    text: "Tot ce ai nevoie pentru un sejur comod, mai ales cu cei mici.",
  },
  {
    icon: Wifi,
    title: "Wi-Fi rapid",
    text: "Conexiune stabilă pentru relaxare, lucru sau divertisment.",
  },
];

const highlights = [
  "Piscină privată",
  "Curte verde",
  "Ideal pentru familii",
  "Parcare în incintă",
];

export default function Features() {
  const shouldReduceMotion = useReducedMotion();

  const revealFromBottom = {
    initial: shouldReduceMotion ? false : { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
  };

  return (
    <section
      id="facilitati"
      aria-labelledby="features-title"
      className="relative scroll-mt-24 overflow-hidden bg-[#FAFAF7] py-20 sm:py-24 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-[#27C5C3]/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-20 -right-24 h-96 w-96 rounded-full bg-[#D9B56D]/18 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0F4C81]/10 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <motion.div
          {...revealFromBottom}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="mb-12 grid items-end gap-7 sm:mb-14 lg:mb-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14"
        >
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-px w-10 bg-[#27C5C3] sm:w-12"
              />

              <p className="text-xs font-black uppercase tracking-[0.34em] text-[#159C9A] sm:text-sm sm:tracking-[0.42em]">
                Facilități
              </p>
            </div>

            <h2
              id="features-title"
              className="max-w-3xl text-4xl font-black leading-[1.06] tracking-[-0.035em] text-[#0F4C81] sm:text-5xl md:text-6xl"
            >
              Tot ce contează pentru o vacanță relaxată
            </h2>
          </div>

          <div className="max-w-2xl lg:justify-self-end">
            <p className="text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Breeze Villa este gândită pentru familii care caută mai mult
              spațiu, liniște, piscină, curte verde și confort aproape de mare.
            </p>

            <div className="mt-5 flex items-center gap-3 text-sm font-bold text-[#0F4C81]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#27C5C3]/12 text-[#159C9A]">
                <Check aria-hidden="true" size={16} strokeWidth={3} />
              </span>

              <span>Confortul unei locuințe, atmosfera unei vacanțe</span>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[0.93fr_1.07fr] lg:gap-8">
          <motion.article
            initial={
              shouldReduceMotion ? false : { opacity: 0, x: -30, y: 10 }
            }
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[2rem] bg-[#0B1F35] p-3 shadow-[0_30px_80px_rgba(7,27,45,0.18)] sm:rounded-[2.5rem] sm:p-5"
          >
            <div className="relative min-h-[470px] overflow-hidden rounded-[1.55rem] sm:min-h-[540px] sm:rounded-[2rem] lg:h-full lg:min-h-[620px]">
              <Image
                src="/images/hero/hero.jpg"
                alt="Piscina și spațiile de relaxare de la Breeze Villa Mamaia Nord"
                fill
                quality={88}
                className="object-cover object-center transition-transform duration-1000 hover:scale-[1.025]"
                sizes="(max-width: 1024px) 100vw, 46vw"
              />

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#071B2D]/98 via-[#071B2D]/32 to-[#071B2D]/5"
              />

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-[#071B2D]/30 via-transparent to-transparent"
              />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="mb-3 text-[0.68rem] font-black uppercase tracking-[0.32em] text-[#7FE7E6] sm:text-sm sm:tracking-[0.36em]">
                  Family Retreat
                </p>

                <h3 className="max-w-xl text-3xl font-black leading-[1.08] tracking-[-0.03em] text-white sm:text-4xl">
                  Oază de liniște pentru familii în Mamaia Nord
                </h3>

                <p className="mt-4 max-w-lg text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
                  Un loc în care copiii au spațiu, iar părinții se pot bucura
                  de liniște și relaxare.
                </p>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  {highlights.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md sm:px-4 sm:text-sm"
                    >
                      <Check
                        aria-hidden="true"
                        size={14}
                        strokeWidth={3}
                        className="text-[#7FE7E6]"
                      />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.article>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.article
                  key={feature.title}
                  initial={
                    shouldReduceMotion ? false : { opacity: 0, y: 24 }
                  }
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.45,
                    delay: shouldReduceMotion ? 0 : index * 0.035,
                    ease: "easeOut",
                  }}
                  className="group relative overflow-hidden rounded-[1.7rem] border border-[#0F4C81]/7 bg-white p-5 shadow-[0_12px_35px_rgba(15,76,129,0.055)] transition duration-300 hover:-translate-y-1.5 hover:border-[#27C5C3]/25 hover:shadow-[0_22px_55px_rgba(15,76,129,0.11)] sm:p-6"
                >
                  <div
                    aria-hidden="true"
                    className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#27C5C3]/0 blur-2xl transition duration-500 group-hover:bg-[#27C5C3]/10"
                  />

                  <div className="relative">
                    <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-2xl bg-[#0F4C81] text-white shadow-[0_10px_30px_rgba(15,76,129,0.18)] transition duration-300 group-hover:-translate-y-1 group-hover:bg-[#159C9A] sm:h-14 sm:w-14">
                      <Icon
                        aria-hidden="true"
                        size={26}
                        strokeWidth={2}
                      />
                    </div>

                    <h3 className="mb-2.5 text-lg font-black tracking-[-0.015em] text-[#0F4C81] sm:text-xl">
                      {feature.title}
                    </h3>

                    <p className="text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                      {feature.text}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}