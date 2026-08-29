"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Coffee,
  CreditCard,
  ExternalLink,
  Footprints,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Utensils,
  Waves,
} from "lucide-react";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=44.29479137620329%2C28.617728027051683";

const WHATSAPP_URL =
  "https://wa.me/40723253405?text=Bun%C4%83%20ziua!%20Doresc%20informa%C8%9Bii%20despre%20cazarea%20la%20Breeze%20Villa.";

const nearbyPlaces = [
  {
    icon: Waves,
    title: "Plajă",
    distance: "600 m",
    time: "aprox. 10 min pe jos",
    description:
      "Traseu pietonal scurt, recomandat de noi, până la promenadă și mare.",
    accent: "bg-[#DDF7F6] text-[#0F7775]",
  },
  {
    icon: ShoppingCart,
    title: "Kaufland Mamaia Nord",
    distance: "500 m",
    time: "aprox. 10 min pe jos",
    description:
      "Supermarket nou, foarte util pentru cumpărăturile zilnice ale familiei.",
    accent: "bg-[#FFF2D9] text-[#9A6412]",
  },
  {
    icon: Utensils,
    title: "Restaurante și terase",
    distance: "În apropiere",
    time: "câteva minute",
    description:
      "Numeroase opțiuni pentru mic dejun, prânz, cină și seri relaxate.",
    accent: "bg-[#E9ECFF] text-[#4754A7]",
  },
  {
    icon: Coffee,
    title: "Cafenele și promenadă",
    distance: "Acces rapid",
    time: "la pas",
    description:
      "Cafea, înghețată și plimbări de seară fără drumuri lungi cu mașina.",
    accent: "bg-[#F7E9F1] text-[#94536F]",
  },
];

const familyBenefits = [
  "Zonă liniștită, potrivită pentru familii",
  "Parcare disponibilă în incinta proprietății",
  "Acces simplu către plajă și punctele utile",
];

const vacationCardBrands = ["Edenred", "Pluxee", "UP România"];

