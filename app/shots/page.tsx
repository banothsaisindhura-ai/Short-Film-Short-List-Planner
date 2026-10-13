"use client";
import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useProjects, useShots } from "@/lib/hooks";
import { StatusBadge, PriorityBadge, Empty } from "@/components/ui/bits";
import { AiGenerator } from "@/components/ai/AiGenerator";
import type { Shot } from "@/types/film";
import { uid, nowIso, toCsv, downloadFile } from "@/lib/utils";
import { SHOT_TYPES, CAMERA_MOVEMENTS, CAMERA_ANGLES, SHOT_STATUSES, PRIORITIES } from "@/types/film";

function ShotsInner() {
  const sp = useSearchParams();
  const { projects } = useProjects();
  const [projectId, setProjectId] = useState(sp.get("project") || "");
  const { shots, save, saveMany, remove, refresh } = useShots(projectId || undefined);
  const [view, setView] = useState<"table" | "cards">("table");
  const [q, setQ] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fPriority, setFPriority] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showGen, setShowGen] = useState(sp.get("generate") === "1");
  const [editing, setEditing] = useState<Shot | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const activeProject = projects.find((p) => p.id === projectId) ?? projects[0];
  const pid = activeProject?.id ?? "";
  const list = useMemo(() => {
    const base = pid ? shots.filter((s) => s.project_id === pid) : shots;
    return base.filter((s) =>
      (!q || (s.title + s.description + "scene" + s.scene_number + "shot" + s.shot_number).toLowerCase().includes(q.toLowerCase())) &&
      (!fStatus || s.status === fStatus) && (!fPriority || s.priority === fPriority)
    ).sort((a, b) => a.scene_number - b.scene_number || a.shot_number - b.shot_number);
  }, [shots, pid, q, fStatus, fPriority]);

  function blankShot(): Shot {
    const nums = shots.filter((s) => s.project_id === pid).map((s) => s.shot_number);
    return { id: uid(), project_id: pid, scene_id: null, shot_number: (Math.max(0, ...nums)) + 1, scene_number: 1, scene_heading: "", title: "", description: "", location: "", shot_type: "Wide Shot", camera_movement: "Static / Tripod", camera_angle: "Eye Level", focal_length: "", estimated_duration: "", equipment: [], actors: [], lighting_notes: "", audio_notes: "", shooting_date: null, priority: "medium", status: "planned", sort_order: Date.now(), additional_notes: "", created_at: nowIso(), updated_at: nowIso() };
  }

  function exportCsv() {
    const rows = list.map((s) => ({ scene: s.scene_number, shot: s.shot_number, title: s.title, description: s.description, location: s.location, type: s.shot_type, movement: s.camera_movement, angle: s.camera_angle, equipment: s.equipment.join("; "), actors: s.actors.join("; "), date: s.shooting_date ?? "", status: s.status, priority: s.priority }));
    downloadFile("shot-list.csv", toCsv(rows), "text/csv");
  }

  if (!activeProject) return <Empty title="Create a project first" hint="Shot lists belong to a project." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div><h1 className="text-2xl font-bold">Shot List Planner</h1><p className="text-sm text-zinc-400">{list.length} shots shown</p></div>
        <div className="ml-auto flex flex-wrap gap-2 no-print">
          <select className="input !w-auto" value={pid} onChange={(e) => setProjectId(e.target.value)}>{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select>
          <button className="btn-secondary text-sm" onClick={() => setView(view === "table" ? "cards" : "table")}>{view === "table" ? "Card view" : "Table view"}</button>
          <button className="btn-secondary text-sm" onClick={() => setShowGen(!showGen)}>✨ AI Generator</button>
          <button className="btn-primary text-sm" onClick={() => { setEditing(blankShot()); setShowForm(true); }}>+ Add Shot</button>
        </div>
      </div>

      {showGen && activeProject && <AiGenerator projectId={pid} projectTitle={activeProject.title} synopsis={activeProject.synopsis} genre={activeProject.genre} onSaved={() => { refresh(); setShowGen(false); }} />}

      <div className="flex flex-wrap gap-2 no-print">
        <input className="input max-w-xs" placeholder="Search shots / scenes…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input !w-auto" value={fStatus} onChange={(e) => setFStatus(e.target.value)}><option value="">All statuses</option>{SHOT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <select className="input !w-auto" value={fPriority} onChange={(e) => setFPriority(e.target.value)}><option value="">All priorities</option>{PRIORITIES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <button className="btn-secondary text-xs" onClick={exportCsv}>Export CSV</button>
        <button className="btn-secondary text-xs" onClick={() => window.print()}>Print / PDF</button>
        {selected.size > 0 && (
          <select className="input !w-auto" defaultValue="" onChange={(e) => {
            if (!e.target.value) return;
            saveMany(list.filter((s) => selected.has(s.id)).map((s) => ({ ...s, status: e.target.value as Shot["status"] })));
            setSelected(new Set()); refresh();
          }}>
            <option value="">Bulk: set {selected.size} to…</option>{SHOT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>

      {list.length === 0 ? <Empty title="No shots match" hint="Add shots manually or generate with AI." /> : view === "table" ? (
        <div className="card overflow-x-auto"><table className="shots w-full min-w-[900px]">
          <thead><tr><th><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? new Set(list.map((s) => s.id)) : new Set())} /></th><th>Sc</th><th>Shot</th><th>Title</th><th>Type / Move</th><th>Location</th><th>Status</th><th>Pri</th><th>Date</th><th className="no-print">Actions</th></tr></thead>
          <tbody>{list.map((s) => (
            <tr key={s.id}>
              <td><input type="checkbox" checked={selected.has(s.id)} onChange={() => { const n = new Set(selected); if (n.has(s.id)) n.delete(s.id); else n.add(s.id); setSelected(n); }} /></td>
              <td>{s.scene_number}</td><td>{s.shot_number}</td>
              <td><p className="font-medium">{s.title}</p><p className="text-xs text-zinc-400 line-clamp-2 max-w-[260px]">{s.description}</p></td>
              <td className="text-xs">{s.shot_type}<br /><span className="text-zinc-400">{s.camera_movement}</span></td>
              <td className="text-xs">{s.location || "—"}</td>
              <td><select className="input !w-auto !py-1 !text-xs" value={s.status} onChange={(e) => save({ ...s, status: e.target.value as Shot["status"] })}>{SHOT_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}</select></td>
              <td><PriorityBadge value={s.priority} /></td>
              <td><input type="date" className="input !w-auto !py-1 !text-xs" value={s.shooting_date ?? ""} onChange={(e) => save({ ...s, shooting_date: e.target.value || null })} /></td>
              <td className="no-print whitespace-nowrap">
                <button className="text-xs underline mr-2" onClick={() => { setEditing(s); setShowForm(true); }}>Edit</button>
                <button className="text-xs underline mr-2" onClick={() => { const c = { ...s, id: uid(), shot_number: s.shot_number + 0.5, title: s.title + " (copy)", created_at: nowIso(), updated_at: nowIso() }; save(c); refresh(); }}>Duplicate</button>
                <button className="text-xs text-rose-300 underline" onClick={() => { if (confirm("Delete shot?")) remove(s.id); }}>Del</button>
              </td>
            </tr>))}</tbody>
        </table></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">{list.map((s) => (
          <div key={s.id} className="card p-4">
            <div className="flex gap-2 items-start"><strong>S{s.scene_number} · Shot {s.shot_number} — {s.title}</strong><span className="ml-auto flex gap-1"><StatusBadge value={s.status} /><PriorityBadge value={s.priority} /></span></div>
            <p className="text-sm text-zinc-300 mt-1">{s.description}</p>
            <p className="text-xs text-zinc-400 mt-1">{s.scene_heading} · {s.location} · {s.shot_type} · {s.camera_movement} · {s.camera_angle}</p>
            <div className="mt-2 flex gap-2 no-print">
              <select className="input !w-auto !py-1 !text-xs" value={s.status} onChange={(e) => save({ ...s, status: e.target.value as Shot["status"] })}>{SHOT_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}</select>
              <button className="btn-secondary !py-1 !text-xs" onClick={() => { setEditing(s); setShowForm(true); }}>Edit</button>
              <button className="text-xs text-rose-300 underline ml-auto" onClick={() => { if (confirm("Delete?")) remove(s.id); }}>Delete</button>
            </div>
          </div>))}</div>
      )}

      {showForm && editing && (
        <ShotForm shot={editing} onClose={() => setShowForm(false)} onSave={(v) => { save(v); setShowForm(false); refresh(); }} />
      )}
    </div>
  );
}

