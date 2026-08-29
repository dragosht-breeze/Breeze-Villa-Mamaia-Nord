import type { ConversationContext } from "@/lib/ai/context";
import type { SalesSession } from "@/lib/ai/brain";
import type {
  GuestPreferences,
  SmartConciergeContext,
} from "./types";

function unique(values: string[]) {
  return [...new Set(values)];
}

export function buildSmartConciergeContext(
  context: ConversationContext,
  preferences: GuestPreferences,
  session: SalesSession
): SmartConciergeContext {
  const responseStrategy: string[] = [
    "Răspunde întâi direct la întrebarea utilizatorului.",
    "Folosește cel mult o întrebare de clarificare și numai dacă schimbă recomandarea sau permite rezolvarea cererii.",
    "Nu repeta informații pe care utilizatorul le-a oferit deja.",
    "Nu transforma fiecare răspuns într-o ofertă comercială.",
  ];

  const suitableUpsells: string[] = [];

  const avoid: string[] = [
    "Nu inventa disponibilitate, prețuri, distanțe, servicii sau aprobări neconfirmate.",
    "Nu presupune detalii despre rezervarea concretă a utilizatorului.",
    "Nu împinge utilizatorul spre rezervare când solicită suport în timpul sejurului.",
  ];

  if (preferences.travelStyle === "family") {
    responseStrategy.push(
      "Prioritizează spațiul, siguranța, confortul copiilor și opțiunile family-friendly."
    );

    if (preferences.hasSmallChildren) {
      responseStrategy.push(
        "Pentru copii mici, prioritizează accesul simplu, confortul familiei și opțiunile care reduc deplasările sau complicațiile inutile."
      );
    }
  }

  if (preferences.travelStyle === "couple") {
    responseStrategy.push(
      "Pentru cuplu, evidențiază liniștea, intimitatea și confortul numai când sunt relevante întrebării."
    );
  }

  if (preferences.travelStyle === "group") {
    responseStrategy.push(
      "Pentru grup, prioritizează capacitatea reală, spațiul comun și organizarea simplă."
    );
  }

  if (preferences.wantsQuiet) {
    responseStrategy.push(
      "Prioritizează variantele liniștite și evită recomandările nepotrivite pentru un oaspete care caută liniște."
    );
  }

  if (preferences.wantsWalkableOptions) {
    responseStrategy.push(
      "Prioritizează opțiunile apropiate sau accesibile pe jos atunci când răspunzi despre zonă."
    );
  }

  if (preferences.budget) {
    responseStrategy.push(
      `Respectă bugetul declarat de aproximativ ${preferences.budget} lei și explică transparent eventualele compromisuri.`
    );
  }

  switch (context.type) {
    case "SEARCHING": {
      responseStrategy.unshift(
        "Ajută utilizatorul să ajungă rapid la variantele potrivite fără întrebări inutile."
      );

      if (
        preferences.wantsPremiumComfort ||
        preferences.travelStyle === "family"
      ) {
        suitableUpsells.push(
          "Poți menționa discret un apartament mai spațios numai dacă aduce un beneficiu clar grupului și există o variantă relevantă."
        );
      }

      break;
    }

    case "BOOKING": {
      responseStrategy.unshift(
        "Păstrează răspunsul orientat spre finalizarea rezervării și evită informațiile laterale."
      );

      if (
        preferences.wantsPremiumComfort ||
        preferences.travelStyle === "family"
      ) {
        suitableUpsells.push(
          "Poți menționa o variantă superioară numai dacă este relevantă, justificată și nu complică inutil finalizarea rezervării."
        );
      }

      break;
    }

    case "HAS_RESERVATION": {
      responseStrategy.unshift(
        "Tratează utilizatorul ca pe un oaspete care afirmă că are deja rezervare, fără să inventezi detaliile ei."
      );

      avoid.push(
        "Nu încerca să îi vinzi o rezervare nouă decât dacă utilizatorul cere explicit acest lucru."
      );

      break;
    }

    case "PRE_STAY": {
      responseStrategy.unshift(
        "Prioritizează pregătirea pentru sosire și oferă doar informațiile utile pentru următorul pas."
      );

      responseStrategy.push(
        "Dacă ora estimată de sosire nu este cunoscută și este relevantă, o poți cere o singură dată."
      );

      suitableUpsells.push(
        "Poți menționa early check-in numai dacă ora sosirii îl face relevant și precizezi clar că necesită confirmarea proprietății."
      );

      avoid.push(
        "Nu încărca răspunsul cu toate regulile proprietății dacă utilizatorul nu le-a cerut."
      );

      break;
    }

    case "CHECKING_IN": {
      responseStrategy.unshift(
        "Prioritizează sosirea, accesul, parcarea și rezolvarea rapidă a oricărei neclarități de check-in."
      );

      suitableUpsells.push(
        "Poți menționa early check-in numai dacă este relevant situației și doar ca solicitare supusă confirmării proprietății."
      );

      avoid.push(
        "Nu sugera servicii sau opțiuni care distrag de la problema imediată a sosirii."
      );

      break;
    }

    case "IN_STAY": {
      responseStrategy.unshift(
        "Prioritizează confortul oaspetelui și rezolvarea rapidă a nevoii actuale."
      );

      suitableUpsells.push(
        "Poți menționa late check-out sau prelungirea sejurului numai dacă se potrivesc natural conversației și nu există o problemă activă."
      );

      avoid.push(
        "Nu introduce recomandări comerciale într-un răspuns despre o problemă de confort, defect sau incident."
      );

      break;
    }

    case "CHECK_OUT": {
      responseStrategy.unshift(
        "Răspunde concis despre plecare și procedura de check-out."
      );

      suitableUpsells.push(
        "Poți menționa late check-out numai dacă utilizatorul întreabă despre o plecare mai târzie sau contextul îl face evident util."
      );

      avoid.push(
        "Nu oferi automat late check-out și nu inventa aprobări sau costuri."
      );

      break;
    }

    case "POST_STAY": {
      responseStrategy.unshift(
        "Tratează conversația ca fiind după sejur și rezolvă prioritar solicitarea post-sejur."
      );

      responseStrategy.push(
        "Dacă utilizatorul este spontan mulțumit, poți mulțumi și invita discret la un review."
      );

      avoid.push(
        "Nu cere review dacă utilizatorul reclamă o problemă, un obiect pierdut sau o nemulțumire."
      );

      avoid.push(
        "Nu confirma găsirea unui obiect și nu inventa verificări făcute de personal."
      );

      break;
    }

    case "SUPPORT": {
      responseStrategy.unshift(
        "Prioritizează rezolvarea problemei: recunoaște situația, oferă maximum 2 pași simpli și siguri și indică rapid contactul proprietății când este necesar."
      );

      avoid.push(
        "Nu face upsell într-o conversație de suport."
      );

      avoid.push(
        "Nu cere utilizatorului să efectueze intervenții tehnice riscante."
      );

      suitableUpsells.length = 0;

      break;
    }

    case "LOCAL_GUIDE": {
      responseStrategy.push(
        "Oferă maximum 3 recomandări locale, cea mai potrivită prima, fiecare cu un motiv scurt."
      );

      responseStrategy.push(
        "Păstrează recomandările locale legate direct de experiența oaspetelui la Breeze Villa."
      );

      avoid.push(
        "Nu transforma conversația într-un ghid turistic general."
      );

      break;
    }

    case "HUMAN_HANDOFF": {
      responseStrategy.unshift(
        "Răspunde foarte scurt și explică faptul că solicitarea necesită verificarea sau intervenția echipei Breeze Villa."
      );

      responseStrategy.push(
        "Indică WhatsApp 0723 253 405 pentru continuarea solicitării."
      );

      avoid.push(
        "Nu încerca să rezolvi prin presupuneri o situație care necesită confirmare umană."
      );

      avoid.push(
        "Nu spune că ai contactat, notificat sau trimis solicitarea către proprietar dacă sistemul nu a făcut efectiv acest lucru."
      );

      suitableUpsells.length = 0;

      break;
    }

    case "UNKNOWN":
    default: {
      break;
    }
  }

  if (
    session.hasLiveAvailability &&
    (context.type === "SEARCHING" ||
      context.type === "BOOKING")
  ) {
    responseStrategy.push(
      "Disponibilitatea live a fost verificată; prezintă recomandarea principală înaintea alternativelor."
    );
  }

  return {
    conversationContext: context.type,
    preferences,
    responseStrategy: unique(responseStrategy),
    suitableUpsells: unique(suitableUpsells),
    avoid: unique(avoid),
  };
}

