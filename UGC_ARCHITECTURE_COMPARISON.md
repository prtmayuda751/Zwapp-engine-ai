# UGC AI Orchestration - Design Patterns & Architecture Comparison

---

## 1. Multiple Architectural Approaches for Multi-Modal Multi-Task System

### Approach A: Linear Sequential Pipeline (Simplest)

```
┌─────────────────────────────────────────────────────────────┐
│                   SEQUENTIAL PIPELINE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: Input
│    ↓
│  Step 2: Analysis
│    ↓
│  Step 3: Script Generation
│    ↓
│  Step 4: Prompt Engineering
│    ↓
│  Step 5: Image Generation
│    ↓
│  Step 6: QA Checks
│    ↓
│  Step 7: Video Generation
│    ↓
│  Complete
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Pros:**
- ✅ Simple to understand & implement
- ✅ Easy to debug
- ✅ Clear error handling at each step
- ✅ Minimal state complexity

**Cons:**
- ❌ Slowest (each step waits for previous)
- ❌ No parallelization possible
- ❌ Can't start step 3 while step 2 is running
- ❌ Poor UX (user sees loading for long periods)

**Use Case:** MVP, learning phase, small projects

**Estimated Time:** 4-5 weeks to build

---

### Approach B: Parallel Pipeline (Recommended)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    INTELLIGENT PARALLEL PIPELINE                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  PHASE 1: INDEPENDENT ANALYSIS (All Parallel)                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │  Analyze Model   │  │ Analyze Product  │  │ Parse Narrative  │      │
│  │  Photos          │  │ Photos           │  │ Links            │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│           ↓                    ↓                       ↓                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ COMBINE EXTRACTED CONTEXTS (await all 3)                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                          ↓                                               │
│                                                                           │
│  PHASE 2: CONTENT GENERATION (2 Parallel Streams)                      │
│  ┌────────────────────────────────────────┐                             │
│  │ STREAM A: Script + Visual Style Guide  │                             │
│  ├────────────────────────────────────────┤                             │
│  │ Step 1: Generate Script (OpenAI)       │                             │
│  │    ↓                                   │                             │
│  │ Step 2: Generate Visual Style Guide    │                             │
│  │    ↓                                   │                             │
│  │ Step 3: Generate Scene Prompts         │  STREAM B (Parallel):       │
│  │    ↓                                   │  ┌──────────────────────┐   │
│  │ Wait for Stream B → Proceed ────────────→ │ User Reviews Script  │   │
│  │                                        │  │ & Approves           │   │
│  └────────────────────────────────────────┘  └──────────────────────┘   │
│           ↓                                                               │
│                                                                           │
│  PHASE 3: IMAGE GENERATION (Batch Parallel)                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ... ┌──────────┐             │
│  │ Image 1  │  │ Image 2  │  │ Image 3  │      │ Image 5  │             │
│  │ (Nano    │  │ (Nano    │  │ (Nano    │      │ (Nano    │             │
│  │ Banana)  │  │ Banana)  │  │ Banana)  │      │ Banana)  │             │
│  └──────────┘  └──────────┘  └──────────┘      └──────────┘             │
│        ↓             ↓             ↓                 ↓                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ COLLECT ALL IMAGES (as they complete, show in gallery)         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│           ↓                                                               │
│                                                                           │
│  PHASE 4: QA (Batch Parallel)                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ... ┌──────────┐             │
│  │ QA Image │  │ QA Image │  │ QA Image │      │ QA Image │             │
│  │    1     │  │    2     │  │    3     │      │    5     │             │
│  └──────────┘  └──────────┘  └──────────┘      └──────────┘             │
│        ↓             ↓             ↓                 ↓                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ DISPLAY QA RESULTS TO USER (approve or regenerate)             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│           ↓                                                               │
│                                                                           │
│  PHASE 5: VIDEO GENERATION (Batch Parallel, OPTIONAL)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ... ┌──────────┐             │
│  │ Video 1  │  │ Video 2  │  │ Video 3  │      │ Video 5  │             │
│  │ (Veo 3)  │  │ (Veo 3)  │  │ (Veo 3)  │      │ (Veo 3)  │             │
│  └──────────┘  └──────────┘  └──────────┘      └──────────┘             │
│        ↓             ↓             ↓                 ↓                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ COLLECT & EXPORT ALL ASSETS                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                          ↓                                               │
│                     Complete                                            │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

**Pros:**
- ✅ **Much faster** - 3-4x speed improvement
- ✅ **Better UX** - Progress updates every few seconds
- ✅ **Scalable** - Can parallelize image/video generation
- ✅ **User can review script while waiting** for images
- ✅ Production-ready architecture
- ✅ Real-time gallery updates

**Cons:**
- ⚠️ More complex state management
- ⚠️ Need WebSocket for real-time updates
- ⚠️ Harder to debug race conditions
- ⚠️ Requires async/await patterns throughout

**Use Case:** Production, scalable systems

**Estimated Time:** 6-8 weeks to build robustly

---

### Approach C: Event-Driven Orchestration (Most Advanced)

```
┌─────────────────────────────────────────────────────────────────────────┐
│               EVENT-DRIVEN ORCHESTRATION (Message Queue)                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  FRONTEND (User Actions)                                                │
│  ├─ uploadInputs() → Emit Event: INPUT_UPLOADED                         │
│  │   └─ Handler: analyzeAndExtract()                                    │
│  │       └─ Emit Event: CONTEXT_EXTRACTED                              │
│  │                                                                       │
│  ├─ approveScript() → Emit Event: SCRIPT_APPROVED                       │
│  │   └─ Handler: generateImages()                                       │
│  │       └─ Emit Event: IMAGES_GENERATING                              │
│  │           └─ For each image, Emit: IMAGE_GENERATED                  │
│  │                                                                       │
│  └─ approveQA() → Emit Event: VIDEO_GENERATION_REQUESTED               │
│      └─ Handler: generateVideos()                                       │
│          └─ Emit Event: VIDEOS_GENERATING                              │
│              └─ For each video, Emit: VIDEO_GENERATED                  │
│                                                                           │
│  BACKEND QUEUE (Redis/Bull)                                             │
│  ├─ Script Generation Queue                                             │
│  │   └─ Process: [OpenAI call, save to DB, emit event]                 │
│  │                                                                       │
│  ├─ Image Generation Queue                                              │
│  │   └─ Concurrency: 3 (parallel Nano Banana calls)                    │
│  │   └─ Process: [KIE.AI call, run QA, emit event]                     │
│  │                                                                       │
│  ├─ Video Generation Queue                                              │
│  │   └─ Concurrency: 2 (parallel Veo calls)                            │
│  │   └─ Process: [KIE.AI call, emit event]                             │
│  │                                                                       │
│  └─ QA Check Queue                                                      │
│      └─ Process: [Vision analysis, emit event]                         │
│                                                                           │
│  WEBSOCKET STREAMING                                                     │
│  └─ Real-time updates to UI as jobs complete                           │
│     └─ Can show images/videos as they arrive                           │
│     └─ Can show progress bars                                           │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

