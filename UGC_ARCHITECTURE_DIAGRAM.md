# UGC AI Orchestration Workspace - Visual Architecture

## System Overview Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                     ZWAPP ENGINE AI MAIN APP                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Header Navigation Bar                                           │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ KIE.AI │ Motion │ Nano Banana ▼ │ Image Gen ▼ │ 🎬 UGC AI Studio │
│  │         Control │├─Gen           │├─Qwen Edit  │ [ACTIVE] │
│  │         │       │├─Edit          │├─Z-Image   │            │
│  │         │       │└─Pro           └────────────┘            │
│  └─────────────────────────────────────────────────────────────┘
│
│  ┌─────────────────────────────────────────────────────────────┐
│  │                 UGC AI STUDIO WORKSPACE                     │
│  │         (Full Width When Module is Selected)                │
│  │                                                             │
│  │  ┌───────────────────────────────────────────────────────┐ │
│  │  │  Header: Project Name │ Current Stage │ Progress Bar │ │
│  │  └───────────────────────────────────────────────────────┘ │
│  │                                                             │
│  │  ┌─ Stage 1: INPUT ────────────────────────────────────┐   │
│  │  │ 📸 Upload Model Photos                             │   │
│  │  │ [Drop Zone with previews]                          │   │
│  │  │                                                    │   │
│  │  │ 📦 Upload Product Photos                          │   │
│  │  │ [Drop Zone with previews]                         │   │
│  │  │                                                    │   │
│  │  │ 🔗 Add Narrative Links                            │   │
│  │  │ [Input field: TikTok/Instagram/Google Docs links] │   │
│  │  │ [Added links list with remove buttons]            │   │
│  │  │                                                    │   │
│  │  │ [Cancel] [✨ Analyze & Generate Script]           │   │
│  │  └────────────────────────────────────────────────────┘   │
│  │                                                             │
│  │  [Auto Transitions to ANALYSIS...]                         │
│  │                                                             │
│  │  ┌─ Stage 2: ANALYSIS ──────────────────────────────────┐  │
│  │  │ ⚙️  Analyzing your assets...                         │  │
│  │  │ [Spinner animation]                                │  │
│  │  │ Extracting model profile, product details,         │  │
│  │  │ and narrative context                              │  │
│  │  └────────────────────────────────────────────────────┘  │
│  │                                                             │
│  │  ┌─ Stage 3: SCRIPTING ─────────────────────────────────┐ │
│  │  │ Script Title: [Generated Title]                     │ │
│  │  │ Duration: 0:16 (16 seconds)                         │ │
│  │  │                                                    │ │
│  │  │ Scene 1: Introduction                             │ │
│  │  │ └─ Setting: Bright, natural light room            │ │
│  │  │ └─ Action: Model holds up product naturally       │ │
│  │  │ └─ Dialogue: "So I just got this new [product]"  │ │
│  │  │                                                    │ │
│  │  │ Scene 2: Product Showcase                         │ │
│  │  │ └─ Setting: Different angles, lifestyle context   │ │
│  │  │ └─ Action: Model demonstrates product features    │ │
│  │  │ └─ Dialogue: "What I love most is..."             │ │
│  │  │                                                    │ │
│  │  │ Scene 3: Call to Action                           │ │
│  │  │ └─ Setting: Return to original setting            │ │
│  │  │ └─ Action: Model with product                     │ │
│  │  │ └─ Dialogue: "You should totally check it out"    │ │
│  │  │                                                    │ │
│  │  │ [Back] [Approve & Continue]                       │ │
│  │  └────────────────────────────────────────────────────┘ │
│  │                                                             │
│  │  ┌─ Stage 4: PROMPTING ─────────────────────────────────┐ │
│  │  │ ✨ Prompt Engineering                               │ │
│  │  │ Review and customize AI prompts for image generation│ │
│  │  │                                                    │ │
│  │  │ Scene 1 ▶                                          │ │
│  │  │ Young professional woman in bright room...         │ │
│  │  │ [Click to expand and edit]                         │ │
│  │  │                                                    │ │
│  │  │ Scene 2 ▼                                          │ │
│  │  │ ┌──────────────────────────────────────────────┐   │ │
│  │  │ │ Scene Description:                          │   │ │
│  │  │ │ [Editable textarea]                         │   │ │
│  │  │ │                                             │   │ │
│  │  │ │ Visual Style:                               │   │ │
│  │  │ │ [Editable input field]                      │   │ │
│  │  │ │                                             │   │ │
│  │  │ │ Negative Prompts:                           │   │ │
│  │  │ │ [Editable input field, comma-separated]     │   │ │
│  │  │ └──────────────────────────────────────────────┘   │ │
│  │  │                                                    │ │
│  │  │ Scene 3 ▶                                          │ │
│  │  │ Close-up product shot with model's hands...        │ │
│  │  │                                                    │ │
│  │  │ [Back] [Generate Images]                          │ │
│  │  └────────────────────────────────────────────────────┘ │
│  │                                                             │
│  │  ┌─ Stage 5: GENERATING ────────────────────────────────┐ │
│  │  │ 🖼️  Image Gallery                                   │ │
│  │  │ Generated 9 images using Nano Banana               │ │
│  │  │                                                    │ │
│  │  │ ┌────────┐ ┌────────┐ ┌────────┐                   │ │
│  │  │ │ Scene 1│ │ Scene 1│ │ Scene 1│                   │ │
│  │  │ │ var 1  │ │ var 2  │ │ var 3  │                   │ │
│  │  │ └────────┘ └────────┘ └────────┘                   │ │
│  │  │ Quality: 92%  Quality: 88%  Quality: 95%          │ │
│  │  │                                                    │ │
│  │  │ ┌────────┐ ┌────────┐ ┌────────┐                   │ │
│  │  │ │ Scene 2│ │ Scene 2│ │ Scene 2│                   │ │
│  │  │ │ var 1  │ │ var 2  │ │ var 3  │                   │ │
│  │  │ └────────┘ └────────┘ └────────┘                   │ │
│  │  │ Quality: 87%  Quality: 91%  Quality: 89%          │ │
│  │  │                                                    │ │
│  │  │ ┌────────┐ ┌────────┐ ┌────────┐                   │ │
│  │  │ │ Scene 3│ │ Scene 3│ │ Scene 3│ [Selected]       │ │
│  │  │ │ var 1  │ │ var 2  │ │ var 3  │ ▼               │ │
│  │  │ └────────┘ └────────┘ └────────┘                   │ │
│  │  │ Quality: 90%  Quality: 86%  Quality: 94%          │ │
│  │  │                                                    │ │
│  │  │ ┌─── Selected Image Details ───────────────────┐   │ │
│  │  │ │ [Image preview]                             │   │ │
│  │  │ │                                             │   │ │
│  │  │ │ Model Consistency: ████████░░ 92%          │   │ │
│  │  │ │ Product Placement: ██████████ 98%          │   │ │
│  │  │ │ Style Cohesion:    ████████░░ 94%          │   │ │
│  │  │ │ Overall Quality:   █████████░ 94%          │   │ │
│  │  │ │                                             │   │ │
│  │  │ │ ☑ Approve for final output                  │   │ │
│  │  │ └─────────────────────────────────────────────┘   │ │
│  │  │                                                    │ │
│  │  │ [Back] [Review Quality]                           │ │
│  │  └────────────────────────────────────────────────────┘ │
│  │                                                             │
│  │  ┌─ Stage 6: QA ────────────────────────────────────────┐ │
│  │  │ ✅ Quality Assurance                                 │ │
│  │  │ Consistency checks and hallucination detection       │ │
│  │  │                                                    │ │
│  │  │ Overall Pass Rate: 92%                             │ │
│  │  │ [Pie chart visualization at 92%]                   │ │
│  │  │                                                    │ │
│  │  │ ✓ Scene 1 - PASSED                                │ │
│  │  │   Model Consistency: ✓ Pass (98% confidence)      │ │
│  │  │   Product Placement: ✓ Pass (96% confidence)      │ │
│  │  │                                                    │ │
│  │  │ ⚠ Scene 2 - NEEDS REVIEW                          │ │
│  │  │   Model Consistency: ✓ Pass (94% confidence)      │ │
│  │  │   Product Placement: ✕ Fail (82% confidence)      │ │
│  │  │   Suggested Fixes:                                │ │
│  │  │   • Regenerate with adjusted product positioning  │ │
│  │  │   • Consider different angle for product          │ │
│  │  │                                                    │ │
│  │  │ ✓ Scene 3 - PASSED                                │ │
│  │  │   Model Consistency: ✓ Pass (97% confidence)      │ │
│  │  │   Product Placement: ✓ Pass (94% confidence)      │ │
│  │  │                                                    │ │
│  │  │ [Back] [Continue to Video Generation]             │ │
│  │  └────────────────────────────────────────────────────┘ │
│  │                                                             │
│  │  ┌─ Stage 7: VIDEO_GENERATION ──────────────────────────┐ │
│  │  │ 🎬 Video Generation                                 │ │
│  │  │ Optional: Generate video using KIE.AI Veo 3.1       │ │
│  │  │                                                    │ │
│  │  │ About Video Generation:                            │ │
│  │  │ ✓ Converts approved images into smooth transitions │ │
│  │  │ ✓ Adds motion and dynamics to your UGC content     │ │
│  │  │ ✓ Generated using Veo 3.1 AI model                 │ │
│  │  │ ✓ Additional cost: ~$2-5 per video                 │ │
│  │  │                                                    │ │
│  │  │ [🎬 Generate Video]                                │ │
│  │  │                                                    │ │
│  │  │ [Back] [Complete & Download]                       │ │
│  │  └────────────────────────────────────────────────────┘ │
│  │                                                             │
│  │  ┌─ Stage 8: COMPLETE ──────────────────────────────────┐ │
│  │  │ 🎉 All Done!                                        │ │
│  │  │ Your UGC content is ready for download              │ │
│  │  │                                                    │ │
│  │  │ ┌─────────┐ ┌─────────┐ ┌─────────┐               │ │
│  │  │ │    9    │ │    0    │ │    1    │               │ │
│  │  │ │ Images  │ │ Videos  │ │ Scripts │               │ │
│  │  │ └─────────┘ └─────────┘ └─────────┘               │ │
│  │  │                                                    │ │
│  │  │ [← Back] [⬇️ Download All]                         │ │
│  │  └────────────────────────────────────────────────────┘ │
│  │                                                             │
│  └─────────────────────────────────────────────────────────────┘
│
└────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
User Input                API Calls              Generated Content
(Stage 1: INPUT)         (Automatic)            (Visible to User)
    │
    ├─ Model Photos ───────────────┐
    ├─ Product Photos ──────────────│───→ [ANALYSIS]
    └─ Narrative Links ────────────┘         │
                                              ↓
                                    Google Vision API
                                    Cloud Vision Analysis
                                              │
                                              ↓
                                    Model Profile ──┐
                                    Product Profile ├─→ [SCRIPTING]
                                    Narrative Context─┤
                                                      ↓
                                            OpenAI GPT-3.5/GPT-4
                                            Script Generation
                                                      │
                                                      ↓
                                    Generated Script ──→ Stage 3
                                    (User Reviews)
                                                      │
                                                      ↓
                                    User Approves ────→ [PROMPTING]
                                                      │
                                                      ↓
                                            Claude or GPT-4
                                            Prompt Engineering
                                                      │
                                                      ↓
                                    3 Prompts per Scene → Stage 4
                                    (User Customizes)
                                                      │
                                                      ↓
                                    User Approves ────→ [GENERATING]
                                                      │
                                                      ↓
                                            KIE.AI Nano Banana
                                            Parallel Image Generation
                                            (3 batches of 3 images)
                                                      │
                                                      ↓
                                    9 Generated Images → Stage 5
                                    (User Reviews)
                                                      │
                                                      ↓
                                    User Approves ────→ [QA]
                                                      │
                                                      ↓
                                            Google Vision API
                                            Consistency Analysis
                                                      │
                                                      ↓
                                    QA Results ────────→ Stage 6
                                    (Pass/Fail)
                                                      │
                                                      ↓
                                    User Chooses ──→ [VIDEO_GENERATION]
                                    (Optional)        │
                                                      ↓
                                            KIE.AI Veo 3.1
                                            Video Creation
                                                      │
                                                      ↓
                                    Generated Video ──→ Stage 7
                                    (Optional)
                                                      │
                                                      ↓
                                              [COMPLETE]
                                                      │
                                                      ↓
                                    ZIP File Download
                                    All assets bundled
