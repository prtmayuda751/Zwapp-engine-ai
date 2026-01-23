// components/UGC/common/ProgressBar.tsx

import React from 'react';
import { WorkflowStage } from '../../../types/ugc';

interface ProgressBarProps {
  currentStage: WorkflowStage;
}

const stageOrder: WorkflowStage[] = [
  'INPUT',
  'ANALYSIS',
  'SCRIPTING',
  'PROMPTING',
  'GENERATING',
  'QA',
  'VIDEO_GENERATION',
  'COMPLETE',
];

const stageLabels: Record<WorkflowStage, string> = {
  INPUT: 'Upload Assets',
  ANALYSIS: 'Analyzing',
  SCRIPTING: 'Script Review',
  PROMPTING: 'Prompt Engineer',
  GENERATING: 'Image Gallery',
  QA: 'Quality Check',
  VIDEO_GENERATION: 'Video Gen',
  COMPLETE: 'Complete',
};

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStage }) => {
  const currentIndex = stageOrder.indexOf(currentStage);
  const progress = ((currentIndex + 1) / stageOrder.length) * 100;

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage indicators */}
      <div className="flex justify-between text-xs font-semibold">
        {stageOrder.map((stage, index) => (
          <div
            key={stage}
            className={`flex flex-col items-center ${
              index <= currentIndex ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs mb-1 ${
                index <= currentIndex
                  ? 'bg-blue-600'
                  : 'bg-gray-300'
              }`}
            >
              {index < currentIndex ? '✓' : index + 1}
            </div>
            <span className="hidden sm:inline text-center">
              {stageLabels[stage]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
