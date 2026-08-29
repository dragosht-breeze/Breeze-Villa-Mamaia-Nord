import {
  checkLiveAvailability,
  type AvailabilitySummary,
} from "@/lib/ai/availability-tool";
import {
  buildSalesSession,
  calculateLeadScore,
  mergeAvailabilityIntoSession,
  type SalesSession,
} from "@/lib/ai/brain";
import { breezeVillaConciergeInstructions } from "@/lib/ai/concierge";
import {
  buildConversationReliabilityPrompt,
  mergeConversationHistory,
  resolveDeterministicLocalGuideAnswer,
} from "@/lib/ai/conversation-reliability";
import {
  buildConversationContextPrompt,
  detectConversationContext,
  type ConversationContext,
} from "@/lib/ai/context";
import { breezeVillaAssistantInstructions } from "@/lib/ai/knowledge";
import { buildLocalGuideContext } from "@/lib/ai/local-guide";
import {
  buildLiveWeatherContext,
  conversationNeedsLiveWeather,
  getLiveWeather,
} from "@/lib/ai/live";
import {
  buildSmartConciergeContext,
  buildSmartConciergePrompt,
  detectGuestPreferences,
  type SmartConciergeContext,
} from "@/lib/ai/smart";
import {
  getAiLeadByConversationId,
  upsertAiLead,
} from "@/lib/ai/leads/store";
import {
  buildMemoryContext,
  mergeSalesMemory,
} from "@/lib/ai/memory";
import type {
  GatewayMessage,
  GatewayRequest,
  GatewayResponse,
} from "@/lib/ai/gateway/types";
import { analyticsService } from "@/lib/analytics";
import {
  buildLearnedAnswersContext,
  findLearnedAnswer,
  listApprovedLearnedAnswers,
} from "@/lib/ai/learning";

const MAX_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 1_000;
const MAX_TOOL_ROUNDS = 2;
const DEFAULT_MODEL = "gpt-5";

const HUMAN_WHATSAPP = "0723 253 405";

const availabilityTool = {
  type: "function",
  name: "check_live_availability",
  description:
    "Verifică disponibilitatea și prețurile reale Breeze Villa pentru o perioadă și o componență exactă a grupului. Folosește această funcție numai după ce ai check-in, check-out, numărul de adulți și vârstele copiilor. Datele trebuie să fie în format YYYY-MM-DD.",
  parameters: {
    type: "object",
    properties: {
      checkIn: {
        type: "string",
        description: "Data de check-in în format YYYY-MM-DD.",
      },
      checkOut: {
        type: "string",
        description: "Data de check-out în format YYYY-MM-DD.",
      },
      adults: {
        type: "integer",
        minimum: 1,
        maximum: 20,
        description: "Numărul de adulți.",
      },
      childAges: {
        type: "array",
        items: {
          type: "integer",
          minimum: 0,
          maximum: 17,
        },
        description:
          "Vârstele tuturor copiilor. Folosește [] dacă nu sunt copii.",
      },
    },
    required: ["checkIn", "checkOut", "adults", "childAges"],
    additionalProperties: false,
  },
  strict: true,
} as const;

type OpenAIOutputContent = {
  type?: string;
  text?: string;
};

type OpenAIMessageItem = {
  type?: "message";
  content?: OpenAIOutputContent[];
};

type OpenAIFunctionCallItem = {
  type?: "function_call";
  name?: string;
  arguments?: string;
  call_id?: string;
};

type OpenAIOutputItem =
  | OpenAIMessageItem
  | OpenAIFunctionCallItem
  | Record<string, unknown>;

type OpenAIResponse = {
  output?: OpenAIOutputItem[];
  error?: {
    message?: string;
  };
};

type FunctionCallArguments = {
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  childAges?: number[];
};

type QualityGateResult = {
  answer: string;
  blocked: boolean;
  reason?: string;
};

export class AiGatewayError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "AiGatewayError";
  }
}

function cleanConversationId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
}

function sanitizeMessages(messages: GatewayMessage[]) {
  return messages
    .filter(
      (message) =>
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string"
    )
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    }))
    .filter((message) => message.content.length > 0)
    .slice(-MAX_MESSAGES);
}

