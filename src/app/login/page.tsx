"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail, Waves } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Autentificarea a eșuat."); setLoading(false); return; }
    const next = new URLSearchParams(window.location.search).get("next") || "/admin"; router.replace(next); router.refresh();
  }
  return <main className="min-h-screen bg-[#071B2D] px-4 py-12 text-[#071B2D]">
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
      <form onSubmit={submit} className="w-full rounded-[2rem] bg-white p-8 shadow-2xl sm:p-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E9F8F8] text-[#158F91]"><Waves size={28}/></div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-[#D09B35]">Breeze OS</p>
        <h1 className="mt-2 text-3xl font-black">Autentificare</h1>
        <p className="mt-2 text-sm font-semibold text-gray-500">Acces securizat la centrul operațional Breeze Villa.</p>
        <label className="mt-8 block text-xs font-black uppercase tracking-wider text-gray-600">E-mail</label>
        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 px-4"><Mail size={18} className="text-[#158F91]"/><input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="w-full bg-transparent py-4 font-semibold outline-none"/></div>
        <label className="mt-5 block text-xs font-black uppercase tracking-wider text-gray-600">Parolă</label>
        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 px-4"><LockKeyhole size={18} className="text-[#158F91]"/><input value={password} onChange={e=>setPassword(e.target.value)} type="password" required className="w-full bg-transparent py-4 font-semibold outline-none"/></div>
        {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
        <button disabled={loading} className="mt-7 w-full rounded-2xl bg-[#D9B56D] px-5 py-4 font-black text-[#071B2D] disabled:opacity-60">{loading ? "Se verifică..." : "Intră în Breeze OS"}</button>
      </form>
    </div>
  </main>;
}
