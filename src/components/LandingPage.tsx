import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Play,
  Layers,
  Mic,
  FolderKanban,
  Check,
  ChevronDown,
  ShieldCheck,
  Zap,
  Palette,
  Clapperboard,
  Cpu,
  Share2,
} from 'lucide-react';
import { ART_STYLES } from '../data/presets';
import { CanvasPreview } from './studio/CanvasPreview';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onNavigate: (view: 'landing' | 'dashboard' | 'studio' | 'voice' | 'projects' | 'history' | 'settings') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState(ART_STYLES[0].id);

  const handleStartCreating = () => {
    onNavigate('studio');
  };

  const faqs = [
    {
      q: 'What is AnimAI Studio and how does it work?',
      a: 'AnimAI Studio is a professional creative suite that transforms text prompts into multi-style animations, visual concepts, cinematic videos, and AI voiceovers. It pairs advanced generative AI capabilities (including Gemini Flash enhancement and high-fidelity speech) with a real-time procedural canvas animation engine.',
    },
    {
      q: 'Which creative art styles are supported?',
      a: 'AnimAI Studio natively supports six distinct creative aesthetics: 3D Cinematic (Unreal 5 volumetric lighting), 2D Anime (Makoto Shinkai & Ghibli aesthetic), Cyberpunk (Neo-Tokyo neon reflections), Stop-Motion (tactile claymation & tilt-shift), Photorealistic (70mm IMAX fidelity), and Pixel Art (16-bit retro arcade).',
    },
    {
      q: 'Can I generate expressive voiceovers for my animations?',
      a: 'Yes! The dedicated AI Voice Generation Studio offers personas like Zephyr (Cinematic & Deep), Puck (Energetic & Dynamic), and Kore (Warm & Composed) powered by Gemini TTS with pitch, speed, and real-time audio playback.',
    },
    {
      q: 'Are my projects and generation history securely saved?',
      a: 'Every registered user has an encrypted private workspace. Your prompts, enhanced camera directions, generated media files, and script history are automatically backed up and accessible from your dashboard.',
    },
    {
      q: 'Can I test the studio without an API key?',
      a: 'AnimAI Studio includes a fully functional Demo & Exploration Mode. You can experience the prompt director, procedural canvas animation engine, art style matrix, and project library right away.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#080514] text-slate-100 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-purple-700/20 via-indigo-600/10 to-transparent blur-[120px]" />
        <div className="absolute top-[800px] -left-40 w-[600px] h-[600px] bg-cyan-700/10 blur-[140px]" />
        <div className="absolute top-[1600px] -right-40 w-[700px] h-[700px] bg-fuchsia-700/10 blur-[150px]" />
      </div>

      {/* Hero Section */}
      <section id="hero" className="relative pt-12 pb-20 sm:pt-16 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-6 shadow-lg shadow-purple-950/40 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI-Powered Creative Studio</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
              Turn Your Imagination Into <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300">
                Cinematic Animations
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-9 leading-relaxed">
              Transform simple text prompts into stunning visual concepts, AI-generated images,
              cinematic videos, and expressive voiceovers. Create, customize, and organize your creative projects
              in one intelligent workspace.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <button
                onClick={handleStartCreating}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-purple-200" />
                <span>Start Creating Free</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => onNavigate('studio')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-purple-500/25 text-purple-200 hover:text-white font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Clapperboard className="w-4 h-4 text-purple-400" />
                <span>Explore the Studio</span>
              </button>
            </div>
          </div>

          {/* Hero Visual Preview - Interactive Canvas Fantasy Environment */}
          <div className="relative max-w-5xl mx-auto rounded-3xl p-1.5 sm:p-2.5 bg-gradient-to-b from-purple-500/30 via-purple-900/10 to-transparent border border-purple-500/25 shadow-2xl shadow-purple-950/80">
            <div className="relative rounded-[22px] overflow-hidden bg-[#0a0518]">
              {/* Top bar indicators */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#12082b] border-b border-purple-500/15">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/70" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/70" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
                  </div>
                  <span className="text-xs text-slate-400 ml-2 font-mono">
                    Scene: Twilight Forest of Butterflies & Glowing Waterfalls
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Live Engine
                  </span>
                </div>
              </div>

              {/* Real Procedural Preview Component */}
              <div className="p-2 sm:p-4">
                <CanvasPreview
                  styleId="3d_cinematic"
                  aspectRatio="16:9"
                  motionIntensity="high"
                  title="Enchanted Fantasy Sanctum"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Feature Cards Section */}
      <section id="features" className="py-20 relative border-t border-purple-500/10 bg-[#0a061c]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-purple-400 tracking-wider uppercase mb-2">
              End-To-End Creativity
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              Everything You Need To Produce Visual Magic
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1: Multi-Style Studio */}
            <div className="group rounded-3xl p-8 bg-[#130b2c]/70 border border-purple-500/20 hover:border-purple-400/40 shadow-xl shadow-purple-950/20 transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
                <Palette className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Multi-Style Studio</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Create content in 3D Cinematic, Anime, Cyberpunk, Stop-Motion, Photorealistic,
                and Pixel Art styles with custom lighting, camera paths, and rendering presets.
              </p>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-500/15">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-purple-950/80 text-purple-300 border border-purple-500/20">
                  Unreal 5
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-pink-950/80 text-pink-300 border border-pink-500/20">
                  Makoto Shinkai
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-500/20">
                  Cyberpunk
                </span>
              </div>
            </div>

            {/* Card 2: AI Voice Generation */}
            <div className="group rounded-3xl p-8 bg-[#130b2c]/70 border border-purple-500/20 hover:border-cyan-400/40 shadow-xl shadow-purple-950/20 transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-cyan-600/30 group-hover:scale-105 transition-transform">
                <Mic className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Voice Generation</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Transform scripts into expressive voiceovers using supported AI speech services.
                Direct vocal personas like Zephyr, Puck, and Kore with tailored emotional nuances.
              </p>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-500/15">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-purple-950/80 text-purple-300 border border-purple-500/20">
                  Zephyr (Deep)
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-500/20">
                  Puck (Lively)
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/20">
                  Kore (Warm)
                </span>
              </div>
            </div>

            {/* Card 3: Secure Cloud Projects */}
            <div className="group rounded-3xl p-8 bg-[#130b2c]/70 border border-purple-500/20 hover:border-pink-400/40 shadow-xl shadow-purple-950/20 transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-pink-600/30 group-hover:scale-105 transition-transform">
                <FolderKanban className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Secure Cloud Projects</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Save creations, organize projects, and access generation history from your account.
                Seamlessly resume drafts, duplicate settings, and export production-ready assets.
              </p>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-500/15">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-purple-950/80 text-purple-300 border border-purple-500/20">
                  Persistent DB
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-500/20">
                  Prompt History
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-500/20">
                  Private Storage
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Creative Styles Interactive Showcase */}
      <section id="styles" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-xs font-semibold text-purple-400 tracking-wider uppercase mb-2">
                Aesthetic Matrix
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">
                Featured Creative Styles
              </p>
            </div>
            <p className="text-sm text-slate-400 max-w-md mt-2 md:mt-0">
              Select an aesthetic to inspect its visual character and preview how prompt enhancement enriches the scene.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ART_STYLES.map((style) => {
              const isSelected = selectedStyleId === style.id;
              return (
                <div
                  key={style.id}
                  onClick={() => setSelectedStyleId(style.id)}
                  className={`group relative rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 ${
                    isSelected
                      ? 'border-purple-400 ring-2 ring-purple-500/40 shadow-xl shadow-purple-900/50'
                      : 'border-purple-500/20 hover:border-purple-400/50 bg-[#120a2a]/60'
                  }`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={style.thumbnailUrl}
                      alt={style.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0724] via-[#0e0724]/60 to-transparent" />
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-bold text-white bg-gradient-to-r ${style.badgeColor} shadow-md`}
                    >
                      {style.tagline}
                    </span>
                  </div>

                  <div className="p-5 bg-[#0e0724]">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                        {style.name}
                      </h4>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                          <Check className="w-3 h-3" /> Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {style.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => onNavigate('studio')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-sm font-semibold transition-all"
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              Launch Studio with {ART_STYLES.find((s) => s.id === selectedStyleId)?.name}
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 relative bg-[#0b061e]/70 border-y border-purple-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-purple-400 tracking-wider uppercase mb-2">
              Workflow
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              How AnimAI Studio Works
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Describe Your Scene',
                desc: 'Enter your natural language prompt. Use AI Enhance powered by Gemini 3.8 Flash to automatically inject cinematic camera angles and volumetric lighting.',
              },
              {
                step: '02',
                title: 'Select Visual Style',
                desc: 'Choose from 6 visual aesthetics including 3D Cinematic, Cyberpunk, and 2D Anime to set the tone, materials, and color palette.',
              },
              {
                step: '03',
                title: 'Preview & Synthesize',
                desc: 'Run the real-time procedural canvas preview engine with particle physics and generate high-resolution AI visual media.',
              },
              {
                step: '04',
                title: 'Add Voice & Export',
                desc: 'Generate expressive character voiceovers, organize your creation in your persistent cloud library, and download the finished media.',
              },
            ].map((item, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl bg-[#140b2f]/60 border border-purple-500/15">
                <span className="text-3xl font-extrabold text-purple-500/30 font-mono mb-4 block">
                  {item.step}
                </span>
                <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-purple-400 tracking-wider uppercase mb-2">
              Plans & Access
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              Flexible Tiers for Every Creator
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="rounded-3xl p-8 bg-[#120a2a]/80 border border-purple-500/20 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Free Starter</span>
                <div className="text-3xl font-extrabold text-white mt-3 mb-2">$0</div>
                <p className="text-xs text-slate-400 mb-6">Perfect for testing prompts and procedural canvas animations.</p>

                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Gemini Flash Prompt Enhancement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Interactive Procedural Canvas Engine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>All 6 Art Styles Unlocked</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>5 Active Cloud Projects</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => (isAuthenticated ? onNavigate('studio') : openAuthModal('register'))}
                className="mt-8 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-purple-500/30 text-purple-200 text-xs font-semibold transition-all"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro Creator (Featured) */}
            <div className="rounded-3xl p-8 bg-gradient-to-b from-[#221047] to-[#120929] border-2 border-purple-400 shadow-2xl shadow-purple-900/40 relative flex flex-col justify-between">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-[10px] font-bold text-white uppercase tracking-wider shadow-md">
                Most Popular
              </div>

              <div>
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Pro Creator</span>
                <div className="text-3xl font-extrabold text-white mt-3 mb-2">
                  $24 <span className="text-xs font-normal text-slate-400">/month</span>
                </div>
                <p className="text-xs text-slate-300 mb-6">For independent animators, directors, and digital creators.</p>

                <ul className="space-y-3 text-xs text-slate-200">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Unlimited AI Prompt Enhancements</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Gemini TTS Expressive Voice Generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Unlimited Cloud Project Storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>High-Resolution Media Exports</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => (isAuthenticated ? onNavigate('studio') : openAuthModal('register'))}
                className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
              >
                Upgrade to Pro
              </button>
            </div>

            {/* Studio Team */}
            <div className="rounded-3xl p-8 bg-[#120a2a]/80 border border-purple-500/20 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Studio Team</span>
                <div className="text-3xl font-extrabold text-white mt-3 mb-2">
                  $79 <span className="text-xs font-normal text-slate-400">/month</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">Designed for creative agencies, production houses, and teams.</p>

                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Everything in Pro Creator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Priority Generation Queues</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Team Collaboration & Shared Projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Dedicated API Integrations & Webhooks</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => (isAuthenticated ? onNavigate('studio') : openAuthModal('register'))}
                className="mt-8 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-purple-500/30 text-purple-200 text-xs font-semibold transition-all"
              >
                Contact Studio Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 relative bg-[#0a051a]/80 border-t border-purple-500/15">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-xs font-semibold text-purple-400 tracking-wider uppercase mb-2">
              Common Questions
            </h2>
            <p className="text-3xl font-extrabold text-white">Frequently Asked Questions</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-[#140b2f]/60 border border-purple-500/15 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-semibold text-sm sm:text-base text-white">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-purple-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-purple-500/10 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#06030e] border-t border-purple-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-white">AnimAI Studio</span>
              <p className="text-[11px] text-slate-400">Imagine It. Animate It. Bring It to Life.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <button onClick={() => onNavigate('studio')} className="hover:text-purple-300">
              Creative Studio
            </button>
            <button onClick={() => onNavigate('voice')} className="hover:text-purple-300">
              AI Voice
            </button>
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer">Documentation</span>
          </div>

          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} AnimAI Studio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
