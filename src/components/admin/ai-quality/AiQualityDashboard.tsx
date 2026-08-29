"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, FlaskConical, Loader2, RefreshCw, XCircle } from "lucide-react";
import type { AiQualityReport } from "@/lib/ai/quality/types";

export default function AiQualityDashboard() {
  const [report, setReport] = useState<AiQualityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const run = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/ai-quality", { cache: "no-store" });
      if (!response.ok) throw new Error("Testele AI nu au putut fi rulate.");
      setReport((await response.json()) as AiQualityReport);
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "Testele AI nu au putut fi rulate.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void run(); }, [run]);

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="rounded-[2rem] bg-[#071B2D] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.24em] text-[#D9B56D]"><FlaskConical size={15}/> Quality Assurance</p>
              <h1 className="mt-3 text-3xl font-black sm:text-4xl">AI Conversation Tests</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/65">Teste automate pentru context, follow-up, memorie, ghid local, vreme și profilarea clientului.</p>
            </div>
            <button onClick={() => void run()} disabled={loading} className="flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-xs font-black ring-1 ring-white/15 hover:bg-white/15 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={15}/> : <RefreshCw size={15}/>} Rulează testele
            </button>
          </div>
        </header>

        {error ? <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">{error}</div> : null}

        {report ? (
          <>
            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Teste totale" value={report.total} />
              <Metric label="Trecute" value={report.passed} positive />
              <Metric label="Eșuate" value={report.failed} negative={report.failed > 0} />
              <Metric label="Rată succes" value={`${report.passRate}%`} positive={report.passRate === 100} />
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {report.groups.map((group) => (
                <article key={group.name} className="rounded-[1.5rem] border border-black/5 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between"><h2 className="font-black text-[#071B2D]">{group.name}</h2><span className="text-xs font-black text-gray-500">{group.passed}/{group.total}</span></div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F4F3EE]"><div className="h-full rounded-full bg-[#158F91]" style={{ width: `${group.total ? (group.passed / group.total) * 100 : 0}%` }}/></div>
                </article>
              ))}
            </section>

            <section className="mt-6 overflow-hidden rounded-[1.75rem] border border-black/5 bg-white shadow-sm">
              <div className="border-b border-black/5 p-5"><h2 className="text-xl font-black text-[#071B2D]">Rezultate</h2></div>
              <div className="divide-y divide-black/5">
                {report.results.map((result) => (
                  <div key={result.id} className="grid gap-3 p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
                    {result.status === "passed" ? <CheckCircle2 className="text-emerald-600" size={21}/> : <XCircle className="text-red-600" size={21}/>} 
                    <div><p className="font-black text-[#071B2D]">{result.title}</p><p className="mt-1 text-xs font-bold text-gray-500">{result.group} · așteptat: {result.expected}</p></div>
                    <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[.12em] ${result.status === "passed" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{result.actual}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : loading ? <div className="mt-8 flex items-center justify-center gap-3 font-black"><Loader2 className="animate-spin"/> Rulez testele...</div> : null}
      </div>
    </main>
  );
}

function Metric({ label, value, positive = false, negative = false }: { label: string; value: number | string; positive?: boolean; negative?: boolean }) {
  return <article className="rounded-[1.5rem] border border-black/5 bg-white p-5 shadow-sm"><p className={`text-3xl font-black ${negative ? "text-red-600" : positive ? "text-emerald-600" : "text-[#071B2D]"}`}>{value}</p><p className="mt-2 text-[10px] font-black uppercase tracking-[.14em] text-gray-500">{label}</p></article>;
}
