import type {
  ContextDetectionInput,
  ConversationContext,
  ConversationContextType,
} from "@/lib/ai/context/context-types";

type ContextRule = {
  type: Exclude<ConversationContextType, "UNKNOWN">;
  weight: number;
  signals: RegExp[];
};

const RULES: ContextRule[] = [
  {
    type: "HUMAN_HANDOFF",
    weight: 15,
    signals: [
      /(vreau|as vrea|doresc).*(sa vorbesc|sa discut).*(administrator|proprietar|cineva|persoana)/i,
      /(pune-ma|da-mi|vreau).*(administratorul|proprietarul|un operator|o persoana)/i,
      /(contact.*administrator|contact.*proprietar|vorbesc.*administrator|vorbesc.*proprietar)/i,

      /(vreau|doresc|solicit).*(refund|rambursare|banii inapoi)/i,
      /(vreau|doresc|solicit).*(anulare gratuita|anulez rezervarea)/i,

      /(confirma|verifica).*(plata|avansul|transferul|banii)/i,
      /(ati primit|ai primit).*(plata|avansul|transferul|banii)/i,

      /(am platit|am achitat|am dat avans).*(confirma|confirmati|verifica|verificati|ati primit|l-ati primit|a intrat)/i,
      /(avansul|plata|transferul).*(a ajuns|a intrat|l-ati primit|ati primit|este primit|e primit)/i,

      /(aproba|confirm).*(early check.?in|late check.?out|check.?in mai devreme|check.?out mai tarziu)/i,

      /(exceptie|discount special|reducere speciala|upgrade gratuit)/i,
    ],
  },

  {
    type: "SUPPORT",
    weight: 13,
    signals: [
      /nu (mai )?(merge|functioneaza|porneste)/i,
      /(defect|stricat|problema|avarie|urgenta)/i,

      /(aerul conditionat|clima|apa calda|internetul|wifi|wi-fi|usa|cheia|frigiderul|televizorul|tv-ul).*(nu|defect|stricat|merge|functioneaza)/i,

      /(nu avem|s-a oprit|s-a blocat|curge apa|nu se deschide|nu se inchide)/i,

      /(am ramas|suntem).*(fara apa|fara curent|fara internet|afara)/i,

      /(nu pot|nu putem).*(intra|deschide|inchide|porni|folosi)/i,

      /(ajutor|ajutati-ma|ajuta-ma).*(apartament|camera|vila|cazare|usa|cheie)/i,
    ],
  },

  {
    type: "CHECK_OUT",
    weight: 12,
    signals: [
      /(plecam|plec|paras[m]?|eliberam).*(azi|maine|dimineata|apartamentul|camera)/i,

      /(check.?out|checkout).*(ora|cum|cand|tarziu|mai tarziu)/i,

      /(unde|cum).*(lasam|las|predam).*(cheia|cheile)/i,

      /(la ce ora|pana la ce ora).*(plecam|eliberam|check.?out)/i,

      /(late check.?out|check.?out tarziu|plecare tarzie)/i,
    ],
  },

  {
    type: "CHECKING_IN",
    weight: 11,
    signals: [
      /(venim|ajungem|sosim).*(azi|maine|diseara|seara|la ora)/i,

      /(check.?in|checkin|cazare).*(ora|mai devreme|tarziu|cum se face)/i,

      /(unde luam cheia|cum intram|self.?check.?in|codul de acces)/i,

      /(suntem pe drum|am ajuns|suntem la poarta|suntem in fata)/i,

      /(early check.?in|check.?in devreme|sosire devreme)/i,
    ],
  },

  {
    type: "IN_STAY",
    weight: 10,
    signals: [
      /(suntem|sunt).*(cazati|cazat|in apartament|la vila|la locatie)/i,

      /(suntem deja aici|in timpul sejurului|camera noastra|apartamentul nostru)/i,

      /(unde este|unde sunt|cum folosesc|cum folosim).*(in apartament|la piscina|la locatie|la vila)/i,

      /(stam|locuim).*(acum|momentan).*(la voi|la vila|in apartament)/i,

      /(prosoape|lenjerie|gratar|piscina|parcare|telecomanda).*(unde|cum|putem)/i,
    ],
  },

  {
    type: "PRE_STAY",
    weight: 9,
    signals: [
      /(avem|am).*(rezervare).*(maine|poimaine|saptamana viitoare|luna viitoare)/i,

      /(inainte de sosire|inainte sa venim|inainte de check.?in)/i,

      /(rezervarea noastra|rezervarea mea).*(sosire|venim|ajungem|check.?in)/i,

      /(ce trebuie sa stim|ce trebuie sa facem).*(inainte|sosire|check.?in)/i,

      /(venim cu|aducem).*(copil|copii|masina|rulota)/i,

      /(parcarea|locul de parcare|accesul).*(rezervare|sosire|venim)/i,
    ],
  },

  {
    type: "POST_STAY",
    weight: 8,
    signals: [
      /(am plecat|am facut check.?out|am eliberat apartamentul)/i,

      /(dupa sejur|dupa cazare|dupa plecare)/i,

      /(am uitat|am lasat).*(in apartament|in camera|la vila|la voi)/i,

      /(factura|bon|document fiscal).*(dupa|sejur|cazare|rezervare)/i,

      /(multumim|multumesc).*(sejur|cazare|gazduire)/i,

      /(review|recenzie).*(sejur|cazare|breeze)/i,
    ],
  },

  {
    type: "HAS_RESERVATION",
    weight: 7,
    signals: [
      /(am|avem).*(rezervare|rezervat|confirmare)/i,

      /(rezervarea mea|rezervarea noastra|numarul rezervarii|confirmarea rezervarii)/i,

      /(am platit|am dat avans|am achitat|sejurul nostru)/i,
    ],
  },

  {
    type: "BOOKING",
    weight: 6,
    signals: [
      /(vreau|doresc|as vrea).*(sa rezerv|rezervarea|confirm)/i,

      /(cum rezerv|unde platesc|plata avansului|finalizez rezervarea)/i,

      /(trimite.*link|link.*rezervare|facem rezervarea)/i,

      /(vreau sa platesc|cum platesc|pot plati).*(rezervare|avans|integral)/i,
    ],
  },

  {
    type: "SEARCHING",
    weight: 5,
    signals: [
      /(caut|ne trebuie|aveti liber|este disponibil|disponibilitate)/i,

      /(cat costa|pret|tarif).*(noapte|sejur|apartament)?/i,

      /(venim|am veni|dorim sa venim).*(perioada|august|iulie|iunie|septembrie|nopti)/i,

      /(suntem|vom fi).*(adulti|copii|persoane)/i,
    ],
  },

  {
    type: "LOCAL_GUIDE",
    weight: 4,
    signals: [
      /(unde|ce).*(manca|mancam|mancam|bem|cumparam|vizitam|facem cu copiii)/i,

      /(restaurant|plaja|farmacie|supermarket|bancomat|cafenea|delfinariu|acvariu|mall)/i,

      /(aproape|in zona|mamaia nord|navodari|constanta).*(recomand|gasim|este)/i,

      /(google maps|waze|traseu|cum ajung)/i,
    ],
  },
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectConversationContext(
  messages: ContextDetectionInput
): ConversationContext {
  const userMessages = messages
    .filter((message) => message.role === "user")
    .map((message) => normalize(message.content))
    .filter(Boolean);

  const latestUserMessage = userMessages.at(-1) ?? "";

  if (!latestUserMessage) {
    return {
      type: "UNKNOWN",
      confidence: 0,
      matchedSignals: [],
      latestUserMessage: "",
    };
  }

  const recentMessages = userMessages.slice(-4);

  const scored = RULES.map((rule) => {
    const matches: string[] = [];
    let score = 0;

    recentMessages.forEach((message, messageIndex) => {
      const isLatest =
        messageIndex === recentMessages.length - 1;

      const recencyMultiplier = isLatest ? 1 : 0.45;

      for (const signal of rule.signals) {
        const match = message.match(signal);

        if (!match) continue;

        matches.push(match[0]);

        score +=
          rule.weight * recencyMultiplier;
      }
    });

    return {
      type: rule.type,
      score,
      matches,
    };
  }).sort(
    (left, right) =>
      right.score - left.score
  );

  const best = scored[0];

  if (!best || best.score === 0) {
    return {
      type: "UNKNOWN",
      confidence: 0,
      matchedSignals: [],
      latestUserMessage,
    };
  }

  return {
    type: best.type,
    confidence: Math.min(
      1,
      Number(
        (best.score / 20).toFixed(2)
      )
    ),
    matchedSignals: [
      ...new Set(best.matches),
    ].slice(0, 5),
    latestUserMessage,
  };
}