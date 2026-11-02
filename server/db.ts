import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Project, HistoryItem, User } from '../src/types';

export interface DbUser extends User {
  passwordHash: string;
  salt: string;
}

interface DatabaseSchema {
  users: DbUser[];
  projects: Project[];
  history: HistoryItem[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, generatedSalt, 64).toString('hex');
  return { hash, salt: generatedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(checkHash, 'hex'));
}

function initializeDefaultData(): DatabaseSchema {
  const demoSalt = crypto.randomBytes(16).toString('hex');
  const demoHash = crypto.scryptSync('animai123', demoSalt, 64).toString('hex');

  const defaultUser: DbUser = {
    id: 'user_default_01',
    email: 'pavangarke7869@gmail.com',
    name: 'Pavan Garke',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date().toISOString(),
    tier: 'pro',
    generationsCount: 14,
    passwordHash: demoHash,
    salt: demoSalt,
  };

  const sampleProjects: Project[] = [
    {
      id: 'proj_01',
      userId: defaultUser.id,
      title: 'Enchanted Twilight Sanctum',
      prompt: 'A beautiful fantasy forest at twilight with glowing river and butterflies',
      enhancedPrompt: 'A breathtaking fantasy forest canopy at deep twilight, glowing turquoise river flowing between luminescent moss-covered rocks, swarms of iridescent magical butterflies floating gracefully, cinematic anamorphic camera pan, volumetric fog, octane render 8k.',
      styleId: '3d_cinematic',
      outputType: 'video',
      aspectRatio: '16:9',
      status: 'completed',
      mediaUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      duration: 8,
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      isDraft: false,
      metadata: {
        model: 'gemini-3.8-flash',
        motionIntensity: 'high',
        resolution: '1920x1080',
      },
    },
    {
      id: 'proj_02',
      userId: defaultUser.id,
      title: 'Neo-Tokyo Dystopian Rain',
      prompt: 'Cyberpunk rainy rooftop with flying aerocars and neon reflections',
      enhancedPrompt: 'A futuristic cyberpunk courier perched on a rainy high-rise terrace in Neo-Tokyo, holographic visor displaying glowing flight corridors, reflections of purple and electric cyan neon in puddles, cinematic slow-motion drizzle, raytraced wet asphalt.',
      styleId: 'cyberpunk',
      outputType: 'image',
      aspectRatio: '16:9',
      status: 'completed',
      mediaUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      isDraft: false,
      metadata: {
        model: 'gemini-3.8-flash',
        motionIntensity: 'medium',
        resolution: '1920x1080',
      },
    },
    {
      id: 'proj_03',
      userId: defaultUser.id,
      title: 'Celestial Odyssey Prologue',
      prompt: 'Cinematic voiceover narration for sci-fi space expedition',
      styleId: '3d_cinematic',
      outputType: 'video',
      aspectRatio: '16:9',
      status: 'completed',
      voicePersona: 'Zephyr',
      scriptText: 'Across the dead silence of the Orion rift, the navigational beacon flashed three distinct pulses. We were no longer alone.',
      mediaUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
      duration: 12,
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      isDraft: false,
      metadata: {
        model: 'gemini-3.8-flash-lite-tts',
      },
    },
    {
      id: 'proj_04',
      userId: defaultUser.id,
      title: 'Ghibli Meadow Shrine WIP',
      prompt: 'Floating sky island with pink petals swirling in sunny wind',
      styleId: '2d_anime',
      outputType: 'animation_preview',
      aspectRatio: '1:1',
      status: 'ready',
      thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      isDraft: true,
    },
  ];

  const sampleHistory: HistoryItem[] = [
    {
      id: 'hist_01',
      userId: defaultUser.id,
      projectId: 'proj_01',
      type: 'video',
      prompt: 'A beautiful fantasy forest at twilight with glowing river and butterflies',
      enhancedPrompt: 'A breathtaking fantasy forest canopy at deep twilight, glowing turquoise river flowing between luminescent moss-covered rocks, swarms of iridescent magical butterflies floating gracefully, cinematic anamorphic camera pan, volumetric fog, octane render 8k.',
      styleId: '3d_cinematic',
      status: 'completed',
      mediaUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      model: 'gemini-3.8-flash',
      settingsSummary: '16:9 | 3D Cinematic | 8s | Ultra Motion',
    },
    {
      id: 'hist_02',
      userId: defaultUser.id,
      projectId: 'proj_02',
      type: 'image',
      prompt: 'Cyberpunk rainy rooftop with flying aerocars and neon reflections',
      styleId: 'cyberpunk',
      status: 'completed',
      mediaUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      model: 'gemini-3.8-flash',
      settingsSummary: '16:9 | Cyberpunk | High Quality',
    },
    {
      id: 'hist_03',
      userId: defaultUser.id,
      projectId: 'proj_03',
      type: 'voiceover',
      prompt: 'Across the dead silence of the Orion rift, the navigational beacon flashed three distinct pulses. We were no longer alone.',
      voicePersona: 'Zephyr',
      status: 'completed',
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      model: 'gemini-3.8-flash-lite-tts',
      settingsSummary: 'Zephyr Voice | Cinematic & Expressive | English US',
    },
  ];

  return {
    users: [defaultUser],
    projects: sampleProjects,
    history: sampleHistory,
  };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = initializeDefaultData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data) as DatabaseSchema;
  } catch (err) {
    console.error('Error reading db.json, reinitializing default:', err);
    const initial = initializeDefaultData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

function saveDatabase(db: DatabaseSchema): void {
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to save database:', err);
  }
}

