import React, { useState } from 'react';
import { MotionControlInput } from '../types';
import { Button } from './ui/Button';
import { Dropzone } from './ui/Dropzone';

interface TaskFormProps {
  onSubmit: (input: MotionControlInput) => void;
  isLoading: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<MotionControlInput>({
    prompt: 'The cartoon character is dancing.',
    input_urls: ['https://static.aiquickdraw.com/tools/example/1767694885407_pObJoMcy.png'],
    video_urls: ['https://static.aiquickdraw.com/tools/example/1767525918769_QyvTNib2.mp4'],
    character_orientation: 'video',
    mode: '720p',
  });

  const handleChange = (field: keyof MotionControlInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUrlChange = (field: 'input_urls' | 'video_urls', value: string) => {
    setFormData(prev => ({ ...prev, [field]: [value] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const labelClass = "block text-xs font-mono text-orange-500 mb-1 tracking-widest uppercase";
  const inputClass = "w-full bg-zinc-950 border border-zinc-700 text-zinc-300 p-3 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors font-mono text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/80 p-6 border border-zinc-800 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600"></div>
      
      <div className="flex items-center gap-2 mb-6">
        <div className="w-3 h-3 bg-orange-500 animate-pulse"></div>
        <h2 className="text-xl font-bold uppercase tracking-widest text-white">Task Configuration</h2>
      </div>

      <div>
        <label className={labelClass}>Prompt Description</label>
        <textarea
          value={formData.prompt}
          onChange={(e) => handleChange('prompt', e.target.value)}
          maxLength={2500}
          className={`${inputClass} h-24 resize-none`}
          placeholder="Describe the desired output..."
          required
        />
        <div className="text-right text-xs text-zinc-600 mt-1 font-mono">{formData.prompt.length}/2500</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Dropzone 
            label="Ref Image Source"
            subLabel="JPG/PNG, Max 10MB, >300px"
            accept="image/*"
            value={formData.input_urls[0]}
            onFileSelect={(base64) => handleUrlChange('input_urls', base64)}
            onTextChange={(val) => handleUrlChange('input_urls', val)}
          />
        </div>

        <div>
          <Dropzone 
            label="Ref Video Source"
            subLabel="MP4/MOV, Max 100MB"
            accept="video/*"
            value={formData.video_urls[0]}
            onFileSelect={(base64) => handleUrlChange('video_urls', base64)}
            onTextChange={(val) => handleUrlChange('video_urls', val)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Orientation Source</label>
          <div className="flex gap-4 mt-2">
            {(['image', 'video'] as const).map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${formData.character_orientation === opt ? 'border-orange-500 bg-orange-500/20' : 'border-zinc-600'}`}>
                  {formData.character_orientation === opt && <div className="w-2 h-2 bg-orange-500"></div>}
                </div>
                <input
                  type="radio"
                  name="orientation"
                  className="hidden"
                  checked={formData.character_orientation === opt}
                  onChange={() => handleChange('character_orientation', opt)}
                />
                <span className={`text-sm uppercase font-mono ${formData.character_orientation === opt ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                  {opt}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Resolution Mode</label>
          <div className="flex gap-4 mt-2">
            {(['720p', '1080p'] as const).map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${formData.mode === opt ? 'border-orange-500 bg-orange-500/20' : 'border-zinc-600'}`}>
                  {formData.mode === opt && <div className="w-2 h-2 bg-orange-500"></div>}
                </div>
                <input
                  type="radio"
                  name="mode"
                  className="hidden"
                  checked={formData.mode === opt}
                  onChange={() => handleChange('mode', opt)}
                />
                <span className={`text-sm uppercase font-mono ${formData.mode === opt ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                  {opt}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <Button type="submit" className="w-full" isLoading={isLoading}>
          INITIATE SEQUENCE
        </Button>
      </div>
    </form>
  );
};