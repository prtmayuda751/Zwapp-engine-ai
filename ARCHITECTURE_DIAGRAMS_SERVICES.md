# UGC AI Architecture Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐      │
│  │ Input Stage  │  │ Script Stage │  │ Prompting Stage  │  ... │
│  └──────────────┘  └──────────────┘  └──────────────────┘      │
│  (UGCOrchestrationWorkspace.tsx + 6 Stage Components)           │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              │ State Updates
                              │
┌─────────────────────────────▼─────────────────────────────────────┐
│                     State Management Layer                        │
│                       (Zustand Store)                             │
│  • Project state                                                  │
│  • Generated assets                                               │
│  • UI state (loading, errors, progress)                          │
│  • 30+ Actions                                                    │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              │ API Calls
                              │
┌─────────────────────────────▼──────────────────────────────────────┐
│                    Service Layer                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │          Orchestration Service (Pipeline Control)        │    │
│  │         services/ugcOrchestration.ts (350 lines)        │    │
│  │  • executeFullPipeline()                                 │    │
│  │  • executeSingleStage()                                  │    │
│  │  • Coordinates all stages                                │    │
│  └──────────────────────────────────────────────────────────┘    │
│                              ▲                                     │
│                              │                                     │
│  ┌─────────┬────────┬────────┴───────┬─────────┐               │
│  │          │        │                │         │               │
│  ▼          ▼        ▼                ▼         ▼               │
│┌─────────┐┌─────────┐┌──────────┐┌──────────┐┌──────────┐     │
││ Script  ││ Image   ││ Quality  ││ Video    ││ API      │     │
││ Service ││ Service ││ Assurance││ Service  ││ Config   │     │
││(OpenAI)││(Banana) ││(Vision)  ││(Veo 3.1) ││Manager   │     │
│└─────────┘└─────────┘└──────────┘└──────────┘└──────────┘     │
└──────────────────────────────────────────────────────────────────┘
        │          │           │           │
        ▼          ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External APIs                                │
│  OpenAI Chat | KIE.AI Nano Banana | Google Vision | Veo 3.1   │
└─────────────────────────────────────────────────────────────────┘
```

## Pipeline Workflow

```
START
  │
  ├─────────────────────────────────┐
  │                                 │
  ▼                                 │
┌──────────────────────┐            │
│ SCRIPT GENERATION    │            │
│ (OpenAI GPT)         │            │
│                      │            │
│ • 1-3 Scripts        │            │
│ • 3 Scenes each      │            │
│ • ~30 seconds        │            │
│ • Cost: $0.01        │            │
└──────────┬───────────┘            │
           │                        │
           ▼                        │
┌──────────────────────┐            │
│ IMAGE GENERATION     │            │
│ (Nano Banana)        │            │
│                      │            │
│ • 3 variations/scene │            │
│ • Total: 9 images    │            │
│ • ~12 sec/image      │            │
│ • Cost: $1.80        │            │
│ • Parallel: 3 at a   │            │
│   time with 1s delay │            │
└──────────┬───────────┘            │
           │                        │
           ▼                        │
┌──────────────────────┐            │
│ QUALITY ASSURANCE    │            │
│ (Vision API)         │            │
│                      │            │
│ Check:               │            │
│ • Model consistency  │            │
│ • Product placement  │            │
│ • Hallucinations     │            │
│ • Style cohesion     │            │
│ • Position anomalies │            │
│                      │            │
│ Cost: $0.005/image   │            │
│ Time: ~0.3s/image    │            │
└──────────┬───────────┘            │
           │                        │
           ├─ Images PASS ──┐       │
           │                │       │
           │                ▼       │
           │           ┌──────────┐ │
           │           │ Continue │ │
           │           └────┬─────┘ │
           │                │       │
           └─ Images FAIL ──┘       │
                         │          │
                         ├─────────►│ (Option: Regenerate)
                         │          │
                         ▼          │
┌──────────────────────┐            │
│ VIDEO GENERATION     │◄───────────┘
│ (Veo 3.1)            │
│                      │
│ • Smooth transitions │
│ • 1080p resolution   │
│ • 30 fps             │
│ • 1-2 minutes        │
│ • Cost: $1.75        │
└──────────┬───────────┘
           │
           ▼
         END
    (Ready to download)
```

## Service Architecture

### Script Generation Service
```
Input:
  • Model Profile (appearance, style)
  • Product Profile (name, features, category)
  • Narrative Context (brand voice, audience, tone)