function extractOutputText(response: OpenAIResponse) {
  return (
    response.output
      ?.filter((item): item is OpenAIMessageItem => item.type === "message")
      .flatMap((item) => item.content ?? [])
      .filter((content) => content.type === "output_text")
      .map((content) => content.text ?? "")
      .join("")
      .trim() ?? ""
  );
}

function getFunctionCalls(response: OpenAIResponse) {
  return (
    response.output?.filter(
      (item): item is OpenAIFunctionCallItem =>
        item.type === "function_call" &&
        typeof item.name === "string" &&
        typeof item.call_id === "string"
    ) ?? []
  );
}

function fallbackAnswer() {
  return `Momentan nu pot genera răspunsul. Pentru ajutor rapid, folosește pagina de rezervare sau scrie-ne pe WhatsApp la ${HUMAN_WHATSAPP}.`;
}

function humanHandoffAnswer() {
  return `Pentru această solicitare este necesară confirmarea directă a echipei Breeze Villa. Te rog să ne scrii pe WhatsApp la ${HUMAN_WHATSAPP}, iar situația va putea fi verificată concret.`;
}

function supportFallbackAnswer() {
  return `Pentru problema aceasta vreau să evit să îți recomand ceva nesigur sau neconfirmat. Te rog să contactezi echipa Breeze Villa pe WhatsApp la ${HUMAN_WHATSAPP}, pentru verificarea și rezolvarea situației.`;
}

function contextAllowsLearnedAnswer(context: ConversationContext) {
  return ![
    "HUMAN_HANDOFF",
    "SUPPORT",
    "CHECKING_IN",
    "CHECK_OUT",
  ].includes(context.type);
}

function contextAllowsLocalGuideAnswer(context: ConversationContext) {
  return context.type === "LOCAL_GUIDE";
}

