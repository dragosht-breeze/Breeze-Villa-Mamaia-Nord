import type { LocalRecommendation } from "@/lib/ai/concierge-types";

export type LocalGuideCategory = LocalRecommendation["category"];

export type LocalGuidePlace = LocalRecommendation & {
  id: string;
  tags: string[];
  familyFriendly?: boolean;
  walkingMinutes?: number;
  drivingMinutes?: number;
  mapsUrl: string;
};

function googleMapsSearch(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const breezeLocalGuide: LocalGuidePlace[] = [
  {
    id: "mamaia-nord-beach",
    name: "Plaja Mamaia Nord",
    category: "beach",
    description:
      "Opțiunea cea mai apropiată pentru plajă și răsărit. Pentru familii, este bine să fie aleasă o zonă cu intrare lină în apă, salvamar și acces comod la toaletă.",
    tags: ["plajă", "răsărit", "copii", "aproape"],
    familyFriendly: true,
    walkingMinutes: 10,
    mapsUrl: googleMapsSearch("Plaja Mamaia Nord Năvodari"),
    caution:
      "Condițiile mării, locurile de parcare și disponibilitatea șezlongurilor trebuie verificate în ziua deplasării.",
  },
  {
    id: "kaufland-mamaia-nord",
    name: "Kaufland Mamaia Nord",
    category: "shopping",
    description: "Potrivit pentru cumpărături mai mari și produse pentru sejur.",
    address: "Strada Hanului nr. 1, Năvodari",
    tags: ["supermarket", "cumpărături", "aproape", "familie"],
    familyFriendly: true,
    walkingMinutes: 10,
    drivingMinutes: 3,
    mapsUrl: googleMapsSearch("Kaufland Mamaia Nord Strada Hanului 1"),
    caution: "Programul trebuie verificat înainte de plecare.",
  },
  {
    id: "minifarm-hanul-piratilor",
    name: "Farmacia Minifarm «Hanul Piraților»",
    category: "pharmacy",
    description: "Opțiune cunoscută în zonă pentru produse farmaceutice uzuale.",
    address: "Bulevardul Mamaia Nord nr. 26A, Năvodari",
    phone: "0726 708 586",
    publishedSchedule: "Zilnic 08:00–24:00",
    tags: ["farmacie", "medical", "aproape"],
    drivingMinutes: 5,
    mapsUrl: googleMapsSearch("Minifarm Hanul Piraților Mamaia Nord 26A"),
    caution: "Programul publicat trebuie verificat înainte de deplasare.",
  },
  {
    id: "pescaria-nava",
    name: "Pescaria Nava",
    category: "restaurant",
    description: "Opțiune cunoscută pentru pește și fructe de mare.",
    tags: ["pește", "fructe de mare", "restaurant", "familie"],
    familyFriendly: true,
    mapsUrl: googleMapsSearch("Pescaria Nava Mamaia Nord"),
    caution: "Meniul, programul și disponibilitatea trebuie verificate direct.",
  },
  {
    id: "nikos-greek-taverna",
    name: "Nikos Greek Taverna",
    category: "restaurant",
    description: "Opțiune cu specific grecesc, potrivită pentru o masă relaxată.",
    tags: ["grecesc", "restaurant", "cuplu", "familie"],
    familyFriendly: true,
    mapsUrl: googleMapsSearch("Nikos Greek Taverna Mamaia Nord"),
    caution: "Meniul, programul și disponibilitatea trebuie verificate direct.",
  },
  {
    id: "musset-resto-lounge",
    name: "Musset Resto & Lounge",
    category: "restaurant",
    description: "Opțiune populară pentru masă în familie sau o ieșire relaxată.",
    tags: ["restaurant", "familie", "cină"],
    familyFriendly: true,
    mapsUrl: googleMapsSearch("Musset Resto Lounge Mamaia Nord"),
    caution: "Meniul, programul și disponibilitatea trebuie verificate direct.",
  },
  {
    id: "zumma-restaurant",
    name: "Zumma Restaurant",
    category: "restaurant",
    description: "Opțiune cu specific mediteranean.",
    tags: ["mediteranean", "restaurant", "cuplu"],
    mapsUrl: googleMapsSearch("Zumma Restaurant Mamaia Nord"),
    caution: "Meniul, programul și disponibilitatea trebuie verificate direct.",
  },
  {
    id: "shore-house-pub",
    name: "The Shore House Pub",
    category: "restaurant",
    description: "Poate fi potrivit pentru o masă relaxată în familie.",
    tags: ["pub", "restaurant", "familie"],
    familyFriendly: true,
    mapsUrl: googleMapsSearch("The Shore House Pub Mamaia Nord"),
    caution: "Meniul, programul și disponibilitatea trebuie verificate direct.",
  },
  {
    id: "aqua-magic",
    name: "Aqua Magic Mamaia",
    category: "activity",
    description: "Atracție acvatică pentru familii, inclusiv zone pentru copii.",
    tags: ["copii", "aqua park", "familie", "activitate"],
    familyFriendly: true,
    mapsUrl: googleMapsSearch("Aqua Magic Mamaia"),
    caution: "Programul sezonier și biletele trebuie verificate înainte.",
  },
  {
    id: "delfinariu-constanta",
    name: "Delfinariul Constanța",
    category: "activity",
    description: "Activitate potrivită pentru familii și pentru zilele mai puțin bune de plajă.",
    address: "Bulevardul Mamaia nr. 255, Constanța",
    tags: ["copii", "indoor", "familie", "ploaie"],
    familyFriendly: true,
    mapsUrl: googleMapsSearch("Delfinariul Constanța Bulevardul Mamaia 255"),
    caution: "Programul și biletele trebuie verificate înainte.",
  },
  {
    id: "city-park-mall",
    name: "City Park Mall Constanța",
    category: "shopping",
    description: "Variantă utilă pentru cumpărături, masă și timp petrecut în interior.",
    address: "Bulevardul Alexandru Lăpușneanu nr. 116C, Constanța",
    tags: ["mall", "indoor", "ploaie", "cumpărături"],
    familyFriendly: true,
    mapsUrl: googleMapsSearch("City Park Mall Constanța"),
    caution: "Programul magazinelor poate varia.",
  },
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function findLocalGuidePlaces(query: string, limit = 3) {
  const normalizedQuery = normalize(query);
  const terms = normalizedQuery.split(/\s+/).filter((term) => term.length > 2);

  return breezeLocalGuide
    .map((place) => {
      const haystack = normalize(
        [place.name, place.category, place.description, place.address, ...place.tags]
          .filter(Boolean)
          .join(" ")
      );
      const score = terms.reduce(
        (total, term) => total + (haystack.includes(term) ? 1 : 0),
        0
      );
      return { place, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ place }) => place);
}

export function buildLocalGuideContext() {
  const places = breezeLocalGuide
    .map((place, index) => {
      const travel = [
        place.walkingMinutes ? `${place.walkingMinutes} min pe jos` : "",
        place.drivingMinutes ? `${place.drivingMinutes} min cu mașina` : "",
      ]
        .filter(Boolean)
        .join(", ");

      return `${index + 1}. ${place.name} [${place.category}]
- ${place.description}
${place.address ? `- Adresă: ${place.address}\n` : ""}${travel ? `- Timp orientativ: ${travel}.\n` : ""}- Google Maps: ${place.mapsUrl}
- Etichete: ${place.tags.join(", ")}.
${place.caution ? `- Atenție: ${place.caution}` : ""}`;
    })
    .join("\n\n");

  return `GHID LOCAL INTERACTIV
${places}

REGULI DE PREZENTARE
- Oferă maximum 3 locuri, cel mai potrivit primul.
- Pentru fiecare loc recomandat, include linkul exact Google Maps din baza de mai sus.
- Pe website, scrie linkul în format Markdown: [Deschide în Google Maps](URL).
- Pe Messenger/WhatsApp/Instagram, poți afișa URL-ul complet pentru a rămâne accesibil.
- Timpurile de mers sunt orientative, nu promisiuni; traficul și traseul trebuie verificate live.
- Nu inventa ratinguri, program, distanțe sau adrese care nu apar în bază.`;
}
