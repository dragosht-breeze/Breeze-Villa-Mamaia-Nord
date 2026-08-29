"use client";

export type ReservationGuestForm = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

type Props = {
  value: ReservationGuestForm;
  onChange: (value: ReservationGuestForm) => void;
  errors: Partial<Record<keyof ReservationGuestForm, string>>;
};

export default function ReservationStepGuest({
  value,
  onChange,
  errors,
}: Props) {
  function field(
    key: keyof ReservationGuestForm,
    nextValue: string
  ) {
    onChange({ ...value, [key]: nextValue });
  }

  return (
    <div>
      <p className="text-sm font-semibold leading-6 text-gray-600">
        Completează datele persoanei care face rezervarea. Le vom folosi doar
        pentru comunicarea și confirmarea sejurului.
      </p>

      <div className="mt-6 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-black text-[#071B2D]">Nume complet</span>
          <input
            autoFocus
            value={value.name}
            onChange={(event) => field("name", event.target.value)}
            placeholder="Ex: Andrei Popescu"
            className="rounded-2xl border border-black/10 px-4 py-4 font-bold outline-none transition focus:border-[#158F91]"
          />
          {errors.name ? (
            <span className="text-xs font-bold text-red-600">{errors.name}</span>
          ) : null}
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-black text-[#071B2D]">Telefon</span>
            <input
              value={value.phone}
              onChange={(event) => field("phone", event.target.value)}
              placeholder="07xx xxx xxx"
              inputMode="tel"
              className="rounded-2xl border border-black/10 px-4 py-4 font-bold outline-none transition focus:border-[#158F91]"
            />
            {errors.phone ? (
              <span className="text-xs font-bold text-red-600">
                {errors.phone}
              </span>
            ) : null}
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black text-[#071B2D]">Email</span>
            <input
              type="email"
              value={value.email}
              onChange={(event) => field("email", event.target.value)}
              placeholder="nume@email.ro"
              className="rounded-2xl border border-black/10 px-4 py-4 font-bold outline-none transition focus:border-[#158F91]"
            />
            {errors.email ? (
              <span className="text-xs font-bold text-red-600">
                {errors.email}
              </span>
            ) : null}
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-black text-[#071B2D]">
            Mesaj opțional
          </span>
          <textarea
            value={value.message}
            onChange={(event) => field("message", event.target.value)}
            placeholder="Orice informație utilă pentru sejur"
            className="min-h-28 rounded-2xl border border-black/10 px-4 py-4 font-bold outline-none transition focus:border-[#158F91]"
          />
        </label>
      </div>
    </div>
  );
}
