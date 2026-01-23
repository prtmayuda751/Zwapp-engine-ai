# UGC AI Orchestration Workspace - Integration Guide

## Overview

Sistem UGC AI Orchestration Workspace telah berhasil diintegrasikan ke dalam Zwapp-engine-ai. Sistem ini memungkinkan content creator, marketer, dan brand owner untuk membuat UGC content berkualitas tinggi dengan AI-powered consistency control.

## Architecture

### 6 Tier Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: UI Components                                 │
│  - InputModule.tsx                                      │
│  - ScriptReviewPanel.tsx                                │
│  - PromptEngineeringPanel.tsx                           │
│  - ImageGalleryView.tsx                                 │
│  - QAResultsPanel.tsx                                   │
│  - VideoGenerationPanel.tsx                             │
└─────────────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Orchestration                                 │
│  - UGCOrchestrationWorkspace.tsx (Router)               │
│  - useUGCStore (Zustand State Management)               │
└─────────────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 3: Common Components                             │
│  - Button.tsx (Reusable UI)                             │
│  - FileUpload.tsx (Drag-drop)                           │
│  - ProgressBar.tsx (8-stage indicator)                  │
│  - Toast.tsx (Notifications)                            │
└─────────────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Orchestration Services                        │
│  - ugcOrchestration.ts (Pipeline coordinator)           │
│  - Services:                                            │
│    • scriptGeneration (OpenAI - TODO)                   │
│    • imageGeneration (Nano Banana - TODO)               │
│    • qualityAssurance (Vision API - TODO)               │
│    • videoGeneration (Veo 3.1 - TODO)                   │
└─────────────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 5: External AI Services                          │
│  - OpenAI (GPT-3.5/GPT-4 for scripting)                 │
│  - KIE.AI Nano Banana (Image generation)                │
│  - KIE.AI Veo 3.1 (Video generation)                    │
│  - Google Vision API (Quality analysis)                 │
└─────────────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 6: Data & Storage                                │
│  - Supabase (Database + Storage)                        │
│  - Cloud Storage (Generated assets)                     │
└─────────────────────────────────────────────────────────┘
```

## Workflow Stages

### 1. INPUT Stage
**File**: `components/UGC/stages/InputModule.tsx`

User uploads:
- Model photos (2-5 recommended)
- Product photos (3-4 recommended)
- Narrative links (TikTok, Instagram, Google Docs)

**Store actions**:
- `addModelPhotos()`
- `addProductPhotos()`
- `addNarrativeLink()`

### 2. ANALYSIS Stage
**Transition**: Automatic after INPUT complete
**Duration**: ~30 seconds

System extracts:
- Model profile (look, body type, expressions)
- Product profile (name, category, colors, features)
- Narrative context (brand voice, target audience, story)

**Service**: `UGCOrchestrationService.analyzeInputAssets()`

### 3. SCRIPTING Stage
**File**: `components/UGC/stages/ScriptReviewPanel.tsx`

System generates:
- Multi-scene UGC script
- Scene descriptions with actions and dialogue
- Voiceover text

User can:
- Review script
- Modify scenes
- Approve and continue

**Service**: `UGCOrchestrationService.generateScript()`

### 4. PROMPTING Stage
**File**: `components/UGC/stages/PromptEngineeringPanel.tsx`

System auto-generates prompts for each scene:
- Scene descriptions
- Visual style specifications
- Negative prompts (what NOT to generate)

User can:
- Edit and customize prompts
- Add custom instructions
- Set reference images

**Service**: `UGCOrchestrationService.engineerPrompts()`

### 5. GENERATING Stage
**File**: `components/UGC/stages/ImageGalleryView.tsx`

System generates:
- 3 images per scene (parallel processing)
- Total: 9 images from 3 scenes
- Consistency metrics for each image

User can:
- Review images
- Approve/reject individual images
- Request regenerations

**Service**: `UGCOrchestrationService.generateImages()`

### 6. QA Stage
**File**: `components/UGC/stages/QAResultsPanel.tsx`

System analyzes:
- Model consistency across images
- Product placement accuracy
- Hallucinations and artifacts
- Overall quality scores

Results show:
- Pass/Fail status per image
- Confidence scores
- Suggested fixes

**Service**: `UGCOrchestrationService.performQualityAssurance()`

### 7. VIDEO_GENERATION Stage (Optional)
**File**: `components/UGC/stages/VideoGenerationPanel.tsx`

User can optionally generate:
- Video from approved images
- Smooth transitions between scenes
- Multiple resolution options (720p, 1080p, 4K)

**Service**: `UGCOrchestrationService.generateVideo()`

### 8. COMPLETE Stage
**Display**: Success screen with stats
- Total images generated
- Videos generated (if any)
- Scripts created
- Cost breakdown
- Download button

**Actions**:
- Download all assets as ZIP
- Return to create new project

## State Management (Zustand)

### Store Structure

```typescript
interface UGCStore {
  // Current project state
  currentProject: UGCProject | null
  
