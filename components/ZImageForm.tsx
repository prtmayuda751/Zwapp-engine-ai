import React, { useState } from 'react';
import { ZImageInput } from '../types';
import { Button } from './ui/Button';
import { getCreditCost, getCreditWarningLevel } from '../services/credits';

interface ZImageFormProps {
  onSubmit: (input: ZImageInput) => void;
  isLoading: boolean;
  apiKey?: string;
  userCredits?: number;
}

export const ZImageForm: React.FC<ZImageFormProps> = ({ onSubmit, isLoading, apiKey = '', userCredits = 0 }) => {
  const creditCost = getCreditCost('z-image');
  const creditLevel = getCreditWarningLevel(userCredits, creditCost);
  const [formData, setFormData] = useState<ZImageInput>({
    prompt: '',
    aspect_ratio: '1:1',
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof ZImageInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate prompt
    if (!formData.prompt.trim()) {
      setError('Prompt is required');
      return;
    }

    if (formData.prompt.length > 1000) {
      setError('Prompt must be less than 1000 characters');
      return;
    }

    onSubmit(formData);
  };

  const labelClass = 'block text-xs font-mono text-orange-500 mb-1 tracking-widest uppercase';
  const inputClass =
    'w-full bg-zinc-950 border border-zinc-700 text-zinc-300 p-3 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors font-mono text-sm';
  const selectClass =
    'w-full bg-zinc-950 border border-zinc-700 text-zinc-300 p-3 focus:border-orange-500 focus:outline-none font-mono text-sm appearance-none';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 p-4">
      <div className="border-b border-zinc-800 pb-2 mb-2">
        <h3 className="text-sm font-bold text-orange-500 uppercase tracking-widest">Z-IMAGE GENERATION</h3>
        <p className="text-[10px] text-zinc-500 mt-1">High-quality image synthesis with aspect ratio control</p>
      </div>

      {creditLevel === 'danger' && (
        <div className="bg-red-950/30 border border-red-700 p-3 rounded text-xs text-red-300 font-mono">
          ⚠️ INSUFFICIENT CREDITS: You need {creditCost} credits but only have {userCredits}.
        </div>
      )}

      {creditLevel === 'warning' && (
        <div className="bg-yellow-950/30 border border-yellow-700 p-3 rounded text-xs text-yellow-300 font-mono">
          ⚠️ LOW CREDITS: You have {userCredits} credits. Cost: {creditCost} credits.
        </div>
      )}

      {creditLevel === 'safe' && creditCost > 0 && (
        <div className="bg-green-950/30 border border-green-700 p-3 rounded text-xs text-green-300 font-mono">
          ✓ Credits OK: {userCredits} available. Cost: {creditCost} credits.
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-950 border border-red-700 text-red-400 p-3 rounded text-xs">
          {error}
        </div>
      )}

      {/* Prompt */}
      <div>
        <label className={labelClass}>
          Prompt <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.prompt}
          onChange={e => handleChange('prompt', e.target.value)}
          className={`${inputClass} resize-none h-24`}
          placeholder="Describe the image you want to generate (max 1000 characters)..."
          maxLength={1000}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-[10px] text-zinc-500">Be descriptive for better results</p>
          <span className="text-[10px] text-zinc-600">{formData.prompt.length}/1000</span>
        </div>
      </div>

      {/* Aspect Ratio */}
      <div>
        <label className={labelClass}>
          Aspect Ratio <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.aspect_ratio}
          onChange={e => handleChange('aspect_ratio', e.target.value as any)}
          className={selectClass}
        >
          <option value="1:1">1:1 (Square)</option>
          <option value="4:3">4:3 (Landscape)</option>
          <option value="3:4">3:4 (Portrait)</option>
          <option value="16:9">16:9 (Ultrawide)</option>
          <option value="9:16">9:16 (Vertical)</option>
        </select>
        <p className="text-[10px] text-zinc-500 mt-1">Choose the output image dimensions</p>
      </div>

      {/* Info Box */}
      <div className="bg-zinc-950 border border-zinc-700 p-3 rounded text-xs text-zinc-400">
        <p className="font-mono uppercase text-orange-500 mb-2">ℹ️ API Information</p>
        <ul className="space-y-1 text-[10px]">
          <li>• Model: <span className="text-white font-mono">z-image</span></li>
          <li>• Processing time varies based on system load</li>
          <li>• Results will appear in the output panel when ready</li>
        </ul>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading || formData.prompt.trim().length === 0}
        className="w-full"
      >
        {isLoading ? 'GENERATING...' : 'GENERATE IMAGE'}
      </Button>
    </form>
  );
};

