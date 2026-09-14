import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politica de cookie-uri",
  description:
    "Informații despre cookie-urile și serviciile de analiză folosite pe site-ul Breeze Villa Mamaia Nord.",
  alternates: { canonical: "/politica-cookie" },
};

export default function CookiePolicyPage() {
  return (
    <main className="bg-[#FAFAF7] px-5 py-16 text-[#17253A] sm:py-24">
      <article className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#0F8F8D]">
          Breeze Villa Mamaia Nord
        </p>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl">
          Politica de cookie-uri
        </h1>
        <p className="mt-5 leading-7 text-slate-600">
          Această pagină explică modul în care site-ul breezevilla.ro folosește
          tehnologii necesare funcționării și, numai cu acordul vizitatorului,
          servicii de analiză a traficului.
        </p>

        <div className="mt-10 space-y-8 leading-7 text-slate-600">
          <section>
            <h2 className="text-xl font-black text-[#17253A]">
              Cookie-uri strict necesare
            </h2>
            <p className="mt-2">
              Sunt folosite pentru funcții esențiale ale site-ului, securitate
              și memorarea alegerii privind cookie-urile. Acestea nu pot fi
              dezactivate prin banner deoarece site-ul nu ar funcționa corect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#17253A]">
              Google Analytics 4
            </h2>
            <p className="mt-2">
              Dacă alegi „Accept statistici”, folosim Google Analytics 4 pentru
              date agregate despre vizite, pagini consultate, dispozitiv și
              interacțiuni. Instrumentul ne ajută să îmbunătățim site-ul și
              procesul de rezervare. Google Analytics nu este încărcat înainte
              de acordul tău.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#17253A]">
              Schimbarea opțiunii
            </h2>
            <p className="mt-2">
              Poți redeschide oricând preferințele din subsolul site-ului. Noua
              alegere va fi memorată în browserul folosit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#17253A]">Contact</h2>
            <p className="mt-2">
              Pentru întrebări despre această politică ne poți contacta la{" "}
              <a
                href="mailto:dragosht@yahoo.com"
                className="font-bold text-[#0F8F8D] underline"
              >
                dragosht@yahoo.com
              </a>
              .
            </p>
          </section>
        </div>

        <Link
          href="/"
          className="mt-10 inline-flex rounded-full bg-[#071B2D] px-6 py-3 text-sm font-black text-white"
        >
          Înapoi la site
        </Link>
      </article>
    </main>
  );
}
