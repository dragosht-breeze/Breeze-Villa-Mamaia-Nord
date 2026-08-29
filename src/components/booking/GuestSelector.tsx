"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Baby,
  Check,
  ChevronDown,
  Minus,
  Plus,
  Users,
  X,
} from "lucide-react";

type GuestSelectorProps = {
  adults: number;
  childAges: number[];
  onAdultsChange: (value: number) => void;
  onChildAgesChange: (ages: number[]) => void;
  maxGuests?: number;
  minAdults?: number;
  disabled?: boolean;
};

type GuestSelectorModalProps = {
  adults: number;
  childAges: number[];
  maxGuests: number;
  minAdults: number;
  summary: string;
  totalGuests: number;
  onAdultsChange: (value: number) => void;
  onChildAgesChange: (ages: number[]) => void;
  onClose: () => void;
};

const CHILD_AGE_OPTIONS = Array.from(
  { length: 18 },
  (_, value) => value
);

function pluralize(
  value: number,
  singular: string,
  plural: string
) {
  return value === 1 ? singular : plural;
}

const GuestSelectorModal = memo(function GuestSelectorModal({
  adults,
  childAges,
  maxGuests,
  minAdults,
  summary,
  totalGuests,
  onAdultsChange,
  onChildAgesChange,
  onClose,
}: GuestSelectorModalProps) {
  const children = childAges.length;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const decreaseAdults = useCallback(() => {
    if (adults <= minAdults) {
      return;
    }

    onAdultsChange(adults - 1);
  }, [adults, minAdults, onAdultsChange]);

  const increaseAdults = useCallback(() => {
    if (totalGuests >= maxGuests) {
      return;
    }

    onAdultsChange(adults + 1);
  }, [adults, maxGuests, onAdultsChange, totalGuests]);

  const decreaseChildren = useCallback(() => {
    if (children <= 0) {
      return;
    }

    onChildAgesChange(childAges.slice(0, -1));
  }, [childAges, children, onChildAgesChange]);

  const increaseChildren = useCallback(() => {
    if (totalGuests >= maxGuests) {
      return;
    }

    onChildAgesChange([...childAges, 5]);
  }, [
    childAges,
    maxGuests,
    onChildAgesChange,
    totalGuests,
  ]);

  const updateChildAge = useCallback(
    (index: number, age: number) => {
      onChildAgesChange(
        childAges.map((currentAge, currentIndex) =>
          currentIndex === index ? age : currentAge
        )
      );
    },
    [childAges, onChildAgesChange]
  );

  return (
    <div
      className="fixed inset-0 z-[140] flex items-end justify-center bg-[#020A12]/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Selectează numărul de oaspeți"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:max-h-[88vh] sm:rounded-[2rem]">
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#071B2D] px-5 py-5 text-white sm:px-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D9B56D]">
              Componența grupului
            </p>

            <p className="mt-1 text-xl font-black">
              {summary}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Închide selectorul de oaspeți"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white hover:text-[#071B2D]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6">
          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-5 rounded-2xl bg-[#FAFAF7] p-4">
              <div>
                <p className="font-black text-[#071B2D]">
                  Adulți
                </p>

                <p className="mt-1 text-xs font-semibold text-gray-500">
                  Minimum {minAdults}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={decreaseAdults}
                  disabled={adults <= minAdults}
                  aria-label="Scade numărul de adulți"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-[#071B2D] transition hover:border-[#071B2D] hover:bg-[#071B2D] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Minus size={18} />
                </button>

                <span className="w-8 text-center text-lg font-black text-[#071B2D]">
                  {adults}
                </span>

                <button
                  type="button"
                  onClick={increaseAdults}
                  disabled={totalGuests >= maxGuests}
                  aria-label="Crește numărul de adulți"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-[#071B2D] transition hover:border-[#071B2D] hover:bg-[#071B2D] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-5 rounded-2xl bg-[#FAFAF7] p-4">
              <div>
                <p className="font-black text-[#071B2D]">
                  Copii
                </p>

                <p className="mt-1 text-xs font-semibold text-gray-500">
                  Vârsta 0–17 ani
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={decreaseChildren}
                  disabled={children <= 0}
                  aria-label="Scade numărul de copii"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-[#071B2D] transition hover:border-[#071B2D] hover:bg-[#071B2D] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Minus size={18} />
                </button>

                <span className="w-8 text-center text-lg font-black text-[#071B2D]">
                  {children}
                </span>

                <button
                  type="button"
                  onClick={increaseChildren}
                  disabled={totalGuests >= maxGuests}
                  aria-label="Crește numărul de copii"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-[#071B2D] transition hover:border-[#071B2D] hover:bg-[#071B2D] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          {children > 0 ? (
            <div className="mt-5 rounded-[1.4rem] border border-[#158F91]/15 bg-[#E9F8F8] p-4">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#158F91]">
                <Baby size={16} />
                Vârsta copiilor
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {childAges.map((age, index) => (
                  <label
                    key={`guest-child-${index}`}
                    className="grid gap-1.5"
                  >
                    <span className="text-xs font-black text-[#071B2D]">
                      Copil {index + 1}
                    </span>

                    <select
                      value={age}
                      onChange={(event) =>
                        updateChildAge(
                          index,
                          Number(event.target.value)
                        )
                      }
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-black text-[#071B2D] outline-none transition focus:border-[#158F91]"
                    >
                      {CHILD_AGE_OPTIONS.map((value) => (
                        <option key={value} value={value}>
                          {value} {value === 1 ? "an" : "ani"}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>

              <p className="mt-4 text-xs font-semibold leading-5 text-gray-600">
                Copiii de 10 ani sau mai mari sunt calculați ca
                adulți. Copiii sub 10 ani intră în regula de
                ocupare pentru familii.
              </p>
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-black/5 bg-white px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-bold text-gray-500">
              Total: {totalGuests} / {maxGuests} persoane
            </p>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D9B56D] px-6 py-3 text-sm font-black text-[#071B2D] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#071B2D] hover:text-white"
            >
              <Check size={17} />
              Confirmă oaspeții
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

function GuestSelector({
  adults,
  childAges,
  onAdultsChange,
  onChildAgesChange,
  maxGuests = 32,
  minAdults = 1,
  disabled = false,
}: GuestSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const children = childAges.length;
  const totalGuests = adults + children;

  const summary = useMemo(() => {
    const adultText = `${adults} ${pluralize(
      adults,
      "adult",
      "adulți"
    )}`;

    if (children === 0) {
      return adultText;
    }

    return `${adultText} • ${children} ${pluralize(
      children,
      "copil",
      "copii"
    )}`;
  }, [adults, children]);

  const openSelector = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
    }
  }, [disabled]);

  const closeSelector = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={openSelector}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={[
          "flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#158F91]",
          isOpen
            ? "border-[#158F91] bg-white shadow-[0_14px_38px_rgba(7,27,45,0.10)]"
            : "border-black/10 bg-[#FAFAF7] hover:border-[#158F91]/50 hover:bg-white",
          disabled ? "cursor-not-allowed opacity-60" : "",
        ].join(" ")}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E9F8F8] text-[#158F91]">
            <Users size={20} />
          </span>

          <span className="min-w-0">
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-[#158F91]">
              Oaspeți
            </span>

            <span className="mt-1 block truncate text-sm font-black text-[#071B2D] sm:text-base">
              {summary}
            </span>
          </span>
        </span>

        <ChevronDown
          size={20}
          className={`shrink-0 text-[#071B2D] transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <GuestSelectorModal
          adults={adults}
          childAges={childAges}
          maxGuests={maxGuests}
          minAdults={minAdults}
          summary={summary}
          totalGuests={totalGuests}
          onAdultsChange={onAdultsChange}
          onChildAgesChange={onChildAgesChange}
          onClose={closeSelector}
        />
      ) : null}
    </>
  );
}

export default memo(GuestSelector);