**Pros:**
- ✅ **Most scalable** - Add more workers as needed
- ✅ **Fault tolerant** - Jobs can be retried if they fail
- ✅ **Distributed** - Can run on multiple servers
- ✅ **Professional** - Netflix, Airbnb style architecture
- ✅ **Monitoring** - Clear visibility into each job's status
- ✅ **Load balancing** - Automatic work distribution

**Cons:**
- ❌ **Complex** - Requires message queue infrastructure
- ❌ **Overkill for MVP** - Unnecessary complexity
- ❌ **Higher operational cost** - Redis, Bull, Docker, etc.
- ❌ **Harder to debug** - Distributed debugging is hard

**Use Case:** Enterprise, millions of projects, multiple teams

**Estimated Time:** 10-12 weeks (includes DevOps)

---

## 2. Recommendation: **APPROACH B (Parallel Pipeline)** ⭐

### Why Parallel Pipeline?

| Criteria | Sequential | **Parallel** | Event-Driven |
|----------|-----------|-----------|--------------|
| **Speed** | 1x | **3-4x** ⭐ | 3-4x |
| **Complexity** | Simple | **Moderate** ⭐ | Very High |
| **UX Quality** | Poor | **Good** ⭐ | Excellent |
| **Time to Build** | 4 weeks | **6 weeks** ⭐ | 10 weeks |
| **Scalability** | N/A | **Good** ⭐ | Excellent |
| **Cost** | Low | **Low** ⭐ | Medium |
| **Production Ready** | No | **Yes** ⭐ | Yes |

