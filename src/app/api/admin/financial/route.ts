import { NextResponse } from "next/server";
import { listReservationFolders } from "@/lib/reservation-center/store";

export const dynamic = "force-dynamic";

function dateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const map = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${map.year}-${map.month}-${map.day}`;
}

function monthKey(date = new Date()) {
  return dateKey(date).slice(0, 7);
}

function paymentMethodLabel(method?: string) {
  if (!method) return "Nespecificată";

  const value = method.toLowerCase();

  if (value.includes("vacation")) return "Card de vacanță";
  if (value.includes("bank")) return "Transfer bancar";
  if (value.includes("cash")) return "Numerar";
  if (value.includes("pos")) return "POS";
  if (value.includes("full")) return "Card bancar — integral";
  if (value.includes("card")) return "Card bancar";
  if (value.includes("manual")) return "Înregistrare manuală";

  return method.replaceAll("_", " ");
}

export async function GET() {
  const folders = await listReservationFolders();
  const today = dateKey();
  const currentMonth = monthKey();

  const reservations = folders
    .map((folder) => {
      const successfulPayments = folder.financial.transactions.filter(
        (transaction) =>
          transaction.kind === "payment" && transaction.status === "paid"
      );

      const successfulRefunds = folder.financial.transactions.filter(
        (transaction) =>
          transaction.kind === "refund" && transaction.status === "refunded"
      );

      const todayPaid = successfulPayments
        .filter((transaction) => transaction.createdAt.slice(0, 10) === today)
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const monthPaid = successfulPayments
        .filter((transaction) =>
          transaction.createdAt.startsWith(currentMonth)
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const monthRefunded = successfulRefunds
        .filter((transaction) =>
          transaction.createdAt.startsWith(currentMonth)
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      return {
        code: folder.code,
        lifecycleStatus: folder.lifecycleStatus,
        paymentStatus: folder.paymentStatus,
        source: folder.source,
        guestName: folder.summary.guest.name,
        phone: folder.summary.guest.phone,
        email: folder.summary.guest.email ?? "",
        checkIn: folder.summary.checkIn,
        checkOut: folder.summary.checkOut,
        adults: folder.summary.adults,
        children: folder.summary.childAges.length,
        apartmentTitles: folder.summary.apartments.map((item) => item.title),
        total: folder.financial.total,
        requiredDeposit: folder.financial.requiredDeposit,
        paid: folder.financial.paid,
        refunded: folder.financial.refunded,
        balance: folder.financial.balance,
        selectedPaymentMode: folder.financial.selectedPaymentMode ?? "",
        selectedPaymentAmount: folder.financial.selectedPaymentAmount ?? 0,
        paymentMethodLabel: paymentMethodLabel(
          folder.financial.selectedPaymentMode
        ),
        requests: folder.requests.map((request) => ({
          type: request.type,
          status: request.status,
          desiredTime: request.requestedTime,
        })),
        transactions: folder.financial.transactions
          .slice()
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        todayPaid,
        monthPaid,
        monthRefunded,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      };
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const active = reservations.filter(
    (reservation) =>
      !["cancelled", "expired", "completed"].includes(
        reservation.lifecycleStatus
      )
  );

  const totalRevenue = reservations.reduce(
    (sum, reservation) => sum + reservation.paid,
    0
  );

  const todayRevenue = reservations.reduce(
    (sum, reservation) => sum + reservation.todayPaid,
    0
  );

  const monthRevenue = reservations.reduce(
    (sum, reservation) => sum + reservation.monthPaid,
    0
  );

  const monthRefunded = reservations.reduce(
    (sum, reservation) => sum + reservation.monthRefunded,
    0
  );

  const outstanding = active.reduce(
    (sum, reservation) => sum + reservation.balance,
    0
  );

  const requiredDepositsPending = active
    .filter((reservation) => reservation.paid < reservation.requiredDeposit)
    .reduce(
      (sum, reservation) =>
        sum + Math.max(0, reservation.requiredDeposit - reservation.paid),
      0
    );

  const collectionRate =
    active.length === 0
      ? 100
      : Math.round(
          (active.reduce((sum, reservation) => sum + reservation.paid, 0) /
            Math.max(
              1,
              active.reduce((sum, reservation) => sum + reservation.total, 0)
            )) *
            100
        );

  const methods = new Map<string, number>();

  reservations.forEach((reservation) => {
    reservation.transactions
      .filter(
        (transaction) =>
          transaction.kind === "payment" && transaction.status === "paid"
      )
      .forEach((transaction) => {
        const label = paymentMethodLabel(transaction.method);
        methods.set(label, (methods.get(label) ?? 0) + transaction.amount);
      });
  });

  const paymentMethods = Array.from(methods.entries())
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    stats: {
      todayRevenue,
      monthRevenue,
      totalRevenue,
      outstanding,
      requiredDepositsPending,
      monthRefunded,
      collectionRate,
      unpaidReservations: active.filter(
        (reservation) => reservation.balance > 0
      ).length,
      fullyPaidReservations: active.filter(
        (reservation) => reservation.balance === 0
      ).length,
    },
    paymentMethods,
    reservations,
  });
}
