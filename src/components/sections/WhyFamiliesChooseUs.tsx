"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  Baby,
  BedDouble,
  Car,
  Check,
  MapPin,
  ShieldCheck,
  Trees,
  Waves,
} from "lucide-react";

const reasons = [
  {
    icon: BedDouble,
    title: "Mai mult spațiu pentru întreaga familie",
    text: "Apartamente generoase, cu zone separate pentru odihnă, relaxare și timp petrecut împreună.",
  },
  {
    icon: Baby,
    title: "Un loc potrivit pentru copii",
    text: "Curte, piscină și spații aerisite, într-o atmosferă liniștită și prietenoasă pentru familii.",
  },
  {
    icon: Waves,
    title: "Relaxare fără drumuri zilnice",
    text: "Piscina este chiar la locație, astfel încât vă puteți bucura de vacanță în propriul ritm.",
  },
  {
    icon: Trees,
    title: "Liniște și natură",
    text: "Vegetația matură și curtea verde creează un refugiu plăcut după o zi petrecută la mare.",
  },
  {
    icon: Car,
    title: "Sosire simplă și fără griji",
    text: "Parcarea din incinta proprietății vă oferă acces rapid și mai multă comoditate pe durata sejurului.",
  },
  {
    icon: MapPin,
    title: "Aproape de plajă",
    text: "Marea se află la doar câteva minute, iar la întoarcere vă așteaptă liniștea de la Breeze Villa.",
  },
];

const imageHighlights = [
  "7 apartamente spațioase",
  "Piscină la locație",
  "Curte și spații verzi",
  "Parcare în incintă",
];

export default function WhyFamiliesChooseUs() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="why-families-title"
      className="relative overflow-hidden bg-[#FAFAF7] py-20 sm:py-24 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-[#D9B56D]/12 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-[#27C5C3]/8 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20 lg:px-8">
        <motion.div
          initial={
            shouldReduceMotion ? false : { opacity: 0, x: -30, y: 10 }
          }
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative"
        >
          <div className="relative min-h-[510px] overflow-hidden rounded-[2rem] bg-[#071B2D] shadow-[0_35px_90px_rgba(7,27,45,0.2)] sm:min-h-[650px] sm:rounded-[2.5rem] lg:min-h-[760px]">
            <Image
              src="/images/lateral-ziua.webp"
              alt="Curtea verde și zona de relaxare de la Breeze Villa Mamaia Nord"
              fill
              quality={84}
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 44vw"
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#071B2D]/98 via-[#071B2D]/18 to-transparent"
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-[#071B2D]/22 via-transparent to-transparent"
            />

            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
              <div className="rounded-[1.5rem] border border-white/15 bg-[#071B2D]/65 p-5 shadow-2xl backdrop-blur-xl sm:rounded-[1.8rem] sm:p-7">
                <div className="flex items-end justify-between gap-5 border-b border-white/15 pb-5">
                  <div>
                    <p className="text-5xl font-black leading-none text-white sm:text-6xl">
                      7
                    </p>

                    <p className="mt-2 text-xs font-black uppercase tracking-[0.28em] text-[#E8C980] sm:text-sm">
                      Apartamente
                    </p>
                  </div>

                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-[#D9B56D]/35 bg-[#D9B56D]/12 text-[#E8C980] sm:h-14 sm:w-14">
                    <ShieldCheck aria-hidden="true" size={27} />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {imageHighlights.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 text-sm font-bold text-white/85"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D9B56D]/16 text-[#E8C980]">
                        <Check
                          aria-hidden="true"
                          size={13}
                          strokeWidth={3}
                        />
                      </span>

                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="absolute -bottom-5 -right-5 -z-10 h-full w-full rounded-[2.5rem] border border-[#D9B56D]/20"
          />
        </motion.div>

        <motion.div
          initial={
            shouldReduceMotion ? false : { opacity: 0, x: 30, y: 10 }
          }
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="mb-4 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-10 bg-[#D9B56D] sm:w-12"
            />

            <p className="text-xs font-black uppercase tracking-[0.34em] text-[#B58A38] sm:text-sm sm:tracking-[0.4em]">
              Breeze Villa
            </p>
          </div>

          <h2
            id="why-families-title"
            className="max-w-3xl text-4xl font-black leading-[1.06] tracking-[-0.035em] text-[#071B2D] sm:text-5xl md:text-6xl"
          >
            De ce familiile aleg Breeze Villa?
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:mt-8 sm:text-lg sm:leading-8">
            Mai mult decât un loc de cazare. Un spațiu în care părinții se pot
            relaxa, copiii se pot bucura de vacanță, iar timpul petrecut
            împreună devine cu adevărat valoros.
          </p>

          <div className="mt-9 grid gap-4 sm:mt-11 sm:grid-cols-2">
            {reasons.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.article
                  key={item.title}
                  initial={
                    shouldReduceMotion ? false : { opacity: 0, y: 22 }
                  }
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.45,
                    delay: shouldReduceMotion ? 0 : index * 0.04,
                    ease: "easeOut",
                  }}
                  className="group rounded-[1.6rem] border border-[#071B2D]/7 bg-white p-5 shadow-[0_12px_35px_rgba(7,27,45,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#D9B56D]/30 hover:shadow-[0_20px_50px_rgba(7,27,45,0.09)]"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071B2D] text-[#E8C980] shadow-[0_10px_25px_rgba(7,27,45,0.16)] transition duration-300 group-hover:-translate-y-0.5 group-hover:bg-[#0F4C81]">
                    <Icon
                      aria-hidden="true"
                      size={23}
                      strokeWidth={2}
                    />
                  </div>

                  <h3 className="text-lg font-black leading-snug tracking-[-0.015em] text-[#071B2D]">
                    {item.title}
                  </h3>

                  <p className="mt-2.5 text-sm leading-6 text-slate-600">
                    {item.text}
                  </p>
                </motion.article>
              );
            })}
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-[1.5rem] border border-[#27C5C3]/18 bg-[#27C5C3]/7 px-5 py-4">
            <Baby
              aria-hidden="true"
              size={21}
              className="mt-0.5 shrink-0 text-[#159C9A]"
            />

            <p className="text-sm font-semibold leading-6 text-[#0F4C81]">
              Gândită în special pentru familiile care își doresc confortul
              unui apartament și atmosfera relaxată a unei vacanțe la mare.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}