function normalizeForQuality(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function containsHumanContact(answer: string) {
  const normalized = normalizeForQuality(answer);

  return (
    normalized.includes("whatsapp") ||
    normalized.includes("0723 253 405") ||
    normalized.includes("0723253405")
  );
}

function appendHumanContact(answer: string) {
  if (containsHumanContact(answer)) {
    return answer.trim();
  }

  return `${answer.trim()}

Dacă este nevoie de verificarea sau intervenția echipei Breeze Villa, ne poți scrie pe WhatsApp la ${HUMAN_WHATSAPP}.`;
}

function latestMessageRequestsEarlyCheckIn(value: string) {
  const normalized = normalizeForQuality(value);

  return (
    /early check.?in/i.test(normalized) ||
    /check.?in.{0,30}(mai devreme|devreme)/i.test(normalized) ||
    /(ajung|venim|sosim).{0,35}(mai devreme|devreme)/i.test(normalized)
  );
}

function latestMessageRequestsLateCheckOut(value: string) {
  const normalized = normalizeForQuality(value);

  return (
    /late check.?out/i.test(normalized) ||
    /check.?out.{0,30}(mai tarziu|tarziu)/i.test(normalized) ||
    /(plecam|plec|eliberam).{0,35}(mai tarziu|tarziu)/i.test(normalized)
  );
}

function latestMessageMentionsForgottenItem(value: string) {
  const normalized = normalizeForQuality(value);

  return (
    /(am uitat|am lasat).{0,80}(apartament|camera|vila|voi)/i.test(
      normalized
    ) ||
    /(obiect|bagaj|incarcator|telefon|haine|chei).{0,50}(uitat|lasat)/i.test(
      normalized
    )
  );
}

function hasUnsafeAdministrativeClaim(answer: string) {
  const normalized = normalizeForQuality(answer);

  const patterns = [
    /\b(am|avem)\s+(verificat|confirmat)\s+(rezervarea|plata|avansul|transferul)/i,

    /\b(plata|avansul|transferul)\s+(a fost|este)\s+(primit|primita|confirmat|confirmata|inregistrat|inregistrata|incasat|incasata)/i,

    /\bconfirm(?:am)?\s+ca\s+(am|ati)\s+primit\s+(plata|avansul|transferul|banii)/i,

    /\brezervarea\s+(este|a fost)\s+(confirmata|verificata|activa)/i,

    /\bsoldul\s+(rezervarii|dumneavoastra|tau|dvs)\s+(este|ramas)\b/i,

    /\b(multumim|va multumim|iti multumim)\s+(pentru\s+)?(avans|plata|transfer)/i,

    /\b(am primit|avem plata|avem avansul|a intrat plata|a intrat avansul)\b/i,
  ];

  return patterns.some((pattern) =>
    pattern.test(normalized)
  );
}

function hasUnsafeAccessCode(answer: string) {
  const normalized = normalizeForQuality(answer);

  return /(cod(?:ul)?(?: de)? acces|cod acces|codul portii|cod poarta)\s*(este|:|-)\s*[a-z0-9]{3,}/i.test(
    normalized
  );
}

function hasUnsafeApprovalClaim(answer: string) {
  const normalized = normalizeForQuality(answer);

  const patterns = [
    /(early check.?in|check.?in mai devreme).{0,45}(aprobat|aprobată|confirmat|confirmata|garantat|gratuit)/i,

    /(late check.?out|check.?out mai tarziu).{0,45}(aprobat|aprobata|confirmat|confirmata|garantat|gratuit)/i,

    /(aprobat|aprobata|confirmat|confirmata).{0,45}(early check.?in|late check.?out)/i,

    /(upgrade|reducere speciala|discount special).{0,40}(aprobat|confirmat|garantat|gratuit)/i,
  ];

  return patterns.some((pattern) => pattern.test(normalized));
}

function hasFalseHumanActionClaim(answer: string) {
  const normalized = normalizeForQuality(answer);

  const patterns = [
    /\b(am|avem)\s+(contactat|anuntat|notificat)\s+(administratorul|proprietarul|echipa|personalul)/i,

    /\b(am|avem)\s+transmis\s+(solicitarea|mesajul|cererea)/i,

    /\badministratorul\s+(a fost|este)\s+(anuntat|notificat|contactat)/i,

    /\bproprietarul\s+(a fost|este)\s+(anuntat|notificat|contactat)/i,

    /\bechipa\s+(a fost|este)\s+(anuntata|notificata|contactata)/i,

    /\bvom reveni\s+cu\s+(un\s+)?raspuns/i,

    /\b(verificam|vom verifica)\s+(imediat\s+)?(cu\s+)?(administratorul|proprietarul|echipa)/i,

    /\btransmitem\s+(imediat\s+)?(administratorului|proprietarului|echipei)/i,
  ];

  return patterns.some((pattern) =>
    pattern.test(normalized)
  );
}

function hasSupportUpsell(answer: string) {
  const normalized = normalizeForQuality(answer);

  return /(late check.?out|prelungirea sejurului|prelungiti sejurul|upgrade|apartament mai spatios|oferta speciala|reducere speciala|discount special)/i.test(
    normalized
  );
}

function applyQualityGate(
  answer: string,
  context: ConversationContext,
  latestUserMessage: string
): QualityGateResult {
  const trimmed = answer.trim();

  if (!trimmed) {
    return {
      answer: fallbackAnswer(),
      blocked: true,
      reason: "empty_answer",
    };
  }

  /*
   * HARD BLOCKS
   *
   * Aceste afirmații nu trebuie să ajungă niciodată
   * la client fără un instrument live care le confirmă.
   */
  if (hasUnsafeAdministrativeClaim(trimmed)) {
    return {
      answer: humanHandoffAnswer(),
      blocked: true,
      reason: "unverified_administrative_claim",
    };
  }

  if (hasUnsafeAccessCode(trimmed)) {
    return {
      answer: humanHandoffAnswer(),
      blocked: true,
      reason: "unverified_access_code",
    };
  }

  if (hasUnsafeApprovalClaim(trimmed)) {
    return {
      answer: humanHandoffAnswer(),
      blocked: true,
      reason: "unverified_approval",
    };
  }

  if (hasFalseHumanActionClaim(trimmed)) {
    return {
      answer: humanHandoffAnswer(),
      blocked: true,
      reason: "false_human_action_claim",
    };
  }

  /*
   * HUMAN HANDOFF
   *
   * În mod normal contextul este interceptat înainte
   * de apelul modelului, dar păstrăm protecția și aici.
   */
  if (context.type === "HUMAN_HANDOFF") {
    return {
      answer: humanHandoffAnswer(),
      blocked: true,
      reason: "human_handoff_context",
    };
  }

  /*
   * SUPPORT
   *
   * Nu permitem sugestii comerciale în timpul unei
   * probleme active.
   */
  if (
    context.type === "SUPPORT" &&
    hasSupportUpsell(trimmed)
  ) {
    return {
      answer: supportFallbackAnswer(),
      blocked: true,
      reason: "support_upsell",
    };
  }

  /*
   * Pentru SUPPORT păstrăm răspunsul util al AI-ului,
   * dar adăugăm întotdeauna o cale clară către echipă.
   */
  if (context.type === "SUPPORT") {
    return {
      answer: appendHumanContact(trimmed),
      blocked: false,
    };
  }

  /*
   * EARLY CHECK-IN
   *
   * Dacă utilizatorul cere explicit early check-in,
   * iar răspunsul spune corect că trebuie confirmat,
   * ne asigurăm că există și canalul de contact.
   */
  if (
    (context.type === "CHECKING_IN" ||
      context.type === "PRE_STAY") &&
    latestMessageRequestsEarlyCheckIn(latestUserMessage)
  ) {
    return {
      answer: appendHumanContact(trimmed),
      blocked: false,
    };
  }

  /*
   * LATE CHECK-OUT
   */
  if (
    context.type === "CHECK_OUT" &&
    latestMessageRequestsLateCheckOut(latestUserMessage)
  ) {
    return {
      answer: appendHumanContact(trimmed),
      blocked: false,
    };
  }

  /*
   * OBIECTE UITATE
   */
  if (
    context.type === "POST_STAY" &&
    latestMessageMentionsForgottenItem(latestUserMessage)
  ) {
    return {
      answer: appendHumanContact(trimmed),
      blocked: false,
    };
  }

  return {
    answer: trimmed,
    blocked: false,
  };
}

function buildGuestSupportGuardrails(
  context: ConversationContext
) {
  return `
RC11.4 — GUEST SUPPORT & HUMAN HANDOFF

ROL OPERAȚIONAL
Ești asistentul virtual oficial Breeze Villa Mamaia Nord.

Prioritățile tale sunt:
1. rezervările și disponibilitatea;
2. informațiile despre Breeze Villa și apartamente;
3. pregătirea oaspeților înainte de sosire;
4. suportul practic în timpul sejurului;
5. informațiile despre check-out și post-sejur.

CONTEXT CURENT
- Context operațional detectat: ${context.type}.

REGULĂ FUNDAMENTALĂ
Nu inventa niciodată informații operaționale, comerciale sau administrative pe care sistemul nu ți le-a furnizat.

POȚI RĂSPUNDE DIRECT DESPRE
- facilitățile Breeze Villa;
- caracteristicile apartamentelor;
- regulile proprietății;
- programul standard de check-in și check-out;
- piscină;
- parcare;
- procedura generală de sosire;
- cardurile de vacanță acceptate;
- procedura generală de rezervare;
- avans;
- metodele generale de plată;
- politica generală de anulare;
- informațiile confirmate în Knowledge Base.

NU CONFIRMA FĂRĂ DATE EXPLICITE DIN SISTEM
- existența sau statusul unei rezervări concrete;
- apartamentul atribuit unei persoane;
- numărul unei camere sau unități rezervate;
- soldul unei rezervări;
- primirea unei plăți sau a unui avans;
- rambursarea unei sume;
- coduri de acces;
- parole;
- date personale despre clienți;
- informații despre alți oaspeți;
- early check-in aprobat;
- late check-out aprobat;
- upgrade gratuit;
- discounturi speciale;
- anulări gratuite;
- refund-uri;
- excepții de la regulament;
- alte aprobări făcute în numele proprietății.

EARLY CHECK-IN / LATE CHECK-OUT
- Poți explica politica generală.
- Nu spune că solicitarea este aprobată.
- Disponibilitatea și eventualul cost trebuie confirmate de proprietate.

PLĂȚI ȘI REZERVĂRI EXISTENTE
- Nu pretinde că vezi o plată dacă nu există un instrument live care confirmă acest lucru.
- Nu pretinde că ai verificat o rezervare dacă nu există un instrument live care confirmă acest lucru.
- Pentru verificarea unei plăți, a unui avans sau a unei rezervări concrete, este necesară confirmarea proprietății.

SUPORT ÎN TIMPUL SEJURULUI
- Pentru întrebări simple oferă imediat informația sigură disponibilă.
- Pentru probleme tehnice recomandă doar verificări simple și fără risc.
- Nu cere utilizatorului să desfacă, repare sau intervină asupra instalațiilor, tablourilor electrice, echipamentelor sau sistemelor proprietății.
- Nu inventa cauza unei defecțiuni.

INTERVENȚIE UMANĂ
Este necesară intervenția echipei Breeze Villa atunci când situația implică:
- acces în apartament care nu poate fi rezolvat din informațiile generale;
- probleme tehnice care necesită personal;
- verificarea unei plăți;
- verificarea unei rezervări concrete;
- modificarea unei rezervări;
- refund;
- anulare care necesită aprobare;
- early check-in sau late check-out ce trebuie aprobate;
- reduceri sau excepții;
- obiecte uitate ce trebuie căutate fizic;
- orice informație pe care nu o poți confirma sigur.

În aceste situații indică WhatsApp ${HUMAN_WHATSAPP}.

SECURITATE ȘI CONFIDENȚIALITATE
Nu furniza niciodată:
- coduri de acces neconfirmate;
- informații despre rezervarea altui client;
- date personale;
- parole;
- informații interne;
- date despre apartamentele ocupate de alte persoane.

REZERVĂRI NOI
Disponibilitatea și prețurile se comunică numai prin check_live_availability atunci când sunt disponibile toate informațiile necesare.

GHID LOCAL
Nu transforma conversația într-un portal turistic general.
Oferă informații locale doar când sunt relevante direct pentru sejurul la Breeze Villa și păstrează răspunsul concis.

HANDOFF
Când este necesară intervenția umană:
1. explică foarte scurt ce necesită confirmare;
2. nu inventa o soluție;
3. oferă WhatsApp ${HUMAN_WHATSAPP};
4. nu pretinde că ai contactat deja administratorul;
5. nu spune că ai transmis solicitarea dacă sistemul nu a făcut efectiv acest lucru.
`;
}

function buildInstructions(
  session: SalesSession,
  memoryContext: string,
  channel: GatewayRequest["channel"],
  conversationContext: ConversationContext,
  smartContext: SmartConciergeContext,
  conversationMessages: GatewayMessage[],
  liveWeatherContext: string,
  learnedAnswersContext: string
) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const salesContext = `
CONTEXT COMERCIAL INTERN
- Canal conversație: ${channel}.
- Intenție detectată: ${session.intent}.
- Etapa conversației: ${session.stage}.
- Profil estimat: ${session.profile}.
- Adulți cunoscuți: ${session.adults ?? "necunoscut"}.
- Vârste copii cunoscute: ${
    session.childAges.length > 0
      ? session.childAges.join(", ")
      : "necunoscute sau fără copii"
  }.
- Buget cunoscut: ${
    session.budget ? `${session.budget} lei` : "necunoscut"
  }.
- Scor intern de interes: ${session.leadScore}/100.

Folosește acest context fără să menționezi clientului scorul intern sau clasificările.

REGULI COMERCIALE
- În discovery, cere o singură informație relevantă.
- În interest, recomandă clar și explică succint motivul.
- În comparison, oferă o alternativă utilă fără presiune.
- În booking, răspunde scurt și conduce spre rezervare.
- Dacă utilizatorul este deja oaspete sau are nevoie de suport, nu transforma conversația într-un discurs comercial.
`;

  const operationalContext =
    buildConversationContextPrompt(conversationContext);

  const smartConciergePrompt =
    buildSmartConciergePrompt(smartContext);

  const localGuideContext = buildLocalGuideContext();

  const reliabilityContext =
    buildConversationReliabilityPrompt(conversationMessages);

  const guestSupportGuardrails =
    buildGuestSupportGuardrails(conversationContext);

  return `${breezeVillaAssistantInstructions}
${breezeVillaConciergeInstructions}
${guestSupportGuardrails}
${salesContext}
${operationalContext}
${smartConciergePrompt}
${localGuideContext}
${reliabilityContext}
${liveWeatherContext}
${learnedAnswersContext}
${memoryContext}

DISPONIBILITATE LIVE
- Data de astăzi în România este ${today}.
- Ai acces la funcția check_live_availability.
- Dacă utilizatorul cere disponibilitate sau preț și oferă perioada, adulții și vârstele copiilor, apelează funcția.
- Dacă lipsesc vârstele copiilor, întreabă-le înainte de verificare.
- Nu spune că o unitate este disponibilă și nu comunica un preț decât dacă rezultatul funcției confirmă acest lucru.
- Prețurile returnate sunt în lei și reprezintă totalul sejurului.
- Prezintă maximum 3 variante, recomandarea principală prima.
- După rezultat, invită utilizatorul să continue în pagina /rezervare.
- Dacă funcția nu găsește variante, explică mesajul primit și sugerează o altă perioadă sau WhatsApp.
`;
}

