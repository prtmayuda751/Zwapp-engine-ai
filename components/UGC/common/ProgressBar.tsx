// components/UGC/common/ProgressBar.tsx
// Industrial Theme Progress Bar with Orange Accents

import React from 'react';
import { WorkflowStage } from '../../../types/ugc';

interface ProgressBarProps {
  stage: WorkflowStage;
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
  INPUT: 'Assets',
  ANALYSIS: 'Analyze',
  SCRIPTING: 'Script',
  PROMPTING: 'Prompts',
  GENERATING: 'Generate',
  QA: 'Quality',
  VIDEO_GENERATION: 'Video',
  COMPLETE: 'Deploy',
};

const stageIcons: Record<WorkflowStage, string> = {
  INPUT: '📥',
  ANALYSIS: '🔬',
  SCRIPTING: '📝',
  PROMPTING: '⚡',
  GENERATING: '🎨',
  QA: '✅',
  VIDEO_GENERATION: '🎬',
  COMPLETE: '🚀',
};

const ProgressBar: React.FC<ProgressBarProps> = ({ stage }) => {
  const currentIndex = stageOrder.indexOf(stage);
  const progress = ((currentIndex + 1) / stageOrder.length) * 100;

  return (
    <div className="space-y-4">
      {/* Industrial Progress Bar */}
      <div className="relative">
        {/* Background Track */}
        <div className="w-full bg-zinc-700/50 rounded-full h-3 overflow-hidden border border-zinc-600/50">
          {/* Animated Progress Fill */}
          <div
            className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #ea580c, #f59e0b, #ea580c)'
            }}
          >
            {/* Animated Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>
        </div>
        
        {/* Progress Percentage */}
        <div className="absolute -top-1 right-0 bg-zinc-800 px-2 py-0.5 rounded text-xs font-mono text-orange-400 border border-zinc-700">
          {Math.round(progress)}%
        </div>
      </div>

      {/* Stage Indicators */}
      <div className="flex justify-between relative">
        {/* Connecting Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-zinc-700 -z-10" />
        
        {stageOrder.map((stg, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;
          
          return (
            <div
              key={stg}
              className="flex flex-col items-center relative"
            >
              {/* Stage Node */}
              <div
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 border-2
                  ${isCompleted 
                    ? 'bg-gradient-to-br from-orange-500 to-amber-600 border-orange-400 text-white shadow-lg shadow-orange-500/30' 
                    : isCurrent 
                      ? 'bg-zinc-800 border-orange-500 text-orange-400 shadow-lg shadow-orange-500/20 animate-pulse' 
                      : 'bg-zinc-800/50 border-zinc-600 text-zinc-500'
                  }
                `}
              >
                {isCompleted ? '✓' : stageIcons[stg]}
              </div>
              
              {/* Stage Label */}
              <span className={`
                hidden sm:inline text-xs font-semibold mt-2 uppercase tracking-wider
                ${isCompleted 
                  ? 'text-orange-400' 
                  : isCurrent 
                    ? 'text-orange-500' 
                    : 'text-zinc-500'
                }
              `}>
                {stageLabels[stg]}
              </span>
              
              {/* Current Stage Indicator */}
              {isCurrent && (
                <div className="absolute -bottom-1 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
