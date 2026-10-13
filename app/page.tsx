import Link from "next/link";
import { Clapperboard, ArrowRight, Sparkles, Database, FileDown } from "lucide-react";
export default function Home() {
  return (
    <div className="min-h-screen grid place-items-center p-6 bg-charcoal-950">
      <div className="max-w-2xl w-full card p-8 md:p-12 text-center">
        <span className="mx-auto grid place-items-center size-14 rounded-2xl bg-electric-600 w-fit"><Clapperboard className="size-7" /></span>
        <h1 className="mt-4 text-3xl md:text-4xl font-bold">Short Film Shot List Planner</h1>
        <p className="mt-2 text-zinc-400">Create projects, generate AI shot lists with Gemini, schedule shoot days, track progress and export call sheets. Works in demo mode without keys.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="btn-primary">Open Dashboard <ArrowRight className="size-4" /></Link>
          <Link href="/login" className="btn-secondary">Login / Signup</Link>
        </div>
        <div className="mt-6 grid md:grid-cols-3 gap-3 text-left text-sm">
          {[["AI Shot Generator","Turn a synopsis into an editable shot list."],["Scheduling","Group by location & date to reduce moves."],["Exports","CSV + print-ready PDF call sheets."]].map(([t,d]) => (
            <div key={t} className="rounded-xl border border-white/10 p-3"><p className="font-medium flex items-center gap-1"><Sparkles className="size-3 text-amberglow-400" />{t}</p><p className="text-zinc-400 text-xs mt-1">{d}</p></div>
          ))}
        </div>
        <p className="mt-4 text-xs text-zinc-500 flex items-center justify-center gap-1"><Database className="size-3" /> Local mode: all data stays in your browser. Add a Gemini key for AI. <FileDown className="size-3" /></p>
      </div>
    </div>
  );
}
