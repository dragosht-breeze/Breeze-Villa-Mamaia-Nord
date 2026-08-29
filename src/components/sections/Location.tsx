"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Car,
  Clock,
  MapPin,
  Navigation,
  ShieldCheck,
  ShoppingCart,
  Utensils,
  Waves,
} from "lucide-react";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=44.29479137620329%2C28.617728027051683";

const locationPoints = [
  {
    icon: Waves,
    title: "Plaja Mamaia Nord",
    distance: "aprox. 600 m",
    time: "aprox. 10 minute pe jos",
    text: "Traseul pietonal scurt, recomandat de noi, te duce rapid către promenadă și mare.",
  },
  {
    icon: ShoppingCart,
    title: "Kaufland Mamaia Nord",
    distance: "aprox. 500 m",
    time: "aprox. 10 minute pe jos",
    text: "Foarte util pentru cumpărăturile zilnice, produse pentru copii și tot ce ai nevoie în vacanță.",
  },
  {
    icon: Utensils,
    title: "Restaurante și terase",
    distance: "în apropiere",
    time: "câteva minute",
    text: "Ai la îndemână numeroase opțiuni pentru mic dejun, prânz, cină și seri relaxate.",
  },
  {
    icon: Car,
    title: "Parcare privată",
    distance: "în incintă",
    time: "acces direct",
    text: "Îți lași mașina la proprietate și te bucuri de vacanță fără grija parcării.",
  },
];

