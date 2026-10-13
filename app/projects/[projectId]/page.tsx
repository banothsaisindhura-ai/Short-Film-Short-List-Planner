"use client";
import { use } from "react";
import Link from "next/link";
import { useProjects, useShots } from "@/lib/hooks";
import { StatusBadge, Progress } from "@/components/ui/bits";
import { toCsv, downloadFile } from "@/lib/utils";

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { projects, save } = useProjects();
  const { shots, saveMany } = useShots(projectId);
  const found = projects.find((x) => x.id === projectId);
  if (!found) return <div className="card p-8">Project not found. <Link href="/projects" className="underline text-electric-400">Back</Link></div>;
  const p = found;
  const done = shots.filter((s) => s.status === "completed").length;
  const title = p.title;

  function exportCsv() {
    const rows = shots.map((s) => ({ project: title, scene: s.scene_number, shot: s.shot_number, title: s.title, description: s.description, location: s.location, type: s.shot_type, movement: s.camera_movement, angle: s.camera_angle, equipment: s.equipment.join("; "), actors: s.actors.join("; "), date: s.shooting_date ?? "", status: s.status, priority: s.priority }));
    downloadFile(`${p.title.replace(/\W+/g, "-")}-shots.csv`, toCsv(rows), "text/csv");
  }

  return (
    <div className="space-y-4">
      <Link href="/projects" className="text-xs text-zinc-400 hover:underline no-print">← All projects</Link>
      <div className="card p-5">
        <div className="flex flex-wrap gap-2 items-start">
          <div><h1 className="text-2xl font-bold">{p.title}</h1><p className="text-sm text-zinc-400">{p.genre} · {p.target_runtime} · Dir. {p.director_name || "—"}</p></div>
          <span className="ml-auto"><StatusBadge value={p.status} /></span>
        </div>
        <p className="text-sm mt-2 text-zinc-300">{p.synopsis}</p>
        <div className="mt-3 max-w-md"><Progress value={shots.length ? (done / shots.length) * 100 : 0} /></div>
        <p className="text-xs text-zinc-500 mt-1">{done}/{shots.length} shots completed</p>
        <div className="mt-3 flex flex-wrap gap-2 no-print">
          <Link href={`/shots?project=${p.id}`} className="btn-primary text-sm">Open Shot List</Link>
          <Link href={`/shots?project=${p.id}&generate=1`} className="btn-secondary text-sm">Generate with AI</Link>
          <Link href={`/schedule?project=${p.id}`} className="btn-secondary text-sm">Schedule</Link>
          <Link href={`/assistant?project=${p.id}`} className="btn-secondary text-sm">Ask AI Assistant</Link>
          <button onClick={exportCsv} className="btn-secondary text-sm">Export CSV</button>
          <button onClick={() => window.print()} className="btn-secondary text-sm">Print / PDF</button>
          <select className="input max-w-[200px] ml-auto" value={p.status} onChange={(e) => save({ ...p, status: e.target.value as typeof p.status })}>
            {["development","pre_production","shooting","post_production","completed"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="card p-4">
        <p className="font-medium">Shots ({shots.length})</p>
        <div className="mt-2 overflow-x-auto"><table className="shots w-full min-w-[720px]">
          <thead><tr><th>#</th><th>Scene</th><th>Title</th><th>Location</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>{shots.map((s) => (<tr key={s.id}><td>{s.shot_number}</td><td>{s.scene_number}</td><td>{s.title}</td><td>{s.location}</td><td><StatusBadge value={s.status} /></td><td>{s.shooting_date || "—"}</td></tr>))}</tbody>
        </table></div>
        {shots.length === 0 && <p className="text-sm text-zinc-400 mt-2">No shots yet — generate with AI or add manually in Shot List.</p>}
      </div>
    </div>
  );
}
