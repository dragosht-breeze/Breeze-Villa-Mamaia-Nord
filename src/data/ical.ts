export type IcalProvider = "booking" | "airbnb" | "direct" | "other";

export type ApartmentIcalConnection = {
  apartmentSlug: string;
  provider: IcalProvider;
  label: string;
  importUrl: string;
  enabled: boolean;
};

type IcalEnvKey =
  | "BOOKING_ICAL_APARTAMENT_3_PREMIUM"
  | "BOOKING_ICAL_APARTAMENT_SUPERIOR"
  | "BOOKING_ICAL_APARTAMENT_3_ETAJ_2"
  | "BOOKING_ICAL_APARTAMENT_3_ETAJ_1"
  | "BOOKING_ICAL_APARTAMENT_2_ETAJ_3"
  | "BOOKING_ICAL_APARTAMENT_2"
  | "BOOKING_ICAL_STUDIO";

function fromEnv(key: IcalEnvKey) {
  return process.env[key]?.trim() ?? "";
}

function isEnabled(url: string) {
  return url.length > 0 && url.startsWith("http");
}

function bookingConnection({
  apartmentSlug,
  label,
  envKey,
}: {
  apartmentSlug: string;
  label: string;
  envKey: IcalEnvKey;
}): ApartmentIcalConnection {
  const importUrl = fromEnv(envKey);

  return {
    apartmentSlug,
    provider: "booking",
    label,
    importUrl,
    enabled: isEnabled(importUrl),
  };
}

export const icalConnections: ApartmentIcalConnection[] = [
  bookingConnection({
    apartmentSlug: "apartament-3-premium",
    label: "Booking.com - Apartament 3 camere Premium",
    envKey: "BOOKING_ICAL_APARTAMENT_3_PREMIUM",
  }),
  bookingConnection({
    apartmentSlug: "apartament-superior",
    label: "Booking.com - Apartament Superior",
    envKey: "BOOKING_ICAL_APARTAMENT_SUPERIOR",
  }),
  bookingConnection({
    apartmentSlug: "apartament-3-etaj-2",
    label: "Booking.com - Apartament 3 camere Etaj 2",
    envKey: "BOOKING_ICAL_APARTAMENT_3_ETAJ_2",
  }),
  bookingConnection({
    apartmentSlug: "apartament-3-etaj-1",
    label: "Booking.com - Apartament 3 camere Etaj 1",
    envKey: "BOOKING_ICAL_APARTAMENT_3_ETAJ_1",
  }),
  bookingConnection({
    apartmentSlug: "apartament-2-etaj-3",
    label: "Booking.com - Apartament 2 camere Etaj 3",
    envKey: "BOOKING_ICAL_APARTAMENT_2_ETAJ_3",
  }),
  bookingConnection({
    apartmentSlug: "apartament-2",
    label: "Booking.com - Apartament 2 camere",
    envKey: "BOOKING_ICAL_APARTAMENT_2",
  }),
  bookingConnection({
    apartmentSlug: "studio",
    label: "Booking.com - Studio",
    envKey: "BOOKING_ICAL_STUDIO",
  }),
];

export function getIcalConnectionsByApartment(slug: string) {
  return icalConnections.filter((connection) => connection.apartmentSlug === slug);
}

export function getEnabledIcalConnectionsByApartment(slug: string) {
  return getIcalConnectionsByApartment(slug).filter(
    (connection) => connection.enabled && connection.importUrl.trim().length > 0
  );
}

export function getIcalSetupRows() {
  return [
    {
      apartmentSlug: "apartament-3-premium",
      apartmentName: "Apartament 3 camere Premium",
      envKey: "BOOKING_ICAL_APARTAMENT_3_PREMIUM",
    },
    {
      apartmentSlug: "apartament-superior",
      apartmentName: "Apartament Superior",
      envKey: "BOOKING_ICAL_APARTAMENT_SUPERIOR",
    },
    {
      apartmentSlug: "apartament-3-etaj-2",
      apartmentName: "Apartament 3 camere Etaj 2",
      envKey: "BOOKING_ICAL_APARTAMENT_3_ETAJ_2",
    },
    {
      apartmentSlug: "apartament-3-etaj-1",
      apartmentName: "Apartament 3 camere Etaj 1",
      envKey: "BOOKING_ICAL_APARTAMENT_3_ETAJ_1",
    },
    {
      apartmentSlug: "apartament-2-etaj-3",
      apartmentName: "Apartament 2 camere Etaj 3",
      envKey: "BOOKING_ICAL_APARTAMENT_2_ETAJ_3",
    },
    {
      apartmentSlug: "apartament-2",
      apartmentName: "Apartament 2 camere",
      envKey: "BOOKING_ICAL_APARTAMENT_2",
    },
    {
      apartmentSlug: "studio",
      apartmentName: "Studio",
      envKey: "BOOKING_ICAL_STUDIO",
    },
  ] as const;
}
