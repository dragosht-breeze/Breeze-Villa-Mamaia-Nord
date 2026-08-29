import type { Metadata } from "next";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import ApartmentGallery from "@/components/apartments/ApartmentGallery";
import BookingCard from "@/components/apartments/BookingCard";

import {
  apartments,
  getApartmentBySlug,
  getApartmentGallery,
  type Apartment,
} from "@/data/apartments";

import { getEffectiveAvailabilityDays } from "@/lib/rates/service";

type ApartmentPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://breezevilla.ro";

function getAbsoluteUrl(path: string) {
  return new URL(encodeURI(path), `${siteUrl}/`).toString();
}

function getSeoDescription(apartment: Apartment) {
  return `${apartment.title} în Mamaia Nord, la Breeze Villa: ${apartment.surface} mp, capacitate de până la ${apartment.guests} persoane, ${apartment.view.toLowerCase()}, piscină și rezervare directă.`;
}

export function generateStaticParams() {
  return apartments.map((apartment) => ({
    slug: apartment.slug,
  }));
}

export async function generateMetadata({
  params,
}: ApartmentPageProps): Promise<Metadata> {
  const { slug } = await params;

  const apartment = getApartmentBySlug(slug);

  if (!apartment) {
    return {
      title: "Apartament indisponibil",
      description:
        "Apartamentul solicitat nu este disponibil în oferta Breeze Villa Mamaia Nord.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalPath = `/apartamente/${apartment.slug}`;
  const description = getSeoDescription(apartment);
  const coverImageUrl = getAbsoluteUrl(apartment.coverImage);

  return {
    title: `${apartment.title} în Mamaia Nord`,

    description,

    keywords: [
      `${apartment.title} Mamaia Nord`,
      `${apartment.title} Mamaia Sat`,
      `${apartment.roomsLabel} Mamaia Nord`,
      `${apartment.roomsLabel} Mamaia Sat`,
      `apartament ${apartment.surface} mp Mamaia Nord`,
      `cazare ${apartment.guests} persoane Mamaia Nord`,
      "cazare Breeze Villa",
      "apartamente Breeze Villa Mamaia Nord",
      "cazare cu piscină Mamaia Nord",
      "cazare pentru familii Mamaia Nord",
      "cazare Mamaia Sat",
      "apartamente Mamaia Sat",
    ],

    alternates: {
      canonical: canonicalPath,
      languages: {
        "ro-RO": canonicalPath,
      },
    },

    openGraph: {
      type: "website",
      locale: "ro_RO",
      url: canonicalPath,
      siteName: "Breeze Villa Mamaia Nord",
      title: `${apartment.title} | Breeze Villa Mamaia Nord`,
      description,
      images: [
        {
          url: coverImageUrl,
          alt: `${apartment.title} la Breeze Villa Mamaia Nord`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${apartment.title} | Breeze Villa Mamaia Nord`,
      description,
      images: [coverImageUrl],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

function createApartmentJsonLd(apartment: Apartment, images: string[]) {
  const apartmentUrl = `${siteUrl}/apartamente/${apartment.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Accommodation",
    "@id": `${apartmentUrl}/#accommodation`,

    name: `${apartment.title} – Breeze Villa Mamaia Nord`,
    description: apartment.description,
    url: apartmentUrl,

    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": apartmentUrl,
    },

    image: [
      getAbsoluteUrl(apartment.coverImage),
      ...images.map((image) => getAbsoluteUrl(image)),
    ],

    identifier: apartment.id,

    numberOfBedrooms: apartment.bedrooms,

    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: apartment.guests,
      unitText: "persoane",
    },

    floorSize: {
      "@type": "QuantitativeValue",
      value: apartment.surface,
      unitCode: "MTK",
      unitText: "metri pătrați",
    },

    accommodationFloorPlan: {
      "@type": "FloorPlan",
      name: apartment.roomsLabel,
      numberOfRooms: apartment.roomsLabel,
    },

    amenityFeature: apartment.amenities.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity,
      value: true,
    })),

    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Etaj",
        value: apartment.floor,
      },
      {
        "@type": "PropertyValue",
        name: "Priveliște",
        value: apartment.view,
      },
      {
        "@type": "PropertyValue",
        name: "Capacitate maximă",
        value: `${apartment.guests} persoane`,
      },
      {
        "@type": "PropertyValue",
        name: "Suprafață",
        value: `${apartment.surface} mp`,
      },
    ],

    isPartOf: {
      "@type": "LodgingBusiness",
      "@id": `${siteUrl}/#breeze-villa`,
      name: "Breeze Villa Mamaia Nord",
      url: siteUrl,
      telephone: "+40723253405",
      email: "dragosht@yahoo.com",

      address: {
        "@type": "PostalAddress",
        streetAddress: "Strada C2, nr. 37",
        addressLocality: "Năvodari",
        addressRegion: "Constanța",
        postalCode: "905701",
        addressCountry: "RO",
      },

      geo: {
        "@type": "GeoCoordinates",
        latitude: 44.29479137620329,
        longitude: 28.617728027051683,
      },

      areaServed: [
        {
          "@type": "Place",
          name: "Mamaia Nord",
        },
        {
          "@type": "Place",
          name: "Mamaia Sat",
        },
      ],
    },
  };
}

