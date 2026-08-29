"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { publishAdminLiveEvent } from "@/lib/admin/admin-live-events";
import {
  CalendarDays,
  Clock3,
  ExternalLink,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  ReceiptText,
  Save,
  Send,
  Sparkles,
  LogIn,
  LogOut,
  NotebookPen,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

export type CalendarReservationSummary = {
  id: string;
  code: string;
  apartmentSlug: string;
  apartmentTitle: string;
  guestName: string;
  phone: string;
  email: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  total: number;
  paid: number;
  balance: number;
  paymentMode: string;
  lifecycleStatus: string;
  paymentStatus: string;
  source: string;
  requests: Array<{
    type: string;
    status?: string;
    desiredTime?: string;
  }>;
};

type FinancialTransaction = {
  id: string;
  method: string;
  scope: string;
  amount: number;
  status: string;
  createdAt: string;
};

type TimelineEvent = {
  id: string;
  at: string;
  category?: string;
  action?: string;
  title: string;
  note?: string;
  actor: string;
};

type GuestRequest = {
  id: string;
  type: string;
  status: string;
  requestedTime?: string;
  details?: string;
  approvedCost?: number;
};

type ReservationFolder = {
  code: string;
  lifecycleStatus: string;
  paymentStatus: string;
  summary: {
    checkIn: string;
    checkOut: string;
    nights: number;
    adults: number;
    childAges: number[];
    guest: {
      name: string;
      phone: string;
      email?: string;
      message?: string;
    };
    apartments: Array<{
      slug: string;
      title: string;
      totalPrice: number;
    }>;
  };
  financial: {
    total: number;
    requiredDeposit: number;
    paid: number;
    balance: number;
    selectedPaymentMode?: string;
    transactions: FinancialTransaction[];
  };
  requests: GuestRequest[];
  operations: {
    cleaningStatus: "not_scheduled" | "scheduled" | "in_progress" | "ready";
    checkInStatus: "pending" | "ready" | "completed";
    checkOutStatus: "pending" | "completed";
    internalNotes: string[];
  };
  timeline: TimelineEvent[];
};

type Props = {
  reservation: CalendarReservationSummary | null;
  onClose: () => void;
};

type ManualPaymentMethod =
  | "card_online"
  | "vacation_card_link"
  | "bank_transfer"
  | "pos"
  | "cash"
  | "manual";

function money(value: number) {
  return new Intl.NumberFormat("ro-RO").format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function paymentLabel(mode: string) {
  if (mode.toLowerCase().includes("vacation")) {
    return "Card de vacanță";
  }
  if (mode.toLowerCase().includes("bank")) {
    return "Transfer bancar";
  }
  if (mode.toLowerCase().includes("full")) {
    return "Card bancar — integral";
  }
  if (mode.toLowerCase().includes("card")) {
    return "Card bancar";
  }
  return mode || "Nespecificată";
}

function lifecycleLabel(status: string) {
  const labels: Record<string, string> = {
    new_request: "Cerere nouă",
    waiting_payment: "Așteaptă plata",
    confirmed: "Confirmată",
    checked_in: "Cazat",
    checked_out: "Check-out efectuat",
    completed: "Finalizată",
    expired: "Expirată",
    cancel_requested: "Anulare solicitată",
    cancelled: "Anulată",
  };

  return labels[status] ?? status.replaceAll("_", " ");
}

function statusClasses(status: string) {
  if (["confirmed", "checked_in", "completed"].includes(status)) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (["cancel_requested", "cancelled", "expired"].includes(status)) {
    return "bg-red-50 text-red-700 ring-red-200";
  }

  return "bg-amber-50 text-amber-800 ring-amber-200";
}

function requestLabel(type: string) {
  const labels: Record<string, string> = {
    early_checkin: "Check-in mai devreme",
    late_checkout: "Check-out târziu",
    transfer: "Transfer",
    free_cancellation: "Anulare gratuită",
    self_checkin: "Self check-in",
    other: "Altă solicitare",
  };

  return labels[type] ?? type.replaceAll("_", " ");
}

function requestStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "În așteptare",
    approved: "Aprobată",
    rejected: "Respinsă",
    cancelled: "Anulată",
  };
  return labels[status] ?? status;
}

