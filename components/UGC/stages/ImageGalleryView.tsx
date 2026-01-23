// components/UGC/stages/ImageGalleryView.tsx
// Industrial Theme Image Gallery with Orange Accents

import React, { useState } from 'react';
import { useUGCStore } from '../../../store/ugcStore';
import Button from '../common/Button';

const ImageGalleryView: React.FC = () => {
  const store = useUGCStore();
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  if (!store.currentProject) return null;

  const images = store.currentProject.generatedContent.images;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-700/50 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            🖼️
          </span>
          Image Production Line
        </h2>
        <p className="text-zinc-400 mt-2 ml-13">
          Generated <span className="text-orange-400 font-mono">{images.length}</span> images using Nano Banana AI Engine
        </p>
      </div>

      {images.length === 0 ? (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
            <span className="text-4xl">🎨</span>
          </div>
          <p className="text-orange-400 font-semibold mb-2">
            Production Queue Empty
          </p>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Images will be manufactured in batches of 3 to maintain quality and avoid rate limits
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Awaiting prompts
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                onClick={() => setSelectedImageId(image.id)}
                className={`relative group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${
                  selectedImageId === image.id
                    ? 'ring-2 ring-orange-500 shadow-lg shadow-orange-500/30'
                    : 'ring-2 ring-zinc-700 hover:ring-orange-500/50'
                }`}
              >
                <img
                  src={image.imageUrl}
                  alt={`Scene ${image.sceneNumber}`}
                  className="w-full h-48 object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 text-xs font-mono rounded-lg ${
                    image.approved 
                      ? 'bg-green-500/90 text-white' 
                      : 'bg-zinc-800/90 text-zinc-300 border border-zinc-600'
                  }`}>
                    {image.approved ? '✓ APPROVED' : 'PENDING'}
                  </span>
                </div>
                
                {/* Quality Score */}
                <div className="absolute top-3 right-3">
                  <div className={`px-2 py-1 text-xs font-mono rounded-lg bg-zinc-800/90 border ${
                    image.consistency.overallQuality >= 80 
                      ? 'border-green-500/50 text-green-400' 
                      : image.consistency.overallQuality >= 60 
                        ? 'border-orange-500/50 text-orange-400'
                        : 'border-red-500/50 text-red-400'
                  }`}>
                    {image.consistency.overallQuality}%
                  </div>
                </div>
                
                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-bold">Scene {image.sceneNumber}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                        style={{ width: `${image.consistency.overallQuality}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/10 transition-colors" />
              </div>
            ))}
          </div>

          {/* Selected Image Details */}
          {selectedImageId && (
            <div className="bg-zinc-700/20 rounded-xl border border-zinc-600/50 overflow-hidden">
              {(() => {
                const image = images.find((img) => img.id === selectedImageId);
                if (!image) return null;

                return (
                  <div className="grid md:grid-cols-2 gap-6 p-6">
                    {/* Image Preview */}
                    <div className="space-y-4">
                      <img
                        src={image.imageUrl}
                        alt={`Scene ${image.sceneNumber}`}
                        className="w-full rounded-xl border border-zinc-600"
                      />
                      
                      {/* Approval Toggle */}
                      <label className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl border border-zinc-600/50 cursor-pointer hover:border-orange-500/30 transition-colors">
                        <div className={`w-12 h-6 rounded-full transition-colors relative ${
                          image.approved ? 'bg-orange-500' : 'bg-zinc-600'
                        }`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                            image.approved ? 'left-7' : 'left-1'
                          }`} />
                        </div>
                        <input
                          type="checkbox"
                          checked={image.approved}
                          onChange={(e) =>
                            store.updateGeneratedImage(image.id, {
                              approved: e.target.checked,
                            })
                          }
                          className="sr-only"
                        />
                        <span className="text-white font-semibold">
                          {image.approved ? 'Approved for Production' : 'Approve for Final Output'}
                        </span>
                      </label>
                    </div>
                    
                    {/* Quality Metrics */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="text-orange-400">📊</span>
                        Quality Metrics
                      </h4>
                      
                      {/* Metric Bars */}
                      <div className="space-y-4">
                        <MetricBar 
                          label="Model Consistency" 
                          value={image.consistency.modelConsistency} 
                          icon="👤"
                        />
                        <MetricBar 
                          label="Product Placement" 
                          value={image.consistency.productPlacement}
                          icon="📦" 
                        />
                        <MetricBar 
                          label="Style Cohesion" 
                          value={image.consistency.styleCohesion}
                          icon="🎨" 
                        />
                        <MetricBar 
                          label="Overall Quality" 
                          value={image.consistency.overallQuality}
                          icon="⭐" 
                        />
                      </div>
                      
                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-600/50">
                        <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-600/50">
                          <p className="text-xs text-zinc-400 uppercase">Scene</p>
                          <p className="text-xl font-bold text-orange-400">{image.sceneNumber}</p>
                        </div>
                        <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-600/50">
                          <p className="text-xs text-zinc-400 uppercase">Status</p>
                          <p className={`text-xl font-bold ${image.approved ? 'text-green-400' : 'text-zinc-400'}`}>
                            {image.approved ? '✓' : '○'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pt-6 border-t border-zinc-700/50">
        <Button
          variant="secondary"
          onClick={() => store.setCurrentStage('PROMPTING')}
          icon={<span>←</span>}
        >
          Back to Prompts
        </Button>
        <Button 
          onClick={() => store.setCurrentStage('QA')}
          icon={<span>✅</span>}
        >
          Quality Inspection
        </Button>
      </div>
    </div>
  );
};

// Metric Bar Component
const MetricBar: React.FC<{ label: string; value: number; icon: string }> = ({ label, value, icon }) => {
  const getColor = (val: number) => {
    if (val >= 80) return 'from-green-500 to-emerald-500';
    if (val >= 60) return 'from-orange-500 to-amber-500';
    return 'from-red-500 to-rose-500';
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-300 flex items-center gap-2">
          <span>{icon}</span>
          {label}
        </span>
        <span className={`text-sm font-mono font-bold ${
          value >= 80 ? 'text-green-400' : value >= 60 ? 'text-orange-400' : 'text-red-400'
        }`}>
          {value}%
        </span>
      </div>
      <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${getColor(value)} rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

export default ImageGalleryView;
