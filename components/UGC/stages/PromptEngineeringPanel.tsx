// components/UGC/stages/PromptEngineeringPanel.tsx
// Industrial Theme Prompt Engineering Panel with Orange Accents

import React, { useState } from 'react';
import { useUGCStore } from '../../../store/ugcStore';
import Button from '../common/Button';

const PromptEngineeringPanel: React.FC = () => {
  const store = useUGCStore();
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);

  if (!store.currentProject) return null;

  const prompts = store.currentProject.generatedContent.promptTemplates;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-700/50 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            ⚡
          </span>
          Prompt Engineering Lab
        </h2>
        <p className="text-zinc-400 mt-2 ml-13">
          Fine-tune AI prompts for optimal image generation
        </p>
      </div>

      {prompts.length === 0 ? (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 rounded-xl flex items-center justify-center">
            <span className="text-3xl">⚙️</span>
          </div>
          <p className="text-orange-400 font-semibold mb-2">
            Awaiting Script Analysis
          </p>
          <p className="text-zinc-400 text-sm">
            Prompts will be auto-generated from your approved script
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Prompts Count */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Generated Prompts</span>
            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-mono rounded border border-orange-500/30">
              {prompts.length} TEMPLATES
            </span>
          </div>
          
          {prompts.map((prompt, index) => (
            <div
              key={prompt.id}
              className="bg-zinc-700/20 rounded-xl border border-zinc-600/50 overflow-hidden hover:border-orange-500/30 transition-colors"
            >
              {/* Prompt Header */}
              <button
                onClick={() =>
                  setExpandedPrompt(
                    expandedPrompt === prompt.id ? null : prompt.id
                  )
                }
                className="w-full px-5 py-4 flex items-center gap-4 hover:bg-zinc-700/30 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
                  {prompt.sceneNumber}
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-white">Scene {prompt.sceneNumber}</p>
                  <p className="text-sm text-zinc-400 line-clamp-1">
                    {prompt.sceneDescription.substring(0, 80)}...
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono px-2 py-1 rounded ${
                    expandedPrompt === prompt.id 
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                      : 'bg-zinc-700 text-zinc-400 border border-zinc-600'
                  }`}>
                    {expandedPrompt === prompt.id ? 'EDITING' : 'VIEW'}
                  </span>
                  <span className={`text-xl transition-transform duration-200 ${expandedPrompt === prompt.id ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </button>

              {/* Expanded Content */}
              {expandedPrompt === prompt.id && (
                <div className="border-t border-zinc-600/50 px-5 py-5 bg-zinc-800/30 space-y-5">
                  {/* Scene Description */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-orange-400 uppercase tracking-wider">
                      <span>📝</span> Scene Description
                    </label>
                    <textarea
                      value={prompt.sceneDescription}
                      onChange={(e) =>
                        store.updatePrompt(prompt.id, {
                          sceneDescription: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-zinc-500 font-mono text-sm resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Visual Style */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-amber-400 uppercase tracking-wider">
                      <span>🎨</span> Visual Style
                    </label>
                    <input
                      type="text"
                      value={prompt.visualStyle}
                      onChange={(e) =>
                        store.updatePrompt(prompt.id, {
                          visualStyle: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-zinc-500 font-mono text-sm"
                    />
                  </div>

                  {/* Negative Prompts */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-red-400 uppercase tracking-wider">
                      <span>🚫</span> Negative Prompts
                    </label>
                    <input
                      type="text"
                      value={prompt.negativePrompts.join(', ')}
                      onChange={(e) =>
                        store.updatePrompt(prompt.id, {
                          negativePrompts: e.target.value.split(',').map((p) => p.trim()),
                        })
                      }
                      className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-zinc-500 font-mono text-sm"
                      placeholder="separated by commas"
                    />
                    <p className="text-xs text-zinc-500">
                      These elements will be excluded from generation
                    </p>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    <button className="px-3 py-1.5 bg-zinc-700/50 text-zinc-300 text-xs font-semibold rounded-lg hover:bg-zinc-600/50 transition-colors border border-zinc-600">
                      Reset to Default
                    </button>
                    <button className="px-3 py-1.5 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded-lg hover:bg-orange-500/30 transition-colors border border-orange-500/30">
                      Preview Prompt
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pt-6 border-t border-zinc-700/50">
        <Button
          variant="secondary"
          onClick={() => store.setCurrentStage('SCRIPTING')}
          icon={<span>←</span>}
        >
          Back to Script
        </Button>
        <Button 
          onClick={() => store.setCurrentStage('GENERATING')}
          icon={<span>🎨</span>}
        >
          Generate Images
        </Button>
      </div>
    </div>
  );
};

export default PromptEngineeringPanel;
