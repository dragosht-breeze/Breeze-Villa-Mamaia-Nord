export const BREEZE_CONFIG = {
  property: {
    name: "Breeze Villa Mamaia Nord",
    shortName: "Breeze Villa",
    timezone: "Europe/Bucharest",
    currency: "RON",
  },
  booking: {
    checkInTime: "15:00",
    checkOutStartTime: "09:00",
    checkOutEndTime: "10:00",
    selfCheckInAfter: "18:00",
    reservationExpiryHours: 48,
  },
  payment: {
    depositPercent: 30,
    minimumDepositRule: "one_night" as const,
  },
  policies: {
    cancellation:
      "Sumele achitate nu sunt rambursabile în cazul anulării.",
  },
} as const;

export type BreezeConfig = typeof BREEZE_CONFIG;
