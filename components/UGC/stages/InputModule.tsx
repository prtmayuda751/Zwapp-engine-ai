// components/UGC/stages/InputModule.tsx
// Industrial Theme Input Module with Orange Accents

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
    <div className="space-y-10">
      {/* Section Header */}
      <div className="border-b border-zinc-700/50 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            📥
          </span>
          Asset Upload Station
        </h2>
        <p className="text-zinc-400 mt-2 ml-13">
          Feed the industrial AI with your creative assets
        </p>
      </div>

      {/* Model Photos Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 font-bold border border-orange-500/30">
            01
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Model Photos</h3>
            <p className="text-sm text-zinc-400">
              Upload clear photos showing different poses and angles
            </p>
          </div>
          {store.currentProject.inputAssets.modelPhotos.length > 0 && (
            <span className="ml-auto px-3 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded-full border border-green-500/30">
              {store.currentProject.inputAssets.modelPhotos.length} LOADED
            </span>
          )}
        </div>
        
        <FileUpload accept="image/*" onDrop={handleModelPhotoDrop} />

        {store.currentProject.inputAssets.modelPhotos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {store.currentProject.inputAssets.modelPhotos.map((asset) => (
              <div key={asset.id} className="relative group">
                <div className="aspect-square rounded-xl overflow-hidden border-2 border-zinc-700 group-hover:border-orange-500/50 transition-colors">
                  <img
                    src={asset.supabaseUrl}
                    alt={asset.fileName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => store.removeModelPhoto(asset.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 flex items-center justify-center text-xs shadow-lg"
                >
                  ✕
                </button>
                <p className="text-xs text-zinc-500 mt-1 truncate font-mono">
                  {asset.fileName}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Photos Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 font-bold border border-orange-500/30">
            02
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Product Photos</h3>
            <p className="text-sm text-zinc-400">
              Upload product photos showing colors, features, and details
            </p>
          </div>
          {store.currentProject.inputAssets.productPhotos.length > 0 && (
            <span className="ml-auto px-3 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded-full border border-green-500/30">
              {store.currentProject.inputAssets.productPhotos.length} LOADED
            </span>
          )}
        </div>
        
        <FileUpload accept="image/*" onDrop={handleProductPhotoDrop} />

        {store.currentProject.inputAssets.productPhotos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {store.currentProject.inputAssets.productPhotos.map((asset) => (
              <div key={asset.id} className="relative group">
                <div className="aspect-square rounded-xl overflow-hidden border-2 border-zinc-700 group-hover:border-orange-500/50 transition-colors">
                  <img
                    src={asset.supabaseUrl}
                    alt={asset.fileName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => store.removeProductPhoto(asset.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 flex items-center justify-center text-xs shadow-lg"
                >
                  ✕
                </button>
                <p className="text-xs text-zinc-500 mt-1 truncate font-mono">
                  {asset.fileName}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Narrative Links Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 font-bold border border-orange-500/30">
            03
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Reference Links</h3>
            <p className="text-sm text-zinc-400">
              Add TikTok, Instagram, or Google Doc links for brand context
            </p>
          </div>
          {store.currentProject.inputAssets.narrativeLinks.length > 0 && (
            <span className="ml-auto px-3 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded-full border border-green-500/30">
              {store.currentProject.inputAssets.narrativeLinks.length} LINKED
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
            placeholder="https://www.tiktok.com/@brand/video/... or https://drive.google.com/..."
            className="flex-1 px-4 py-3 bg-zinc-800/50 border border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-zinc-500 font-mono text-sm"
          />
          <Button onClick={handleAddLink} icon={<span>🔗</span>}>
            Link
          </Button>
        </div>

        {store.currentProject.inputAssets.narrativeLinks.length > 0 && (
          <div className="space-y-2">
            {store.currentProject.inputAssets.narrativeLinks.map((link, index) => (
              <div
                key={link}
                className="flex items-center justify-between bg-zinc-700/30 p-4 rounded-xl border border-zinc-600/50 hover:border-orange-500/30 transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 text-xs font-mono">
                    {index + 1}
                  </span>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-orange-400 hover:text-orange-300 truncate flex-1 font-mono"
                  >
                    {link}
                  </a>
                </div>
                <button
                  onClick={() => store.removeNarrativeLink(link)}
                  className="ml-3 w-8 h-8 rounded-lg bg-zinc-700 text-zinc-400 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Summary */}
      <div className="bg-zinc-700/20 rounded-xl p-4 border border-zinc-600/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-zinc-300">ASSET STATUS</span>
          <span className={`text-xs font-mono px-2 py-1 rounded ${isComplete ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
            {isComplete ? 'READY' : 'INCOMPLETE'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className={`p-3 rounded-lg ${store.currentProject.inputAssets.modelPhotos.length > 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-zinc-700/30 border border-zinc-600/50'}`}>
            <div className={`text-2xl font-bold ${store.currentProject.inputAssets.modelPhotos.length > 0 ? 'text-green-400' : 'text-zinc-500'}`}>
              {store.currentProject.inputAssets.modelPhotos.length}
            </div>
            <div className="text-xs text-zinc-400 uppercase">Models</div>
          </div>
          <div className={`p-3 rounded-lg ${store.currentProject.inputAssets.productPhotos.length > 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-zinc-700/30 border border-zinc-600/50'}`}>
            <div className={`text-2xl font-bold ${store.currentProject.inputAssets.productPhotos.length > 0 ? 'text-green-400' : 'text-zinc-500'}`}>
              {store.currentProject.inputAssets.productPhotos.length}
            </div>
            <div className="text-xs text-zinc-400 uppercase">Products</div>
          </div>
          <div className={`p-3 rounded-lg ${store.currentProject.inputAssets.narrativeLinks.length > 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-zinc-700/30 border border-zinc-600/50'}`}>
            <div className={`text-2xl font-bold ${store.currentProject.inputAssets.narrativeLinks.length > 0 ? 'text-green-400' : 'text-zinc-500'}`}>
              {store.currentProject.inputAssets.narrativeLinks.length}
            </div>
            <div className="text-xs text-zinc-400 uppercase">Links</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pt-6 border-t border-zinc-700/50">
        <Button variant="secondary" onClick={() => store.resetProject()}>
          Cancel Production
        </Button>
        <Button
          onClick={handleStartGeneration}
          disabled={!isComplete || store.isLoading}
          icon={store.isLoading ? <span className="animate-spin">⏳</span> : <span>⚡</span>}
        >
          {store.isLoading ? 'Analyzing...' : 'Start AI Analysis'}
        </Button>
      </div>
    </div>
  );
};

export default InputModule;
