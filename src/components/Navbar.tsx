import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Clapperboard,
  Mic,
  FolderKanban,
  History,
  Settings,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Layers,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'dashboard' | 'studio' | 'voice' | 'projects' | 'history' | 'settings';
  onNavigate: (view: 'landing' | 'dashboard' | 'studio' | 'voice' | 'projects' | 'history' | 'settings') => void;
  onScrollToSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onScrollToSection }) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return 'AI';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleNavClick = (view: 'landing' | 'dashboard' | 'studio' | 'voice' | 'projects' | 'history' | 'settings') => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  const handleSectionClick = (sectionId: string) => {
    if (currentView !== 'landing') {
      onNavigate('landing');
      setTimeout(() => {
        onScrollToSection?.(sectionId);
      }, 100);
    } else {
      onScrollToSection?.(sectionId);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-purple-500/15 bg-[#080514]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-purple-600/30 group-hover:shadow-purple-500/50 transition-all">
            <div className="w-full h-full bg-[#0d0720] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-300 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-purple-200 transition-colors">
              AnimAI<span className="text-purple-400">Studio</span>
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {currentView === 'landing' ? (
            <>
              <button
                onClick={() => handleSectionClick('hero')}
                className="px-3 py-1.5 text-xs lg:text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => handleSectionClick('features')}
                className="px-3 py-1.5 text-xs lg:text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => handleSectionClick('styles')}
                className="px-3 py-1.5 text-xs lg:text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                Explore Styles
              </button>
              <button
                onClick={() => handleSectionClick('pricing')}
                className="px-3 py-1.5 text-xs lg:text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                Pricing
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'text-purple-300 bg-purple-500/15 border border-purple-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Dashboard
              </button>
            </>
          )}

          <button
            onClick={() => handleNavClick('studio')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView === 'studio'
                ? 'text-purple-300 bg-purple-500/15 border border-purple-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clapperboard className="w-3.5 h-3.5 text-purple-400" />
            Animation Studio
          </button>

          <button
            onClick={() => handleNavClick('voice')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView === 'voice'
                ? 'text-purple-300 bg-purple-500/15 border border-purple-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            AI Voice
          </button>

          {isAuthenticated && (
            <>
              <button
                onClick={() => handleNavClick('projects')}
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'projects'
                    ? 'text-purple-300 bg-purple-500/15 border border-purple-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5 text-pink-400" />
                My Projects
              </button>

              <button
                onClick={() => handleNavClick('history')}
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'history'
                    ? 'text-purple-300 bg-purple-500/15 border border-purple-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <History className="w-3.5 h-3.5 text-amber-400" />
                History
              </button>
            </>
          )}
        </nav>

        {/* Auth / Action Area */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 hover:border-purple-400/50 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {getInitials(user.name)}
                </div>
                <div className="hidden sm:block text-xs">
                  <div className="font-semibold text-white leading-tight truncate max-w-[110px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-purple-300 capitalize">{user.tier} Plan</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#160d33] border border-purple-500/25 shadow-2xl py-2 z-20">
                    <div className="px-4 py-2 border-b border-purple-500/15">
                      <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleNavClick('dashboard');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                      >
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleNavClick('projects');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                      >
                        <FolderKanban className="w-3.5 h-3.5 text-pink-400" />
                        My Projects
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleNavClick('settings');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        Account Settings
                      </button>
                    </div>

                    <div className="pt-1 border-t border-purple-500/15">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-red-300 hover:text-red-200 hover:bg-red-500/10 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-400" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('signin')}
                className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Get Started Free</span>
              </button>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-purple-500/15 bg-[#0e0824] px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => handleNavClick('landing')}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-purple-600/15"
          >
            Home Landing
          </button>
          <button
            onClick={() => handleNavClick('studio')}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-purple-300 hover:bg-purple-600/15 flex items-center gap-2"
          >
            <Clapperboard className="w-4 h-4 text-purple-400" />
            Animation Studio
          </button>
          <button
            onClick={() => handleNavClick('voice')}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-cyan-300 hover:bg-purple-600/15 flex items-center gap-2"
          >
            <Mic className="w-4 h-4 text-cyan-400" />
            AI Voice Studio
          </button>
          {isAuthenticated && (
            <>
              <button
                onClick={() => handleNavClick('dashboard')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-purple-600/15"
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavClick('projects')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-purple-600/15 flex items-center gap-2"
              >
                <FolderKanban className="w-4 h-4 text-pink-400" />
                My Projects
              </button>
              <button
                onClick={() => handleNavClick('history')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-purple-600/15 flex items-center gap-2"
              >
                <History className="w-4 h-4 text-amber-400" />
                Generation History
              </button>
              <button
                onClick={() => handleNavClick('settings')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-purple-600/15 flex items-center gap-2"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Account Settings
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
