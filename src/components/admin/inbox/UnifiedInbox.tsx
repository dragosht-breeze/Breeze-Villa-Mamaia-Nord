"use client";

import { Bot, CheckCircle2, Inbox, MessageCircle, RefreshCw, Send, UserRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { UnifiedConversation } from "@/lib/communications";

type InboxResponse = { conversations: UnifiedConversation[]; generatedAt: string };

const channelLabel: Record<UnifiedConversation["channel"], string> = {
  website: "Site",
  messenger: "Messenger",
  whatsapp: "WhatsApp",
  email: "Email",
  booking: "Booking",
  manual: "Manual",
};

function timeLabel(value: string) {
  return new Intl.DateTimeFormat("ro-RO", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }).format(new Date(value));
}

export default function UnifiedInbox() {
  const [data, setData] = useState<InboxResponse>({ conversations: [], generatedAt: new Date().toISOString() });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/inbox", { cache: "no-store" });
      if (!response.ok) throw new Error("Inbox unavailable");
      const next = (await response.json()) as InboxResponse;
      setData(next);
      setSelectedId((current) => current && next.conversations.some((item) => item.id === current) ? current : next.conversations[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(timer);
  }, [load]);

  const selected = useMemo(() => data.conversations.find((item) => item.id === selectedId) ?? null, [data.conversations, selectedId]);

  async function changeMode(mode: "ai" | "operator") {
    if (!selected) return;
    await fetch(`/api/core/conversations/${selected.id}/mode`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    await load();
  }

  async function sendMessage() {
    if (!selected || !draft.trim() || sending) return;
    setSending(true);
    try {
      const response = await fetch(`/api/core/conversations/${selected.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: draft.trim() }),
      });
      if (!response.ok) throw new Error("Message could not be saved");
      setDraft("");
      await load();
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1600px] p-3 sm:p-6 lg:p-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#158F91]">RC14 Communication Hub</p>
          <h1 className="mt-1 text-3xl font-black text-[#071B2D]">Inbox unificat</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold text-gray-500">Fundația comună pentru conversațiile de pe site, Messenger, WhatsApp și canalele viitoare.</p>
        </div>
        <button onClick={() => void load()} className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-black shadow-sm hover:bg-[#E9F8F8]"><RefreshCw size={16}/>Actualizează</button>
      </div>

      <section className="grid min-h-[68vh] overflow-hidden rounded-[1.75rem] border border-black/5 bg-white shadow-[0_18px_60px_rgba(7,27,45,.08)] lg:grid-cols-[360px_1fr]">
        <aside className="border-b border-black/5 bg-[#F8F8F5] lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-black/5 p-4">
            <div className="flex items-center gap-2 font-black"><Inbox size={18} className="text-[#158F91]"/>Conversații</div>
            <span className="rounded-full bg-[#071B2D] px-2.5 py-1 text-xs font-black text-white">{data.conversations.length}</span>
          </div>
          <div className="max-h-[34vh] overflow-y-auto lg:max-h-[calc(68vh-61px)]">
            {loading ? <p className="p-6 text-sm font-bold text-gray-500">Se încarcă...</p> : null}
            {!loading && data.conversations.length === 0 ? (
              <div className="p-8 text-center"><MessageCircle className="mx-auto text-gray-300" size={34}/><p className="mt-3 font-black">Nu există încă conversații</p><p className="mt-1 text-sm font-semibold text-gray-500">Vor apărea aici după conectarea canalelor la API-ul comun.</p></div>
            ) : null}
            {data.conversations.map((conversation) => (
              <button key={conversation.id} onClick={() => setSelectedId(conversation.id)} className={`w-full border-b border-black/5 p-4 text-left transition ${selectedId === conversation.id ? "bg-[#E9F8F8]" : "hover:bg-white"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><p className="truncate font-black text-[#071B2D]">{conversation.displayName}</p><p className="mt-1 text-[11px] font-black uppercase tracking-wide text-[#158F91]">{channelLabel[conversation.channel]}</p></div>
                  <span className="shrink-0 text-[10px] font-bold text-gray-400">{timeLabel(conversation.updatedAt)}</span>
                </div>
                <p className="mt-2 truncate text-sm font-semibold text-gray-500">{conversation.lastMessage || "Conversație nouă"}</p>
              </button>
            ))}
          </div>
        </aside>

        <div className="flex min-h-[34rem] flex-col">
          {!selected ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center"><div><Inbox size={46} className="mx-auto text-gray-200"/><p className="mt-4 text-xl font-black">Selectează o conversație</p><p className="mt-1 text-sm font-semibold text-gray-500">Inbox-ul este pregătit pentru conectarea canalelor.</p></div></div>
          ) : (
            <>
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-4 py-3 sm:px-6">
                <div><p className="font-black">{selected.displayName}</p><p className="text-xs font-bold text-gray-500">{channelLabel[selected.channel]} · {selected.channelIdentity}</p></div>
                <div className="flex rounded-xl bg-[#F4F3EE] p-1">
                  <button onClick={() => void changeMode("ai")} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black ${selected.mode === "ai" ? "bg-white text-[#158F91] shadow-sm" : "text-gray-500"}`}><Bot size={15}/>AI</button>
                  <button onClick={() => void changeMode("operator")} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black ${selected.mode === "operator" ? "bg-white text-[#071B2D] shadow-sm" : "text-gray-500"}`}><UserRound size={15}/>Operator</button>
                </div>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto bg-[#F7F8F7] p-4 sm:p-6">
                {selected.messages.map((message) => {
                  const outbound = message.direction === "outbound";
                  return <div key={message.id} className={`flex ${outbound ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${outbound ? "bg-[#071B2D] text-white" : "bg-white text-[#071B2D]"}`}><p className="whitespace-pre-wrap text-sm font-semibold">{message.text}</p><div className={`mt-2 flex items-center gap-1 text-[10px] font-bold ${outbound ? "text-white/55" : "text-gray-400"}`}><span>{message.author}</span><span>·</span><span>{timeLabel(message.createdAt)}</span>{outbound ? <CheckCircle2 size={11}/> : null}</div></div></div>;
                })}
              </div>

              <footer className="border-t border-black/5 bg-white p-3 sm:p-4">
                <div className="flex gap-2">
                  <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} placeholder="Scrie un răspuns intern..." rows={2} className="min-h-12 flex-1 resize-none rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold outline-none focus:border-[#158F91]"/>
                  <button disabled={!draft.trim() || sending} onClick={() => void sendMessage()} className="flex w-12 items-center justify-center rounded-2xl bg-[#158F91] text-white disabled:opacity-40"><Send size={18}/></button>
                </div>
                <p className="mt-2 text-[11px] font-semibold text-gray-400">În această etapă mesajul este salvat în hub; trimiterea externă va fi activată per conector.</p>
              </footer>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
