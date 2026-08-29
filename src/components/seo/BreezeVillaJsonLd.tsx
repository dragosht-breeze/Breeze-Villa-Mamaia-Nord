const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://breezevilla.ro";

const breezeVillaJsonLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "@id": `${siteUrl}/#breeze-villa`,
  name: "Breeze Villa Mamaia Nord",
  alternateName: [
    "Breeze Villa",
    "Breeze Villa Mamaia Sat",
  ],
  description:
    "Breeze Villa Mamaia Nord oferă apartamente și studiouri spațioase pentru familii, piscină, terase, Wi-Fi și facilități pentru o vacanță relaxantă aproape de mare.",
  url: siteUrl,
  logo: `${siteUrl}/branding/breeze-villa-logo.png`,
  telephone: "+40723253405",
  email: "dragosht@yahoo.com",
  checkinTime: "15:00",
  checkoutTime: "10:00",
  currenciesAccepted: "RON",
  paymentAccepted:
    "Card bancar, numerar, transfer bancar, Edenred, Pluxee, Up România",
  priceRange: "$$",

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

  hasMap:
    "https://www.google.com/maps/search/?api=1&query=44.29479137620329%2C28.617728027051683",

  areaServed: [
    {
      "@type": "Place",
      name: "Mamaia Nord",
    },
    {
      "@type": "Place",
      name: "Mamaia Sat",
    },
    {
      "@type": "City",
      name: "Năvodari",
    },
  ],

  sameAs: [
    "https://www.facebook.com/breezvilla/?locale=ro_RO",
    "https://www.instagram.com/breeze_villa_mamaianord/",
    "https://www.tiktok.com/@breezevillamamaianord",
  ],

  image: [
    `${siteUrl}/images/apartments/apartament-3.jpg`,
    `${siteUrl}/images/apartments/apartament-superior.jpg`,
    `${siteUrl}/images/apartments/apartament-3-etaj-2.jpg`,
    `${siteUrl}/images/apartments/apartament-3-etaj-1.jpg`,
    `${siteUrl}/images/apartments/apartament-2-etaj-3.jpg`,
    `${siteUrl}/images/apartments/apartament-2.jpg`,
    `${siteUrl}/images/apartments/studio.jpg`,
  ],

  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+40723253405",
    contactType: "reservations",
    availableLanguage: ["Romanian", "English"],
  },

  amenityFeature: [
    {
      "@type": "LocationFeatureSpecification",
      name: "Piscină",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Wi-Fi",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Aer condiționat",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Bucătărie utilată",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Terase",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Potrivit pentru familii cu copii",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Loc de joacă",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Zonă pentru grătar",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Spații verzi",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Parcare privată",
      value: true,
    },
  ],

  containsPlace: [
    {
      "@type": "Accommodation",
      name: "Studio Breeze Villa Mamaia Nord",
      occupancy: {
        "@type": "QuantitativeValue",
        maxValue: 2,
      },
    },
    {
      "@type": "Accommodation",
      name: "Apartament 2 camere Breeze Villa Mamaia Nord",
      occupancy: {
        "@type": "QuantitativeValue",
        maxValue: 4,
      },
    },
    {
      "@type": "Accommodation",
      name: "Apartament 3 camere Breeze Villa Mamaia Nord",
      occupancy: {
        "@type": "QuantitativeValue",
        maxValue: 6,
      },
    },
  ],

  knowsLanguage: ["ro", "en"],
};

export default function BreezeVillaJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breezeVillaJsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
