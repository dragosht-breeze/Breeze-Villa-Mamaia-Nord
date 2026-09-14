import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politica de confidențialitate",
  description: "Cum sunt prelucrate și protejate datele personale pe breezevilla.ro.",
  alternates: { canonical: "/politica-confidentialitate" },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF7] px-5 py-16 text-[#17253A] sm:py-24">
      <article className="mx-auto max-w-4xl rounded-[2rem] bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-extrabold uppercase tracking-[.25em] text-[#0F8F8D]">Breeze Villa Mamaia Nord</p>
        <h1 className="mt-3 text-4xl font-black">Politica de confidențialitate</h1>
        <p className="mt-4 text-sm text-slate-500">Ultima actualizare: 14 septembrie 2026</p>
        <div className="mt-10 space-y-8 leading-7 text-slate-600">
          <section><h2 className="text-xl font-black text-[#17253A]">Operatorul datelor</h2><p className="mt-2"><strong>TOANCHINA DRAGOS PERSOANĂ FIZICĂ AUTORIZATĂ</strong>, CUI 53545068, sediu profesional în Strada C2 nr. 37, etaj 1, ap. 4, Năvodari, județul Constanța, este operatorul datelor. Contact: 0723 253 405, <a className="font-bold text-[#0F8F8D]" href="mailto:dragosht@yahoo.com">dragosht@yahoo.com</a>.</p></section>
          <section><h2 className="text-xl font-black text-[#17253A]">Date și scopuri</h2><p className="mt-2">Prelucrăm numele, telefonul, e-mailul, detaliile rezervării, mesajele și informațiile tehnice necesare pentru: răspunsul la solicitări, încheierea și executarea rezervării, plata și facturarea, comunicările despre sejur, securitatea site-ului și îndeplinirea obligațiilor legale. Cu acordul separat al vizitatorului, folosim date statistice despre utilizarea site-ului.</p></section>
          <section><h2 className="text-xl font-black text-[#17253A]">Temeiuri juridice</h2><p className="mt-2">Prelucrarea se bazează, după caz, pe demersurile precontractuale și executarea contractului, obligațiile legale, interesul legitim privind securitatea și administrarea activității sau consimțământul pentru statistici.</p></section>
          <section><h2 className="text-xl font-black text-[#17253A]">Destinatari și furnizori</h2><p className="mt-2">Datele pot fi prelucrate, strict în limita necesară, de furnizori de găzduire și baze de date, NETOPIA Payments, servicii de e-mail și comunicare, Google Analytics numai după consimțământ, precum și de autorități atunci când legea impune. Datele complete ale cardului sunt introduse direct în pagina procesatorului și nu sunt stocate de Breeze Villa.</p></section>
          <section><h2 className="text-xl font-black text-[#17253A]">Păstrarea datelor</h2><p className="mt-2">Datele sunt păstrate atât timp cât este necesar pentru rezervare, comunicare, obligațiile financiar-contabile și apărarea drepturilor legale. După expirarea termenelor aplicabile, datele sunt șterse sau anonimizate.</p></section>
          <section><h2 className="text-xl font-black text-[#17253A]">Drepturile tale</h2><p className="mt-2">Poți solicita accesul, rectificarea, ștergerea, restricționarea, portabilitatea sau opoziția, după caz, și îți poți retrage consimțământul fără a afecta prelucrarea anterioară. Cererile se trimit la adresa de e-mail de mai sus. Ai dreptul de a depune plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal.</p></section>
          <section><h2 className="text-xl font-black text-[#17253A]">Cookie-uri</h2><p className="mt-2">Detaliile despre tehnologiile utilizate și modificarea acordului sunt disponibile în <Link className="font-bold text-[#0F8F8D] underline" href="/politica-cookie">Politica de cookie-uri</Link>.</p></section>
        </div>
        <Link href="/" className="mt-10 inline-flex rounded-full bg-[#071B2D] px-6 py-3 text-sm font-black text-white">Înapoi la site</Link>
      </article>
    </main>
  );
}
