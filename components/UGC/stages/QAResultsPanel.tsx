// components/UGC/stages/QAResultsPanel.tsx

import React from 'react';
import { useUGCStore } from '../../../store/ugcStore';
import Button from '../common/Button';

const QAResultsPanel: React.FC = () => {
  const store = useUGCStore();

  if (!store.currentProject) return null;

  const qaResults = store.currentProject.qaResults.imageQA;
  const overallPassRate = store.currentProject.qaResults.overallPassRate;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ✅ Quality Assurance
        </h2>
        <p className="text-gray-600">
          Consistency checks and hallucination detection
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-900">Overall Pass Rate</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {overallPassRate}%
            </p>
          </div>
          <div className="w-32 h-32 relative">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-blue-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${(overallPassRate / 100) * 351.86} 351.86`}
                className="text-green-500 transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-blue-900">
              {overallPassRate}%
            </span>
          </div>
        </div>
      </div>

      {qaResults.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600">No QA results yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {qaResults.map((result) => (
            <div
              key={result.id}
              className={`border-l-4 rounded-lg p-4 ${
                result.overallStatus === 'passed'
                  ? 'border-green-500 bg-green-50'
                  : result.overallStatus === 'failed'
                  ? 'border-red-500 bg-red-50'
                  : 'border-yellow-500 bg-yellow-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-gray-900">
                  Scene {result.sceneNumber}
                </p>
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    result.overallStatus === 'passed'
                      ? 'bg-green-200 text-green-900'
                      : result.overallStatus === 'failed'
                      ? 'bg-red-200 text-red-900'
                      : 'bg-yellow-200 text-yellow-900'
                  }`}
                >
                  {result.overallStatus === 'passed'
                    ? '✓ Passed'
                    : result.overallStatus === 'failed'
                    ? '✕ Failed'
                    : '⚠ Needs Review'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">Model Consistency</p>
                  <p
                    className={
                      result.checks.modelConsistency.passed
                        ? 'text-green-700'
                        : 'text-red-700'
                    }
                  >
                    {result.checks.modelConsistency.passed ? '✓ Pass' : '✕ Fail'} (
                    {Math.round(
                      result.checks.modelConsistency.confidence * 100
                    )}
                    % confidence)
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">
                    Product Placement
                  </p>
                  <p
                    className={
                      result.checks.productPlacement.passed
                        ? 'text-green-700'
                        : 'text-red-700'
                    }
                  >
                    {result.checks.productPlacement.passed ? '✓ Pass' : '✕ Fail'} (
                    {Math.round(
                      result.checks.productPlacement.confidence * 100
                    )}
                    % confidence)
                  </p>
                </div>
              </div>

              {result.suggestedFixes.length > 0 && (
                <div className="text-sm">
                  <p className="font-semibold text-gray-700 mb-2">Suggested Fixes:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {result.suggestedFixes.map((fix, idx) => (
                      <li key={idx}>{fix}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
        <Button
          variant="secondary"
          onClick={() => store.setCurrentStage('GENERATING')}
        >
          Back
        </Button>
        <Button onClick={() => store.setCurrentStage('VIDEO_GENERATION')}>
          Continue to Video Generation
        </Button>
      </div>
    </div>
  );
};

export default QAResultsPanel;
