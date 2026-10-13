"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { demoUser } from "@/lib/demo";

export default function LoginPage() {
  const r = useRouter();
  const [name, setName] = useState("Demo Filmmaker");
  const [err, setErr] = useState("");
  function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    try {
      if (!name.trim()) throw new Error("Name required");
      demoUser();
      localStorage.setItem("sfp_demo_user_v1", JSON.stringify({ id: "local-user", email: `${name.toLowerCase().replace(/\W+/g, ".")}@local`, name }));
      r.push("/dashboard");
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Login failed"); }
  }
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} className="card p-6 w-full max-w-sm space-y-3">
        <h1 className="text-xl font-bold">Welcome back</h1>
        <p className="text-xs text-zinc-400">Local mode — your data stays in this browser (localStorage). No account or server needed.</p>
        <div><p className="label">Display name</p><input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} required /></div>
        {err && <p className="text-sm text-rose-300">{err}</p>}
        <button className="btn-primary w-full justify-center">Enter workspace</button>
        <p className="text-xs text-zinc-400">First visit? <Link href="/signup" className="text-electric-400 underline">Sign up</Link> · <Link href="/dashboard" className="underline">Skip to demo dashboard</Link></p>
      </form>
    </div>
  );
}
