// components/UGC/common/FileUpload.tsx

import React, { useState } from 'react';

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
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
        isDragOver
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
      }`}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        multiple
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="text-4xl mb-2">📁</div>
        <p className="text-gray-900 font-semibold mb-1">
          Drag files here or click to select
        </p>
        <p className="text-sm text-gray-600">
          Supported formats: {accept.split(',').join(', ')}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Max file size: {(maxSize / 1024 / 1024).toFixed(0)}MB
        </p>
      </label>
    </div>
  );
};

export default FileUpload;
