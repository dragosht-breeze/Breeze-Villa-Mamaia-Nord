import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export default function StatCard({
  title,
  value,
  note,
  icon: Icon,
  href,
  tone = "teal",
}: {
  title: string;
  value: number | string;
  note: string;
  icon: LucideIcon;
  href?: string;
  tone?: "teal" | "gold" | "blue" | "purple" | "red" | "slate";
}) {
  const toneClasses = {
    teal: "bg-[#E9F8F8] text-[#158F91]",
    gold: "bg-[#FFF3D7] text-[#9A6700]",
    blue: "bg-[#EAF2FA] text-[#0F4C81]",
    purple: "bg-purple-50 text-purple-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-700",
  };

  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-500">
            {title}
          </p>
          <p className="mt-3 text-4xl font-black text-[#071B2D]">{value}</p>
        </div>
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${toneClasses[tone]}`}
        >
          <Icon size={22} />
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-gray-600">{note}</p>
    </>
  );

  const classes =
    "block rounded-[1.7rem] bg-white p-5 shadow-[0_18px_50px_rgba(7,27,45,0.08)] ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(7,27,45,0.12)]";

  return href ? (
    <Link href={href} className={classes}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}