  // UI state
  isLoading: boolean
  error: string | null
  successMessage: string | null
  
  // Project management
  initializeProject(name: string): void
  resetProject(): void
  loadProject(projectId: string): void
  
  // Asset management
  addModelPhotos(assets: UploadedAsset[]): void
  removeModelPhoto(assetId: string): void
  addProductPhotos(assets: UploadedAsset[]): void
  removeProductPhoto(assetId: string): void
  addNarrativeLink(link: string): void
  removeNarrativeLink(link: string): void
  
  // Content generation
  setExtractedContext(...): void
  setGeneratedScript(script: GeneratedScript): void
  setVisualStyleGuide(guide: VisualStyleGuide): void
  addPrompt(prompt: PromptTemplate): void
  updatePrompt(promptId: string, updates: Partial<PromptTemplate>): void
  
  // Images & videos
  addGeneratedImage(image: GeneratedImage): void
  updateGeneratedImage(imageId: string, updates: Partial<GeneratedImage>): void
  addGeneratedVideo(video: GeneratedVideo): void
  
  // QA
  setQAResult(qaResult: QAResult): void
  
  // Workflow
  setCurrentStage(stage: WorkflowStage): void
  setStatus(status: ProjectStatus): void
  
  // UI
  setLoading(isLoading: boolean): void
  setError(error: string | null): void
  setSuccessMessage(message: string | null): void
}
```

### Usage in Components

```typescript
import { useUGCStore } from '../../store/ugcStore';

export const MyComponent = () => {
  const store = useUGCStore();
  
  // Read state
  const project = store.currentProject;
  const isLoading = store.isLoading;
  
  // Dispatch actions
  const handleAddPhotos = (files: File[]) => {
    const assets = files.map(file => ({
      id: crypto.randomUUID(),
      fileName: file.name,
      // ... other properties
    }));
    store.addModelPhotos(assets);
  };
  
  // Trigger workflow transitions
  const handleApprove = () => {
    store.setCurrentStage('SCRIPTING');
  };
};
```

## Component File Structure

```
components/UGC/
├── UGCOrchestrationWorkspace.tsx    [Main router & orchestrator]
│
├── common/                           [Reusable components]
│   ├── Button.tsx
│   ├── FileUpload.tsx
│   ├── ProgressBar.tsx
│   └── Toast.tsx
│
└── stages/                           [Workflow stage components]
    ├── InputModule.tsx               [Stage 1: Asset upload]
    ├── ScriptReviewPanel.tsx         [Stage 3: Script review]
    ├── PromptEngineeringPanel.tsx    [Stage 4: Prompt customization]
    ├── ImageGalleryView.tsx          [Stage 5: Image review]
    ├── QAResultsPanel.tsx            [Stage 6: Quality assurance]
    └── VideoGenerationPanel.tsx      [Stage 7: Optional video gen]

store/
└── ugcStore.ts                       [Zustand state management]

services/
└── ugcOrchestration.ts               [Pipeline orchestration logic]

types/
└── ugc.ts                            [TypeScript definitions]
```

## Data Models

### UGCProject
```typescript
{
  id: string                          // Unique project ID
  name: string                        // User-defined project name
  status: 'DRAFT' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  currentStage: WorkflowStage         // Current workflow stage
  
  inputAssets: {                      // User uploads
    modelPhotos: UploadedAsset[]
    productPhotos: UploadedAsset[]
    narrativeLinks: string[]
  }
  
  extractedContext: {                 // Auto-extracted analysis
    modelProfile: ModelProfile        // Look, body type, expressions
    productProfile: ProductProfile    // Name, colors, features
    narrativeContext: NarrativeContext // Brand voice, target audience
  }
  
  generatedContent: {                 // Generated outputs
    script: GeneratedScript           // Scene-based script
    visualStyleGuide: VisualStyleGuide // Color palette, cinematography
    promptTemplates: PromptTemplate[] // Prompts for each scene
    images: GeneratedImage[]          // Generated images with metrics
    videos: GeneratedVideo[]          // Generated videos (optional)
  }
  
  qaResults: {                        // Quality assurance
    imageQA: QAResult[]               // Per-image QA results
    overallPassRate: number           // 0-100
  }
  
  // Metadata
  createdAt: number
  updatedAt: number
  completedAt: number | null
  estimatedCompletionTime: number | null
}
```

### GeneratedImage (with Consistency Metrics)
```typescript
{
  id: string
  sceneNumber: number
  imageUrl: string                    // Signed URL from Supabase
  consistency: {
    modelConsistency: number          // 0-100: Face/body match
    productPlacement: number          // 0-100: Product visible & correct
    styleCohesion: number             // 0-100: Matches visual style guide
    overallQuality: number            // 0-100: Technical quality
  }
  approved: boolean                   // User approval flag
  regenerationCount: number           // How many times regenerated
}
```

## Integration with Main App

The UGC system is integrated into the main App.tsx as a new module:

1. **Menu Button**: 🎬 UGC AI Studio button in main navigation
2. **Module Type**: Added 'ugc' to ModuleType union
3. **Rendering**: Full-screen UGC workspace when selected
4. **Separation**: Independent of other KIE.AI modules

```typescript
// In App.tsx
import UGCOrchestrationWorkspace from './components/UGC/UGCOrchestrationWorkspace';

