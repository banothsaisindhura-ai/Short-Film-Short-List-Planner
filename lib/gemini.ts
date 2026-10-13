import type { GeneratorInput } from "@/lib/validation";

export function geminiPrompt(input: GeneratorInput) {
  return `You are a professional assistant director for micro-budget short films.
Generate a practical shot list as STRICT JSON only (no markdown, no commentary).

Input:
Title: ${input.film_title}
Synopsis: ${input.synopsis}
Genre: ${input.genre}
Target runtime: ${input.target_runtime}
Number of scenes: ${input.num_scenes}
Locations: ${input.locations}
Actors: ${input.actors}
Equipment: ${input.equipment}
Visual style: ${input.visual_style}
Budget: ${input.budget}
Special requirements: ${input.special_requirements}

Return JSON matching this TypeScript shape exactly:
{
  "scenes": [
    {
      "scene_number": number,
      "heading": string (e.g. "INT. CAFE - DAY"),
      "description": string,
      "location": string,
      "shots": [
        {
          "shot_number": number (global sequence 1..N),
          "scene_number": number,
          "scene_heading": string,
          "title": string,
          "description": string,
          "location": string,
          "shot_type": string (one of: Extreme Wide Shot, Wide Shot, Full Shot, Medium Wide, Medium Shot, Medium Close-Up, Close-Up, Extreme Close-Up, Over-the-Shoulder, POV, Aerial / Drone, Insert),
          "camera_movement": string,
          "camera_angle": string,
          "focal_length": string,
          "estimated_duration": string (e.g. "8s"),
          "equipment": string[],
          "actors": string[],
          "lighting_notes": string,
          "audio_notes": string,
          "priority": "low" | "medium" | "high",
          "status": "planned",
          "additional_notes": string,
          "continuity_notes": string,
          "low_budget_alternative": string
        }
      ]
    }
  ],
  "shooting_order_notes": string,
  "continuity_notes": string
}
Rules: ${input.num_scenes} scenes, 3-6 shots per scene, practical for small crew, group by location where possible.`;
}

export async function callGemini(prompt: string, apiKey: string, model = "gemini-2.0-flash") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192, responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Gemini error ${res.status}: ${t.slice(0, 500)}`);
  }
  const json = await res.json();
  const text: string = json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  if (!text) throw new Error("Empty response from Gemini");
  const cleaned = text.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
}

export function demoPlan(title: string) {
  return {
    scenes: [
      {
        scene_number: 1, heading: "INT. APARTMENT - MORNING",
        description: "Hero discovers a mysterious letter.", location: "Apartment",
        shots: [1, 2, 3, 4].map((n) => ({
          shot_number: n, scene_number: 1, scene_heading: "INT. APARTMENT - MORNING",
          title: ["Wake-up wide", "Letter insert", "Reaction close-up", "Window decision"][n - 1],
          description: ["Wide of small apartment at dawn, hero asleep on couch.", "Insert of weathered envelope sliding under door.", "Close-up of hero reading, soft window light.", "Medium shot: hero grabs jacket, resolves to act."][n - 1],
          location: "Apartment", shot_type: ["Wide Shot", "Insert", "Close-Up", "Medium Shot"][n - 1],
          camera_movement: ["Static / Tripod", "Static / Tripod", "Dolly", "Handheld"][n - 1],
          camera_angle: "Eye Level", focal_length: "35mm", estimated_duration: "6s",
          equipment: ["Mirrorless camera", "Tripod", "Reflector"], actors: ["Hero"],
          lighting_notes: "Use window key + bounce; avoid overhead.", audio_notes: "Room tone + lav for dialogue.",
          priority: n === 3 ? "high" : "medium", status: "planned",
          additional_notes: `Demo shot for ${title}`, continuity_notes: "Keep jacket on couch consistent.",
          low_budget_alternative: "Shoot with phone + natural light if needed.",
        })),
      },
      {
        scene_number: 2, heading: "EXT. STREET - DAY",
        description: "Hero chases the messenger.", location: "Quiet Street",
        shots: [5, 6, 7].map((n) => ({
          shot_number: n, scene_number: 2, scene_heading: "EXT. STREET - DAY",
          title: ["Chase wide", "Feet insert", "Catch-up OTS"][n - 5],
          description: ["Wide of hero sprinting down street.", "Insert of feet pounding pavement.", "Over-shoulder as hero catches messenger."][n - 5],
          location: "Quiet Street", shot_type: ["Wide Shot", "Insert", "Over-the-Shoulder"][n - 5],
          camera_movement: ["Gimbal / Steadicam", "Static / Tripod", "Handheld"][n - 5],
          camera_angle: "Eye Level", focal_length: "24mm", estimated_duration: "5s",
          equipment: ["Gimbal", "ND filter"], actors: ["Hero", "Messenger"],
          lighting_notes: "Shoot in open shade; avoid noon sun.", audio_notes: "Wild lines after; prioritize visuals.",
          priority: "medium", status: "planned", additional_notes: "",
          continuity_notes: "Jacket worn, noon shadows short.", low_budget_alternative: "Monopod instead of gimbal.",
        })),
      },
    ],
    shooting_order_notes: "DEMO: shoot all Apartment shots together, then Street, to minimize company moves.",
    continuity_notes: "DEMO data — connect Gemini to generate a real plan.",
  };
}
