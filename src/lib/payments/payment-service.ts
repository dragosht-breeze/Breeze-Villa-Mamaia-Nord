import { randomUUID } from "node:crypto";
import { calculateRequiredDeposit } from "@/lib/payments/payment-policy";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
} from "@/lib/payments/types";

function createPaymentId() {
  return `PAY-${randomUUID()}`;
}

type NetopiaStartResponse = {
  error?: {
    code?: string | number;
    message?: string;
  };
  customerAction?: {
    url?: string;
  };
  payment?: {
    ntpID?: string | number;
    paymentURL?: string;
    paymentUrl?: string;
    status?: string | number;
  };
};

function splitCustomerName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "Client",
    lastName: parts.slice(1).join(" ") || "Breeze Villa",
  };
}

export async function createPayment(
  input: CreatePaymentInput
): Promise<CreatePaymentResult> {
  const paymentId = createPaymentId();
  const { requiredDeposit } = calculateRequiredDeposit(
    input.totalAmount,
    input.nights
  );

  const safeAmount = Math.round(input.amount);
  const remainingBalance = Math.max(
    0,
    Math.round(input.totalAmount - safeAmount)
  );

  if (input.scope === "deposit" && safeAmount < requiredDeposit) {
    return {
      ok: false,
      paymentId,
      status: "failed",
      requiredDeposit,
      remainingBalance: input.totalAmount,
      message: `Avansul minim necesar este ${requiredDeposit} lei.`,
    };
  }

  if (input.scope === "partial") {
    if (safeAmount < requiredDeposit) {
      return {
        ok: false,
        paymentId,
        status: "failed",
        requiredDeposit,
        remainingBalance: input.totalAmount,
        message: `Plata parțială trebuie să acopere cel puțin avansul de ${requiredDeposit} lei.`,
      };
    }

    if (safeAmount >= input.totalAmount) {
      return {
        ok: false,
        paymentId,
        status: "failed",
        requiredDeposit,
        remainingBalance: 0,
        message:
          "Pentru plata întregii valori selectează opțiunea de plată integrală.",
      };
    }
  }

  if (input.scope === "full" && safeAmount !== Math.round(input.totalAmount)) {
    return {
      ok: false,
      paymentId,
      status: "failed",
      requiredDeposit,
      remainingBalance,
      message:
        "Suma pentru plata integrală trebuie să fie egală cu valoarea totală a rezervării.",
    };
  }

  if (input.method === "vacation_card_link") {
    return {
      ok: true,
      paymentId,
      status: "link_pending",
      requiredDeposit,
      remainingBalance,
      message:
        input.scope === "full"
          ? "Solicitarea pentru plata integrală cu card de vacanță a fost înregistrată."
          : "Solicitarea pentru plata parțială cu card de vacanță a fost înregistrată. Diferența se achită la locație.",
    };
  }

  if (input.method === "bank_transfer") {
    return {
      ok: true,
      paymentId,
      status: "pending",
      requiredDeposit,
      remainingBalance,
      message:
        "Rezervarea a fost înregistrată. Datele pentru transferul bancar vor fi transmise separat.",
    };
  }

  const apiToken = process.env.NETOPIA_API_TOKEN;
  const pointOfSaleId = process.env.NETOPIA_POS_ID;
  const paymentEndpoint = process.env.NETOPIA_PAYMENT_ENDPOINT;

  if (!apiToken || !pointOfSaleId || !paymentEndpoint) {
    return {
      ok: true,
      paymentId,
      status: "pending",
      requiredDeposit,
      remainingBalance,
      requiresMerchantConfiguration: true,
      message:
        "Rezervarea a fost înregistrată, iar plata online este în așteptarea activării contului comercial NETOPIA.",
    };
  }

  const { firstName, lastName } = splitCustomerName(input.customer.name);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.breezevilla.ro")
    .replace(/\/$/, "");

  try {
    const response = await fetch(paymentEndpoint, {
      method: "POST",
      headers: {
        Authorization: apiToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        config: {
          emailTemplate: "confirm",
          notifyUrl: `${siteUrl}/api/payments/netopia/ipn`,
          redirectUrl: input.returnUrl,
          language: "ro",
        },
        payment: {
          options: { installments: 1, bonus: 0 },
          instrument: { type: "card", token: "" },
          data: {},
        },
        order: {
          ntpID: "",
          posSignature: pointOfSaleId,
          dateTime: new Date().toISOString(),
          description: input.description,
          orderID: input.reservationCode,
          amount: safeAmount,
          currency: input.currency,
          billing: {
            email: input.customer.email,
            phone: input.customer.phone,
            firstName,
            lastName,
            city: "Navodari",
            country: 642,
            state: "Constanta",
            postalCode: "905700",
            details: "Rezervare online Breeze Villa",
          },
          products: [
            {
              name: input.description,
              code: input.reservationCode,
              category: "Cazare",
              price: safeAmount,
              vat: 0,
            },
          ],
          installments: { selected: 1, available: [0] },
          data: {
            paymentScope: input.scope,
            totalAmount: String(Math.round(input.totalAmount)),
          },
        },
      }),
      cache: "no-store",
    });

    const raw = await response.text();
    let data: NetopiaStartResponse = {};
    try {
      data = raw ? (JSON.parse(raw) as NetopiaStartResponse) : {};
    } catch {
      data = {};
    }

    const redirectUrl =
      data.payment?.paymentURL ??
      data.payment?.paymentUrl ??
      data.customerAction?.url;
    const providerPaymentId = data.payment?.ntpID
      ? String(data.payment.ntpID)
      : paymentId;

    if (!response.ok || !redirectUrl) {
      console.error("NETOPIA start payment failed", {
        httpStatus: response.status,
        errorCode: data.error?.code,
        errorMessage: data.error?.message,
      });
      return {
        ok: false,
        paymentId: providerPaymentId,
        status: "failed",
        requiredDeposit,
        remainingBalance: input.totalAmount,
        message:
          data.error?.message ??
          "NETOPIA nu a putut inițializa plata. Încearcă din nou sau contactează proprietatea.",
      };
    }

    return {
      ok: true,
      paymentId: providerPaymentId,
      status: "redirect_required",
      redirectUrl,
      requiredDeposit,
      remainingBalance,
      message: "Plata a fost inițializată în NETOPIA.",
    };
  } catch (error) {
    console.error("NETOPIA connection error", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      ok: false,
      paymentId,
      status: "failed",
      requiredDeposit,
      remainingBalance: input.totalAmount,
      message:
        "Nu ne-am putut conecta la NETOPIA. Încearcă din nou în câteva momente.",
    };
  }
}
