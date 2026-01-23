// components/UGC/UGCOrchestrationWorkspace.tsx
// Industrial Theme with Orange Accents - UGC AI Orchestration

import React, { useState, useEffect } from 'react';
import { useUGCStore } from '../../store/ugcStore';
import { WorkflowStage } from '../../types/ugc';
import InputModule from './stages/InputModule';
import ScriptReviewPanel from './stages/ScriptReviewPanel';
import PromptEngineeringPanel from './stages/PromptEngineeringPanel';
import ImageGalleryView from './stages/ImageGalleryView';
import QAResultsPanel from './stages/QAResultsPanel';
import VideoGenerationPanel from './stages/VideoGenerationPanel';
import ProgressBar from './common/ProgressBar';
import Toast from './common/Toast';

const UGCOrchestrationWorkspace: React.FC = () => {
  const store = useUGCStore();
  const [showNewProjectModal, setShowNewProjectModal] = useState(!store.currentProject);

  if (!store.currentProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-neutral-800 to-stone-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Industrial Grid Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(251, 146, 60, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(251, 146, 60, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Industrial Glow Effect */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl" />
        
        <div className="relative bg-zinc-800/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full border border-zinc-700/50">
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-16 h-1 bg-gradient-to-r from-orange-500 to-transparent rounded-tl-2xl" />
          <div className="absolute top-0 left-0 w-1 h-16 bg-gradient-to-b from-orange-500 to-transparent rounded-tl-2xl" />
          <div className="absolute bottom-0 right-0 w-16 h-1 bg-gradient-to-l from-orange-500 to-transparent rounded-br-2xl" />
          <div className="absolute bottom-0 right-0 w-1 h-16 bg-gradient-to-t from-orange-500 to-transparent rounded-br-2xl" />
          
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 rotate-3 hover:rotate-0 transition-transform duration-300">
              <span className="text-4xl">⚙️</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              UGC <span className="text-orange-500">Factory</span>
            </h1>
            <p className="text-zinc-400 text-sm">
              Industrial-Grade AI Content Generation System
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs text-orange-400 font-mono uppercase tracking-wider">System Online</span>
            </div>
          </div>

          <button
            onClick={() => {
              const userId = localStorage.getItem('userId') || 'anonymous-user';
              store.initializeProject('New UGC Campaign', userId);
              setShowNewProjectModal(false);
            }}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all mb-4 flex items-center justify-center gap-3 group border border-orange-500/30"
          >
            <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">⚡</span>
            Initialize New Project
          </button>

          <button
            onClick={() => {
              // TODO: Implement load project
            }}
            className="w-full border-2 border-zinc-600 text-zinc-300 font-semibold py-4 rounded-xl hover:bg-zinc-700/50 hover:border-orange-500/50 transition-all flex items-center justify-center gap-3 group"
          >
            <span className="w-8 h-8 bg-zinc-700 rounded-lg flex items-center justify-center group-hover:bg-zinc-600 transition-colors">📁</span>
            Load Existing Project
          </button>
          
          {/* Status Bar */}
          <div className="mt-6 pt-4 border-t border-zinc-700/50">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-mono">v2.5.0</span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Industrial Header */}
      <header className="bg-zinc-800/95 backdrop-blur-sm border-b border-zinc-700/50 sticky top-0 z-50 shadow-xl shadow-black/30">
        {/* Top Accent Line */}
        <div className="h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-xl">⚙️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  {store.currentProject.projectName}
                  <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-mono rounded-md border border-orange-500/30">
                    ACTIVE
                  </span>
                </h1>
                <p className="text-sm text-zinc-400 mt-0.5 font-mono">
                  STAGE: <span className="text-orange-400">{store.currentProject.currentStage}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => store.resetProject()}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-orange-400 transition-colors flex items-center gap-2 border border-zinc-700 rounded-lg hover:border-orange-500/50 bg-zinc-800/50"
            >
              <span>←</span> Exit Factory
            </button>
          </div>
          <ProgressBar stage={store.currentProject.currentStage} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-zinc-700/50 p-8 relative overflow-hidden">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(251, 146, 60, 0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(251, 146, 60, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }} />
          </div>
          
          <div className="relative z-10">
            {store.currentProject.currentStage === 'INPUT' && <InputModule />}
            {store.currentProject.currentStage === 'ANALYSIS' && <AnalysisLoading />}
            {store.currentProject.currentStage === 'SCRIPTING' && <ScriptReviewPanel />}
            {store.currentProject.currentStage === 'PROMPTING' && (
              <PromptEngineeringPanel />
            )}
            {store.currentProject.currentStage === 'GENERATING' && <ImageGalleryView />}
            {store.currentProject.currentStage === 'QA' && <QAResultsPanel />}
            {store.currentProject.currentStage === 'VIDEO_GENERATION' && (
              <VideoGenerationPanel />
            )}
            {store.currentProject.currentStage === 'COMPLETE' && <CompleteScreen />}
          </div>
        </div>
      </main>

      {/* Notifications */}
      {store.error && (
        <Toast type="error" message={store.error} />
      )}
      {store.successMessage && (
        <Toast type="success" message={store.successMessage} />
      )}
    </div>
  );
};

const AnalysisLoading: React.FC = () => (
  <div className="text-center py-16">
    <div className="inline-block mb-6">
      <div className="w-20 h-20 border-4 border-zinc-700 border-t-orange-500 rounded-full animate-spin" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">
      Processing Your Assets
    </h3>
    <p className="text-zinc-400 text-sm max-w-md mx-auto">
      Industrial AI engines analyzing model profile, product details, and brand context...
    </p>
    <div className="mt-8 space-y-3 max-w-xs mx-auto">
      <div className="flex items-center gap-3 text-sm bg-zinc-700/30 p-3 rounded-lg border border-zinc-600/50">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-green-400">Model photos analyzed</span>
      </div>
      <div className="flex items-center gap-3 text-sm bg-zinc-700/30 p-3 rounded-lg border border-zinc-600/50">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-green-400">Product photos processed</span>
      </div>
      <div className="flex items-center gap-3 text-sm bg-zinc-700/30 p-3 rounded-lg border border-orange-500/30">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        <span className="text-orange-400">Parsing narrative links...</span>
      </div>
    </div>
  </div>
);

const CompleteScreen: React.FC = () => {
  const store = useUGCStore();
  
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
        <span className="text-5xl">✓</span>
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">
        Production <span className="text-orange-500">Complete!</span>
      </h3>
      <p className="text-zinc-400 mb-8">
        Your UGC content has been manufactured and is ready for deployment
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
        <div className="bg-zinc-700/30 p-4 rounded-xl border border-orange-500/30">
          <div className="text-3xl font-bold text-orange-500">
            {store.currentProject?.generatedContent.images.length || 0}
          </div>
          <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">Images</div>
        </div>
        <div className="bg-zinc-700/30 p-4 rounded-xl border border-amber-500/30">
          <div className="text-3xl font-bold text-amber-500">
            {store.currentProject?.generatedContent.videos.length || 0}
          </div>
          <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">Videos</div>
        </div>
        <div className="bg-zinc-700/30 p-4 rounded-xl border border-yellow-500/30">
          <div className="text-3xl font-bold text-yellow-500">1</div>
          <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">Scripts</div>
        </div>
      </div>

      <button
        onClick={() => store.resetProject()}
        className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all font-bold flex items-center justify-center gap-3 mx-auto"
      >
        <span>⚡</span> Initialize New Production
      </button>
    </div>
  );
};

export default UGCOrchestrationWorkspace;