async function callOpenAI(
  apiKey: string,
  model: string,
  input: unknown[],
  signal: AbortSignal,
  currentSession: SalesSession,
  memoryContext: string,
  channel: GatewayRequest["channel"],
  conversationContext: ConversationContext,
  smartContext: SmartConciergeContext,
  conversationMessages: GatewayMessage[],
  liveWeatherContext: string,
  learnedAnswersContext: string
) {
  const response = await fetch(
    "https://api.openai.com/v1/responses",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        reasoning: {
          effort: "low",
        },
        instructions: buildInstructions(
          currentSession,
          memoryContext,
          channel,
          conversationContext,
          smartContext,
          conversationMessages,
          liveWeatherContext,
          learnedAnswersContext
        ),
        input,
        tools: [availabilityTool],
        tool_choice: "auto",
        parallel_tool_calls: false,
        max_output_tokens: 650,
      }),
      cache: "no-store",
      signal,
    }
  );

  const data = (await response.json()) as OpenAIResponse;

  if (!response.ok) {
    throw new AiGatewayError(
      "AI_REQUEST_FAILED",
      502,
      `OpenAI ${response.status}: ${
        data.error?.message ?? "Unknown error"
      }`
    );
  }

  return data;
}

export async function processAiGatewayMessage(
  request: GatewayRequest,
  signal: AbortSignal
): Promise<GatewayResponse> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new AiGatewayError(
      "AI_NOT_CONFIGURED",
      503,
      "Asistentul AI nu este încă activat."
    );
  }

  const conversationId = cleanConversationId(
    request.conversationId
  );

  const messages = sanitizeMessages(request.messages);

  if (!conversationId) {
    throw new AiGatewayError(
      "INVALID_CONVERSATION_ID",
      400,
      "Conversația nu are un identificator valid."
    );
  }

  if (
    messages.length === 0 ||
    messages.at(-1)?.role !== "user"
  ) {
    throw new AiGatewayError(
      "INVALID_MESSAGES",
      400,
      "Trimite cel puțin un mesaj valid."
    );
  }

  const previousLead =
    await getAiLeadByConversationId(conversationId);

  const analyticsContext = {
    conversationId,
    channel: request.channel,
  };

  if (!previousLead) {
    await analyticsService.logConversationStart(
      analyticsContext
    );
  }

  const conversationMessages = mergeConversationHistory(
    (previousLead?.messages ?? []).map((message) => ({
      role: message.role,
      content: message.content,
    })),
    messages,
    MAX_MESSAGES
  );

  const latestUserMessage =
    conversationMessages.at(-1)?.content ?? "";

  const conversationContext =
    detectConversationContext(conversationMessages);

  const memoryContext = buildMemoryContext(previousLead);

  let availability: AvailabilitySummary | undefined;

  let salesSession = mergeSalesMemory(
    buildSalesSession(conversationMessages),
    previousLead
  );

  salesSession.leadScore = Math.max(
    calculateLeadScore(salesSession),
    previousLead?.sales.leadScore ?? 0
  );

  const guestPreferences =
    detectGuestPreferences(conversationMessages);

  let smartContext = buildSmartConciergeContext(
    conversationContext,
    guestPreferences,
    salesSession
  );

  if (conversationContext.type === "LOCAL_GUIDE") {
    await analyticsService.logLocalGuide(
      analyticsContext
    );
  }

  if (
    conversationContext.type === "SUPPORT" ||
    conversationContext.type === "HUMAN_HANDOFF"
  ) {
    await analyticsService.logSupport(
      analyticsContext
    );
  }

  /*
   * HUMAN HANDOFF
   */
  if (conversationContext.type === "HUMAN_HANDOFF") {
    const quality = applyQualityGate(
      humanHandoffAnswer(),
      conversationContext,
      latestUserMessage
    );

    const answer = quality.answer;

    await upsertAiLead({
      conversationId,
      messages: [
        ...conversationMessages,
        {
          role: "assistant",
          content: answer,
        },
      ],
      sales: salesSession,
    });

    return {
      ok: true,
      answer,
      sales: {
        intent: salesSession.intent,
        stage: salesSession.stage,
        profile: salesSession.profile,
        leadScore: salesSession.leadScore,
      },
    };
  }

  /*
   * LEARNED ANSWERS
   */
  const learnedAnswers =
    await listApprovedLearnedAnswers();

  const learnedAnswersContext =
    buildLearnedAnswersContext(learnedAnswers);

  const learnedAnswer =
    contextAllowsLearnedAnswer(conversationContext)
      ? findLearnedAnswer(
          latestUserMessage,
          learnedAnswers
        )
      : undefined;

  if (learnedAnswer) {
    const quality = applyQualityGate(
      learnedAnswer.answer,
      conversationContext,
      latestUserMessage
    );

    const answer = quality.answer;

    await upsertAiLead({
      conversationId,
      messages: [
        ...conversationMessages,
        {
          role: "assistant",
          content: answer,
        },
      ],
      sales: salesSession,
    });

    return {
      ok: true,
      answer,
      sales: {
        intent: salesSession.intent,
        stage: salesSession.stage,
        profile: salesSession.profile,
        leadScore: salesSession.leadScore,
      },
    };
  }

  /*
   * LOCAL GUIDE DETERMINISTIC
   */
  const deterministicAnswer =
    contextAllowsLocalGuideAnswer(conversationContext)
      ? resolveDeterministicLocalGuideAnswer(
          conversationMessages,
          request.channel
        )
      : undefined;

  if (deterministicAnswer) {
    const quality = applyQualityGate(
      deterministicAnswer,
      conversationContext,
      latestUserMessage
    );

    const answer = quality.answer;

    await upsertAiLead({
      conversationId,
      messages: [
        ...conversationMessages,
        {
          role: "assistant",
          content: answer,
        },
      ],
      sales: salesSession,
    });

    return {
      ok: true,
      answer,
      sales: {
        intent: salesSession.intent,
        stage: salesSession.stage,
        profile: salesSession.profile,
        leadScore: salesSession.leadScore,
      },
    };
  }

  const model =
    process.env.OPENAI_MODEL ?? DEFAULT_MODEL;

  const input: unknown[] =
    conversationMessages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

  /*
   * WEATHER
   */
  const needsLiveWeather =
    conversationNeedsLiveWeather(
      conversationMessages
    );

  const liveWeatherContext =
    needsLiveWeather
      ? buildLiveWeatherContext(
          await getLiveWeather(signal)
        )
      : "";

  if (needsLiveWeather) {
    await analyticsService.logWeather(
      analyticsContext
    );
  }

  let response = await callOpenAI(
    apiKey,
    model,
    input,
    signal,
    salesSession,
    memoryContext,
    request.channel,
    conversationContext,
    smartContext,
    conversationMessages,
    liveWeatherContext,
    learnedAnswersContext
  );

  /*
   * TOOL LOOP
   */
  for (
    let round = 0;
    round < MAX_TOOL_ROUNDS;
    round += 1
  ) {
    const functionCalls =
      getFunctionCalls(response);

    if (functionCalls.length === 0) {
      break;
    }

    input.push(...(response.output ?? []));

    for (const functionCall of functionCalls) {
      if (
        functionCall.name !==
        "check_live_availability"
      ) {
        continue;
      }

      let args: FunctionCallArguments = {};

      try {
        args = JSON.parse(
          functionCall.arguments ?? "{}"
        ) as FunctionCallArguments;
      } catch {
        args = {};
      }

      availability =
        await checkLiveAvailability({
          checkIn: String(
            args.checkIn ?? ""
          ),
          checkOut: String(
            args.checkOut ?? ""
          ),
          adults: Number(
            args.adults ?? 1
          ),
          childAges: Array.isArray(
            args.childAges
          )
            ? args.childAges
            : [],
        });

      await analyticsService.logAvailability(
        analyticsContext,
        {
          checkIn: String(
            args.checkIn ?? ""
          ),
          checkOut: String(
            args.checkOut ?? ""
          ),
          adults: Number(
            args.adults ?? 1
          ),
          children: Array.isArray(
            args.childAges
          )
            ? args.childAges.length
            : 0,
          ok: availability.ok,
          options:
            availability.recommendations
              ?.length ?? 0,
        }
      );

      salesSession =
        mergeAvailabilityIntoSession(
          salesSession,
          availability
        );

      salesSession.leadScore =
        calculateLeadScore(salesSession);

      smartContext =
        buildSmartConciergeContext(
          conversationContext,
          guestPreferences,
          salesSession
        );

      input.push({
        type: "function_call_output",
        call_id: functionCall.call_id,
        output: JSON.stringify(
          availability
        ),
      });
    }

    response = await callOpenAI(
      apiKey,
      model,
      input,
      signal,
      salesSession,
      memoryContext,
      request.channel,
      conversationContext,
      smartContext,
      conversationMessages,
      liveWeatherContext,
      learnedAnswersContext
    );
  }

  const generatedAnswer =
    extractOutputText(response);

  const rawAnswer =
    generatedAnswer || fallbackAnswer();

  /*
   * RC11.6 — QUALITY GATE
   *
   * Ultima verificare înainte ca răspunsul
   * să fie salvat și trimis clientului.
   */
  const quality = applyQualityGate(
    rawAnswer,
    conversationContext,
    latestUserMessage
  );

  const answer = quality.answer;

  const normalizedAnswer =
    answer.toLocaleLowerCase("ro-RO");

  const indicatesUnknownAnswer =
    !generatedAnswer ||
    quality.blocked ||
    normalizedAnswer.includes(
      "trebuie confirmat"
    ) ||
    normalizedAnswer.includes(
      "trebuie confirmată"
    ) ||
    normalizedAnswer.includes(
      "trebuie verificat"
    ) ||
    normalizedAnswer.includes(
      "trebuie verificată"
    ) ||
    normalizedAnswer.includes(
      "nu am această informație"
    ) ||
    normalizedAnswer.includes(
      "nu am aceasta informatie"
    ) ||
    normalizedAnswer.includes(
      "nu pot confirma"
    ) ||
    normalizedAnswer.includes(
      "este necesară confirmarea"
    ) ||
    normalizedAnswer.includes(
      "este necesara confirmarea"
    );

  if (indicatesUnknownAnswer) {
    await analyticsService.logUnknownQuestion(
      analyticsContext,
      {
        question:
          latestUserMessage.slice(0, 500),
        reason: quality.blocked
          ? `quality_gate_${quality.reason ?? "blocked"}`
          : generatedAnswer
            ? "needs_property_confirmation"
            : "empty_model_response",
        context: conversationContext.type,
      }
    );
  }

  await upsertAiLead({
    conversationId,
    messages: [
      ...conversationMessages,
      {
        role: "assistant",
        content: answer,
      },
    ],
    sales: salesSession,
    availability,
  });

  return {
    ok: true,
    answer,
    availability,
    sales: {
      intent: salesSession.intent,
      stage: salesSession.stage,
      profile: salesSession.profile,
      leadScore: salesSession.leadScore,
    },
  };
}