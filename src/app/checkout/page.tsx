import Link from "next/link";
import FullPaymentButton from "@/components/checkout/FullPaymentButton";

type CheckoutPageProps = {
  searchParams: Promise<{
    apartment?: string;
    title?: string;
    checkIn?: string;
    checkOut?: string;
    nights?: string;
    total?: string;
    adults?: string;
    children?: string;
    guestName?: string;
    guestPhone?: string;
    guestEmail?: string;
    guestMessage?: string;
  }>;
};

function formatDate(dateKey?: string) {
  if (!dateKey) return "-";

  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateKey}T12:00:00`));
}

function asNumber(value: string | undefined, fallback = 0) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;

  const apartmentSlug = params.apartment ?? "studio";
  const title = params.title ?? "Apartament Breeze Villa";
  const checkIn = params.checkIn ?? "";
  const checkOut = params.checkOut ?? "";
  const nights = asNumber(params.nights);
  const total = asNumber(params.total);
  const adults = asNumber(params.adults, 2);
  const children = asNumber(params.children);
  const guestName = params.guestName ?? "";
  const guestPhone = params.guestPhone ?? "";
  const guestEmail = params.guestEmail ?? "";
  const guestMessage = params.guestMessage ?? "";

  const canPay = Boolean(
    apartmentSlug &&
      title &&
      checkIn &&
      checkOut &&
      nights > 0 &&
      total > 0 &&
      guestName &&
      guestPhone
  );

  const payload = {
    apartmentSlug,
    apartmentTitle: title,
    checkIn,
    checkOut,
    nights,
    total,
    adults,
    children,
    guest: {
      name: guestName,
      phone: guestPhone,
      email: guestEmail,
      message: guestMessage,
    },
  };

  return (
    <main className="min-h-screen bg-[#FAFAF7] px-6 py-16">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_420px]">
        <div className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(7,27,45,0.08)] md:p-10">
          <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#158F91]">
            Breeze Villa Checkout
          </p>

          <h1 className="mt-4 text-4xl font-black leading-tight text-[#071B2D]">
            Rezervare pe loc cu plată integrală
          </h1>

          <p className="mt-5 text-base leading-8 text-gray-600">
            Verifică detaliile rezervării înainte de plată. După finalizarea cu succes a plății integrale, rezervarea se confirmă automat și perioada se blochează în calendar.
          </p>

          <div className="mt-8 rounded-[1.5rem] bg-[#E9F8F8] p-6 text-sm leading-7 text-[#071B2D]">
            <p className="font-black">Politica de anulare</p>
            <p className="mt-2">
              Prin efectuarea plății confirmați că ați citit și acceptat Termenii și condițiile, precum și Politica de anulare a rezervărilor. Sumele achitate sunt nerambursabile în cazul anulării rezervării de către client.
            </p>
          </div>

          {!canPay && (
            <div className="mt-8 rounded-[1.5rem] bg-red-50 p-6 text-sm font-bold leading-7 text-red-700">
              Datele pentru plată sunt incomplete. Revino la pagina apartamentului, alege perioada și completează numele și telefonul.
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/apartamente/${apartmentSlug}`}
              className="rounded-full bg-[#071B2D] px-6 py-3 text-sm font-black text-white transition hover:bg-[#0F4C81]"
            >
              Înapoi la apartament
            </Link>

            <Link
              href="/politica-anulare"
              className="rounded-full bg-[#D9B56D] px-6 py-3 text-sm font-black text-[#071B2D] transition hover:bg-white"
            >
              Vezi politica de anulare
            </Link>
          </div>
        </div>

        <aside className="rounded-[2rem] bg-[#071B2D] p-8 text-white shadow-[0_20px_60px_rgba(7,27,45,0.16)]">
          <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#D9B56D]">
            Rezumat plată
          </p>

          <h2 className="mt-4 text-2xl font-black">{title}</h2>

          <div className="mt-6 grid gap-3 text-sm">
            <p>Check-in: <span className="font-black">{formatDate(checkIn)}</span></p>
            <p>Check-out: <span className="font-black">{formatDate(checkOut)}</span></p>
            <p>Nopți: <span className="font-black">{nights || "-"}</span></p>
            <p>Oaspeți: <span className="font-black">{adults || "-"} adulți, {children} copii</span></p>
          </div>

          <div className="mt-6 rounded-[1.5rem] bg-white/10 p-5">
            <p className="text-sm text-white/75">Client</p>
            <p className="mt-2 font-black">{guestName || "-"}</p>
            <p className="text-sm text-white/70">{guestPhone || "-"}</p>
            {guestEmail && <p className="text-sm text-white/70">{guestEmail}</p>}
          </div>

          <div className="mt-8 rounded-[1.5rem] bg-white/10 p-5">
            <p className="text-sm text-white/75">Total de plată</p>
            <p className="mt-1 text-4xl font-black text-[#D9B56D]">
              {total > 0 ? `${total} lei` : "-"}
            </p>
          </div>

          {canPay ? (
            <FullPaymentButton payload={payload} />
          ) : (
            <button
              type="button"
              disabled
              className="mt-6 w-full cursor-not-allowed rounded-full bg-emerald-600/50 px-6 py-4 text-sm font-black text-white"
            >
              Plata nu poate fi inițiată
            </button>
          )}
        </aside>
      </section>
    </main>
  );
}
