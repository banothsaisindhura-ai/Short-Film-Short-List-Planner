"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useProjects, useShots } from "@/lib/hooks";

function AssistantInner() {
  const sp = useSearchParams();
  const { projects } = useProjects();
  const [pid, setPid] = useState(sp.get("project") || "");
  const active = projects.find((p) => p.id === pid) ?? projects[0];
  const { shots } = useShots(active?.id);
  const mine = active ? shots.filter((s) => s.project_id === active.id) : [];
  const [q, setQ] = useState("");
  const [msgs, setMsgs] = useState<{ role: string; text: string }[]>([{ role: "ai", text: "Hi! I'm your AI production assistant. Ask about low-budget options, shoot order, equipment, or what's left to film." }]);
  const [loading, setLoading] = useState(false);

  async function ask(suggestion?: string) {
    const question = suggestion ?? q;
    if (!question.trim() || loading) return;
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setQ(""); setLoading(true);
    try {
      const res = await fetch("/api/ai/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, project: active, shots: mine.slice(0, 60) }) });
      const j = await res.json();
      setMsgs((m) => [...m, { role: "ai", text: j.answer || j.error || "No response." }]);
    } catch (e) { setMsgs((m) => [...m, { role: "ai", text: "Request failed. Check GEMINI_API_KEY or try demo mode." }]); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex gap-2 items-center flex-wrap">
        <div><h1 className="text-2xl font-bold">AI Production Assistant</h1><p className="text-sm text-zinc-400">Suggestions are AI estimates — saved project data is shown separately.</p></div>
        <select className="input !w-auto ml-auto" value={active?.id ?? ""} onChange={(e) => setPid(e.target.value)}>{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select>
      </div>
      {active && <div className="card p-3 text-xs text-zinc-400">Saved context: <strong className="text-zinc-200">{active.title}</strong> · {mine.length} shots · {mine.filter((s) => s.status !== "completed").length} incomplete</div>}
      <div className="flex flex-wrap gap-2 no-print">{["How can I shoot this with a low budget?", "Which shots should I film first?", "How can I reduce location changes?", "What equipment do I need?", "Which shots are still incomplete?"].map((s) => <button key={s} className="btn-secondary !text-xs !py-1" onClick={() => ask(s)}>{s}</button>)}</div>
      <div className="card p-4 space-y-3 min-h-[300px]">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <p className={`inline-block text-sm rounded-xl px-3 py-2 max-w-[90%] whitespace-pre-wrap text-left ${m.role === "user" ? "bg-electric-600 text-white" : "bg-white/10 border border-white/10"}`}>
              {m.role === "ai" && <span className="block text-[10px] uppercase tracking-wide text-amberglow-400 mb-1">AI suggestion (not saved data)</span>}{m.text}
            </p>
          </div>
        ))}
        {loading && <p className="text-sm text-zinc-400">Thinking…</p>}
      </div>
      <form className="flex gap-2 no-print" onSubmit={(e) => { e.preventDefault(); ask(); }}>
        <input className="input" placeholder="Ask about your shoot…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn-primary">Ask</button>
      </form>
    </div>
  );
}
export default function AssistantPage() {
  return <Suspense fallback={<div className="card p-8">Loading…</div>}><AssistantInner /></Suspense>;
}