---

## 3. Implementation Strategy for Approach B

### 3.1 Promise-Based Orchestration

```typescript
// services/orchestration/orchestrator.ts

export class ProjectOrchestrator {
  async executeFullPipeline(
    projectId: string,
    inputs: InputAssets,
    onProgress: (event: ProgressEvent) => void
  ): Promise<ProjectOutput> {
    
    // PHASE 1: Parallel Analysis (wait for all 3)
    onProgress({ stage: 'ANALYZING', progress: 5 });
    
    const [modelProfile, productProfile, narrativeContext] = await Promise.all([
      this.analyzeModelPhotos(inputs.modelPhotos),
      this.analyzeProductPhotos(inputs.productPhotos),
      this.parseNarrativeLinks(inputs.narrativeLinks),
    ]);
    
    onProgress({ stage: 'ANALYZING', progress: 35 });
    
    // PHASE 2A: Content Generation (Main path)
    onProgress({ stage: 'SCRIPTING', progress: 40 });
    
    const script = await generateAdvertScript({
      modelProfile,
      productProfile,
      narrativeContext,
    });
    
    onProgress({ stage: 'SCRIPTING', progress: 60 });
    
    // PHASE 2B: User Review (runs in parallel with Phase 2A)
    // This happens on frontend - user reviews script while we continue
    // In real code: emit event to frontend, wait for user approval
    
    const visualStyleGuide = await generateVisualStyleGuide({
      modelProfile,
      productProfile,
      script,
    });
    
    const prompts = await Promise.all(
      script.sceneBreakdown.map(scene =>
        generateScenePrompt(scene, { modelProfile, productProfile, visualStyleGuide })
      )
    );
    
    onProgress({ stage: 'PROMPTING', progress: 75 });
    
    // PHASE 3: Batch Parallel Image Generation
    // Generate images 3 at a time to avoid rate limits
    onProgress({ stage: 'GENERATING', progress: 80 });
    
    const images = await this.generateImagesInBatches(
      script.sceneBreakdown,
      { inputs, prompts },
      onProgress
    );
    
    onProgress({ stage: 'GENERATING', progress: 90 });
    
    // PHASE 4: Batch Parallel QA
    const qaResults = await Promise.all(
      images.map(image =>
        runQualityAssurance(image, prompts[Number(image.sceneId) - 1].consistencyCheckpoints)
      )
    );
    
    onProgress({ stage: 'QA', progress: 95 });
    
    // Video generation only if user requests
    onProgress({ stage: 'COMPLETE', progress: 100 });
    
    return {
      script,
      visualStyleGuide,
      prompts,
      images,
      qaResults,
    };
  }
  
  private async generateImagesInBatches(
    scenes: SceneBreakdown[],
    context: any,
    onProgress: (event: ProgressEvent) => void,
    batchSize: number = 3
  ): Promise<GeneratedImage[]> {
    
    const results: GeneratedImage[] = [];
    
    for (let i = 0; i < scenes.length; i += batchSize) {
      const batch = scenes.slice(i, i + batchSize);
      
      // Generate batch in parallel
      const batchResults = await Promise.all(
        batch.map((scene, idx) =>
          generateSceneImage(scene, context).then(image => {
            // Emit progress for each image
            onProgress({
              stage: 'GENERATING',
              progress: 80 + (results.length + idx + 1) / scenes.length * 10,
              imageUrl: image.imageUrl,
              message: `Generated ${results.length + idx + 1}/${scenes.length} images`
            });
            return image;
          })
        )
      );
      
      results.push(...batchResults);
    }
    
    return results;
  }
}
```

