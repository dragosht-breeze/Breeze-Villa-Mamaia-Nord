import type { Metadata } from "next";

import Link from "next/link";

export const metadata: Metadata = {
  title: "Termeni și politica de anulare",
  description:
    "Consultă regulile privind confirmarea rezervării, plata avansului, anularea și disponibilitatea la Breeze Villa Mamaia Nord.",
  alternates: {
    canonical: "/politica-anulare",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CancellationPolicyPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF7] px-6 py-16">
      <section className="mx-auto max-w-4xl rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(7,27,45,0.08)] md:p-12">
        <Link
          href="/"
          className="inline-flex rounded-full bg-[#E9F8F8] px-5 py-2 text-sm font-black text-[#071B2D] transition hover:bg-[#D9B56D]"
        >
          ← Înapoi la site
        </Link>

        <p className="mt-10 text-[11px] font-black uppercase tracking-[0.35em] text-[#158F91]">
          Breeze Villa Mamaia Nord
        </p>

        <h1 className="mt-4 text-4xl font-black leading-tight text-[#071B2D] md:text-5xl">
          Termeni și politica de anulare
        </h1>

        <div className="mt-8 grid gap-6 text-base leading-8 text-gray-700">
          <div className="rounded-[1.5rem] bg-[#FAFAF7] p-6">
            <h2 className="text-2xl font-black text-[#071B2D]">
              Politica de anulare
            </h2>
            <p className="mt-4">
              Prin confirmarea rezervării și efectuarea plății, indiferent dacă
              este vorba despre un avans sau despre plata integrală a sejurului,
              clientul ia la cunoștință și acceptă faptul că toate sumele
              achitate sunt nerambursabile în cazul anulării rezervării.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-[#E9F8F8] p-6">
            <h2 className="text-2xl font-black text-[#071B2D]">
              Confirmarea rezervării
            </h2>
            <p className="mt-4">
              Pentru rezervările cu avans, rezervarea devine confirmată doar
              după încasarea și confirmarea avansului de către proprietate.
              Cererile de rezervare cu avans sunt valabile 48 de ore.
            </p>
            <p className="mt-4">
              Pentru rezervările cu plată integrală online, rezervarea se
              confirmă automat imediat după finalizarea cu succes a plății
              integrale.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-6 ring-1 ring-black/5">
            <h2 className="text-2xl font-black text-[#071B2D]">
              Disponibilitate
            </h2>
            <p className="mt-4">
              Perioada aleasă printr-o cerere de rezervare cu avans nu este
              blocată până la confirmarea avansului. Perioada devine blocată
              doar după confirmarea avansului sau după plata integrală online.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
