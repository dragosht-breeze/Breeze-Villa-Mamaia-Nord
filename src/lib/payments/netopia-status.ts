import { applyNetopiaPaymentNotification } from "@/lib/reservation-center/service";
import { getReservationFolder } from "@/lib/reservation-center/store";

type NetopiaStatusResponse = {
  error?: { code?: string | number; message?: string };
  order?: {
    ntpID?: string | number;
    orderID?: string;
    amount?: number;
    currency?: string;
  };
  payment?: {
    ntpID?: string | number;
    status?: number;
    amount?: number;
    currency?: string;
  };
};

function statusEndpoint(startEndpoint: string) {
  const url = new URL(startEndpoint);
  url.pathname = "/operation/status";
  url.search = "";
  return url.toString();
}

export async function reconcileNetopiaPayment(code: string) {
  const apiToken = process.env.NETOPIA_API_TOKEN;
  const posID = process.env.NETOPIA_POS_ID;
  const startEndpoint = process.env.NETOPIA_PAYMENT_ENDPOINT;
  if (!apiToken || !posID || !startEndpoint) return null;

  const folder = await getReservationFolder(code);
  if (!folder) return null;
  if (folder.paymentStatus === "paid" || folder.paymentStatus === "partially_paid") {
    return folder;
  }

  const transaction = [...folder.financial.transactions]
    .reverse()
    .find(
      (item) =>
        item.kind === "payment" &&
        item.providerReference &&
        ["redirect_required", "processing"].includes(item.status)
    );
  if (!transaction?.providerReference) return folder;

  const response = await fetch(statusEndpoint(startEndpoint), {
    method: "POST",
    headers: {
      Authorization: apiToken,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      posID,
      ntpID: transaction.providerReference,
      orderID: code,
    }),
    cache: "no-store",
  });

  const raw = await response.text();
  let data: NetopiaStatusResponse = {};
  try {
    data = raw ? (JSON.parse(raw) as NetopiaStatusResponse) : {};
  } catch {
    throw new Error("NETOPIA returned an invalid status response");
  }

  if (!response.ok || data.error) {
    throw new Error(data.error?.message ?? `NETOPIA status failed (${response.status})`);
  }

  const returnedCode = data.order?.orderID;
  const providerReference = String(
    data.payment?.ntpID ?? data.order?.ntpID ?? ""
  );
  const providerStatus = data.payment?.status;
  const amount = data.order?.amount ?? data.payment?.amount;
  const currency = data.order?.currency ?? data.payment?.currency;

  if (
    returnedCode !== code ||
    providerReference !== transaction.providerReference ||
    typeof providerStatus !== "number" ||
    typeof amount !== "number" ||
    !currency
  ) {
    throw new Error("NETOPIA status response does not match the reservation");
  }

  // NETOPIA statuses 3 (paid) and 5 (confirmed) are successful payments.
  if (providerStatus !== 3 && providerStatus !== 5) return folder;

  return applyNetopiaPaymentNotification({
    code,
    providerReference,
    amount,
    currency,
    status: "paid",
  });
}