```

## State Transition Diagram

```
┌─────────┐
│  START  │
└────┬────┘
     │
     ↓
┌─────────────────────────────────┐
│ INPUT Stage                      │
│ - Upload model photos            │
│ - Upload product photos          │
│ - Add narrative links            │
│ - Click "Analyze & Generate"     │
└────┬────────────────────────────┘
     │ isComplete = true
     ↓
┌─────────────────────────────────┐
│ ANALYSIS Stage                   │
│ (Automatic, ~30 seconds)         │
│ - Extract model profile          │
│ - Extract product profile        │
│ - Extract narrative context      │
└────┬────────────────────────────┘
     │ analysisComplete = true
     ↓
┌─────────────────────────────────┐
│ SCRIPTING Stage                  │
│ - Display generated script       │
│ - User reviews scenes            │
│ - User approves or edits         │
│ - Click "Approve & Continue"     │
└────┬────────────────────────────┘
     │ scriptApproved = true
     ↓
┌─────────────────────────────────┐
│ PROMPTING Stage                  │
│ - Display auto-engineered prompts│
│ - User customizes per scene      │
│ - Click "Generate Images"        │
└────┬────────────────────────────┘
     │ promptsReady = true
     ↓
┌─────────────────────────────────┐
│ GENERATING Stage                 │
│ - Generate 3 variations per scene│
│ - Display images with metrics    │
│ - User approves selection        │
│ - Click "Review Quality"         │
└────┬────────────────────────────┘
     │ imagesSelected = true
     ↓
