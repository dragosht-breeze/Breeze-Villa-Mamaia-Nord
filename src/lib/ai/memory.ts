import type { SalesSession } from "@/lib/ai/brain/types";
import type { AiLeadRecord } from "@/lib/ai/leads/types";

function mergeChildAges(current: number[], previous: number[]) {
  return current.length > 0 ? current : previous;
}

export function mergeSalesMemory(
  current: SalesSession,
  previous?: AiLeadRecord | null
): SalesSession {
  if (!previous) return current;

  const remembered = previous.sales;

  return {
    ...current,
    adults: current.adults ?? remembered.adults,
    childAges: mergeChildAges(
      current.childAges,
      remembered.childAges
    ),
    checkIn: current.checkIn ?? remembered.checkIn,
    checkOut: current.checkOut ?? remembered.checkOut,
    preferredApartment:
      current.preferredApartment ?? remembered.preferredApartment,
    budget: current.budget ?? remembered.budget,
    profile:
      current.profile === "unknown"
        ? remembered.profile
        : current.profile,
    hasLiveAvailability:
      current.hasLiveAvailability || remembered.hasLiveAvailability,
    leadScore: Math.max(current.leadScore, remembered.leadScore),
  };
}

export function buildMemoryContext(previous?: AiLeadRecord | null) {
  if (!previous) {
    return `MEMORIE CLIENT
- Nu există informații anterioare pentru această conversație.`;
  }

  const recommendation =
    previous.availability?.recommendations[0];

  const apartmentNames = recommendation
    ? recommendation.apartments
        .map((apartment) => apartment.shortTitle)
        .join(" + ")
    : previous.sales.preferredApartment ?? "necunoscut";

  const recentUserMessages = previous.messages
    .filter((message) => message.role === "user")
    .slice(-3)
    .map((message) => `- ${message.content}`)
    .join("\n");

  return `MEMORIE CLIENT
- Vizitator recurent în aceeași conversație: da.
- Ultima activitate: ${previous.updatedAt}.
- Status CRM: ${previous.status}.
- Profil anterior: ${previous.sales.profile}.
- Adulți cunoscuți: ${previous.sales.adults ?? "necunoscut"}.
- Vârste copii cunoscute: ${
    previous.sales.childAges.length > 0
      ? previous.sales.childAges.join(", ")
      : "necunoscute sau fără copii"
  }.
- Perioadă căutată anterior: ${
    previous.sales.checkIn && previous.sales.checkOut
      ? `${previous.sales.checkIn} → ${previous.sales.checkOut}`
      : "necunoscută"
  }.
- Apartament preferat/recomandat anterior: ${apartmentNames}.
- Buget cunoscut: ${
    previous.sales.budget
      ? `${previous.sales.budget} lei`
      : "necunoscut"
  }.
- Scor anterior de interes: ${previous.sales.leadScore}/100.
- Ultimele mesaje ale clientului:
${recentUserMessages || "- Nu există mesaje anterioare."}

REGULI DE FOLOSIRE A MEMORIEI
- Folosește informațiile memorate numai când sunt relevante.
- Nu enumera memoria internă și nu menționa scorul sau statusul CRM.
- Dacă utilizatorul spune că a revenit, poți confirma natural că îți amintești perioada sau componența grupului.
- Nu presupune că disponibilitatea veche este încă valabilă; verifică din nou prin funcția live înainte de a confirma.
- Dacă informația actuală diferă de cea memorată, informația actuală are prioritate.`;
}
