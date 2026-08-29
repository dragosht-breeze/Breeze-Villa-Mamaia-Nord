import { randomUUID } from "node:crypto";
import { getReservationFolder, getReservationFolderByLegacyRequestId, saveReservationFolder } from "@/lib/reservation-center/store";
import type { FinancialTransaction, ReservationFolder, ReservationTimelineEvent } from "@/lib/reservation-center/types";

function now() { return new Date().toISOString(); }
function event(input: Omit<ReservationTimelineEvent,"id"|"at">): ReservationTimelineEvent {
  return { id: randomUUID(), at: now(), ...input };
}
function recalculate(folder: ReservationFolder): ReservationFolder {
  const paid = folder.financial.transactions.filter(x=>x.kind==="payment"&&x.status==="paid").reduce((s,x)=>s+x.amount,0);
  const refunded = folder.financial.transactions.filter(x=>x.kind==="refund"&&x.status==="refunded").reduce((s,x)=>s+x.amount,0);
  const netPaid = Math.max(0, paid-refunded);
  const balance = Math.max(0, folder.financial.total-netPaid);
  const paymentStatus: ReservationFolder["paymentStatus"] =
    refunded >= paid && paid > 0
      ? "refunded"
      : balance === 0
        ? "paid"
        : netPaid > 0
          ? "partially_paid"
          : "unpaid";
  const lifecycleStatus: ReservationFolder["lifecycleStatus"] =
    netPaid >= folder.financial.requiredDeposit &&
    !["cancelled", "checked_in", "checked_out", "completed"].includes(
      folder.lifecycleStatus
    )
      ? "confirmed"
      : folder.lifecycleStatus;
  return { ...folder, lifecycleStatus, paymentStatus, financial:{...folder.financial,paid:netPaid,refunded,balance}, updatedAt:now() };
}

export async function createReservationFolder(input: {
  code:string; checkIn:string; checkOut:string; nights:number; adults:number; childAges:number[];
  guest:ReservationFolder["summary"]["guest"]; apartments:ReservationFolder["summary"]["apartments"];
  total:number; requiredDeposit:number; paymentMode?:string; paymentAmount?:number; legacyRequestIds:string[];
}) {
  const existing = await getReservationFolder(input.code); if(existing) return existing;
  const createdAt=now();
  const folder: ReservationFolder = {
    code:input.code,lifecycleStatus:"waiting_payment",paymentStatus:"unpaid",source:"direct",
    summary:{checkIn:input.checkIn,checkOut:input.checkOut,nights:input.nights,adults:input.adults,childAges:input.childAges,guest:input.guest,apartments:input.apartments,total:input.total},
    financial:{total:input.total,requiredDeposit:input.requiredDeposit,paid:0,refunded:0,balance:input.total,selectedPaymentMode:input.paymentMode,selectedPaymentAmount:input.paymentAmount,transactions:[]},
    communications:[],requests:[],operations:{cleaningStatus:"not_scheduled",checkInStatus:"pending",checkOutStatus:"pending",internalNotes:[],maintenanceRequired:false,maintenanceNote:""},documents:[],legacyRequestIds:input.legacyRequestIds,
    timeline:[event({category:"reservation",action:"created",title:"Cererea de rezervare a fost înregistrată",note:input.paymentMode?`Metodă selectată: ${input.paymentMode}. Sumă selectată: ${input.paymentAmount ?? 0} lei.`:undefined,actor:"guest"})],
    createdAt,updatedAt:createdAt
  };
  return saveReservationFolder(folder);
}

export async function registerPaymentTransaction(code:string,input:Omit<FinancialTransaction,"id"|"createdAt"|"updatedAt">) {
  const folder=await getReservationFolder(code); if(!folder) return null;
  const timestamp=now(); const transaction:FinancialTransaction={id:randomUUID(),createdAt:timestamp,updatedAt:timestamp,...input};
  const next=recalculate({...folder,financial:{...folder.financial,transactions:[...folder.financial.transactions,transaction]},timeline:[...folder.timeline,event({category:"payment",action:"payment_registered",title:`Plată ${input.status}: ${input.amount} lei`,note:input.note,actor:"system"})]});
  return saveReservationFolder(next);
}

