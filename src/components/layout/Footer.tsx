import Link from "next/link";
import BreezeVillaLogo from "@/components/brand/BreezeVillaLogo";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=44.29479137620329%2C28.617728027051683";

const WHATSAPP_URL =
  "https://wa.me/40723253405?text=Bun%C4%83%20ziua!%20Doresc%20informa%C8%9Bii%20despre%20cazarea%20la%20Breeze%20Villa.";

const navigationLinks = [
  { label: "Acasă", href: "/" },
  { label: "Apartamente", href: "/#apartamente" },
  { label: "Galerie", href: "/#galerie" },
  { label: "Recenzii", href: "/#recenzii" },
  { label: "Locație", href: "/#contact" },
];

const socialLinks = [
  {
    label: "Facebook",
    shortLabel: "f",
    href: "https://www.facebook.com/breezvilla/?locale=ro_RO",
  },
  {
    label: "Instagram",
    shortLabel: "ig",
    href: "https://www.instagram.com/breeze_villa_mamaianord/",
  },
  {
    label: "TikTok",
    shortLabel: "tt",
    href: "https://www.tiktok.com/@breezevillamamaianord",
  },
];

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[17px] w-[17px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[17px] w-[17px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[17px] w-[17px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function NavigationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[17px] w-[17px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 11 19-9-9 19-2-8-8-2Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#071B2D] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D9B56D]/50 to-transparent" />
      <div className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-[#27C5C3]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-[#D9B56D]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_28px_80px_rgba(0,0,0,0.25)] backdrop-blur">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-10">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#66D7D4]">
                Rezervare directă
              </p>

              <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
                Vacanța ta la Breeze Villa începe cu o rezervare simplă.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Verifică disponibilitatea apartamentelor sau scrie-ne direct pe
                WhatsApp pentru informații rapide.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/rezervare"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#D9B56D] px-6 py-4 text-center text-sm font-black text-[#071B2D] shadow-lg transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#D9B56D]/25"
              >
                Verifică disponibilitatea
                <ArrowIcon />
              </Link>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 py-4 text-center text-sm font-black text-white transition hover:-translate-y-0.5 hover:border-[#27C5C3]/60 hover:bg-[#27C5C3]/10 hover:text-[#66D7D4] focus:outline-none focus:ring-4 focus:ring-white/10"
              >
                <MessageIcon />
                Scrie-ne pe WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.85fr_0.85fr_1.1fr]">
          <div>
            <div className="inline-flex rounded-[1.75rem] border border-[#D9B56D]/30 bg-white/95 p-3 shadow-2xl">
              <BreezeVillaLogo variant="footer" />
            </div>

            <p className="mt-6 max-w-md text-sm leading-7 text-slate-300">
              Oază de liniște în Mamaia Nord, creată pentru familii care își
              doresc confort, relaxare și o vacanță fără griji.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  title={item.label}
                  className="inline-flex h-11 min-w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-3 text-xs font-black uppercase tracking-wide text-slate-200 transition hover:-translate-y-0.5 hover:border-[#27C5C3]/50 hover:bg-[#27C5C3]/10 hover:text-[#66D7D4]"
                >
                  {item.shortLabel}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.22em] text-[#D9B56D]">
              Navigare
            </h3>

            <ul className="mt-5 space-y-3">
              {navigationLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:translate-x-0.5 hover:text-white"
                  >
                    {item.label}
                    <span className="opacity-50">
                      <ArrowIcon />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.22em] text-[#D9B56D]">
              Contact
            </h3>

            <ul className="mt-5 space-y-4">
              <li>
                <a
                  href="tel:+40723253405"
                  className="group flex items-start gap-3 text-sm text-slate-300 transition hover:text-white"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-[#66D7D4] transition group-hover:bg-[#27C5C3]/15">
                    <PhoneIcon />
                  </span>

                  <span>
                    <span className="block text-xs text-slate-500">Telefon</span>
                    <span className="mt-0.5 block font-bold">0723 253 405</span>
                  </span>
                </a>
              </li>

              <li>
                <a
                  href="mailto:dragosht@yahoo.com"
                  className="group flex items-start gap-3 text-sm text-slate-300 transition hover:text-white"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-[#66D7D4] transition group-hover:bg-[#27C5C3]/15">
                    <MailIcon />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-xs text-slate-500">E-mail</span>
                    <span className="mt-0.5 block break-all font-bold">
                      dragosht@yahoo.com
                    </span>
                  </span>
                </a>
              </li>

              <li>
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-3 text-sm text-slate-300 transition hover:text-white"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-[#66D7D4] transition group-hover:bg-[#27C5C3]/15">
                    <MapPinIcon />
                  </span>

                  <span>
                    <span className="block text-xs text-slate-500">Adresă</span>
                    <span className="mt-0.5 block font-bold">
                      Str. C2 nr. 37, Mamaia Nord
                    </span>
                  </span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.22em] text-[#D9B56D]">
              Carduri de vacanță
            </h3>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D9B56D]/15 text-[#D9B56D]">
                  <CardIcon />
                </div>

                <div>
                  <p className="text-sm font-black text-white">
                    Acceptăm plata cu cardul de vacanță
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Plata este disponibilă prin furnizorii principali.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {["Edenred", "Pluxee", "UP România"].map((brand) => (
                  <div
                    key={brand}
                    className="flex min-h-14 items-center justify-center rounded-xl bg-white px-2 text-center text-[11px] font-black text-[#071B2D] shadow-sm"
                  >
                    {brand}
                  </div>
                ))}
              </div>
            </div>

            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-200 transition hover:border-[#27C5C3]/50 hover:bg-[#27C5C3]/10 hover:text-[#66D7D4]"
            >
              <NavigationIcon />
              Deschide în Google Maps
              <ArrowIcon />
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-7">
          <div className="flex flex-col items-center justify-between gap-4 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
            <p>
              © {new Date().getFullYear()} Breeze Villa Mamaia Nord. Toate
              drepturile rezervate.
            </p>

            <p className="text-slate-600">
              Confort pentru familii, aproape de mare.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