function RouteIllustration() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-[#0F4C81]/10 bg-gradient-to-br from-[#F7FCFC] via-white to-[#F3F8FC] p-6 sm:p-8">
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#27C5C3]/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-[#D9B56D]/10 blur-3xl" />

      <div className="relative mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#27C5C3]">
            Traseu recomandat
          </p>
          <h3 className="mt-2 text-2xl font-black text-[#0B1F35] sm:text-3xl">
            Spre plajă, pe ruta scurtă
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            O reprezentare simplă a traseului pietonal pe care îl recomandăm
            oaspeților Breeze Villa.
          </p>
        </div>

        <div className="hidden rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5 sm:block">
          <Footprints className="text-[#0F4C81]" size={26} />
        </div>
      </div>

      <div className="relative min-h-[330px] overflow-hidden rounded-[1.6rem] bg-[#EAF4EC] ring-1 ring-black/5">
        <svg
          viewBox="0 0 760 420"
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="Schemă orientativă a traseului dintre Breeze Villa și plajă"
        >
          <defs>
            <linearGradient id="seaGradient" x1="0" x2="1">
              <stop offset="0%" stopColor="#A8E4E2" />
              <stop offset="100%" stopColor="#58C8C5" />
            </linearGradient>
            <filter id="routeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="4"
                floodColor="#0B1F35"
                floodOpacity="0.18"
              />
            </filter>
          </defs>

          <path d="M0 0H760V420H0Z" fill="#EAF4EC" />
          <path
            d="M565 0H760V420H620C588 370 598 316 576 264C554 212 579 163 565 110C556 76 556 38 565 0Z"
            fill="url(#seaGradient)"
          />
          <path
            d="M525 0C512 58 535 102 518 152C501 203 516 244 505 296C495 342 513 384 501 420"
            fill="none"
            stroke="#F2D7A6"
            strokeWidth="46"
            strokeLinecap="round"
          />
          <path
            d="M120 355C180 300 210 298 275 270C345 241 368 205 423 180C461 163 491 150 526 150"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M120 355C180 300 210 298 275 270C345 241 368 205 423 180C461 163 491 150 526 150"
            fill="none"
            stroke="#0F4C81"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="2 18"
            filter="url(#routeShadow)"
          />
          <circle cx="120" cy="355" r="18" fill="#0F4C81" />
          <circle cx="526" cy="150" r="18" fill="#27C5C3" />
          <circle cx="250" cy="294" r="13" fill="#D9B56D" />
          <circle cx="120" cy="355" r="29" fill="none" stroke="#0F4C81" strokeOpacity="0.2" strokeWidth="8" />
          <circle cx="526" cy="150" r="29" fill="none" stroke="#27C5C3" strokeOpacity="0.25" strokeWidth="8" />
        </svg>

        <div className="absolute bottom-5 left-5 max-w-[210px] rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F4C81] text-white">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Plecare
              </p>
              <p className="font-black text-[#0B1F35]">Breeze Villa</p>
            </div>
          </div>
        </div>

        <div className="absolute right-4 top-5 max-w-[185px] rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur sm:right-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#27C5C3] text-white">
              <Waves size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Destinație
              </p>
              <p className="font-black text-[#0B1F35]">Plajă · 600 m</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-[94px] left-[31%] rounded-xl bg-[#FFF8E8] px-3 py-2 text-xs font-extrabold text-[#8A641C] shadow-md">
          Kaufland · 500 m
        </div>

        <div className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full bg-[#0B1F35] px-4 py-2 text-xs font-bold text-white shadow-lg">
          <Clock size={15} />
          aprox. 10 minute
        </div>
      </div>

      <p className="relative mt-4 text-xs leading-5 text-slate-500">
        Schema este orientativă. Pentru navigație în timp real, folosește
        butonul „Deschide în Google Maps”.
      </p>
    </div>
  );
}

export default function Location() {
  const reduceMotion = useReducedMotion();

  const reveal = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: reduceMotion ? 0 : 0.65 },
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#FAFAF7] py-24 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0F4C81]/15 to-transparent" />
      <div className="pointer-events-none absolute left-[-8rem] top-20 h-72 w-72 rounded-full bg-[#27C5C3]/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-[-9rem] h-80 w-80 rounded-full bg-[#D9B56D]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <motion.div
          {...reveal}
          className="mx-auto mb-14 max-w-4xl text-center sm:mb-16"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-black/5">
            <MapPin className="text-[#27C5C3]" size={17} />
            <span className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#0F4C81]">
              Locație
            </span>
          </div>

          <h2 className="text-4xl font-black leading-[1.08] tracking-tight text-[#0F4C81] sm:text-5xl lg:text-6xl">
            Tot ce ai nevoie,
            <span className="block text-[#0B1F35]">la câteva minute de tine</span>
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Breeze Villa se află în Mamaia Nord, într-o zonă liniștită pentru
            familii, aproape de plajă, magazine, restaurante și promenadă.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {nearbyPlaces.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.5,
                  delay: reduceMotion ? 0 : index * 0.07,
                }}
                className="group rounded-[1.75rem] bg-white p-5 shadow-[0_18px_50px_rgba(15,76,129,0.08)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,76,129,0.13)]"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.accent}`}
                >
                  <Icon size={24} />
                </div>

                <h3 className="mt-5 text-xl font-black text-[#0B1F35]">
                  {item.title}
                </h3>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#0F4C81] px-3 py-1 text-xs font-extrabold text-white">
                    {item.distance}
                  </span>
                  <span className="text-xs font-bold text-[#0F4C81]/70">
                    {item.time}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.div {...reveal}>
            <RouteIllustration />
          </motion.div>

          <motion.div
            {...reveal}
            transition={{
              duration: reduceMotion ? 0 : 0.65,
              delay: reduceMotion ? 0 : 0.08,
            }}
            className="overflow-hidden rounded-[2rem] bg-[#0B1F35] text-white shadow-[0_30px_80px_rgba(11,31,53,0.22)]"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#66D7D4]">
                    Breeze Villa Mamaia Nord
                  </p>
                  <h3 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                    Aproape de mare,
                    <span className="block text-[#D9B56D]">
                      departe de agitație
                    </span>
                  </h3>
                </div>

                <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-white/10 sm:flex">
                  <Sparkles className="text-[#D9B56D]" size={27} />
                </div>
              </div>

              <p className="mt-5 text-base leading-7 text-slate-300">
                Str. C2 nr. 37, Mamaia Nord, Năvodari
              </p>

              <div className="mt-7 space-y-3">
                {familyBenefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-start gap-3 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10"
                  >
                    <CheckCircle2
                      className="mt-0.5 shrink-0 text-[#66D7D4]"
                      size={20}
                    />
                    <p className="text-sm font-semibold leading-6 text-slate-200">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <a
                  href="tel:+40723253405"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-[#0B1F35] transition hover:-translate-y-0.5 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-white/20"
                >
                  <Phone size={18} />
                  Sună
                </a>

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#27C5C3] px-4 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#22B5B3] focus:outline-none focus:ring-4 focus:ring-[#27C5C3]/30"
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </a>

                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/15"
                >
                  <Navigation size={18} />
                  Navighează
                </a>
              </div>
            </div>

            <div className="border-t border-white/10 bg-white/[0.04] p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D9B56D]/15">
                  <CreditCard className="text-[#D9B56D]" size={23} />
                </div>
                <div>
                  <p className="text-sm font-black text-white">
                    Acceptăm carduri de vacanță
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Plata este disponibilă prin furnizorii principali.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {vacationCardBrands.map((brand) => (
                  <div
                    key={brand}
                    className="flex min-h-14 items-center justify-center rounded-xl bg-white px-2 text-center text-xs font-black text-[#0B1F35] shadow-sm"
                    aria-label={`Card de vacanță ${brand}`}
                  >
                    {brand}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          {...reveal}
          className="mt-8 overflow-hidden rounded-[2rem] bg-white p-3 shadow-[0_24px_70px_rgba(15,76,129,0.12)] ring-1 ring-black/5"
        >
          <div className="relative h-[430px] overflow-hidden rounded-[1.55rem] bg-slate-100 sm:h-[500px]">
            <iframe
              title="Breeze Villa Mamaia Nord pe Google Maps"
              src="https://www.google.com/maps?q=44.29479137620329,28.617728027051683&z=16&output=embed"
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />

            <div className="pointer-events-none absolute inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-6 sm:left-6">
              <div className="pointer-events-auto max-w-sm rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur ring-1 ring-black/5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0F4C81] text-white">
                    <MapPin size={22} />
                  </div>

                  <div>
                    <p className="font-black text-[#0B1F35]">
                      Breeze Villa Mamaia Nord
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      Str. C2 nr. 37, Năvodari
                    </p>

                    <a
                      href={GOOGLE_MAPS_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-xs font-extrabold text-[#0F4C81] transition hover:text-[#27C5C3]"
                    >
                      Deschide în Google Maps
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          {...reveal}
          className="mt-8 flex flex-col items-center justify-between gap-5 rounded-[2rem] border border-[#0F4C81]/10 bg-[#F1F8FA] p-6 text-center sm:flex-row sm:text-left lg:p-8"
        >
          <div className="flex items-center gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0F4C81] shadow-sm sm:flex">
              <ShieldCheck size={25} />
            </div>

            <div>
              <p className="text-lg font-black text-[#0B1F35]">
                Ai nevoie de ajutor înainte de rezervare?
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Îți răspundem rapid și te ajutăm cu informațiile despre locație,
                apartamente și disponibilitate.
              </p>
            </div>
          </div>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#0F4C81] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0B3D68] focus:outline-none focus:ring-4 focus:ring-[#0F4C81]/20 sm:w-auto"
          >
            <MessageCircle size={18} />
            Scrie-ne pe WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}
