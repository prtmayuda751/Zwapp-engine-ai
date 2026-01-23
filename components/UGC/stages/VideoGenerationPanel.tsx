// components/UGC/stages/VideoGenerationPanel.tsx

import React from 'react';
import { useUGCStore } from '../../../store/ugcStore';
import Button from '../common/Button';

const VideoGenerationPanel: React.FC = () => {
  const store = useUGCStore();

  if (!store.currentProject) return null;

  const videos = store.currentProject.generatedContent.videos;
  const [generateVideo, setGenerateVideo] = React.useState(false);

  const handleGenerateVideo = () => {
    setGenerateVideo(true);
    store.setLoading(true);
    // TODO: Call API to generate video using Veo 3.1
    setTimeout(() => {
      store.setLoading(false);
      setGenerateVideo(false);
      store.setSuccessMessage('Video generation completed');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🎬 Video Generation
        </h2>
        <p className="text-gray-600">
          Optional: Generate video using KIE.AI Veo 3.1
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">About Video Generation</h3>
        <ul className="text-sm text-blue-800 space-y-2 ml-4">
          <li>
            ✓ Converts approved images into smooth video transitions
          </li>
          <li>✓ Adds motion and dynamics to your UGC content</li>
          <li>✓ Generated using Veo 3.1 AI model</li>
          <li>✓ Additional cost: ~$2-5 per video</li>
        </ul>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎥</div>
          <p className="text-gray-600 mb-6">No videos generated yet</p>
          <button
            onClick={handleGenerateVideo}
            disabled={generateVideo || store.isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {generateVideo || store.isLoading
              ? '⏳ Generating video...'
              : '🎬 Generate Video'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="bg-gray-900 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white text-sm">
                    Video {video.duration.toFixed(1)}s
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {video.resolution} @ {video.frameRate}fps
                  </p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-gray-900">
                  Generated {new Date(video.generatedAt).toLocaleDateString()}
                </p>
                <p
                  className={`text-xs mt-2 px-2 py-1 rounded-full w-fit ${
                    video.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : video.status === 'processing'
                      ? 'bg-blue-100 text-blue-800'
                      : video.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
        <Button
          variant="secondary"
          onClick={() => store.setCurrentStage('QA')}
        >
          Back
        </Button>
        <Button onClick={() => store.setCurrentStage('COMPLETE')}>
          Complete & Download
        </Button>
      </div>
    </div>
  );
};

export default VideoGenerationPanel;
