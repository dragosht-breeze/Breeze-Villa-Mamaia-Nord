"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import AvailabilityCalendar, { type CalendarSelection } from "@/components/apartments/AvailabilityCalendar";
import type { AvailabilityDay } from "@/data/availability";

type BookingCardProps = {
  title: string;
  slug: string;
  days: AvailabilityDay[];
};

type AvailabilityApiResponse = {
  ok: boolean;
  syncEnabled: boolean;
  syncResults: {
    label: string;
    provider: string;
    ok: boolean;
    eventCount: number;
    message?: string;
  }[];
  days: AvailabilityDay[];
};

type GuestForm = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

const emptySelection: CalendarSelection = {
  checkIn: null,
  checkOut: null,
  nights: 0,
  total: 0,
  minNights: 1,
  hasUnavailableDays: false,
  canRequest: false,
};

const emptyGuestForm: GuestForm = {
  name: "",
  phone: "",
  email: "",
  message: "",
};

function formatDate(dateKey: string | null) {
  if (!dateKey) return "-";

  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateKey}T12:00:00`));
}

function buildWhatsappMessage({
  requestId,
  title,
  selection,
  adults,
  children,
  guestForm,
}: {
  requestId: string;
  title: string;
  selection: CalendarSelection;
  adults: number;
  children: number;
  guestForm: GuestForm;
}) {
  const baseMessage = selection.checkIn && selection.checkOut
    ? `Bună ziua! Am trimis o cerere de rezervare cu avans pentru ${title}.\n\nCod cerere: ${requestId}\nPerioada: ${formatDate(selection.checkIn)} - ${formatDate(selection.checkOut)}\nNopți: ${selection.nights}\nAdulți: ${adults}\nCopii: ${children}\nTotal estimativ: ${selection.total} lei\n\nÎnțeleg că perioada nu este blocată până la confirmarea avansului de către proprietate.`
    : `Bună ziua! Doresc să verific disponibilitatea pentru ${title}.`;

  const guestDetails = [
    guestForm.name ? `Nume: ${guestForm.name}` : "",
    guestForm.phone ? `Telefon: ${guestForm.phone}` : "",
    guestForm.email ? `Email: ${guestForm.email}` : "",
    guestForm.message ? `Mesaj: ${guestForm.message}` : "",
  ].filter(Boolean).join("\n");

  return guestDetails ? `${baseMessage}\n\nDate client:\n${guestDetails}` : baseMessage;
}

function buildCheckoutUrl({
  slug,
  title,
  selection,
  adults,
  children,
  guestForm,
}: {
  slug: string;
  title: string;
  selection: CalendarSelection;
  adults: number;
  children: number;
  guestForm: GuestForm;
}) {
  const params = new URLSearchParams({
    apartment: slug,
    title,
    checkIn: selection.checkIn ?? "",
    checkOut: selection.checkOut ?? "",
    nights: String(selection.nights),
    total: String(selection.total),
    adults: String(adults),
    children: String(children),
    guestName: guestForm.name,
    guestPhone: guestForm.phone,
    guestEmail: guestForm.email,
    guestMessage: guestForm.message,
  });

  return `/checkout?${params.toString()}`;
}

export default function BookingCard({ title, slug, days }: BookingCardProps) {
  const [calendarDays, setCalendarDays] = useState(days);
  const [selection, setSelection] = useState<CalendarSelection>(emptySelection);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [guestForm, setGuestForm] = useState<GuestForm>(emptyGuestForm);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"loading" | "synced" | "manual" | "error">("loading");
  const [syncMessage, setSyncMessage] = useState("Se verifică sincronizarea calendarului...");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadSyncedAvailability() {
      try {
        const response = await fetch(`/api/availability/${slug}`, { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Nu am putut citi disponibilitatea sincronizată.");
        }

        const data = (await response.json()) as AvailabilityApiResponse;

        if (ignore) return;

        setCalendarDays(data.days);

        if (!data.syncEnabled) {
          setSyncStatus("manual");
          setSyncMessage("Calendar local. Adaugă linkul iCal Booking/Airbnb pentru sincronizare automată.");
          return;
        }

        const hasError = data.syncResults.some((item) => !item.ok);
        const importedEvents = data.syncResults.reduce((sum, item) => sum + item.eventCount, 0);

        if (hasError) {
          setSyncStatus("error");
          setSyncMessage("Unele calendare externe nu au putut fi citite. Verifică linkurile iCal.");
          return;
        }

        setSyncStatus("synced");
        setSyncMessage(`Sincronizat cu platformele externe. Evenimente importate: ${importedEvents}.`);
      } catch (error) {
        if (ignore) return;

        setSyncStatus("error");
        setSyncMessage(error instanceof Error ? error.message : "Eroare la sincronizare.");
      }
    }

    loadSyncedAvailability();

    return () => {
      ignore = true;
    };
  }, [slug]);

  const fromPrice = calendarDays.length > 0 ? Math.min(...calendarDays.map((day) => day.price)) : null;
  const minNights = calendarDays.length > 0 ? Math.min(...calendarDays.map((day) => day.minNights)) : null;

  const hasValidGuestDetails = useMemo(() => {
    return guestForm.name.trim().length >= 3 && guestForm.phone.trim().length >= 7;
  }, [guestForm.name, guestForm.phone]);

  const canSubmitDepositRequest = useMemo(() => {
    return selection.canRequest && hasValidGuestDetails && acceptedTerms && !requestSent;
  }, [acceptedTerms, hasValidGuestDetails, requestSent, selection.canRequest]);

  const canPayFull = useMemo(() => {
    return selection.canRequest && hasValidGuestDetails && acceptedTerms;
  }, [acceptedTerms, hasValidGuestDetails, selection.canRequest]);

  const checkoutUrl = canPayFull
    ? buildCheckoutUrl({ slug, title, selection, adults, children, guestForm })
    : "#";

  function updateGuestForm(field: keyof GuestForm, value: string) {
    setGuestForm((current) => ({ ...current, [field]: value }));
    setSubmitMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!acceptedTerms) {
      setSubmitMessage("Pentru a continua trebuie să accepți Termenii și condițiile și Politica de anulare.");
      return;
    }

    if (!canSubmitDepositRequest) {
      setSubmitMessage("Alege perioada și completează cel puțin numele și telefonul.");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch("/api/reservation-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apartmentSlug: slug,
          apartmentTitle: title,
          checkIn: selection.checkIn,
          checkOut: selection.checkOut,
          nights: selection.nights,
          total: selection.total,
          adults,
          children,
          guest: guestForm,
          paymentMode: "deposit_request",
        }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        reservationRequestId?: string;
        message?: string;
      };

      if (!response.ok || !data.ok || !data.reservationRequestId) {
        throw new Error(data.message ?? "Cererea nu a putut fi salvată.");
      }

      const whatsappMessage = buildWhatsappMessage({
        requestId: data.reservationRequestId,
        title,
        selection,
        adults,
        children,
        guestForm,
      });

      setRequestSent(true);
      setSubmitMessage(
        "Cererea dumneavoastră a fost transmisă cu succes. Perioada nu este blocată până la confirmarea avansului de către proprietate. Cererea este valabilă 48 de ore."
      );

      window.open(`https://wa.me/40723253405?text=${encodeURIComponent(whatsappMessage)}`, "_blank", "noopener,noreferrer");
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : "A apărut o eroare.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <aside className="sticky top-28 self-start rounded-[2rem] bg-white p-5 shadow-[0_20px_60px_rgba(7,27,45,0.12)] ring-1 ring-black/5">
      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#158F91]">
        Rezervare directă
      </p>

      <h3 className="mt-4 text-2xl font-black text-[#071B2D]">
        Alege perioada
      </h3>

      <p className="mt-3 text-sm leading-6 text-gray-600">
        Selectează check-in și check-out. Totalul se calculează automat pentru perioada aleasă.
      </p>

      <div
        className={`mt-4 rounded-2xl p-3 text-xs font-bold leading-5 ${
          syncStatus === "synced"
            ? "bg-emerald-50 text-emerald-700"
            : syncStatus === "error"
            ? "bg-red-50 text-red-600"
            : "bg-[#E9F8F8] text-[#071B2D]"
        }`}
      >
        {syncMessage}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#E9F8F8] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#158F91]">De la</p>
          <p className="mt-1 text-xl font-black text-[#071B2D]">{fromPrice ? `${fromPrice} lei` : "-"}</p>
          <p className="text-xs text-gray-600">/ noapte</p>
        </div>

        <div className="rounded-2xl bg-[#FAFAF7] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#158F91]">Minim</p>
          <p className="mt-1 text-xl font-black text-[#071B2D]">{minNights ?? "-"}</p>
          <p className="text-xs text-gray-600">nopți</p>
        </div>
      </div>

      <div className="mt-5">
        <AvailabilityCalendar days={calendarDays} onSelectionChange={setSelection} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <label className="rounded-2xl bg-[#FAFAF7] p-4">
          <span className="text-xs font-black text-[#071B2D]">Adulți</span>
          <select
            value={adults}
            onChange={(event) => setAdults(Number(event.target.value))}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-bold text-[#071B2D] outline-none"
          >
            {[1, 2, 3, 4, 5, 6].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>

        <label className="rounded-2xl bg-[#FAFAF7] p-4">
          <span className="text-xs font-black text-[#071B2D]">Copii</span>
          <select
            value={children}
            onChange={(event) => setChildren(Number(event.target.value))}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-bold text-[#071B2D] outline-none"
          >
            {[0, 1, 2, 3, 4].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 rounded-2xl bg-[#071B2D] p-5 text-white">
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#D9B56D]">
          Rezumat
        </p>

        <div className="mt-4 grid gap-2 text-sm">
          <p>Check-in: <span className="font-black">{formatDate(selection.checkIn)}</span></p>
          <p>Check-out: <span className="font-black">{formatDate(selection.checkOut)}</span></p>
          <p>Nopți: <span className="font-black">{selection.nights || "-"}</span></p>
          <p>Oaspeți: <span className="font-black">{adults} adulți, {children} copii</span></p>
          <p>Total estimativ: <span className="font-black text-[#D9B56D]">{selection.total ? `${selection.total} lei` : "-"}</span></p>
        </div>

        {selection.nights > 0 && selection.nights < selection.minNights && (
          <p className="mt-4 rounded-xl bg-white/10 p-3 text-xs leading-5 text-white/85">
            Minimul pentru perioada selectată este de {selection.minNights} nopți.
          </p>
        )}

        {selection.hasUnavailableDays && (
          <p className="mt-4 rounded-xl bg-white/10 p-3 text-xs leading-5 text-white/85">
            Perioada selectată conține zile ocupate. Alege alt interval.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#158F91]">
          Date pentru rezervare
        </p>

        <input
          value={guestForm.name}
          onChange={(event) => updateGuestForm("name", event.target.value)}
          placeholder="Nume și prenume"
          className="rounded-2xl border border-black/10 bg-[#FAFAF7] px-4 py-3 text-sm font-bold text-[#071B2D] outline-none transition focus:border-[#158F91]"
        />

        <input
          value={guestForm.phone}
          onChange={(event) => updateGuestForm("phone", event.target.value)}
          placeholder="Telefon"
          className="rounded-2xl border border-black/10 bg-[#FAFAF7] px-4 py-3 text-sm font-bold text-[#071B2D] outline-none transition focus:border-[#158F91]"
        />

        <input
          value={guestForm.email}
          onChange={(event) => updateGuestForm("email", event.target.value)}
          placeholder="Email opțional"
          className="rounded-2xl border border-black/10 bg-[#FAFAF7] px-4 py-3 text-sm font-bold text-[#071B2D] outline-none transition focus:border-[#158F91]"
        />

        <textarea
          value={guestForm.message}
          onChange={(event) => updateGuestForm("message", event.target.value)}
          placeholder="Mesaj opțional"
          rows={3}
          className="resize-none rounded-2xl border border-black/10 bg-[#FAFAF7] px-4 py-3 text-sm font-bold text-[#071B2D] outline-none transition focus:border-[#158F91]"
        />

        <label className="flex gap-3 rounded-2xl bg-[#FAFAF7] p-3 text-[11px] font-bold leading-5 text-gray-600">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => {
              setAcceptedTerms(event.target.checked);
              setSubmitMessage(null);
            }}
            className="mt-1 h-4 w-4 shrink-0 accent-[#158F91]"
          />
          <span>
            Am citit și sunt de acord cu {" "}
            <Link href="/politica-anulare" target="_blank" className="font-black text-[#071B2D] underline">
              Termenii și condițiile și Politica de anulare
            </Link>
            .
          </span>
        </label>

        {submitMessage && (
          <p className="rounded-2xl bg-[#E9F8F8] p-3 text-xs font-bold leading-5 text-[#071B2D]">
            {submitMessage}
          </p>
        )}

        <div className="grid gap-3">
          <button
            type="submit"
            disabled={!canSubmitDepositRequest || isSubmitting}
            className="flex w-full justify-center rounded-full bg-[#D9B56D] px-6 py-4 text-sm font-black text-[#071B2D] shadow-xl transition hover:-translate-y-1 hover:bg-[#071B2D] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-[#D9B56D] disabled:hover:text-[#071B2D]"
          >
            {isSubmitting ? "Se trimite cererea..." : requestSent ? "Cererea a fost trimisă" : "Solicită rezervare cu avans"}
          </button>

          <p className="px-2 text-center text-[11px] font-bold leading-5 text-gray-500">
            Rezervarea se confirmă după încasarea și confirmarea avansului de către proprietate. Cererea este valabilă 48 de ore.
          </p>
        </div>
      </form>

      <div className="mt-4 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
        <div className="mb-2 inline-flex rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
          ⚡ Confirmare imediată
        </div>

        <Link
          href={checkoutUrl}
          onClick={(event) => {
            if (!canPayFull) {
              event.preventDefault();
              setSubmitMessage("Alege o perioadă disponibilă, completează numele și telefonul și acceptă Termenii și condițiile pentru plata integrală.");
            }
          }}
          className={`flex w-full justify-center rounded-full px-6 py-4 text-center text-sm font-black shadow-xl transition ${
            canPayFull
              ? "bg-emerald-600 text-white hover:-translate-y-1 hover:bg-[#071B2D]"
              : "cursor-not-allowed bg-emerald-600/45 text-white/80"
          }`}
        >
          Rezervare pe loc cu plată integrală
        </Link>

        <p className="mt-3 px-2 text-center text-[11px] font-bold leading-5 text-emerald-800">
          Rezervarea se confirmă automat imediat după finalizarea cu succes a plății integrale.
        </p>
      </div>
    </aside>
  );
}
