import { NextResponse } from "next/server";
import { generatorInputSchema, generatedPlanSchema } from "@/lib/validation";
import { geminiPrompt, callGemini, demoPlan } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const input = generatorInputSchema.parse(body);
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return NextResponse.json({ plan: demoPlan(input.film_title), demo: true, message: "GEMINI_API_KEY missing — demo data returned. Add key to .env.local." });
    }
    const raw = await callGemini(geminiPrompt(input), key, process.env.GEMINI_MODEL || "gemini-2.0-flash");
    const plan = generatedPlanSchema.parse(raw);
    return NextResponse.json({ plan, demo: false });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
