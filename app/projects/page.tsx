"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useProjects, useShots } from "@/lib/hooks";
import { StatusBadge, Progress, Empty } from "@/components/ui/bits";
import { GENRES } from "@/types/film";

export default function ProjectsPage() {
  const { projects, create, remove, save } = useProjects();
  const { shots } = useShots();
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: "", synopsis: "", genre: "Drama", director_name: "", planned_start_date: "" });

  const filtered = useMemo(() => projects.filter((p) =>
    (!q || (p.title + p.synopsis).toLowerCase().includes(q.toLowerCase())) &&
    (!genre || p.genre === genre)), [projects, q, genre]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div><h1 className="text-2xl font-bold">Projects</h1><p className="text-sm text-zinc-400">{projects.length} film projects</p></div>
        <button className="btn-primary ml-auto" onClick={() => setShowNew(!showNew)}>+ New Project</button>
      </div>
      {showNew && (
        <form className="card p-4 grid md:grid-cols-2 gap-3" onSubmit={(e) => {
          e.preventDefault();
          if (!form.title.trim()) return alert("Title required");
          create({ ...form, planned_start_date: form.planned_start_date || null });
          setForm({ title: "", synopsis: "", genre: "Drama", director_name: "", planned_start_date: "" }); setShowNew(false);
        }}>
          <div><p className="label">Title *</p><input className="input mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><p className="label">Genre</p><select className="input mt-1" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}>{GENRES.map((g) => <option key={g}>{g}</option>)}</select></div>
          <div className="md:col-span-2"><p className="label">Synopsis</p><textarea className="input mt-1" rows={3} value={form.synopsis} onChange={(e) => setForm({ ...form, synopsis: e.target.value })} /></div>
          <div><p className="label">Director</p><input className="input mt-1" value={form.director_name} onChange={(e) => setForm({ ...form, director_name: e.target.value })} /></div>
          <div><p className="label">Planned shoot date</p><input type="date" className="input mt-1" value={form.planned_start_date} onChange={(e) => setForm({ ...form, planned_start_date: e.target.value })} /></div>
          <div className="md:col-span-2"><button className="btn-primary">Create project</button></div>
        </form>
      )}
      <div className="flex flex-wrap gap-2 no-print">
        <input className="input max-w-xs" placeholder="Search projects…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input max-w-[180px]" value={genre} onChange={(e) => setGenre(e.target.value)}><option value="">All genres</option>{GENRES.map((g) => <option key={g}>{g}</option>)}</select>
      </div>
      {filtered.length === 0 ? <Empty title="No projects found" hint="Create one to get started." /> :
        <div className="grid md:grid-cols-2 gap-3">{filtered.map((p) => {
          const ps = shots.filter((s) => s.project_id === p.id);
          const pd = ps.filter((s) => s.status === "completed").length;
          return (
            <div key={p.id} className="card p-4">
              <div className="flex gap-2 items-start"><Link href={`/projects/${p.id}`} className="font-semibold hover:text-electric-400">{p.title}</Link><span className="ml-auto"><StatusBadge value={p.status} /></span></div>
              <p className="text-xs text-zinc-400 mt-1">{p.genre} · {p.target_runtime} · Dir. {p.director_name || "—"}</p>
              <p className="text-sm text-zinc-300 mt-2 line-clamp-2">{p.synopsis}</p>
              <div className="mt-3"><Progress value={ps.length ? (pd / ps.length) * 100 : 0} /></div>
              <p className="text-xs text-zinc-500 mt-1">{pd}/{ps.length} shots · Shoot: {p.planned_start_date || "—"}</p>
              <div className="mt-3 flex gap-2">
                <Link href={`/projects/${p.id}`} className="btn-secondary text-xs !px-3 !py-1.5">Open</Link>
                <Link href={`/shots?project=${p.id}`} className="btn-secondary text-xs !px-3 !py-1.5">Shots</Link>
                <button className="text-xs text-rose-300 ml-auto hover:underline" onClick={() => { if (confirm(`Delete "${p.title}" and all its shots?`)) remove(p.id); }}>Delete</button>
              </div>
            </div>
          );
        })}</div>}
    </div>
  );
}
