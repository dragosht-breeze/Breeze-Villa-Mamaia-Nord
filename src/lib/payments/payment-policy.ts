export const DEFAULT_DEPOSIT_PERCENT = 30;

export type DepositBreakdown = {
  percentageAmount: number;
  oneNightAmount: number;
  requiredDeposit: number;
};

export function calculateRequiredDeposit(
  totalAmount: number,
  nights: number,
  depositPercent = DEFAULT_DEPOSIT_PERCENT
): DepositBreakdown {
  const safeTotal = Math.max(0, totalAmount);
  const safeNights = Math.max(1, nights);
  const safePercent = Math.max(0, depositPercent);

  const percentageAmount = Math.round(
    (safeTotal * safePercent) / 100
  );
  const oneNightAmount = Math.round(safeTotal / safeNights);

  return {
    percentageAmount,
    oneNightAmount,
    requiredDeposit: Math.max(percentageAmount, oneNightAmount),
  };
}
