"use client";

import { CheckCircle2, Loader2, MessageCircle, Send, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type Status = {
  configured: boolean;
  phoneNumberIdConfigured: boolean;
  businessAccountIdConfigured: boolean;
  verifyTokenConfigured: boolean;
  appSecretConfigured: boolean;
  webhookPath: string;
};

export default function WhatsAppAdmin() {
  const [status, setStatus] = useState<Status | null>(null);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    "Mesaj de test trimis din Breeze Villa prin WhatsApp Cloud API."
  );
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    void fetch("/api/admin/whatsapp-test", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: Status) => setStatus(data))
      .catch(() => setStatus(null));
  }, []);

  async function sendTest() {
    setSending(true);
    setFeedback("");
    try {
      const response = await fetch("/api/admin/whatsapp-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message }),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Mesajul nu a putut fi trimis.");
      }
      setFeedback("Mesaj trimis cu succes.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Trimiterea a eșuat.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-[2rem] bg-[#071B2D] p-6 text-white shadow-xl sm:p-8">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.24em] text-[#D9B56D]"><MessageCircle size={15}/> Omnichannel</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">WhatsApp Cloud API</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/65">Test de trimitere și statusul configurației pentru integrarea oficială Meta.</p>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatusItem label="Trimitere" ok={status?.configured} />
          <StatusItem label="Phone ID" ok={status?.phoneNumberIdConfigured} />
          <StatusItem label="WABA ID" ok={status?.businessAccountIdConfigured} />
          <StatusItem label="Verify token" ok={status?.verifyTokenConfigured} />
          <StatusItem label="App secret" ok={status?.appSecretConfigured} />
        </section>

        <section className="mt-6 rounded-[1.75rem] border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-[#071B2D]">Trimite mesaj de test</h2>
          <p className="mt-2 text-sm font-semibold text-gray-500">Numărul trebuie introdus în format internațional, de exemplu 407xxxxxxxx.</p>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-black">Număr WhatsApp<input value={phone} onChange={(event)=>setPhone(event.target.value)} placeholder="407xxxxxxxx" className="rounded-2xl border border-black/10 px-4 py-3 outline-none focus:border-[#158F91]" /></label>
            <label className="grid gap-2 text-sm font-black">Mesaj<textarea value={message} onChange={(event)=>setMessage(event.target.value)} rows={5} className="rounded-2xl border border-black/10 px-4 py-3 outline-none focus:border-[#158F91]" /></label>
            <button type="button" onClick={() => void sendTest()} disabled={sending || !phone.trim() || !message.trim()} className="flex w-fit items-center gap-2 rounded-full bg-[#158F91] px-5 py-3 text-sm font-black text-white disabled:opacity-50">{sending ? <Loader2 size={17} className="animate-spin"/> : <Send size={17}/>} Trimite test</button>
            {feedback ? <p className={`rounded-2xl p-4 text-sm font-black ${feedback.includes("succes") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{feedback}</p> : null}
          </div>
        </section>

        <section className="mt-6 rounded-[1.75rem] border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-[#071B2D]">Webhook Meta</h2>
          <p className="mt-3 text-sm font-semibold text-gray-600">Callback URL: <code className="rounded bg-[#F4F3EE] px-2 py-1">https://domeniul-tău.ro{status?.webhookPath ?? "/api/webhooks/whatsapp"}</code></p>
          <p className="mt-2 text-sm font-semibold text-gray-600">Verify token: valoarea din <code className="rounded bg-[#F4F3EE] px-2 py-1">WHATSAPP_VERIFY_TOKEN</code>.</p>
        </section>
      </div>
    </main>
  );
}

function StatusItem({ label, ok }: { label: string; ok?: boolean }) {
  return <article className="rounded-[1.35rem] border border-black/5 bg-white p-4 shadow-sm"><div className="flex items-center gap-2">{ok ? <CheckCircle2 size={18} className="text-emerald-600"/> : <XCircle size={18} className="text-red-500"/>}<span className="text-xs font-black text-[#071B2D]">{label}</span></div></article>;
}
