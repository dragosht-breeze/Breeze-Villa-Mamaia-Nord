"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Award,
  CheckCircle2,
  Quote,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

const stats = [
  {
    value: "4.9",
    label: "Google Reviews",
    detail: "34 de recenzii ale oaspeților",
    icon: Star,
  },
  {
    value: "9+",
    label: "Booking.com",
    detail: "Scor excelent pentru cazare",
    icon: Award,
  },
  {
    value: "500+",
    label: "Familii găzduite",
    detail: "Vacanțe petrecute la Breeze Villa",
    icon: Users,
  },
];

const reviews = [
  {
    name: "Andreea M.",
    source: "Google Reviews",
    text: "Locație liniștită, curată și foarte potrivită pentru familii cu copii.",
    accent: "Google",
  },
  {
    name: "Daniel P.",
    source: "Booking.com",
    text: "Apartament spațios, bine utilat și o atmosferă foarte relaxantă.",
    accent: "Booking",
  },
  {
    name: "Cristina A.",
    source: "Google Reviews",
    text: "Piscina, curtea și liniștea au făcut vacanța perfectă pentru copii.",
    accent: "Google",
  },
  {
    name: "Mihai R.",
    source: "Booking.com",
    text: "Gazde amabile, confort și o locație în care ne-am întoarce cu drag.",
    accent: "Booking",
  },
];

const trustPoints = [
  "Recenzii provenite de la oaspeți reali",
  "Experiență apreciată de familii",
  "Rezervare directă, simplă și sigură",
];

export default function Reviews() {
  const shouldReduceMotion = useReducedMotion();

  const revealFromBottom = {
    initial: shouldReduceMotion
      ? { opacity: 1 }
      : { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
  };

  return (
    <section
      id="recenzii"
      className="relative overflow-hidden bg-[#071B2D] py-24 text-white sm:py-28"
    >
      <div
        aria-hidden="true"
        className="absolute left-[-180px] top-12 h-[420px] w-[420px] rounded-full bg-[#27C5C3]/12 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute bottom-[-160px] right-[-120px] h-[420px] w-[420px] rounded-full bg-[#D9B56D]/14 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <motion.div
          {...revealFromBottom}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65 }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.45em] text-[#7FE7E6]">
            Recenziile oaspeților
          </p>

          <h2 className="mt-4 text-[38px] font-black leading-[1.04] sm:text-[48px] lg:text-[58px]">
            Încredere construită prin
            <span className="block text-[#D9B56D]">
              experiențe adevărate
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
            Familiile care ne-au trecut pragul au apreciat spațiul,
            liniștea, piscina și atmosfera relaxată de la Breeze Villa.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={item.label}
                {...revealFromBottom}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.5,
                  delay: shouldReduceMotion ? 0 : index * 0.08,
                }}
                className="group relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.07] p-6 text-center shadow-[0_22px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-[transform,background-color,border-color] duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.1] sm:p-8"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#158F91] shadow-lg">
                  <Icon aria-hidden="true" size={21} />
                </div>

                <p className="mt-5 text-5xl font-black leading-none text-[#7FE7E6] sm:text-6xl">
                  {item.value}
                </p>

                <h3 className="mt-4 text-lg font-black text-white">
                  {item.label}
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/60">
                  {item.detail}
                </p>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {reviews.map((review, index) => (
            <motion.article
              key={`${review.name}-${review.source}`}
              {...revealFromBottom}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: shouldReduceMotion ? 0 : index * 0.07,
              }}
              className="group relative flex min-h-[320px] flex-col overflow-hidden rounded-[1.8rem] bg-white p-6 text-[#071B2D] shadow-[0_24px_70px_rgba(0,0,0,0.22)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-[0_32px_85px_rgba(0,0,0,0.28)] sm:p-7"
            >
              <Quote
                aria-hidden="true"
                className="absolute right-5 top-5 text-[#158F91]/10"
                size={68}
                strokeWidth={2.2}
              />

              <div className="relative flex items-center justify-between gap-3">
                <div
                  className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] ${
                    review.accent === "Google"
                      ? "bg-[#E9F8F8] text-[#158F91]"
                      : "bg-[#EAF2FA] text-[#0F4C81]"
                  }`}
                >
                  {review.source}
                </div>

                <div
                  className="flex items-center gap-0.5 text-[#D9B56D]"
                  aria-label="5 stele din 5"
                >
                  {[...Array(5)].map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      aria-hidden="true"
                      size={14}
                      fill="currentColor"
                    />
                  ))}
                </div>
              </div>

              <blockquote className="relative mt-8 flex-1">
                <p className="text-[17px] font-medium leading-8 text-gray-700">
                  „{review.text}”
                </p>
              </blockquote>

              <footer className="mt-7 border-t border-gray-100 pt-5">
                <p className="font-black text-[#071B2D]">
                  {review.name}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Oaspete Breeze Villa
                </p>
              </footer>
            </motion.article>
          ))}
        </div>

        <motion.div
          {...revealFromBottom}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm sm:p-7 lg:flex lg:items-center lg:justify-between lg:gap-8"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D9B56D] text-[#071B2D]">
                <ShieldCheck aria-hidden="true" size={21} />
              </div>

              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#7FE7E6]">
                  Alegere fără griji
                </p>

                <h3 className="mt-1 text-xl font-black text-white sm:text-2xl">
                  O vacanță confirmată de experiența oaspeților
                </h3>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
              {trustPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-center gap-2 text-sm text-white/70"
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className="shrink-0 text-[#7FE7E6]"
                    size={17}
                  />

                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:shrink-0">
            <a
              href="https://www.google.com/search?q=breeze+villa+mamaia+nord"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-[#0F4C81] shadow-xl transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-[#E9F8F8]"
            >
              Vezi recenziile Google
              <ArrowUpRight aria-hidden="true" size={17} />
            </a>

            <Link
              href="/rezervare"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#27C5C3] px-6 py-3 text-sm font-black text-[#071B2D] shadow-xl transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-[#D9B56D]"
            >
              Verifică disponibilitatea
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}