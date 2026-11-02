import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Shield,
  Key,
  Sliders,
  LogOut,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiUpdateProfile } from '../../services/api';

export const AccountSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [defaultRatio, setDefaultRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsUpdating(true);
    setMessage(null);
    try {
      await apiUpdateProfile({ name: name.trim() });
      setMessage('Profile updated successfully.');
    } catch (err: any) {
      setMessage('Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your personal profile, studio preferences, and session security.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-purple-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="rounded-2xl p-6 bg-[#120a28]/80 border border-purple-500/20 shadow-xl">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-purple-400" />
          Profile Details
        </h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#180e36] border border-purple-500/25 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-[#140b2a]/60 border border-purple-500/15 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              {isUpdating ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Plan & Usage Card */}
      <div className="rounded-2xl p-6 bg-[#120a28]/80 border border-purple-500/20 shadow-xl">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Subscription & Usage Limits
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#160d33]/50 border border-purple-500/15">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Active Tier
            </span>
            <span className="text-lg font-bold text-purple-300 capitalize">
              {user?.tier || 'Pro'} Creator Plan
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#160d33]/50 border border-purple-500/15">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Completed Generations
            </span>
            <span className="text-lg font-bold text-white font-mono">
              {user?.generationsCount || 0}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#160d33]/50 border border-purple-500/15">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Cloud Persistence
            </span>
            <span className="text-lg font-bold text-emerald-400">Encrypted Cloud DB</span>
          </div>
        </div>
      </div>

      {/* Studio Preferences */}
      <div className="rounded-2xl p-6 bg-[#120a28]/80 border border-purple-500/20 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          Studio Engine Preferences
        </h2>

        <div className="flex items-center justify-between py-2 border-b border-purple-500/15">
          <div>
            <span className="text-xs font-semibold text-white block">Reduced Motion Mode</span>
            <span className="text-[11px] text-slate-400">
              Lowers particle physics speed and intense canvas flash animations
            </span>
          </div>
          <button
            type="button"
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              reducedMotion ? 'bg-purple-600' : 'bg-white/10'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                reducedMotion ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-xs font-semibold text-white block">Default Aspect Ratio</span>
            <span className="text-[11px] text-slate-400">
              Pre-selected ratio when starting a new canvas scene
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {(['16:9', '9:16', '1:1'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDefaultRatio(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  defaultRatio === r ? 'bg-purple-600 text-white font-bold' : 'bg-white/5 text-slate-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Security & Sign Out */}
      <div className="rounded-2xl p-6 bg-[#120a28]/80 border border-purple-500/20 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-400" />
            Security & Session
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sign out of your active browser session on this device.
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-xs font-semibold text-red-200 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
