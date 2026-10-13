"use client";
import { useState } from "react";
import { useProjects, useShots } from "@/lib/hooks";
import { StatusBadge } from "@/components/ui/bits";
import { toCsv, downloadFile } from "@/lib/utils";

export default function SchedulePage() {
  const { projects } = useProjects();
  const [pid, setPid] = useState("");
  const active = projects.find((p) => p.id === pid) ?? projects[0];
  const { shots, save } = useShots(active?.id);
  const byDate = new Map<string, typeof shots>();
  for (const s of (active ? shots.filter((x) => x.project_id === active.id) : [])) {
    const k = s.shooting_date || "Unscheduled";
    if (!byDate.has(k)) byDate.set(k, []);
    byDate.get(k)!.push(s);
  }
  const dates = Array.from(byDate.keys()).sort();
  // Location-grouping recommendation (estimate)
  const locCount = new Map<string, number>();
  for (const s of shots.filter((x) => x.project_id === active?.id)) locCount.set(s.location || "Unknown", (locCount.get(s.location || "Unknown") ?? 0) + 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div><h1 className="text-2xl font-bold">Shooting Schedule</h1><p className="text-sm text-zinc-400">Grouped by date & location. Recommendations are estimates.</p></div>
        <select className="input !w-auto ml-auto" value={active?.id ?? ""} onChange={(e) => setPid(e.target.value)}>{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select>
      </div>
      {!active ? <div className="card p-8">No projects yet.</div> : (
        <>
          <div className="card p-4 text-sm">
            <p className="font-medium">💡 Scheduling recommendation (estimate, not guaranteed optimal)</p>
            <p className="text-zinc-400 text-xs mt-1">Group these locations on the same day to reduce travel/setup:</p>
            <ul className="text-xs mt-1">{Array.from(locCount.entries()).sort((a, b) => b[1] - a[1]).map(([loc, n]) => <li key={loc}>• <strong>{loc}</strong> — {n} shot{n === 1 ? "" : "s"}</li>)}</ul>
            <div className="mt-2 flex gap-2 no-print">
              <button className="btn-secondary text-xs" onClick={() => {
                // auto-assign: one date per location starting tomorrow
                const locs = Array.from(new Set(shots.filter((s) => s.project_id === active.id && !s.shooting_date).map((s) => s.location || "Set")));
                let d = new Date(); const map = new Map<string, string>();
                locs.forEach((l) => { d = new Date(d.getTime() + 864e5); map.set(l, d.toISOString().slice(0, 10)); });
                shots.filter((s) => s.project_id === active.id && !s.shooting_date).forEach((s) => save({ ...s, shooting_date: map.get(s.location || "Set") ?? null }));
              }}>Auto-assign dates by location</button>
              <button className="btn-secondary text-xs" onClick={() => {
                const rows = shots.filter((s) => s.project_id === active.id).map((s) => ({ date: s.shooting_date ?? "", scene: s.scene_number, shot: s.shot_number, title: s.title, location: s.location, actors: s.actors.join("; "), equipment: s.equipment.join("; "), status: s.status }));
                downloadFile("schedule.csv", toCsv(rows), "text/csv");
              }}>Export schedule CSV</button>
              <button className="btn-secondary text-xs" onClick={() => window.print()}>Print / PDF</button>
            </div>
          </div>
          {dates.map((d) => (
            <div key={d} className="card p-4">
              <p className="font-medium">📅 {d} <span className="text-xs text-zinc-400">({byDate.get(d)!.length} shots · ~{byDate.get(d)!.length * 30} min est.)</span></p>
              <div className="mt-2 space-y-2">{byDate.get(d)!.map((s) => (
                <div key={s.id} className="flex flex-wrap gap-2 items-center text-sm border-b border-white/5 pb-1">
                  <span>S{s.scene_number} · Shot {s.shot_number} — <strong>{s.title}</strong></span>
                  <span className="text-xs text-zinc-400">{s.location} · {(s.actors || []).join(", ")} · {(s.equipment || []).join(", ")}</span>
                  <span className="ml-auto flex gap-2 items-center no-print"><StatusBadge value={s.status} /><input type="date" className="input !w-auto !py-1 !text-xs" value={s.shooting_date ?? ""} onChange={(e) => save({ ...s, shooting_date: e.target.value || null })} /></span>
                </div>))}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
