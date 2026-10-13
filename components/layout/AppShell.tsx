"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, LayoutDashboard, FolderKanban, ListVideo, CalendarDays, Sparkles, Settings, Film } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/shots", label: "Shot List", icon: ListVideo },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/assistant", label: "AI Assistant", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname === "/" || pathname === "/login" || pathname === "/signup";
  if (isAuth) return <main className="min-h-screen">{children}</main>;
  return (
    <div className="min-h-screen flex">
      <aside className="no-print hidden md:flex w-60 shrink-0 flex-col gap-1 border-r border-white/10 bg-charcoal-900/80 p-4">
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-3">
          <span className="grid place-items-center size-9 rounded-xl bg-electric-600"><Clapperboard className="size-5" /></span>
          <span className="font-semibold leading-tight">Shot List<br /><span className="text-xs font-normal text-zinc-400">Short Film Planner</span></span>
        </Link>
        {NAV.map((n) => {
          const active = pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href));
          return (
            <Link key={n.href} href={n.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm", active ? "bg-electric-600/20 text-white border border-electric-600/40" : "text-zinc-300 hover:bg-white/5")}>
              <n.icon className="size-4" />{n.label}
            </Link>
          );
        })}
        <div className="mt-auto card p-3 text-xs text-zinc-400">
          <p className="flex items-center gap-1 text-amberglow-400 font-medium"><Film className="size-3" /> Demo mode ready</p>
          <p className="mt-1">Add a Gemini key in .env.local for AI features.</p>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="no-print sticky top-0 z-20 border-b border-white/10 bg-charcoal-950/90 backdrop-blur px-4 py-3 flex items-center gap-3 md:hidden">
          <Clapperboard className="size-5 text-electric-400" />
          <strong className="text-sm">Shot List Planner</strong>
          <nav className="ml-auto flex gap-1 text-xs overflow-x-auto">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={cn("px-2 py-1 rounded-lg whitespace-nowrap", pathname.startsWith(n.href) ? "bg-electric-600 text-white" : "bg-white/10")}>{n.label}</Link>
            ))}
          </nav>
        </header>
        <main className="p-4 md:p-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
