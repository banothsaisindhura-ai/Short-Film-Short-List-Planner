import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(2, "Title required").max(120),
  synopsis: z.string().max(2000).default(""),
  genre: z.string().min(1, "Genre required"),
  target_runtime: z.string().default("5-10 min"),
  director_name: z.string().max(120).default(""),
  status: z.enum(["development","pre_production","shooting","post_production","completed"]).default("development"),
  planned_start_date: z.string().optional().nullable(),
});

export const shotSchema = z.object({
  shot_number: z.coerce.number().int().min(1),
  scene_number: z.coerce.number().int().min(1),
  scene_heading: z.string().max(200).default(""),
  title: z.string().min(2).max(160),
  description: z.string().max(2000).default(""),
  location: z.string().max(200).default(""),
  shot_type: z.string().default("Wide Shot"),
  camera_movement: z.string().default("Static / Tripod"),
  camera_angle: z.string().default("Eye Level"),
  focal_length: z.string().max(60).default(""),
  estimated_duration: z.string().max(40).default(""),
  equipment: z.array(z.string()).default([]),
  actors: z.array(z.string()).default([]),
  lighting_notes: z.string().max(1000).default(""),
  audio_notes: z.string().max(1000).default(""),
  shooting_date: z.string().optional().nullable(),
  priority: z.enum(["low","medium","high"]).default("medium"),
  status: z.enum(["planned","ready","in_progress","completed","reshoot"]).default("planned"),
  additional_notes: z.string().max(2000).default(""),
});

export const generatorInputSchema = z.object({
  film_title: z.string().min(2).max(140),
  synopsis: z.string().min(10).max(3000),
  genre: z.string().min(1),
  target_runtime: z.string().default("5-10 min"),
  num_scenes: z.coerce.number().int().min(1).max(20).default(3),
  locations: z.string().max(1000).default(""),
  actors: z.string().max(1000).default(""),
  equipment: z.string().max(1000).default(""),
  visual_style: z.string().max(1000).default(""),
  budget: z.enum(["micro","low","medium"]).default("micro"),
  special_requirements: z.string().max(2000).default(""),
});

export const generatedShotSchema = shotSchema.extend({
  continuity_notes: z.string().optional().default(""),
  low_budget_alternative: z.string().optional().default(""),
});

export const generatedPlanSchema = z.object({
  scenes: z.array(z.object({
    scene_number: z.number(),
    heading: z.string(),
    description: z.string().optional().default(""),
    location: z.string().optional().default(""),
    shots: z.array(generatedShotSchema),
  })),
  shooting_order_notes: z.string().optional().default(""),
  continuity_notes: z.string().optional().default(""),
});

export type GeneratorInput = z.infer<typeof generatorInputSchema>;
