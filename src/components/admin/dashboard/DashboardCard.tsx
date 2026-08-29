import type { ReactNode } from "react";

export default function DashboardCard({
  eyebrow,
  title,
  action,
  children,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[2rem] bg-white p-6 shadow-[0_18px_50px_rgba(7,27,45,0.08)] ring-1 ring-black/5 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#158F91]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-2 text-2xl font-black text-[#071B2D]">{title}</h2>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
