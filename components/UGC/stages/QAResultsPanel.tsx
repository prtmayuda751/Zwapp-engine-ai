// components/UGC/stages/QAResultsPanel.tsx
// Industrial Theme QA Results Panel with Orange Accents

import React from 'react';
import { useUGCStore } from '../../../store/ugcStore';
import Button from '../common/Button';

const QAResultsPanel: React.FC = () => {
  const store = useUGCStore();

  if (!store.currentProject) return null;

  const qaResults = store.currentProject.qaResults.imageQA;
  const overallPassRate = store.currentProject.qaResults.overallPassRate;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-700/50 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            ✅
          </span>
          Quality Control Station
        </h2>
        <p className="text-zinc-400 mt-2 ml-13">
          Industrial-grade consistency checks and hallucination detection
        </p>
      </div>

      {/* Overall Pass Rate Dashboard */}
      <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-700/30 rounded-xl border border-zinc-600/50 p-6 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(251, 146, 60, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(251, 146, 60, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }} />
        </div>
        
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Overall Quality Score
            </p>
            <p className="text-5xl font-bold text-white">
              {overallPassRate}
              <span className="text-2xl text-orange-400">%</span>
            </p>
            <p className={`text-sm mt-2 font-semibold ${
              overallPassRate >= 80 ? 'text-green-400' : 
              overallPassRate >= 60 ? 'text-orange-400' : 'text-red-400'
            }`}>
              {overallPassRate >= 80 ? '✓ Excellent Quality' : 
               overallPassRate >= 60 ? '⚠ Acceptable Quality' : '✕ Needs Improvement'}
            </p>
          </div>
          
          {/* Circular Progress */}
          <div className="w-32 h-32 relative">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-zinc-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(overallPassRate / 100) * 351.86} 351.86`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
              {overallPassRate}%
            </span>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-600/50">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {qaResults.filter(r => r.overallStatus === 'passed').length}
            </p>
            <p className="text-xs text-zinc-400 uppercase">Passed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {qaResults.filter(r => r.overallStatus === 'needs-review').length}
            </p>
            <p className="text-xs text-zinc-400 uppercase">Review</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">
              {qaResults.filter(r => r.overallStatus === 'failed').length}
            </p>
            <p className="text-xs text-zinc-400 uppercase">Failed</p>
          </div>
        </div>
      </div>

      {/* QA Results */}
      {qaResults.length === 0 ? (
        <div className="bg-zinc-700/20 border border-zinc-600/50 rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
            <span className="text-3xl">🔍</span>
          </div>
          <p className="text-zinc-400">No QA results yet</p>
          <p className="text-zinc-500 text-sm mt-2">Quality checks will appear here after image generation</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Detailed Results</span>
            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-mono rounded border border-orange-500/30">
              {qaResults.length} INSPECTIONS
            </span>
          </div>
          
          {qaResults.map((result) => (
            <div
              key={result.id}
              className={`rounded-xl overflow-hidden border-l-4 ${
                result.overallStatus === 'passed'
                  ? 'border-l-green-500 bg-green-500/5'
                  : result.overallStatus === 'failed'
                  ? 'border-l-red-500 bg-red-500/5'
                  : 'border-l-yellow-500 bg-yellow-500/5'
              } border border-zinc-600/50`}
            >
              {/* Result Header */}
              <div className="flex items-center justify-between p-4 bg-zinc-700/20">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                    result.overallStatus === 'passed'
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                      : result.overallStatus === 'failed'
                      ? 'bg-gradient-to-br from-red-500 to-rose-600'
                      : 'bg-gradient-to-br from-yellow-500 to-amber-600'
                  }`}>
                    {result.sceneNumber}
                  </div>
                  <div>
                    <p className="font-bold text-white">Scene {result.sceneNumber}</p>
                    <p className="text-xs text-zinc-400 font-mono">QA-{result.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                    result.overallStatus === 'passed'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : result.overallStatus === 'failed'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}
                >
                  {result.overallStatus === 'passed'
                    ? '✓ PASSED'
                    : result.overallStatus === 'failed'
                    ? '✕ FAILED'
                    : '⚠ REVIEW'}
                </span>
              </div>
              
              {/* Result Details */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-lg ${
                    result.checks.modelConsistency.passed 
                      ? 'bg-green-500/10 border border-green-500/30' 
                      : 'bg-red-500/10 border border-red-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-zinc-300">👤 Model Consistency</span>
                      <span className={`text-xs font-mono ${
                        result.checks.modelConsistency.passed ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {result.checks.modelConsistency.passed ? '✓ PASS' : '✕ FAIL'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            result.checks.modelConsistency.passed 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                              : 'bg-gradient-to-r from-red-500 to-rose-500'
                          }`}
                          style={{ width: `${result.checks.modelConsistency.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-400 font-mono">
                        {Math.round(result.checks.modelConsistency.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${
                    result.checks.productPlacement.passed 
                      ? 'bg-green-500/10 border border-green-500/30' 
                      : 'bg-red-500/10 border border-red-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-zinc-300">📦 Product Placement</span>
                      <span className={`text-xs font-mono ${
                        result.checks.productPlacement.passed ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {result.checks.productPlacement.passed ? '✓ PASS' : '✕ FAIL'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            result.checks.productPlacement.passed 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                              : 'bg-gradient-to-r from-red-500 to-rose-500'
                          }`}
                          style={{ width: `${result.checks.productPlacement.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-400 font-mono">
                        {Math.round(result.checks.productPlacement.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {result.suggestedFixes.length > 0 && (
                  <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-600/50">
                    <p className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
                      <span>🔧</span> Suggested Fixes
                    </p>
                    <ul className="space-y-2">
                      {result.suggestedFixes.map((fix, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                          <span className="text-orange-400 mt-0.5">•</span>
                          {fix}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pt-6 border-t border-zinc-700/50">
        <Button
          variant="secondary"
          onClick={() => store.setCurrentStage('GENERATING')}
          icon={<span>←</span>}
        >
          Back to Gallery
        </Button>
        <Button 
          onClick={() => store.setCurrentStage('VIDEO_GENERATION')}
          icon={<span>🎬</span>}
        >
          Video Production
        </Button>
      </div>
    </div>
  );
};

export default QAResultsPanel;
