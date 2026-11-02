export type ArtStyleId = 
  | '3d_cinematic'
  | '2d_anime'
  | 'cyberpunk'
  | 'stop_motion'
  | 'photorealistic'
  | 'pixel_art';

export interface ArtStyle {
  id: ArtStyleId;
  name: string;
  tagline: string;
  description: string;
  promptModifier: string;
  badgeColor: string;
  thumbnailUrl: string;
  sampleVideoUrl?: string;
}

export type OutputType = 'image' | 'video' | 'animation_preview';

export type AspectRatio = '16:9' | '9:16' | '1:1';

export type JobStatus = 'ready' | 'queued' | 'processing' | 'completed' | 'failed';

export interface GenerationSettings {
  outputType: OutputType;
  aspectRatio: AspectRatio;
  durationSeconds: number;
  motionIntensity: 'low' | 'medium' | 'high' | 'ultra';
  fps: number;
  negativePrompt: string;
  seed?: number;
  quality: 'standard' | 'hd' | 'cinema';
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  tier: 'free' | 'pro' | 'studio';
  generationsCount: number;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  enhancedPrompt?: string;
  negativePrompt?: string;
  styleId: ArtStyleId;
  outputType: OutputType;
  aspectRatio: AspectRatio;
  status: JobStatus;
  mediaUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  voicePersona?: string;
  scriptText?: string;
  audioUrl?: string;
  createdAt: string;
  updatedAt: string;
  isDraft: boolean;
  metadata?: {
    model?: string;
    seed?: number;
    motionIntensity?: string;
    resolution?: string;
  };
}

export interface HistoryItem {
  id: string;
  userId: string;
  projectId?: string;
  type: OutputType | 'voiceover';
  prompt: string;
  enhancedPrompt?: string;
  styleId?: ArtStyleId;
  voicePersona?: string;
  status: JobStatus;
  mediaUrl?: string;
  createdAt: string;
  model: string;
  settingsSummary: string;
}

export type VoicePersonaId = 'Zephyr' | 'Puck' | 'Kore';

export interface VoicePersona {
  id: VoicePersonaId;
  name: string;
  tagline: string;
  description: string;
  gender: string;
  tone: string;
  sampleText: string;
  color: string;
}
