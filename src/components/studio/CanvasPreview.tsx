import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Camera, Video, Sparkles } from 'lucide-react';
import { ArtStyleId, AspectRatio } from '../../types';

interface CanvasPreviewProps {
  styleId: ArtStyleId;
  aspectRatio: AspectRatio;
  motionIntensity?: 'low' | 'medium' | 'high' | 'ultra';
  title?: string;
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  styleId,
  aspectRatio,
  motionIntensity = 'high',
  title = 'Real-time Procedural Preview',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [time, setTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSeconds, setRecordedSeconds] = useState(0);

  const speedFactor =
    (motionIntensity === 'low' ? 0.6 : motionIntensity === 'medium' ? 1.0 : motionIntensity === 'high' ? 1.4 : 1.8) *
    speedMultiplier;

  // Sound generator using Web Audio API when unmuted
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (!isMuted) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = styleId === 'cyberpunk' ? 'sawtooth' : styleId === '2d_anime' ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(styleId === 'cyberpunk' ? 85 : 120, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscRef.current = osc;
      } catch (err) {
        console.warn('Audio synthesis not supported or blocked:', err);
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    }

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [isMuted, styleId]);

  // Main canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    // Generate style-specific particle seeds
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 500,
      size: Math.random() * 4 + 1,
      speedX: (Math.random() - 0.5) * 1.5,
      speedY: (Math.random() - 0.5) * 1.5,
      hue: Math.random() * 60 + 240,
      opacity: Math.random() * 0.7 + 0.3,
      angle: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      if (!canvas || !ctx) return;
      const width = canvas.width;
      const height = canvas.height;

      if (isPlaying) {
        t += 0.02 * speedFactor;
        setTime(Math.floor(t % 60));
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Background based on Art Style
      if (styleId === '3d_cinematic') {
        // Deep purple nebula with cinematic god rays
        const bgGrad = ctx.createRadialGradient(
          width / 2 + Math.sin(t * 0.5) * 100,
          height / 2 + Math.cos(t * 0.4) * 50,
          20,
          width / 2,
          height / 2,
          width * 0.7
        );
        bgGrad.addColorStop(0, '#2e1065');
        bgGrad.addColorStop(0.5, '#130924');
        bgGrad.addColorStop(1, '#080410');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Volumetric Light Beams
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < 5; i++) {
          const rayAngle = (i * 0.3 + Math.sin(t * 0.3 + i) * 0.1) * Math.PI;
          const rayGrad = ctx.createLinearGradient(0, 0, Math.cos(rayAngle) * width, height);
          rayGrad.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
          rayGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
          ctx.fillStyle = rayGrad;
          ctx.beginPath();
          ctx.moveTo(width / 2 + (i - 2) * 50, -20);
          ctx.lineTo(width / 2 + (i - 2) * 180 + Math.sin(t) * 40, height);
          ctx.lineTo(width / 2 + (i - 2) * 140, height);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // 3D Orbital Rings
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(t * 0.2);
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 160 + Math.sin(t) * 10, 70, Math.PI / 4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 120, 50, -Math.PI / 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (styleId === '2d_anime') {
        // Vibrant twilight sunset gradient with anime clouds
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#4c1d95');
        grad.addColorStop(0.4, '#db2777');
        grad.addColorStop(0.8, '#fb923c');
        grad.addColorStop(1, '#fed7aa');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Drifting clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        for (let c = 0; c < 3; c++) {
          const cx = ((c * 300 + t * 30) % (width + 200)) - 100;
          const cy = 90 + c * 50;
          ctx.beginPath();
          ctx.arc(cx, cy, 40, 0, Math.PI * 2);
          ctx.arc(cx + 35, cy - 10, 50, 0, Math.PI * 2);
          ctx.arc(cx + 80, cy, 35, 0, Math.PI * 2);
          ctx.fill();
        }

        // Cherry Blossom Petals
        ctx.save();
        ctx.fillStyle = 'rgba(255, 192, 203, 0.85)';
        particles.slice(0, 35).forEach((p, idx) => {
          const px = (p.x + Math.sin(t + idx) * 30 + t * 40) % width;
          const py = (p.y + t * 25) % height;
          ctx.beginPath();
          ctx.ellipse(px, py, 6, 3, t + idx, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      } else if (styleId === 'cyberpunk') {
        // Deep obsidian background with Neon Grid Horizon
        ctx.fillStyle = '#05030a';
        ctx.fillRect(0, 0, width, height);

        // Perspective Neon Grid (Receding floor)
        const horizon = height * 0.45;
        const gridGrad = ctx.createLinearGradient(0, horizon, 0, height);
        gridGrad.addColorStop(0, 'rgba(168, 85, 247, 0.1)');
        gridGrad.addColorStop(1, 'rgba(6, 182, 212, 0.8)');
        ctx.strokeStyle = gridGrad;
        ctx.lineWidth = 1.2;

        // Vanishing perspective lines
        const vanishingX = width / 2;
        const lineCount = 18;
        for (let i = 0; i <= lineCount; i++) {
          const bottomX = (width / lineCount) * i;
          ctx.beginPath();
          ctx.moveTo(vanishingX, horizon);
          ctx.lineTo(bottomX, height);
          ctx.stroke();
        }

        // Horizontal receding lines with animation
        const offset = (t * 40) % 30;
        for (let y = horizon + offset; y < height; y += 18 + ((y - horizon) / height) * 35) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Glowing neon sun on horizon
        ctx.save();
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 25;
        const sunGrad = ctx.createLinearGradient(0, horizon - 90, 0, horizon + 20);
        sunGrad.addColorStop(0, '#f43f5e');
        sunGrad.addColorStop(1, '#a855f7');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(width / 2, horizon, 75, Math.PI, 0, false);
        ctx.fill();
        ctx.restore();

        // Neon Rain streaks
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
        ctx.lineWidth = 1;
        for (let r = 0; r < 40; r++) {
          const rx = (r * 23 + t * 50) % width;
          const ry = (r * 37 + t * 150) % height;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 3, ry + 16);
          ctx.stroke();
        }
      } else if (styleId === 'stop_motion') {
        // Textured kraft paper backdrop with clay characters
        ctx.fillStyle = '#1e142b';
        ctx.fillRect(0, 0, width, height);

        // Tactile warm spotlight
        const spot = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, 350);
        spot.addColorStop(0, '#3b2354');
        spot.addColorStop(1, '#120b1f');
        ctx.fillStyle = spot;
        ctx.fillRect(0, 0, width, height);

        // Stutter animation (Stop motion framerate ~12fps)
        const frameStep = Math.floor(t * 12);
        const wiggleX = Math.sin(frameStep) * 4;
        const wiggleY = Math.cos(frameStep * 0.8) * 3;

        // Clay character silhouette / sphere
        ctx.save();
        ctx.translate(width / 2 + wiggleX, height / 2 + wiggleY);

        // Body
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.ellipse(0, 30, 45, 55, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#fb923c';
        ctx.beginPath();
        ctx.arc(0, -30, 35, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-12, -35, 8, 0, Math.PI * 2);
        ctx.arc(12, -35, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-12 + Math.sin(frameStep) * 2, -35, 3.5, 0, Math.PI * 2);
        ctx.arc(12 + Math.sin(frameStep) * 2, -35, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (styleId === 'photorealistic') {
        // Deep dark cinematic room with warm bokeh orbs
        ctx.fillStyle = '#0b0813';
        ctx.fillRect(0, 0, width, height);

        // Golden Hour Sun flare
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const flareX = width * 0.75 + Math.sin(t * 0.3) * 30;
        const flareY = height * 0.25;

        const flareGrad = ctx.createRadialGradient(flareX, flareY, 5, flareX, flareY, 280);
        flareGrad.addColorStop(0, 'rgba(253, 224, 71, 0.7)');
        flareGrad.addColorStop(0.3, 'rgba(249, 115, 22, 0.4)');
        flareGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = flareGrad;
        ctx.beginPath();
        ctx.arc(flareX, flareY, 280, 0, Math.PI * 2);
        ctx.fill();

        // Floating Bokeh light circles
        particles.slice(0, 25).forEach((p, i) => {
          const bx = (p.x + t * 12) % width;
          const by = (p.y + Math.sin(t * 0.5 + i) * 20) % height;
          const bGrad = ctx.createRadialGradient(bx, by, 1, bx, by, p.size * 12);
          bGrad.addColorStop(0, 'rgba(244, 114, 182, 0.4)');
          bGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.2)');
          bGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = bGrad;
          ctx.beginPath();
          ctx.arc(bx, by, p.size * 12, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      } else {
        // Pixel Art 16-bit retro canvas
        ctx.fillStyle = '#0f051d';
        ctx.fillRect(0, 0, width, height);

        // Retro Pixel grid pattern
        const pixelSize = 16;
        for (let x = 0; x < width; x += pixelSize) {
          for (let y = 0; y < height; y += pixelSize) {
            const noise = Math.sin(x * 0.05 + t) * Math.cos(y * 0.05 + t);
            if (noise > 0.6) {
              ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
              ctx.fillRect(x, y, pixelSize, pixelSize);
            }
          }
        }

        // Pixel Waterfall
        const wfX = width / 2 - 32;
        const pStep = Math.floor(t * 8) % 4;
        ctx.fillStyle = '#38bdf8';
        for (let y = 80; y < height; y += pixelSize) {
          const shift = ((y / pixelSize + pStep) % 2 === 0 ? 0 : 4);
          ctx.fillRect(wfX + shift, y, 64, pixelSize - 2);
        }
      }

      // Draw floating luminous sparkles
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      particles.forEach((p, i) => {
        const px = (p.x + Math.sin(t + i) * 15) % width;
        const py = (p.y - t * 10 + height) % height;
        ctx.beginPath();
        ctx.arc(px, py, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, styleId, speedFactor]);

  const handleSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `animai-canvas-snapshot-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleRecordVideo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!('MediaRecorder' in window) || typeof (canvas as any).captureStream !== 'function') {
      alert('MediaRecorder is not supported in this browser environment.');
      return;
    }

    try {
      setIsRecording(true);
      setRecordedSeconds(5);
      const stream = (canvas as any).captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        setIsRecording(false);
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `animai-${styleId}-${Date.now()}.webm`;
        a.click();
      };

      mediaRecorder.start();
      let count = 5;
      const interval = setInterval(() => {
        count -= 1;
        setRecordedSeconds(count);
        if (count <= 0) {
          clearInterval(interval);
          mediaRecorder.stop();
        }
      }, 1000);
    } catch (err) {
      setIsRecording(false);
      console.error('Recording error:', err);
    }
  };

  const handleReset = () => {
    setTime(0);
    setIsPlaying(true);
  };

  // Dimensions based on aspect ratio
  const aspectClass =
    aspectRatio === '9:16'
      ? 'aspect-[9/16] max-h-[520px]'
      : aspectRatio === '1:1'
      ? 'aspect-square max-h-[480px]'
      : 'aspect-video max-h-[440px]';

  return (
    <div className="relative flex flex-col rounded-2xl overflow-hidden bg-[#0d0720] border border-purple-500/20 shadow-xl">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#150c2e]/90 border-b border-purple-500/15">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
            Procedural Canvas Preview
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {time}s / 60s
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRecordVideo}
            disabled={isRecording}
            title="Record 5-Second Video Clip (WebM)"
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              isRecording
                ? 'bg-red-500/30 text-red-300 border border-red-500/40 animate-pulse'
                : 'text-purple-300 hover:text-white bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/25'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-cyan-300" />
            <span>{isRecording ? `Recording (${recordedSeconds}s)...` : 'Record Video'}</span>
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Unmute Ambient Synthesis' : 'Mute Ambient Synthesis'}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              !isMuted ? 'text-purple-300 bg-purple-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleSnapshot}
            title="Export Canvas Snapshot (PNG)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className={`relative w-full ${aspectClass} flex items-center justify-center bg-black overflow-hidden`}>
        <canvas
          ref={canvasRef}
          width={800}
          height={aspectRatio === '9:16' ? 1422 : aspectRatio === '1:1' ? 800 : 450}
          className="w-full h-full object-contain"
        />

        {/* Floating Label */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Interactive Simulation Engine</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#130a2a] border-t border-purple-500/15">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
            title="Reset to 0s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Multiplier */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Motion Speed</span>
          <div className="flex items-center bg-black/30 rounded-lg p-0.5 border border-purple-500/20">
            {[0.5, 1, 1.5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeedMultiplier(s)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  speedMultiplier === s
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
