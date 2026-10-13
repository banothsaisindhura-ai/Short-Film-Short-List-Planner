"use client";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [name, setName] = useState("Demo Filmmaker");
  const [saved, setSaved] = useState("");
  useEffect(() => {
    try { const u = JSON.parse(localStorage.getItem("sfp_demo_user_v1") || "null"); if (u?.name) setName(u.name); } catch {}
  }, []);
  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="card p-4 space-y-3">
        <p className="font-medium">Profile</p>
        <div><p className="label">Display name</p><input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <button className="btn-primary text-sm" onClick={() => {
          localStorage.setItem("sfp_demo_user_v1", JSON.stringify({ id: "local-user", email: `${name.toLowerCase().replace(/\W+/g, ".")}@local`, name }));
          setSaved("Saved."); setTimeout(() => setSaved(""), 2000);
        }}>Save profile</button>
        {saved && <p className="text-xs text-emerald-300">{saved}</p>}
      </div>
      <div className="card p-4 text-sm space-y-1">
        <p className="font-medium">Configuration</p>
        <p className="text-xs text-zinc-400">Storage: <strong>localStorage (local mode)</strong> — data never leaves this browser.</p>
        <p className="text-xs text-zinc-400">Gemini AI: add <code className="text-amberglow-400">GEMINI_API_KEY</code> to <code>.env.local</code> for live generation; demo output is used until then.</p>
        <button className="btn-secondary text-xs" onClick={() => { localStorage.clear(); location.href = "/"; }}>Clear all local data</button>
      </div>
    </div>
  );
}
