"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ReservationStatus =
  | "new_request"
  | "waiting_deposit"
  | "confirmed_deposit"
  | "paid_full"
  | "expired"
  | "cancelled"
  | "cancel_requested"
  | "refund_approved"
  | "refund_rejected";

type ReservationPaymentChoice =
  | "card_deposit"
  | "card_full"
  | "vacation_full_link"
  | "vacation_partial_link"
  | "bank_transfer";

type PaymentStatus =
  | "selection_saved"
  | "pending"
  | "link_pending"
  | "redirect_required"
  | "processing"
  | "paid"
  | "failed"
  | "refund_pending"
  | "refunded"
  | "cancelled";

type ReservationRequest = {
  id: string;
  groupCode?: string;
  groupTotal?: number;
  apartmentSlug: string;
  apartmentTitle: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  total: number;
  adults: number;
  children: number;
  childAges?: number[];
  guest: {
    name: string;
    phone: string;
    email?: string;
    message?: string;
  };
  status: ReservationStatus;
  paymentMode:
    | "deposit_request"
    | "full_online"
    | ReservationPaymentChoice;
  payment?: {
    choice: ReservationPaymentChoice;
    method: "card_online" | "vacation_card_link" | "bank_transfer";
    scope: "deposit" | "partial" | "full";
    requestedAmount: number;
    requiredDeposit: number;
    remainingBalance: number;
    status: PaymentStatus;
    paymentId?: string;
    message?: string;
    updatedAt: string;
  };
  createdAt: string;
  expiresAt: string;
  updatedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  history: {
    at: string;
    action: string;
    note?: string;
  }[];
};

type ApiResponse = {
  ok: boolean;
  requests: ReservationRequest[];
};

type ReservationFolderSummary = {
  code: string;
  lifecycleStatus: string;
  paymentStatus: "unpaid" | "partially_paid" | "paid" | "refunded";
  guestName: string;
  apartmentTitles: string[];
  checkIn: string;
  checkOut: string;
  total: number;
  paid: number;
  balance: number;
  selectedPaymentMode?: string;
  selectedPaymentAmount?: number;
  health: {
    level: "ok" | "attention" | "critical";
    label: string;
    reasons: string[];
  };
  nextAction: {
    label: string;
    priority: "low" | "medium" | "high";
  };
};

type FolderApiResponse = {
  ok: boolean;
  folders: ReservationFolderSummary[];
};

const healthClasses = {
  ok: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  attention: "bg-amber-50 text-amber-700 ring-amber-200",
  critical: "bg-red-50 text-red-700 ring-red-200",
};


const statusLabels: Record<ReservationStatus, string> = {
  new_request: "Cerere nouă",
  waiting_deposit: "Avans în așteptare",
  confirmed_deposit: "Confirmată cu avans",
  paid_full: "Plătită integral",
  expired: "Expirată",
  cancelled: "Anulată",
  cancel_requested: "Anulare solicitată",
  refund_approved: "Refund aprobat",
  refund_rejected: "Refund respins",
};


const paymentChoiceLabels: Record<ReservationPaymentChoice, string> = {
  card_deposit: "Card bancar — avans online",
  card_full: "Card bancar — plată integrală",
  vacation_full_link: "Card de vacanță — plată integrală prin link",
  vacation_partial_link: "Card de vacanță — plată parțială prin link",
  bank_transfer: "Transfer bancar — avans",
};

const paymentScopeLabels = {
  deposit: "Avans",
  partial: "Plată parțială",
  full: "Plată integrală",
} as const;

const paymentStatusLabels: Record<PaymentStatus, string> = {
  selection_saved: "Opțiune salvată",
  pending: "În așteptare",
  link_pending: "Link de plată în așteptare",
  redirect_required: "Redirecționare spre plată",
  processing: "În procesare",
  paid: "Plătită",
  failed: "Eșuată",
  refund_pending: "Rambursare în așteptare",
  refunded: "Rambursată",
  cancelled: "Anulată",
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("ro-RO").format(value);
}

