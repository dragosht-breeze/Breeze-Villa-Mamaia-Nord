"use client";
import { FormEvent, useEffect, useState } from "react";
import { ShieldCheck, UserPlus } from "lucide-react";
import type { PublicAuthUser, UserRole } from "@/lib/auth/types";

const roleLabels: Record<UserRole,string> = { ADMIN:"Administrator", MANAGER:"Manager", RECEPTION:"Recepție", HOUSEKEEPING:"Curățenie" };
export default function UsersManager() {
  const [users,setUsers]=useState<PublicAuthUser[]>([]); const [error,setError]=useState("");
  const [form,setForm]=useState({name:"",email:"",password:"",role:"RECEPTION" as UserRole});
  async function load(){ const r=await fetch('/api/admin/users'); const d=await r.json(); if(r.ok)setUsers(d.users); else setError(d.error); }
  useEffect(()=>{void load()},[]);
  async function submit(e:FormEvent){e.preventDefault();setError("");const r=await fetch('/api/admin/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});const d=await r.json();if(!r.ok){setError(d.error);return}setForm({name:"",email:"",password:"",role:"RECEPTION"});await load();}
  async function toggle(id:string){const r=await fetch('/api/admin/users',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});const d=await r.json();if(!r.ok){setError(d.error);return}await load();}
  return <main className="p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-6xl">
    <p className="text-xs font-black uppercase tracking-[.2em] text-[#158F91]">Securitate</p><h1 className="mt-2 text-3xl font-black">Utilizatori și roluri</h1>
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_.8fr]">
      <section className="rounded-[2rem] bg-white p-6 shadow-sm"><h2 className="flex items-center gap-2 text-xl font-black"><ShieldCheck className="text-[#158F91]"/>Conturi active</h2>
        <div className="mt-5 grid gap-3">{users.map(u=><div key={u.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/5 p-4"><div className="min-w-0 flex-1"><p className="font-black">{u.name}</p><p className="truncate text-sm font-semibold text-gray-500">{u.email}</p></div><span className="rounded-full bg-[#E9F8F8] px-3 py-1 text-xs font-black text-[#158F91]">{roleLabels[u.role]}</span><button onClick={()=>toggle(u.id)} className={`rounded-xl px-3 py-2 text-xs font-black ${u.active?'bg-emerald-50 text-emerald-700':'bg-gray-100 text-gray-600'}`}>{u.active?'Activ':'Dezactivat'}</button></div>)}</div>
      </section>
      <form onSubmit={submit} className="rounded-[2rem] bg-[#071B2D] p-6 text-white"><h2 className="flex items-center gap-2 text-xl font-black"><UserPlus className="text-[#D9B56D]"/>Cont nou</h2>
        {['name','email','password'].map(key=><label key={key} className="mt-4 block text-xs font-black uppercase tracking-wider text-white/60">{key==='name'?'Nume':key==='email'?'E-mail':'Parolă'}<input type={key==='password'?'password':key==='email'?'email':'text'} required minLength={key==='password'?8:1} value={form[key as keyof typeof form]} onChange={e=>setForm({...form,[key]:e.target.value})} className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 normal-case text-white outline-none"/></label>)}
        <label className="mt-4 block text-xs font-black uppercase tracking-wider text-white/60">Rol<select value={form.role} onChange={e=>setForm({...form,role:e.target.value as UserRole})} className="mt-2 w-full rounded-xl border border-white/10 bg-[#102B40] px-4 py-3 text-white"><option value="MANAGER">Manager</option><option value="RECEPTION">Recepție</option><option value="HOUSEKEEPING">Curățenie</option><option value="ADMIN">Administrator</option></select></label>
        {error?<p className="mt-4 rounded-xl bg-red-500/15 p-3 text-sm font-bold text-red-200">{error}</p>:null}<button className="mt-6 w-full rounded-xl bg-[#D9B56D] px-4 py-3 font-black text-[#071B2D]">Creează utilizatorul</button>
      </form>
    </div></div></main>;
}
