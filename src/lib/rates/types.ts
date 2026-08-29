export type RateOverride = {
  apartmentSlug: string;
  date: string;
  price?: number;
  minNights?: number;
  blocked?: boolean;
  offerLabel?: string;
  updatedAt: string;
};

export type RateStore = {
  version: 1;
  updatedAt: string;
  overrides: RateOverride[];
};

export type RateBatchInput = {
  apartmentSlugs: string[];
  startDate: string;
  endDate: string;
  price?: number;
  minNights?: number;
  blocked?: boolean;
  offerLabel?: string;
  reset?: boolean;
};