export async function confirmFolderDepositByLegacyRequestId(id:string,note?:string) {
  const folder=await getReservationFolderByLegacyRequestId(id); if(!folder) return null;
  const timestamp=now(); const transaction:FinancialTransaction={id:randomUUID(),kind:"payment",method:"manual",scope:"deposit",amount:folder.financial.requiredDeposit,currency:"RON",status:"paid",note:note??"Avans confirmat manual din Admin.",createdAt:timestamp,updatedAt:timestamp};
  const next=recalculate({...folder,financial:{...folder.financial,transactions:[...folder.financial.transactions,transaction]},timeline:[...folder.timeline,event({category:"payment",action:"deposit_confirmed",title:"Avans confirmat",note:transaction.note,actor:"admin"})]});
  return saveReservationFolder(next);
}

export async function updateReservationOperations(
  code: string,
  input: {
    cleaningStatus?: ReservationFolder["operations"]["cleaningStatus"];
    checkInStatus?: ReservationFolder["operations"]["checkInStatus"];
    checkOutStatus?: ReservationFolder["operations"]["checkOutStatus"];
    internalNote?: string;
    maintenanceRequired?: boolean;
    maintenanceNote?: string;
    actor?: "admin" | "system";
  }
) {
  const folder = await getReservationFolder(code);
  if (!folder) return null;

  const nextOperations = {
    ...folder.operations,
    cleaningStatus:
      input.cleaningStatus ?? folder.operations.cleaningStatus,
    checkInStatus:
      input.checkInStatus ?? folder.operations.checkInStatus,
    checkOutStatus:
      input.checkOutStatus ?? folder.operations.checkOutStatus,
    internalNotes: input.internalNote?.trim()
      ? [
          ...folder.operations.internalNotes,
          input.internalNote.trim(),
        ]
      : folder.operations.internalNotes,
    maintenanceRequired:
      input.maintenanceRequired ??
      folder.operations.maintenanceRequired ??
      false,
    maintenanceNote:
      input.maintenanceNote !== undefined
        ? input.maintenanceNote.trim()
        : folder.operations.maintenanceNote ?? "",
  };

  let lifecycleStatus = folder.lifecycleStatus;

  if (input.checkInStatus === "completed") {
    lifecycleStatus = "checked_in";
  }

  if (input.checkOutStatus === "completed") {
    lifecycleStatus = "checked_out";
  }

  if (
    input.cleaningStatus === "ready" &&
    lifecycleStatus === "checked_out"
  ) {
    lifecycleStatus = "completed";
  }

  const changes: string[] = [];

  if (
    input.checkInStatus &&
    input.checkInStatus !== folder.operations.checkInStatus
  ) {
    changes.push(`Check-in: ${input.checkInStatus}`);
  }

  if (
    input.checkOutStatus &&
    input.checkOutStatus !== folder.operations.checkOutStatus
  ) {
    changes.push(`Check-out: ${input.checkOutStatus}`);
  }

  if (
    input.cleaningStatus &&
    input.cleaningStatus !== folder.operations.cleaningStatus
  ) {
    changes.push(`Curățenie: ${input.cleaningStatus}`);
  }

  if (input.internalNote?.trim()) {
    changes.push(`Notă: ${input.internalNote.trim()}`);
  }

  if (input.maintenanceRequired !== undefined) {
    changes.push(
      input.maintenanceRequired
        ? "Necesită mentenanță"
        : "Mentenanță rezolvată"
    );
  }

  if (input.maintenanceNote?.trim()) {
    changes.push(`Mentenanță: ${input.maintenanceNote.trim()}`);
  }

  const next: ReservationFolder = {
    ...folder,
    lifecycleStatus,
    operations: nextOperations,
    timeline:
      changes.length > 0
        ? [
            ...folder.timeline,
            event({
              category: "operation",
              action: "operations_updated",
              title: "Status operațional actualizat",
              note: changes.join(" • "),
              actor: input.actor ?? "admin",
            }),
          ]
        : folder.timeline,
    updatedAt: now(),
  };

  return saveReservationFolder(next);
}

