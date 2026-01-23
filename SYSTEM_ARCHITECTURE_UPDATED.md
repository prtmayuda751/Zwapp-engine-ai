# System Architecture - Updated (Jan 23, 2026)

## High-Level Flow

```
USER INTERFACE (React Components)
    ↓
    ├─ Form Components (TaskForm, ImageEditForm, etc.)
    │   ├─ No more credit validation
    │   └─ Only checks: file uploaded, prompt filled, etc.
    ↓
FILE UPLOAD (kieFileUpload Service)
    ├─ User selects file from dropzone
    ├─ File uploaded to Supabase 'kie-assets' bucket
    ├─ Public URL generated from Supabase
    └─ URL stored in form state
    ↓
TASK CREATION (API Service)
    ├─ Form submitted with Supabase URL
    ├─ Request sent to KIE.AI API with URL
    │   POST /api/proxy/jobs/createTask
    │   { model: "...", input: { image_url: "https://...", ... } }
    └─ Returns taskId
    ↓
STATE MANAGEMENT (App.tsx)
    ├─ Task added to tasks array with state='waiting'
    ├─ Task appears in QueueList
    └─ Progress bar begins animating
    ↓
POLLING (App.tsx - every 3 seconds)
    ├─ For each waiting task, query status
    │   GET /api/proxy/jobs/recordInfo?taskId=...
    ├─ Receive state + resultJson
    ├─ Update task state in local array
    └─ When state='success', resultJson has results
    ↓
OUTPUT DISPLAY (StatusTerminal Component)
    ├─ Parse resultJson
    ├─ Extract resultUrls array
    ├─ Display image/video from URL
    └─ Provide download link
```

---

## Component Hierarchy

```
App.tsx (Main)
├─ Header
│  ├─ KIE.AI Logo
│  ├─ API Status (no longer shows credits)
│  ├─ User Info
│  └─ Settings & Logout Buttons
├─ Main Content (Grid: 5 col left, 7 col right)
│  ├─ LEFT COLUMN
│  │  ├─ Module Navigation
│  │  │  ├─ Motion Control
│  │  │  ├─ Nano Banana (expandable)
│  │  │  │  ├─ Gen Form
│  │  │  │  ├─ Edit Form
│  │  │  │  └─ Pro Form
│  │  │  └─ Image Generation (expandable)
│  │  │     ├─ Qwen Edit Form
│  │  │     └─ Z-Image Form
│  │  └─ Active Form Component
│  │     ├─ TaskForm
│  │     ├─ ImageEditForm
│  │     ├─ NanoBananaGenForm
│  │     ├─ NanoBananaEditForm
│  │     ├─ NanoBananaProForm
│  │     └─ ZImageForm
│  │
│  └─ RIGHT COLUMN
│     ├─ QueueList (Shows all tasks)
│     └─ StatusTerminal (Shows active task + output)
│
└─ SettingsModal (Overlay for API key configuration)
```

---

## Data Flow Diagram

### Upload Phase
```
User selects file
    ↓
Dropzone.onFileSelect()
    ↓
uploadImageToKieAI(file, apiKey)
    ├─ Validate file type/size
    ├─ uploadFileToSupabaseGetUrl(file, 'images')
    │   ├─ Get Supabase auth
    │   ├─ Generate unique filename
    │   ├─ Upload to 'kie-assets/images/{path}'
    │   └─ Return public URL
    └─ Return URL to component
    ↓
Component stores URL in formData.image_url
    ↓
UI updates with preview + checkmark
```

### Submission Phase
```
User clicks SUBMIT button
    ├─ Validate: image_url is not empty, starts with "https://"
    ├─ Create payload with image_url
    └─ handleCreateTask(payload)
        ├─ Call API: createTask(apiKey, modelName, input)
        │   ├─ POST to /api/proxy/jobs/createTask
        │   ├─ Header: Authorization: Bearer {apiKey}
        │   └─ Body: { model, input }
        ├─ Receive: { code, data: { taskId }, msg }
        ├─ Create LocalTask object
        └─ Add to tasks array
            ↓
            Task appears in QueueList with "QUEUE #1"
```

