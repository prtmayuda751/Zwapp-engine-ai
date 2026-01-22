import React, { useState } from 'react';
import { NanoBananaEditInput } from '../types';
import { Button } from './ui/Button';
import { Dropzone } from './ui/Dropzone';
import { uploadImageToKieAI, fileToDataURL } from '../services/kieFileUpload';
import { getCreditCost, getCreditWarningLevel } from '../services/credits';

interface NanoBananaEditFormProps {
  onSubmit: (input: NanoBananaEditInput) => void;
  isLoading: boolean;
  apiKey?: string;
  userCredits?: number;
}

interface ImagePreview {
  dataUrl: string;
  url: string;
  fileName: string;
  isUploading: boolean;
}

export const NanoBananaEditForm: React.FC<NanoBananaEditFormProps> = ({ onSubmit, isLoading, apiKey = '', userCredits = 0 }) => {
  const creditCost = getCreditCost('google/nano-banana-edit');
  const creditLevel = getCreditWarningLevel(userCredits, creditCost);
  const [formData, setFormData] = useState<NanoBananaEditInput>({
    prompt: 'turn this photo into a character figure',
    image_urls: [],
    output_format: 'png',
    image_size: '1:1'
  });

  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [uploadError, setUploadError] = useState<string>('');

  const handleChange = (field: keyof NanoBananaEditInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = async (base64: string, file?: File) => {
    setUploadError('');
    
    if (!file) return;

    // Add preview with uploading state
    const preview: ImagePreview = {
      dataUrl: base64,
      url: '',
      fileName: file.name,
      isUploading: true
    };

    setImagePreviews(prev => [...prev, preview]);

    try {
      // Upload to KIE.AI and get public URL
      if (!apiKey) {
        throw new Error('API Key required');
      }
      const publicUrl = await uploadImageToKieAI(file, apiKey);
      
      // Update preview with actual URL
      setImagePreviews(prev => 
        prev.map(p => 
          p.fileName === file.name 
            ? { ...p, url: publicUrl, isUploading: false }
            : p
        )
      );

      // Update form data with public URLs
      setFormData(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, publicUrl]
      }));
    } catch (error: any) {
      setUploadError(error.message);
      // Remove failed upload from previews
      setImagePreviews(prev => prev.filter(p => p.fileName !== file.name));
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
    setUploadError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prompt.trim()) {
      alert('Prompt is required');
      return;
    }
    if (formData.image_urls.length === 0) {
      alert('Please upload at least one image');
      return;
    }
    if (imagePreviews.some(p => p.isUploading)) {
      alert('Please wait for all images to finish uploading');
      return;
    }
    onSubmit(formData);
  };

  const labelClass = "block text-xs font-mono text-orange-500 mb-1 tracking-widest uppercase";
  const inputClass = "w-full bg-zinc-950 border border-zinc-700 text-zinc-300 p-3 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors font-mono text-sm";
  const selectClass = "w-full bg-zinc-950 border border-zinc-700 text-zinc-300 p-3 focus:border-orange-500 focus:outline-none font-mono text-sm appearance-none";

  const imageSizeOptions = ['1:1', '9:16', '16:9', '3:4', '4:3', '3:2', '2:3', '5:4', '4:5', '21:9', 'auto'] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/80 p-6 border border-zinc-800 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600"></div>
      
      <div className="flex items-center gap-2 mb-6">
        <div className="w-3 h-3 bg-blue-500 animate-pulse"></div>
        <h2 className="text-xl font-bold uppercase tracking-widest text-white">Nano Banana Edit</h2>
        <span className="text-xs text-zinc-500 font-mono ml-auto">v1</span>
      </div>

      <div className="bg-zinc-800/50 border border-zinc-700 p-3 rounded text-xs text-zinc-400 font-mono">
        Edit and transform images using AI (up to 10 images, max 10MB each)
      </div>

      <div>
        <label className={labelClass}>Prompt *</label>
        <textarea
          value={formData.prompt}
          onChange={(e) => handleChange('prompt', e.target.value)}
          maxLength={20000}
          className={`${inputClass} h-24 resize-none`}
          placeholder="Describe how to edit the image..."
          required
        />
        <div className="text-right text-xs text-zinc-600 mt-1 font-mono">{formData.prompt.length}/20000</div>
      </div>

      <div>
        <Dropzone 
            label="Upload Images *"
            subLabel="Max 10 images, 10MB each. JPG/PNG/WEBP."
            accept="image/*"
            value=""
            onFileSelect={handleImageSelect}
            onTextChange={() => {}}
        />
        
        {uploadError && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/50 rounded text-xs text-red-400 font-mono">
            ⚠ {uploadError}
          </div>
        )}

        {imagePreviews.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-zinc-400 font-mono">Uploads: {imagePreviews.length}/{10}</p>
            <div className="grid grid-cols-4 gap-2">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative group">
                  <img 
                    src={preview.dataUrl} 
                    alt={preview.fileName} 
                    className="w-full aspect-square object-cover rounded border border-zinc-700" 
                  />
                  {preview.isUploading && (
                    <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {!preview.isUploading && (
                    <div className="absolute top-1 left-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    disabled={preview.isUploading}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Image Size</label>
          <div className="relative">
            <select 
                value={formData.image_size}
                onChange={(e) => handleChange('image_size', e.target.value)}
                className={selectClass}
            >
                {imageSizeOptions.map(size => (
                    <option key={size} value={size}>{size}</option>
                ))}
            </select>
            <div className="absolute right-3 top-3 pointer-events-none text-orange-500">▼</div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Format</label>
          <div className="flex gap-2 mt-1">
            {['png', 'jpeg'].map((fmt) => (
              <label key={fmt} className={`flex-1 cursor-pointer border p-2 text-center transition-all ${formData.output_format === fmt ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'}`}>
                <input
                  type="radio"
                  name="output_format"
                  className="hidden"
                  checked={formData.output_format === fmt}
                  onChange={() => handleChange('output_format', fmt)}
                />
                <span className="text-xs font-bold font-mono uppercase">{fmt}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <Button type="submit" className="w-full" isLoading={isLoading}>
          EDIT IMAGES
        </Button>
      </div>
    </form>
  );
};