Process:
  1. Create system prompt for authentic UGC tone
  2. Send to OpenAI Chat API
  3. Parse JSON response
  4. Structure into Scene objects

Output:
  • Scene 1: Introduction
    - Setting description
    - Action/dialogue
    - Duration: ~5s
  • Scene 2: Product showcase
    - Setting description
    - Action/dialogue
    - Duration: ~8s
  • Scene 3: Call to action
    - Setting description
    - Action/dialogue
    - Duration: ~3s

Cost: $0.01 per script
Time: ~30 seconds
```

### Image Generation Service
```
Input:
  • Scene number & description
  • Model photo (reference)
  • Product photo (reference)
  • Detailed prompt template

Process:
  1. Encode reference images to base64
  2. Create detailed multimodal prompt
  3. Send to Nano Banana API (batch of 3)
  4. Rate limit: 1 second between batches
  5. Calculate consistency scores

Output:
  • Generated image URL
  • Scene number
  • Consistency metrics:
    - Model match score (0-100)
    - Product placement score (0-100)
    - Style cohesion score (0-100)
    - Overall quality score (0-100)
  • Regeneration count

Cost: $0.20 per image
Time: ~12 seconds per image
Batch size: 3 parallel (with 1s delay)
```

### Quality Assurance Service
```
Input:
  • Generated image URL

Process:
  1. Analyze model consistency
     - Face recognition match
     - Body proportion check
     - Expression evaluation
  2. Check product placement
     - Visibility score
     - Position accuracy
     - Feature visibility
  3. Detect hallucinations
     - Extra limbs/fingers
     - Anatomical errors
     - Duplications
     - Glitch artifacts
  4. Analyze style cohesion
     - Lighting consistency
     - Color palette match
     - Professional quality
  5. Check position anomalies
     - Unrealistic aspect ratios
     - Object placement issues

Output:
  • Status: 'passed' | 'failed' | 'needs-review'
  • Model consistency score (0-100)
  • Product placement score (0-100)
  • Hallucination detected: boolean
  • Style cohesion score (0-100)
  • Suggested fixes (1-4 recommendations)
  • Confidence score (0-1)

Cost: $0.005 per image
Time: ~0.3 seconds per image
Pass threshold: 70% confidence minimum
```

### Video Generation Service
```
Input:
  • Array of passed images (sorted by scene)
  • Resolution preference (720p/1080p/1440p)
  • Frame rate (24/30/60 fps)
  • Duration in seconds

Process:
  1. Sort images by scene number
  2. Create video generation request
  3. Submit to Veo 3.1 API
  4. Poll for job completion (5s intervals)
  5. Retrieve final video URL

Output:
  • Video URL (mp4 format)
  • Duration (seconds)
  • Resolution (e.g., 1080p)
  • Frame rate (e.g., 30 fps)
  • Status: 'completed' | 'processing' | 'failed'

Cost: $3.50-5.00 per video (1-2 minutes)
Time: 1-2 minutes per minute of video
Transitions: Smooth fade (automatic)
Job polling: 5 second intervals
```

## State Flow

```
┌──────────────────────────────────────────────────┐
│ Initial State                                    │
│ • project: null                                  │
│ • assets: empty                                  │
│ • isLoading: false                               │
│ • currentStage: 'INPUT'                          │
│ • error: null                                    │
└──────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────┐
│ User Input Stage                                 │
│ • Upload model photo                             │
│ • Upload product photo                           │
│ • Enter narrative(s)                             │
│ • Click "Generate"                               │
└──────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────┐
│ Start Pipeline                                   │
│ • currentStage = 'SCRIPTING'                     │
│ • isLoading = true                               │
│ • call executeFullPipeline()                     │
└──────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
    ┌────────┐   ┌────────┐   ┌────────┐
    │Scripts │   │Images  │   │   QA   │
    │  OK    │   │  OK    │   │  OK    │
    └────┬───┘   └────┬───┘   └────┬───┘
        │             │             │
        ▼             ▼             ▼
    ┌────────────────────────────────────┐
    │ Filter QA Results                  │
    │ • Pass images only                 │
    │ • Fail → suggest regeneration      │
    └────┬───────────────────────────────┘
        │
        ▼
    ┌────────────────┐
    │ Video Gen      │
    │ In Progress    │
    └────┬───────────┘
        │
        ▼
