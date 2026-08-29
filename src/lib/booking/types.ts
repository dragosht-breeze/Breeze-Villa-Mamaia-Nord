import type { Apartment } from "@/data/apartments";

export const BOOKING_RULES = {
  maxLocationGuests: 32,
  childBecomesAdultAt: 10,
  maxSmallChildrenWithAdultsRatio: 2,
  smallChildrenPerAdultPlace: 2,
} as const;

export type BookingSearchInput = {
  checkIn: string;
  checkOut: string;
  adults: number;
  childAges: number[];
};

export type OccupancyResult = {
  requestedGuests: number;
  adultsInput: number;
  childrenInput: number;
  adultsForCapacity: number;
  smallChildren: number;
  smallChildrenWithAdults: number;
  smallChildrenNeedingPlaces: number;
  effectivePlaces: number;
};

export type AvailableApartment = Apartment & {
  totalPrice: number;
  averageNightPrice: number;
  maxMinNights: number;
};

export type BookingCombination = {
  id: string;
  apartments: AvailableApartment[];
  totalCapacity: number;
  totalPrice: number;
  nights: number;
  wastedPlaces: number;
  occupancy: OccupancyResult;
  isRecommended: boolean;
  reason: string;
  pricePerPerson: number;
  pricePerPersonPerNight: number;
};

export type BookingSearchResult = {
  ok: boolean;
  input: BookingSearchInput;
  nights: number;
  occupancy: OccupancyResult;
  combinations: BookingCombination[];
  message?: string;
  maxAvailableCapacity?: number;
};