### Processing Phase (KIE.AI Backend)
```
KIE.AI receives POST request
    ├─ Validates taskId generation
    ├─ Fetches image from Supabase URL
    ├─ Processes through model pipeline
    ├─ Generates output (image/video)
    ├─ Stores result
    └─ Sets task state to 'waiting'
        ↓
        (Polling client checks status periodically)
        ↓
        When processing complete: state='success'
        resultJson = { resultUrls: [...] }
```

### Polling Phase
```
Every 3 seconds (if tasks.some(t => t.state === 'waiting'))
    ├─ For each waiting task:
    │   ├─ Call queryTask(apiKey, taskId)
    │   │   ├─ GET /api/proxy/jobs/recordInfo?taskId=...
    │   │   ├─ Header: Authorization: Bearer {apiKey}
    │   │   └─ Response: { code, data: TaskRecordInfo }
    │   └─ Update local task state
    ├─ If state changed from 'waiting' to 'success':
    │   ├─ Log: "Task updated: waiting → success"
    │   ├─ Progress jumps to 100%
    │   └─ resultJson now contains results
    └─ Update UI with new state
```

### Output Display Phase
```
StatusTerminal component receives active task
    ├─ Check: task.state === 'success' && task.resultJson
    ├─ Parse: JSON.parse(task.resultJson)
    │   → { resultUrls: ["https://..."] }
    ├─ Extract: resultUrl = resultUrls[0]
    ├─ Detect type: if URL ends with .mp4/.mov → video, else image
    └─ Render:
        ├─ If image: <img src={resultUrl} />
        └─ If video: <video src={resultUrl} controls />
```

---

## State Management

### App.tsx Global State
```typescript
// Auth
session: User | null
authLoading: boolean

// Tasks
tasks: LocalTask[] = [
  {
    taskId: string
    model: string
    state: 'waiting' | 'success' | 'fail'
    progress: number (0-100)
    resultJson?: string
    // ... other fields
  }
]
selectedTaskId: string | null

// UI
activeModule: ModuleType
expandNano: boolean
expandImageGen: boolean
isSubmitting: boolean
isSettingsOpen: boolean
logs: string[]

// Config
apiKey: string

// Removed: totalCredits, creditsLoading
```

### LocalTask State
```typescript
interface LocalTask {
  taskId: string
  model: string
  state: 'waiting' | 'success' | 'fail'
  param: string (JSON input params)
  resultJson?: string (JSON { resultUrls: [...] })
  createTime: number (timestamp)
  progress: number (0-100, client-side simulation)
  isRead: boolean
  queuePosition?: number
  // Plus fields from API response
}
```

---

## API Contract

### Create Task Request
```javascript
POST /api/proxy/jobs/createTask
Authorization: Bearer {apiKey}
Content-Type: application/json

{
  "model": "google/nano-banana",
  "input": {
    "prompt": "...",
    "image_urls": ["https://..."],
    "output_format": "png",
    "image_size": "1:1"
  }
}

Response:
{
  "code": 200,
  "msg": "OK",
  "data": {
    "taskId": "..."
  }
}
```

### Query Task Request
```javascript
GET /api/proxy/jobs/recordInfo?taskId={taskId}
Authorization: Bearer {apiKey}

Response (Waiting):
{
  "code": 200,
  "msg": "OK",
  "data": {
    "taskId": "...",
    "model": "google/nano-banana",
    "state": "waiting",
    "createTime": 1234567890,
    "costTime": null,
    "resultJson": null
  }
}

Response (Success):
{
  "code": 200,
  "msg": "OK",
  "data": {
    "taskId": "...",
    "model": "google/nano-banana",
    "state": "success",
    "createTime": 1234567890,
    "costTime": 15000,
    "resultJson": "{\"resultUrls\":[\"https://...\"]}"
  }
}

Response (Failed):
{
  "code": 200,
  "msg": "OK",
  "data": {
    "taskId": "...",
    "state": "fail",
    "failCode": "INVALID_INPUT",
    "failMsg": "..."
  }
}
```

---

## File Upload Sequence Diagram

