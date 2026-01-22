# Image Upload Architecture Diagram

## System Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     NANO BANANA EDIT/PRO FORMS                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │  User Selects   │
                          │    Image File   │
                          └─────────────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 ▼                  ▼                  ▼
        ┌────────────────┐ ┌──────────────┐ ┌──────────────┐
        │  File Type     │ │ File Size    │ │ Count Limit  │
        │  Validation    │ │ Validation   │ │ Validation   │
        │ (JPG/PNG/WEBP) │ │ (max 30MB)   │ │ (8/10 images)│
        └────────────────┘ └──────────────┘ └──────────────┘
                                    │
                   ┌────────────────┴────────────────┐
                   │ All Validations Pass            │
                   ▼
        ┌──────────────────────────────┐
        │ Convert File to Preview      │
        │ (base64 for instant display) │
        │ Add to imagePreviews array   │
        │ Set isUploading = true       │
        └──────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
    ┌─────────────┐   ┌────────────────────┐
    │   DISPLAY   │   │   UPLOAD SERVICE   │
    │   Preview   │   │ (imageUpload.ts)   │
    │   Image     │   │                    │
    │ + Spinner   │   │ Call uploadAsset() │
    └─────────────┘   │ from Supabase      │
        ▲             └────────────────────┘
        │                     │
        │             ┌───────┴────────┐
        │             ▼                ▼
        │        ┌─────────────┐  ┌─────────────┐
        │        │  Supabase   │  │   File to   │
        │        │  Storage    │  │   Upload    │
        │        │  Validate   │  │   Ready     │
        │        └─────────────┘  └─────────────┘
        │             │
        │    ┌────────┴────────┐
        │    ▼                 ▼
        │ SUCCESS         ERROR
        │    │               │
        │    └──────┬────────┘
        │           ▼
        │  ┌─────────────────────────┐
        │  │ Get Public URL from      │
        │  │ Supabase Storage         │
        │  │ Update preview.url       │
        │  │ Set isUploading = false  │
        │  └─────────────────────────┘
        │           │
        │           ▼
        │  ┌─────────────────────────┐
        │  │ Update formData.urls[]   │
        │  │ with public URL          │
        │  └─────────────────────────┘
        │           │
        └───────────┴──────► DISPLAY ✓
                           + Green Check

    ERROR CASE:
        │
        ▼
    ┌─────────────────────────────┐
    │ Display Error Message       │
    │ Remove from imagePreviews   │
    │ Show "Upload Failed" UI     │
    └─────────────────────────────┘
```

## Component State Diagram

```
NanoBananaEditForm / NanoBananaProForm
│
├── formData: NanoBananaEditInput
│   ├── prompt: string
│   ├── image_urls: string[] ← PUBLIC URLs from Supabase
│   ├── output_format: string
│   └── image_size: string
│
├── imagePreviews: ImagePreview[]
│   ├── dataUrl: string (for display)
│   ├── url: string (public URL)
│   ├── fileName: string
│   └── isUploading: boolean
│
├── uploadError: string (error feedback)
│
└── Handlers:
    ├── handleImageSelect() → uploadImageToSupabase()
    ├── removeImage() → update form + previews
    ├── handleSubmit() → validate & send to API
    └── handleChange() → update form fields
```

## Data Flow Sequence

```
1. USER ACTION                  2. FORM PROCESSING             3. UPLOAD SERVICE
┌─────────────────┐          ┌──────────────────┐          ┌─────────────────┐
│ Drag/click      │          │ Validate file    │          │ Read file       │
│ Select image    │──────────▶│ Convert preview  │─────────▶│ Validate type   │
│                 │          │ Add to list      │          │ Check size      │
└─────────────────┘          │ Show spinner     │          │ Upload to SB    │
                             └──────────────────┘          └─────────────────┘
                                                                   │
                                                                   │ Get URL
                                                                   ▼
┌─────────────────┐          ┌──────────────────┐          ┌─────────────────┐
│ User fills      │          │ Validate all     │          │ Return public   │
│ prompt/options  │          │ uploads done     │          │ URL to form     │
│                 │          │ Validate prompt  │          │                 │
└─────────────────┘          │ Validate images  │          └─────────────────┘
                             └──────────────────┘
                                     │
                                     ▼
┌─────────────────┐          ┌──────────────────┐
│ Click submit    │         │ All validations  │
│ button          │────────▶│ passed           │
│                 │         │                  │
└─────────────────┘         │ Send to API:     │
                            │ - Prompt text    │
                            │ - Public URLs    │
                            │ - Format/size    │
                            └──────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │ KIE.AI API       │
                            │ Creates task     │
                            │ Processes images │
                            │ from Supabase    │
                            └──────────────────┘
