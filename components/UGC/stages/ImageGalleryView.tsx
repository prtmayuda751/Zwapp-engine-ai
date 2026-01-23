// components/UGC/stages/ImageGalleryView.tsx

import React, { useState } from 'react';
import { useUGCStore } from '../../../store/ugcStore';
import Button from '../common/Button';

const ImageGalleryView: React.FC = () => {
  const store = useUGCStore();
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  if (!store.currentProject) return null;

  const images = store.currentProject.generatedContent.images;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🖼️ Image Gallery
        </h2>
        <p className="text-gray-600">
          Generated {images.length} images using Nano Banana
        </p>
      </div>

      {images.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-12 text-center">
          <p className="text-blue-900 mb-4">No images generated yet</p>
          <p className="text-sm text-blue-800">
            Images will be generated in batches of 3 to avoid rate limits
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                onClick={() => setSelectedImageId(image.id)}
                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImageId === image.id
                    ? 'border-blue-500 ring-2 ring-blue-300'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <img
                  src={image.imageUrl}
                  alt={`Scene ${image.sceneNumber}`}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                  <p className="text-white text-sm font-semibold">
                    Scene {image.sceneNumber}
                  </p>
                  <p className="text-gray-300 text-xs">
                    Quality: {image.consistency.overallQuality}%
                  </p>
                </div>
              </div>
            ))}
          </div>

          {selectedImageId && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {(() => {
                const image = images.find((img) => img.id === selectedImageId);
                if (!image) return null;

                return (
                  <div className="space-y-4">
                    <img
                      src={image.imageUrl}
                      alt={`Scene ${image.sceneNumber}`}
                      className="w-full rounded-lg"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Model Consistency
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${image.consistency.modelConsistency}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {image.consistency.modelConsistency}%
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Product Placement
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${image.consistency.productPlacement}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {image.consistency.productPlacement}%
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Style Cohesion
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${image.consistency.styleCohesion}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {image.consistency.styleCohesion}%
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Quality
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${image.consistency.overallQuality}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {image.consistency.overallQuality}%
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={image.approved}
                          onChange={(e) =>
                            store.updateGeneratedImage(image.id, {
                              approved: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <span className="text-sm text-gray-900 font-semibold">
                          Approve for final output
                        </span>
                      </label>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}

      <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
        <Button
          variant="secondary"
          onClick={() => store.setCurrentStage('PROMPTING')}
        >
          Back
        </Button>
        <Button onClick={() => store.setCurrentStage('QA')}>
          Review Quality
        </Button>
      </div>
    </div>
  );
};

export default ImageGalleryView;