function RouteSchema() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-[#0F4C81]/10 bg-white p-5 shadow-[0_24px_70px_rgba(15,76,129,0.10)] sm:p-7">
      <div className="mb-6">
        <p className="text-[11px] font-black uppercase tracking-[0.32em] text-[#158F91]">
          Traseu recomandat
        </p>

        <h3 className="mt-3 text-2xl font-black text-[#071B2D] sm:text-3xl">
          Spre plajă, pe ruta scurtă
        </h3>

        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
          Schema este orientativă și arată traseul pietonal folosit de oaspeții
          Breeze Villa până la plajă.
        </p>
      </div>

      <div className="relative min-h-[360px] overflow-hidden rounded-[1.6rem] bg-[#EAF4EC] ring-1 ring-black/5">
        <svg
          viewBox="0 0 760 430"
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="Schemă orientativă Breeze Villa - Kaufland - Plajă"
        >
          <defs>
            <linearGradient id="sea" x1="0" x2="1">
              <stop offset="0%" stopColor="#A8E4E2" />
              <stop offset="100%" stopColor="#58C8C5" />
            </linearGradient>
          </defs>

          <rect width="760" height="430" fill="#EAF4EC" />

          <path
            d="M570 0H760V430H625C595 378 602 323 580 270C559 219 583 164 568 111C558 75 560 37 570 0Z"
            fill="url(#sea)"
          />

          <path
            d="M528 0C514 58 537 104 520 154C503 204 518 247 507 299C497 347 515 389 503 430"
            fill="none"
            stroke="#F3D9A8"
            strokeWidth="48"
            strokeLinecap="round"
          />

          <path
            d="M120 360C185 304 220 300 282 273C349 245 373 207 427 183C466 166 497 153 530 153"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="26"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M120 360C185 304 220 300 282 273C349 245 373 207 427 183C466 166 497 153 530 153"
            fill="none"
            stroke="#0F4C81"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="2 18"
          />

          <circle cx="120" cy="360" r="18" fill="#0F4C81" />
          <circle cx="530" cy="153" r="18" fill="#27C5C3" />
          <circle cx="260" cy="286" r="14" fill="#D9B56D" />

          <circle cx="120" cy="360" r="30" fill="none" stroke="#0F4C81" strokeOpacity="0.2" strokeWidth="8" />
          <circle cx="530" cy="153" r="30" fill="none" stroke="#27C5C3" strokeOpacity="0.25" strokeWidth="8" />
        </svg>

        <div className="absolute bottom-5 left-5 max-w-[210px] rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F4C81] text-white">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Plecare</p>
              <p className="font-black text-[#071B2D]">Breeze Villa</p>
            </div>
          </div>
        </div>

        <div className="absolute right-4 top-5 max-w-[190px] rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur sm:right-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#27C5C3] text-white">
              <Waves size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Destinație</p>
              <p className="font-black text-[#071B2D]">Plajă · 600 m</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-[100px] left-[30%] rounded-xl bg-[#FFF8E8] px-3 py-2 text-xs font-black text-[#8A641C] shadow-md">
          Kaufland · 500 m
        </div>

        <div className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full bg-[#071B2D] px-4 py-2 text-xs font-bold text-white shadow-lg">
          <Clock size={15} />
          aprox. 10 minute
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-gray-500">
        Pentru navigație în timp real, folosește butonul „Deschide în Google Maps”.
      </p>
    </div>
  );
}

export default function Location() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="contact" className="relative overflow-hidden bg-[#FAFAF7] py-24 sm:py-28">
      <div className="absolute left-[-120px] top-20 h-72 w-72 rounded-full bg-[#27C5C3]/10 blur-3xl" />
      <div className="absolute bottom-10 right-[-120px] h-80 w-80 rounded-full bg-[#D9B56D]/14 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reduceMotion ? 0 : 0.65 }}
          className="mx-auto mb-14 max-w-4xl text-center sm:mb-16"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.42em] text-[#158F91]">Locație</p>
          <h2 className="mt-4 text-4xl font-black leading-[1.04] text-[#0F4C81] sm:text-5xl lg:text-6xl">
            Tot ce ai nevoie,
            <span className="block text-[#071B2D]">la câteva minute de tine</span>
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-gray-600 sm:text-lg">
            Breeze Villa se află în Mamaia Nord, într-o zonă liniștită pentru familii, aproape de plajă, magazine, restaurante și promenadă.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {locationPoints.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : index * 0.06 }}
                className="rounded-[1.7rem] bg-white p-5 shadow-[0_18px_50px_rgba(15,76,129,0.08)] ring-1 ring-black/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E9F8F8] text-[#158F91]">
                  <Icon size={23} />
                </div>
                <h3 className="mt-5 text-lg font-black text-[#071B2D]">{item.title}</h3>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#0F4C81] px-3 py-1 text-xs font-black text-white">{item.distance}</span>
                  <span className="text-xs font-bold text-gray-500">{item.time}</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600">{item.text}</p>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.div
            initial={{ opacity: 0, x: reduceMotion ? 0 : -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: reduceMotion ? 0 : 0.65 }}
          >
            <RouteSchema />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: reduceMotion ? 0 : 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: reduceMotion ? 0 : 0.65 }}
            className="overflow-hidden rounded-[2rem] bg-[#0B1F35] text-white shadow-[0_30px_80px_rgba(11,31,53,0.22)]"
          >
            <div className="p-6 sm:p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#27C5C3]">
                <MapPin size={27} />
              </div>
              <h3 className="mt-6 text-3xl font-black sm:text-4xl">Breeze Villa Mamaia Nord</h3>
              <p className="mt-4 text-base leading-7 text-gray-300">Str. C2 nr. 37, Mamaia Nord, Năvodari</p>

              <div className="mt-7 grid gap-3">
                <div className="flex items-start gap-3 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
                  <ShieldCheck className="mt-0.5 shrink-0 text-[#D9B56D]" size={21} />
                  <p className="text-sm font-semibold leading-6 text-gray-200">Zonă liniștită, potrivită pentru familii cu copii.</p>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
                  <Car className="mt-0.5 shrink-0 text-[#D9B56D]" size={21} />
                  <p className="text-sm font-semibold leading-6 text-gray-200">Parcare disponibilă în incinta proprietății.</p>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
                  <Clock className="mt-0.5 shrink-0 text-[#D9B56D]" size={21} />
                  <p className="text-sm font-semibold leading-6 text-gray-200">Acces rapid către plajă și punctele utile din zonă.</p>
                </div>
              </div>

              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#27C5C3] px-6 py-4 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-[#22B5B3]"
              >
                <Navigation size={20} />
                Deschide în Google Maps
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: reduceMotion ? 0 : 0.65 }}
          className="mt-8 overflow-hidden rounded-[2rem] bg-white p-3 shadow-[0_24px_70px_rgba(15,76,129,0.12)] ring-1 ring-black/5"
        >
          <div className="relative h-[430px] overflow-hidden rounded-[1.55rem] bg-gray-100 sm:h-[500px]">
            <iframe
              title="Breeze Villa Mamaia Nord Google Maps"
              src="https://www.google.com/maps?q=44.29479137620329,28.617728027051683&z=16&output=embed"
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