### 3.2 Frontend State Management (Zustand)

```typescript
// store/orchestrationStore.ts

interface OrchestrationState {
  // Stage tracking
  currentPhase: 'ANALYZING' | 'SCRIPTING' | 'PROMPTING' | 'GENERATING' | 'QA' | 'VIDEO' | 'COMPLETE';
  phaseProgress: number; // 0-100 per phase
  totalProgress: number; // 0-100 overall
  
  // Generated content (accumulated as phases complete)
  script: GeneratedScript | null;
  visualStyleGuide: VisualStyleGuide | null;
  prompts: PromptTemplate[];
  images: Map<string, GeneratedImage>; // Real-time updates as images arrive
  
  // Actions
  setPhase: (phase: string) => void;
  addImage: (image: GeneratedImage) => void;
  updateProgress: (phase: string, progress: number) => void;
}

export const useOrchestrationStore = create<OrchestrationState>()((set) => ({
  currentPhase: 'ANALYZING',
  phaseProgress: 0,
  totalProgress: 0,
  
  script: null,
  visualStyleGuide: null,
  prompts: [],
  images: new Map(),
  
  setPhase: (phase) => set({ currentPhase: phase }),
  
  addImage: (image) => set((state) => ({
    images: new Map(state.images).set(image.sceneId, image),
    totalProgress: state.totalProgress + (5 / 5), // ~5% per image for 5 images
  })),
  
  updateProgress: (phase, progress) => set({
    currentPhase: phase,
    phaseProgress: progress,
  }),
}));
```

### 3.3 Real-Time Progress via WebSocket

```typescript
// hooks/useOrchestrationProgress.ts

export const useOrchestrationProgress = (projectId: string) => {
  const store = useOrchestrationStore();
  const [isRunning, setIsRunning] = useState(false);
  
  useEffect(() => {
    const ws = new WebSocket(`wss://api.zwapp.id/ws/orchestration/${projectId}`);
    
    ws.onmessage = (event) => {
      const progress: ProgressEvent = JSON.parse(event.data);
      
      // Update store based on event type
      switch (progress.stage) {
        case 'GENERATING':
          if (progress.imageUrl) {
            // Add image to gallery in real-time
            store.addImage({
              id: crypto.randomUUID(),
              sceneId: progress.sceneNumber.toString(),
              imageUrl: progress.imageUrl,
              // ... other fields
            });
          }
          store.updateProgress(progress.stage, progress.progress);
          break;
          
        case 'COMPLETE':
          setIsRunning(false);
          break;
          
        default:
          store.updateProgress(progress.stage, progress.progress);
      }
    };
    
    ws.onerror = () => setIsRunning(false);
    
    return () => ws.close();
  }, [projectId]);
  
  return { isRunning };
};
```

---

## 4. Component Architecture for Parallel Pipeline

### 4.1 Real-Time Gallery Component

```typescript
// components/UGC/RealtimeImageGallery.tsx

