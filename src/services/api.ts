import { Project, HistoryItem, User, OutputType, ArtStyleId, AspectRatio } from '../types';

const TOKEN_KEY = 'animai_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

// ----------------------------------------------------
// Auth API
// ----------------------------------------------------
export async function apiRegister(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function apiLogin(email: string, password: string): Promise<{ user: User; token: string }> {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiGetMe(): Promise<{ user: User }> {
  return request('/api/auth/me');
}

export async function apiLogout(): Promise<void> {
  try {
    await request('/api/auth/logout', { method: 'POST' });
  } finally {
    setStoredToken(null);
  }
}

// ----------------------------------------------------
// AI Creative API
// ----------------------------------------------------
export async function apiGetAIStatus(): Promise<{
  configured: boolean;
  models: { enhancement: string; tts: string; image: string; video: string };
  message: string;
}> {
  return request('/api/ai/status');
}

export async function apiEnhancePrompt(
  prompt: string,
  styleId: ArtStyleId,
  outputType: OutputType
): Promise<{ enhancedPrompt: string; styleNotes: string; model: string }> {
  return request('/api/ai/enhance', {
    method: 'POST',
    body: JSON.stringify({ prompt, styleId, outputType }),
  });
}

export async function apiGetIdea(styleId?: ArtStyleId): Promise<{
  title: string;
  prompt: string;
  styleId: ArtStyleId;
  model: string;
}> {
  return request('/api/ai/ideas', {
    method: 'POST',
    body: JSON.stringify({ styleId }),
  });
}

export async function apiGenerateTTS(
  text: string,
  voicePersona: 'Zephyr' | 'Puck' | 'Kore'
): Promise<{
  audioBase64: string;
  mimeType: string;
  isDemo: boolean;
  durationEstimate: number;
}> {
  return request('/api/ai/tts', {
    method: 'POST',
    body: JSON.stringify({ text, voicePersona }),
  });
}

export async function apiGenerateMedia(params: {
  prompt: string;
  enhancedPrompt?: string;
  styleId: ArtStyleId;
  outputType: OutputType;
  aspectRatio: AspectRatio;
  motionIntensity?: string;
  duration?: number;
  projectId?: string;
}): Promise<{
  status: string;
  outputType: OutputType;
  mediaUrl: string;
  thumbnailUrl: string;
  promptVisualUrl?: string;
  isLiveAI: boolean;
  model: string;
  duration: number;
  historyItem?: HistoryItem;
}> {
  return request('/api/ai/generate-media', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// ----------------------------------------------------
// Projects API
// ----------------------------------------------------
export async function apiGetProjects(): Promise<{ projects: Project[] }> {
  return request('/api/projects');
}

export async function apiGetProject(id: string): Promise<{ project: Project }> {
  return request(`/api/projects/${id}`);
}

export async function apiCreateProject(projectData: Partial<Project>): Promise<{ project: Project }> {
  return request('/api/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
}

export async function apiUpdateProject(id: string, updates: Partial<Project>): Promise<{ project: Project }> {
  return request(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function apiDeleteProject(id: string): Promise<{ success: boolean }> {
  return request(`/api/projects/${id}`, {
    method: 'DELETE',
  });
}

export async function apiDuplicateProject(id: string): Promise<{ project: Project }> {
  return request(`/api/projects/${id}/duplicate`, {
    method: 'POST',
  });
}

// ----------------------------------------------------
// History API
// ----------------------------------------------------
export async function apiGetHistory(): Promise<{ history: HistoryItem[] }> {
  return request('/api/history');
}

export async function apiDeleteHistoryItem(id: string): Promise<{ success: boolean }> {
  return request(`/api/history/${id}`, {
    method: 'DELETE',
  });
}

export async function apiClearHistory(): Promise<{ success: boolean }> {
  return request('/api/history', {
    method: 'DELETE',
  });
}

// ----------------------------------------------------
// User Stats & Profile
// ----------------------------------------------------
export async function apiGetUserStats(): Promise<{
  totalProjects: number;
  completedGenerations: number;
  videoCount: number;
  imageCount: number;
  voiceCount: number;
  tier: string;
  storageUsedMb: string;
}> {
  return request('/api/user/stats');
}

export async function apiUpdateProfile(data: { name?: string; avatarUrl?: string }): Promise<{ user: User }> {
  return request('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
