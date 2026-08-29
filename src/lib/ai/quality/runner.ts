import {
  detectGenericLocalCategory,
  isAffirmativeReply,
  isNegativeReply,
  isShortFollowUp,
  mergeConversationHistory,
  resolveDeterministicLocalGuideAnswer,
} from "@/lib/ai/conversation-reliability";
import { detectConversationContext } from "@/lib/ai/context";
import { conversationNeedsLiveWeather } from "@/lib/ai/live";
import {
  buildSmartConciergeContext,
  detectGuestPreferences,
} from "@/lib/ai/smart";
import { buildSalesSession } from "@/lib/ai/brain";
import type { GatewayMessage } from "@/lib/ai/gateway/types";
import type {
  AiQualityCaseResult,
  AiQualityReport,
} from "./types";

type TestCase = {
  id: string;
  group: string;
  title: string;
  expected: string;
  run: () => string;
};

const user = (content: string): GatewayMessage => ({
  role: "user",
  content,
});

const assistant = (content: string): GatewayMessage => ({
  role: "assistant",
  content,
});

const contextCases: Array<[string, string]> = [
  ["Vreau să rezerv pentru august", "BOOKING"],
  ["Aveți liber între 10 și 14 august?", "SEARCHING"],
  ["Am deja o rezervare", "HAS_RESERVATION"],

  [
    "Avem rezervare și venim săptămâna viitoare",
    "PRE_STAY",
  ],

  ["Ajungem mâine la ora 11", "CHECKING_IN"],

  ["Suntem deja cazați la vilă", "IN_STAY"],

  ["Aerul condiționat nu merge", "SUPPORT"],

  [
    "Mâine facem check-out, unde lăsăm cheia?",
    "CHECK_OUT",
  ],

  [
    "Am plecat și cred că am uitat încărcătorul în apartament",
    "POST_STAY",
  ],

  [
    "Ați primit avansul meu?",
    "HUMAN_HANDOFF",
  ],

  [
    "Vreau să vorbesc cu proprietarul",
    "HUMAN_HANDOFF",
  ],

  ["Unde putem mânca pește?", "LOCAL_GUIDE"],

  ["Bună", "UNKNOWN"],
];

