"use client";
import { useState } from "react";
import { generatorInputSchema } from "@/lib/validation";
import { demoStore } from "@/lib/demo";
import { uid, nowIso } from "@/lib/utils";
import type { Shot } from "@/types/film";

export function AiGenerator({ projectId, projectTitle, synopsis, genre, onSaved }: { projectId: string; projectTitle: string; synopsis: string; genre: string; onSaved: () => void }) {
  const [form, setForm] = useState({ film_title: projectTitle, synopsis: synopsis || "A young filmmaker has one night to finish a short film.", genre: genre || "Drama", target_runtime: "5-10 min", num_scenes: 3, locations: "Apartment, Street", actors: "Hero, Friend", equipment: "Mirrorless camera, Tripod, LED panel", visual_style: "Naturalistic, handheld", budget: "micro" as const, special_requirements: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<Shot[]>([]);
  const [notes, setNotes] = useState("");
  const [usedDemo, setUsedDemo] = useState(false);

  async function generate() {
    setError(""); setLoading(true);
    try {
      const parsed = generatorInputSchema.parse({ ...form, num_scenes: Number(form.num_scenes) });
      const res = await fetch("/api/ai/generate-shot-list", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Generation failed");
      const shots: Shot[] = [];
      let order = 0;
      for (const sc of j.plan.scenes) {
        for (const s of sc.shots) {
          shots.push({ id: uid(), project_id: projectId, scene_id: null, shot_number: s.shot_number ?? ++order, scene_number: s.scene_number ?? sc.scene_number, scene_heading: s.scene_heading || sc.heading || "", title: s.title || `Shot ${s.shot_number}`, description: s.description || "", location: s.location || sc.location || "", shot_type: s.shot_type || "Wide Shot", camera_movement: s.camera_movement || "Static / Tripod", camera_angle: s.camera_angle || "Eye Level", focal_length: s.focal_length || "", estimated_duration: s.estimated_duration || "", equipment: s.equipment || [], actors: s.actors || [], lighting_notes: s.lighting_notes || "", audio_notes: s.audio_notes || "", shooting_date: null, priority: s.priority || "medium", status: "planned", sort_order: ++order, additional_notes: [s.additional_notes, s.continuity_notes, s.low_budget_alternative].filter(Boolean).join(" | "), created_at: nowIso(), updated_at: nowIso() });
        }
      }
      setPreview(shots);
      setNotes([j.plan.shooting_order_notes, j.plan.continuity_notes].filter(Boolean).join("\n\n"));
      setUsedDemo(Boolean(j.demo));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="card p-4 space-y-3 border-electric-600/40">
      <p className="font-medium">✨ Generate Shot List with Gemini</p>
      <div className="grid md:grid-cols-3 gap-2">
        <div><p className="label">Film title</p><input className="input mt-1" value={form.film_title} onChange={(e) => setForm({ ...form, film_title: e.target.value })} /></div>
        <div><p className="label">Genre</p><input className="input mt-1" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} /></div>
        <div><p className="label">Scenes (1-20)</p><input type="number" min={1} max={20} className="input mt-1" value={form.num_scenes} onChange={(e) => setForm({ ...form, num_scenes: Number(e.target.value) })} /></div>
        <div className="md:col-span-3"><p className="label">Synopsis</p><textarea className="input mt-1" rows={2} value={form.synopsis} onChange={(e) => setForm({ ...form, synopsis: e.target.value })} /></div>
        <div><p className="label">Locations</p><input className="input mt-1" value={form.locations} onChange={(e) => setForm({ ...form, locations: e.target.value })} /></div>
        <div><p className="label">Actors</p><input className="input mt-1" value={form.actors} onChange={(e) => setForm({ ...form, actors: e.target.value })} /></div>
        <div><p className="label">Equipment</p><input className="input mt-1" value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })} /></div>
      </div>
      {error && <p className="text-sm text-rose-300">{error}</p>}
      <div className="flex gap-2">
        <button className="btn-primary text-sm" disabled={loading} onClick={generate}>{loading ? "Generating…" : "Generate Shot List with Gemini"}</button>
        {preview.length > 0 && <button className="btn-secondary text-sm" onClick={generate} disabled={loading}>Regenerate</button>}
      </div>
      {preview.length > 0 && (
        <div className="rounded-xl border border-white/10 p-3 space-y-2">
          <p className="text-sm">{usedDemo ? "⚠️ Demo preview (no GEMINI_API_KEY). " : "Preview — edit before saving. "}Existing shots will NOT be overwritten.</p>
          {notes && <p className="text-xs text-zinc-400 whitespace-pre-wrap">{notes}</p>}
          <div className="max-h-64 overflow-auto space-y-1 text-sm">
            {preview.map((s, i) => (
              <div key={s.id} className="flex gap-2 items-center text-xs">
                <span className="text-zinc-500 w-14 shrink-0">S{s.scene_number}·{s.shot_number}</span>
                <input className="input !py-1" value={s.title} onChange={(e) => setPreview(preview.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
                <button className="text-rose-300" onClick={() => setPreview(preview.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="btn-primary text-sm" onClick={() => { demoStore.saveManyShots(preview); setPreview([]); onSaved(); }}>Approve & save {preview.length} shots</button>
            <button className="btn-secondary text-sm" onClick={() => setPreview([])}>Discard</button>
          </div>
        </div>
      )}
    </div>
  );
}