```

## Image Upload Status Indicators

### During Upload
```
┌─────────────────────────────┐
│        ◌ ⟳ LOADING ⟲        │  ← Spinning circle overlay
│                             │
│        Preview Image        │
│        (base64 data URL)    │
│                             │
└─────────────────────────────┘
```

### After Success
```
┌─────────────────────────────┐
│    ✓ (green check)          │  ← Confirmation badge
│                             │
│        Preview Image        │
│        (still visible)      │
│                             │
└─────────────────────────────┘
✓ Stored as: https://supabase/bucket/path/file.jpg
```

### On Error
```
┌─────────────────────────────┐
│          ✕ REMOVE           │
│                             │
│        Preview Image        │
│        (grayed out)         │
│                             │
└─────────────────────────────┘

ERROR MESSAGE:
⚠ File too large: 35.5MB. Max: 30MB
(Image removed from preview)
```

## API Specification Compliance

### Nano Banana Edit
```javascript
// REQUEST SENT TO KIE.AI
{
  "model": "google/nano-banana-edit",
  "input": {
    "prompt": "User text input",
    "image_urls": [
      "https://supabase.../user123/123456_abc.jpg",  ← Public URLs
      "https://supabase.../user123/123457_def.jpg"
    ],
    "output_format": "png",
    "image_size": "1:1"
  }
}

// NO LONGER SENT ❌
{
  "image_urls": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgA..."  ← Base64 WRONG
  ]
}
```

### Nano Banana Pro
```javascript
// REQUEST SENT TO KIE.AI
{
  "model": "nano-banana-pro",
  "input": {
    "prompt": "User text input",
    "image_input": [              ← Optional references
      "https://supabase.../..."   ← Public URLs
    ],
    "aspect_ratio": "1:1",
    "resolution": "2K",
    "output_format": "png"
  }
}
```

## Error Handling Flow

```
User Uploads File
│
├─► File Type Invalid
│   └─► Show: "INVALID TYPE. REQUIRED: JPG / PNG / WEBP"
│   └─► Action: None, accept new file
│
├─► File Size Too Large
│   └─► Show: "FILE TOO LARGE (MAX 30MB)"
│   └─► Action: Remove from preview
│
├─► Upload to Supabase Fails
│   └─► Show: "Upload failed: {error}"
│   └─► Action: Remove from preview, allow retry
│
└─► Upload Successful
    └─► Show: Green checkmark
    └─► Action: Store URL, ready for submit

Submit Form
│
├─► Images Still Uploading
│   └─► Alert: "Please wait for all images to finish uploading"
│   └─► Action: Prevent form submission
│
├─► Missing Required Images
│   └─► Alert: "Please upload at least one image" (Edit only)
│   └─► Action: Prevent form submission
│
└─► All Valid
    └─► Submit to KIE.AI API
```

## Technology Stack

```
UI Layer
├── React Components
│   ├── NanoBananaEditForm.tsx
│   ├── NanoBananaProForm.tsx
│   └── Dropzone.tsx
│
├── State Management
│   ├── formData (form inputs)
│   ├── imagePreviews (upload tracking)
│   └── uploadError (error feedback)
│
Async Layer
├── imageUpload Service
│   ├── uploadImageToSupabase()
│   └── fileToDataURL()
│
├── Supabase SDK
│   └── uploadAsset() → storage.upload()
│
├── HTTP Fetch API
│   └── Browser native fetch
│
├── File APIs
│   ├── FileReader (preview conversion)
│   ├── File validation
│   └── File size checking
│
Storage Layer
└── Supabase Storage
    └── kie-assets bucket (public)
        └── /userId/timestamp_random.ext
```

## Performance Considerations

### Concurrent Upload Example (3 images)
```
Image 1: ◌ ⟳ ........... (1.5s) ................... ✓
Image 2: ◌ ⟳ .......................... (2.5s) .. ✓
Image 3: ◌ ⟳ ............................ (2s) ✓

Time = Max(1.5s, 2.5s, 2s) = 2.5s
(Sequential would be: 1.5 + 2.5 + 2 = 6s)
Speedup: 2.4x faster with concurrent
```

### Network Optimization
```
File Size → Upload Time (typical):
1MB       → 0.5-1s
5MB       → 2-3s
10MB      → 3-5s
20MB      → 6-10s
30MB      → 10-15s

+ Time for base64 preview: ~100-500ms
+ Time for URL retrieval: ~100-200ms
```
