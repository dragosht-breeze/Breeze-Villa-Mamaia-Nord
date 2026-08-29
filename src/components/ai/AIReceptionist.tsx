"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FormEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  LoaderCircle,
  MessageCircle,
  Send,
  Users,
  X,
} from "lucide-react";

type AvailabilityRecommendation = {
  id: string;
  apartmentCount: number;
  apartments: Array<{
    slug: string;
    title: string;
    shortTitle: string;
    guests: number;
    surface: number;
    floor: string;
    view: string;
  }>;
  totalCapacity: number;
  totalPrice: number;
  averageNightPrice: number;
  reason: string;
  isRecommended: boolean;
};

type AvailabilitySummary = {
  ok: boolean;
  checkIn: string;
  checkOut: string;
  adults: number;
  childAges: number[];
  nights: number;
  message?: string;
  recommendations: AvailabilityRecommendation[];
};

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
  availability?: AvailabilitySummary;
};

type ApiMessage = {
  role: "assistant" | "user";
  content: string;
};

type ReceptionistResponse = {
  ok?: boolean;
  answer?: string;
  message?: string;
  availability?: AvailabilitySummary;
};

type StoredChatSession = {
  version: 1;
  conversationId: string;
  messages: ChatMessage[];
};

const CHAT_STORAGE_KEY = "breeze-ai-chat-v1";

const WHATSAPP_URL =
  "https://wa.me/40723253405?text=Bun%C4%83%20ziua!%20Doresc%20informa%C8%9Bii%20despre%20o%20rezervare%20la%20Breeze%20Villa.";

const quickQuestions = [
  "Aveți disponibilitate pentru o familie?",
  "Cât este până la plajă?",
  "Acceptați carduri de vacanță?",
  "Care sunt orele de check-in?",
];

const welcomeMessage: ChatMessage = {
  id: 1,
  role: "assistant",
  text: "Bun venit la Breeze Villa! Pot verifica inclusiv disponibilitatea reală. Spune-mi perioada, numărul de adulți și vârstele copiilor.",
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("ro-RO").format(value);
}

function buildBookingUrl(availability: AvailabilitySummary) {
  const params = new URLSearchParams({
    checkIn: availability.checkIn,
    checkOut: availability.checkOut,
    adults: String(availability.adults),
    ages: availability.childAges.join(","),
  });

  const recommendation = availability.recommendations[0];

  if (recommendation) {
    params.set("recommendation", recommendation.id);
  }

  return `/rezervare?${params.toString()}`;
}

function createConversationId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `breeze-${crypto.randomUUID()}`;
  }

  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    const bytes = new Uint32Array(4);
    crypto.getRandomValues(bytes);

    return `breeze-${Array.from(bytes)
      .map((value) => value.toString(36))
      .join("-")}`;
  }

  return "breeze-session";
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;

  const message = value as Partial<ChatMessage>;

  return (
    typeof message.id === "number" &&
    (message.role === "assistant" || message.role === "user") &&
    typeof message.text === "string"
  );
}

function readStoredSession(): StoredChatSession | null {
  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);

    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredChatSession>;

    if (
      parsed.version !== 1 ||
      typeof parsed.conversationId !== "string" ||
      !Array.isArray(parsed.messages)
    ) {
      return null;
    }

    const messages = parsed.messages
      .filter(isChatMessage)
      .slice(-50);

    if (messages.length === 0) return null;

    return {
      version: 1,
      conversationId: parsed.conversationId,
      messages,
    };
  } catch {
    return null;
  }
}

function persistSession(
  conversationId: string,
  messages: ChatMessage[]
) {
  try {
    const payload: StoredChatSession = {
      version: 1,
      conversationId,
      messages: messages.slice(-50),
    };

    window.localStorage.setItem(
      CHAT_STORAGE_KEY,
      JSON.stringify(payload)
    );
  } catch {
    // Chatul continuă să funcționeze și dacă storage-ul browserului este blocat.
  }
}


