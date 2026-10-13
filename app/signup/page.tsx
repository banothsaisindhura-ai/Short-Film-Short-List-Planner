"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const r = useRouter();
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    try {
      if (name.trim().length < 2) throw new Error("Name must be 2+ characters");
      localStorage.setItem("sfp_demo_user_v1", JSON.stringify({ id: "local-user", email: `${name.toLowerCase().replace(/\W+/g, ".")}@local`, name }));
      r.push("/dashboard");
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Signup failed"); }
  }
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} className="card p-6 w-full max-w-sm space-y-3">
        <h1 className="text-xl font-bold">Create your workspace</h1>
        <p className="text-xs text-zinc-400">Everything is stored locally in your browser. No passwords, no servers.</p>
        <div><p className="label">Display name</p><input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} required /></div>
        {err && <p className="text-sm text-rose-300">{err}</p>}
        <button className="btn-primary w-full justify-center">Create workspace</button>
        <p className="text-xs text-zinc-400"><Link href="/login" className="underline">Back to login</Link></p>
      </form>
    </div>
  );
}
