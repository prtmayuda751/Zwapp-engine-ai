// components/UGC/UGCOrchestrationWorkspace.tsx

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎨</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              UGC AI Orchestration
            </h1>
            <p className="text-gray-600">
              Create professional UGC content with AI-powered consistency control
            </p>
          </div>

          <button
            onClick={() => {
              const userId = localStorage.getItem('userId') || 'anonymous-user';
              store.initializeProject('New UGC Campaign', userId);
              setShowNewProjectModal(false);
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all mb-4"
          >
            ✨ New Project
          </button>

          <button
            onClick={() => {
              // TODO: Implement load project
            }}
            className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-all"
          >
            📂 Load Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {store.currentProject.projectName}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Stage: {store.currentProject.currentStage}
              </p>
            </div>
            <button
              onClick={() => store.resetProject()}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Projects
            </button>
          </div>
          <ProgressBar stage={store.currentProject.currentStage} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
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
    <div className="inline-block mb-4">
      <div className="animate-spin text-4xl">🔄</div>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">
      Analyzing Your Inputs
    </h3>
    <p className="text-gray-600">
      Extracting model profile, product details, and brand context...
    </p>
    <div className="mt-8 space-y-2 text-sm text-gray-500">
      <p>✓ Analyzing model photos</p>
      <p>✓ Analyzing product photos</p>
      <p>⏳ Parsing narrative links</p>
    </div>
  </div>
);

const CompleteScreen: React.FC = () => {
  const store = useUGCStore();
  
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Project Complete!
      </h3>
      <p className="text-gray-600 mb-8">
        Your UGC content has been generated and is ready for download
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {store.currentProject?.generatedContent.images.length || 0}
          </div>
          <div className="text-sm text-gray-600">Images Generated</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {store.currentProject?.generatedContent.videos.length || 0}
          </div>
          <div className="text-sm text-gray-600">Videos Generated</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">1</div>
          <div className="text-sm text-gray-600">Script Generated</div>
        </div>
      </div>

      <button
        onClick={() => store.resetProject()}
        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
      >
        ✨ Start New Project
      </button>
    </div>
  );
};

export default UGCOrchestrationWorkspace;