┌──────────────────────────────────────────────────┐
│ Completion                                       │
│ • generatedAssets: populated                     │
│ • isLoading = false                              │
│ • currentStage = 'COMPLETE'                      │
│ • Show success message + download button         │
└──────────────────────────────────────────────────┘
```

## Cost Flow

```
                    executeFullPipeline()
                            │
            ┌───────────────┬┴─────────────┬─────────────┐
            │               │              │             │
            ▼               ▼              ▼             ▼
    ┌──────────┐    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ Scripts  │    │ Images   │  │ QA       │  │ Video    │
    │ 1×$0.01  │    │ 9×$0.20  │  │ 9×$0.005 │  │ 1×$3.50  │
    │ =$0.01   │    │ =$1.80   │  │ =$0.04   │  │ =$3.50   │
    └────┬─────┘    └────┬─────┘  └────┬─────┘  └────┬─────┘
        │                │             │             │
        └────────────────┴─────────────┴─────────────┘
                        │
                        ▼
                ┌──────────────────┐
                │  TOTAL COST      │
                │  $3.60 per video │
                └──────────────────┘
```

## Error Handling Flow

```
                    executeFullPipeline()
                            │
            ┌───────────────┬┴─────────────┐
            │               │              │
            ▼               ▼              ▼
        Try...          Try...         Try...
        Script          Image          Video
            │               │              │
        ┌───┴───┬───┐   ┌───┴───┬───┐ ┌───┴───┬───┐
        │       │   │   │       │   │ │       │   │
        OK  Error  │   OK   Error  │ OK   Error  │
        │       │   │   │       │   │ │       │   │
        │       │   └───│───────┘   │ │       │   │
        │       │       │           │ │       │   │
        │       └────┬──┼─── Retry? │ └─┬─────┘   │
        │            │ │            │   │         │
        │            ▼ ▼            ▼   │         │
        │    ┌──────────────────────┐   │         │
        │    │  Exponential Backoff │   │         │
        │    │  Max 3 retries       │   │         │
        │    └────────┬─────────────┘   │         │
        │             │                  │         │
        │       ┌─────┴──────┐           │         │
        │       │            │           │         │
        │       ▼            ▼           │         │
        │    Success      Error ────────┼─────────┼──┐
        │       │            │           │         │  │
        │       │            │           │         │  │
        └───────┼────────────┼───────────┼─────────┼──┼───┐
                │            │           │         │  │   │
                ▼            ▼           ▼         ▼  ▼   │
            Continue   Partial  Return   Error   Early ▼ 
                OK      Results  Error    Message  Exit
                                          + Log
```

## Batch Processing Flow

```
Image Generation (Nano Banana)

Input: 9 images (3 scenes × 3 variations)

              Batch 1          Batch 2          Batch 3
              (3 images)       (3 images)       (3 images)
                  │                │                │
                  ├─ Image 1 ──────┤                │
                  ├─ Image 2 ──────┤                │
                  └─ Image 3 ──────┤                │
                                   │                │
                                   ├─ Image 4 ─────┤
                                   ├─ Image 5 ─────┤
                                   └─ Image 6 ─────┤
                                                   │
                                                   ├─ Image 7
                                                   ├─ Image 8
                                                   └─ Image 9

Process:
  1. Send Batch 1 to API
  2. Wait 1 second (rate limit)
  3. Send Batch 2 to API
  4. Wait 1 second
  5. Send Batch 3 to API
  6. Wait for all responses
  7. Aggregate results

Timing:
  • Batch processing: 12 × 3 = 36 seconds
  • Sequential: 12 × 9 = 108 seconds
  • Speedup: 3x faster with parallel batching

Error handling:
  • If 1 image fails in batch 1
  • Retry that image individually
  • Continue with other batches
  • Mark as partial success
```

---

## Technology Stack

```
Frontend           State Management    Backend Services    External APIs
├─ React 18        ├─ Zustand          ├─ OpenAI Chat      ├─ OpenAI API
├─ TypeScript      ├─ DevTools         ├─ Nano Banana      ├─ Nano Banana
├─ Tailwind CSS    └─ Persistence      ├─ Vision API       ├─ Vision API
└─ Vite                                ├─ Veo 3.1          └─ Veo 3.1
                                       └─ Environment
                                         Config
```

---

This architecture provides:
- ✅ Modular service layer
- ✅ Parallel processing capabilities
- ✅ Comprehensive error handling
- ✅ Cost tracking and estimation
- ✅ Flexible configuration
- ✅ Easy testing and integration
