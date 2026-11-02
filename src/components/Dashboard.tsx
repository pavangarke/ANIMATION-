import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clapperboard,
  Mic,
  FolderKanban,
  History,
  Settings,
  Plus,
  Play,
  ArrowRight,
  TrendingUp,
  HardDrive,
  Film,
  Image as ImageIcon,
  Clock,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiGetUserStats, apiGetProjects } from '../services/api';
import { Project } from '../types';
import { ART_STYLES } from '../data/presets';

interface DashboardProps {
  onNavigate: (view: 'landing' | 'dashboard' | 'studio' | 'voice' | 'projects' | 'history' | 'settings') => void;
  onOpenInStudio: (prompt: string, styleId?: any, outputType?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenInStudio }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedGenerations: 0,
    videoCount: 0,
    imageCount: 0,
    voiceCount: 0,
    tier: 'Pro',
    storageUsedMb: '0.0',
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsData, projectsData] = await Promise.all([
          apiGetUserStats().catch(() => null),
          apiGetProjects().catch(() => ({ projects: [] })),
        ]);

        if (statsData) setStats(statsData);
        if (projectsData) setRecentProjects(projectsData.projects.slice(0, 4));
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-[#1e0e45] via-[#140a33] to-[#0c061e] border border-purple-500/25 shadow-2xl mb-8">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-40 h-40 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Creator Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-purple-300">{user?.name || 'Creator'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your intelligent AI animation workbench is ready. Explore cinematic styles,
              fine-tune prompt enhancements, and generate expressive voiceovers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('studio')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-xl shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project</span>
            </button>

            <button
              onClick={() => onNavigate('voice')}
              className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-purple-500/25 text-purple-200 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Mic className="w-4 h-4 text-cyan-400" />
              <span>Launch AI Voice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Projects',
            value: stats.totalProjects,
            icon: FolderKanban,
            color: 'text-purple-400',
            bg: 'bg-purple-950/60',
          },
          {
            label: 'Generations',
            value: stats.completedGenerations,
            icon: Sparkles,
            color: 'text-pink-400',
            bg: 'bg-pink-950/60',
          },
          {
            label: 'Video Animations',
            value: stats.videoCount,
            icon: Film,
            color: 'text-cyan-400',
            bg: 'bg-cyan-950/60',
          },
          {
            label: 'Cloud Storage',
            value: `${stats.storageUsedMb} MB`,
            icon: HardDrive,
            color: 'text-amber-400',
            bg: 'bg-amber-950/60',
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl p-4 bg-[#120a28]/80 border border-purple-500/15 shadow-md flex items-center justify-between"
            >
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                  {item.label}
                </p>
                <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                  {item.value}
                </div>
              </div>
              <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card 1: Animation Studio Quick Access */}
        <div
          onClick={() => onNavigate('studio')}
          className="group rounded-2xl p-6 bg-gradient-to-br from-[#160d36] to-[#0f0724] border border-purple-500/20 hover:border-purple-400/50 shadow-xl cursor-pointer transition-all hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
              <Clapperboard className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Animation & Video Studio</h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Direct scenes with Gemini Flash AI prompt enhancement, choose from 6 cinematic aesthetics,
            and run real-time procedural canvas animations.
          </p>
          <span className="text-xs font-semibold text-purple-400 flex items-center gap-1">
            Open Studio <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Card 2: AI Voice Studio Quick Access */}
        <div
          onClick={() => onNavigate('voice')}
          className="group rounded-2xl p-6 bg-gradient-to-br from-[#160d36] to-[#0f0724] border border-purple-500/20 hover:border-cyan-400/50 shadow-xl cursor-pointer transition-all hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/30 border border-cyan-400/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">AI Voice Studio</h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Synthesize vocal performances with Zephyr, Puck, and Kore. Customize speech rate and
            pitch depth for seamless animation pairing.
          </p>
          <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
            Open Voice Studio <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="rounded-2xl p-6 bg-[#120a28]/80 border border-purple-500/15 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Projects</h2>
            <p className="text-xs text-slate-400">Jump right back into your creative workflow.</p>
          </div>

          <button
            onClick={() => onNavigate('projects')}
            className="text-xs font-semibold text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({stats.totalProjects})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentProjects.length === 0 ? (
          <div className="p-8 text-center bg-[#0d0720] rounded-xl border border-purple-500/10">
            <FolderKanban className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400 mb-3">No active projects created yet.</p>
            <button
              onClick={() => onNavigate('studio')}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentProjects.map((project) => {
              const style = ART_STYLES.find((s) => s.id === project.styleId);
              return (
                <div
                  key={project.id}
                  onClick={() => onOpenInStudio(project.prompt, project.styleId, project.outputType)}
                  className="group rounded-xl overflow-hidden bg-[#160d33]/50 border border-purple-500/20 hover:border-purple-400/40 p-3 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <div className="relative h-28 rounded-lg overflow-hidden mb-2.5 bg-black">
                    <img
                      src={project.thumbnailUrl || project.mediaUrl || style?.thumbnailUrl}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white drop-shadow">
                      {style?.name}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white truncate mb-1">{project.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{project.prompt}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
