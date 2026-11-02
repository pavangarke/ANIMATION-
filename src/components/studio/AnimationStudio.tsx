import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Dice5,
  Trash2,
  Image as ImageIcon,
  Sliders,
  ChevronDown,
  ChevronUp,
  Download,
  Save,
  CheckCircle2,
  AlertCircle,
  Clapperboard,
  Video,
  MonitorPlay,
  Share2,
  Info,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { ART_STYLES } from '../../data/presets';
import { ArtStyleId, OutputType, AspectRatio, JobStatus, Project } from '../../types';
import { CanvasPreview } from './CanvasPreview';
import {
  apiEnhancePrompt,
  apiGetIdea,
  apiGenerateMedia,
  apiCreateProject,
  apiGetAIStatus,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface AnimationStudioProps {
  initialPrompt?: string;
  initialStyleId?: ArtStyleId;
  initialOutputType?: OutputType;
  onProjectSaved?: (project: Project) => void;
  onOpenProjects?: () => void;
}

export const AnimationStudio: React.FC<AnimationStudioProps> = ({
  initialPrompt = '',
  initialStyleId = '3d_cinematic',
  initialOutputType = 'video',
  onProjectSaved,
  onOpenProjects,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();

  // Studio State
  const [prompt, setPrompt] = useState(
    initialPrompt ||
      'A beautiful fantasy forest at twilight, a young explorer standing beside a glowing river, magical butterflies flying through the air, cinematic camera movement, volumetric lighting, detailed 3D environment, atmospheric fog, and a dreamy color palette.'
  );
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState<ArtStyleId>(initialStyleId);
  const [outputType, setOutputType] = useState<OutputType>(initialOutputType);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [motionIntensity, setMotionIntensity] = useState<'low' | 'medium' | 'high' | 'ultra'>('high');
  const [duration, setDuration] = useState<number>(6);
  const [negativePrompt, setNegativePrompt] = useState<string>('blurry, low resolution, overexposed, oversaturated, deformed, watermark, low quality, artifacts');
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [quality, setQuality] = useState<'standard' | 'hd' | 'cinema'>('hd');

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementNotes, setEnhancementNotes] = useState<string | null>(null);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);

  // Generation Job State
  const [jobStatus, setJobStatus] = useState<JobStatus>('ready');
  const [jobProgress, setJobProgress] = useState(0);
  const [jobStepText, setJobStepText] = useState('');
  const [generatedResult, setGeneratedResult] = useState<{
    mediaUrl: string;
    thumbnailUrl: string;
    outputType: OutputType;
    isLiveAI: boolean;
    model: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // AI Service Status
  const [aiStatus, setAiStatus] = useState<{
    configured: boolean;
    models: { enhancement: string; tts: string; image: string; video: string };
    message: string;
  } | null>(null);

  useEffect(() => {
    apiGetAIStatus()
      .then(setAiStatus)
      .catch((err) => console.warn('Could not fetch AI status:', err));
  }, []);

  // Update prompt when initialPrompt changes
  useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
    if (initialStyleId) setSelectedStyleId(initialStyleId);
    if (initialOutputType) setOutputType(initialOutputType);
  }, [initialPrompt, initialStyleId, initialOutputType]);

  const selectedStyle = ART_STYLES.find((s) => s.id === selectedStyleId) || ART_STYLES[0];

  // AI Prompt Enhancement
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      setError('Please write a prompt before enhancing.');
      return;
    }
    setError(null);
    setIsEnhancing(true);
    try {
      const res = await apiEnhancePrompt(prompt, selectedStyleId, outputType);
      setEnhancedPrompt(res.enhancedPrompt);
      setEnhancementNotes(res.styleNotes);
    } catch (err: any) {
      setError(err.message || 'Prompt enhancement failed.');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Random Idea Generator
  const handleRandomIdea = async () => {
    setError(null);
    setIsGeneratingIdea(true);
    try {
      const res = await apiGetIdea(selectedStyleId);
      setPrompt(res.prompt);
      setEnhancedPrompt(null);
      setEnhancementNotes(null);
    } catch (err: any) {
      setError('Failed to fetch idea.');
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  // Clear Prompt
  const handleClearPrompt = () => {
    setPrompt('');
    setEnhancedPrompt(null);
    setEnhancementNotes(null);
    setError(null);
  };

  // Reference Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setReferenceImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Media Generation Workflow
  const handleGenerateMedia = async () => {
    if (!prompt.trim()) {
      setError('Please provide a scene description.');
      return;
    }

    setError(null);
    setSaveSuccess(false);
    setJobStatus('queued');
    setJobProgress(10);
    setJobStepText('Validating scene parameters & queuing synthesis pipeline...');

    // Progress simulation while job executes
    const interval = setInterval(() => {
      setJobProgress((prev) => {
        if (prev < 40) {
          setJobStepText('Analyzing lighting cues & camera trajectory...');
          return prev + 15;
        } else if (prev < 75) {
          setJobStepText(
            outputType === 'video'
              ? 'Rendering high-framerate video frames with motion shaders...'
              : 'Synthesizing high-fidelity visual frames & volumetric depth...'
          );
          return prev + 12;
        } else if (prev < 90) {
          setJobStepText(
            outputType === 'video'
              ? 'Encoding 60fps video stream & packaging MP4/WebM container...'
              : 'Finalizing color grading & spatial post-processing...'
          );
          return prev + 5;
        }
        return prev;
      });
    }, 450);

    try {
      setJobStatus('processing');

      // 1. Generate prompt-accurate visual asset via server pipeline
      const response = await apiGenerateMedia({
        prompt: prompt.trim(),
        enhancedPrompt: enhancedPrompt || undefined,
        styleId: selectedStyleId,
        outputType,
        aspectRatio,
        motionIntensity,
        duration,
      });

      let finalMediaUrl = response.mediaUrl;

      // 2. If output is video and not already direct from Gemini Omni Flash, animate the exact prompt scene using our cinematic camera & motion recorder
      if (outputType === 'video' && response.model !== 'gemini-omni-1.1-flash') {
        try {
          setJobStepText('Animating exact prompt scene with 2.5D camera pan & volumetric lighting...');
          const { recordPromptAccurateVideo } = await import('../../services/videoRecorder');
          const visualToAnimate = response.promptVisualUrl || response.mediaUrl || response.thumbnailUrl;
          const recorded = await recordPromptAccurateVideo(
            visualToAnimate,
            prompt.trim(),
            selectedStyleId,
            Math.min(duration, 6),
            aspectRatio,
            motionIntensity
          );
          finalMediaUrl = recorded.videoUrl;
        } catch (recErr) {
          console.warn('MediaRecorder error, falling back to direct video visual stream:', recErr);
          finalMediaUrl = response.promptVisualUrl || response.mediaUrl;
        }
      }

      clearInterval(interval);
      setJobProgress(100);
      setJobStepText('Prompt-accurate video generation completed successfully!');
      setJobStatus('completed');

      setGeneratedResult({
        mediaUrl: finalMediaUrl,
        thumbnailUrl: response.thumbnailUrl || response.promptVisualUrl || response.mediaUrl,
        outputType: response.outputType,
        isLiveAI: true,
        model: response.model,
      });
    } catch (err: any) {
      clearInterval(interval);
      setJobStatus('failed');
      setError(err.message || 'Media generation encountered an error.');
    }
  };

  // Save to Project
  const handleSaveToProject = async () => {
    if (!isAuthenticated) {
      openAuthModal('signin', () => handleSaveToProject());
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const title = prompt.slice(0, 32).trim() + (prompt.length > 32 ? '...' : '');
      const { project } = await apiCreateProject({
        title,
        prompt,
        enhancedPrompt: enhancedPrompt || undefined,
        negativePrompt: negativePrompt || undefined,
        styleId: selectedStyleId,
        outputType,
        aspectRatio,
        status: jobStatus === 'completed' ? 'completed' : 'ready',
        mediaUrl: generatedResult?.mediaUrl,
        thumbnailUrl: generatedResult?.thumbnailUrl || selectedStyle.thumbnailUrl,
        duration,
        isDraft: jobStatus !== 'completed',
        metadata: {
          model: generatedResult?.model || (aiStatus?.configured ? 'gemini-3.8-flash' : 'demo-canvas-engine'),
          motionIntensity,
        },
      });

      setSaveSuccess(true);
      onProjectSaved?.(project);
    } catch (err: any) {
      setError(err.message || 'Failed to save project.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Studio Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Creative Studio
            </span>
            {aiStatus?.configured ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Gemini Flash AI Active
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Demo & Exploration Mode
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Animation & Video Creation Studio
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {isAuthenticated && (
            <button
              onClick={onOpenProjects}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-purple-500/20 text-xs font-semibold text-purple-200 transition-colors cursor-pointer"
            >
              Open My Projects
            </button>
          )}

          <button
            onClick={handleSaveToProject}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/30 text-xs font-semibold text-white transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-purple-300" />
            {isSaving ? 'Saving...' : saveSuccess ? 'Saved to Library!' : 'Save Project'}
          </button>
        </div>
      </div>

      {/* Demo Mode Notice Banner if unconfigured */}
      {!aiStatus?.configured && (
        <div className="mb-6 p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/25 flex items-start gap-3 text-xs text-purple-200">
          <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-white">Interactive Demo Mode: </span>
            Prompt enhancement, procedural canvas preview, and project management are fully operational.
            When <code className="bg-purple-900/60 px-1 py-0.5 rounded text-purple-300">GEMINI_API_KEY</code> is provided in Settings &gt; Secrets, live Flash AI directors and Gemini TTS will seamlessly synthesize assets.
          </div>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Prompt & Configurations (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Prompt Editor Box */}
          <div className="rounded-2xl p-5 bg-[#120a28]/80 border border-purple-500/20 shadow-xl shadow-purple-950/30 relative">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <span>What would you like to create?</span>
              </label>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleRandomIdea}
                  disabled={isGeneratingIdea}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Generate a random creative prompt idea"
                >
                  <Dice5 className={`w-3.5 h-3.5 text-cyan-400 ${isGeneratingIdea ? 'animate-spin' : ''}`} />
                  <span>Random Idea</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearPrompt}
                  className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
                  title="Clear prompt input"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Prompt Textarea */}
            <div className="relative">
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your imagination in detail... e.g. A beautiful fantasy forest at twilight with glowing river and butterflies"
                className="w-full bg-[#180e36]/90 border border-purple-500/25 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all resize-none font-normal leading-relaxed"
              />
              <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-500 font-mono">
                {prompt.length} chars
              </span>
            </div>

            {/* AI Enhance Action */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || !prompt.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 text-purple-200 ${isEnhancing ? 'animate-spin' : ''}`} />
                <span>{isEnhancing ? 'Gemini AI Enhancing...' : 'AI Enhance with Gemini'}</span>
              </button>

              <span className="text-[11px] text-slate-400">
                Enriches lighting, camera angles, and style fidelity
              </span>
            </div>

            {/* Enhanced Prompt Display */}
            {enhancedPrompt && (
              <div className="mt-4 p-3.5 rounded-xl bg-purple-950/60 border border-purple-400/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    Director Enhanced Prompt
                  </span>
                  <button
                    onClick={() => {
                      setPrompt(enhancedPrompt);
                      setEnhancedPrompt(null);
                    }}
                    className="text-[11px] text-purple-300 hover:text-white underline cursor-pointer"
                  >
                    Apply to editor
                  </button>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-serif italic">
                  "{enhancedPrompt}"
                </p>
                {enhancementNotes && (
                  <p className="text-[10px] text-slate-400 mt-2 font-mono">{enhancementNotes}</p>
                )}
              </div>
            )}
          </div>

          {/* Art Style Selector (6 cards) */}
          <div className="rounded-2xl p-5 bg-[#120a28]/80 border border-purple-500/20 shadow-xl shadow-purple-950/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Art Style Selector</h3>
                <p className="text-xs text-slate-400">
                  Select an aesthetic to steer the visual rendering and motion language.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-300">{selectedStyle.name}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ART_STYLES.map((style) => {
                const isSelected = selectedStyleId === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyleId(style.id)}
                    className={`relative rounded-xl overflow-hidden p-2 text-left transition-all border group cursor-pointer ${
                      isSelected
                        ? 'border-purple-400 bg-purple-950/70 ring-2 ring-purple-500/50 shadow-lg shadow-purple-900/50'
                        : 'border-purple-500/20 bg-[#160d33]/50 hover:border-purple-400/40 hover:bg-[#1a0f3d]'
                    }`}
                  >
                    <div className="relative h-20 rounded-lg overflow-hidden mb-2">
                      <img
                        src={style.thumbnailUrl}
                        alt={style.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <span className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white drop-shadow">
                        {style.name}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-300 line-clamp-2 leading-tight">
                      {style.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generation Settings Panel */}
          <div className="rounded-2xl p-5 bg-[#120a28]/80 border border-purple-500/20 shadow-xl shadow-purple-950/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                Generation Settings
              </h3>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>{showAdvanced ? 'Hide Advanced' : 'Show Advanced'}</span>
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Output Type Buttons */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-300 mb-2">Output Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'video' as const, label: 'Video Clip', icon: Video, badge: 'Cinematic' },
                  { id: 'image' as const, label: 'High-Res Image', icon: ImageIcon, badge: '8K Still' },
                  {
                    id: 'animation_preview' as const,
                    label: 'Canvas Preview',
                    icon: MonitorPlay,
                    badge: 'Procedural',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = outputType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOutputType(item.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-purple-400 bg-purple-900/40 text-white shadow-md'
                          : 'border-purple-500/20 bg-[#160d33]/50 text-slate-300 hover:border-purple-400/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-300' : 'text-slate-400'}`} />
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-purple-300">
                          {item.badge}
                        </span>
                      </div>
                      <div className="text-xs font-semibold">{item.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-300 mb-2">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '16:9' as const, label: '16:9 Landscape', desc: 'YouTube, Cinema' },
                  { id: '9:16' as const, label: '9:16 Portrait', desc: 'Shorts, TikTok' },
                  { id: '1:1' as const, label: '1:1 Square', desc: 'Instagram, Square' },
                ].map((item) => {
                  const isSelected = aspectRatio === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAspectRatio(item.id)}
                      className={`py-2 px-3 rounded-xl text-center border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-purple-400 bg-purple-900/40 text-white font-semibold'
                          : 'border-purple-500/20 bg-[#160d33]/40 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.id}</div>
                      <div className="text-[10px] text-slate-400">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Expandable Advanced Settings */}
            {showAdvanced && (
              <div className="pt-4 border-t border-purple-500/15 space-y-4">
                {/* Motion Intensity */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-slate-300">Motion Intensity</label>
                    <span className="text-xs text-purple-300 font-bold capitalize">{motionIntensity}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {(['low', 'medium', 'high', 'ultra'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setMotionIntensity(lvl)}
                        className={`py-1.5 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                          motionIntensity === lvl
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/5 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-slate-300">Clip Duration</label>
                    <span className="text-xs text-purple-300 font-mono font-bold">{duration} seconds</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={12}
                    step={1}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                {/* Negative Prompt */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Negative Prompt</label>
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="Things to avoid e.g. blurry, deformed, extra fingers"
                    className="w-full bg-[#180e36] border border-purple-500/25 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Reference Image Upload */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Reference Image (Optional)</label>
                  <div className="flex items-center gap-3">
                    <label className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-purple-500/20 text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-purple-400" />
                      <span>{referenceImage ? 'Change Image' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    {referenceImage && (
                      <div className="flex items-center gap-2">
                        <img
                          src={referenceImage}
                          alt="Reference"
                          className="w-8 h-8 rounded-lg object-cover border border-purple-400/50"
                        />
                        <button
                          type="button"
                          onClick={() => setReferenceImage(null)}
                          className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Generate Media Button */}
            <div className="mt-5">
              <button
                type="button"
                onClick={handleGenerateMedia}
                disabled={jobStatus === 'queued' || jobStatus === 'processing'}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {jobStatus === 'queued' || jobStatus === 'processing' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Processing Creative Generation...</span>
                  </>
                ) : (
                  <>
                    <Clapperboard className="w-4 h-4 text-purple-200" />
                    <span>Generate {outputType === 'image' ? 'Image' : 'Animation Clip'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Previews & Media Engine (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Generation Progress Bar */}
          {(jobStatus === 'queued' || jobStatus === 'processing') && (
            <div className="rounded-2xl p-5 bg-[#170e35] border border-purple-500/30 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  Generating Asset
                </span>
                <span className="text-xs font-mono text-cyan-300 font-bold">{jobProgress}%</span>
              </div>

              {/* Progress track */}
              <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${jobProgress}%` }}
                />
              </div>

              <p className="text-xs text-slate-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                {jobStepText}
              </p>
            </div>
          )}

          {/* Canvas Procedural Preview Engine */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Interactive Preview Engine
              </span>
              <span className="text-[11px] text-purple-300 font-medium">
                {selectedStyle.name} Shader
              </span>
            </div>

            <CanvasPreview
              styleId={selectedStyleId}
              aspectRatio={aspectRatio}
              motionIntensity={motionIntensity}
              title={prompt}
            />
          </div>

          {/* Generated Media Result (Completed Asset Viewer) */}
          {generatedResult && (
            <div className="rounded-2xl p-5 bg-[#130b2c] border border-purple-500/30 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {generatedResult.outputType === 'video' ? 'Generated Video Result' : 'Generated Image Result'}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {generatedResult.outputType === 'video' ? '60fps Cinematic Video' : generatedResult.isLiveAI ? 'Live Gemini Model' : 'Simulation Engine'}
                </span>
              </div>

              {/* Media Container: Real Video or High-Res Image */}
              <div className="relative rounded-xl overflow-hidden mb-3 bg-black aspect-video flex items-center justify-center border border-purple-500/20">
                {generatedResult.outputType === 'video' ||
                generatedResult.mediaUrl.endsWith('.mp4') ||
                generatedResult.mediaUrl.endsWith('.webm') ||
                generatedResult.mediaUrl.startsWith('blob:') ? (
                  <video
                    key={generatedResult.mediaUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                    src={generatedResult.mediaUrl}
                  />
                ) : (
                  <img
                    src={generatedResult.mediaUrl}
                    alt="Generated asset"
                    className="w-full h-full object-cover"
                  />
                )}
                
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-purple-300 pointer-events-none">
                  {generatedResult.outputType.toUpperCase()}
                </div>

                <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center text-xs text-white pointer-events-none drop-shadow">
                  <span className="truncate max-w-[200px] font-medium">{prompt}</span>
                  <span className="text-[11px] font-mono opacity-80">{selectedStyle.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={generatedResult.mediaUrl}
                  download={`animai-${selectedStyleId}-${Date.now()}.${
                    generatedResult.outputType === 'video' ? 'mp4' : 'png'
                  }`}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-purple-600/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {generatedResult.outputType === 'video'
                      ? 'Download Video (MP4/WebM)'
                      : 'Download Image (PNG)'}
                  </span>
                </a>

                <button
                  type="button"
                  onClick={handleSaveToProject}
                  disabled={isSaving}
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-purple-500/30 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
