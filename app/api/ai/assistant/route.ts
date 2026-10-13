import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const { question, project, shots } = await req.json();
    if (!question || typeof question !== "string" || question.length > 2000)
      return NextResponse.json({ error: "Invalid question" }, { status: 400 });
    const key = process.env.GEMINI_API_KEY;
    const summary = project
      ? `Project: ${project.title} (${project.genre}, ${project.status}). Shots: ${(shots || []).map((s: { scene_number: number; shot_number: number; title: string; status: string; location: string }) => `S${s.scene_number}#${s.shot_number} ${s.title} [${s.status}] @${s.location}`).join("; ").slice(0, 3000)}`
      : "No project context.";
    if (!key) {
      const incomplete = (shots || []).filter((s: { status: string }) => s.status !== "completed").length;
      return NextResponse.json({ answer: `(Demo — add GEMINI_API_KEY for live AI)\n${summary}\n\nGeneral advice for "${question}":\n1. Group shots by location to cut company moves.\n2. Shoot wides first, then coverage, to lock lighting.\n3. You have ${incomplete} incomplete shots — prioritize high-priority + exterior/daylight first.\n4. For low budget: use natural light, practicals, phone/gimbal instead of dolly, wild sound + room tone.`, demo: true });
    }
    const prompt = `You are a helpful short-film production assistant. Use ONLY the saved context below; do not invent completion statuses.\n\n${summary}\n\nQuestion: ${question}\n\nAnswer concisely with actionable steps. Prefix uncertain suggestions as estimates.`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.0-flash"}:generateContent?key=${key}`;
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const j = await res.json();
    const text = j?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") || "No response.";
    return NextResponse.json({ answer: text, demo: false });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Assistant failed" }, { status: 500 });
  }
}