┌─────────────────────────────────┐
│ QA Stage                         │
│ - Run consistency checks         │
│ - Display QA results             │
│ - Show pass/fail per image       │
│ - Click "Continue to Video"      │
└────┬────────────────────────────┘
     │ qaComplete = true
     ↓
┌─────────────────────────────────┐
│ VIDEO_GENERATION Stage (Optional)│
│ - Option to generate video       │
│ - Or skip to download            │
│ - Click "Complete & Download"    │
└────┬────────────────────────────┘
     │ videoGenerationComplete = true
     ↓
┌─────────────────────────────────┐
│ COMPLETE Stage                   │
│ - Show stats (images, videos)    │
│ - Provide download button        │
│ - Option to create new project   │
└────┬────────────────────────────┘
     │
     ├─ Click "Download" → [ZIP FILE]
     │
     └─ Click "New Project" → [Back to INPUT]
```

## Component Hierarchy

```
App.tsx
├── [Other Modules]
└── UGCOrchestrationWorkspace (When activeModule === 'ugc')
    │
    ├── Header
    │   ├── Project Name
    │   ├── Current Stage Display
    │   └── ProgressBar
    │       ├── Progress Bar (0-100%)
    │       └── Stage Indicators (1-8 with checkmarks)
    │
    ├── Main Content (Based on currentStage)
    │   │
    │   ├── INPUT Stage
    │   │   └── InputModule.tsx
    │   │       ├── FileUpload (Model Photos)
    │   │       │   └── File Preview Grid
    │   │       ├── FileUpload (Product Photos)
    │   │       │   └── File Preview Grid
    │   │       └── Narrative Link Input
    │   │           └── Link List
    │   │
    │   ├── SCRIPTING Stage
    │   │   └── ScriptReviewPanel.tsx
    │   │       └── Scene Display (1-3 scenes)
    │   │           ├── Scene Title
    │   │           ├── Setting
    │   │           ├── Action
    │   │           └── Dialogue
    │   │
    │   ├── PROMPTING Stage
    │   │   └── PromptEngineeringPanel.tsx
    │   │       └── Expandable Prompt Cards (1-3)
    │   │           ├── Scene Description [Textarea]
    │   │           ├── Visual Style [Input]
    │   │           └── Negative Prompts [Input]
    │   │
    │   ├── GENERATING Stage
    │   │   └── ImageGalleryView.tsx
    │   │       ├── Image Grid (3x3 gallery)
    │   │       │   └── Image Cards with Quality %
    │   │       └── Selected Image Detail Panel
    │   │           ├── Image Preview
    │   │           ├── Consistency Metrics (4 bars)
    │   │           └── Approval Checkbox
    │   │
    │   ├── QA Stage
    │   │   └── QAResultsPanel.tsx
    │   │       ├── Overall Pass Rate (Pie Chart)
    │   │       └── Per-Image Results (3 cards)
    │   │           ├── Pass/Fail Badge
    │   │           ├── Individual Checks
    │   │           └── Suggested Fixes
    │   │
    │   └── VIDEO_GENERATION Stage
    │       └── VideoGenerationPanel.tsx
    │           ├── Info Box
    │           └── Generate Button or Video List
    │
    ├── Toast Notifications
    │   ├── Error Toast (Red)
    │   ├── Success Toast (Green)
    │   └── Info Toast (Blue)
    │
    └── Footer Actions
        ├── Back Button
        └── Next/Submit Button