function timelineAccent(category?: string) {
  const accents: Record<string, string> = {
    payment: "bg-emerald-500",
    reservation: "bg-[#D9B56D]",
    operation: "bg-blue-500",
    request: "bg-violet-500",
    communication: "bg-cyan-500",
    document: "bg-slate-500",
    system: "bg-gray-400",
  };
  return accents[category ?? "system"] ?? accents.system;
}

function lifecycleStep(status: string) {
  const order = [
    "new_request",
    "waiting_payment",
    "confirmed",
    "checked_in",
    "checked_out",
    "completed",
  ];
  const index = order.indexOf(status);
  return index < 0 ? 0 : index;
}

function whatsappUrl(phone: string, code: string) {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "");
  const international = digits.startsWith("40") ? digits : `40${digits}`;
  const message = encodeURIComponent(
    `Bună ziua! Vă contactăm din partea Breeze Villa în legătură cu rezervarea ${code}.`
  );

  return `https://wa.me/${international}?text=${message}`;
}

export default function ReservationDrawer({
  reservation,
  onClose,
}: Props) {
  const [folder, setFolder] = useState<ReservationFolder | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [showPaymentForm, setShowPaymentForm] =
    useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<ManualPaymentMethod>("pos");
  const [paymentNote, setPaymentNote] = useState("");
  const [savingPayment, setSavingPayment] =
    useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [savingOperation, setSavingOperation] = useState(false);
  const [operationError, setOperationError] = useState("");

  useEffect(() => {
    if (!reservation) {
      setFolder(null);
      setLoadError("");
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, reservation]);

  useEffect(() => {
    if (!reservation) return;

    const currentReservation = reservation;
    const controller = new AbortController();

    async function loadFolder() {
      setLoading(true);
      setLoadError("");
      setFolder(null);

      try {
        const response = await fetch(
          `/api/reservation-center/${encodeURIComponent(
            currentReservation.code
          )}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (response.status === 404) {
          return;
        }

        const data = (await response.json()) as {
          ok: boolean;
          folder?: ReservationFolder;
          message?: string;
        };

        if (!response.ok || !data.ok || !data.folder) {
          throw new Error(
            data.message ?? "Dosarul rezervării nu a putut fi încărcat."
          );
        }

        setFolder(data.folder);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Dosarul rezervării nu a putut fi încărcat."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadFolder();

    return () => controller.abort();
  }, [reservation]);

  const details = useMemo(() => {
    if (!reservation) return null;

    return {
      code: reservation.code,
      guestName: folder?.summary.guest.name ?? reservation.guestName,
      phone: folder?.summary.guest.phone ?? reservation.phone,
      email: folder?.summary.guest.email ?? reservation.email,
      checkIn: folder?.summary.checkIn ?? reservation.checkIn,
      checkOut: folder?.summary.checkOut ?? reservation.checkOut,
      nights:
        folder?.summary.nights ??
        Math.max(
          1,
          Math.round(
            (new Date(`${reservation.checkOut}T12:00:00`).getTime() -
              new Date(`${reservation.checkIn}T12:00:00`).getTime()) /
              86_400_000
          )
        ),
      adults: folder?.summary.adults ?? reservation.adults,
      children:
        folder?.summary.childAges.length ?? reservation.children,
      apartments:
        folder?.summary.apartments.map((item) => item.title) ?? [
          reservation.apartmentTitle,
        ],
      total: folder?.financial.total ?? reservation.total,
      paid: folder?.financial.paid ?? reservation.paid,
      balance: folder?.financial.balance ?? reservation.balance,
      requiredDeposit: folder?.financial.requiredDeposit,
      paymentMode:
        folder?.financial.selectedPaymentMode ?? reservation.paymentMode,
      lifecycleStatus:
        folder?.lifecycleStatus ?? reservation.lifecycleStatus,
      paymentStatus: folder?.paymentStatus ?? reservation.paymentStatus,
      requests:
        folder?.requests ??
        reservation.requests.map((request, index) => ({
          id: `${request.type}-${index}`,
          type: request.type,
          status: request.status ?? "pending",
          requestedTime: request.desiredTime,
          details: undefined,
          approvedCost: undefined,
        })),
      timeline: folder?.timeline ?? [],
      transactions: folder?.financial.transactions ?? [],
      operations: folder?.operations ?? {
        cleaningStatus: "not_scheduled" as const,
        checkInStatus: "pending" as const,
        checkOutStatus: "pending" as const,
        internalNotes: [],
      },
    };
  }, [folder, reservation]);

  async function submitManualPayment() {
    if (!reservation || !details) return;

    const amount = Math.round(Number(paymentAmount));

    if (!Number.isFinite(amount) || amount <= 0) {
      setPaymentError("Introdu o sumă validă.");
      return;
    }

    if (amount > details.balance) {
      setPaymentError(
        `Suma nu poate depăși soldul de ${details.balance} lei.`
      );
      return;
    }

    setSavingPayment(true);
    setPaymentError("");

    try {
      const response = await fetch(
        `/api/reservation-center/${encodeURIComponent(
          details.code
        )}/transactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            method: paymentMethod,
            note: paymentNote,
          }),
        }
      );

      const data = (await response.json()) as {
        ok: boolean;
        message?: string;
        folder?: ReservationFolder;
      };

      if (!response.ok || !data.ok || !data.folder) {
        throw new Error(
          data.message ??
            "Plata nu a putut fi înregistrată."
        );
      }

      setFolder(data.folder);

      publishAdminLiveEvent({
        entity: "payment",
        code: details.code,
        action: "manual_payment_registered",
      });

      setShowPaymentForm(false);
      setPaymentAmount("");
      setPaymentNote("");
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Plata nu a putut fi înregistrată."
      );
    } finally {
      setSavingPayment(false);
    }
  }

  async function updateOperation(patch: {
    checkInStatus?: "pending" | "ready" | "completed";
    checkOutStatus?: "pending" | "completed";
    cleaningStatus?: "not_scheduled" | "scheduled" | "in_progress" | "ready";
    internalNote?: string;
  }) {
    if (!details) return;

    setSavingOperation(true);
    setOperationError("");

    try {
      const response = await fetch(
        `/api/admin/operations/${encodeURIComponent(details.code)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        }
      );

      const data = (await response.json()) as {
        ok: boolean;
        message?: string;
        folder?: ReservationFolder;
      };

      if (!response.ok || !data.ok || !data.folder) {
        throw new Error(data.message ?? "Operațiunea nu a putut fi salvată.");
      }

      setFolder(data.folder);
      setInternalNote("");
      publishAdminLiveEvent({
        entity: "operation",
        code: details.code,
        action: "reservation_operation_updated",
      });
    } catch (error) {
      setOperationError(
        error instanceof Error ? error.message : "Operațiunea nu a putut fi salvată."
      );
    } finally {
      setSavingOperation(false);
    }
  }

  if (!reservation || !details) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex justify-end bg-[#020A12]/55 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <aside
        className="flex h-full w-full max-w-[520px] animate-[drawerIn_180ms_ease-out] flex-col bg-[#FAFAF7] shadow-[-24px_0_80px_rgba(7,27,45,0.22)]"
        role="dialog"
        aria-modal="true"
        aria-label={`Rezervarea ${details.code}`}
      >
        <header className="shrink-0 bg-[#071B2D] px-5 py-5 text-white sm:px-6">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D9B56D]">
                Rezervare {details.code}
              </p>
              <h2 className="mt-2 truncate text-2xl font-black">
                {details.guestName}
              </h2>
              <p className="mt-1 text-sm font-semibold text-white/65">
                {details.apartments.join(" • ")}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white hover:text-[#071B2D]"
              aria-label="Închide"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] ring-1 ${statusClasses(
                details.lifecycleStatus
              )}`}
            >
              {lifecycleLabel(details.lifecycleStatus)}
            </span>

            <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white">
              {paymentLabel(details.paymentMode)}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-6 gap-1.5">
            {["Cerere", "Plată", "Confirmare", "Check-in", "Check-out", "Final"].map(
              (label, index) => {
                const active = index <= lifecycleStep(details.lifecycleStatus);
                return (
                  <div key={label} className="min-w-0">
                    <div className={`h-1.5 rounded-full ${active ? "bg-[#D9B56D]" : "bg-white/15"}`} />
                    <p className={`mt-1 truncate text-[8px] font-black uppercase tracking-[0.08em] ${active ? "text-white" : "text-white/35"}`}>
                      {label}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {loading ? (
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-white p-4 text-sm font-bold text-gray-500 ring-1 ring-black/5">
              <Loader2 className="animate-spin" size={17} />
              Se încarcă dosarul complet...
            </div>
          ) : null}

          {loadError ? (
            <div className="mb-4 rounded-2xl bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-800 ring-1 ring-amber-200">
              {loadError} Sunt afișate datele disponibile în calendar.
            </div>
          ) : null}

          <section className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#158F91]">
              <CalendarDays size={16} />
              Sejur
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#FAFAF7] p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.13em] text-gray-400">
                  Check-in
                </p>
                <p className="mt-1 text-sm font-black text-[#071B2D]">
                  {formatDate(details.checkIn)}
                </p>
                <p className="mt-1 text-xs font-bold text-gray-500">
                  ora standard 15:00
                </p>
              </div>

              <div className="rounded-2xl bg-[#FAFAF7] p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.13em] text-gray-400">
                  Check-out
                </p>
                <p className="mt-1 text-sm font-black text-[#071B2D]">
                  {formatDate(details.checkOut)}
                </p>
                <p className="mt-1 text-xs font-bold text-gray-500">
                  între 09:00–10:00
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs font-bold text-gray-500">
              {details.nights}{" "}
              {details.nights === 1 ? "noapte" : "nopți"}
            </p>
          </section>

          <section className="mt-4 rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#158F91]">
              <WalletCards size={16} />
              Situație financiară
            </div>

            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="font-semibold text-gray-500">Total sejur</dt>
                <dd className="font-black text-[#071B2D]">
                  {money(details.total)} lei
                </dd>
              </div>

              {typeof details.requiredDeposit === "number" ? (
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-semibold text-gray-500">
                    Avans necesar
                  </dt>
                  <dd className="font-black text-[#071B2D]">
                    {money(details.requiredDeposit)} lei
                  </dd>
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-4">
                <dt className="font-semibold text-gray-500">Încasat</dt>
                <dd className="font-black text-emerald-700">
                  {money(details.paid)} lei
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-black/5 pt-3">
                <dt className="font-black text-[#071B2D]">Sold rămas</dt>
                <dd
                  className={`text-lg font-black ${
                    details.balance > 0
                      ? "text-orange-700"
                      : "text-emerald-700"
                  }`}
                >
                  {money(details.balance)} lei
                </dd>
              </div>
            </dl>

            <div className="mt-4 rounded-2xl bg-[#FAFAF7] p-4">
              <div className="flex items-center justify-between gap-3 text-xs font-black text-[#071B2D]">
                <span>Grad de încasare</span>
                <span>{details.total > 0 ? Math.min(100, Math.round((details.paid / details.total) * 100)) : 0}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5">
                <div
                  className="h-full rounded-full bg-[#158F91] transition-all"
                  style={{ width: `${details.total > 0 ? Math.min(100, (details.paid / details.total) * 100) : 0}%` }}
                />
              </div>
            </div>

            {details.transactions.length > 0 ? (
              <div className="mt-4 grid gap-2 border-t border-black/5 pt-4">
                {details.transactions.slice(-3).reverse().map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-start justify-between gap-3 rounded-2xl bg-[#FAFAF7] p-3 text-xs"
                  >
                    <div>
                      <p className="font-black text-[#071B2D]">
                        {paymentLabel(transaction.method)} •{" "}
                        {transaction.scope}
                      </p>
                      <p className="mt-1 font-semibold text-gray-500">
                        {transaction.status} •{" "}
                        {formatDateTime(transaction.createdAt)}
                      </p>
                    </div>
                    <strong className="shrink-0 text-[#071B2D]">
                      {money(transaction.amount)} lei
                    </strong>
                  </div>
                ))}
              </div>
            ) : null}

            {details.balance > 0 ? (
              <div className="mt-4 border-t border-black/5 pt-4">
                {!showPaymentForm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentAmount(String(details.balance));
                      setPaymentError("");
                      setShowPaymentForm(true);
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#071B2D] px-4 py-3 text-sm font-black text-white"
                  >
                    <WalletCards size={17} />
                    Înregistrează o plată
                  </button>
                ) : (
                  <div className="rounded-2xl bg-[#FAFAF7] p-4">
                    <p className="text-sm font-black text-[#071B2D]">
                      Înregistrare plată
                    </p>

                    <div className="mt-3 grid gap-3">
                      <label className="grid gap-1.5">
                        <span className="text-xs font-black text-gray-600">
                          Sumă
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={details.balance}
                          value={paymentAmount}
                          onChange={(event) =>
                            setPaymentAmount(event.target.value)
                          }
                          className="rounded-xl border border-black/10 bg-white px-3 py-3 font-black outline-none focus:border-[#158F91]"
                        />
                      </label>

                      <label className="grid gap-1.5">
                        <span className="text-xs font-black text-gray-600">
                          Metodă
                        </span>
                        <select
                          value={paymentMethod}
                          onChange={(event) =>
                            setPaymentMethod(
                              event.target.value as ManualPaymentMethod
                            )
                          }
                          className="rounded-xl border border-black/10 bg-white px-3 py-3 font-bold outline-none focus:border-[#158F91]"
                        >
                          <option value="pos">POS pe telefon</option>
                          <option value="vacation_card_link">
                            Card de vacanță
                          </option>
                          <option value="card_online">
                            Card bancar online
                          </option>
                          <option value="bank_transfer">
                            Transfer bancar
                          </option>
                          <option value="cash">Numerar</option>
                          <option value="manual">Altă metodă</option>
                        </select>
                      </label>

                      <label className="grid gap-1.5">
                        <span className="text-xs font-black text-gray-600">
                          Observație opțională
                        </span>
                        <input
                          value={paymentNote}
                          onChange={(event) =>
                            setPaymentNote(event.target.value)
                          }
                          placeholder="Ex.: diferență achitată la sosire"
                          className="rounded-xl border border-black/10 bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-[#158F91]"
                        />
                      </label>
                    </div>

                    {paymentError ? (
                      <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">
                        {paymentError}
                      </p>
                    ) : null}

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPaymentForm(false)}
                        disabled={savingPayment}
                        className="rounded-xl border border-black/10 bg-white px-3 py-3 text-xs font-black text-[#071B2D]"
                      >
                        Renunță
                      </button>

                      <button
                        type="button"
                        onClick={() => void submitManualPayment()}
                        disabled={savingPayment}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D9B56D] px-3 py-3 text-xs font-black text-[#071B2D] disabled:opacity-60"
                      >
                        {savingPayment ? (
                          <Loader2
                            className="animate-spin"
                            size={15}
                          />
                        ) : (
                          <Save size={15} />
                        )}
                        Salvează plata
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </section>

          <section className="mt-4 rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#158F91]">
              <UserRound size={16} />
              Oaspeți și contact
            </div>

            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-gray-500">Grup</span>
                <strong className="text-right text-[#071B2D]">
                  {details.adults}{" "}
                  {details.adults === 1 ? "adult" : "adulți"}
                  {details.children > 0
                    ? ` • ${details.children} ${
                        details.children === 1 ? "copil" : "copii"
                      }`
                    : ""}
                </strong>
              </div>

              <a
                href={`tel:${details.phone}`}
                className="flex items-center gap-3 rounded-2xl bg-[#FAFAF7] p-3 font-black text-[#071B2D]"
              >
                <Phone size={16} className="text-[#158F91]" />
                {details.phone}
              </a>

              {details.email ? (
                <a
                  href={`mailto:${details.email}`}
                  className="flex items-center gap-3 rounded-2xl bg-[#FAFAF7] p-3 font-black text-[#071B2D]"
                >
                  <Mail size={16} className="text-[#158F91]" />
                  <span className="truncate">{details.email}</span>
                </a>
              ) : null}
            </div>
          </section>

          <section className="mt-4 rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#158F91]">
              <Clock3 size={16} />
              Solicitări
            </div>

            <div className="mt-4 grid gap-2">
              {details.requests.length === 0 ? (
                <p className="text-sm font-semibold text-gray-500">
                  Nu există solicitări speciale.
                </p>
              ) : (
                details.requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-start justify-between gap-4 rounded-2xl bg-[#FAFAF7] p-4"
                  >
                    <div>
                      <p className="font-black text-[#071B2D]">
                        {requestLabel(request.type)}
                      </p>
                      {request.requestedTime ? (
                        <p className="mt-1 text-xs font-bold text-gray-500">
                          Ora dorită: {request.requestedTime}
                        </p>
                      ) : null}
                      {request.details ? (
                        <p className="mt-1 text-xs font-semibold leading-5 text-gray-500">
                          {request.details}
                        </p>
                      ) : null}
                    </div>

                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] ring-1 ${request.status === "approved" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : request.status === "rejected" ? "bg-red-50 text-red-700 ring-red-200" : "bg-amber-50 text-amber-800 ring-amber-200"}`}>
                      {requestStatusLabel(request.status)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="mt-4 rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#158F91]">
              <Sparkles size={16} />
              Operațional
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={savingOperation || details.operations.checkInStatus === "completed"}
                onClick={() => void updateOperation({ checkInStatus: "completed" })}
                className={`rounded-2xl p-3 text-center text-[10px] font-black ring-1 transition disabled:opacity-60 ${details.operations.checkInStatus === "completed" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-[#FAFAF7] text-[#071B2D] ring-black/5"}`}
              >
                <LogIn size={17} className="mx-auto mb-1" />
                {details.operations.checkInStatus === "completed" ? "Check-in făcut" : "Marchează check-in"}
              </button>

              <button
                type="button"
                disabled={savingOperation || details.operations.checkOutStatus === "completed"}
                onClick={() => void updateOperation({ checkOutStatus: "completed", cleaningStatus: "scheduled" })}
                className={`rounded-2xl p-3 text-center text-[10px] font-black ring-1 transition disabled:opacity-60 ${details.operations.checkOutStatus === "completed" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-[#FAFAF7] text-[#071B2D] ring-black/5"}`}
              >
                <LogOut size={17} className="mx-auto mb-1" />
                {details.operations.checkOutStatus === "completed" ? "Check-out făcut" : "Marchează check-out"}
              </button>

              <button
                type="button"
                disabled={savingOperation || details.operations.cleaningStatus === "ready"}
                onClick={() => void updateOperation({ cleaningStatus: details.operations.cleaningStatus === "in_progress" ? "ready" : "in_progress" })}
                className={`rounded-2xl p-3 text-center text-[10px] font-black ring-1 transition disabled:opacity-60 ${details.operations.cleaningStatus === "ready" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : details.operations.cleaningStatus === "in_progress" ? "bg-amber-50 text-amber-800 ring-amber-200" : "bg-[#FAFAF7] text-[#071B2D] ring-black/5"}`}
              >
                <Sparkles size={17} className="mx-auto mb-1" />
                {details.operations.cleaningStatus === "ready" ? "Curățenie gata" : details.operations.cleaningStatus === "in_progress" ? "Finalizează" : "Începe curățenia"}
              </button>
            </div>

            {operationError ? (
              <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{operationError}</p>
            ) : null}
          </section>

          <section className="mt-4 rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#158F91]">
              <NotebookPen size={16} />
              Jurnal intern
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={internalNote}
                onChange={(event) => setInternalNote(event.target.value)}
                placeholder="Adaugă o observație administrativă..."
                className="min-w-0 flex-1 rounded-xl border border-black/10 bg-[#FAFAF7] px-3 py-3 text-sm font-semibold outline-none focus:border-[#158F91]"
              />
              <button
                type="button"
                disabled={savingOperation || !internalNote.trim()}
                onClick={() => void updateOperation({ internalNote })}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#071B2D] text-white disabled:opacity-40"
                aria-label="Salvează nota"
              >
                {savingOperation ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              </button>
            </div>

            {details.operations.internalNotes.length > 0 ? (
              <div className="mt-3 grid gap-2">
                {details.operations.internalNotes.slice().reverse().slice(0, 4).map((note, index) => (
                  <div key={`${note}-${index}`} className="rounded-xl bg-[#FAFAF7] px-3 py-2.5 text-xs font-semibold leading-5 text-gray-600">
                    {note}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs font-semibold text-gray-400">Nu există note interne.</p>
            )}
          </section>

          <section className="mt-4 rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#158F91]">
              <ReceiptText size={16} />
              Timeline complet
            </div>

            <div className="mt-4 grid gap-3">
              {details.timeline.length === 0 ? (
                <p className="text-sm font-semibold text-gray-500">
                  Istoricul complet este disponibil în dosarul rezervării.
                </p>
              ) : (
                details.timeline
                  .slice()
                  .reverse()
                  .map((event, index) => (
                    <div key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
                      {index < details.timeline.length - 1 ? (
                        <span className="absolute left-[7px] top-4 h-full w-px bg-black/8" />
                      ) : null}
                      <span className={`relative mt-1 h-4 w-4 shrink-0 rounded-full ring-4 ring-white ${timelineAccent(event.category)}`} />
                      <div className="min-w-0 flex-1 rounded-2xl bg-[#FAFAF7] p-3">
                        <p className="text-sm font-black text-[#071B2D]">{event.title}</p>
                        <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.08em] text-gray-400">
                          {formatDateTime(event.at)} • {event.actor}
                        </p>
                        {event.note ? (
                          <p className="mt-1.5 text-xs font-semibold leading-5 text-gray-500">{event.note}</p>
                        ) : null}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </section>
        </div>

        <footer className="shrink-0 border-t border-black/5 bg-white px-4 py-3 sm:px-5">
          <div className="grid grid-cols-4 gap-2">
            <a
              href={whatsappUrl(
                details.phone,
                details.code
              )}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl bg-[#E9F8F8] px-2 text-[10px] font-black text-[#071B2D]"
            >
              <MessageCircle size={17} />
              WhatsApp
            </a>

            <a
              href={`tel:${details.phone}`}
              className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl bg-[#FAFAF7] px-2 text-[10px] font-black text-[#071B2D]"
            >
              <Phone size={17} />
              Sună
            </a>

            <Link
              href={`/admin/reservations/${details.code}`}
              className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl bg-[#D9B56D] px-2 text-[10px] font-black text-[#071B2D]"
            >
              <ExternalLink size={17} />
              Confirmare / dosar
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl bg-[#071B2D] px-2 text-[10px] font-black text-white"
            >
              <X size={17} />
              Închide
            </button>
          </div>
        </footer>
      </aside>

      <style jsx global>{`
        @keyframes drawerIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
