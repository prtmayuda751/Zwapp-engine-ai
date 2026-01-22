/**
 * KIE.AI File Upload Service
 * Replaces Supabase for input file uploads
 * Uses KIE.AI's native file upload: https://kieai.redpandaai.co/api/file-url-upload
 * Files are temporary (3 days retention) - perfect for processing pipelines
 */

/**
 * Convert File to public URL via KIE.AI
 * Uploads file and returns a URL that can be used with any KIE.AI API
 */
export const uploadFileToKieAI = async (
  file: File,
  apiKey: string,
  uploadPath: string = 'uploads'
): Promise<string> => {
  try {
    // First, we need to upload the file to get a temporary URL
    // Since KIE.AI file upload requires a URL source, we'll convert file to blob URL
    // then use that, or we can upload directly to Supabase and use the URL with KIE.AI
    
    // For now, we'll create a workaround:
    // 1. Create a FormData with the file
    // 2. Upload to KIE.AI's file upload endpoint
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadPath', uploadPath);
    formData.append('fileName', file.name);
    
    const response = await fetch('https://kieai.redpandaai.co/api/file-url-upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || `HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.success || !data.data?.fileUrl) {
      throw new Error('File upload failed: No URL returned');
    }

    return data.data.fileUrl;
  } catch (error: any) {
    throw new Error(`KIE.AI upload failed: ${error.message}`);
  }
};

/**
 * Upload image file to KIE.AI
 * Validates file type and size before uploading
 */
export const uploadImageToKieAI = async (
  file: File,
  apiKey: string
): Promise<string> => {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Allowed: JPG, PNG, WEBP`);
  }

  // Validate file size (10MB for most image models)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max: 10MB`);
  }

  return uploadFileToKieAI(file, apiKey, 'images');
};

/**
 * Upload video file to KIE.AI
 * Validates file type and size before uploading
 */
export const uploadVideoToKieAI = async (
  file: File,
  apiKey: string
): Promise<string> => {
  // Validate file type
  const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/x-msvideo'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Allowed: MP4, MOV, MKV, AVI`);
  }

  // Validate file size (100MB for videos)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max: 100MB`);
  }

  return uploadFileToKieAI(file, apiKey, 'videos');
};

/**
 * Upload multiple images concurrently to KIE.AI
 */
export const uploadImagesToKieAI = async (
  files: File[],
  apiKey: string
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImageToKieAI(file, apiKey));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error: any) {
    throw new Error(`Batch upload failed: ${error.message}`);
  }
};

/**
 * Upload multiple videos concurrently to KIE.AI
 */
export const uploadVideosToKieAI = async (
  files: File[],
  apiKey: string
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadVideoToKieAI(file, apiKey));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error: any) {
    throw new Error(`Batch upload failed: ${error.message}`);
  }
};

/**
 * Convert File to dataURL for preview (no upload)
 */
export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Check file size without uploading
 */
export const getFileSizeInfo = (file: File): {
  sizeInMB: number;
  isValid: boolean;
  message: string;
} => {
  const sizeInMB = file.size / 1024 / 1024;
  
  if (file.type.startsWith('image/')) {
    const maxMB = 10;
    return {
      sizeInMB,
      isValid: sizeInMB <= maxMB,
      message: `${sizeInMB.toFixed(2)}MB / ${maxMB}MB`
    };
  }
  
  if (file.type.startsWith('video/')) {
    const maxMB = 100;
    return {
      sizeInMB,
      isValid: sizeInMB <= maxMB,
      message: `${sizeInMB.toFixed(2)}MB / ${maxMB}MB`
    };
  }
  
  return {
    sizeInMB,
    isValid: true,
    message: `${sizeInMB.toFixed(2)}MB`
  };
};
