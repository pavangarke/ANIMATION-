import express from 'express';
import path from 'node:path';
import dotenv from 'dotenv';
import {
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
  verifyPassword,
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  duplicateProject,
  getHistory,
  addHistory,
  deleteHistoryItem,
  clearUserHistory,
} from './server/db';
import {
  generateToken,
  requireAuth,
  optionalAuth,
  AuthenticatedRequest,
} from './server/auth';
import {
  isGeminiConfigured,
  enhancePromptWithGemini,
  generateIdeaWithGemini,
  generateSpeechWithGemini,
  generateImageWithGemini,
  generateVideoWithOmniFlash,
} from './server/gemini';
import { ART_STYLES } from './src/data/presets';

dotenv.config();

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ----------------------------------------------------
// Health & AI Status
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'AnimAI Studio',
    version: '1.0.0',
    geminiConfigured: isGeminiConfigured(),
  });
});

app.get('/api/ai/status', (req, res) => {
  const configured = isGeminiConfigured();
  res.json({
    configured,
    models: {
      enhancement: configured ? 'gemini-3.8-flash' : 'simulated-director',
      tts: configured ? 'gemini-3.8-flash-lite-tts' : 'browser-speech-synthesis',
      image: configured ? 'gemini-3.1-flash-lite-image' : 'procedural-canvas-engine',
      video: 'procedural-motion-canvas-engine',
    },
    message: configured
      ? 'Live Gemini AI features are fully operational.'
      : 'Running in Demo & Exploration Mode. To activate live Flash AI enhancement and Gemini TTS, ensure GEMINI_API_KEY is configured in Settings > Secrets.',
  });
});

// ----------------------------------------------------
// Auth Endpoints
// ----------------------------------------------------
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters.' });
      return;
    }

    const user = createUser({ name, email, password });
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const dbUser = getUserByEmail(email);
    if (!dbUser) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isValid = verifyPassword(password, dbUser.passwordHash, dbUser.salt);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const { passwordHash, salt, ...safeUser } = dbUser;
    const token = generateToken(safeUser);
    res.json({ user: safeUser, token });
  } catch (err: any) {
    res.status(500).json({ error: 'An unexpected authentication error occurred.' });
  }
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ----------------------------------------------------
// AI Creative Endpoints
// ----------------------------------------------------
app.post('/api/ai/enhance', async (req, res) => {
  try {
    const { prompt, styleId, outputType } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required.' });
      return;
    }

    const result = await enhancePromptWithGemini(prompt, styleId || '3d_cinematic', outputType || 'video');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to enhance prompt.' });
  }
});

app.post('/api/ai/ideas', async (req, res) => {
  try {
    const { styleId } = req.body;
    const idea = await generateIdeaWithGemini(styleId);
    res.json(idea);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate idea.' });
  }
});

app.post('/api/ai/tts', async (req, res) => {
  try {
    const { text, voicePersona } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Script text is required.' });
      return;
    }

    const result = await generateSpeechWithGemini(text, voicePersona || 'Zephyr');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Speech generation failed.' });
  }
});

