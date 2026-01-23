// components/UGC/common/FileUpload.tsx
// Industrial Theme File Upload Component with Orange Accents

import React, { useState, useRef } from 'react';

interface FileUploadProps {
  accept: string;
  onDrop: (files: File[]) => void;
  maxSize?: number; // in bytes
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  onDrop,
  maxSize = 10 * 1024 * 1024, // 10MB default
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter((file) => {
      const acceptedTypes = accept.split(',').map((type) => type.trim());
      return acceptedTypes.some((type) =>
        type === '*'
          ? true
          : file.type.includes(type.replace('/*', '')) || file.name.endsWith(type.replace('*', ''))
      );
    });

    if (validFiles.length > 0) {
      onDrop(validFiles);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files ? Array.from(e.currentTarget.files) : [];
    if (files.length > 0) {
      onDrop(files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
        ${isDragOver
          ? 'border-orange-500 bg-orange-500/10 scale-[1.02]'
          : 'border-zinc-600 bg-zinc-800/30 hover:border-orange-500/50 hover:bg-zinc-700/30'
        }
      `}
    >
      {/* Corner Decorations */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-orange-500/50 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-orange-500/50 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-orange-500/50 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-orange-500/50 rounded-br-lg" />
      
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        multiple
        className="hidden"
      />
      
      <div className="flex flex-col items-center gap-4">
        {/* Upload Icon */}
        <div className={`
          w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
          ${isDragOver 
            ? 'bg-orange-500 text-white scale-110' 
            : 'bg-zinc-700/50 text-orange-400 border border-zinc-600'
          }
        `}>
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        
        <div>
          <p className="text-white font-semibold mb-1">
            {isDragOver ? 'Release to Upload' : 'Drop files here or click to browse'}
          </p>
          <p className="text-sm text-zinc-400">
            Supported: <span className="text-orange-400 font-mono">{accept.split(',').join(', ')}</span>
          </p>
        </div>
        
        {/* File Size Info */}
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-700/30 rounded-lg border border-zinc-600/50">
          <span className="text-xs text-zinc-500">MAX SIZE:</span>
          <span className="text-xs text-orange-400 font-mono font-bold">
            {(maxSize / 1024 / 1024).toFixed(0)}MB
          </span>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