export default async function ApartmentPage({
  params,
}: ApartmentPageProps) {
  const { slug } = await params;

  const apartment = getApartmentBySlug(slug);

  if (!apartment) {
    notFound();
  }

  const images = getApartmentGallery(apartment);

  const availabilityDays = await getEffectiveAvailabilityDays(
    apartment.slug
  );

  const apartmentJsonLd = createApartmentJsonLd(apartment, images);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(apartmentJsonLd).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      <main className="min-h-screen bg-[#FAFAF7]">
        <section className="bg-white px-6 py-5">
          <div className="mx-auto max-w-7xl">
            <Link
              href="/#apartamente"
              className="inline-flex rounded-full bg-[#E9F8F8] px-5 py-2 text-sm font-black text-[#071B2D] transition hover:bg-[#D9B56D]"
            >
              ← Înapoi la apartamente
            </Link>
          </div>
        </section>

        <section className="relative min-h-[72vh] overflow-hidden">
          <Image
            src={apartment.coverImage}
            alt={`${apartment.title} la Breeze Villa Mamaia Nord`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#071B2D]/95 via-[#071B2D]/55 to-[#071B2D]/25" />

          <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-end px-6 pb-14 pt-24 text-white">
            <p className="mb-4 text-[11px] font-black uppercase tracking-[0.45em] text-[#D9B56D]">
              Breeze Villa Mamaia Nord
            </p>

            <h1 className="max-w-4xl text-[38px] font-black leading-tight md:text-[62px]">
              {apartment.title}
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/90">
              {apartment.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/15 px-5 py-3 text-sm font-bold backdrop-blur">
                👥 {apartment.guests} persoane
              </span>

              <span className="rounded-full bg-white/15 px-5 py-3 text-sm font-bold backdrop-blur">
                📐 {apartment.surface} mp
              </span>

              <span className="rounded-full bg-white/15 px-5 py-3 text-sm font-bold backdrop-blur">
                🛏 {apartment.roomsLabel}
              </span>

              <span className="rounded-full bg-white/15 px-5 py-3 text-sm font-bold backdrop-blur">
                🏢 {apartment.floor}
              </span>

              <span className="rounded-full bg-white/15 px-5 py-3 text-sm font-bold backdrop-blur">
                🌅 {apartment.view}
              </span>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_420px]">
          <div>
            <div className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(7,27,45,0.08)]">
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#158F91]">
                Descriere
              </p>

              <h2 className="mt-4 text-3xl font-black text-[#071B2D]">
                Confort pentru întreaga familie
              </h2>

              <p className="mt-5 text-lg leading-8 text-gray-600">
                {apartment.description}
              </p>
            </div>

            <div className="mt-8 rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(7,27,45,0.08)]">
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#158F91]">
                Facilități
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {apartment.amenities.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl bg-[#E9F8F8] px-5 py-4 font-bold text-[#071B2D]"
                  >
                    ✓ {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <BookingCard
            title={apartment.title}
            slug={apartment.slug}
            days={availabilityDays}
          />
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="mb-10">
            <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#158F91]">
              Galerie
            </p>

            <h2 className="mt-4 text-3xl font-black text-[#071B2D]">
              Fotografii
            </h2>
          </div>

          <ApartmentGallery
            images={images}
            title={apartment.title}
          />
        </section>
      </main>
    </>
  );
}