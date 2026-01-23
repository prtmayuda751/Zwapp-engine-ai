// components/UGC/stages/VideoGenerationPanel.tsx
// Industrial Theme Video Generation Panel with Orange Accents

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
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-700/50 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            🎬
          </span>
          Video Production Chamber
        </h2>
        <p className="text-zinc-400 mt-2 ml-13">
          Transform approved images into dynamic video content
        </p>
      </div>

      {/* Info Panel */}
      <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl p-6 border border-orange-500/30 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl" />
        
        <div className="relative">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-orange-400 text-lg mb-2">KIE.AI Veo 3.1 Engine</h3>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                  Converts approved images into smooth video transitions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                  Adds cinematic motion and dynamics to UGC content
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                  Powered by state-of-the-art Veo 3.1 AI model
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  <span className="text-amber-400">Cost: ~$2-5 per video</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Video Content */}
      {videos.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-zinc-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-zinc-600 relative">
            <span className="text-4xl">🎥</span>
            {/* Animated Ring */}
            <div className="absolute inset-0 rounded-2xl border-2 border-orange-500/50 animate-pulse" />
          </div>
          
          <p className="text-xl font-bold text-white mb-2">
            Ready to Produce
          </p>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            Generate stunning video content from your approved images using advanced AI
          </p>
          
          <button
            onClick={handleGenerateVideo}
            disabled={generateVideo || store.isLoading}
            className={`
              px-8 py-4 rounded-xl font-bold text-lg
              transition-all duration-300
              ${generateVideo || store.isLoading 
                ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:shadow-lg hover:shadow-orange-500/30 hover:scale-105'
              }
            `}
          >
            {generateVideo || store.isLoading ? (
              <span className="flex items-center gap-3">
                <span className="w-5 h-5 border-2 border-zinc-500 border-t-orange-400 rounded-full animate-spin" />
                Generating Video...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <span>🎬</span>
                Start Video Production
              </span>
            )}
          </button>
          
          {/* Production Stats */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <span>🖼️</span>
              <span>{store.currentProject.generatedContent.images.filter(i => i.approved).length} approved images</span>
            </div>
            <div className="w-1 h-1 bg-zinc-600 rounded-full" />
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <span>⏱️</span>
              <span>~3-5 min processing</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Generated Videos</span>
            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-mono rounded border border-orange-500/30">
              {videos.length} PRODUCED
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-zinc-800/50 rounded-xl border border-zinc-600/50 overflow-hidden hover:border-orange-500/30 transition-colors"
              >
                {/* Video Preview */}
                <div className="bg-zinc-900 aspect-video flex items-center justify-center relative">
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-orange-500/80 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors cursor-pointer">
                      <span className="text-2xl ml-1">▶</span>
                    </div>
                  </div>
                  
                  {/* Video Info */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-sm font-mono bg-black/50 px-2 py-1 rounded">
                      {video.duration.toFixed(1)}s
                    </span>
                    <span className="text-xs bg-black/50 px-2 py-1 rounded">
                      {video.resolution} @ {video.frameRate}fps
                    </span>
                  </div>
                </div>
                
                {/* Video Details */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-white">Video Output</p>
                    <span
                      className={`px-2 py-1 text-xs font-mono rounded-lg ${
                        video.status === 'completed'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : video.status === 'processing'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : video.status === 'failed'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-zinc-700 text-zinc-400 border border-zinc-600'
                      }`}
                    >
                      {video.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span>📅 {new Date(video.generatedAt).toLocaleDateString()}</span>
                    <span>🎞️ {video.resolution}</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 py-2 bg-zinc-700/50 text-zinc-300 text-sm font-semibold rounded-lg hover:bg-zinc-600/50 transition-colors border border-zinc-600">
                      Preview
                    </button>
                    <button className="flex-1 py-2 bg-orange-500/20 text-orange-400 text-sm font-semibold rounded-lg hover:bg-orange-500/30 transition-colors border border-orange-500/30">
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Generate More */}
          <button
            onClick={handleGenerateVideo}
            disabled={generateVideo || store.isLoading}
            className="w-full py-4 border-2 border-dashed border-zinc-600 rounded-xl text-zinc-400 hover:border-orange-500/50 hover:text-orange-400 transition-colors flex items-center justify-center gap-2"
          >
            <span>+</span> Generate Another Video
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pt-6 border-t border-zinc-700/50">
        <Button
          variant="secondary"
          onClick={() => store.setCurrentStage('QA')}
          icon={<span>←</span>}
        >
          Back to QA
        </Button>
        <Button 
          onClick={() => store.setCurrentStage('COMPLETE')}
          icon={<span>🚀</span>}
        >
          Complete & Deploy
        </Button>
      </div>
    </div>
  );
};

export default VideoGenerationPanel;
