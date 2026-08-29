"use client";

import { AlertTriangle, CheckCircle2, RefreshCw, Rocket, ShieldAlert } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { LaunchCheck, LaunchReadinessReport } from "@/lib/launch-readiness/types";

const GROUPS: LaunchCheck["group"][] = [
  "Security",
  "Storage",
  "Website",
  "Email",
  "Payments",
  "AI",
  "WhatsApp",
  "Automations",
];

function StatusIcon({ status }: { status: LaunchCheck["status"] }) {
  if (status === "passed") return <CheckCircle2 size={20} className="text-emerald-600" />;
  if (status === "warning") return <AlertTriangle size={20} className="text-amber-600" />;
  return <ShieldAlert size={20} className="text-red-600" />;
}

function statusLabel(status: LaunchCheck["status"]) {
  if (status === "passed") return "OK";
  if (status === "warning") return "DE FINALIZAT";
  return "BLOCANT";
}

export default function LaunchReadinessDashboard() {
  const [report, setReport] = useState<LaunchReadinessReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/launch-readiness", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setReport((await response.json()) as LaunchReadinessReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu am putut genera raportul.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const grouped = useMemo(() => {
    if (!report) return [];
    return GROUPS.map((group) => ({
      group,
      items: report.checks.filter((item) => item.group === group),
    })).filter((entry) => entry.items.length > 0);
  }, [report]);

  return (
    <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
      <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#158F91]">RC14.1 · Production Preflight</p>
            <h1 className="mt-2 text-3xl font-black text-[#071B2D] sm:text-4xl">Pregătire pentru lansare</h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-gray-600">
              Verificări automate pentru securitate, storage, domeniu, e-mail, plăți, AI, WhatsApp și automatizări. Nu afișează valori secrete.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#071B2D] px-5 py-3 text-sm font-black text-white disabled:opacity-50"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} /> Verifică din nou
          </button>
        </div>

        {error ? <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}

        {report ? (
          <>
            <div className={`mt-7 rounded-[1.5rem] border p-5 ${report.readyForProduction ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
              <div className="flex items-center gap-3">
                <Rocket size={24} className={report.readyForProduction ? "text-emerald-700" : "text-red-700"} />
                <div>
                  <p className="text-lg font-black text-[#071B2D]">
                    {report.readyForProduction ? "Fără blocaje tehnice detectate" : `${report.blockers} blocaj${report.blockers === 1 ? "" : "e"} înainte de producție`}
                  </p>
                  <p className="mt-1 text-xs font-bold text-gray-600">Mediu curent: {report.environment} · verificat {new Date(report.generatedAt).toLocaleString("ro-RO")}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-emerald-50 p-5"><p className="text-3xl font-black text-emerald-700">{report.passed}</p><p className="mt-1 text-xs font-black uppercase tracking-wider text-emerald-800">OK</p></div>
              <div className="rounded-3xl bg-amber-50 p-5"><p className="text-3xl font-black text-amber-700">{report.warnings}</p><p className="mt-1 text-xs font-black uppercase tracking-wider text-amber-800">De finalizat</p></div>
              <div className="rounded-3xl bg-red-50 p-5"><p className="text-3xl font-black text-red-700">{report.blockers}</p><p className="mt-1 text-xs font-black uppercase tracking-wider text-red-800">Blocante</p></div>
            </div>
          </>
        ) : null}
      </section>

      {report ? (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {grouped.map(({ group, items }) => (
            <section key={group} className="rounded-[2rem] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-black text-[#071B2D]">{group}</h2>
              <div className="mt-4 grid gap-3">
                {items.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-black/5 bg-[#F8F7F2] p-4">
                    <div className="flex items-start gap-3">
                      <StatusIcon status={item.status} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black text-[#071B2D]">{item.label}</p>
                          <span className={`rounded-full px-2.5 py-1 text-[9px] font-black tracking-wide ${item.status === "passed" ? "bg-emerald-100 text-emerald-800" : item.status === "warning" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>{statusLabel(item.status)}</span>
                        </div>
                        <p className="mt-2 text-sm font-semibold leading-6 text-gray-600">{item.detail}</p>
                        {item.action && item.status !== "passed" ? <p className="mt-2 text-xs font-bold leading-5 text-[#071B2D]">Următorul pas: {item.action}</p> : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </main>
  );
}
