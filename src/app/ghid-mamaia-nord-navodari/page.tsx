import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ghid Mamaia Nord, Mamaia Sat și Năvodari",
  description:
    "Ghid pentru vacanța în Mamaia Nord, Mamaia Sat și Năvodari: orientare în zonă, plajă, cazare pentru familii și rezervare la Breeze Villa.",
  alternates: { canonical: "/ghid-mamaia-nord-navodari" },
  openGraph: {
    type: "article",
    locale: "ro_RO",
    url: "/ghid-mamaia-nord-navodari",
    title: "Ghid local Mamaia Nord – Mamaia Sat – Năvodari",
    description:
      "Informații utile pentru alegerea zonei și planificarea unei vacanțe la mare.",
    images: [{ url: "/images/pool/02.jpg" }],
  },
};

const areas = [
  {
    title: "Mamaia Nord",
    text: "Denumirea turistică folosită frecvent pentru zona de litoral aflată la nord de stațiunea Mamaia. Este căutată pentru plajă, apartamente de vacanță, restaurante și atmosfera de sezon.",
  },
  {
    title: "Mamaia Sat",
    text: "Este denumirea localității în care se află adresa Breeze Villa. De aceea, oaspeții pot întâlni atât formularea Mamaia Sat, cât și Mamaia Nord atunci când caută cazare sau folosesc hărțile.",
  },
  {
    title: "Năvodari",
    text: "Orașul de care aparține administrativ zona Mamaia Sat. În rezervări, navigație și documente, locația poate apărea și sub denumirea Năvodari, județul Constanța.",
  },
  {
    title: "Mamaia",
    text: "Stațiunea cunoscută de pe litoralul românesc, aflată la sud de Mamaia Nord. Cele două denumiri sunt apropiate în căutările turiștilor, dar indică zone distincte.",
  },
];

const faqs = [
  {
    question: "Breeze Villa este în Mamaia Nord sau în Năvodari?",
    answer:
      "Ambele formulări pot fi întâlnite. Breeze Villa se află în Mamaia Sat, localitate care aparține de orașul Năvodari, în zona turistică numită Mamaia Nord.",
  },
  {
    question: "Este Mamaia Nord aceeași zonă cu Mamaia Sat?",
    answer:
      "Mamaia Nord este denumirea turistică utilizată pe scară largă, iar Mamaia Sat este denumirea oficială a localității pentru o parte importantă a acestei zone.",
  },
  {
    question: "Ce tip de cazare pot alege la Breeze Villa?",
    answer:
      "Poți alege între studio, apartamente cu două camere și apartamente cu trei camere, pentru două până la șase persoane.",
  },
  {
    question: "Cum verific disponibilitatea pentru un sejur?",
    answer:
      "Folosește pagina de rezervare Breeze Villa, selectează perioada și numărul de persoane, iar sistemul îți va afișa variantele disponibile.",
  },
];

export default function GhidMamaiaNordNavodariPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Ghid Mamaia Nord, Mamaia Sat și Năvodari",
        description:
          "Informații pentru orientare și planificarea unui sejur în zona Mamaia Nord.",
        author: { "@type": "Organization", name: "Breeze Villa Mamaia Nord" },
        publisher: { "@type": "Organization", name: "Breeze Villa Mamaia Nord" },
        mainEntityOfPage: "https://www.breezevilla.ro/ghid-mamaia-nord-navodari",
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#FAFAF7] text-[#071B2D]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="relative isolate overflow-hidden bg-[#071B2D] px-5 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
        <Image
          src="/images/pool/02.jpg"
          alt="Vacanță la Breeze Villa în Mamaia Nord"
          fill
          priority
          className="-z-20 object-cover opacity-30"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071B2D] via-[#071B2D]/90 to-[#071B2D]/55" />
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#D9B56D]">
            Ghid local Breeze Villa
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Mamaia Nord, Mamaia Sat și Năvodari: ghid pentru vacanța la mare
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
            Înțelege denumirile zonei, alege cazarea potrivită și pregătește mai
            ușor un sejur pe litoralul românesc la Breeze Villa.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/rezervare" className="rounded-full bg-[#D9B56D] px-8 py-4 text-sm font-black text-[#071B2D] hover:bg-white">
              Verifică disponibilitatea
            </Link>
            <Link href="/cazare-mamaia-nord" className="rounded-full border border-white/25 bg-white/10 px-8 py-4 text-sm font-black text-white hover:bg-white hover:text-[#071B2D]">
              Vezi opțiunile de cazare
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#158F91]">Orientare în zonă</p>
          <h2 className="mt-4 text-3xl font-black sm:text-4xl">Patru denumiri întâlnite frecvent</h2>
          <p className="mt-5 leading-8 text-slate-600">
            Atunci când cauți cazare, aceeași zonă poate apărea descrisă în mai
            multe feluri. Iată cum se diferențiază denumirile pe care le vei
            întâlni pe site-uri, în hărți și în confirmările de rezervare.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {areas.map((area) => (
            <article key={area.title} className="rounded-[1.75rem] bg-white p-7 shadow-[0_16px_45px_rgba(7,27,45,0.08)] ring-1 ring-black/5">
              <h2 className="text-2xl font-black">{area.title}</h2>
              <p className="mt-4 leading-8 text-slate-600">{area.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#E9F8F8] px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="max-w-3xl text-3xl font-black sm:text-4xl">Cum alegi cazarea pentru sejur</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["Pentru un cuplu", "Un studio de 42 mp oferă un spațiu practic pentru două persoane și o escapadă la mare."],
              ["Pentru o familie", "Apartamentele cu două camere găzduiesc până la patru persoane și oferă mai multă libertate."],
              ["Pentru familie numeroasă", "Apartamentele cu trei camere sunt potrivite pentru maximum șase persoane."],
            ].map(([title, text]) => (
              <article key={title} className="rounded-[1.5rem] bg-white p-7 shadow-sm">
                <h3 className="text-xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/apartamente-mamaia-nord" className="rounded-full bg-[#071B2D] px-7 py-4 text-sm font-black text-white hover:bg-[#158F91]">
              Compară apartamentele
            </Link>
            <Link href="/cazare-cu-piscina-mamaia-nord" className="rounded-full border border-[#071B2D]/15 bg-white px-7 py-4 text-sm font-black hover:bg-[#FAFAF7]">
              Cazare cu piscină pentru familii
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
        <div>
          <h2 className="text-3xl font-black sm:text-4xl">Planificarea unei zile de vacanță</h2>
          <p className="mt-5 leading-8 text-slate-600">
            Zona Mamaia Nord este potrivită pentru o vacanță în care poți alterna
            timpul petrecut la plajă cu relaxarea la piscină și mesele în
            apartament sau în localurile din zonă. Pentru familii, un program
            flexibil și un apartament cu bucătărie pot face sejurul mai comod.
          </p>
          <p className="mt-4 leading-8 text-slate-600">
            Înainte de plecare, verifică ruta în aplicația de navigație folosind
            adresa Breeze Villa, Strada C2 nr. 37, și confirmă ora sosirii.
          </p>
        </div>
        <div className="rounded-[2rem] bg-[#071B2D] p-8 text-white">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#D9B56D]">Adresă</p>
          <h2 className="mt-3 text-2xl font-black">Breeze Villa Mamaia Nord</h2>
          <p className="mt-4 leading-7 text-slate-300">Strada C2 nr. 37, Mamaia Sat, Năvodari, județul Constanța</p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=44.29479137620329%2C28.617728027051683"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex rounded-full bg-[#D9B56D] px-6 py-3 text-sm font-black text-[#071B2D]"
          >
            Deschide în Google Maps
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <h2 className="text-center text-3xl font-black sm:text-4xl">Întrebări despre zonă și cazare</h2>
        <div className="mt-10 space-y-4">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h3 className="text-lg font-black">{faq.question}</h3>
              <p className="mt-3 leading-7 text-slate-600">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
