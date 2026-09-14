import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { apartments } from "@/data/apartments";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Cazare Mamaia Nord – apartamente cu piscină",
  description:
    "Cazare în Mamaia, Mamaia Nord, Mamaia Sat și Năvodari la Breeze Villa: apartamente spațioase, piscină, loc de joacă, parcare și rezervare directă.",
  alternates: { canonical: "/cazare-mamaia-nord" },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "/cazare-mamaia-nord",
    title: "Cazare Mamaia Nord – Breeze Villa",
    description:
      "Apartamente de vacanță pentru familii, cu piscină, loc de joacă și parcare, în Mamaia, Mamaia Nord – Năvodari.",
    images: [
      {
        url: "/images/apartments/apartament-3.jpg",
        alt: "Apartament la Breeze Villa Mamaia Nord",
      },
    ],
  },
};

const faqs = [
  {
    question: "Unde se află Breeze Villa?",
    answer:
      "Breeze Villa se află în Mamaia Sat, orașul Năvodari, în zona cunoscută turiștilor drept Mamaia Nord, pe Strada C2 nr. 37.",
  },
  {
    question: "Ce tipuri de cazare sunt disponibile?",
    answer:
      "Sunt disponibile studiouri și apartamente cu două sau trei camere, potrivite pentru cupluri, familii și grupuri de până la șase persoane.",
  },
  {
    question: "Există piscină și parcare?",
    answer:
      "Da. Oaspeții au acces la piscină și parcare privată, iar familiile cu copii beneficiază și de un loc de joacă.",
  },
  {
    question: "Cum pot verifica disponibilitatea?",
    answer:
      "Poți folosi pagina de rezervare pentru a selecta perioada și numărul de oaspeți sau ne poți contacta direct pe WhatsApp.",
  },
];

export default function CazareMamaiaNordPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <main className="min-h-screen bg-[#FAFAF7] text-[#071B2D]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="relative overflow-hidden bg-[#071B2D] px-5 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
        <div className="absolute inset-0 opacity-25">
          <Image
            src="/images/apartments/apartament-3.jpg"
            alt="Breeze Villa Mamaia Nord"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#071B2D] via-[#071B2D]/90 to-[#071B2D]/55" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#D9B56D]">
            Breeze Villa · Mamaia Nord · Năvodari
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Cazare în Mamaia și Mamaia Nord, în apartamente spațioase pentru vacanța la mare
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            Alege un studio sau un apartament cu două ori trei camere la Breeze
            Villa, în Mamaia Sat – Năvodari. Ai confort, piscină, loc de joacă și
            parcare privată pentru un sejur relaxant pe litoralul românesc.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/rezervare"
              className="rounded-full bg-[#D9B56D] px-7 py-4 text-sm font-black text-[#071B2D] transition hover:bg-white"
            >
              Verifică disponibilitatea
            </Link>
            <Link
              href="/#apartamente"
              className="rounded-full border border-white/25 bg-white/10 px-7 py-4 text-sm font-black text-white transition hover:bg-white hover:text-[#071B2D]"
            >
              Vezi apartamentele
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#158F91]">
            Sejur în Mamaia Nord
          </p>
          <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
            Apartamente de vacanță pentru cupluri și familii
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600">
            Breeze Villa oferă o alternativă confortabilă la camera clasică de
            hotel: mai mult spațiu, bucătărie utilată și zone potrivite pentru un
            sejur relaxat. Locația este în Mamaia Sat, administrativ Năvodari,
            aproape de zona turistică Mamaia Nord și de stațiunea Mamaia.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {apartments.map((apartment) => (
            <article
              key={apartment.id}
              className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_18px_50px_rgba(7,27,45,0.09)] ring-1 ring-black/5"
            >
              <div className="relative h-56">
                <Image
                  src={apartment.coverImage}
                  alt={`${apartment.title} la Breeze Villa Mamaia Nord`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#158F91]">
                  {apartment.roomsLabel} · până la {apartment.guests} persoane
                </p>
                <h3 className="mt-3 text-xl font-black">{apartment.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {apartment.description}
                </p>
                <Link
                  href={`/apartamente/${apartment.slug}`}
                  className="mt-5 inline-flex font-black text-[#0C7C7E] hover:text-[#071B2D]"
                >
                  Detalii și disponibilitate →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#E9F8F8] px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#158F91]">
              Facilități pentru un sejur fără griji
            </p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Cazare cu piscină în Mamaia Nord
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Spațiile generoase și facilitățile proprietății fac Breeze Villa
              potrivită atât pentru un weekend la mare, cât și pentru o vacanță
              mai lungă în Mamaia Nord și Năvodari.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              "Piscină pentru oaspeți",
              "Parcare privată",
              "Loc de joacă pentru copii",
              "Wi-Fi și aer condiționat",
              "Bucătării utilate",
              "Apartamente de până la 110 mp",
            ].map((item) => (
              <li
                key={item}
                className="rounded-2xl bg-white px-5 py-4 font-bold shadow-sm"
              >
                <span className="mr-2 text-[#D9B56D]">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="lg:col-span-2">
            <Link
              href="/cazare-cu-piscina-mamaia-nord"
              className="inline-flex rounded-full bg-[#071B2D] px-6 py-3 text-sm font-black text-white hover:bg-[#158F91]"
            >
              Cazare cu piscină pentru familii →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <h2 className="text-center text-3xl font-black sm:text-4xl">
          Întrebări despre cazarea la Breeze Villa
        </h2>
        <div className="mt-10 space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h3 className="text-lg font-black">{faq.question}</h3>
              <p className="mt-3 leading-7 text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/apartamente-mamaia-nord"
            className="mr-3 inline-flex rounded-full border border-[#071B2D]/15 px-8 py-4 text-sm font-black text-[#071B2D] transition hover:bg-[#E9F8F8]"
          >
            Compară apartamentele
          </Link>
          <Link
            href="/rezervare"
            className="inline-flex rounded-full bg-[#071B2D] px-8 py-4 text-sm font-black text-white transition hover:bg-[#158F91]"
          >
            Rezervă direct la Breeze Villa
          </Link>
        </div>
      </section>
    </main>
  );
}
