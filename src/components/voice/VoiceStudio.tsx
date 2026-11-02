import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Play,
  Pause,
  Download,
  Save,
  Volume2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  BookOpen,
} from 'lucide-react';
import { VOICE_PERSONAS } from '../../data/presets';
import { VoicePersonaId, Project } from '../../types';
import { apiGenerateTTS, apiCreateProject } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface VoiceStudioProps {
  onProjectSaved?: (project: Project) => void;
  onOpenProjects?: () => void;
}

export const VoiceStudio: React.FC<VoiceStudioProps> = ({ onProjectSaved, onOpenProjects }) => {
  const { isAuthenticated, openAuthModal } = useAuth();

  const [script, setScript] = useState<string>(
    'Across the deep expanse of the neon metropolis, the solitary guardian watched the storm roll in over the glass spires.'
  );
  const [selectedPersonaId, setSelectedPersonaId] = useState<VoicePersonaId>('Zephyr');
  const [language, setLanguage] = useState<string>('en-US');
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);

  // Audio Playback State
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDemoSpeech, setIsDemoSpeech] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedPersona = VOICE_PERSONAS.find((p) => p.id === selectedPersonaId) || VOICE_PERSONAS[0];

  const sampleScripts = [
    {
      title: 'Cinematic Movie Trailer',
      text: 'In a forgotten era of fallen empires, one pilot uncovered the signal that changed the fate of our galaxies forever.',
      persona: 'Zephyr' as const,
    },
    {
      title: 'Heroic Game Adventure',
      text: 'Watch your step! If this reactor explodes, the entire orbital station is taking a one-way trip to hyperspace!',
      persona: 'Puck' as const,
    },
    {
      title: 'Enchanted Nature Lore',
      text: 'Breathe softly. The ancient forest remembers the melodies sung by the river long before our cities touched the sky.',
      persona: 'Kore' as const,
    },
  ];

  // Draw simulated waveform animation when playing
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const renderWave = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const bars = 48;
      const barWidth = width / bars - 2;

      for (let i = 0; i < bars; i++) {
        const x = i * (barWidth + 2);
        let barHeight = 8;

        if (isPlaying) {
          const freq = Math.sin(phase + i * 0.25) * Math.cos(phase * 0.5 + i * 0.15);
          barHeight = Math.max(6, Math.abs(freq) * (height * 0.75));
        } else {
          barHeight = Math.sin(i * 0.2) * 10 + 12;
        }

        const grad = ctx.createLinearGradient(0, height / 2 - barHeight / 2, 0, height / 2 + barHeight / 2);
        if (selectedPersonaId === 'Zephyr') {
          grad.addColorStop(0, '#c084fc');
          grad.addColorStop(1, '#6366f1');
        } else if (selectedPersonaId === 'Puck') {
          grad.addColorStop(0, '#38bdf8');
          grad.addColorStop(1, '#06b6d4');
        } else {
          grad.addColorStop(0, '#f472b6');
          grad.addColorStop(1, '#c084fc');
        }

        ctx.fillStyle = grad;
        ctx.fillRect(x, height / 2 - barHeight / 2, barWidth, barHeight);
      }

      if (isPlaying) {
        phase += 0.15;
      }
      animId = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, selectedPersonaId]);

  // Audio element listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 6);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const handleGenerateSpeech = async () => {
    if (!script.trim()) {
      setError('Please enter a script text.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setSaveSuccess(false);

    try {
      const result = await apiGenerateTTS(script.trim(), selectedPersonaId);

      if (result.audioBase64) {
        // Real Gemini TTS audio/wav returned!
        const url = `data:${result.mimeType};base64,${result.audioBase64}`;
        setAudioUrl(url);
        setIsDemoSpeech(false);
        setDuration(result.durationEstimate);
      } else {
        // Fallback using browser speech synthesis for interactive testing
        setIsDemoSpeech(true);
        setDuration(result.durationEstimate);

        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(script);
          utterance.rate = speed;
          utterance.pitch = pitch;

          // Attempt to find a suitable voice
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            if (selectedPersonaId === 'Zephyr') {
              utterance.voice = voices.find((v) => v.name.includes('Male') || v.name.includes('David') || v.lang.startsWith('en')) || voices[0];
            } else if (selectedPersonaId === 'Puck') {
              utterance.voice = voices.find((v) => v.name.includes('Daniel') || v.name.includes('Junior') || v.lang.startsWith('en')) || voices[0];
            } else {
              utterance.voice = voices.find((v) => v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.lang.startsWith('en')) || voices[0];
            }
          }

          utterance.onstart = () => setIsPlaying(true);
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => setIsPlaying(false);

          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Speech generation encountered an error.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePlay = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else if (isDemoSpeech && 'speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        handleGenerateSpeech();
      }
    }
  };

  const handleSaveToProject = async () => {
    if (!isAuthenticated) {
      openAuthModal('signin', () => handleSaveToProject());
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const title = `${selectedPersona.name} Voice: ${script.slice(0, 24)}...`;
      const { project } = await apiCreateProject({
        title,
        prompt: script,
        scriptText: script,
        voicePersona: selectedPersonaId,
        styleId: '3d_cinematic',
        outputType: 'video',
        aspectRatio: '16:9',
        status: 'completed',
        audioUrl: audioUrl || undefined,
        duration: Math.round(duration || 6),
        isDraft: false,
        metadata: {
          model: isDemoSpeech ? 'browser-speech-synthesis' : 'gemini-3.8-flash-lite-tts',
        },
      });

      setSaveSuccess(true);
      onProjectSaved?.(project);
    } catch (err: any) {
      setError(err.message || 'Failed to save voice project.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hidden audio element for WAV playback */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <Mic className="w-3 h-3 text-cyan-400" />
              AI Voiceover Studio
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Give Your Story a Voice
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Turn narration scripts into expressive, emotional character voices powered by Gemini TTS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <button
              onClick={onOpenProjects}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-purple-500/20 text-xs font-semibold text-purple-200 transition-colors cursor-pointer"
            >
              My Projects
            </button>
          )}

          <button
            onClick={handleSaveToProject}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/30 text-xs font-semibold text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-purple-300" />
            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved to Project!' : 'Save to Project'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Script Editor & Voice Selection (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Script Editor Box */}
          <div className="rounded-2xl p-5 bg-[#120a28]/80 border border-purple-500/20 shadow-xl shadow-purple-950/30">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <span>Narration Script</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  {script.length} characters • ~{Math.max(2, Math.ceil(script.split(' ').length / 2.5))}s
                </span>
              </div>
            </div>

            <textarea
              rows={5}
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Enter your script here... Write dialogue, cinematic voiceovers, or dramatic monologues."
              className="w-full bg-[#180e36]/90 border border-purple-500/25 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none font-normal leading-relaxed"
            />

            {/* Quick Script Inspiration Presets */}
            <div className="mt-4 pt-3 border-t border-purple-500/15">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Script Inspiration:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sampleScripts.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setScript(sample.text);
                      setSelectedPersonaId(sample.persona);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-purple-950/70 hover:bg-purple-900 border border-purple-500/20 text-purple-200 transition-colors cursor-pointer"
                  >
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Voice Personas (3 Cards) */}
          <div className="rounded-2xl p-5 bg-[#120a28]/80 border border-purple-500/20 shadow-xl shadow-purple-950/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Voice Personas</h3>
                <p className="text-xs text-slate-400">
                  Select a persona matched with Gemini TTS prebuilt models.
                </p>
              </div>
              <span className="text-xs font-bold text-cyan-300">{selectedPersona.name}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {VOICE_PERSONAS.map((persona) => {
                const isSelected = selectedPersonaId === persona.id;
                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => setSelectedPersonaId(persona.id)}
                    className={`rounded-xl p-4 text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-500/40 shadow-lg'
                        : 'border-purple-500/20 bg-[#160d33]/50 hover:border-cyan-400/40 hover:bg-[#1a0f3d]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                        {persona.name[0]}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 text-slate-300">
                        {persona.gender}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-0.5">{persona.name}</h4>
                    <p className="text-[11px] text-cyan-300 font-medium mb-2">{persona.tagline}</p>
                    <p className="text-[10px] text-slate-300 leading-tight line-clamp-3">
                      {persona.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Tuning Parameters */}
          <div className="rounded-2xl p-5 bg-[#120a28]/80 border border-purple-500/20 shadow-xl shadow-purple-950/30 space-y-4">
            <h3 className="text-sm font-bold text-white">Vocal Parameters</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-300">Speech Rate</label>
                  <span className="text-xs text-cyan-300 font-mono font-bold">{speed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.7}
                  max={1.4}
                  step={0.1}
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-300">Pitch Depth</label>
                  <span className="text-xs text-cyan-300 font-mono font-bold">{pitch.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.8}
                  max={1.3}
                  step={0.05}
                  value={pitch}
                  onChange={(e) => setPitch(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Error notice */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerateSpeech}
              disabled={isGenerating || !script.trim()}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Voiceover with Gemini...</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-cyan-200" />
                  <span>Generate Speech ({selectedPersona.name})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Audio Player & Waveform Visualizer (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl p-6 bg-[#130b2c] border border-purple-500/25 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Vocal Waveform Visualizer
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {isDemoSpeech ? 'Interactive Demo Audio' : 'Gemini 3.8 Flash Lite TTS'}
              </span>
            </div>

            {/* Waveform Canvas */}
            <div className="w-full h-32 rounded-xl bg-[#090514] border border-purple-500/20 flex items-center justify-center p-3 mb-4 overflow-hidden">
              <canvas
                ref={waveformCanvasRef}
                width={400}
                height={120}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Audio Time & Seek Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>00:{Math.floor(currentTime).toString().padStart(2, '0')}</span>
                <span>00:{Math.floor(duration || 6).toString().padStart(2, '0')}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-black/50 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all"
                  style={{
                    width: duration ? `${Math.min(100, (currentTime / duration) * 100)}%` : '0%',
                  }}
                />
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white flex items-center justify-center shadow-lg shadow-cyan-600/30 transition-transform active:scale-95 cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                <div>
                  <div className="text-sm font-bold text-white">{selectedPersona.name}</div>
                  <div className="text-xs text-slate-400">
                    {isPlaying ? 'Playing track...' : 'Ready to play'}
                  </div>
                </div>
              </div>

              {/* Download Audio */}
              {audioUrl ? (
                <a
                  href={audioUrl}
                  download={`animai-voice-${selectedPersonaId}-${Date.now()}.wav`}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 hover:text-white transition-colors"
                  title="Download Audio (WAV)"
                >
                  <Download className="w-4 h-4" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateSpeech}
                  className="text-xs text-cyan-300 hover:text-cyan-200 underline"
                >
                  Synthesize audio
                </button>
              )}
            </div>
          </div>

          {/* Voice Persona Details Card */}
          <div className="rounded-2xl p-5 bg-[#120a28]/80 border border-purple-500/20">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Persona Profile
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-purple-500/15">
                <span className="text-slate-400">Vocal Tone:</span>
                <span className="text-purple-300 font-medium">{selectedPersona.tone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-purple-500/15">
                <span className="text-slate-400">Engine Output:</span>
                <span className="text-cyan-300 font-mono">24kHz 16-bit WAV</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Recommended Use:</span>
                <span className="text-slate-200">Cinematic Trailers & Narration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
