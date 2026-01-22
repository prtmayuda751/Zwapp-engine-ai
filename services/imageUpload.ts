import { uploadAsset } from './supabase';

/**
 * Upload image file to Supabase and get public URL
 * @param file - Image file to upload
 * @returns Public URL of the uploaded image
 */
export const uploadImageToSupabase = async (file: File): Promise<string> => {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Allowed: JPG, PNG, WEBP`);
  }

  // Validate file size (10MB for Edit, 30MB for Pro - we'll allow 30MB here)
  const maxSize = 30 * 1024 * 1024; // 30MB
  if (file.size > maxSize) {
    throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max: 30MB`);
  }

  try {
    const publicUrl = await uploadAsset(file);
    return publicUrl;
  } catch (error: any) {
    throw new Error(`Upload failed: ${error.message}`);
  }
};

/**
 * Upload multiple images concurrently
 * @param files - Array of image files
 * @returns Array of public URLs
 */
export const uploadImagesToSupabase = async (files: File[]): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImageToSupabase(file));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error: any) {
    throw new Error(`Batch upload failed: ${error.message}`);
  }
};

/**
 * Convert File to dataURL for preview
 * @param file - Image file
 * @returns Promise<string> data URL
 */
export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