```
┌─────────┐         ┌──────────┐         ┌──────────────┐         ┌─────────────┐
│  React  │         │Dropzone  │         │ kieFileUpload│         │  Supabase   │
│Component│         │Component │         │  Service     │         │  Storage    │
└────┬────┘         └────┬─────┘         └──────┬───────┘         └─────┬───────┘
     │                    │                      │                      │
     │ Select file        │                      │                      │
     ├───────────────────>│                      │                      │
     │                    │ onFileSelect()       │                      │
     │                    ├──────────────────────>│                      │
     │                    │                      │ Validate file type   │
     │                    │                      │ & size               │
     │                    │                      │                      │
     │                    │                      │ Get auth user        │
     │                    │                      │ Generate filename    │
     │                    │                      │                      │
     │                    │                      │ Upload file          │
     │                    │                      ├─────────────────────>│
     │                    │                      │                      │
     │                    │                      │                      │ Store file
     │                    │                      │ <─────────────────────┤
     │                    │                      │ Confirm upload       │
     │                    │                      │ Get public URL       │
     │                    │                      │                      │
     │                    │<──────────────────────┤ Return URL          │
     │                    │      Public URL       │                      │
     │<───────────────────┤                       │                      │
     │ URL stored in      │                       │                      │
     │ formData.image_url │                       │                      │
     │                    │                       │                      │
```

---

## Removed Components

### Credit System (Removed)
```
❌ creditRefreshRef (polling)
❌ totalCredits (state)
❌ creditsLoading (state)
❌ refreshCredits() (function)
❌ fetchUserCredits() (import)
❌ getCreditCost() (import)
❌ getCreditWarningLevel() (import)
❌ formatCreditsShort() (import)
❌ Credit display in header
❌ Credit validation in form submission
❌ userCredits prop on all forms
```

### Form Credit Display (Removed)
```
❌ Green "Credits OK" box
❌ Yellow "Low Credits" box
❌ Red "Insufficient Credits" box
❌ Credit cost in button text
❌ Credit validation preventing submission
```

---

## Configuration Files

### vercel.json
```json
{
  "rewrites": [
    {
      "source": "/api/proxy/:path*",
      "destination": "https://api.kieai.com/:path*"
    }
  ]
}
```

This proxies requests to KIE.AI API, avoiding CORS issues.

### Environment Variables
```
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

These are used by supabase.ts for authentication and file uploads.

---

## Performance Characteristics

| Operation | Time | Notes |
|-----------|------|-------|
| File upload to Supabase | 2-5 sec | Depends on file size and network |
| Task creation API call | 0.5-1 sec | Minimal data transferred |
| Polling interval | 3 sec | Configurable, every 3 seconds |
| Progress animation | 1 sec/% | Smooth visual feedback |
| Task processing | 10-60 sec | Depends on model and input |
| Total time (typical) | 15-65 sec | Upload + processing + polling |

---

## Scalability Considerations

### Current Limitations
- Single task polling per interval (no batching)
- 50 tasks max in queue (before trimming oldest)
- In-memory state (lost on page refresh)

### Future Improvements
- Batch polling for multiple tasks
- Persistent storage (IndexedDB)
- WebSocket for real-time updates
- Pagination for large queue

---

## Monitoring & Debugging

### Browser Console Logs
```javascript
// Supabase upload logs
[Upload] Starting image upload: filename.jpg
[Upload] Uploading to Supabase: images/...
[Upload] Supabase URL generated: https://...

// Task creation logs
> Initiating generation sequence [model]...
> Task created successfully. ID: xxxxx

// Polling logs
[Polling] Checking status for task xxxxx
> Task xxxx updated: waiting → success

// Error logs
[Upload] Upload failed: Network error
[API] Polling error for taskId: 404 Not Found
```

### Network Inspection (DevTools)
1. Open F12 → Network tab
2. Filter by "Fetch/XHR"
3. Watch for:
   - POST requests to `/api/proxy/jobs/createTask` ✓
   - GET requests to `/api/proxy/jobs/recordInfo` ✓
   - Error responses (4xx, 5xx) should be investigated

---

## Summary

The system is now:
- **Simpler**: No credit complexity
- **Cleaner**: UI focused on tools, not account management
- **Functional**: Upload + submit + output workflow works smoothly
- **Scalable**: Can handle multiple concurrent tasks
- **Robust**: Polling ensures eventual consistency

Credit management is delegated to the KIE.AI platform, keeping this system lean and focused on what it does best: processing tasks.
