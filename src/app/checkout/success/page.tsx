import Link from "next/link";
import { getReservationRequestById } from "@/lib/reservationStore";

type SuccessPageProps = {
  searchParams: Promise<{
    reservationId?: string;
  }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { reservationId } = await searchParams;

  const reservation = reservationId
    ? await getReservationRequestById(reservationId)
    : null;

  return (
    <main className="min-h-screen bg-[#FAFAF7] px-6 py-20">
      <section className="mx-auto max-w-4xl text-center">
        <p className="text-[12px] font-black uppercase tracking-[0.4em] text-[#158F91]">
          Breeze Villa Mamaia Nord
        </p>

        <h1 className="mt-6 text-4xl font-black text-[#071B2D] md:text-6xl">
          Rezervarea este confirmată!
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
          Vă mulțumim că ați ales Breeze Villa Mamaia Nord. Rezervarea a fost
          confirmată cu succes în sistemul de test.
        </p>

        <div className="mx-auto mt-12 max-w-2xl rounded-[2rem] bg-white p-8 text-left shadow-[0_20px_60px_rgba(7,27,45,0.10)]">
          <div className="mb-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-[#E9F8F8] px-4 py-2 text-xs font-black text-[#158F91]">
              ✓ Rezervare confirmată
            </span>

            <span className="rounded-full bg-[#F7E8BD] px-4 py-2 text-xs font-black text-[#071B2D]">
              ✓ Plată confirmată
            </span>
          </div>

          <p className="mb-6 text-[12px] font-black uppercase tracking-[0.35em] text-[#158F91]">
            Detalii rezervare
          </p>

          {reservation ? (
            <>
              <div className="grid gap-4 text-[#071B2D]">
                <p>
                  <strong>Cod:</strong> {reservation.id}
                </p>
                <p>
                  <strong>Apartament:</strong> {reservation.apartmentTitle}
                </p>
                <p>
                  <strong>Client:</strong> {reservation.guest.name}
                </p>
                <p>
                  <strong>Telefon:</strong> {reservation.guest.phone}
                </p>
                <p>
                  <strong>Perioadă:</strong> {reservation.checkIn} -{" "}
                  {reservation.checkOut}
                </p>
                <p>
                  <strong>Nopți:</strong> {reservation.nights}
                </p>
              </div>

              <div className="mt-8 rounded-[1.5rem] bg-[#FAFAF7] p-5">
                <p className="mb-4 text-[12px] font-black uppercase tracking-[0.3em] text-[#158F91]">
                  Rezumat financiar
                </p>

                <div className="grid gap-3 text-[#071B2D]">
                  <div className="flex justify-between gap-4">
                    <span>Total sejur</span>
                    <strong>{reservation.total} lei</strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>Achitat</span>
                    <strong>{reservation.total} lei</strong>
                  </div>

                  <div className="flex justify-between gap-4 border-t border-black/10 pt-3">
                    <span>Sold rămas</span>
                    <strong className="text-[#158F91]">0 lei</strong>
                  </div>
                </div>
              </div>

              <p className="mt-6 rounded-2xl bg-[#E9F8F8] p-4 text-sm font-bold leading-6 text-[#071B2D]">
                Confirmarea rezervării va fi trimisă pe email după activarea
                modulului de email automat.
              </p>
            </>
          ) : (
            <p className="text-gray-600">
              Rezervarea a fost confirmată, dar detaliile nu au putut fi
              afișate momentan.
            </p>
          )}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="rounded-full bg-[#071B2D] px-8 py-4 text-sm font-black text-white shadow-xl transition hover:-translate-y-1 hover:bg-[#0F4C81]"
          >
            Înapoi acasă
          </Link>

          <a
            href="https://wa.me/40723253405"
            target="_blank"
            className="rounded-full bg-[#D9B56D] px-8 py-4 text-sm font-black text-[#071B2D] shadow-xl transition hover:-translate-y-1 hover:bg-white"
          >
            Contact WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}