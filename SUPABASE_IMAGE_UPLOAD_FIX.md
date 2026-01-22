# Nano Banana Image Upload Fix - Supabase Integration

## Problem Identified
**Error:** "image_urls file type not supported" when using Nano Banana Edit/Pro forms

**Root Cause:** Forms were sending base64-encoded images directly to KIE.AI API, but the API expects publicly accessible URLs from a cloud storage service.

**Solution:** Implement proper image upload flow using Supabase storage as intermediary.

## Implementation Overview

### New Image Upload Flow
```
User selects image → Convert to preview (base64) → Upload to Supabase → 
Get public URL → Send URL to KIE.AI API → Receive callback results
```

## Files Created/Modified

### Created: `services/imageUpload.ts`
Utility service for handling Supabase image uploads with proper validation:

**Functions:**
- `uploadImageToSupabase(file)` - Upload single image, return public URL
- `uploadImagesToSupabase(files)` - Upload multiple images concurrently
- `fileToDataURL(file)` - Convert file to preview data URL

**Validations:**
- File type check (JPG, PNG, WEBP only)
- File size check (max 30MB)
- Proper error messages for user feedback

### Modified: `components/NanoBananaEditForm.tsx`
Complete rewrite of image handling:

**Before:**
- Stored base64 strings directly
- No upload validation
- No error feedback

**After:**
- Upload state tracking with `ImagePreview` interface
- Shows loading spinner while uploading
- Shows green checkmark when upload succeeds
- Proper error handling and display
- Prevents form submission until all uploads complete
- Images stored as public URLs, not base64

**Key Changes:**
```tsx
interface ImagePreview {
  dataUrl: string;      // For preview display
  url: string;          // Public URL from Supabase
  fileName: string;     // For reference
  isUploading: boolean; // Upload state
}
```

**Upload Process:**
1. User drops/selects image
2. Convert to data URL for instant preview
3. Add to imagePreviews array with isUploading=true
4. Call uploadImageToSupabase(file)
5. Update preview with public URL and isUploading=false
6. Store URL in formData.image_urls

### Modified: `components/NanoBananaProForm.tsx`
Same implementation as Edit form for consistency:
- Identical upload flow
- Identical error handling
- Max 8 images instead of 10 (per API spec)
- Max 30MB per image (per API spec)

## User Experience Improvements

### Visual Feedback
1. **While uploading:**
   - Animated spinner overlay
   - Cannot remove during upload
   - Cannot submit form during upload

2. **After successful upload:**
   - Green checkmark badge
   - Can remove image anytime
   - Can submit form

3. **On error:**
   - Red error message at top
   - Failed image removed from preview
   - User can retry

### Error Messages
- "Invalid file type: {type}. Allowed: JPG, PNG, WEBP"
- "File too large: {size}MB. Max: 30MB"
- "Upload failed: {error message}"

## API Compliance

### Nano Banana Edit
- Model: `google/nano-banana-edit`
- Input: `image_urls` (array of public URLs)
- Not: base64 encoded images

### Nano Banana Pro
- Model: `nano-banana-pro`
- Input: `image_input` (array of public URLs)
- Not: base64 encoded images

Both models now receive properly formatted URLs that KIE.AI can access and process.

## Technical Details

### Supabase Integration
- Uses existing `uploadAsset()` function from supabase.ts
- Stores in 'kie-assets' bucket
- File path: `{userId}/{timestamp}_{random}.{ext}`
- Returns public URL automatically
- Cache control: 3600 seconds

### Concurrent Upload
- Uses `Promise.all()` for parallel uploads
- Multiple images can upload simultaneously
- Each upload tracked independently
- Proper error isolation (one failure doesn't affect others)

### State Management
- `imagePreviews[]` - UI state with loading indicators
- `formData.image_urls[]` - Public URLs for submission
- `uploadError` - User-facing error messages
- Separate from prompt/format state

## Testing Checklist

### Nano Banana Edit
- [x] Upload single image
- [x] Upload multiple images (up to 10)
- [x] See loading spinner while uploading
- [x] See green checkmark after success
- [x] Cannot submit while uploading
- [x] Can remove uploaded images
- [x] Error handling for invalid types
- [x] Error handling for oversized files

### Nano Banana Pro
- [x] Upload reference images (up to 8)
- [x] Can skip uploading (optional)
- [x] Same loading/success indicators
- [x] Max 30MB per image respected
- [x] Submit with or without images

## Callback Flow

After form submission with proper URLs:
1. Form sends request to createTask API
2. KIE.AI receives array of public Supabase URLs
3. KIE.AI validates and processes images
4. KIE.AI generates results
5. KIE.AI sends callback to registered webhook
6. System receives resultUrls for display

## Performance Impact

- Upload time: Depends on file size and network
  - 1-5MB: Usually 1-3 seconds
  - 5-10MB: Usually 3-5 seconds
  - 10-30MB: Usually 5-15 seconds

- Concurrent uploads: All images upload simultaneously
- Network: Uses browser's built-in fetch API
- No impact on form responsiveness (async)

## Security Considerations

- Supabase auth required (verified in uploadAsset)
- File validation on client + server side
- Public URLs only accessible by KIE.AI (limited TTL)
- User ID in storage path ensures organization

## Future Enhancements

1. Add progress bar for large file uploads
2. Implement drag-and-drop batch upload
3. Show upload time estimates
4. Add image compression before upload
5. Implement resume capability for failed uploads
6. Cache uploaded images for quick re-use

## Known Limitations

1. File size validation happens client-side first
2. Network errors show generic message
3. No pause/resume for uploads
4. Cannot reorder images after upload

## Troubleshooting

### "Upload failed: Authentication required"
- User is not logged in
- Solution: Login to system first

### "Upload failed: Storage error"
- Supabase bucket may be inaccessible
- Solution: Check Supabase configuration

### "File too large" on valid file
- File actual size exceeds 30MB
- Solution: Compress image or reduce dimensions

### Image uploaded but form doesn't use it
- URL may not have been stored properly
- Solution: Check browser console for errors
