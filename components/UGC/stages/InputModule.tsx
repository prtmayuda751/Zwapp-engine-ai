// components/UGC/stages/InputModule.tsx

import React, { useState } from 'react';
import { useUGCStore } from '../../../store/ugcStore';
import { UploadedAsset } from '../../../types/ugc';
import FileUpload from '../common/FileUpload';
import Button from '../common/Button';

const InputModule: React.FC = () => {
  const store = useUGCStore();
  const [links, setLinks] = useState('');

  if (!store.currentProject) return null;

  const handleModelPhotoDrop = (files: File[]) => {
    // Simulate upload - in production, upload to Supabase
    files.forEach((file) => {
      const asset: UploadedAsset = {
        id: crypto.randomUUID(),
        fileName: file.name,
        supabaseUrl: URL.createObjectURL(file), // Simulated
        supabasePath: `models/${file.name}`,
        size: file.size,
        uploadedAt: Date.now(),
        type: 'model',
      };
      store.addModelPhotos([asset]);
    });
    store.setSuccessMessage(`Uploaded ${files.length} model photo(s)`);
  };

  const handleProductPhotoDrop = (files: File[]) => {
    files.forEach((file) => {
      const asset: UploadedAsset = {
        id: crypto.randomUUID(),
        fileName: file.name,
        supabaseUrl: URL.createObjectURL(file), // Simulated
        supabasePath: `products/${file.name}`,
        size: file.size,
        uploadedAt: Date.now(),
        type: 'product',
      };
      store.addProductPhotos([asset]);
    });
    store.setSuccessMessage(`Uploaded ${files.length} product photo(s)`);
  };

  const handleAddLink = () => {
    if (links.trim()) {
      try {
        new URL(links);
        store.addNarrativeLink(links);
        setLinks('');
        store.setSuccessMessage('Link added successfully');
      } catch {
        store.setError('Invalid URL format');
      }
    }
  };

  const isComplete =
    store.currentProject.inputAssets.modelPhotos.length > 0 &&
    store.currentProject.inputAssets.productPhotos.length > 0 &&
    store.currentProject.inputAssets.narrativeLinks.length > 0;

  const handleStartGeneration = () => {
    if (isComplete) {
      store.setStatus('PROCESSING');
      store.setCurrentStage('ANALYSIS');
      // TODO: Call API to trigger orchestration
    }
  };

  return (
    <div className="space-y-8">
      {/* Model Photos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          📸 Step 1: Upload Model Photos
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload clear photos of your model showing different poses and angles
        </p>
        <FileUpload accept="image/*" onDrop={handleModelPhotoDrop} />

        {store.currentProject.inputAssets.modelPhotos.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold text-gray-700">Uploaded:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {store.currentProject.inputAssets.modelPhotos.map((asset) => (
                <div key={asset.id} className="relative group">
                  <img
                    src={asset.supabaseUrl}
                    alt={asset.fileName}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => store.removeModelPhoto(asset.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {asset.fileName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Photos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          📦 Step 2: Upload Product Photos
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload clear product photos showing colors, features, and details
        </p>
        <FileUpload accept="image/*" onDrop={handleProductPhotoDrop} />

        {store.currentProject.inputAssets.productPhotos.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold text-gray-700">Uploaded:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {store.currentProject.inputAssets.productPhotos.map((asset) => (
                <div key={asset.id} className="relative group">
                  <img
                    src={asset.supabaseUrl}
                    alt={asset.fileName}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => store.removeProductPhoto(asset.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {asset.fileName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Narrative Links */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🔗 Step 3: Add Narrative Reference Link
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Paste a TikTok, Instagram link or Google Doc link for brand context
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
            placeholder="https://www.tiktok.com/@brand/video/... or https://drive.google.com/..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={handleAddLink}>Add Link</Button>
        </div>

        {store.currentProject.inputAssets.narrativeLinks.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">References:</p>
            {store.currentProject.inputAssets.narrativeLinks.map((link) => (
              <div
                key={link}
                className="flex items-center justify-between bg-blue-50 p-3 rounded-lg"
              >
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate flex-1"
                >
                  {link}
                </a>
                <button
                  onClick={() => store.removeNarrativeLink(link)}
                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pt-8 border-t border-gray-200">
        <Button variant="secondary" onClick={() => store.resetProject()}>
          Cancel
        </Button>
        <Button
          onClick={handleStartGeneration}
          disabled={!isComplete || store.isLoading}
        >
          {store.isLoading ? '⏳ Analyzing...' : '✨ Analyze & Generate Script'}
        </Button>
      </div>
    </div>
  );
};

export default InputModule;
