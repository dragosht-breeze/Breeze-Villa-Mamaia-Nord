import Image from "next/image";
import Link from "next/link";
import {
  Baby,
  CalendarDays,
  Car,
  Check,
  ChevronDown,
  MapPin,
  MessageCircle,
  Sparkles,
  Waves,
} from "lucide-react";

const heroStats = [
  {
    icon: Sparkles,
    title: "7 apartamente",
    text: "spațioase",
  },
  {
    icon: Waves,
    title: "Piscină",
    text: "pentru relaxare",
  },
  {
    icon: Car,
    title: "Parcare privată",
    text: "în incintă",
  },
  {
    icon: Baby,
    title: "Ideal pentru familii",
    text: "cu copii",
  },
];

const heroTrustPoints = [
  "Apartamente de până la 110 mp",
  "Curte, piscină și spații verzi",
  "La câteva minute de plajă",
];

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative min-h-[100svh] overflow-hidden bg-[#071B2D]"
    >
      <Image
        src="/images/hero-breeze-night.webp"
        alt="Breeze Villa Mamaia Nord, cu piscina și clădirea iluminate seara"
        fill
        preload
        quality={85}
        sizes="100vw"
        className="object-cover object-[62%_center] sm:object-center lg:object-bottom"
      />

      {/* Stratul principal pentru lizibilitatea conținutului */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[#071B2D]/42"
      />

      {/* Gradient orizontal pentru zona textului */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#071B2D]/98 via-[#071B2D]/78 to-[#071B2D]/20 lg:via-[#071B2D]/62 lg:to-transparent"
      />

      {/* Gradient vertical pentru profunzime și statistici */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#071B2D] via-[#071B2D]/15 to-[#071B2D]/30"
      />

      {/* Reflexie caldă, foarte discretă */}
      <div
        aria-hidden="true"
        className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-[#D9B56D]/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col px-5 pb-10 pt-28 sm:px-6 sm:pb-12 sm:pt-32 lg:justify-center lg:px-8 lg:pb-36 lg:pt-36">
        <div className="flex flex-1 items-center lg:flex-none">
          <div className="w-full max-w-3xl">
            <div className="mb-5 flex items-center gap-3 sm:mb-7 sm:gap-4">
              <span
                aria-hidden="true"
                className="h-px w-9 bg-[#D9B56D] sm:w-14"
              />

              <p className="text-[0.68rem] font-black uppercase tracking-[0.28em] text-[#E8C980] sm:text-sm sm:tracking-[0.4em]">
                Oaza ta de relaxare
              </p>
            </div>

            <h1
              id="hero-title"
              className="max-w-[11ch] text-[3.25rem] font-black leading-[0.9] tracking-[-0.045em] text-white drop-shadow-2xl sm:max-w-none sm:text-7xl md:text-8xl lg:text-[6.4rem]"
            >
              Breeze Villa
              <span className="mt-2 block font-serif text-[0.83em] font-medium tracking-[-0.025em] text-white sm:mt-1">
                Mamaia Nord
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/88 sm:mt-8 sm:text-xl sm:leading-9">
              Vacanța în familie, cu mai mult spațiu, liniște și libertate.
              Apartamente generoase, piscină și natură, la doar câteva minute
              de plajă.
            </p>

            <div
              aria-label="Avantajele principale Breeze Villa"
              className="mt-6 hidden flex-wrap gap-x-6 gap-y-3 sm:flex"
            >
              {heroTrustPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-center gap-2 text-sm font-semibold text-white/80"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D9B56D]/18 text-[#E8C980]">
                    <Check aria-hidden="true" size={13} strokeWidth={3} />
                  </span>

                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                href="/rezervare"
                className="group inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#D9B56D] px-6 py-4 text-center text-[0.95rem] font-black text-[#071B2D] shadow-[0_18px_50px_rgba(217,181,109,0.3)] transition duration-300 hover:-translate-y-1 hover:bg-[#E5C681] hover:shadow-[0_22px_60px_rgba(217,181,109,0.4)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D9B56D]/40 sm:w-auto sm:px-7 sm:text-base"
              >
                <CalendarDays
                  aria-hidden="true"
                  size={22}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
                Verifică disponibilitatea
              </Link>

              <a
                href="https://wa.me/40723253405?text=Bun%C4%83%20ziua%21%20Doresc%20mai%20multe%20informa%C8%9Bii%20despre%20o%20rezervare%20la%20Breeze%20Villa."
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactează Breeze Villa pe WhatsApp"
                className="group inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border border-white/25 bg-white/10 px-6 py-4 text-center text-[0.95rem] font-black text-white shadow-xl backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-[#25D366]/60 hover:bg-[#25D366] hover:shadow-[0_20px_50px_rgba(37,211,102,0.24)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/35 sm:w-auto sm:px-7 sm:text-base"
              >
                <MessageCircle
                  aria-hidden="true"
                  size={22}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
                Discută cu noi pe WhatsApp
              </a>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-white/65 sm:hidden">
              <MapPin
                aria-hidden="true"
                size={17}
                className="shrink-0 text-[#D9B56D]"
              />
              <span>Mamaia Nord, la câteva minute de plajă</span>
            </div>
          </div>
        </div>

        {/* Avantaje pe mobil și tabletă */}
        <div className="mt-8 grid grid-cols-2 gap-2.5 border-t border-white/15 pt-5 lg:hidden">
          {heroStats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex min-h-[74px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-3 backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D9B56D]/30 bg-[#D9B56D]/12 text-[#E8C980]">
                  <Icon aria-hidden="true" size={20} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-black leading-tight text-white">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-tight text-white/60">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Avantaje pe desktop */}
        <div className="absolute bottom-10 left-8 right-8 hidden max-w-7xl grid-cols-4 gap-8 border-t border-white/15 pt-7 text-white lg:grid">
          {heroStats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group flex items-center gap-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D9B56D]/35 bg-[#D9B56D]/10 text-[#E8C980] backdrop-blur-sm transition duration-300 group-hover:-translate-y-1 group-hover:border-[#D9B56D]/60 group-hover:bg-[#D9B56D]/18">
                  <Icon aria-hidden="true" size={23} />
                </div>

                <div>
                  <p className="font-black text-white">{item.title}</p>
                  <p className="mt-0.5 text-sm text-white/65">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <a
          href="#facilitati"
          aria-label="Continuă către facilitățile Breeze Villa"
          className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-white/65 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9B56D] xl:flex"
        >
          <div className="flex h-10 w-6 items-center justify-center rounded-full border border-white/30 bg-white/5 backdrop-blur-sm">
            <ChevronDown
              aria-hidden="true"
              size={16}
              className="animate-bounce"
            />
          </div>

          <span className="text-[0.65rem] font-bold uppercase tracking-[0.28em]">
            Descoperă
          </span>
        </a>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 h-5 w-[110%] -translate-x-1/2 rounded-t-[100%] bg-[#FAFAF7] sm:h-8"
      />
    </section>
  );
}