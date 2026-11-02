import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  Search,
  Trash2,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Film,
  Image as ImageIcon,
  Mic,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { HistoryItem, ArtStyleId, OutputType } from '../../types';
import { apiGetHistory, apiDeleteHistoryItem, apiClearHistory } from '../../services/api';
import { ART_STYLES } from '../../data/presets';
import { useAuth } from '../../context/AuthContext';

interface GenerationHistoryProps {
  onReuseSettings: (prompt: string, styleId?: ArtStyleId, outputType?: OutputType) => void;
}

export const GenerationHistory: React.FC<GenerationHistoryProps> = ({ onReuseSettings }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{ url: string; isVideo: boolean; title: string } | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await apiGetHistory();
      setHistory(res.history);
    } catch (err) {
      console.warn('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const handleDeleteItem = async (id: string) => {
    try {
      await apiDeleteHistoryItem(id);
      setHistory(history.filter((h) => h.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete record.');
    }
  };

  const handleClearAll = async () => {
    try {
      await apiClearHistory();
      setHistory([]);
      setShowClearConfirm(false);
    } catch (err: any) {
      alert(err.message || 'Failed to clear history.');
    }
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.enhancedPrompt && item.enhancedPrompt.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'all') return true;
    if (filterType === 'video') return item.type === 'video';
    if (filterType === 'image') return item.type === 'image';
    if (filterType === 'voiceover') return item.type === 'voiceover';
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto mb-4 shadow-xl">
          <HistoryIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Persistent Generation History</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          Sign in to review and reuse your past prompts, camera directions, vocal scripts, and AI synthesis history.
        </p>
        <button
          onClick={() => openAuthModal('signin')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-purple-600/30 cursor-pointer"
        >
          Sign In to Access History
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <HistoryIcon className="w-3 h-3 text-amber-400" />
              Activity Audit Log
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Generation History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Every prompt enhanced, video rendered, and voice synthesized is recorded here for inspection and reuse.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/30 text-xs font-semibold text-red-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search past prompts or scripts..."
            className="w-full bg-[#130b2c] border border-purple-500/20 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {[
            { id: 'all', label: 'All Activity' },
            { id: 'video', label: 'Videos' },
            { id: 'image', label: 'Images' },
            { id: 'voiceover', label: 'Voiceovers' },
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
        </div>
      </div>

      {/* History List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="rounded-3xl p-12 text-center bg-[#100924]/60 border border-purple-500/15">
          <HistoryIcon className="w-12 h-12 text-purple-400/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No history records found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm
              ? 'No records match your search criteria.'
              : 'As you enhance prompts and generate animations, entries will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => {
            const style = ART_STYLES.find((s) => s.id === item.styleId);
            return (
              <div
                key={item.id}
                className="rounded-2xl p-5 bg-[#120a28]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white flex items-center gap-1 border border-white/10 uppercase">
                      {item.type === 'voiceover' ? (
                        <Mic className="w-3 h-3 text-cyan-400" />
                      ) : item.type === 'image' ? (
                        <ImageIcon className="w-3 h-3 text-pink-400" />
                      ) : (
                        <Film className="w-3 h-3 text-purple-400" />
                      )}
                      <span>{item.type}</span>
                    </span>

                    {style && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-500/20">
                        {style.name}
                      </span>
                    )}

                    {item.voicePersona && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-500/20">
                        Persona: {item.voicePersona}
                      </span>
                    )}

                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white leading-relaxed">
                      "{item.prompt}"
                    </p>
                    {item.enhancedPrompt && (
                      <p className="text-xs text-purple-300/80 font-serif italic mt-1 line-clamp-2">
                        Enhanced: "{item.enhancedPrompt}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                    <span>Model: {item.model}</span>
                    <span>•</span>
                    <span>{item.settingsSummary}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {item.mediaUrl && (
                    <button
                      onClick={() =>
                        setPreviewMedia({
                          url: item.mediaUrl!,
                          isVideo: item.type === 'video' || item.mediaUrl!.endsWith('.mp4') || item.mediaUrl!.includes('webm'),
                          title: item.prompt,
                        })
                      }
                      className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{item.type === 'video' ? 'Play Video' : 'View Media'}</span>
                    </button>
                  )}

                  <button
                    onClick={() =>
                      onReuseSettings(
                        item.prompt,
                        item.styleId,
                        item.type === 'voiceover' ? 'video' : (item.type as OutputType)
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reuse in Studio</span>
                  </button>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    title="Delete record"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Media Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-3xl rounded-2xl bg-[#140b2f] border border-purple-500/30 p-5 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white truncate max-w-md">
                🎬 {previewMedia.title}
              </h3>
              <button
                onClick={() => setPreviewMedia(null)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white"
              >
                Close
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black aspect-video border border-purple-500/20 flex items-center justify-center">
              {previewMedia.isVideo ? (
                <video
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-contain"
                  src={previewMedia.url}
                />
              ) : (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <div className="flex justify-between items-center mt-3 text-xs text-slate-400">
              <span>{previewMedia.isVideo ? 'Generated Video Asset' : 'Generated Image Asset'}</span>
              <a
                href={previewMedia.url}
                download={`animai-history-${Date.now()}.${previewMedia.isVideo ? 'mp4' : 'png'}`}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download {previewMedia.isVideo ? 'Video (MP4)' : 'Image'}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#140b2f] border border-red-500/30 p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Clear All History?</h3>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              This will permanently delete all records of your past prompt generations and activity.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
