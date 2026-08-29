"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  UserRound,
  WalletCards,
  Wrench,
  BedDouble,
} from "lucide-react";
import type { OperationalTask, TaskCategory, TaskPriority, TaskStatus, TaskSummary } from "@/lib/tasks/types";

type ApiPayload = { ok: boolean; tasks: OperationalTask[]; summary: TaskSummary; message?: string };

const categoryLabels: Record<TaskCategory, string> = {
  check_in: "Check-in", check_out: "Check-out", cleaning: "Curățenie",
  payment: "Încasare", maintenance: "Mentenanță", manual: "Manual",
};
const roleLabels: Record<OperationalTask["assigneeRole"], string> = {
  administrator: "Administrator", manager: "Manager", reception: "Recepție",
  housekeeping: "Curățenie", unassigned: "Nealocat",
};
const priorityLabels: Record<TaskPriority, string> = {
  critical: "Critică", high: "Mare", normal: "Normală", low: "Scăzută",
};
const statusLabels: Record<TaskStatus, string> = {
  open: "Nou", in_progress: "În lucru", completed: "Finalizat", cancelled: "Anulat",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ro-RO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
function isOverdue(task: OperationalTask) {
  return !["completed", "cancelled"].includes(task.status) && new Date(task.dueAt).getTime() < Date.now();
}
function categoryIcon(category: TaskCategory) {
  if (category === "payment") return WalletCards;
  if (category === "maintenance") return Wrench;
  if (category === "cleaning") return BedDouble;
  if (category === "check_in" || category === "check_out") return CalendarClock;
  return ClipboardCheck;
}

export default function TaskCenter() {
  const [tasks, setTasks] = useState<OperationalTask[]>([]);
  const [summary, setSummary] = useState<TaskSummary>({ open: 0, inProgress: 0, overdue: 0, dueToday: 0, completed: 0, critical: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | TaskCategory>("all");
  const [roleFilter, setRoleFilter] = useState<"all" | OperationalTask["assigneeRole"]>("all");
  const [form, setForm] = useState({
    title: "", description: "", dueAt: "", priority: "normal" as TaskPriority,
    category: "manual" as TaskCategory, assigneeRole: "unassigned" as OperationalTask["assigneeRole"],
  });

  async function loadTasks() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/tasks", { cache: "no-store" });
      const data = await response.json() as ApiPayload;
      if (!response.ok || !data.ok) throw new Error(data.message || "Taskurile nu au putut fi încărcate.");
      setTasks(data.tasks); setSummary(data.summary);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "A apărut o eroare."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void loadTasks(); }, []);

  const filtered = useMemo(() => tasks.filter((task) =>
    (statusFilter === "all" || task.status === statusFilter) &&
    (categoryFilter === "all" || task.category === categoryFilter) &&
    (roleFilter === "all" || task.assigneeRole === roleFilter)
  ), [tasks, statusFilter, categoryFilter, roleFilter]);

  async function patchTask(id: string, patch: Partial<OperationalTask>) {
    setSaving(id); setError("");
    try {
      const response = await fetch(`/api/admin/tasks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "Taskul nu a putut fi actualizat.");
      await loadTasks();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "A apărut o eroare."); }
    finally { setSaving(null); }
  }

  async function createTask(event: React.FormEvent) {
    event.preventDefault(); setSaving("new"); setError("");
    try {
      const response = await fetch("/api/admin/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "Taskul nu a putut fi creat.");
      setForm({ title: "", description: "", dueAt: "", priority: "normal", category: "manual", assigneeRole: "unassigned" });
      setShowForm(false); await loadTasks();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "A apărut o eroare."); }
    finally { setSaving(null); }
  }

  async function removeTask(id: string) {
    if (!window.confirm("Ștergi acest task manual?")) return;
    setSaving(id);
    try {
      const response = await fetch(`/api/admin/tasks/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "Taskul nu a putut fi șters.");
      await loadTasks();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "A apărut o eroare."); }
    finally { setSaving(null); }
  }

  const cards = [
    { label: "Critice", value: summary.critical, icon: AlertTriangle, note: "necesită atenție", accent: "bg-red-50 text-red-700" },
    { label: "Astăzi", value: summary.dueToday, icon: CalendarClock, note: "cu termen azi", accent: "bg-amber-50 text-amber-700" },
    { label: "Întârziate", value: summary.overdue, icon: Clock3, note: "termen depășit", accent: "bg-orange-50 text-orange-700" },
    { label: "În lucru", value: summary.inProgress, icon: RefreshCw, note: "preluate acum", accent: "bg-cyan-50 text-cyan-700" },
    { label: "Finalizate", value: summary.completed, icon: CheckCircle2, note: "înregistrate", accent: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <section className="overflow-hidden rounded-[2rem] bg-[#071B2D] p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#D9B56D]"><Sparkles size={18} /><span className="text-xs font-black uppercase tracking-[0.25em]">Breeze OS · v0.9.2</span></div>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">Task Center</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold text-white/65 sm:text-base">Toate activitățile operaționale într-un singur loc. Taskurile de check-in, check-out, curățenie și încasare se sincronizează automat din rezervări.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => void loadTasks()} className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black hover:bg-white/15"><RefreshCw size={17} /> Sincronizează</button>
            <button onClick={() => setShowForm((value) => !value)} className="inline-flex items-center gap-2 rounded-2xl bg-[#D9B56D] px-4 py-3 text-sm font-black text-[#071B2D] hover:brightness-105"><Plus size={18} /> Task manual</button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, note, accent }) => (
          <article key={label} className="rounded-[1.6rem] border border-black/5 bg-white p-5 shadow-sm">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent}`}><Icon size={21} /></div>
            <p className="mt-4 text-3xl font-black">{value}</p><p className="mt-1 text-sm font-black">{label}</p><p className="mt-1 text-xs font-semibold text-black/45">{note}</p>
          </article>
        ))}
      </section>

      {showForm ? (
        <form onSubmit={createTask} className="mt-6 rounded-[2rem] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#158F91]">Task manual</p><h2 className="mt-1 text-xl font-black">Adaugă o activitate</h2></div><button type="button" onClick={() => setShowForm(false)} className="text-sm font-black text-black/45">Închide</button></div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="grid gap-2 text-sm font-black xl:col-span-2">Titlu<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-2xl border border-black/10 px-4 py-3 font-semibold outline-none focus:border-[#158F91]" placeholder="Ex: Verifică aerul condiționat" /></label>
            <label className="grid gap-2 text-sm font-black">Termen<input required type="datetime-local" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} className="rounded-2xl border border-black/10 px-4 py-3 font-semibold outline-none focus:border-[#158F91]" /></label>
            <label className="grid gap-2 text-sm font-black">Categorie<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TaskCategory })} className="rounded-2xl border border-black/10 px-4 py-3 font-semibold">{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="grid gap-2 text-sm font-black">Prioritate<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })} className="rounded-2xl border border-black/10 px-4 py-3 font-semibold">{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="grid gap-2 text-sm font-black">Responsabil<select value={form.assigneeRole} onChange={(e) => setForm({ ...form, assigneeRole: e.target.value as OperationalTask["assigneeRole"] })} className="rounded-2xl border border-black/10 px-4 py-3 font-semibold">{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="grid gap-2 text-sm font-black md:col-span-2 xl:col-span-3">Descriere<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-24 rounded-2xl border border-black/10 px-4 py-3 font-semibold outline-none focus:border-[#158F91]" placeholder="Detalii utile pentru persoana responsabilă" /></label>
          </div>
          <button disabled={saving === "new"} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#071B2D] px-5 py-3 text-sm font-black text-white disabled:opacity-60">{saving === "new" ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />} Salvează taskul</button>
        </form>
      ) : null}

      <section className="mt-6 rounded-[2rem] border border-black/5 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#158F91]">Flux operațional</p><h2 className="mt-1 text-2xl font-black">Activități</h2></div>
          <div className="grid gap-2 sm:grid-cols-3">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="rounded-2xl border border-black/10 px-3 py-2.5 text-sm font-black"><option value="all">Toate statusurile</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)} className="rounded-2xl border border-black/10 px-3 py-2.5 text-sm font-black"><option value="all">Toate categoriile</option>{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)} className="rounded-2xl border border-black/10 px-3 py-2.5 text-sm font-black"><option value="all">Toți responsabilii</option>{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          </div>
        </div>

        {error ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div> : null}
        {loading ? <div className="flex min-h-64 items-center justify-center"><Loader2 className="animate-spin text-[#158F91]" size={30} /></div> : null}
        {!loading && filtered.length === 0 ? <div className="mt-6 rounded-[1.5rem] border border-dashed border-black/15 p-10 text-center"><CheckCircle2 className="mx-auto text-[#158F91]" size={32} /><p className="mt-3 font-black">Nu există taskuri pentru filtrele selectate.</p></div> : null}

        <div className="mt-5 grid gap-3">
          {filtered.map((task) => {
            const Icon = categoryIcon(task.category);
            const overdue = isOverdue(task);
            return (
              <article key={task.id} className={`rounded-[1.5rem] border p-4 transition sm:p-5 ${overdue ? "border-red-200 bg-red-50/50" : "border-black/5 bg-[#FAFAF8]"} ${task.status === "completed" ? "opacity-65" : ""}`}>
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${task.priority === "critical" ? "bg-red-100 text-red-700" : task.priority === "high" ? "bg-amber-100 text-amber-700" : "bg-[#E9F5F3] text-[#158F91]"}`}><Icon size={22} /></div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-black/55">{categoryLabels[task.category]}</span>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${task.priority === "critical" ? "bg-red-100 text-red-700" : "bg-black/5 text-black/55"}`}>{priorityLabels[task.priority]}</span>
                        {task.source === "automatic" ? <span className="rounded-full bg-[#D9B56D]/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#8A671E]">Automat</span> : null}
                        {overdue ? <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">Întârziat</span> : null}
                      </div>
                      <h3 className={`mt-2 text-base font-black sm:text-lg ${task.status === "completed" ? "line-through" : ""}`}>{task.title}</h3>
                      {task.description ? <p className="mt-1 text-sm font-semibold text-black/50">{task.description}</p> : null}
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-black/50">
                        <span className="flex items-center gap-1.5"><Clock3 size={14} /> {formatDate(task.dueAt)}</span>
                        <span className="flex items-center gap-1.5"><UserRound size={14} /> {roleLabels[task.assigneeRole]}</span>
                        {task.reservationCode ? <a href={`/admin/reservations?code=${encodeURIComponent(task.reservationCode)}`} className="font-black text-[#158F91]">Rezervare {task.reservationCode}</a> : null}
                        {task.apartmentTitles.length ? <span>{task.apartmentTitles.join(" · ")}</span> : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 xl:justify-end">
                    <select disabled={saving === task.id} value={task.assigneeRole} onChange={(e) => void patchTask(task.id, { assigneeRole: e.target.value as OperationalTask["assigneeRole"] })} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-black">{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                    <select disabled={saving === task.id} value={task.status} onChange={(e) => void patchTask(task.id, { status: e.target.value as TaskStatus })} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-black">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                    {task.source === "manual" ? <button disabled={saving === task.id} onClick={() => void removeTask(task.id)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50"><Trash2 size={16} /></button> : null}
                    {saving === task.id ? <Loader2 size={17} className="animate-spin text-[#158F91]" /> : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
