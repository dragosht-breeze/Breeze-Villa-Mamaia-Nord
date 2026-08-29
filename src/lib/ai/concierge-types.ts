export type ConciergeContact = {
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  bookingUrl: string;
};

export type ConciergeApartment = {
  slug: string;
  name: string;
  surface: number;
  floor: string;
  capacity: number;
  description: string;
};

export type ConciergePolicy = {
  title: string;
  facts: string[];
  requiresOwnerConfirmation?: boolean;
};

export type LocalRecommendation = {
  name: string;
  category:
    | "restaurant"
    | "shopping"
    | "pharmacy"
    | "activity"
    | "beach"
    | "transport";
  description: string;
  address?: string;
  phone?: string;
  publishedSchedule?: string;
  caution?: string;
  id?: string;
  tags?: string[];
  familyFriendly?: boolean;
  walkingMinutes?: number;
  drivingMinutes?: number;
  mapsUrl?: string;
};

export type BreezeConciergeKnowledge = {
  identity: {
    publicName: string;
    propertyType: string;
    address: string;
    postalCode: string;
    coordinates: { latitude: number; longitude: number };
    contact: ConciergeContact;
  };
  positioning: string[];
  apartments: ConciergeApartment[];
  facilities: string[];
  policies: ConciergePolicy[];
  localGuide: LocalRecommendation[];
  safetyRules: string[];
  liveDataRules: string[];
};
