import type { BreezeConciergeKnowledge } from "@/lib/ai/concierge-types";
import { breezeLocalGuide } from "@/lib/ai/local-guide";

export const breezeConciergeKnowledge: BreezeConciergeKnowledge = {
  identity: {
    publicName: "Breeze Villa Mamaia Nord",
    propertyType:
      "Proprietate de cazare cu studiouri și apartamente, orientată în special către familii cu copii.",
    address: "Strada C2 nr. 37, Mamaia Nord, Năvodari, județul Constanța",
    postalCode: "905701",
    coordinates: {
      latitude: 44.29479137620329,
      longitude: 28.617728027051683,
    },
    contact: {
      phone: "0723 253 405",
      whatsapp: "0723 253 405",
      email: "dragosht@yahoo.com",
      website: "https://breezevilla.ro",
      bookingUrl: "https://breezevilla.ro/rezervare",
    },
  },
  positioning: [
    "Apartamente și studiouri spațioase, potrivite în special pentru familii cu copii.",
    "Atmosferă liniștită, curte, piscină, spații verzi și loc de joacă.",
    "Plaja este la aproximativ 600 m, circa 10 minute pe jos pe traseul scurt recomandat.",
    "Kaufland Mamaia Nord este la aproximativ 500 m, circa 10 minute pe jos.",
    "Parcarea este disponibilă în incinta proprietății.",
    "Rezervarea directă se face fără comision de platformă.",
  ],
  apartments: [
    {
      slug: "studio",
      name: "Studio",
      surface: 42,
      floor: "Parter",
      capacity: 2,
      description: "Potrivit pentru un cuplu sau două persoane.",
    },
    {
      slug: "apartament-2-camere",
      name: "Apartament 2 camere",
      surface: 73,
      floor: "Etajul 1",
      capacity: 4,
      description: "Potrivit pentru familii mici sau cupluri care vor mai mult spațiu.",
    },
    {
      slug: "apartament-2-camere-etaj-3",
      name: "Apartament 2 camere – Etaj 3",
      surface: 75,
      floor: "Etajul 3",
      capacity: 4,
      description: "Potrivit pentru familii mici sau cupluri.",
    },
    {
      slug: "apartament-2-camere-superior",
      name: "Apartament 2 camere Superior",
      surface: 110,
      floor: "Parter",
      capacity: 4,
      description:
        "Cea mai spațioasă unitate cu 2 camere, potrivită familiilor care apreciază spațiul și accesul comod la parter.",
    },
    {
      slug: "apartament-3-camere-etaj-1",
      name: "Apartament 3 camere – Etaj 1",
      surface: 100,
      floor: "Etajul 1",
      capacity: 6,
      description: "Potrivit pentru familii mai numeroase sau grupuri.",
    },
    {
      slug: "apartament-3-camere-etaj-2",
      name: "Apartament 3 camere – Etaj 2",
      surface: 90,
      floor: "Etajul 2",
      capacity: 6,
      description: "Potrivit pentru familii mai numeroase sau grupuri.",
    },
    {
      slug: "apartament-3-camere-premium",
      name: "Apartament 3 camere Premium",
      surface: 90,
      floor: "Etajul 3",
      capacity: 6,
      description: "Potrivit pentru familii mai numeroase sau grupuri.",
    },
  ],
  facilities: [
    "Piscină exterioară la locație.",
    "Curte și spații verzi.",
    "Loc de joacă pentru copii.",
    "Zonă pentru grătar.",
    "Parcare în incintă.",
    "Wi-Fi.",
    "Aer condiționat.",
    "Bucătării sau chicinete utilate, în funcție de unitate.",
    "Terase.",
    "Băi private.",
  ],
  policies: [
    {
      title: "Check-in și check-out",
      facts: [
        "Check-in începând cu ora 15:00.",
        "După ora 18:00 este disponibil self check-in pe baza instrucțiunilor trimise de proprietate.",
        "Check-out între orele 09:00 și 10:00.",
        "Early check-in și late check-out depind de disponibilitate și pot avea cost suplimentar.",
      ],
      requiresOwnerConfirmation: true,
    },
    {
      title: "Rezervare și plată",
      facts: [
        "Rezervarea directă se face prin motorul de rezervare al site-ului sau prin contact direct.",
        "Perioada se blochează după confirmarea avansului.",
        "Cererile cu avans sunt valabile 48 de ore.",
        "Avansul standard este 30%, dar poate exista și condiția unui minimum de o noapte.",
        "Se poate plăti integral online sau prin avans, în funcție de opțiunea disponibilă.",
        "Sunt acceptate carduri de vacanță Edenred, Pluxee și UP România.",
        "Pentru cardurile de vacanță, plata se poate organiza prin link de plată.",
      ],
      requiresOwnerConfirmation: true,
    },
    {
      title: "Anulare",
      facts: [
        "Sumele achitate sunt, în mod obișnuit, nerambursabile.",
        "Clientul poate trimite o solicitare de anulare gratuită.",
        "Aprobarea este la discreția proprietății.",
        "Dacă o rambursare este aprobată, aceasta se face pe aceeași cale de plată.",
      ],
      requiresOwnerConfirmation: true,
    },
  ],
  localGuide: breezeLocalGuide,
  safetyRules: [
    "Aerul condiționat poate fi folosit când oaspeții sunt în apartament și geamurile sunt închise.",
    "Aerul condiționat nu trebuie lăsat pornit la părăsirea apartamentului.",
    "Orele de odihnă trebuie respectate.",
    "În zona piscinei nu se intră cu alimente și băuturi, cu excepția regulilor comunicate la locație.",
    "Nu inventa informații despre animale de companie, piscină încălzită, reduceri sau facilități nemenționate.",
  ],
  liveDataRules: [
    "Disponibilitatea și prețurile se verifică exclusiv prin funcția internă check_live_availability.",
    "Nu comunica disponibilitate sau tarif fără rezultat live.",
    "Programele, prețurile și disponibilitatea localurilor se pot schimba și trebuie verificate înainte.",
    "Nu afirma că un loc este deschis acum fără o sursă live.",
  ],
};

