import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termeni și condiții",
  description: "Condițiile de rezervare și prestare a serviciilor Breeze Villa Mamaia Nord.",
  alternates: { canonical: "/termeni-si-conditii" },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF7] px-5 py-16 text-[#17253A] sm:py-24">
      <article className="mx-auto max-w-4xl rounded-[2rem] bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-extrabold uppercase tracking-[.25em] text-[#0F8F8D]">Breeze Villa Mamaia Nord</p>
        <h1 className="mt-3 text-4xl font-black">Termeni și condiții</h1>
        <p className="mt-4 text-sm text-slate-500">Ultima actualizare: 14 septembrie 2026</p>

        <div className="mt-10 space-y-8 leading-7 text-slate-600">
          <section><h2 className="text-xl font-black text-[#17253A]">1. Identitatea comerciantului</h2><p className="mt-2">Serviciile sunt comercializate și facturate direct de <strong>TOANCHINA DRAGOS PERSOANĂ FIZICĂ AUTORIZATĂ</strong>, CUI 53545068, nr. Registrul Comerțului F2026004141000, cu sediul profesional în Strada C2 nr. 37, etaj 1, ap. 4, Năvodari, județul Constanța. Telefon: <a className="font-bold text-[#0F8F8D]" href="tel:+40723253405">0723 253 405</a>. E-mail: <a className="font-bold text-[#0F8F8D]" href="mailto:dragosht@yahoo.com">dragosht@yahoo.com</a>. PFA-ul are rolul de comerciant și prestator direct al serviciilor de cazare, nu de marketplace sau intermediar.</p></section>
          <section><h2 className="text-xl font-black text-[#17253A]">2. Serviciile oferite</h2><p className="mt-2">Site-ul permite consultarea și rezervarea serviciilor de cazare turistică la Breeze Villa Mamaia Nord. Caracteristicile unităților, capacitatea, facilitățile, perioada disponibilă și prețul total în lei sunt afișate înainte de trimiterea cererii sau efectuarea plății.</p></section>
          <section><h2 className="text-xl font-black text-[#17253A]">3. Rezervarea și contractul</h2><p className="mt-2">Clientul trebuie să furnizeze date reale și complete. O cerere cu avans nu blochează perioada până la încasarea avansului. Cererea rămâne valabilă 48 de ore. Rezervarea devine fermă după confirmarea plății minime solicitate sau a plății integrale, iar confirmarea este comunicată electronic.</p></section>
          <section><h2 className="text-xl font-black text-[#17253A]">4. Prețuri și plată</h2><p className="mt-2">Toate prețurile sunt exprimate în lei (RON). Suma totală, avansul minim și soldul sunt afișate înainte de plată. Plata online cu cardul este procesată securizat de NETOPIA Payments; comerciantul nu stochează datele complete ale cardului. Pot fi disponibile și transferul bancar sau plata cu card de vacanță, conform opțiunilor afișate.</p></section>
          <section><h2 className="text-xl font-black text-[#17253A]">5. Prestarea cazării</h2><p className="mt-2">Serviciul este prestat la Breeze Villa, Strada C2 nr. 37, Mamaia Nord - Năvodari, în perioada exactă înscrisă în confirmarea rezervării. Check-in-ul începe la ora 15:00, iar check-out-ul se realizează între 09:00 și 10:00. Detaliile de acces sunt comunicate înaintea sosirii.</p></section>
          <section><h2 className="text-xl font-black text-[#17253A]">6. Anulare și retragere</h2><p className="mt-2">Condițiile de anulare și eventualele rambursări sunt descrise în <Link className="font-bold text-[#0F8F8D] underline" href="/politica-anulare">Politica de anulare</Link>. Pentru serviciile de cazare furnizate la o dată sau într-o perioadă specifică nu se aplică dreptul general de retragere de 14 zile, conform art. 16 lit. l) din OUG 34/2014. Acest lucru nu limitează drepturile legale ale consumatorului pentru servicii neconforme sau neprestate.</p></section>
          <section><h2 className="text-xl font-black text-[#17253A]">7. Reclamații și soluționarea disputelor</h2><p className="mt-2">Pentru orice problemă, clientul este rugat să contacteze mai întâi comerciantul la datele de mai sus. Consumatorii se pot adresa Autorității Naționale pentru Protecția Consumatorilor și mecanismelor legale aplicabile. Termenii sunt guvernați de legea română.</p></section>
        </div>
        <Link href="/" className="mt-10 inline-flex rounded-full bg-[#071B2D] px-6 py-3 text-sm font-black text-white">Înapoi la site</Link>
      </article>
    </main>
  );
}
