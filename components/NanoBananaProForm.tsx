import React, { useState } from 'react';
import { NanoBananaProInput } from '../types';
import { Button } from './ui/Button';
import { Dropzone } from './ui/Dropzone';
import { uploadImageToKieAI, fileToDataURL } from '../services/kieFileUpload';

interface NanoBananaProFormProps {
  onSubmit: (input: NanoBananaProInput) => void;
  isLoading: boolean;
  apiKey?: string;
}

interface ImagePreview {
  dataUrl: string;
  url: string;
  fileName: string;
  isUploading: boolean;
}

export const NanoBananaProForm: React.FC<NanoBananaProFormProps> = ({ onSubmit, isLoading, apiKey = '' }) => {
  const [formData, setFormData] = useState<NanoBananaProInput>({
    prompt: 'Comic poster: cool banana hero in shades leaps from sci-fi pad. Six panels: 1) 4K mountain landscape, 2) banana holds page of long multilingual text with auto translation, 3) Gemini 3 hologram for search/knowledge/reasoning, 4) camera UI sliders for angle focus color, 5) frame trio 1:1-9:16, 6) consistent banana poses.',
    image_input: [],
    aspect_ratio: '1:1',
    resolution: '1K',
    output_format: 'png'
  });

  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [uploadError, setUploadError] = useState<string>('');

  const handleChange = (field: keyof NanoBananaProInput, value: any) => {
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
        image_input: [...prev.image_input, publicUrl]
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
      image_input: prev.image_input.filter((_, i) => i !== index)
    }));
    setUploadError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prompt.trim()) {
      alert('Prompt is required');
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

  const aspectRatioOptions = ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9', 'auto'] as const;
  const resolutionOptions = ['1K', '2K', '4K'] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/80 p-6 border border-zinc-800 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600"></div>
      
      <div className="flex items-center gap-2 mb-6">
        <div className="w-3 h-3 bg-purple-500 animate-pulse"></div>
        <h2 className="text-xl font-bold uppercase tracking-widest text-white">Nano Banana Pro</h2>
        <span className="text-xs text-zinc-500 font-mono ml-auto">v1</span>
      </div>

      <div className="bg-zinc-800/50 border border-zinc-700 p-3 rounded text-xs text-zinc-400 font-mono">
        Advanced generation with reference images (up to 8 images, max 30MB each)
      </div>

      <div>
        <label className={labelClass}>Prompt *</label>
        <textarea
          value={formData.prompt}
          onChange={(e) => handleChange('prompt', e.target.value)}
          maxLength={20000}
          className={`${inputClass} h-24 resize-none`}
          placeholder="Describe the image you want to generate..."
          required
        />
        <div className="text-right text-xs text-zinc-600 mt-1 font-mono">{formData.prompt.length}/20000</div>
      </div>

      <div>
        <Dropzone 
            label="Reference Images (Optional)"
            subLabel="Max 8 images, 30MB each. JPG/PNG/WEBP."
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
            <p className="text-xs text-zinc-400 font-mono">References: {imagePreviews.length}/{8}</p>
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
                      <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
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

      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className={labelClass}>Aspect Ratio</label>
          <div className="relative">
            <select 
                value={formData.aspect_ratio}
                onChange={(e) => handleChange('aspect_ratio', e.target.value)}
                className={selectClass}
            >
                {aspectRatioOptions.map(ratio => (
                    <option key={ratio} value={ratio}>{ratio}</option>
                ))}
            </select>
            <div className="absolute right-3 top-3 pointer-events-none text-orange-500">▼</div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Resolution</label>
          <div className="flex gap-2 mt-1">
            {resolutionOptions.map((res) => (
              <label key={res} className={`flex-1 cursor-pointer border p-2 text-center transition-all text-xs ${formData.resolution === res ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'}`}>
                <input
                  type="radio"
                  name="resolution"
                  className="hidden"
                  checked={formData.resolution === res}
                  onChange={() => handleChange('resolution', res)}
                />
                <span className="font-bold font-mono">{res}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Format</label>
          <div className="flex gap-2 mt-1">
            {['png', 'jpg'].map((fmt) => (
              <label key={fmt} className={`flex-1 cursor-pointer border p-2 text-center transition-all text-xs ${formData.output_format === fmt ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'}`}>
                <input
                  type="radio"
                  name="output_format"
                  className="hidden"
                  checked={formData.output_format === fmt}
                  onChange={() => handleChange('output_format', fmt)}
                />
                <span className="font-bold font-mono uppercase">{fmt}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <Button type="submit" className="w-full" isLoading={isLoading}>
          GENERATE IMAGE PRO
        </Button>
      </div>
    </form>
  );
};