{activeModule === 'ugc' && (
  <UGCOrchestrationWorkspace />
)}
```

## TODO: Backend Services

The following services need implementation:

### 1. scriptGeneration.ts
```typescript
export async function generateScriptWithOpenAI(
  modelProfile: ModelProfile,
  productProfile: ProductProfile,
  narrativeContext: NarrativeContext,
  apiKey: string
): Promise<GeneratedScript>
```

### 2. imageGeneration.ts
```typescript
export async function generateImageWithNanoBanana(
  modelPhoto: string,        // URL or base64
  productPhoto: string,      // URL or base64
  prompt: PromptTemplate,
  apiKey: string
): Promise<GeneratedImage>
```

### 3. qualityAssurance.ts
```typescript
export async function analyzeImageConsistency(
  imageUrl: string,
  modelProfileDescription: string,
  apiKey: string
): Promise<QAResult>
```

### 4. videoGeneration.ts
```typescript
export async function generateVideoWithVeo(
  images: GeneratedImage[],
  apiKey: string
): Promise<GeneratedVideo>
```

## Cost Model

Based on free/cheap AI tiers:

```
Per Project Cost:
- Image generation (3 images): 3 × $0.20 = $0.60
- Script generation: $0.01 (OpenAI free tier mostly)
- QA analysis: $0.05 (Vision API free quota)
- Video generation (optional): $2.50

Total per project: ~$1.16 without video, ~$3.66 with video

Sustainable at: $5-10 revenue per project
Gross margin: 400-750%
```

## Optimization Tips

1. **Batch Processing**: Generate images in parallel (3 at a time)
2. **Caching**: Cache extracted context for multiple generations
3. **Progressive Enhancement**: Start with images, then optional video
4. **Cost Control**: Free tier APIs + cheap paid services
5. **Real-time Updates**: WebSocket for progress tracking

## Production Checklist

- [ ] Implement OpenAI script generation service
- [ ] Implement Nano Banana image generation service
- [ ] Implement Vision API QA analysis
- [ ] Implement Veo 3.1 video generation
- [ ] Setup Supabase database schema
- [ ] Setup Supabase file storage
- [ ] Add authentication/authorization
- [ ] Add project persistence
- [ ] Add WebSocket for real-time progress
- [ ] Add analytics and monitoring
- [ ] Add error handling and retry logic
- [ ] Add rate limiting
- [ ] Add user quotas/credits system
- [ ] Deploy to production

## Usage Example

```typescript
// User flow
1. Click "🎬 UGC AI Studio" in main menu
2. Click "New Project" → Enter project name
3. Upload model photos (drag-drop)
4. Upload product photos (drag-drop)
5. Paste narrative link (TikTok/Instagram/Google Doc)
6. Click "Analyze & Generate Script"
7. System:
   - Extracts context from assets
   - Generates script in ~45 seconds
   - User reviews and approves
8. System engineers prompts for each scene
9. System generates images (~30 seconds for 9 images)
10. User reviews images, approves best ones
11. System runs QA checks
12. (Optional) Generate video from images
13. Download all assets as ZIP

Total time: ~4-5 minutes for complete project
```

## Performance Metrics

Expected performance with optimized backend:

```
Analysis stage: ~30s
Script generation: ~45s
Prompt engineering: ~20s
Image generation: ~30s (3 batches of 3 images in parallel)
QA analysis: ~20s
Total: ~2.5-3 minutes

Cost: ~$1.00-2.50 per project (without video)
User capacity: 240 projects/day/server (at $5+ revenue = $1200/day revenue)
```

## Support & Debugging

### Enable DevTools
```typescript
// Zustand store includes devtools integration
// Can inspect state changes in browser console
localStorage.debug = 'ugc-store'
```

### Common Issues
1. **File upload fails**: Check MIME types, file size limits
2. **Images don't load**: Verify Supabase URLs, CORS settings
3. **State not updating**: Check store action syntax, reducer functions

## References

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [OpenAI API](https://platform.openai.com/docs)
- [KIE.AI Documentation](https://kie.ai/docs)
- [Google Vision API](https://cloud.google.com/vision/docs)
- [Supabase](https://supabase.com/docs)