const cases: TestCase[] = [
  /*
   * CONTEXT ROUTER
   */
  ...contextCases.map(
    ([message, expected], index) => ({
      id: `context-${index + 1}`,
      group: "Context",
      title: message,
      expected,
      run: () =>
        detectConversationContext([
          user(message),
        ]).type,
    })
  ),

  /*
   * CONTEXT — PRIORITATEA MESAJULUI CURENT
   */
  {
    id: "context-support-over-booking",
    group: "Context",
    title:
      "Suportul curent are prioritate față de conversația comercială anterioară",
    expected: "SUPPORT",
    run: () =>
      detectConversationContext([
        user(
          "Caut cazare pentru 2 adulți și 2 copii"
        ),
        assistant(
          "Sigur, pentru ce perioadă?"
        ),
        user(
          "Suntem deja aici și aerul condiționat nu merge"
        ),
      ]).type,
  },

  {
    id: "context-checkout-over-reservation",
    group: "Context",
    title:
      "Check-out-ul curent are prioritate față de simpla existență a rezervării",
    expected: "CHECK_OUT",
    run: () =>
      detectConversationContext([
        user("Avem rezervare la voi"),
        assistant(
          "Cu ce vă pot ajuta?"
        ),
        user(
          "Mâine facem check-out, unde lăsăm cheia?"
        ),
      ]).type,
  },

  {
    id: "context-handoff-payment",
    group: "Context",
    title:
      "Verificarea avansului necesită human handoff",
    expected: "HUMAN_HANDOFF",
    run: () =>
      detectConversationContext([
        user(
          "Ați primit avansul meu?"
        ),
      ]).type,
  },

  /*
   * FOLLOW-UP
   */
  ...[
    "da",
    "Da, te rog",
    "ok",
    "sigur",
    "perfect",
    "vă rog",
  ].map((message, index) => ({
    id: `affirmative-${index + 1}`,
    group: "Follow-up",
    title: `Recunoaște răspuns afirmativ: ${message}`,
    expected: "true",
    run: () =>
      String(isAffirmativeReply(message)),
  })),

  ...[
    "nu",
    "nu mulțumesc",
    "nu merci",
  ].map((message, index) => ({
    id: `negative-${index + 1}`,
    group: "Follow-up",
    title: `Recunoaște răspuns negativ: ${message}`,
    expected: "true",
    run: () =>
      String(isNegativeReply(message)),
  })),

  ...[
    "da",
    "prima",
    "cea mai apropiată",
    "al doilea",
  ].map((message, index) => ({
    id: `short-${index + 1}`,
    group: "Follow-up",
    title: `Păstrează continuitatea pentru: ${message}`,
    expected: "true",
    run: () =>
      String(isShortFollowUp(message)),
  })),

  /*
   * GHID LOCAL
   */
  ...[
    ["Unde este o șaormerie?", "șaormerii"],
    ["Vreau pizza", "pizzerii"],
    ["Unde găsim un burger?", "burgeri"],
    ["Există o cofetărie?", "cofetării"],
    ["Caut un bancomat", "bancomate"],
    ["Unde bem o cafea?", "cafenele"],
  ].map(([message, expected], index) => ({
    id: `local-${index + 1}`,
    group: "Ghid local",
    title: message,
    expected,
    run: () =>
      detectGenericLocalCategory(message)?.label ??
      "none",
  })),

  {
    id: "local-followup-map",
    group: "Ghid local",
    title:
      "«da» continuă cererea despre șaormerie",
    expected: "maps-link",
    run: () => {
      const answer =
        resolveDeterministicLocalGuideAnswer(
          [
            user(
              "Unde găsesc o șaormerie?"
            ),
            assistant(
              "Pot să îți deschid opțiunile în Google Maps."
            ),
            user("da"),
          ],
          "website"
        );

      return answer?.includes(
        "google.com/maps"
      )
        ? "maps-link"
        : "missing";
    },
  },

  /*
   * MEMORIE / ISTORIC
   */
  {
    id: "history-dedup",
    group: "Memorie",
    title:
      "Nu dublează mesajele suprapuse",
    expected: "3",
    run: () =>
      String(
        mergeConversationHistory(
          [
            user("Bună"),
            assistant("Bună ziua"),
          ],
          [
            assistant("Bună ziua"),
            user("Aveți liber?"),
          ],
          10
        ).length
      ),
  },

  {
    id: "history-limit",
    group: "Memorie",
    title:
      "Respectă limita istoricului",
    expected: "4",
    run: () =>
      String(
        mergeConversationHistory(
          [
            user("1"),
            assistant("2"),
            user("3"),
          ],
          [
            assistant("4"),
            user("5"),
            assistant("6"),
          ],
          4
        ).length
      ),
  },

  /*
   * VREME LIVE
   */
  ...[
    ["Cum este vremea azi?", "true"],
    [
      "Putem merge la plajă mâine?",
      "true",
    ],
    [
      "La ce oră răsare soarele?",
      "true",
    ],
    ["Aveți parcare?", "false"],
  ].map(([message, expected], index) => ({
    id: `weather-${index + 1}`,
    group: "Vreme",
    title: message,
    expected,
    run: () =>
      String(
        conversationNeedsLiveWeather([
          user(message),
        ])
      ),
  })),

  /*
   * PROFIL CLIENT
   */
  {
    id: "profile-family",
    group: "Profil client",
    title:
      "Detectează familie și vârstele copiilor",
    expected: "family|3,7|true",
    run: () => {
      const profile =
        detectGuestPreferences([
          user(
            "Suntem 2 adulți și copii de 3 și 7 ani"
          ),
        ]);

      return `${profile.travelStyle}|${profile.childAges.join(
        ","
      )}|${profile.hasSmallChildren}`;
    },
  },

  {
    id: "profile-couple",
    group: "Profil client",
    title:
      "Detectează cuplu care dorește liniște",
    expected: "couple|true",
    run: () => {
      const profile =
        detectGuestPreferences([
          user(
            "Suntem un cuplu și vrem liniște"
          ),
        ]);

      return `${profile.travelStyle}|${profile.wantsQuiet}`;
    },
  },

  {
    id: "profile-budget",
    group: "Profil client",
    title: "Extrage bugetul",
    expected: "2500",
    run: () =>
      String(
        detectGuestPreferences([
          user(
            "Avem buget maxim 2500 lei"
          ),
        ]).budget
      ),
  },

  {
    id: "profile-pool",
    group: "Profil client",
    title:
      "Detectează preferința pentru piscină",
    expected: "true",
    run: () =>
      String(
        detectGuestPreferences([
          user("Vrem neapărat piscină"),
        ]).wantsPool
      ),
  },

  /*
   * SMART CONCIERGE — GUARDRAILS
   */
  {
    id: "smart-support-no-upsell",
    group: "Smart Concierge",
    title:
      "Nu permite upsell într-o conversație de suport",
    expected: "0",
    run: () => {
      const messages = [
        user(
          "Suntem cazați și aerul condiționat nu merge"
        ),
      ];

      const context =
        detectConversationContext(messages);

      const preferences =
        detectGuestPreferences(messages);

      const session =
        buildSalesSession(messages);

      const smart =
        buildSmartConciergeContext(
          context,
          preferences,
          session
        );

      return String(
        smart.suitableUpsells.length
      );
    },
  },

  {
    id: "smart-handoff-no-upsell",
    group: "Smart Concierge",
    title:
      "Nu permite upsell când este necesară intervenția umană",
    expected: "0",
    run: () => {
      const messages = [
        user(
          "Ați primit avansul meu?"
        ),
      ];

      const context =
        detectConversationContext(messages);

      const preferences =
        detectGuestPreferences(messages);

      const session =
        buildSalesSession(messages);

      const smart =
        buildSmartConciergeContext(
          context,
          preferences,
          session
        );

      return String(
        smart.suitableUpsells.length
      );
    },
  },

  {
    id: "smart-checkout-controlled-upsell",
    group: "Smart Concierge",
    title:
      "Check-out-ul permite doar sugestii contextuale controlate",
    expected: "true",
    run: () => {
      const messages = [
        user(
          "Mâine facem check-out, putem pleca mai târziu?"
        ),
      ];

      const context =
        detectConversationContext(messages);

      const preferences =
        detectGuestPreferences(messages);

      const session =
        buildSalesSession(messages);

      const smart =
        buildSmartConciergeContext(
          context,
          preferences,
          session
        );

      return String(
        smart.suitableUpsells.some(
          (item) =>
            item
              .toLocaleLowerCase("ro-RO")
              .includes("late check-out")
        )
      );
    },
  },

  {
    id: "smart-poststay-no-forced-review",
    group: "Smart Concierge",
    title:
      "Post-sejur evită review-ul când există o problemă",
    expected: "true",
    run: () => {
      const messages = [
        user(
          "Am plecat și cred că am uitat încărcătorul în apartament"
        ),
      ];

      const context =
        detectConversationContext(messages);

      const preferences =
        detectGuestPreferences(messages);

      const session =
        buildSalesSession(messages);

      const smart =
        buildSmartConciergeContext(
          context,
          preferences,
          session
        );

      return String(
        smart.avoid.some(
          (item) =>
            item
              .toLocaleLowerCase("ro-RO")
              .includes(
                "nu cere review"
              )
        )
      );
    },
  },
];

