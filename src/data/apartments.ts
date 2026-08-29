export type Apartment = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  badge: string;
  category: string;
  guests: number;
  bedrooms: number;
  roomsLabel: string;
  surface: number;
  floor: string;
  view: string;
  rating: string;
  featured?: boolean;
  coverImage: string;
  galleryPath: string;
  galleryImages: string[];
  description: string;
  highlights: string[];
  amenities: string[];
};

function generateGalleryImages(count: number) {
  return Array.from({ length: count }, (_, index) =>
    `${String(index + 1).padStart(2, "0")}.jpg`
  );
}

export const apartments: Apartment[] = [
  {
    id: "apartament-3-premium",
    slug: "apartament-3-premium",
    title: "Apartament 3 camere Premium",
    shortTitle: "3 camere Premium",
    badge: "Apartamentul vedetă",
    category: "Apartamente",
    guests: 6,
    bedrooms: 2,
    roomsLabel: "3 camere",
    surface: 90,
    floor: "Etaj 3",
    view: "Vedere curte și mare",
    rating: "9.7",
    featured: true,
    coverImage: "/images/apartments/apartament-3.jpg",
    galleryPath: "/images/apartments/Apartament 3 camere Premium",
    galleryImages: generateGalleryImages(11),
    description:
      "Apartament spațios și luminos, ideal pentru familii sau grupuri care își doresc confort, intimitate și o atmosferă premium aproape de mare.",
    highlights: ["Terasă spațioasă", "Ideal pentru familii", "Living generos", "Vedere frumoasă"],
    amenities: ["Wi-Fi", "Aer condiționat", "Bucătărie utilată", "TV", "Baie privată", "Terasă"],
  },
  {
    id: "apartament-superior",
    slug: "apartament-superior",
    title: "Apartament 2 camere Superior",
    shortTitle: "Superior 110 mp",
    badge: "Cel mai spațios",
    category: "Apartamente",
    guests: 4,
    bedrooms: 1,
    roomsLabel: "2 camere",
    surface: 110,
    floor: "Parter",
    view: "Vedere curte",
    rating: "9.7",
    coverImage: "/images/apartments/apartament-superior.jpg",
    galleryPath: "/images/apartments/Apartament Superior",
    galleryImages: generateGalleryImages(10),
    description:
      "Un apartament foarte generos, cu spații largi și acces facil, potrivit pentru familii care vor mai mult confort și mai multă libertate.",
    highlights: ["110 mp", "Parter", "Spațiu generos", "Foarte confortabil"],
    amenities: ["Wi-Fi", "Aer condiționat", "Bucătărie utilată", "TV", "Baie privată", "Terasă"],
  },
  {
    id: "apartament-3-etaj-2",
    slug: "apartament-3-etaj-2",
    title: "Apartament 3 camere – Etaj 2",
    shortTitle: "3 camere Etaj 2",
    badge: "Vedere piscină",
    category: "Apartamente",
    guests: 6,
    bedrooms: 2,
    roomsLabel: "3 camere",
    surface: 90,
    floor: "Etaj 2",
    view: "Vedere piscină",
    rating: "9.6",
    coverImage: "/images/apartments/apartament-3-etaj-2.jpg",
    galleryPath: "/images/apartments/Apartament 3 camere Etaj 2",
    galleryImages: generateGalleryImages(7),
    description:
      "Apartament luminos, potrivit pentru familii cu copii, cu vedere spre zona de piscină și acces rapid la facilitățile Breeze Villa.",
    highlights: ["Vedere piscină", "Potrivit pentru familii", "Spațiu luminos", "Confort ridicat"],
    amenities: ["Wi-Fi", "Aer condiționat", "Bucătărie utilată", "TV", "Baie privată", "Terasă"],
  },
  {
    id: "apartament-3-etaj-1",
    slug: "apartament-3-etaj-1",
    title: "Apartament 3 camere – Etaj 1",
    shortTitle: "3 camere Etaj 1",
    badge: "Vedere curte",
    category: "Apartamente",
    guests: 6,
    bedrooms: 2,
    roomsLabel: "3 camere",
    surface: 100,
    floor: "Etaj 1",
    view: "Vedere curte",
    rating: "9.5",
    coverImage: "/images/apartments/apartament-3-etaj-1.jpg",
    galleryPath: "/images/apartments/Apartament 3 camere Etaj 1",
    galleryImages: generateGalleryImages(9),
    description:
      "Apartament generos, cu vedere spre curte, ideal pentru o vacanță liniștită alături de familie sau prieteni.",
    highlights: ["100 mp", "Vedere curte", "Liniște", "Ideal pentru familii"],
    amenities: ["Wi-Fi", "Aer condiționat", "Bucătărie utilată", "TV", "Baie privată", "Terasă"],
  },
  {
    id: "apartament-2-etaj-3",
    slug: "apartament-2-etaj-3",
    title: "Apartament 2 camere – Etaj 3",
    shortTitle: "2 camere Etaj 3",
    badge: "Vedere piscină",
    category: "Apartamente",
    guests: 4,
    bedrooms: 1,
    roomsLabel: "2 camere",
    surface: 75,
    floor: "Etaj 3",
    view: "Vedere piscină",
    rating: "9.5",
    coverImage: "/images/apartments/apartament-2-etaj-3.jpg",
    galleryPath: "/images/apartments/Apartament 2 camere Etaj 3",
    galleryImages: generateGalleryImages(7),
    description:
      "Apartament elegant cu două camere, perfect pentru familii mici sau cupluri care vor confort și vedere spre zona de piscină.",
    highlights: ["Vedere piscină", "Etaj superior", "Confortabil", "Terasă"],
    amenities: ["Wi-Fi", "Aer condiționat", "Bucătărie utilată", "TV", "Baie privată", "Terasă"],
  },
  {
    id: "apartament-2",
    slug: "apartament-2",
    title: "Apartament 2 camere",
    shortTitle: "2 camere",
    badge: "Family Choice",
    category: "Apartamente",
    guests: 4,
    bedrooms: 1,
    roomsLabel: "2 camere",
    surface: 73,
    floor: "Etaj 1",
    view: "Vedere piscină",
    rating: "9.5",
    coverImage: "/images/apartments/apartament-2.jpg",
    galleryPath: "/images/apartments/Apartament 2 camere",
    galleryImages: generateGalleryImages(8),
    description:
      "Apartament confortabil, potrivit pentru familii cu copii, cu dotări moderne și atmosferă relaxantă de vacanță.",
    highlights: ["Family friendly", "Vedere piscină", "Spațiu practic", "Confort"],
    amenities: ["Wi-Fi", "Aer condiționat", "Bucătărie utilată", "TV", "Baie privată", "Terasă"],
  },
  {
    id: "studio",
    slug: "studio",
    title: "Studio",
    shortTitle: "Studio",
    badge: "Cupluri",
    category: "Studio",
    guests: 2,
    bedrooms: 1,
    roomsLabel: "Studio",
    surface: 42,
    floor: "Parter",
    view: "Spre piscină",
    rating: "9.4",
    coverImage: "/images/apartments/studio.jpg",
    galleryPath: "/images/apartments/Studio",
    galleryImages: generateGalleryImages(5),
    description:
      "Studio cochet și bine organizat, ideal pentru cupluri sau pentru o escapadă relaxantă la mare.",
    highlights: ["Parter", "Ideal pentru cupluri", "Acces facil", "Confortabil"],
    amenities: ["Wi-Fi", "Aer condiționat", "Chicinetă", "TV", "Baie privată", "Terasă"],
  },
];

export function getApartmentBySlug(slug: string) {
  return apartments.find((apartment) => apartment.slug === slug);
}

export function getApartmentGallery(apartment: Apartment) {
  return apartment.galleryImages.map((image) => `${apartment.galleryPath}/${image}`);
}