function MessageText({ text, isUser }: { text: string; isUser: boolean }) {
  const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g;
  const parts: Array<{ type: "text" | "link"; value: string; label?: string }> = [];
  let lastIndex = 0;

  for (const match of text.matchAll(linkPattern)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, index) });
    }

    const markdownUrl = match[2];
    const plainUrl = match[3];
    parts.push({
      type: "link",
      value: markdownUrl ?? plainUrl,
      label: match[1] ?? "Deschide linkul",
    });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return (
    <div
      className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
        isUser
          ? "rounded-br-md bg-[#0F4C81] text-white"
          : "rounded-bl-md bg-white text-[#243442] ring-1 ring-black/5"
      }`}
    >
      {parts.map((part, index) =>
        part.type === "link" ? (
          <a
            key={`${part.value}-${index}`}
            href={part.value}
            target="_blank"
            rel="noopener noreferrer"
            className={`my-1 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-black underline-offset-2 transition hover:underline ${
              isUser
                ? "bg-white/15 text-white"
                : "bg-[#E9F8F8] text-[#0F4C81]"
            }`}
          >
            {part.label}
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        ) : (
          <span key={`text-${index}`}>{part.value}</span>
        )
      )}
    </div>
  );
}

function AvailabilityCard({
  availability,
}: {
  availability: AvailabilitySummary;
}) {
  if (!availability.ok || availability.recommendations.length === 0) {
    return null;
  }

  const recommendation = availability.recommendations[0];

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-[#27C5C3]/25 bg-[#F4FBFB] p-4 text-[#071B2D] shadow-sm">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#158F91]">
        <CheckCircle2 size={16} aria-hidden="true" />
        Disponibilitate verificată
      </div>

      <p className="mt-3 text-sm font-black">
        {recommendation.apartments
          .map((apartment) => apartment.shortTitle)
          .join(" + ")}
      </p>

      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-black/5">
          <CalendarDays size={13} aria-hidden="true" />
          {availability.nights} nopți
        </span>

        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-black/5">
          <Users size={13} aria-hidden="true" />
          {recommendation.totalCapacity} locuri
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">
            Total sejur
          </p>
          <p className="mt-1 text-xl font-black text-[#0F4C81]">
            {formatMoney(recommendation.totalPrice)} lei
          </p>
        </div>

        <Link
          href={buildBookingUrl(availability)}
          className="rounded-xl bg-[#D9B56D] px-4 py-2.5 text-xs font-black text-[#071B2D] transition hover:bg-[#E4C57F]"
        >
          Vezi opțiunile
        </Link>
      </div>
    </div>
  );
}

export default function AIReceptionist() {
  const pathname = usePathname();
  const nextId = useRef(2);
  const conversationId = useRef("");
  const sessionLoaded = useRef(false);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);

  const hidden = useMemo(
    () =>
      pathname.startsWith("/admin") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/checkout"),
    [pathname]
  );

  if (hidden) return null;

  function ensureSession() {
    if (sessionLoaded.current) {
      return conversationId.current;
    }

    const stored = readStoredSession();

    if (stored) {
      conversationId.current = stored.conversationId;
      nextId.current =
        Math.max(...stored.messages.map((message) => message.id), 1) + 1;
      setMessages(stored.messages);
    } else {
      conversationId.current = createConversationId();
      persistSession(conversationId.current, [welcomeMessage]);
    }

    sessionLoaded.current = true;

    return conversationId.current;
  }

  function openChat() {
    ensureSession();
    setOpen(true);
  }

  async function submitMessage(text: string) {
    const cleanText = text.trim();

    if (!cleanText || sending) return;

    const activeConversationId = ensureSession();

    const userMessage: ChatMessage = {
      id: nextId.current++,
      role: "user",
      text: cleanText,
    };

    const conversationWithUser = [...messages, userMessage];

    setMessages(conversationWithUser);
    persistSession(activeConversationId, conversationWithUser);
    setInput("");
    setSending(true);

    const apiMessages: ApiMessage[] = conversationWithUser
      .slice(-10)
      .map((message) => ({
        role: message.role,
        content: message.text,
      }));

    try {
      const response = await fetch("/api/ai/receptionist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          conversationId: activeConversationId,
        }),
      });

      const data = (await response.json()) as ReceptionistResponse;

      const answer =
        data.answer ??
        data.message ??
        "Nu am reușit să răspund acum. Poți folosi pagina de rezervare sau WhatsApp.";

      setMessages((current) => {
        const nextMessages = [
          ...current,
          {
            id: nextId.current++,
            role: "assistant" as const,
            text: answer,
            availability: data.availability,
          },
        ];

        persistSession(activeConversationId, nextMessages);

        return nextMessages;
      });
    } catch {
      setMessages((current) => {
        const nextMessages = [
          ...current,
          {
            id: nextId.current++,
            role: "assistant" as const,
            text: "Conexiunea cu recepția virtuală nu este disponibilă momentan. Pentru ajutor rapid, scrie-ne pe WhatsApp la 0723 253 405.",
          },
        ];

        persistSession(activeConversationId, nextMessages);

        return nextMessages;
      });
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitMessage(input);
  }

  return (
    <div className="fixed bottom-4 right-4 z-[90] sm:bottom-6 sm:right-6">
      {open ? (
        <section
          aria-label="Recepționer virtual Breeze Villa"
          className="flex h-[min(680px,calc(100vh-2rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.8rem] border border-white/10 bg-white shadow-[0_30px_90px_rgba(7,27,45,0.30)]"
        >
          <header className="relative overflow-hidden bg-[#071B2D] px-5 py-5 text-white">
            <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[#27C5C3]/20 blur-2xl" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#27C5C3] text-white shadow-lg">
                  <MessageCircle size={22} aria-hidden="true" />
                </div>

                <div>
                  <p className="text-base font-black">Recepția Breeze</p>
                  <p className="mt-0.5 text-xs text-white/65">
                    AI cu disponibilitate live
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Închide conversația"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </header>

          <div
            className="flex-1 space-y-3 overflow-y-auto bg-[#F7F8F6] px-4 py-5"
            aria-live="polite"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="max-w-[88%]">
                  <MessageText
                    text={message.text}
                    isUser={message.role === "user"}
                  />

                  {message.availability && (
                    <AvailabilityCard availability={message.availability} />
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-gray-500 shadow-sm ring-1 ring-black/5">
                  <LoaderCircle
                    size={16}
                    className="animate-spin text-[#158F91]"
                    aria-hidden="true"
                  />
                  Verific disponibilitatea…
                </div>
              </div>
            )}

            {messages.length === 1 && !sending && (
              <div className="pt-2">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-gray-400">
                  Întrebări rapide
                </p>

                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => void submitMessage(question)}
                      className="rounded-full border border-[#0F4C81]/10 bg-white px-3 py-2 text-left text-xs font-bold text-[#0F4C81] shadow-sm transition hover:border-[#27C5C3] hover:bg-[#E9F8F8]"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-black/5 bg-white p-4">
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <label className="sr-only" htmlFor="breeze-ai-message">
                Scrie întrebarea ta
              </label>

              <textarea
                id="breeze-ai-message"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    void submitMessage(input);
                  }
                }}
                rows={1}
                maxLength={1_000}
                disabled={sending}
                placeholder="Ex: 12–16 august, 2 adulți și 2 copii..."
                className="min-h-12 max-h-28 flex-1 resize-none rounded-2xl border border-black/10 bg-[#FAFAF7] px-4 py-3 text-sm text-[#071B2D] outline-none transition placeholder:text-gray-400 focus:border-[#27C5C3] focus:ring-4 focus:ring-[#27C5C3]/10 disabled:opacity-60"
              />

              <button
                type="submit"
                aria-label="Trimite mesajul"
                disabled={!input.trim() || sending}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D9B56D] text-[#071B2D] transition hover:-translate-y-0.5 hover:bg-[#E4C57F] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? (
                  <LoaderCircle
                    size={19}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Send size={19} aria-hidden="true" />
                )}
              </button>
            </form>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                href="/rezervare"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071B2D] px-3 py-2.5 text-xs font-black text-white transition hover:bg-[#0F4C81]"
              >
                <CalendarDays size={15} aria-hidden="true" />
                Disponibilitate
              </Link>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-xs font-black text-white transition hover:bg-[#20C45A]"
              >
                <MessageCircle size={15} aria-hidden="true" />
                WhatsApp
              </a>
            </div>

            <p className="mt-3 text-center text-[10px] leading-4 text-gray-400">
              Conversația este păstrată pe acest dispozitiv.
            </p>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={openChat}
          aria-label="Deschide recepționerul virtual Breeze Villa"
          className="group flex items-center gap-3 rounded-full border border-white/20 bg-[#071B2D] p-2.5 pr-4 text-white shadow-[0_16px_45px_rgba(7,27,45,0.35)] transition hover:-translate-y-1 hover:bg-[#0F4C81]"
        >
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#27C5C3] shadow-lg">
            <MessageCircle size={23} aria-hidden="true" />
            <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-[#071B2D] bg-[#25D366]" />
          </span>

          <span className="hidden text-left sm:block">
            <span className="block text-sm font-black">
              Verifică disponibilitatea
            </span>
            <span className="block text-[11px] text-white/65">
              Întreabă Recepția Breeze
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