export function buildSmartConciergePrompt(
  context: SmartConciergeContext
) {
  const preferences = context.preferences;

  return `SMART CONCIERGE — PROFIL ȘI STRATEGIE
- Context operațional: ${context.conversationContext}.
- Tip călătorie estimat: ${preferences.travelStyle}.
- Adulți detectați: ${preferences.adults ?? "necunoscut"}.
- Vârste copii detectate: ${
    preferences.childAges.length > 0
      ? preferences.childAges.join(", ")
      : "necunoscute sau fără copii"
  }.
- Copii mici: ${
    preferences.hasSmallChildren
      ? "da"
      : "nu/necunoscut"
  }.
- Preferă liniște: ${
    preferences.wantsQuiet
      ? "da"
      : "nu/necunoscut"
  }.
- Preferă opțiuni accesibile pe jos: ${
    preferences.wantsWalkableOptions
      ? "da"
      : "nu/necunoscut"
  }.
- Preferă piscină: ${
    preferences.wantsPool
      ? "da"
      : "nu/necunoscut"
  }.
- Preferă confort premium/spațiu: ${
    preferences.wantsPremiumComfort
      ? "da"
      : "nu/necunoscut"
  }.
- Nevoi detectate: ${
    preferences.needs.join(", ") || "neclare"
  }.

STRATEGIA RĂSPUNSULUI
${context.responseStrategy
  .map((item) => `- ${item}`)
  .join("\n")}

SUGESTII COMERCIALE PERMISE
${
  context.suitableUpsells.length > 0
    ? context.suitableUpsells
        .map((item) => `- ${item}`)
        .join("\n")
    : "- Nu introduce sugestii comerciale în acest răspuns."
}

DE EVITAT
${context.avoid
  .map((item) => `- ${item}`)
  .join("\n")}

REGULĂ DE PERSONALIZARE
- Folosește profilul doar pentru personalizare naturală.
- Nu spune utilizatorului că l-ai profilat.
- Nu enumera clasificările interne.
- Nu deduce preferințe pe care utilizatorul nu le-a exprimat sau pe care sistemul nu le-a detectat.
- Dacă profilul și solicitarea curentă intră în conflict, prioritatea este solicitarea curentă a utilizatorului.
`;
}