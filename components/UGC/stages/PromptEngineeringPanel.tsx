// components/UGC/stages/PromptEngineeringPanel.tsx

import React, { useState } from 'react';
import { useUGCStore } from '../../../store/ugcStore';
import Button from '../common/Button';

const PromptEngineeringPanel: React.FC = () => {
  const store = useUGCStore();
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);

  if (!store.currentProject) return null;

  const prompts = store.currentProject.generatedContent.promptTemplates;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ✨ Prompt Engineering
        </h2>
        <p className="text-gray-600">
          Review and customize AI prompts for image generation
        </p>
      </div>

      {prompts.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-900">
            Prompts will be auto-generated from your script analysis
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedPrompt(
                    expandedPrompt === prompt.id ? null : prompt.id
                  )
                }
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="text-left">
                  <p className="font-semibold text-gray-900">
                    Scene {prompt.sceneNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    {prompt.sceneDescription.substring(0, 100)}...
                  </p>
                </div>
                <span className="text-xl">
                  {expandedPrompt === prompt.id ? '▼' : '▶'}
                </span>
              </button>

              {expandedPrompt === prompt.id && (
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Scene Description
                    </label>
                    <textarea
                      value={prompt.sceneDescription}
                      onChange={(e) =>
                        store.updatePrompt(prompt.id, {
                          sceneDescription: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Visual Style
                    </label>
                    <input
                      type="text"
                      value={prompt.visualStyle}
                      onChange={(e) =>
                        store.updatePrompt(prompt.id, {
                          visualStyle: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Negative Prompts
                    </label>
                    <input
                      type="text"
                      value={prompt.negativePrompts.join(', ')}
                      onChange={(e) =>
                        store.updatePrompt(prompt.id, {
                          negativePrompts: e.target.value.split(',').map((p) => p.trim()),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="separated by commas"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
        <Button
          variant="secondary"
          onClick={() => store.setCurrentStage('SCRIPTING')}
        >
          Back
        </Button>
        <Button onClick={() => store.setCurrentStage('GENERATING')}>
          Generate Images
        </Button>
      </div>
    </div>
  );
};

export default PromptEngineeringPanel;
