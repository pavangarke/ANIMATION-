import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Search,
  Plus,
  Play,
  Copy,
  Trash2,
  Edit2,
  Download,
  ExternalLink,
  Film,
  Image as ImageIcon,
  Mic,
  Clock,
  Sparkles,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Project, OutputType, ArtStyleId } from '../../types';
import {
  apiGetProjects,
  apiDeleteProject,
  apiDuplicateProject,
  apiUpdateProject,
} from '../../services/api';
import { ART_STYLES } from '../../data/presets';
import { useAuth } from '../../context/AuthContext';

interface MyProjectsProps {
  onOpenInStudio: (prompt: string, styleId: ArtStyleId, outputType: OutputType) => void;
  onCreateNew: () => void;
}

export const MyProjects: React.FC<MyProjectsProps> = ({ onOpenInStudio, onCreateNew }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Rename modal state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newTitle, setNewTitle] = useState('');
  // Delete confirm state
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  // Video player modal state
  const [previewVideo, setPreviewVideo] = useState<{ url: string; title: string } | null>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await apiGetProjects();
      setProjects(res.projects);
    } catch (err) {
      console.warn('Failed to fetch projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const handleDuplicate = async (id: string) => {
    try {
      const res = await apiDuplicateProject(id);
      setProjects([res.project, ...projects]);
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate project.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
      setDeletingProjectId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete project.');
    }
  };

  const handleSaveRename = async () => {
    if (!editingProject || !newTitle.trim()) return;
    try {
      const res = await apiUpdateProject(editingProject.id, { title: newTitle.trim() });
      setProjects(projects.map((p) => (p.id === editingProject.id ? res.project : p)));
      setEditingProject(null);
    } catch (err: any) {
      alert(err.message || 'Failed to rename project.');
    }
  };

  // Filter and sort
  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.prompt.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (filterType === 'all') return true;
      if (filterType === 'video') return project.outputType === 'video' && !project.voicePersona;
      if (filterType === 'image') return project.outputType === 'image';
      if (filterType === 'voice') return !!project.voicePersona;
      if (filterType === 'draft') return project.isDraft;
      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto mb-4 shadow-xl">
          <FolderKanban className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Your Private Library</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          Sign in or create an account to view, organize, and manage your saved animation projects and cloud media assets.
        </p>
        <button
          onClick={() => openAuthModal('signin')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-purple-600/30 cursor-pointer"
        >
          Sign In to View Projects
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Cloud Library
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Creative Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your persistent animation drafts, high-res renders, and voiceover compositions.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects by prompt or title..."
            className="w-full bg-[#130b2c] border border-purple-500/20 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'video', label: 'Videos' },
            { id: 'image', label: 'Images' },
            { id: 'voice', label: 'Voiceovers' },
            { id: 'draft', label: 'Drafts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filterType === tab.id
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="ml-2 bg-[#130b2c] border border-purple-500/20 text-xs text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-3xl p-12 text-center bg-[#100924]/60 border border-purple-500/15">
          <FolderKanban className="w-12 h-12 text-purple-400/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No projects found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
            {searchTerm
              ? 'No projects match your search keywords. Try adjusting your query.'
              : 'You have not created any projects in this category yet.'}
          </p>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            Create Your First Animation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const style = ART_STYLES.find((s) => s.id === project.styleId);
            return (
              <div
                key={project.id}
                className="group rounded-2xl overflow-hidden bg-[#120a28]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all hover:-translate-y-1 shadow-xl shadow-purple-950/20 flex flex-col justify-between"
              >
                {/* Media Preview Box */}
                <div className="relative h-44 overflow-hidden bg-black/60">
                  <img
                    src={project.thumbnailUrl || project.mediaUrl || style?.thumbnailUrl}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120a28] via-transparent to-black/40" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 backdrop-blur-md text-white flex items-center gap-1">
                      {project.voicePersona ? (
                        <Mic className="w-3 h-3 text-cyan-400" />
                      ) : project.outputType === 'image' ? (
                        <ImageIcon className="w-3 h-3 text-pink-400" />
                      ) : (
                        <Film className="w-3 h-3 text-purple-400" />
                      )}
                      <span className="uppercase">{project.outputType}</span>
                    </span>
                  </div>

                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-500/30">
                    {style?.name || 'Cinematic'}
                  </span>
                </div>

                {/* Content Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1 mb-1">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                      {project.prompt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-purple-500/15">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>

                    <span className="font-mono text-purple-300">{project.aspectRatio}</span>
                  </div>
                </div>

                {/* Actions Bottom Bar */}
                <div className="px-4 py-2.5 bg-[#0f0722] border-t border-purple-500/15 flex items-center justify-between">
                  <button
                    onClick={() => onOpenInStudio(project.prompt, project.styleId, project.outputType)}
                    className="text-xs font-semibold text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Open in Studio</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingProject(project);
                        setNewTitle(project.title);
                      }}
                      title="Rename Project"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDuplicate(project.id)}
                      title="Duplicate Project Settings"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {project.mediaUrl && (
                      <a
                        href={project.mediaUrl}
                        download={`animai-project-${project.id}.${project.outputType === 'video' ? 'mp4' : 'png'}`}
                        title={project.outputType === 'video' ? 'Download Video (MP4)' : 'Download Image (PNG)'}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      onClick={() => setDeletingProjectId(project.id)}
                      title="Delete Project"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Player Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-3xl rounded-2xl bg-[#140b2f] border border-purple-500/30 p-5 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white truncate max-w-md">
                🎬 {previewVideo.title}
              </h3>
              <button
                onClick={() => setPreviewVideo(null)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white"
              >
                Close
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black aspect-video border border-purple-500/20">
              <video
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-contain"
                src={previewVideo.url}
              />
            </div>
            <div className="flex justify-between items-center mt-3 text-xs text-slate-400">
              <span>Cinematic Animation Render</span>
              <a
                href={previewVideo.url}
                download={`animai-video-${Date.now()}.mp4`}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download Video (MP4)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#140b2f] border border-purple-500/30 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Rename Project</h3>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-[#1b103e] border border-purple-500/25 rounded-xl p-2.5 text-xs text-white mb-4 focus:outline-none focus:border-purple-400"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingProject(null)}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRename}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#140b2f] border border-red-500/30 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Delete Project?</h3>
            <p className="text-xs text-slate-400 mb-5">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletingProjectId(null)}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingProjectId)}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