```

## Store State Tree

```
useUGCStore
├── currentProject: UGCProject
│   ├── id: string
│   ├── name: string
│   ├── status: ProjectStatus
│   ├── currentStage: WorkflowStage
│   ├── inputAssets
│   │   ├── modelPhotos: UploadedAsset[]
│   │   ├── productPhotos: UploadedAsset[]
│   │   └── narrativeLinks: string[]
│   ├── extractedContext
│   │   ├── modelProfile: ModelProfile | null
│   │   ├── productProfile: ProductProfile | null
│   │   └── narrativeContext: NarrativeContext | null
│   ├── generatedContent
│   │   ├── script: GeneratedScript | null
│   │   ├── visualStyleGuide: VisualStyleGuide | null
│   │   ├── promptTemplates: PromptTemplate[]
│   │   ├── images: GeneratedImage[]
│   │   └── videos: GeneratedVideo[]
│   ├── qaResults
│   │   ├── imageQA: QAResult[]
│   │   └── overallPassRate: number
│   ├── createdAt: number
│   ├── updatedAt: number
│   ├── completedAt: number | null
│   └── estimatedCompletionTime: number | null
│
├── isLoading: boolean
├── error: string | null
├── successMessage: string | null
│
└── Actions
    ├── initializeProject(name, userId)
    ├── addModelPhotos(assets)
    ├── removeModelPhoto(assetId)
    ├── addProductPhotos(assets)
    ├── removeProductPhoto(assetId)
    ├── addNarrativeLink(link)
    ├── removeNarrativeLink(link)
    ├── setExtractedContext(...)
    ├── setGeneratedScript(script)
    ├── setVisualStyleGuide(guide)
    ├── addPrompt(prompt)
    ├── updatePrompt(promptId, updates)
    ├── addGeneratedImage(image)
    ├── updateGeneratedImage(imageId, updates)
    ├── addGeneratedVideo(video)
    ├── setQAResult(result)
    ├── setCurrentStage(stage)
    ├── setStatus(status)
    ├── setLoading(isLoading)
    ├── setError(error)
    ├── setSuccessMessage(message)
    ├── resetProject()
    └── loadProject(projectId)
