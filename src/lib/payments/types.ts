export type PaymentMethod =
  | "card_online"
  | "vacation_card_link"
  | "bank_transfer";

export type PaymentScope =
  | "deposit"
  | "partial"
  | "full";

export type PaymentStatus =
  | "pending"
  | "link_pending"
  | "redirect_required"
  | "processing"
  | "paid"
  | "failed"
  | "refund_pending"
  | "refunded"
  | "cancelled";

export type CreatePaymentInput = {
  reservationCode: string;
  totalAmount: number;
  nights: number;
  amount: number;
  currency: "RON";
  method: PaymentMethod;
  scope: PaymentScope;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  description: string;
  returnUrl: string;
};

export type CreatePaymentResult = {
  ok: boolean;
  status: PaymentStatus;
  paymentId: string;
  redirectUrl?: string;
  message: string;
  requiredDeposit: number;
  remainingBalance: number;
  requiresMerchantConfiguration?: boolean;
};
