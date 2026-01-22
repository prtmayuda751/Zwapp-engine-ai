/**
 * DEPRECATED: Use kieFileUpload.ts instead
 * This file is kept for backward compatibility
 * All uploads now use KIE.AI file upload service instead of Supabase
 */

import {
  uploadImageToKieAI,
  uploadVideoToKieAI,
  uploadImagesToKieAI,
  uploadVideosToKieAI,
  fileToDataURL as kieFileToDataURL,
  getFileSizeInfo,
} from './kieFileUpload';

// Re-export KIE.AI functions for backward compatibility
export const uploadImageToSupabase = uploadImageToKieAI;
export const uploadVideoToSupabase = uploadVideoToKieAI;
export const uploadImagesToSupabase = uploadImagesToKieAI;
export const uploadVideosToSupabase = uploadVideosToKieAI;
export const fileToDataURL = kieFileToDataURL;
export { getFileSizeInfo };

/**
 * Note: API key is now required for all upload operations
 * Forms should pass apiKey from App.tsx to upload functions
 */

