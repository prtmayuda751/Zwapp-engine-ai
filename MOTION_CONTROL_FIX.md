# Motion Control Upload Flow - Complete Fix

## Summary
Updated Motion Control form to follow the same Supabase upload pattern as Nano Banana forms. All file uploads (images and videos) now route through Supabase first to obtain public URLs before sending to KIE.AI's Kling 2.6 Motion Control API.

## Problem Identified
Previous implementation stored base64-encoded files directly, causing:
- "image_urls file type not supported" error from API
- Same architectural issue that affected Nano Banana forms before fix
- No upload progress feedback to user
- No validation of file types or sizes

## Solution Implemented

### 1. Extended Upload Service (`services/imageUpload.ts`)

**Added video upload support:**
```typescript
uploadVideoToSupabase(file: File): Promise<string>
uploadVideosToSupabase(files: File[]): Promise<string[]>
```

**Video validation:**
- File types: MP4, MOV, MKV, AVI
- Max size: 100MB per file (vs 30MB for images)
- Reuses existing `uploadAsset()` from Supabase service

**All functions now return public URLs, not base64**

### 2. Updated Motion Control Form (`components/TaskForm.tsx`)

**New state tracking:**
```typescript
interface ImagePreview {
  dataUrl: string;      // For preview rendering
  url: string;          // Public URL from Supabase
  fileName: string;     // Original filename
  isUploading: boolean; // Loading state
}

interface VideoPreview { ... }
```

**Upload flow for images:**
1. User selects image file via Dropzone
2. `handleImageSelect()` runs async:
   - Creates preview with loading spinner
   - Calls `uploadImageToSupabase(file)`
   - Shows upload progress
   - Updates formData.input_urls with public URL
   - Shows success checkmark when complete

**Upload flow for videos:**
1. User selects video file via Dropzone
2. `handleVideoSelect()` runs async:
   - Creates preview with loading spinner
   - Calls `uploadVideoToSupabase(file)`
   - Shows upload progress
   - Updates formData.video_urls with public URL
   - Shows success checkmark when complete

**User feedback:**
- Spinning loader during upload
- Green checkmark on success
- Error messages with detailed failure reasons
- Button state shows "UPLOADING..." while in progress
- Submit disabled until both image AND video uploaded

### 3. Data Flow Architecture

```
┌─────────────────────┐
│   User selects      │
│   image/video file  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Show preview      │
│   with spinner      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Upload to         │
│   Supabase          │
│   (validate type/   │
│    size)            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Get public URL    │
│   from Supabase     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Show success      │
│   checkmark         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Store public URL  │
│   in formData       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Send public URLs  │
│   to KIE.AI API     │
│   (NOT base64)      │
└─────────────────────┘
```

## Key Changes

### File: `services/imageUpload.ts`
- ✅ Added `uploadVideoToSupabase()` function
- ✅ Added `uploadVideosToSupabase()` function
- ✅ Extended validation for video types (MP4, MOV, MKV, AVI)
- ✅ Increased size limit to 100MB for videos

### File: `components/TaskForm.tsx`
- ✅ Replaced base64 handling with Supabase uploads
- ✅ Added ImagePreview interface
- ✅ Added VideoPreview interface
- ✅ Async `handleImageSelect()` with upload tracking
- ✅ Async `handleVideoSelect()` with upload tracking
- ✅ Visual feedback: spinners, checkmarks, error messages
- ✅ Form validation: submit only when both files uploaded
- ✅ Button text changes based on upload state

### File: `types.ts`
- ✓ No changes needed (already expects public URLs)

### File: `App.tsx`
- ✓ No changes needed (already routes correctly)

## Validation Rules

**Images (JPG/PNG):**
- ✅ Type validation: image/jpeg, image/png, image/webp
- ✅ Size limit: 30MB per image
- ✅ Dimension requirement: >300px (handled by API)

**Videos (MP4/MOV/MKV/AVI):**
- ✅ Type validation: video/mp4, video/quicktime, video/x-matroska, video/x-msvideo
- ✅ Size limit: 100MB per video
- ✅ Duration: 3-30s (handled by API validation)

## Error Handling

All validation errors display in red banner above form:
- Invalid file type
- File too large
- Upload failed
- Network errors

User can retry by selecting a different file.

## Testing Checklist

- [x] Image upload shows loading spinner
- [x] Image upload shows success checkmark
- [x] Video upload shows loading spinner
- [x] Video upload shows success checkmark
- [x] Form disabled while uploading
- [x] Submit button shows "UPLOADING..." text
- [x] Submit disabled until both files uploaded
- [x] Error messages display for invalid files
- [x] Public URLs stored in formData (not base64)
- [x] API receives correct format (URLs)
- [x] No TypeScript compilation errors

## Consistency with Nano Banana Forms

Motion Control form now follows identical pattern as:
- `components/NanoBananaEditForm.tsx`
- `components/NanoBananaProForm.tsx`

All forms now implement:
1. Async file upload to Supabase
2. Preview state tracking (loading/success/error)
3. User feedback (spinners/checkmarks/error messages)
4. Form validation (submit only when ready)
5. Public URL storage (no base64)

## API Compliance

Motion Control requests now send:
```typescript
{
  prompt: string;
  input_urls: ["https://supabase-url.com/image.jpg"],  // ✅ Public URL
  video_urls: ["https://supabase-url.com/video.mp4"],  // ✅ Public URL
  character_orientation: 'image' | 'video';
  mode: '720p' | '1080p';
}
```

Previously sent:
```typescript
{
  input_urls: ["data:image/jpeg;base64,..."],  // ❌ Base64 (caused error)
  video_urls: ["data:video/mp4;base64,..."],   // ❌ Base64 (caused error)
}
```

## References

- **Kling 2.6 API**: `kling-2.6/motion-control`
- **Upload Service**: `services/imageUpload.ts`
- **Supabase Config**: `services/supabase.ts`
- **Form Component**: `components/TaskForm.tsx`
- **Type Definitions**: `types.ts` (MotionControlInput)

## Deployment Notes

1. All changes are backward compatible
2. No breaking changes to existing APIs
3. Uses existing Supabase infrastructure
4. No new dependencies added
5. Dev server requires no additional configuration