```

## File Organization

```
Zwapp-engine-ai/
│
├── components/
│   ├── UGC/                           [NEW UGC System]
│   │   ├── UGCOrchestrationWorkspace.tsx
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── Toast.tsx
│   │   └── stages/
│   │       ├── InputModule.tsx
│   │       ├── ScriptReviewPanel.tsx
│   │       ├── PromptEngineeringPanel.tsx
│   │       ├── ImageGalleryView.tsx
│   │       ├── QAResultsPanel.tsx
│   │       └── VideoGenerationPanel.tsx
│   ├── [Existing components...]
│   └── ...
│
├── store/
│   ├── ugcStore.ts                    [NEW UGC Store]
│   └── [Existing stores...]
│
├── services/
│   ├── ugcOrchestration.ts            [NEW Orchestration Service]
│   ├── scriptGeneration.ts            [TODO]
│   ├── imageGeneration.ts             [TODO]
│   ├── qualityAssurance.ts            [TODO]
│   ├── videoGeneration.ts             [TODO]
│   └── [Existing services...]
│
├── types/
│   ├── ugc.ts                         [NEW UGC Types]
│   └── [Existing types...]
│
├── App.tsx                            [UPDATED - UGC integration]
├── package.json                       [UPDATED - zustand added]
│
├── UGC_IMPLEMENTATION_SUMMARY.md      [NEW]
├── UGC_INTEGRATION_GUIDE.md           [NEW]
├── UGC_ARCHITECTURE_DIAGRAM.md        [THIS FILE]
└── [Existing files...]
```

---

**Status**: ✅ Frontend Complete, Backend Services TODO
