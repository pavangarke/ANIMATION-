import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AnimationStudio } from './components/studio/AnimationStudio';
import { VoiceStudio } from './components/voice/VoiceStudio';
import { MyProjects } from './components/projects/MyProjects';
import { GenerationHistory } from './components/history/GenerationHistory';
import { AccountSettings } from './components/settings/AccountSettings';
import { AuthModal } from './components/AuthModal';
import { ArtStyleId, OutputType, Project } from './types';

type ViewMode = 'landing' | 'dashboard' | 'studio' | 'voice' | 'projects' | 'history' | 'settings';

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>('landing');

  // Studio Pre-loaded State (e.g. from reopening a project or reusing history)
  const [studioPrompt, setStudioPrompt] = useState<string>('');
  const [studioStyleId, setStudioStyleId] = useState<ArtStyleId>('3d_cinematic');
  const [studioOutputType, setStudioOutputType] = useState<OutputType>('video');

  const handleNavigate = (view: ViewMode) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenInStudio = (prompt: string, styleId?: ArtStyleId, outputType?: OutputType) => {
    setStudioPrompt(prompt);
    if (styleId) setStudioStyleId(styleId);
    if (outputType) setStudioOutputType(outputType);
    setCurrentView('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateNewInStudio = () => {
    setStudioPrompt('');
    setStudioStyleId('3d_cinematic');
    setStudioOutputType('video');
    setCurrentView('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#080512] text-slate-100 flex flex-col">
      {/* Sticky Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onScrollToSection={handleScrollToSection}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage onNavigate={handleNavigate} />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            onNavigate={handleNavigate}
            onOpenInStudio={handleOpenInStudio}
          />
        )}

        {currentView === 'studio' && (
          <AnimationStudio
            initialPrompt={studioPrompt}
            initialStyleId={studioStyleId}
            initialOutputType={studioOutputType}
            onOpenProjects={() => handleNavigate('projects')}
          />
        )}

        {currentView === 'voice' && (
          <VoiceStudio
            onOpenProjects={() => handleNavigate('projects')}
          />
        )}

        {currentView === 'projects' && (
          <MyProjects
            onOpenInStudio={handleOpenInStudio}
            onCreateNew={handleCreateNewInStudio}
          />
        )}

        {currentView === 'history' && (
          <GenerationHistory
            onReuseSettings={handleOpenInStudio}
          />
        )}

        {currentView === 'settings' && (
          <AccountSettings />
        )}
      </main>

      {/* Global Authentication Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
