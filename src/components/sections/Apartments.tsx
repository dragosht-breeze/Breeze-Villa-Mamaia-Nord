import Image from "next/image";
import Link from "next/link";
import {
  Baby,
  BedDouble,
  CalendarCheck,
  Car,
  ChevronRight,
  Clock,
  Headphones,
  Heart,
  Maximize2,
  ShieldCheck,
  Sparkles,
  Star,
  Trees,
  Trophy,
  Users,
  Waves,
} from "lucide-react";

type Apartment = {
  slug: string;
  title: string;
  badge: string;
  image: string;
  guests: string;
  surface: string;
  rooms: string;
  details: string;
  rating: string;
  featured?: boolean;
};

const apartments: Apartment[] = [
  {
    slug: "apartament-3-premium",
    title: "Apartament 3 camere – Etaj 3",
    badge: "Apartamentul vedetă",
    image: "/images/apartments/apartament-3.jpg",
    guests: "6 pers.",
    surface: "90 mp",
    rooms: "3 camere",
    details: "Terasă • vedere curte și mare",
    rating: "9.7",
    featured: true,
  },
  {
    slug: "apartament-superior",
    title: "Apartament 2 camere Superior",
    badge: "Cel mai spațios",
    image: "/images/apartments/apartament-superior.jpg",
    guests: "4 pers.",
    surface: "110 mp",
    rooms: "2 camere",
    details: "Parter • vedere curte",
    rating: "9.7",
  },
  {
    slug: "apartament-3-etaj-2",
    title: "Apartament 3 camere – Etaj 2",
    badge: "Vedere piscină",
    image: "/images/apartments/apartament-3-etaj-2.jpg",
    guests: "6 pers.",
    surface: "90 mp",
    rooms: "3 camere",
    details: "Vedere piscină",
    rating: "9.6",
  },
  {
    slug: "apartament-3-etaj-1",
    title: "Apartament 3 camere – Etaj 1",
    badge: "Vedere curte",
    image: "/images/apartments/apartament-3-etaj-1.jpg",
    guests: "6 pers.",
    surface: "100 mp",
    rooms: "3 camere",
    details: "Vedere curte",
    rating: "9.5",
  },
  {
    slug: "apartament-2-etaj-3",
    title: "Apartament 2 camere – Etaj 3",
    badge: "Vedere piscină",
    image: "/images/apartments/apartament-2-etaj-3.jpg",
    guests: "4 pers.",
    surface: "75 mp",
    rooms: "2 camere",
    details: "Vedere piscină",
    rating: "9.5",
  },
  {
    slug: "apartament-2",
    title: "Apartament 2 camere – Etaj 1",
    badge: "Family Choice",
    image: "/images/apartments/apartament-2.jpg",
    guests: "4 pers.",
    surface: "73 mp",
    rooms: "2 camere",
    details: "Vedere piscină",
    rating: "9.5",
  },
  {
    slug: "studio",
    title: "Studio",
    badge: "Cupluri",
    image: "/images/apartments/studio.jpg",
    guests: "2 pers.",
    surface: "42 mp",
    rooms: "Studio",
    details: "Parter • spre piscină",
    rating: "9.4",
  },
];

const sideBenefits = [
  { icon: Waves, title: "Piscină", text: "relaxare" },
  { icon: Car, title: "Parcare privată", text: "securizată" },
  { icon: Baby, title: "Familii", text: "kids friendly" },
  { icon: Trees, title: "Curte verde", text: "liniște și relaxare" },
  { icon: ShieldCheck, title: "Siguranță", text: "fără griji" },
];

const bottomBenefits = [
  {
    icon: CalendarCheck,
    title: "Check-in flexibil",
    text: "De la ora 15:00",
  },
  {
    icon: Clock,
    title: "Check-out flexibil",
    text: "Până la ora 11:00",
  },
  {
    icon: Headphones,
    title: "Asistență dedicată",
    text: "Suntem aici pentru tine",
  },
];

