import { randomUUID } from "node:crypto";
import { calculateRequiredDeposit } from "@/lib/payments/payment-policy";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
} from "@/lib/payments/types";

function createPaymentId() {
  return `PAY-${randomUUID()}`;
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

  return {
    ok: true,
    paymentId,
    status: "pending",
    requiredDeposit,
    remainingBalance,
    requiresMerchantConfiguration: true,
    message:
      "Integrarea NETOPIA trebuie validată în sandbox înainte de activarea plăților reale.",
  };
}
