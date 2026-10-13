import type { Project, Shot } from "@/types/film";
import { uid, nowIso } from "@/lib/utils";

const PROJECTS_KEY = "sfp_projects_v1";
const SHOTS_KEY = "sfp_shots_v1";
const USER_KEY = "sfp_demo_user_v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function write(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export function demoUser() {
  let u = read<{ id: string; email: string; name: string } | null>(USER_KEY, null);
  if (!u) {
    u = { id: "demo-user", email: "demo@film.local", name: "Demo Filmmaker" };
    write(USER_KEY, u);
  }
  return u;
}

function seedIfEmpty() {
  const projects = read<Project[]>(PROJECTS_KEY, []);
  const shots = read<Shot[]>(SHOTS_KEY, []);
  if (projects.length > 0) return { projects, shots };
  const p1: Project = {
    id: uid(), user_id: "demo-user", title: "The Last Reel",
    synopsis: "A projectionist discovers one final unplayed reel that changes how she remembers her father.",
    genre: "Drama", target_runtime: "8-12 min", director_name: "Demo Filmmaker",
    status: "pre_production", planned_start_date: new Date(Date.now() + 6 * 864e5).toISOString().slice(0, 10),
    created_at: nowIso(), updated_at: nowIso(),
  };
  const p2: Project = {
    id: uid(), user_id: "demo-user", title: "Night Bus",
    synopsis: "Two strangers share the last bus home and trade confessions they will never repeat.",
    genre: "Thriller", target_runtime: "5-8 min", director_name: "Demo Filmmaker",
    status: "development", planned_start_date: null, created_at: nowIso(), updated_at: nowIso(),
  };
  const mk = (project_id: string, scene_number: number, shot_number: number, partial: Partial<Shot>): Shot => ({
    id: uid(), project_id, scene_id: null, shot_number, scene_number,
    scene_heading: `INT. BUS - NIGHT`, title: `Shot ${shot_number}`, description: "Describe the action here.",
    location: "City Bus Depot", shot_type: "Medium Shot", camera_movement: "Static / Tripod",
    camera_angle: "Eye Level", focal_length: "35mm", estimated_duration: "8s",
    equipment: ["Mirrorless camera", "Tripod"], actors: ["Maya"], lighting_notes: "Practical + small LED",
    audio_notes: "Boom + lav backup", shooting_date: null, priority: "medium",
    status: shot_number <= 2 ? "completed" : "planned", sort_order: shot_number,
    additional_notes: "", created_at: nowIso(), updated_at: nowIso(), ...partial,
  });
  const s: Shot[] = [
    mk(p1.id, 1, 1, { scene_heading: "INT. PROJECTION ROOM - NIGHT", title: "Dust in the beam", description: "Wide of empty projection room, dust floating in projector beam.", location: "Old Cinema", status: "completed", shot_type: "Wide Shot" }),
    mk(p1.id, 1, 2, { scene_heading: "INT. PROJECTION ROOM - NIGHT", title: "The unmarked can", description: "Slow push-in to unmarked film can on shelf.", location: "Old Cinema", status: "ready", shot_type: "Close-Up", camera_movement: "Dolly" }),
    mk(p1.id, 2, 3, { scene_heading: "EXT. ROOFTOP - DAWN", title: "First light", description: "Hero looks over city as sun rises; handheld drift.", location: "Rooftop", status: "planned", shot_type: "Medium Close-Up", camera_movement: "Handheld", priority: "high" }),
    mk(p2.id, 1, 1, { scene_heading: "INT. BUS - NIGHT", title: "Empty seats", description: "Establishing wide of empty night bus.", location: "City Bus Depot", status: "planned" }),
  ];
  write(PROJECTS_KEY, [p1, p2]);
  write(SHOTS_KEY, s);
  return { projects: [p1, p2], shots: s };
}

export const demoStore = {
  seedIfEmpty,
  listProjects(): Project[] { return seedIfEmpty().projects; },
  listShots(projectId?: string): Shot[] {
    const { shots } = seedIfEmpty();
    return projectId ? shots.filter((s) => s.project_id === projectId).sort((a, b) => a.scene_number - b.scene_number || a.shot_number - b.shot_number) : shots;
  },
  saveProject(p: Project) {
    const all = read<Project[]>(PROJECTS_KEY, []);
    const i = all.findIndex((x) => x.id === p.id);
    if (i >= 0) all[i] = p; else all.unshift(p);
    write(PROJECTS_KEY, all);
  },
  deleteProject(id: string) {
    write(PROJECTS_KEY, read<Project[]>(PROJECTS_KEY, []).filter((p) => p.id !== id));
    write(SHOTS_KEY, read<Shot[]>(SHOTS_KEY, []).filter((s) => s.project_id !== id));
  },
  saveShot(s: Shot) {
    const all = read<Shot[]>(SHOTS_KEY, []);
    const i = all.findIndex((x) => x.id === s.id);
    if (i >= 0) all[i] = s; else all.push(s);
    write(SHOTS_KEY, all);
  },
  deleteShot(id: string) {
    write(SHOTS_KEY, read<Shot[]>(SHOTS_KEY, []).filter((s) => s.id !== id));
  },
  saveManyShots(list: Shot[]) {
    const all = read<Shot[]>(SHOTS_KEY, []);
    const map = new Map(all.map((s) => [s.id, s]));
    for (const s of list) map.set(s.id, s);
    write(SHOTS_KEY, Array.from(map.values()));
  },
};
