"use client";
import Link from "next/link";
import { Plus, Sparkles, BarChart3 } from "lucide-react";
import { useProjects, useShots } from "@/lib/hooks";
import { StatusBadge, Progress, Empty } from "@/components/ui/bits";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const { projects } = useProjects();
  const { shots } = useShots();
  const total = shots.length;
  const done = shots.filter((s) => s.status === "completed").length;
  const pending = total - done;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const byStatus = ["planned","ready","in_progress","completed","reshoot"].map((st) => ({ name: st.replace("_"," "), count: shots.filter((s) => s.status === st).length }));
  const upcoming = [...shots].filter((s) => s.shooting_date).sort((a,b) => String(a.shooting_date).localeCompare(String(b.shooting_date))).slice(0,5);
  const recent = [...projects].slice(0,4);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div><h1 className="text-2xl font-bold">Dashboard</h1><p className="text-sm text-zinc-400">Welcome back — here is your shoot at a glance.</p></div>
        <div className="ml-auto flex gap-2 no-print">
          <Link href="/projects" className="btn-primary"><Plus className="size-4" />Create New Project</Link>
          <Link href="/shots?generate=1" className="btn-secondary"><Sparkles className="size-4" />Generate Shot List with AI</Link>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[["Projects", projects.length],["Planned shots", total],["Completed", done],["Pending", pending]].map(([k,v]) => (
          <div key={k} className="card p-4"><p className="text-xs text-zinc-400">{k}</p><p className="text-2xl font-bold">{v}</p></div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="font-medium flex items-center gap-2"><BarChart3 className="size-4 text-electric-400" />Overall progress — {pct}%</p>
          <div className="mt-2"><Progress value={pct} /></div>
          <div className="h-44 mt-3"><ResponsiveContainer width="100%" height="100%"><BarChart data={byStatus}><XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 10 }} interval={0} angle={-15} dy={8} height={50} /><YAxis tick={{ fill: "#a1a1aa" }} allowDecimals={false} /><Tooltip contentStyle={{ background: "#1b1b28", border: "1px solid #333" }} /><Bar dataKey="count" fill="#8b5cf6" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer></div>
        </div>
        <div className="card p-4">
          <p className="font-medium">Upcoming shooting sessions</p>
          {upcoming.length === 0 ? <p className="text-sm text-zinc-400 mt-2">No dates assigned yet. Open Shot List → set shooting dates.</p> :
            <ul className="mt-2 space-y-2 text-sm">{upcoming.map((s) => (<li key={s.id} className="flex justify-between gap-2 border-b border-white/5 pb-1"><span className="truncate">S{s.scene_number} · Shot {s.shot_number} — {s.title}</span><span className="text-zinc-400 whitespace-nowrap">{s.shooting_date} · {s.location || "—"}</span></li>))}</ul>}
        </div>
      </div>
      <div className="card p-4">
        <p className="font-medium">Recently updated projects</p>
        {recent.length === 0 ? <div className="mt-2"><Empty title="No projects yet" hint="Create your first project to start planning." /></div> :
          <div className="grid md:grid-cols-2 gap-3 mt-3">{recent.map((p) => {
            const ps = shots.filter((s) => s.project_id === p.id);
            const pd = ps.filter((s) => s.status === "completed").length;
            return (<Link key={p.id} href={`/projects/${p.id}`} className="rounded-xl border border-white/10 p-3 hover:border-electric-500/50"><div className="flex items-center gap-2"><strong className="truncate">{p.title}</strong><span className="ml-auto"><StatusBadge value={p.status} /></span></div><p className="text-xs text-zinc-400 mt-1 line-clamp-2">{p.synopsis || "No synopsis"}</p><div className="mt-2"><Progress value={ps.length ? (pd/ps.length)*100 : 0} /></div><p className="text-xs text-zinc-500 mt-1">{pd}/{ps.length} shots done</p></Link>);
          })}</div>}
      </div>
    </div>
  );
}