const statusClasses: Record<ReservationStatus, string> = {
  new_request: "bg-yellow-50 text-yellow-700 ring-yellow-200",
  waiting_deposit: "bg-orange-50 text-orange-700 ring-orange-200",
  confirmed_deposit: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  paid_full: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  expired: "bg-gray-100 text-gray-600 ring-gray-200",
  cancelled: "bg-gray-100 text-gray-600 ring-gray-200",
  cancel_requested: "bg-blue-50 text-blue-700 ring-blue-200",
  refund_approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  refund_rejected: "bg-red-50 text-red-700 ring-red-200",
};

function formatDate(dateKey: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateKey}T12:00:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function timeLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();

  if (diff <= 0) return "expirată";

  const hours = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);

  return `${hours}h ${minutes}m`;
}

export default function AdminReservationsPage() {
  const [requests, setRequests] = useState<ReservationRequest[]>([]);
  const [folders, setFolders] = useState<ReservationFolderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<"active" | "all" | ReservationStatus>("active");

  async function loadRequests() {
    setIsLoading(true);

    try {
      const [requestResponse, folderResponse] = await Promise.all([
        fetch("/api/reservation-requests", { cache: "no-store" }),
        fetch("/api/reservation-center", { cache: "no-store" }),
      ]);
      const data = (await requestResponse.json()) as ApiResponse;
      const folderData = (await folderResponse.json()) as FolderApiResponse;

      if (!requestResponse.ok || !data.ok) {
        throw new Error("Nu am putut citi cererile.");
      }

      setRequests(data.requests);
      setFolders(folderResponse.ok && folderData.ok ? folderData.folders : []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "A apărut o eroare.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function updateStatus(id: string, status: ReservationStatus, note: string) {
    setMessage(null);

    try {
      const response = await fetch(`/api/reservation-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      });

      const data = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Nu am putut actualiza statusul.");
      }

      setMessage("Status actualizat.");
      await loadRequests();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "A apărut o eroare.");
    }
  }

  async function confirmDeposit(id: string) {
    setMessage(null);

    const confirmed = window.confirm(
      "Confirmi că avansul a fost primit? După confirmare, perioada se va bloca în calendarul de pe site și se va pregăti emailul de confirmare."
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/reservations/${id}/confirm-deposit`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Nu am putut confirma avansul.");
      }

      setMessage("Avans confirmat. Emailul de confirmare a fost procesat.");
      await loadRequests();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "A apărut o eroare.");
    }
  }

  const folderByCode = useMemo(
    () => new Map(folders.map((folder) => [folder.code, folder])),
    [folders]
  );

  const filteredRequests = useMemo(() => {
    if (filter === "all") return requests;

    if (filter === "active") {
      return requests.filter((request) => request.status === "new_request" || request.status === "waiting_deposit");
    }

    return requests.filter((request) => request.status === filter);
  }, [filter, requests]);

  const counters = useMemo(() => {
    return {
      active: requests.filter((request) => request.status === "new_request" || request.status === "waiting_deposit").length,
      confirmed: requests.filter((request) => request.status === "confirmed_deposit" || request.status === "paid_full").length,
      expired: requests.filter((request) => request.status === "expired").length,
      all: requests.length,
    };
  }, [requests]);

  return (
    <main className="min-h-screen bg-[#FAFAF7] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] bg-[#071B2D] p-8 text-white shadow-[0_22px_70px_rgba(7,27,45,0.16)]">
          <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#D9B56D]">
            Admin Breeze Villa
          </p>

          <h1 className="mt-4 text-4xl font-black">
            Cereri de rezervare
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/75">
            Cererile nu blochează calendarul. Perioada devine ocupată doar după ce confirmi manual primirea avansului.
            Cererile neconfirmate expiră automat după 48 de ore.
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <button
            onClick={() => setFilter("active")}
            className={`rounded-2xl p-5 text-left font-black shadow-sm ring-1 ${filter === "active" ? "bg-[#071B2D] text-white ring-[#071B2D]" : "bg-white text-[#071B2D] ring-black/5"}`}
          >
            Active
            <span className="mt-2 block text-3xl">{counters.active}</span>
          </button>

          <button
            onClick={() => setFilter("confirmed_deposit")}
            className={`rounded-2xl p-5 text-left font-black shadow-sm ring-1 ${filter === "confirmed_deposit" ? "bg-[#071B2D] text-white ring-[#071B2D]" : "bg-white text-[#071B2D] ring-black/5"}`}
          >
            Confirmate
            <span className="mt-2 block text-3xl">{counters.confirmed}</span>
          </button>

          <button
            onClick={() => setFilter("expired")}
            className={`rounded-2xl p-5 text-left font-black shadow-sm ring-1 ${filter === "expired" ? "bg-[#071B2D] text-white ring-[#071B2D]" : "bg-white text-[#071B2D] ring-black/5"}`}
          >
            Expirate
            <span className="mt-2 block text-3xl">{counters.expired}</span>
          </button>

          <button
            onClick={() => setFilter("all")}
            className={`rounded-2xl p-5 text-left font-black shadow-sm ring-1 ${filter === "all" ? "bg-[#071B2D] text-white ring-[#071B2D]" : "bg-white text-[#071B2D] ring-black/5"}`}
          >
            Toate
            <span className="mt-2 block text-3xl">{counters.all}</span>
          </button>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl bg-[#E9F8F8] p-4 text-sm font-bold text-[#071B2D]">
            {message}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-[2rem] bg-white p-8 text-[#071B2D] shadow-sm">
            Se încarcă cererile...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-8 text-[#071B2D] shadow-sm">
            Nu există cereri pentru filtrul selectat.
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredRequests.map((request) => {
              const folder = request.groupCode
                ? folderByCode.get(request.groupCode)
                : undefined;

              return (
              <article
                key={request.id}
                className="rounded-[2rem] bg-white p-6 shadow-[0_18px_50px_rgba(7,27,45,0.08)] ring-1 ring-black/5"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-black text-[#071B2D]">{request.id}</h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClasses[request.status]}`}>
                        {statusLabels[request.status]}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-bold text-gray-600">{request.apartmentTitle}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Creată: {formatDateTime(request.createdAt)}
                    </p>

                    {(request.status === "new_request" || request.status === "waiting_deposit") && (
                      <p className="mt-1 text-sm font-black text-orange-600">
                        Expiră în: {timeLeft(request.expiresAt)}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(request.status === "new_request" || request.status === "waiting_deposit") && (
                      <>
                        <button
                          onClick={() => updateStatus(request.id, "waiting_deposit", "Proprietatea a discutat cu clientul și așteaptă avansul.")}
                          className="rounded-full bg-orange-50 px-4 py-2 text-xs font-black text-orange-700 transition hover:bg-orange-100"
                        >
                          Avans în așteptare
                        </button>

                        <button
                          onClick={() => confirmDeposit(request.id)}
                          className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-black text-white transition hover:bg-emerald-700"
                        >
                          Confirmă avans
                        </button>

                        <button
                          onClick={() => updateStatus(request.id, "cancelled", "Cerere anulată manual de proprietate.")}
                          className="rounded-full bg-red-50 px-4 py-2 text-xs font-black text-red-700 transition hover:bg-red-100"
                        >
                          Anulează
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {folder ? (
                  <div className="mt-5 grid gap-3 md:grid-cols-[auto_1fr_auto] md:items-center rounded-[1.5rem] border border-black/5 bg-[#FAFAF7] p-4">
                    <span className={`w-fit rounded-full px-4 py-2 text-xs font-black ring-1 ${healthClasses[folder.health.level]}`}>
                      {folder.health.label}
                    </span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">Acțiunea următoare</p>
                      <p className="mt-1 text-sm font-black text-[#071B2D]">{folder.nextAction.label}</p>
                    </div>
                    <Link
                      href={`/admin/reservations/${folder.code}`}
                      className="inline-flex justify-center rounded-full bg-[#071B2D] px-5 py-3 text-xs font-black text-white"
                    >
                      Deschide dosarul
                    </Link>
                  </div>
                ) : null}

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-[#FAFAF7] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#158F91]">Client</p>
                    <p className="mt-2 font-black text-[#071B2D]">{request.guest.name}</p>
                    <p className="text-sm text-gray-600">{request.guest.phone}</p>
                    {request.guest.email && <p className="text-sm text-gray-600">{request.guest.email}</p>}
                  </div>

                  <div className="rounded-2xl bg-[#FAFAF7] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#158F91]">Perioadă</p>
                    <p className="mt-2 font-black text-[#071B2D]">
                      {formatDate(request.checkIn)} - {formatDate(request.checkOut)}
                    </p>
                    <p className="text-sm text-gray-600">{request.nights} nopți • {request.adults} adulți • {request.children} copii</p>
                  </div>

                  <div className="rounded-2xl bg-[#071B2D] p-4 text-white">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D9B56D]">Total estimativ</p>
                    <p className="mt-2 text-2xl font-black">{formatMoney(request.groupTotal ?? request.total)} lei</p>
                    <p className="text-sm text-white/70">Totalul grupului. Nu blochează calendarul până la confirmare.</p>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.5rem] border border-[#D9B56D]/35 bg-[#FFF9ED] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8A5A00]">
                        Detalii plată selectate de client
                      </p>
                      {request.groupCode && (
                        <p className="mt-2 text-xs font-bold text-gray-500">
                          Cod grup: {request.groupCode}
                        </p>
                      )}
                    </div>

                    {request.payment ? (
                      <span className="w-fit rounded-full bg-white px-4 py-2 text-xs font-black text-[#071B2D] ring-1 ring-[#D9B56D]/40">
                        {paymentStatusLabels[request.payment.status]}
                      </span>
                    ) : null}
                  </div>

                  {request.payment ? (
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">Metodă</p>
                        <p className="mt-2 text-sm font-black text-[#071B2D]">
                          {paymentChoiceLabels[request.payment.choice]}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">Tip plată</p>
                        <p className="mt-2 text-sm font-black text-[#071B2D]">
                          {paymentScopeLabels[request.payment.scope]}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">Sumă solicitată</p>
                        <p className="mt-2 text-lg font-black text-[#158F91]">
                          {formatMoney(request.payment.requestedAmount)} lei
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">Avans minim</p>
                        <p className="mt-2 text-lg font-black text-[#071B2D]">
                          {formatMoney(request.payment.requiredDeposit)} lei
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#071B2D] p-4 text-white">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#D9B56D]">Sold la locație</p>
                        <p className="mt-2 text-lg font-black">
                          {formatMoney(request.payment.remainingBalance)} lei
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm font-semibold text-gray-600">
                      Această cerere a fost creată înainte de activarea salvării detaliilor de plată.
                    </p>
                  )}

                  {request.payment?.message ? (
                    <p className="mt-4 rounded-2xl bg-white p-4 text-sm font-semibold leading-6 text-gray-600 ring-1 ring-black/5">
                      {request.payment.message}
                    </p>
                  ) : null}
                </div>

                {request.guest.message && (
                  <div className="mt-4 rounded-2xl bg-[#E9F8F8] p-4 text-sm leading-6 text-[#071B2D]">
                    <span className="font-black">Mesaj client:</span> {request.guest.message}
                  </div>
                )}

                <details className="mt-4 rounded-2xl bg-[#FAFAF7] p-4">
                  <summary className="cursor-pointer text-sm font-black text-[#071B2D]">Istoric</summary>
                  <div className="mt-4 grid gap-2 text-xs text-gray-600">
                    {request.history.map((item, index) => (
                      <p key={`${item.at}-${index}`}>
                        <span className="font-black text-[#071B2D]">{formatDateTime(item.at)}</span> — {item.action}{item.note ? `: ${item.note}` : ""}
                      </p>
                    ))}
                  </div>
                </details>
              </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}