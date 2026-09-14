import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politica de prestare a serviciilor",
  description: "Modul de confirmare și prestare a serviciilor de cazare Breeze Villa.",
  alternates: { canonical: "/politica-prestare-servicii" },
};

export default function ServiceDeliveryPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF7] px-5 py-16 text-[#17253A] sm:py-24">
      <article className="mx-auto max-w-4xl rounded-[2rem] bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-extrabold uppercase tracking-[.25em] text-[#0F8F8D]">Breeze Villa Mamaia Nord</p>
        <h1 className="mt-3 text-4xl font-black">Politica de prestare a serviciilor</h1>
        <div className="mt-10 space-y-8 leading-7 text-slate-600">
          <section><h2 className="text-xl font-black text-[#17253A]">Confirmarea comenzii</h2><p className="mt-2">După confirmarea plății, clientul primește electronic confirmarea rezervării și codul acesteia. Nu se livrează bunuri fizice.</p></section>
          <section><h2 className="text-xl font-black text-[#17253A]">Locul și perioada prestării</h2><p className="mt-2">Cazarea este prestată exclusiv la Breeze Villa, Strada C2 nr. 37, Mamaia Nord - Năvodari, în intervalul de check-in și check-out selectat și confirmat. Check-in-ul începe la ora 15:00; check-out-ul se realizează între 09:00 și 10:00.</p></section>
          <section><h2 className="text-xl font-black text-[#17253A]">Accesul la proprietate</h2><p className="mt-2">Instrucțiunile de acces și contact sunt transmise înainte de sosire. După ora 18:00 poate fi utilizat self check-in, pe baza instrucțiunilor comunicate de proprietate. Solicitările de early check-in sau late check-out depind de disponibilitate și pot implica un cost suplimentar comunicat anterior.</p></section>
          <section><h2 className="text-xl font-black text-[#17253A]">Probleme privind prestarea</h2><p className="mt-2">Orice neconcordanță trebuie comunicată cât mai repede la 0723 253 405 sau dragosht@yahoo.com, pentru a putea fi verificată și remediată. Drepturile legale ale consumatorului rămân aplicabile.</p></section>
        </div>
        <Link href="/" className="mt-10 inline-flex rounded-full bg-[#071B2D] px-6 py-3 text-sm font-black text-white">Înapoi la site</Link>
      </article>
    </main>
  );
}