// User operations
export function getUserByEmail(email: string): DbUser | undefined {
  const db = loadDatabase();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): DbUser | undefined {
  const db = loadDatabase();
  return db.users.find((u) => u.id === id);
}

export function createUser(userData: {
  name: string;
  email: string;
  password: string;
}): User {
  const db = loadDatabase();
  const existing = db.users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existing) {
    throw new Error('A user with this email address already exists.');
  }

  const { hash, salt } = hashPassword(userData.password);
  const newUser: DbUser = {
    id: `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    email: userData.email.toLowerCase(),
    name: userData.name,
    avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(userData.name)}`,
    createdAt: new Date().toISOString(),
    tier: 'free',
    generationsCount: 0,
    passwordHash: hash,
    salt,
  };

  db.users.push(newUser);
  saveDatabase(db);

  const { passwordHash, salt: _, ...safeUser } = newUser;
  return safeUser;
}

export function updateUser(userId: string, updates: Partial<User>): User {
  const db = loadDatabase();
  const index = db.users.findIndex((u) => u.id === userId);
  if (index === -1) throw new Error('User not found.');

  db.users[index] = { ...db.users[index], ...updates };
  saveDatabase(db);

  const { passwordHash, salt, ...safeUser } = db.users[index];
  return safeUser;
}

// Projects operations
export function getProjects(userId: string): Project[] {
  const db = loadDatabase();
  return db.projects
    .filter((p) => p.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getProjectById(userId: string, projectId: string): Project | undefined {
  const db = loadDatabase();
  return db.projects.find((p) => p.id === projectId && p.userId === userId);
}

export function createProject(userId: string, projectData: Partial<Project>): Project {
  const db = loadDatabase();
  const newProject: Project = {
    id: `proj_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    userId,
    title: projectData.title || 'Untitled Creation',
    prompt: projectData.prompt || '',
    enhancedPrompt: projectData.enhancedPrompt,
    negativePrompt: projectData.negativePrompt,
    styleId: projectData.styleId || '3d_cinematic',
    outputType: projectData.outputType || 'video',
    aspectRatio: projectData.aspectRatio || '16:9',
    status: projectData.status || 'ready',
    mediaUrl: projectData.mediaUrl,
    thumbnailUrl: projectData.thumbnailUrl,
    duration: projectData.duration || 6,
    voicePersona: projectData.voicePersona,
    scriptText: projectData.scriptText,
    audioUrl: projectData.audioUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDraft: projectData.isDraft ?? false,
    metadata: projectData.metadata,
  };

  db.projects.unshift(newProject);

  // Increment user generationsCount if generating
  if (newProject.status === 'completed') {
    const userIndex = db.users.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      db.users[userIndex].generationsCount = (db.users[userIndex].generationsCount || 0) + 1;
    }
  }

  saveDatabase(db);
  return newProject;
}

export function updateProject(userId: string, projectId: string, updates: Partial<Project>): Project {
  const db = loadDatabase();
  const index = db.projects.findIndex((p) => p.id === projectId && p.userId === userId);
  if (index === -1) throw new Error('Project not found or unauthorized.');

  db.projects[index] = {
    ...db.projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveDatabase(db);
  return db.projects[index];
}

export function deleteProject(userId: string, projectId: string): boolean {
  const db = loadDatabase();
  const initialLen = db.projects.length;
  db.projects = db.projects.filter((p) => !(p.id === projectId && p.userId === userId));
  if (db.projects.length !== initialLen) {
    saveDatabase(db);
    return true;
  }
  return false;
}

export function duplicateProject(userId: string, projectId: string): Project {
  const project = getProjectById(userId, projectId);
  if (!project) throw new Error('Project not found or unauthorized.');

  return createProject(userId, {
    ...project,
    title: `${project.title} (Copy)`,
    isDraft: true,
  });
}

// History operations
export function getHistory(userId: string): HistoryItem[] {
  const db = loadDatabase();
  return db.history
    .filter((h) => h.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addHistory(userId: string, item: Omit<HistoryItem, 'id' | 'userId' | 'createdAt'>): HistoryItem {
  const db = loadDatabase();
  const newItem: HistoryItem = {
    ...item,
    id: `hist_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    userId,
    createdAt: new Date().toISOString(),
  };

  db.history.unshift(newItem);
  // Keep max 100 history items per user
  db.history = db.history.slice(0, 100);
  saveDatabase(db);
  return newItem;
}

export function deleteHistoryItem(userId: string, historyId: string): boolean {
  const db = loadDatabase();
  const initialLen = db.history.length;
  db.history = db.history.filter((h) => !(h.id === historyId && h.userId === userId));
  if (db.history.length !== initialLen) {
    saveDatabase(db);
    return true;
  }
  return false;
}

export function clearUserHistory(userId: string): void {
  const db = loadDatabase();
  db.history = db.history.filter((h) => h.userId !== userId);
  saveDatabase(db);
}
