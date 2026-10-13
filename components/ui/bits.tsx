import { cn } from "@/lib/utils";
import type { ShotStatus, ShotPriority, ProjectStatus } from "@/types/film";

const statusStyle: Record<string, string> = {
  planned: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  ready: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  in_progress: "bg-amberglow-400/15 text-amberglow-400 border-amberglow-400/30",
  completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  reshoot: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  development: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  pre_production: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  shooting: "bg-amberglow-400/15 text-amberglow-400 border-amberglow-400/30",
  post_production: "bg-electric-500/15 text-electric-400 border-electric-500/30",
};
export function StatusBadge({ value }: { value: ShotStatus | ProjectStatus | string }) {
  return <span className={cn("badge", statusStyle[value] ?? "bg-white/10 text-zinc-300 border-white/10")}>{String(value).replace(/_/g, " ")}</span>;
}
export function PriorityBadge({ value }: { value: ShotPriority | string }) {
  const m: Record<string, string> = {
    low: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
    medium: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    high: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  };
  return <span className={cn("badge", m[value] ?? "")}>{value}</span>;
}
export function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-electric-600 to-amberglow-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
export function Empty({ title, hint }: { title: string; hint?: string }) {
  return <div className="card p-8 text-center text-zinc-400"><p className="font-medium text-zinc-200">{title}</p>{hint && <p className="text-sm mt-1">{hint}</p>}</div>;
}
