// components/UGC/stages/ScriptReviewPanel.tsx
// Industrial Theme Script Review Panel with Orange Accents

import React from 'react';
import { useUGCStore } from '../../../store/ugcStore';
import Button from '../common/Button';

const ScriptReviewPanel: React.FC = () => {
  const store = useUGCStore();

  if (!store.currentProject?.generatedContent.script) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-zinc-700/50 rounded-xl flex items-center justify-center">
          <span className="text-3xl text-zinc-500">📝</span>
        </div>
        <p className="text-zinc-400">No script generated yet</p>
      </div>
    );
  }

  const script = store.currentProject.generatedContent.script;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-700/50 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                📝
              </span>
              {script.title}
            </h2>
            <p className="text-zinc-400 mt-2 ml-13">
              Review and approve the AI-generated script
            </p>
          </div>
          
          {/* Duration Badge */}
          <div className="flex items-center gap-2 bg-zinc-700/30 px-4 py-2 rounded-xl border border-zinc-600/50">
            <span className="text-orange-400">⏱️</span>
            <span className="text-white font-mono font-bold">
              {Math.floor(script.duration / 60)}:{String(script.duration % 60).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Scenes Container */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Scene Breakdown</span>
          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-mono rounded border border-orange-500/30">
            {script.scenes.length} SCENES
          </span>
        </div>
        
        {script.scenes.map((scene, index) => (
          <div
            key={scene.sceneNumber}
            className="bg-zinc-700/20 rounded-xl border border-zinc-600/50 overflow-hidden hover:border-orange-500/30 transition-colors"
          >
            {/* Scene Header */}
            <div className="flex items-center gap-4 p-4 bg-zinc-700/30 border-b border-zinc-600/50">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
                {scene.sceneNumber}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">{scene.setting}</h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">SCENE {scene.sceneNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-green-400 font-mono">READY</span>
              </div>
            </div>
            
            {/* Scene Content */}
            <div className="p-4 space-y-4">
              {/* Action */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-orange-400 text-sm">🎬</span>
                  <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">Action</span>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed pl-6 border-l-2 border-orange-500/30">
                  {scene.action}
                </p>
              </div>
              
              {/* Dialogue */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-sm">💬</span>
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Dialogue</span>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed pl-6 border-l-2 border-amber-500/30 italic">
                  "{scene.dialogue}"
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Script Statistics */}
      <div className="bg-zinc-700/20 rounded-xl p-4 border border-zinc-600/50">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Script Analysis</span>
        </div>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-lg bg-zinc-700/30 border border-zinc-600/50">
            <div className="text-2xl font-bold text-orange-400">{script.scenes.length}</div>
            <div className="text-xs text-zinc-400 uppercase">Scenes</div>
          </div>
          <div className="p-3 rounded-lg bg-zinc-700/30 border border-zinc-600/50">
            <div className="text-2xl font-bold text-amber-400">
              {Math.floor(script.duration / 60)}:{String(script.duration % 60).padStart(2, '0')}
            </div>
            <div className="text-xs text-zinc-400 uppercase">Duration</div>
          </div>
          <div className="p-3 rounded-lg bg-zinc-700/30 border border-zinc-600/50">
            <div className="text-2xl font-bold text-yellow-400">
              {script.scenes.filter(s => s.dialogue).length}
            </div>
            <div className="text-xs text-zinc-400 uppercase">Dialogues</div>
          </div>
          <div className="p-3 rounded-lg bg-zinc-700/30 border border-zinc-600/50">
            <div className="text-2xl font-bold text-green-400">✓</div>
            <div className="text-xs text-zinc-400 uppercase">AI Generated</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pt-6 border-t border-zinc-700/50">
        <Button
          variant="secondary"
          onClick={() => store.setCurrentStage('INPUT')}
          icon={<span>←</span>}
        >
          Back to Assets
        </Button>
        <Button 
          onClick={() => store.setCurrentStage('PROMPTING')}
          icon={<span>⚡</span>}
        >
          Approve & Continue
        </Button>
      </div>
    </div>
  );
};

export default ScriptReviewPanel;
