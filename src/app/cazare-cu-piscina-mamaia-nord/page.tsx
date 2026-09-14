import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cazare cu piscină în Mamaia Nord pentru familii",
  description:
    "Cazare cu piscină în Mamaia Nord la Breeze Villa: apartamente pentru familii, loc de joacă, parcare privată, bucătărie și rezervare directă.",
  alternates: { canonical: "/cazare-cu-piscina-mamaia-nord" },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "/cazare-cu-piscina-mamaia-nord",
    title: "Cazare cu piscină în Mamaia Nord | Breeze Villa",
    description:
      "Apartamente pentru familii cu piscină, loc de joacă și parcare privată în Mamaia Sat – Năvodari.",
    images: [{ url: "/images/pool/01.jpg" }],
  },
};

const faqs = [
  {
    question: "Breeze Villa oferă cazare cu piscină în Mamaia Nord?",
    answer:
      "Da. Oaspeții Breeze Villa au acces la piscina proprietății pe durata sejurului.",
  },
  {
    question: "Cazarea este potrivită pentru familii cu copii?",
    answer:
      "Da. Proprietatea oferă apartamente spațioase, loc de joacă, piscină și bucătării utilate, facilități utile pentru o vacanță în familie.",
  },
  {
    question: "Există parcare la proprietate?",
    answer: "Da, Breeze Villa oferă parcare privată pentru oaspeți.",
  },
  {
    question: "Câte persoane pot fi cazate într-un apartament?",
    answer:
      "În funcție de varianta aleasă, studiourile și apartamentele pot găzdui între două și șase persoane.",
  },
];

export default function CazareCuPiscinaPage() {
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

      <section className="relative isolate overflow-hidden bg-[#071B2D] px-5 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
        <Image
          src="/images/pool/01.jpg"
          alt="Cazare cu piscină la Breeze Villa Mamaia Nord"
          fill
          priority
          className="-z-20 object-cover opacity-35"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071B2D] via-[#071B2D]/90 to-transparent" />
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#D9B56D]">
            Vacanță în familie la mare
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Cazare cu piscină în Mamaia Nord pentru familii cu copii
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            La Breeze Villa găsești apartamente generoase, piscină, loc de joacă
            și parcare privată pentru un sejur confortabil în Mamaia Sat –
            Năvodari, în zona Mamaia Nord.
          </p>
          <Link
            href="/rezervare"
            className="mt-9 inline-flex rounded-full bg-[#D9B56D] px-8 py-4 text-sm font-black text-[#071B2D] transition hover:bg-white"
          >
            Verifică disponibilitatea
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Piscină", "Momente de relaxare la proprietate, între ieșirile la mare."],
            ["Loc de joacă", "Un spațiu dedicat copiilor, util pentru vacanțele în familie."],
            ["Parcare privată", "Mai multă comoditate pentru oaspeții care sosesc cu mașina."],
            ["Bucătărie utilată", "Flexibilitate pentru micul dejun și mesele familiei."],
          ].map(([title, text]) => (
            <article key={title} className="rounded-[1.5rem] bg-white p-7 shadow-[0_16px_45px_rgba(7,27,45,0.08)] ring-1 ring-black/5">
              <h2 className="text-xl font-black">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#E9F8F8] px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative min-h-[380px] overflow-hidden rounded-[2rem]">
            <Image
              src="/images/apartments/apartament-3.jpg"
              alt="Apartament pentru familie la Breeze Villa Mamaia Nord"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#158F91]">
              Spațiu pentru întreaga familie
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
              Apartamente pentru 2, 4 sau 6 persoane
            </h2>
            <p className="mt-5 leading-8 text-slate-600">
              Poți alege un studio pentru două persoane, un apartament cu două
              camere pentru maximum patru persoane sau un apartament cu trei
              camere pentru maximum șase persoane. Suprafețele sunt cuprinse
              între 42 și 110 mp.
            </p>
            <p className="mt-4 leading-8 text-slate-600">
              Wi-Fi-ul, aerul condiționat, baia privată, terasa și bucătăria sau
              chicineta oferă libertatea de care o familie are nevoie într-o
              vacanță pe litoralul românesc.
            </p>
            <Link
              href="/apartamente-mamaia-nord"
              className="mt-7 inline-flex rounded-full bg-[#071B2D] px-7 py-4 text-sm font-black text-white transition hover:bg-[#158F91]"
            >
              Compară toate apartamentele
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <h2 className="text-center text-3xl font-black sm:text-4xl">
          Întrebări despre piscină și cazarea în familie
        </h2>
        <div className="mt-10 space-y-4">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h3 className="text-lg font-black">{faq.question}</h3>
              <p className="mt-3 leading-7 text-slate-600">{faq.answer}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/cazare-mamaia-nord"
            className="rounded-full border border-[#071B2D]/15 px-7 py-4 text-sm font-black hover:bg-[#E9F8F8]"
          >
            Ghid cazare Mamaia Nord
          </Link>
          <Link
            href="/rezervare"
            className="rounded-full bg-[#071B2D] px-7 py-4 text-sm font-black text-white hover:bg-[#158F91]"
          >
            Rezervă direct
          </Link>
        </div>
      </section>
    </main>
  );
}
