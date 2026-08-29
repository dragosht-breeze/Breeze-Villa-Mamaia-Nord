import type { ReservationHealthLevel } from "@/lib/reservation-center/types";

export default function HealthBadge({
  level,
  label,
}: {
  level: ReservationHealthLevel;
  label: string;
}) {
  const classes = {
    ok: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    attention: "bg-amber-50 text-amber-700 ring-amber-200",
    critical: "bg-red-50 text-red-700 ring-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-black ring-1 ${classes[level]}`}
    >
      {label}
    </span>
  );
}
