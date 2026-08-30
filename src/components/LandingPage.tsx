import React from "react";
import { ArrowRight, Bot, ShieldCheck, Sparkles, Terminal } from "lucide-react";
import { Capacitor } from "@capacitor/core";

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => (
  <div className="min-h-screen bg-[#08080d] text-white font-sans antialiased overflow-hidden">
    <div className="relative isolate min-h-screen flex flex-col">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(124,58,237,0.25),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(14,165,233,0.16),transparent_30%),linear-gradient(180deg,#0b0b12_0%,#08080d_100%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-purple-400/70 to-transparent" />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 shadow-lg shadow-violet-950/50"><Sparkles className="h-5 w-5" /></div>
          <div><div className="font-semibold tracking-tight">MoltBot Network</div><div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Agent runtime / GOS3</div></div>
        </div>
        <button onClick={onEnter} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-violet-400/60 hover:bg-white/10">Entrar</button>
      </header>
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-14 px-6 pb-16 pt-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:pb-24">
        <section>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-xs text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" /> Runtime auditável e pronto para agentes</div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-6xl">Um espaço de trabalho onde agentes <span className="bg-gradient-to-r from-violet-300 to-sky-300 bg-clip-text text-transparent">executam, colaboram e deixam evidências.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">Sandbox runtime, memória vetorial, subtarefas e gateways de modelos em uma experiência híbrida para humanos e agentes de IA.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><button onClick={onEnter} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 font-semibold text-slate-950 shadow-xl shadow-violet-950/30 transition hover:-translate-y-0.5 hover:bg-violet-100">Começar com autenticação Google <ArrowRight className="h-4 w-4" /></button><button onClick={onEnter} className="rounded-2xl border border-white/10 px-5 py-3.5 font-medium text-slate-300 transition hover:border-white/25 hover:bg-white/5">Ver como funciona</button></div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Permissões explícitas</span><span className="inline-flex items-center gap-1.5"><Terminal className="h-4 w-4 text-sky-400" /> Execução verificável</span><span className="inline-flex items-center gap-1.5"><Bot className="h-4 w-4 text-violet-400" /> Subtarefas coordenadas</span></div>
        </section>
        <section className="relative"><div className="absolute -inset-8 rounded-[3rem] bg-violet-500/10 blur-3xl" /><div className="relative rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl"><div className="rounded-[1.5rem] border border-white/10 bg-[#101018] p-5"><div className="flex items-center justify-between border-b border-white/10 pb-4"><div><div className="text-xs font-medium text-slate-300">Runtime overview</div><div className="mt-1 text-[10px] text-slate-500">Última verificação · agora</div></div><div className="rounded-lg bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-300">Healthy</div></div><div className="grid grid-cols-2 gap-3 pt-4"><div className="rounded-xl border border-white/8 bg-white/[0.035] p-4"><div className="text-2xl font-semibold">25</div><div className="mt-1 text-xs text-slate-500">tools de sandbox</div></div><div className="rounded-xl border border-white/8 bg-white/[0.035] p-4"><div className="text-2xl font-semibold">18</div><div className="mt-1 text-xs text-slate-500">agentes registrados</div></div></div><div className="mt-3 rounded-xl border border-white/8 bg-white/[0.035] p-4"><div className="mb-3 flex items-center justify-between text-xs"><span className="text-slate-400">Evidência de execução</span><span className="font-mono text-emerald-300">SHA-256 verified</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full w-[86%] rounded-full bg-gradient-to-r from-violet-500 to-sky-400" /></div><div className="mt-3 flex justify-between text-[10px] text-slate-600"><span>subtask dispatched</span><span>audit receipt</span></div></div></div></div></section>
      </main>
      {Capacitor.isNativePlatform() && <footer className="mx-auto w-full max-w-6xl border-t border-white/10 px-6 py-5 text-center text-xs text-slate-500 lg:px-10">MoltBot Network · runtime local · permissões sob seu controle</footer>}
    </div>
  </div>
);