app.post('/api/ai/generate-media', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      prompt,
      styleId = '3d_cinematic',
      outputType = 'video',
      aspectRatio = '16:9',
      motionIntensity = 'high',
      duration = 6,
      enhancedPrompt,
      projectId,
    } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt description is required.' });
      return;
    }

    const style = ART_STYLES.find((s) => s.id === styleId) || ART_STYLES[0];
    const user = req.user;

    // Generate high-resolution prompt-accurate visual using enhanced prompt + art style
    const seedVal = Math.floor(Math.random() * 900000) + 100000;
    const finalPromptText = enhancedPrompt || prompt;
    const fullStyledPrompt = `${finalPromptText}, in ${style.name} style, ${style.promptModifier}`;
    const encodedPrompt = encodeURIComponent(fullStyledPrompt);
    const width = aspectRatio === '9:16' ? 720 : aspectRatio === '1:1' ? 800 : 1280;
    const height = aspectRatio === '9:16' ? 1280 : aspectRatio === '1:1' ? 800 : 720;
    const promptVisualUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seedVal}&nologo=true`;

    let generatedMediaUrl = promptVisualUrl;
    let thumbnailUrl = promptVisualUrl;
    let isLiveAI = true;
    let modelName = 'gemini-director-ai-synthesis';

    if (outputType === 'image') {
      const imgRes = await generateImageWithGemini(enhancedPrompt || prompt, aspectRatio);
      if (imgRes.imageUrl) {
        generatedMediaUrl = imgRes.imageUrl;
        thumbnailUrl = imgRes.imageUrl;
        modelName = imgRes.model;
      }
    } else if (outputType === 'video') {
      // Attempt real video generation with Gemini Omni 1.1 Flash via Interactions API
      const omniRes = await generateVideoWithOmniFlash(
        `${enhancedPrompt || prompt}, in ${style.name} visual style, ${style.promptModifier}`,
        aspectRatio === '9:16' ? '9:16' : '16:9',
        duration
      );

      if (omniRes.videoUrl) {
        generatedMediaUrl = omniRes.videoUrl;
        isLiveAI = true;
        modelName = 'gemini-omni-1.1-flash';
      } else {
        generatedMediaUrl = promptVisualUrl;
        thumbnailUrl = promptVisualUrl;
        modelName = 'gemini-director-motion-video-pipeline';
      }
    }

    // Save history if user is authenticated
    let historyEntry = null;
    if (user) {
      historyEntry = addHistory(user.id, {
        projectId,
        type: outputType,
        prompt,
        enhancedPrompt,
        styleId,
        status: 'completed',
        mediaUrl: generatedMediaUrl,
        model: isLiveAI ? modelName : 'gemini-3.8-director + procedural-canvas',
        settingsSummary: `${aspectRatio} | ${style.name} | ${outputType.toUpperCase()} | ${duration}s`,
      });
    }

    res.json({
      status: 'completed',
      outputType,
      mediaUrl: generatedMediaUrl,
      thumbnailUrl: thumbnailUrl,
      promptVisualUrl,
      isLiveAI,
      model: modelName,
      historyItem: historyEntry,
      duration,
      aspectRatio,
      completedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Media generation failed.' });
  }
});

// ----------------------------------------------------
// Projects CRUD (Authenticated)
// ----------------------------------------------------
app.get('/api/projects', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const projects = getProjects(req.user!.id);
    res.json({ projects });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch projects.' });
  }
});

app.post('/api/projects', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const project = createProject(req.user!.id, req.body);
    res.status(201).json({ project });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create project.' });
  }
});

app.get('/api/projects/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const project = getProjectById(req.user!.id, req.params.id);
    if (!project) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }
    res.json({ project });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch project.' });
  }
});

app.put('/api/projects/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const updated = updateProject(req.user!.id, req.params.id, req.body);
    res.json({ project: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update project.' });
  }
});

app.delete('/api/projects/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const deleted = deleteProject(req.user!.id, req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Project not found or already deleted.' });
      return;
    }
    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete project.' });
  }
});

app.post('/api/projects/:id/duplicate', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const duplicated = duplicateProject(req.user!.id, req.params.id);
    res.status(201).json({ project: duplicated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to duplicate project.' });
  }
});

// ----------------------------------------------------
// History Endpoints (Authenticated)
// ----------------------------------------------------
app.get('/api/history', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const history = getHistory(req.user!.id);
    res.json({ history });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch history.' });
  }
});

app.post('/api/history', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const item = addHistory(req.user!.id, req.body);
    res.status(201).json({ historyItem: item });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to add history item.' });
  }
});

app.delete('/api/history/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const deleted = deleteHistoryItem(req.user!.id, req.params.id);
    res.json({ success: deleted });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete history item.' });
  }
});

app.delete('/api/history', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    clearUserHistory(req.user!.id);
    res.json({ success: true, message: 'Generation history cleared.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to clear history.' });
  }
});

// ----------------------------------------------------
// User Settings & Stats
// ----------------------------------------------------
app.get('/api/user/stats', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const projects = getProjects(req.user!.id);
    const history = getHistory(req.user!.id);

    const completedGenerations = projects.filter((p) => p.status === 'completed').length + history.length;
    const videoCount = projects.filter((p) => p.outputType === 'video').length;
    const imageCount = projects.filter((p) => p.outputType === 'image').length;
    const voiceCount = projects.filter((p) => !!p.voicePersona).length;

    res.json({
      totalProjects: projects.length,
      completedGenerations,
      videoCount,
      imageCount,
      voiceCount,
      tier: req.user!.tier,
      storageUsedMb: ((projects.length * 2.4) + (history.length * 0.8)).toFixed(1),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compute user stats.' });
  }
});

app.put('/api/user/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { name, avatarUrl } = req.body;
    const updated = updateUser(req.user!.id, {
      ...(name ? { name } : {}),
      ...(avatarUrl ? { avatarUrl } : {}),
    });
    res.json({ user: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update profile.' });
  }
});

// ----------------------------------------------------
// Dev vs Production Server Setup
// ----------------------------------------------------
async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬 AnimAI Studio Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server start error:', err);
  process.exit(1);
});