export const RealtimeImageGallery: React.FC = () => {
  const { images, currentPhase } = useOrchestrationStore();
  const [displayedImages, setDisplayedImages] = useState<GeneratedImage[]>([]);
  
  // Update displayed images as new ones arrive
  useEffect(() => {
    setDisplayedImages(Array.from(images.values()));
  }, [images]);
  
  return (
    <div>
      <h3>Generated Images ({displayedImages.length}/5)</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {displayedImages.map((image) => (
          <div
            key={image.id}
            className="border rounded aspect-video bg-gray-100 relative overflow-hidden"
          >
            <img
              src={image.imageUrl}
              alt={`Scene ${image.sceneId}`}
              className="w-full h-full object-cover"
            />
            
            {/* Loading animation while others are generating */}
            <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
              Scene {image.sceneId}
            </div>
          </div>
        ))}
        
        {/* Show loading placeholders for remaining images */}
        {displayedImages.length < 5 && (
          [...Array(5 - displayedImages.length)].map((_, idx) => (
            <div
              key={`placeholder-${idx}`}
              className="border-2 border-dashed border-gray-300 aspect-video rounded flex items-center justify-center bg-gray-50"
            >
              <div className="text-center">
                <div className="animate-spin text-2xl">⏳</div>
                <p className="text-sm text-gray-600 mt-2">Generating...</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
```

### 4.2 Progress Visualization

```typescript
// components/UGC/OrchestrationProgress.tsx

export const OrchestrationProgress: React.FC = () => {
  const { currentPhase, phaseProgress, totalProgress } = useOrchestrationStore();
  
  const phases = [
    { name: 'ANALYZING', label: 'Analyzing', icon: '🔍' },
    { name: 'SCRIPTING', label: 'Writing Script', icon: '✍️' },
    { name: 'PROMPTING', label: 'Engineering Prompts', icon: '⚙️' },
    { name: 'GENERATING', label: 'Generating Images', icon: '🎨' },
    { name: 'QA', label: 'Quality Check', icon: '✅' },
    { name: 'VIDEO', label: 'Creating Videos', icon: '🎬' },
  ];
  
  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="font-semibold">Overall Progress</span>
          <span className="text-sm">{totalProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>
      
      {/* Phase Timeline */}
      <div className="space-y-2">
        {phases.map((phase, idx) => (
          <div key={phase.name} className="flex items-center gap-3">
            <div className="w-8 text-center">
              {phase.name === currentPhase ? (
                <span className="animate-pulse text-xl">{phase.icon}</span>
              ) : (
                <span className="text-gray-400">{phase.icon}</span>
              )}
            </div>
            
            <div className="flex-1">
              <p className={phase.name === currentPhase ? 'font-semibold' : 'text-gray-600'}>
                {phase.label}
              </p>
            </div>
            
            {phase.name === currentPhase && (
              <span className="text-sm text-gray-600">{phaseProgress}%</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 5. Cost Comparison

### Sequential vs Parallel

| Metric | Sequential | Parallel | Improvement |
|--------|-----------|----------|------------|
| **Total Time** | 15 minutes | 4-5 minutes | **70% faster** ⭐ |
| **User Wait** | All at end | Incremental | **Much better UX** ⭐ |
| **API Calls** | Same | Same | No change |
| **Cost** | ~$1.05 | ~$1.05 | No change |
| **Complexity** | Low | Moderate | +20% dev time |
| **Failure Recovery** | Full restart | Partial retry | **Better** ⭐ |

---

## 6. Final Recommendation

### Start with Parallel Pipeline (Approach B)

**Timeline:**
- Week 1-2: Foundation (same for all approaches)
- Week 2-3: Input module + parallel analysis
- Week 3-4: Script generation
- Week 4-5: Prompt engineering + visual guide
- Week 5-7: Image generation with real-time gallery
- Week 7-8: QA + Video generation
- **Total: 8 weeks**

**Key Technical Decisions:**
1. Use `Promise.all()` for parallelization
2. WebSocket for real-time progress (Socket.io)
3. Zustand for state management
4. Batch processing (3 images at a time) to avoid rate limits
5. Lazy video generation (only on user request)

**Success Metrics:**
- Total time: < 5 minutes input to output
- User satisfaction: "fast and impressive"
- Cost: < $1.10 per project
- Quality: 85%+ pass QA checks

**If scaling later to millions of projects:**
- Upgrade to Event-Driven (Approach C)
- Add message queue (Bull/Redis)
- Add monitoring (Sentry, DataDog)
- Add distributed workers

But don't over-engineer for MVP. Start with Approach B.

