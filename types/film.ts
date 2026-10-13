export type ProjectStatus = "development" | "pre_production" | "shooting" | "post_production" | "completed";
export type ShotStatus = "planned" | "ready" | "in_progress" | "completed" | "reshoot";
export type ShotPriority = "low" | "medium" | "high";

export interface Project {
  id: string;
  user_id: string;
  title: string;
  synopsis: string;
  genre: string;
  target_runtime: string;
  director_name: string;
  status: ProjectStatus;
  planned_start_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Scene {
  id: string;
  project_id: string;
  scene_number: number;
  heading: string;
  description: string;
  location: string;
  estimated_duration: string;
  created_at: string;
  updated_at: string;
}

export interface Shot {
  id: string;
  project_id: string;
  scene_id: string | null;
  shot_number: number;
  scene_number: number;
  scene_heading: string;
  title: string;
  description: string;
  location: string;
  shot_type: string;
  camera_movement: string;
  camera_angle: string;
  focal_length: string;
  estimated_duration: string;
  equipment: string[];
  actors: string[];
  lighting_notes: string;
  audio_notes: string;
  shooting_date: string | null;
  priority: ShotPriority;
  status: ShotStatus;
  sort_order: number;
  additional_notes: string;
  created_at: string;
  updated_at: string;
}

export interface ShootingDay {
  id: string;
  project_id: string;
  shooting_date: string;
  location: string;
  call_time: string;
  wrap_time: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const SHOT_TYPES = ["Extreme Wide Shot","Wide Shot","Full Shot","Medium Wide","Medium Shot","Medium Close-Up","Close-Up","Extreme Close-Up","Over-the-Shoulder","POV","Aerial / Drone","Insert"] as const;
export const CAMERA_MOVEMENTS = ["Static / Tripod","Pan","Tilt","Dolly","Tracking","Handheld","Gimbal / Steadicam","Crane / Jib","Zoom","Whip Pan","Drone Move"] as const;
export const CAMERA_ANGLES = ["Eye Level","Low Angle","High Angle","Bird's Eye","Worm's Eye","Dutch / Canted","Overhead","Shoulder Level"] as const;
export const SHOT_STATUSES: ShotStatus[] = ["planned","ready","in_progress","completed","reshoot"];
export const PRIORITIES: ShotPriority[] = ["low","medium","high"];
export const GENRES = ["Drama","Comedy","Horror","Thriller","Sci-Fi","Documentary","Romance","Action","Experimental","Animation","Crime","Fantasy"];