function lines(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function buildBreezeKnowledgeContext() {
  const kb = breezeConciergeKnowledge;

  const apartments = kb.apartments
    .map(
      (apartment, index) => `${index + 1}. ${apartment.name}
- ${apartment.surface} mp, ${apartment.floor}.
- Capacitate maximă: ${apartment.capacity} persoane.
- ${apartment.description}`
    )
    .join("\n\n");

  const policies = kb.policies
    .map(
      (policy) => `${policy.title.toUpperCase()}
${lines(policy.facts)}${
        policy.requiresOwnerConfirmation
          ? "\n- Excepțiile sau modificările trebuie confirmate de proprietate."
          : ""
      }`
    )
    .join("\n\n");

  const localGuide = kb.localGuide
    .map((item) => {
      const details = [
        item.description,
        item.address ? `Adresă: ${item.address}.` : "",
        item.phone ? `Telefon publicat: ${item.phone}.` : "",
        item.publishedSchedule
          ? `Program publicat: ${item.publishedSchedule}.`
          : "",
        item.caution ?? "",
      ].filter(Boolean);

      return `- ${item.name} (${item.category}): ${details.join(" ")}`;
    })
    .join("\n");

  return `BAZA DE CUNOȘTINȚE BREEZE VILLA

IDENTITATE
- Nume public: ${kb.identity.publicName}.
- Tip locație: ${kb.identity.propertyType}
- Adresă: ${kb.identity.address}, cod poștal ${kb.identity.postalCode}.
- Coordonate: ${kb.identity.coordinates.latitude}, ${kb.identity.coordinates.longitude}.
- Telefon și WhatsApp: ${kb.identity.contact.whatsapp}.
- E-mail: ${kb.identity.contact.email}.
- Site: ${kb.identity.contact.website}.
- Motor rezervare: ${kb.identity.contact.bookingUrl}.

POZIȚIONARE
${lines(kb.positioning)}

UNITĂȚI DE CAZARE
${apartments}

FACILITĂȚI
${lines(kb.facilities)}

${policies}

REGULI IMPORTANTE
${lines(kb.safetyRules)}

GHID LOCAL VERIFICAT INTERN
${localGuide}

REGULI PENTRU DATE LIVE
${lines(kb.liveDataRules)}`;
}