function ApartmentCard({
  apartment,
  featured = false,
  className = "",
}: {
  apartment: Apartment;
  featured?: boolean;
  className?: string;
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[1.45rem] bg-[#071B2D] shadow-[0_18px_45px_rgba(7,27,45,0.18)] ring-1 ring-black/5 transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(7,27,45,0.3)] ${
        featured
          ? "min-h-[420px] lg:min-h-[500px]"
          : "min-h-[250px] lg:min-h-[285px]"
      } ${className}`}
    >
      <Image
        src={apartment.image}
        alt={apartment.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes={
          featured
            ? "(max-width: 1024px) 100vw, 48vw"
            : "(max-width: 768px) 100vw, 24vw"
        }
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#071B2D]/95 via-[#071B2D]/52 to-black/8"
      />

      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent"
      />

      <div
        className={`absolute left-4 top-4 inline-flex max-w-[calc(100%-5.5rem)] items-center gap-1.5 rounded-full bg-[#D9B56D] font-black uppercase tracking-wide text-[#071B2D] shadow-lg ${
          featured
            ? "px-4 py-2 text-[11px]"
            : "px-3 py-1.5 text-[9px]"
        }`}
      >
        {featured ? (
          <Trophy aria-hidden="true" size={14} />
        ) : (
          <Sparkles aria-hidden="true" size={11} />
        )}

        <span className="truncate">{apartment.badge}</span>
      </div>

      <button
        type="button"
        aria-label={`Salvează ${apartment.title}`}
        className={`absolute right-4 top-4 flex items-center justify-center rounded-full bg-white text-[#071B2D] shadow-lg transition-transform hover:scale-110 ${
          featured ? "h-11 w-11" : "h-9 w-9"
        }`}
      >
        <Heart aria-hidden="true" size={featured ? 18 : 15} />
      </button>

      <div
        className={`absolute bottom-0 left-0 right-0 text-white ${
          featured ? "p-6" : "p-4"
        }`}
      >
        <h3
          className={`max-w-[88%] font-black leading-[1.05] drop-shadow-lg ${
            featured
              ? "text-[31px] md:text-[38px]"
              : "text-[20px]"
          }`}
        >
          {apartment.title}
        </h3>

        <div
          className={`mt-4 grid grid-cols-3 border-y border-white/15 py-3 ${
            featured
              ? "max-w-[560px] gap-4 text-[14px]"
              : "gap-2 text-[11px]"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Users
              aria-hidden="true"
              className="shrink-0 text-[#D9B56D]"
              size={featured ? 17 : 13}
            />
            <span>{apartment.guests}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Maximize2
              aria-hidden="true"
              className="shrink-0 text-[#D9B56D]"
              size={featured ? 17 : 13}
            />
            <span>{apartment.surface}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <BedDouble
              aria-hidden="true"
              className="shrink-0 text-[#D9B56D]"
              size={featured ? 17 : 13}
            />
            <span>{apartment.rooms}</span>
          </div>
        </div>

        <p
          className={`mt-3 text-white/90 ${
            featured ? "text-[16px]" : "text-[13px]"
          }`}
        >
          {apartment.details}
        </p>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="flex min-w-0 gap-2">
            <Link
              href={`/apartamente/${apartment.slug}`}
              className={`inline-flex items-center justify-center rounded-xl bg-[#0F4C81] font-black text-white shadow-lg transition-[transform,background-color] hover:-translate-y-1 hover:bg-[#27C5C3] ${
                featured
                  ? "px-5 py-3 text-sm"
                  : "px-3.5 py-2.5 text-[11px]"
              }`}
            >
              {featured ? "Vezi apartamentul" : "Vezi"}

              {featured && (
                <ChevronRight
                  aria-hidden="true"
                  className="ml-1"
                  size={16}
                />
              )}
            </Link>

            <Link
              href="/rezervare"
              className={`inline-flex items-center justify-center rounded-xl bg-[#D9B56D] font-black text-[#071B2D] shadow-lg transition-[transform,background-color] hover:-translate-y-1 hover:bg-white ${
                featured
                  ? "px-5 py-3 text-sm"
                  : "px-3.5 py-2.5 text-[11px]"
              }`}
            >
              Rezervă
            </Link>
          </div>

          <div className="shrink-0 text-right">
            <p
              className={`font-black text-white ${
                featured ? "text-3xl" : "text-base"
              }`}
            >
              <span className="text-[#D9B56D]">★</span>{" "}
              {apartment.rating}
            </p>

            <p className="text-[10px] text-white/80">
              Booking.com
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function BenefitPill({
  item,
}: {
  item: (typeof sideBenefits)[number];
}) {
  const Icon = item.icon;

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/75 p-3 shadow-[0_10px_30px_rgba(15,76,129,0.08)] ring-1 ring-[#B7DFE0]/45">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E9F8F8] text-[#158F91] shadow-sm">
        <Icon aria-hidden="true" size={19} />
      </div>

      <div>
        <p className="text-[13px] font-black text-[#071B2D]">
          {item.title}
        </p>

        <p className="text-[12px] text-gray-600">
          {item.text}
        </p>
      </div>
    </div>
  );
}

export default function Apartaments() {
  const featuredApartment = apartments[0];
  const otherApartments = apartments.slice(1);

  return (
    <section
      id="apartamente"
      className="relative overflow-hidden bg-[#FAFAF7] py-20"
    >
      <div
        aria-hidden="true"
        className="absolute left-[-120px] top-20 h-72 w-72 rounded-full bg-[#27C5C3]/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute bottom-10 right-[-120px] h-80 w-80 rounded-full bg-[#D9B56D]/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1480px] px-5 sm:px-6 lg:px-8">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="mb-3 text-[11px] font-black uppercase tracking-[0.42em] text-[#158F91]">
              Cazare premium
            </p>

            <h2 className="max-w-xl text-[38px] font-black leading-[1.02] text-[#071B2D] sm:text-[48px] lg:text-[56px]">
              Apartamentele noastre
            </h2>
          </div>

          <div className="max-w-2xl lg:justify-self-end">
            <p className="text-[16px] leading-8 text-gray-600">
              Spații moderne și elegante, concepute pentru confortul
              tău și al familiei tale: terase generoase, piscină, curte
              verde și liniște la câteva minute de mare.
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[270px_1fr]">
          <aside className="rounded-[2rem] bg-[#E9F8F8] p-5 shadow-[0_22px_55px_rgba(15,76,129,0.08)] xl:sticky xl:top-24 xl:self-start">
            <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-[#D9B56D]">
                {[...Array(5)].map((_, index) => (
                  <Star
                    aria-hidden="true"
                    key={index}
                    size={15}
                    fill="currentColor"
                  />
                ))}
              </div>

              <p className="text-[22px] font-black leading-tight text-[#071B2D]">
                Vacanță liniștită, exact cum ar trebui să fie la mare.
              </p>

              <a
                href="#contact"
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#071B2D] px-5 py-3 text-xs font-black text-white shadow-xl transition-[transform,background-color] hover:-translate-y-1 hover:bg-[#0F4C81]"
              >
                Cere disponibilitate
              </a>
            </div>

            <div className="mt-4 grid gap-3">
              {sideBenefits.map((item) => (
                <BenefitPill key={item.title} item={item} />
              ))}
            </div>
          </aside>

          <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ApartmentCard
              apartment={featuredApartment}
              featured
              className="md:col-span-2 xl:row-span-2"
            />

            {otherApartments.map((apartment) => (
              <ApartmentCard
                key={apartment.slug}
                apartment={apartment}
              />
            ))}
          </div>
        </div>

        <div className="mx-auto mt-8 grid max-w-5xl gap-4 rounded-[1.7rem] bg-[#071B2D] p-4 text-white shadow-[0_22px_60px_rgba(7,27,45,0.18)] md:grid-cols-3">
          {bottomBenefits.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center gap-3 rounded-[1.2rem] bg-white/[0.07] p-4 md:border-r md:border-white/10 md:last:border-r-0"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#158F91] shadow-md">
                  <Icon aria-hidden="true" size={19} />
                </div>

                <div>
                  <p className="text-[13px] font-black text-white">
                    {item.title}
                  </p>

                  <p className="text-[12px] text-white/70">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}