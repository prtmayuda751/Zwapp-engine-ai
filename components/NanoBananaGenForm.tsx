import React, { useState } from 'react';
import { NanoBananaGenInput } from '../types';
import { Button } from './ui/Button';
import { getCreditCost, getCreditWarningLevel } from '../services/credits';

interface NanoBananaGenFormProps {
  onSubmit: (input: NanoBananaGenInput) => void;
  isLoading: boolean;
  apiKey?: string;
  userCredits?: number;
}

export const NanoBananaGenForm: React.FC<NanoBananaGenFormProps> = ({ onSubmit, isLoading, apiKey = '', userCredits = 0 }) => {
  const creditCost = getCreditCost('google/nano-banana');
  const creditLevel = getCreditWarningLevel(userCredits, creditCost);
  const [formData, setFormData] = useState<NanoBananaGenInput>({
    prompt: 'A surreal painting of a giant banana floating in space, stars and galaxies in the background, vibrant colors, digital art',
    output_format: 'png',
    image_size: '1:1'
  });

  const handleChange = (field: keyof NanoBananaGenInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prompt.trim()) {
      alert('Prompt is required');
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
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 via-emerald-500 to-green-600"></div>
      
      <div className="flex items-center gap-2 mb-6">
        <div className="w-3 h-3 bg-green-500 animate-pulse"></div>
        <h2 className="text-xl font-bold uppercase tracking-widest text-white">Nano Banana Gen</h2>
        <span className="text-xs text-zinc-500 font-mono ml-auto">v1</span>
      </div>

      <div className="bg-zinc-800/50 border border-zinc-700 p-3 rounded text-xs text-zinc-400 font-mono">
        Generate images from text descriptions
      </div>

      {creditLevel === 'critical' && (
        <div className="bg-red-950/30 border border-red-700 p-3 rounded text-xs text-red-300 font-mono">
          ⚠️ CRITICAL: Insufficient credits ({userCredits}). Cost: {creditCost} credits.
        </div>
      )}

      {creditLevel === 'warning' && (
        <div className="bg-yellow-950/30 border border-yellow-700 p-3 rounded text-xs text-yellow-300 font-mono">
          ⚠️ WARNING: Low credits ({userCredits}). Cost: {creditCost} credits.
        </div>
      )}

      {creditLevel === 'ok' && creditCost > 0 && (
        <div className="bg-green-950/30 border border-green-700 p-3 rounded text-xs text-green-300 font-mono">
          ✓ Credits available ({userCredits}). Cost: {creditCost} credits.
        </div>
      )}

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
              <label key={fmt} className={`flex-1 cursor-pointer border p-2 text-center transition-all ${formData.output_format === fmt ? 'border-green-500 bg-green-500/10 text-white' : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'}`}>
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
          GENERATE IMAGE
        </Button>
      </div>
    </form>
  );
};
