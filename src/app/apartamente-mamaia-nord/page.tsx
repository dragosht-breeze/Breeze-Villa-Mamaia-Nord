import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { apartments } from "@/data/apartments";

export const metadata: Metadata = {
  title: "Apartamente Mamaia Nord – 2 și 3 camere",
  description:
    "Compară studiourile și apartamentele Breeze Villa din Mamaia Nord: 2 sau 3 camere, 2–6 persoane, piscină, parcare și rezervare directă.",
  alternates: { canonical: "/apartamente-mamaia-nord" },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "/apartamente-mamaia-nord",
    title: "Apartamente în Mamaia Nord | Breeze Villa",
    description:
      "Găsește apartamentul potrivit pentru 2–6 persoane la Breeze Villa Mamaia Nord.",
    images: [{ url: "/images/apartments/apartament-superior.jpg" }],
  },
};

export default function ApartamenteMamaiaNordPage() {
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Apartamente Breeze Villa Mamaia Nord",
    numberOfItems: apartments.length,
    itemListElement: apartments.map((apartment, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: apartment.title,
      url: `https://www.breezevilla.ro/apartamente/${apartment.slug}`,
    })),
  };

  return (
    <main className="min-h-screen bg-[#FAFAF7] text-[#071B2D]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <section className="bg-[#071B2D] px-5 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#D9B56D]">
            Breeze Villa Mamaia Nord
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
            Apartamente în Mamaia Nord pentru 2–6 persoane
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
            Compară rapid studioul și apartamentele cu două sau trei camere.
            Toate variantele oferă spațiu pentru un sejur confortabil în Mamaia
            Sat – Năvodari, aproape de zona turistică Mamaia Nord.
          </p>
          <Link
            href="/rezervare"
            className="mt-8 inline-flex rounded-full bg-[#D9B56D] px-7 py-4 text-sm font-black text-[#071B2D] transition hover:bg-white"
          >
            Verifică perioada dorită
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-black sm:text-4xl">
            Alege apartamentul potrivit sejurului tău
          </h2>
          <p className="mt-5 leading-8 text-slate-600">
            Pentru un cuplu, studioul oferă un spațiu practic. Pentru o familie
            de până la patru persoane poți alege un apartament cu două camere,
            iar familiile numeroase și grupurile au la dispoziție apartamente cu
            trei camere, pentru maximum șase persoane.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-[1.75rem] bg-white shadow-[0_18px_50px_rgba(7,27,45,0.08)] ring-1 ring-black/5">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-[#E9F8F8] text-sm">
              <tr>
                <th className="px-6 py-5">Tip cazare</th>
                <th className="px-6 py-5">Capacitate</th>
                <th className="px-6 py-5">Suprafață</th>
                <th className="px-6 py-5">Poziționare</th>
                <th className="px-6 py-5">Detalii</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apartments.map((apartment) => (
                <tr key={apartment.id} className="text-sm">
                  <td className="px-6 py-5 font-black">{apartment.title}</td>
                  <td className="px-6 py-5">până la {apartment.guests} persoane</td>
                  <td className="px-6 py-5">{apartment.surface} mp</td>
                  <td className="px-6 py-5">{apartment.floor} · {apartment.view}</td>
                  <td className="px-6 py-5">
                    <Link
                      href={`/apartamente/${apartment.slug}`}
                      className="font-black text-[#0C7C7E] hover:text-[#071B2D]"
                    >
                      Vezi apartamentul →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-[#E9F8F8] px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {[
            ["Studio pentru cupluri", "42 mp, parter și acces facil pentru o escapadă la mare în doi."],
            ["2 camere pentru familii", "Apartamente de 73–110 mp pentru până la patru persoane."],
            ["3 camere pentru grupuri", "Apartamente de 90–100 mp pentru până la șase persoane."],
          ].map(([title, text]) => (
            <article key={title} className="rounded-[1.5rem] bg-white p-7 shadow-sm">
              <h2 className="text-xl font-black">{title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8 lg:py-24">
        <div className="relative min-h-80 overflow-hidden rounded-[2rem]">
          <Image
            src="/images/apartments/apartament-superior.jpg"
            alt="Apartament spațios Breeze Villa Mamaia Nord"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="text-3xl font-black sm:text-4xl">
            Facilități incluse pentru o vacanță confortabilă
          </h2>
          <p className="mt-5 leading-8 text-slate-600">
            Apartamentele Breeze Villa includ Wi-Fi, aer condiționat, bucătărie
            sau chicinetă, televizor, baie privată și terasă. Proprietatea oferă
            piscină, loc de joacă și parcare privată.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/cazare-mamaia-nord"
              className="rounded-full border border-[#071B2D]/15 px-6 py-3 text-sm font-black hover:bg-[#071B2D] hover:text-white"
            >
              Ghid cazare Mamaia Nord
            </Link>
            <Link
              href="/rezervare"
              className="rounded-full bg-[#071B2D] px-6 py-3 text-sm font-black text-white hover:bg-[#158F91]"
            >
              Rezervă direct
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