export function runAiQualitySuite(): AiQualityReport {
  const results: AiQualityCaseResult[] =
    cases.map((test) => {
      let actual = "";

      try {
        actual = test.run();
      } catch (error) {
        actual =
          error instanceof Error
            ? `ERROR: ${error.message}`
            : "ERROR";
      }

      return {
        id: test.id,
        group: test.group,
        title: test.title,
        expected: test.expected,
        actual,
        status:
          actual === test.expected
            ? "passed"
            : "failed",
      };
    });

  const groupNames = [
    ...new Set(
      results.map(
        (result) => result.group
      )
    ),
  ];

  const groups = groupNames.map(
    (name) => {
      const groupResults =
        results.filter(
          (result) =>
            result.group === name
        );

      const passed =
        groupResults.filter(
          (result) =>
            result.status === "passed"
        ).length;

      return {
        name,
        total: groupResults.length,
        passed,
        failed:
          groupResults.length -
          passed,
      };
    }
  );

  const passed =
    results.filter(
      (result) =>
        result.status === "passed"
    ).length;

  return {
    generatedAt:
      new Date().toISOString(),

    total: results.length,

    passed,

    failed:
      results.length - passed,

    passRate: results.length
      ? Math.round(
          (passed / results.length) *
            100
        )
      : 0,

    groups,

    results,
  };
}