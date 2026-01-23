// components/UGC/stages/ScriptReviewPanel.tsx

import React from 'react';
import { useUGCStore } from '../../../store/ugcStore';
import Button from '../common/Button';

const ScriptReviewPanel: React.FC = () => {
  const store = useUGCStore();

  if (!store.currentProject?.generatedContent.script) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No script generated yet</p>
      </div>
    );
  }

  const script = store.currentProject.generatedContent.script;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {script.title}
        </h2>
        <p className="text-gray-600">
          Duration: {Math.floor(script.duration / 60)}:{String(script.duration % 60).padStart(2, '0')}
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scenes</h3>
        <div className="space-y-4">
          {script.scenes.map((scene) => (
            <div
              key={scene.sceneNumber}
              className="border-l-4 border-blue-500 pl-4 py-2"
            >
              <p className="font-semibold text-gray-900">
                Scene {scene.sceneNumber}: {scene.setting}
              </p>
              <p className="text-sm text-gray-600 mt-1">Action: {scene.action}</p>
              <p className="text-sm text-gray-600">Dialogue: {scene.dialogue}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
        <Button
          variant="secondary"
          onClick={() => store.setCurrentStage('INPUT')}
        >
          Back
        </Button>
        <Button onClick={() => store.setCurrentStage('PROMPTING')}>
          Approve & Continue
        </Button>
      </div>
    </div>
  );
};

export default ScriptReviewPanel;