export function deriveReservationHealth(
  folder: ReservationFolder
) {
  const reasons: string[] = [];

  if (["cancelled", "expired"].includes(folder.lifecycleStatus)) {
    return {
      level: "critical" as const,
      label:
        folder.lifecycleStatus === "cancelled"
          ? "Rezervare anulată"
          : "Rezervare expirată",
      reasons: [
        folder.lifecycleStatus === "cancelled"
          ? "Rezervarea este anulată."
          : "Termenul rezervării a expirat.",
      ],
    };
  }

  if (
    folder.paymentStatus === "unpaid" &&
    folder.lifecycleStatus === "waiting_payment"
  ) {
    reasons.push("Avansul nu a fost încasat.");
  }

  if (folder.financial.balance > 0) {
    reasons.push(
      `Sold restant: ${folder.financial.balance} lei.`
    );
  }

  if (folder.requests.some((request) => request.status === "pending")) {
    reasons.push("Există solicitări în așteptare.");
  }

  if (
    folder.lifecycleStatus === "checked_out" &&
    folder.operations.cleaningStatus !== "ready"
  ) {
    reasons.push("Curățenia nu este finalizată.");
  }

  if (
    folder.paymentStatus === "unpaid" &&
    folder.financial.requiredDeposit > 0
  ) {
    return {
      level: "critical" as const,
      label: "Necesită intervenție",
      reasons,
    };
  }

  if (reasons.length > 0) {
    return {
      level: "attention" as const,
      label: "Necesită atenție",
      reasons,
    };
  }

  return {
    level: "ok" as const,
    label: "Totul este în regulă",
    reasons: [],
  };
}

export function deriveNextAction(
  folder: ReservationFolder
) {
  const pendingRequest = folder.requests.find(
    (request) => request.status === "pending"
  );

  if (["cancelled", "expired", "completed"].includes(folder.lifecycleStatus)) {
    return {
      code: "none" as const,
      label: "Nicio acțiune necesară",
      priority: "low" as const,
    };
  }

  if (folder.lifecycleStatus === "waiting_payment") {
    return {
      code:
        folder.financial.selectedPaymentMode?.includes("vacation")
          ? ("send_payment_link" as const)
          : ("await_payment" as const),
      label: folder.financial.selectedPaymentMode?.includes("vacation")
        ? "Trimite linkul de plată"
        : "Așteaptă plata avansului",
      priority: "high" as const,
    };
  }

  if (pendingRequest) {
    return {
      code: "review_request" as const,
      label: "Răspunde solicitării clientului",
      priority: "high" as const,
    };
  }

  if (folder.lifecycleStatus === "confirmed") {
    return {
      code:
        folder.operations.checkInStatus === "pending"
          ? ("prepare_checkin" as const)
          : ("complete_checkin" as const),
      label:
        folder.operations.checkInStatus === "pending"
          ? "Pregătește check-in-ul"
          : "Finalizează check-in-ul",
      priority: "medium" as const,
    };
  }

  if (folder.lifecycleStatus === "checked_in") {
    return {
      code: "prepare_checkout" as const,
      label: "Pregătește check-out-ul",
      priority: "medium" as const,
    };
  }

  if (folder.lifecycleStatus === "checked_out") {
    return {
      code: "complete_checkout" as const,
      label:
        folder.operations.cleaningStatus === "ready"
          ? "Finalizează sejurul"
          : "Finalizează curățenia",
      priority: "medium" as const,
    };
  }

  return {
    code: "none" as const,
    label: "Nicio acțiune necesară",
    priority: "low" as const,
  };
}

export async function listReservationFolderSummaries() {
  const folders = await (await import("@/lib/reservation-center/store")).listReservationFolders();

  return folders.map((folder) => ({
    code: folder.code,
    lifecycleStatus: folder.lifecycleStatus,
    paymentStatus: folder.paymentStatus,
    guestName: folder.summary.guest.name,
    apartmentTitles: folder.summary.apartments.map(
      (apartment) => apartment.title
    ),
    checkIn: folder.summary.checkIn,
    checkOut: folder.summary.checkOut,
    total: folder.financial.total,
    paid: folder.financial.paid,
    balance: folder.financial.balance,
    selectedPaymentMode: folder.financial.selectedPaymentMode,
    selectedPaymentAmount: folder.financial.selectedPaymentAmount,
    health: deriveReservationHealth(folder),
    nextAction: deriveNextAction(folder),
    createdAt: folder.createdAt,
    updatedAt: folder.updatedAt,
  }));
}
