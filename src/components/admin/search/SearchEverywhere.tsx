"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BedDouble,
  CalendarDays,
  Command,
  CreditCard,
  Loader2,
  Search,
  UserRound,
  X,
} from "lucide-react";

type SearchResult = {
  id: string;
  type: "reservation" | "guest" | "apartment" | "payment" | "booking";
  title: string;
  subtitle: string;
  meta?: string;
  href: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const typeConfig = {
  reservation: { label: "Rezervări", icon: CalendarDays },
  guest: { label: "Clienți", icon: UserRound },
  apartment: { label: "Apartamente", icon: BedDouble },
  payment: { label: "Încasări", icon: CreditCard },
  booking: { label: "Booking", icon: CalendarDays },
} as const;

export default function SearchEverywhere({
  open,
  onOpenChange,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    function onKeyboard(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }

      if (event.key === "Escape" && open) {
        onOpenChange(false);
      }
    }

    window.addEventListener("keydown", onKeyboard);
    return () => window.removeEventListener("keydown", onKeyboard);
  }, [onOpenChange, open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => inputRef.current?.focus(), 30);

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const trimmed = query.trim();
    const digitCount = trimmed.replace(/\D/g, "").length;
    if (trimmed.length < 2 && digitCount < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/admin/search?q=${encodeURIComponent(trimmed)}`,
          { cache: "no-store", signal: controller.signal }
        );
        const payload = (await response.json()) as {
          ok: boolean;
          results?: SearchResult[];
        };

        if (!response.ok || !payload.ok) {
          throw new Error("Căutarea nu a putut fi efectuată.");
        }

        setResults(payload.results ?? []);
        setSelectedIndex(0);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, query]);

  const groups = useMemo(() => {
    const map = new Map<SearchResult["type"], SearchResult[]>();
    for (const result of results) {
      const current = map.get(result.type) ?? [];
      current.push(result);
      map.set(result.type, current);
    }
    return [...map.entries()];
  }, [results]);

  function openResult(result: SearchResult) {
    onOpenChange(false);
    router.push(result.href);
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((index) => Math.min(index + 1, results.length - 1));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((index) => Math.max(index - 1, 0));
    }

    if (event.key === "Enter" && results[selectedIndex]) {
      event.preventDefault();
      openResult(results[selectedIndex]);
    }
  }

  if (!open) return null;

  let flatIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center bg-[#020A12]/60 px-3 pt-[8vh] backdrop-blur-sm sm:px-6"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onOpenChange(false);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Caută în Breeze PMS"
        className="flex max-h-[78vh] w-full max-w-3xl flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_32px_100px_rgba(2,10,18,0.35)] ring-1 ring-black/5"
      >
        <div className="flex items-center gap-3 border-b border-black/5 px-4 py-4 sm:px-5">
          {loading ? (
            <Loader2 className="shrink-0 animate-spin text-[#158F91]" size={21} />
          ) : (
            <Search className="shrink-0 text-[#158F91]" size={21} />
          )}

          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Caută nume, telefon, email, cod, apartament..."
            className="min-w-0 flex-1 bg-transparent text-base font-bold text-[#071B2D] outline-none placeholder:text-gray-400 sm:text-lg"
          />

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4F3EE] text-[#071B2D] transition hover:bg-[#071B2D] hover:text-white"
            aria-label="Închide căutarea"
          >
            <X size={17} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          {!query.trim() ? (
            <div className="grid place-items-center py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E9F8F8] text-[#158F91]">
                <Command size={25} />
              </div>
              <p className="mt-4 font-black text-[#071B2D]">Search Everywhere</p>
              <p className="mt-1 max-w-sm text-sm font-semibold leading-6 text-gray-500">
                Caută instant în rezervări, clienți, apartamente, încasări și Booking.
              </p>
            </div>
          ) : null}

          {query.trim() && !loading && results.length === 0 ? (
            <div className="grid place-items-center py-14 text-center">
              <p className="font-black text-[#071B2D]">Nu am găsit rezultate</p>
              <p className="mt-1 text-sm font-semibold text-gray-500">
                Încearcă un nume, un număr de telefon sau un cod de rezervare.
              </p>
            </div>
          ) : null}

          <div className="grid gap-4">
            {groups.map(([type, items]) => {
              const config = typeConfig[type];
              const Icon = config.icon;

              return (
                <div key={type}>
                  <div className="mb-2 flex items-center gap-2 px-2 text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                    <Icon size={13} />
                    {config.label}
                  </div>

                  <div className="grid gap-1">
                    {items.map((result) => {
                      flatIndex += 1;
                      const currentIndex = flatIndex;
                      const active = currentIndex === selectedIndex;

                      return (
                        <button
                          key={result.id}
                          type="button"
                          onMouseEnter={() => setSelectedIndex(currentIndex)}
                          onClick={() => openResult(result)}
                          className={`flex w-full items-start justify-between gap-4 rounded-2xl px-4 py-3 text-left transition ${
                            active
                              ? "bg-[#071B2D] text-white"
                              : "bg-[#FAFAF7] text-[#071B2D] hover:bg-[#E9F8F8]"
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black">{result.title}</p>
                            <p
                              className={`mt-1 truncate text-xs font-semibold ${
                                active ? "text-white/65" : "text-gray-500"
                              }`}
                            >
                              {result.subtitle}
                            </p>
                          </div>

                          {result.meta ? (
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black ${
                                active
                                  ? "bg-white/10 text-white"
                                  : "bg-white text-gray-600 ring-1 ring-black/5"
                              }`}
                            >
                              {result.meta}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-black/5 bg-[#FAFAF7] px-4 py-3 text-[10px] font-black text-gray-500 sm:px-5">
          <span>↑↓ navigare · Enter deschide · Esc închide</span>
          <span className="rounded-lg bg-white px-2 py-1 ring-1 ring-black/5">Ctrl K</span>
        </footer>
      </section>
    </div>
  );
}
