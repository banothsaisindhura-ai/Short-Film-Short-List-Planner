"use client";
import { useCallback, useEffect, useState } from "react";
import type { Project, Shot } from "@/types/film";
import { demoStore } from "@/lib/demo";
import { uid, nowIso } from "@/lib/utils";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const refresh = useCallback(() => setProjects([...demoStore.listProjects()]), []);
  useEffect(() => { refresh(); }, [refresh]);
  return { projects, refresh,
    save: (p: Project) => { demoStore.saveProject({ ...p, updated_at: nowIso() }); refresh(); },
    remove: (id: string) => { demoStore.deleteProject(id); refresh(); },
    create: (partial: Partial<Project>) => {
      const p: Project = { id: uid(), user_id: "demo-user", title: "Untitled Film", synopsis: "", genre: "Drama", target_runtime: "5-10 min", director_name: "", status: "development", planned_start_date: null, created_at: nowIso(), updated_at: nowIso(), ...partial } as Project;
      demoStore.saveProject(p); refresh(); return p;
    },
  };
}
export function useShots(projectId?: string) {
  const [shots, setShots] = useState<Shot[]>([]);
  const refresh = useCallback(() => setShots([...demoStore.listShots(projectId)]), [projectId]);
  useEffect(() => { refresh(); const h = () => refresh(); window.addEventListener("storage", h); return () => window.removeEventListener("storage", h); }, [refresh]);
  return { shots, refresh,
    save: (s: Shot) => { demoStore.saveShot({ ...s, updated_at: nowIso() }); refresh(); },
    saveMany: (list: Shot[]) => { demoStore.saveManyShots(list.map((s) => ({ ...s, updated_at: nowIso() }))); refresh(); },
    remove: (id: string) => { demoStore.deleteShot(id); refresh(); },
  };
}
