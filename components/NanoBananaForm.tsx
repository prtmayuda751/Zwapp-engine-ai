import React, { useState } from 'react';
import { NanoBananaInput } from '../types';
import { Button } from './ui/Button';
import { Dropzone } from './ui/Dropzone';

interface NanoBananaFormProps {
  onSubmit: (input: NanoBananaInput) => void;
  isLoading: boolean;
}

export const NanoBananaForm: React.FC<NanoBananaFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<NanoBananaInput>({
    prompt: 'Comic poster: cool banana hero in shades leaps from sci-fi pad. Six panels: 1) 4K mountain landscape, 2) banana holds page of long multilingual text with auto translation, 3) Gemini 3 hologram for search/knowledge/reasoning, 4) camera UI sliders for angle focus color, 5) frame trio 1:1-9:16, 6) consistent banana poses. Footer shows Google icons. Tagline: Nano Banana Pro now on Kie AI.',
    image_input: [],
    aspect_ratio: '1:1',
    resolution: '1K',
    output_format: 'png'
  });

  const [refImageUrl, setRefImageUrl] = useState('');

  const handleChange = (field: keyof NanoBananaInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Include the ref image in the array if present
    const payload = {
        ...formData,
        image_input: refImageUrl ? [refImageUrl] : []
    };
    onSubmit(payload);
  };

  const labelClass = "block text-xs font-mono text-orange-500 mb-1 tracking-widest uppercase";
  const inputClass = "w-full bg-zinc-950 border border-zinc-700 text-zinc-300 p-3 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors font-mono text-sm";
  const selectClass = "w-full bg-zinc-950 border border-zinc-700 text-zinc-300 p-3 focus:border-orange-500 focus:outline-none font-mono text-sm appearance-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/80 p-6 border border-zinc-800 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600"></div>
      
      <div className="flex items-center gap-2 mb-6">
        <div className="w-3 h-3 bg-orange-500 animate-pulse"></div>
        <h2 className="text-xl font-bold uppercase tracking-widest text-white">Nano Banana Gen</h2>
      </div>

      <div>
        <label className={labelClass}>Prompt</label>
        <textarea
          value={formData.prompt}
          onChange={(e) => handleChange('prompt', e.target.value)}
          maxLength={20000}
          className={`${inputClass} h-32 resize-none`}
          placeholder="Describe the image..."
          required
        />
        <div className="text-right text-xs text-zinc-600 mt-1 font-mono">{formData.prompt.length}/20000</div>
      </div>

      <div>
        <Dropzone 
            label="Reference Image (Optional)"
            subLabel="Max 30MB. JPG/PNG/WEBP."
            accept="image/*"
            value={refImageUrl}
            onFileSelect={(base64) => setRefImageUrl(base64)}
            onTextChange={(val) => setRefImageUrl(val)}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div>
          <label className={labelClass}>Aspect Ratio</label>
          <div className="relative">
            <select 
                value={formData.aspect_ratio}
                onChange={(e) => handleChange('aspect_ratio', e.target.value)}
                className={selectClass}
            >
                {['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9', 'auto'].map(r => (
                    <option key={r} value={r}>{r}</option>
                ))}
            </select>
            <div className="absolute right-3 top-3 pointer-events-none text-orange-500">▼</div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Resolution</label>
          <div className="flex gap-2 mt-1">
            {['1K', '2K', '4K'].map((res) => (
              <label key={res} className={`flex-1 cursor-pointer border p-2 text-center transition-all ${formData.resolution === res ? 'border-orange-500 bg-orange-500/10 text-white' : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'}`}>
                <input
                  type="radio"
                  name="resolution"
                  className="hidden"
                  checked={formData.resolution === res}
                  onChange={() => handleChange('resolution', res)}
                />
                <span className="text-xs font-bold font-mono">{res}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Format</label>
          <div className="flex gap-2 mt-1">
            {['png', 'jpg'].map((fmt) => (
              <label key={fmt} className={`flex-1 cursor-pointer border p-2 text-center transition-all ${formData.output_format === fmt ? 'border-orange-500 bg-orange-500/10 text-white' : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'}`}>
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