function ShotForm({ shot, onSave, onClose }: { shot: Shot; onSave: (s: Shot) => void; onClose: () => void }) {
  const [f, setF] = useState<Shot>(shot);
  const set = (k: keyof Shot, v: unknown) => setF({ ...f, [k]: v } as Shot);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 no-print" onClick={onClose}>
      <form className="card p-5 w-full max-w-2xl max-h-[90vh] overflow-auto grid md:grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); if (!f.title.trim()) return alert("Title required"); onSave(f); }}>
        <h2 className="md:col-span-2 font-bold">{shot.title ? "Edit shot" : "New shot"}</h2>
        {[["shot_number","Shot #","number"],["scene_number","Scene #","number"]].map(([k, l, t]) => (
          <div key={k}><p className="label">{l}</p><input type={t as string} className="input mt-1" value={String(f[k as keyof Shot] ?? "")} onChange={(e) => set(k as keyof Shot, Number(e.target.value))} /></div>
        ))}
        <div><p className="label">Title *</p><input className="input mt-1" value={f.title} onChange={(e) => set("title", e.target.value)} /></div>
        <div><p className="label">Scene heading</p><input className="input mt-1" value={f.scene_heading} onChange={(e) => set("scene_heading", e.target.value)} placeholder="INT. CAFE - DAY" /></div>
        <div className="md:col-span-2"><p className="label">Description</p><textarea className="input mt-1" rows={2} value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
        <div><p className="label">Location</p><input className="input mt-1" value={f.location} onChange={(e) => set("location", e.target.value)} /></div>
        <div><p className="label">Shooting date</p><input type="date" className="input mt-1" value={f.shooting_date ?? ""} onChange={(e) => set("shooting_date", e.target.value || null)} /></div>
        <div><p className="label">Shot type</p><select className="input mt-1" value={f.shot_type} onChange={(e) => set("shot_type", e.target.value)}>{SHOT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><p className="label">Movement</p><select className="input mt-1" value={f.camera_movement} onChange={(e) => set("camera_movement", e.target.value)}>{CAMERA_MOVEMENTS.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><p className="label">Angle</p><select className="input mt-1" value={f.camera_angle} onChange={(e) => set("camera_angle", e.target.value)}>{CAMERA_ANGLES.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><p className="label">Lens</p><input className="input mt-1" value={f.focal_length} onChange={(e) => set("focal_length", e.target.value)} placeholder="35mm" /></div>
        <div><p className="label">Status</p><select className="input mt-1" value={f.status} onChange={(e) => set("status", e.target.value)}>{SHOT_STATUSES.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><p className="label">Priority</p><select className="input mt-1" value={f.priority} onChange={(e) => set("priority", e.target.value)}>{PRIORITIES.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><p className="label">Equipment (comma separated)</p><input className="input mt-1" value={f.equipment.join(", ")} onChange={(e) => set("equipment", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} /></div>
        <div><p className="label">Actors (comma separated)</p><input className="input mt-1" value={f.actors.join(", ")} onChange={(e) => set("actors", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} /></div>
        <div><p className="label">Lighting</p><input className="input mt-1" value={f.lighting_notes} onChange={(e) => set("lighting_notes", e.target.value)} /></div>
        <div><p className="label">Audio</p><input className="input mt-1" value={f.audio_notes} onChange={(e) => set("audio_notes", e.target.value)} /></div>
        <div className="md:col-span-2"><p className="label">Notes</p><textarea className="input mt-1" rows={2} value={f.additional_notes} onChange={(e) => set("additional_notes", e.target.value)} /></div>
        <div className="md:col-span-2 flex gap-2"><button className="btn-primary">Save shot</button><button type="button" className="btn-secondary" onClick={onClose}>Cancel</button></div>
      </form>
    </div>
  );
}

export default function ShotsPage() {
  return <Suspense fallback={<div className="card p-8">Loading…</div>}><ShotsInner /></Suspense>;
}
