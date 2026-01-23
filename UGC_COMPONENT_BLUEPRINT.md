# UGC AI Orchestration - React Component Architecture

## Component Hierarchy & Implementation Patterns

---

## 1. High-Level Component Tree

```
App.tsx
├── UGCOrchestrationWorkspace (Main Container)
│   ├── ProjectHeader (Project name, status, save/export)
│   ├── ProgressBar (Workflow stage indicator)
│   │
│   ├── MainLayout (3-column: Left | Center | Right)
│   │   │
│   │   ├── LEFT PANEL (35%)
│   │   │   ├── InputModule (Stage 1)
│   │   │   │   ├── ModelPhotoUpload
│   │   │   │   ├── ProductPhotoUpload
│   │   │   │   ├── NarrativeLinkInput
│   │   │   │   └── OptionalMoodboard
│   │   │   │
│   │   │   ├── ScriptReviewPanel (Stage 2)
│   │   │   │   ├── ScriptDisplay (H-P-S-CTA)
│   │   │   │   ├── SceneBreakdownList
│   │   │   │   └── EditScriptButton
│   │   │   │
│   │   │   ├── PromptEngineeringPanel (Stage 3)
│   │   │   │   ├── VisualStyleGuideSummary
│   │   │   │   ├── PromptEditorAccordion (per scene)
│   │   │   │   ├── ConsistencyChecklistPanel
│   │   │   │   └── LockPromptsButton
│   │   │   │
│   │   │   └── ControlPanel (all stages)
│   │   │       ├── StartGenerationButton
│   │   │       ├── BackButton
│   │   │       ├── NextButton
│   │   │       ├── RegenerateButton
│   │   │       └── ExportButton
│   │   │
│   │   ├── CENTER PANEL (40%)
│   │   │   ├── StagePreview (Dynamic based on stage)
│   │   │   │   ├── InputPreview (Stage 1)
│   │   │   │   ├── ScriptPreview (Stage 2)
│   │   │   │   ├── PromptPreview (Stage 3)
│   │   │   ├─  ImageGalleryView (Stage 4)
│   │   │   │   ├── ImageGrid
│   │   │   │   ├── ImageCard
│   │   │   │   └── QualityBadge
│   │   │   │
│   │   │   ├── QAResultsPanel (Stage 5)
│   │   │   │   ├── ConsistencyReport
│   │   │   │   ├── IssueList
│   │   │   │   └── RecommendationPanel
│   │   │   │
│   │   │   └── VideoPreviewPanel (Stage 6)
│   │   │       ├── VideoGrid
│   │   │       ├── VideoPlayer
│   │   │       └── ComposeClipButton
│   │   │
│   │   └── RIGHT PANEL (25%)
│   │       ├── AssetsPanel
│   │       │   ├── ImageAssets (thumbnail grid)
│   │       │   ├── VideoAssets (thumbnail grid)
│   │       │   └── DocumentAssets (scripts, prompts)
│   │       │
│   │       └── MetadataPanel
│   │           ├── ProjectInfo
│   │           ├── GenerationStats
│   │           └── VersionHistory
│   │
│   └── Toast/Notification System (global progress updates)
│
└── Modals/Overlays
    ├── DetailedImageViewModal (fullscreen image preview)
    ├── PromptEditorModal (advanced prompt editing)
    ├── RegenerationOptionsModal
    ├── ExportOptionsModal
    └── ProjectHistoryModal
```

---

## 2. Core State Management (Zustand Store)

```typescript
// store/ugcStore.ts

import create from 'zustand';
import { devtools } from 'zustand/middleware';

interface UGCProjectState {
  // Project metadata
  projectId: string;
  projectName: string;
  createdAt: number;
  updatedAt: number;
  
  // Workflow stage
  currentStage: WorkflowStage;
  workflowProgress: {
    stage: WorkflowStage;
    completion: number; // 0-100
    status: 'idle' | 'processing' | 'complete' | 'error';
    errorMessage?: string;
  };
  
  // Input Assets
  inputAssets: {
    modelPhotos: UploadedAsset[];
    productPhotos: UploadedAsset[];
    narrativeLinks: string[];
    moodboardImages?: UploadedAsset[];
  };
  
  // Extracted Context
  extractedContext: {
    modelProfile?: ModelProfile;
    productProfile?: ProductProfile;
    narrativeContext?: NarrativeContext;
  };
  
  // Generated Content
  generatedContent: {
    script?: GeneratedScript;
    visualStyleGuide?: VisualStyleGuide;
    prompts: PromptTemplate[];
    images: GeneratedImage[];
    videos: GeneratedVideo[];
  };
  
  // QA Results
  qaResults: Map<string, QAResult>; // imageId → QAResult
  
  // Actions
  setProjectName: (name: string) => void;
  setCurrentStage: (stage: WorkflowStage) => void;
  updateWorkflowProgress: (update: Partial<typeof workflowProgress>) => void;
  
  // Input actions
  addModelPhotos: (assets: UploadedAsset[]) => void;
  removeModelPhoto: (assetId: string) => void;
  reorderModelPhotos: (newOrder: UploadedAsset[]) => void;
  
  addProductPhotos: (assets: UploadedAsset[]) => void;
  removeProductPhoto: (assetId: string) => void;
  
  addNarrativeLink: (link: string) => void;
  removeNarrativeLink: (link: string) => void;
  
  // Context extraction
  setExtractedContext: (context: Partial<typeof extractedContext>) => void;
  
  // Content generation
  setGeneratedScript: (script: GeneratedScript) => void;
  setVisualStyleGuide: (guide: VisualStyleGuide) => void;
  addPrompt: (prompt: PromptTemplate) => void;
  updatePrompt: (sceneId: string, prompt: PromptTemplate) => void;
  
  addGeneratedImage: (image: GeneratedImage) => void;
  updateGeneratedImage: (imageId: string, updates: Partial<GeneratedImage>) => void;
  
  addGeneratedVideo: (video: GeneratedVideo) => void;
  
  // QA
  setQAResult: (imageId: string, result: QAResult) => void;
  
  // Utils
  resetProject: () => void;
  saveToSupabase: () => Promise<void>;
  loadFromSupabase: (projectId: string) => Promise<void>;
}

export const useUGCStore = create<UGCProjectState>()(
  devtools((set, get) => ({
    // Initial state
    projectId: crypto.randomUUID(),
    projectName: 'Untitled UGC Project',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    
    currentStage: 'INPUT',
    workflowProgress: {
      stage: 'INPUT',
      completion: 0,
      status: 'idle'
    },
    
    inputAssets: {
      modelPhotos: [],
      productPhotos: [],
      narrativeLinks: [],
    },
    
    extractedContext: {},
    generatedContent: {
      prompts: [],
      images: [],
      videos: [],
    },
    
    qaResults: new Map(),
    
    // Actions
    setProjectName: (name) => set({ projectName: name, updatedAt: Date.now() }),
    
    setCurrentStage: (stage) => set({
      currentStage: stage,
      updatedAt: Date.now(),
    }),
    
    updateWorkflowProgress: (update) => set((state) => ({
      workflowProgress: { ...state.workflowProgress, ...update },
      updatedAt: Date.now(),
    })),
    
    addModelPhotos: (assets) => set((state) => ({
      inputAssets: {
        ...state.inputAssets,
        modelPhotos: [...state.inputAssets.modelPhotos, ...assets],
      },
      updatedAt: Date.now(),
    })),
    
    // ... other actions
    
    resetProject: () => set({
      projectId: crypto.randomUUID(),
      projectName: 'Untitled UGC Project',
      currentStage: 'INPUT',
      inputAssets: { modelPhotos: [], productPhotos: [], narrativeLinks: [] },
      generatedContent: { prompts: [], images: [], videos: [] },
      qaResults: new Map(),
      updatedAt: Date.now(),
    }),
    
    saveToSupabase: async () => {
      const state = get();
      // Save to Supabase
    },
    
    loadFromSupabase: async (projectId) => {
      // Load from Supabase
    },
  }))
);
```

---

## 3. Stage-Specific Components

### 3.1 Input Module (Stage 1)

```typescript
// components/UGC/InputModule.tsx

interface InputModuleProps {
  onComplete: (inputs: InputAssets) => void;
  onError: (error: string) => void;
}

export const InputModule: React.FC<InputModuleProps> = ({ onComplete, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { inputAssets, addModelPhotos, addProductPhotos, addNarrativeLink } = useUGCStore();
  
  const handleModelPhotoDrop = async (files: File[]) => {
    try {
      setIsLoading(true);
      
      // Upload to Supabase
      const uploadedAssets = await Promise.all(
        files.map(file => uploadImageToSupabase(file, 'model-photos'))
      );
      
      addModelPhotos(uploadedAssets);
    } catch (error) {
      onError(`Failed to upload model photos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProductPhotoDrop = async (files: File[]) => {
    try {
      setIsLoading(true);
      
      const uploadedAssets = await Promise.all(
        files.map(file => uploadImageToSupabase(file, 'product-photos'))
      );
      
      addProductPhotos(uploadedAssets);
    } catch (error) {
      onError(`Failed to upload product photos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNarrativeLinkSubmit = (link: string) => {
    // Validate URL
    try {
      new URL(link);
      addNarrativeLink(link);
    } catch {
      onError('Invalid URL format');
    }
  };
  
  const isComplete = 
    inputAssets.modelPhotos.length > 0 &&
    inputAssets.productPhotos.length > 0 &&
    inputAssets.narrativeLinks.length > 0;
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Step 1: Upload Model Photos</h3>
        <Dropzone
          onDrop={handleModelPhotoDrop}
          accept="image/*"
          isLoading={isLoading}
        >
          <p>Drag model photos here (at least 1)</p>
        </Dropzone>
        
        {inputAssets.modelPhotos.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {inputAssets.modelPhotos.map((asset, idx) => (
              <div key={asset.id} className="relative">
                <img
                  src={asset.supabaseUrl}
                  alt={`Model ${idx + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  onClick={() => removeModelPhoto(asset.id)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Step 2: Upload Product Photos</h3>
        <Dropzone
          onDrop={handleProductPhotoDrop}
          accept="image/*"
          isLoading={isLoading}
        >
          <p>Drag product reference photos here (at least 1)</p>
        </Dropzone>
        
        {inputAssets.productPhotos.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {inputAssets.productPhotos.map((asset, idx) => (
              <div key={asset.id} className="relative">
                <img
                  src={asset.supabaseUrl}
                  alt={`Product ${idx + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Step 3: Paste Narrative Reference Link</h3>
        <NarrativeLinkInput
          onSubmit={handleNarrativeLinkSubmit}
          examples={[
            "https://www.tiktok.com/@brandname/video/...",
            "https://www.instagram.com/p/...",
            "https://drive.google.com/file/d/.../view",
          ]}
        />
        
        {inputAssets.narrativeLinks.map((link) => (
          <div
            key={link}
            className="mt-2 p-3 bg-gray-100 rounded flex justify-between items-center"
          >
            <span className="text-sm truncate">{link}</span>
            <button onClick={() => removeNarrativeLink(link)}>✕</button>
          </div>
        ))}
      </div>
      
      <div className="pt-4 flex justify-end">
        <Button
          onClick={() => onComplete(inputAssets)}
          disabled={!isComplete || isLoading}
          className="px-8"
        >
          Analyze & Generate Script
        </Button>
      </div>
    </div>
  );
};
```

### 3.2 Script Review Panel (Stage 2)

```typescript
// components/UGC/ScriptReviewPanel.tsx

export const ScriptReviewPanel: React.FC = () => {
  const { generatedContent, setGeneratedScript, setCurrentStage } = useUGCStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedScript, setEditedScript] = useState(generatedContent.script);
  
  const handleRegenerateScript = async () => {
    // Call API to regenerate script
    const newScript = await generateAdvertScript(/* context */);
    setGeneratedScript(newScript);
  };
  
  if (!generatedContent.script) {
    return <LoadingState message="Generating advertisement script..." />;
  }
  
  const script = generatedContent.script;
  
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded">
        <h3 className="font-semibold text-blue-900 mb-3">Generated Advertisement Script</h3>
        
        <div className="space-y-4">
          {/* Hook */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wide">Hook (First 3 seconds)</h4>
            <p className="mt-1 text-lg text-gray-800">{script.hook}</p>
          </div>
          
          {/* Problem */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wide">Problem Statement</h4>
            <p className="mt-1 text-gray-700">{script.problemStatement}</p>
          </div>
          
          {/* Solution */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wide">Solution</h4>
            <p className="mt-1 text-gray-700">{script.solution}</p>
          </div>
          
          {/* CTA */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wide">Call to Action</h4>
            <p className="mt-1 text-lg font-semibold text-gray-900">{script.cta}</p>
          </div>
        </div>
      </div>
      
      {/* Scene Breakdown */}
      <div>
        <h3 className="font-semibold mb-3">Scene Breakdown</h3>
        <div className="space-y-2">
          {script.sceneBreakdown.map((scene, idx) => (
            <div key={idx} className="p-3 border rounded hover:bg-gray-50">
              <div className="font-semibold text-sm">
                Scene {scene.sceneNumber}: {scene.description}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <p><strong>Model:</strong> {scene.modelAction} - {scene.modelExpression}</p>
                <p><strong>Product:</strong> {scene.productPlacement}</p>
                <p><strong>Camera:</strong> {scene.cameraAngle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4">
        <Button
          variant="outline"
          onClick={handleRegenerateScript}
        >
          🔄 Regenerate Script
        </Button>
        
        <Button onClick={() => setCurrentStage('PROMPTING')}>
          Proceed to Prompt Engineering →
        </Button>
      </div>
    </div>
  );
};
```

### 3.3 Image Gallery (Stage 4)

```typescript
// components/UGC/ImageGalleryView.tsx

export const ImageGalleryView: React.FC = () => {
  const { generatedContent, qaResults, updateGeneratedImage, setCurrentStage } = useUGCStore();
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [regeneratingScenes, setRegeneratingScenes] = useState<Set<string>>(new Set());
  
  const handleRegenerateImage = async (image: GeneratedImage) => {
    setRegeneratingScenes(prev => new Set(prev).add(image.sceneId));
    
    try {
      const newImage = await regenerateSceneImage(image.sceneId);
      updateGeneratedImage(image.id, { ...newImage });
    } catch (error) {
      console.error('Regeneration failed:', error);
    } finally {
      setRegeneratingScenes(prev => {
        const updated = new Set(prev);
        updated.delete(image.sceneId);
        return updated;
      });
    }
  };
  
  if (generatedContent.images.length === 0) {
    return <LoadingState message="Generating images..." />;
  }
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Generated Images</h3>
      
      {/* Grid View */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {generatedContent.images.map((image) => {
          const qa = qaResults.get(image.id);
          
          return (
            <div
              key={image.id}
              className="border rounded overflow-hidden hover:shadow-lg transition cursor-pointer"
              onClick={() => setSelectedImageId(image.id)}
            >
              {/* Image */}
              <div className="relative aspect-video bg-gray-200">
                <img
                  src={image.imageUrl}
                  alt={`Scene ${image.sceneId}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Quality Badge */}
                {qa && (
                  <div className={`absolute top-2 right-2 px-3 py-1 rounded text-white text-sm font-semibold
                    ${qa.qualityScore >= 80 ? 'bg-green-500' :
                      qa.qualityScore >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'}`}
                  >
                    {qa.qualityScore}%
                  </div>
                )}
              </div>
              
              {/* Card Footer */}
              <div className="p-3 bg-gray-50">
                <p className="text-sm font-semibold">Scene {image.sceneId}</p>
                
                {regeneratingScenes.has(image.sceneId) && (
                  <p className="text-xs text-blue-600 mt-1">⏳ Regenerating...</p>
                )}
                
                {qa?.issues && qa.issues.length > 0 && (
                  <p className="text-xs text-red-600 mt-1">⚠️ {qa.issues.length} issues detected</p>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRegenerateImage(image);
                  }}
                  disabled={regeneratingScenes.has(image.sceneId)}
                  className="text-xs text-blue-600 hover:underline mt-2"
                >
                  🔄 Regenerate
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Detailed View Modal */}
      {selectedImageId && (
        <ImageDetailModal
          image={generatedContent.images.find(i => i.id === selectedImageId)!}
          qaResult={qaResults.get(selectedImageId)}
          onClose={() => setSelectedImageId(null)}
          onRegenerate={handleRegenerateImage}
        />
      )}
      
      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button variant="outline" onClick={() => setCurrentStage('PROMPTING')}>
          ← Back to Prompts
        </Button>
        
        <Button onClick={() => setCurrentStage('VIDEO_GENERATION')}>
          Generate Videos →
        </Button>
      </div>
    </div>
  );
};
```

### 3.4 QA Results Panel (Stage 5)

```typescript
// components/UGC/QAResultsPanel.tsx

export const QAResultsPanel: React.FC = () => {
  const { generatedContent, qaResults } = useUGCStore();
  const [expandedImageId, setExpandedImageId] = useState<string | null>(null);
  
  const allQAResults = Array.from(qaResults.values());
  const passedCount = allQAResults.filter(qa => qa.qualityScore >= 80).length;
  const totalCount = allQAResults.length;
  
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Quality Assurance Summary</h3>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-blue-600">
            {passedCount}/{totalCount}
          </div>
          <div className="text-sm text-gray-700">
            <p className="font-semibold">Images passed QA checks</p>
            <p className="text-xs">{totalCount - passedCount} images need attention</p>
          </div>
        </div>
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(passedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Individual Image QA Results */}
      <div className="space-y-3">
        {generatedContent.images.map((image) => {
          const qa = qaResults.get(image.id);
          if (!qa) return null;
          
          const isExpanded = expandedImageId === image.id;
          
          return (
            <div
              key={image.id}
              className="border rounded-lg overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => setExpandedImageId(isExpanded ? null : image.id)}
                className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition"
              >
                <img
                  src={image.imageUrl}
                  alt="Scene"
                  className="w-16 h-16 object-cover rounded"
                />
                
                <div className="flex-1 text-left">
                  <p className="font-semibold">Scene {image.sceneId}</p>
                  <p className="text-sm text-gray-600">
                    {qa.qualityScore >= 80 ? '✓ Passed' : '⚠️ Needs Review'}
                  </p>
                </div>
                
                <div className={`px-3 py-1 rounded font-semibold text-white
                  ${qa.qualityScore >= 80 ? 'bg-green-500' :
                    qa.qualityScore >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'}`}
                >
                  {qa.qualityScore}%
                </div>
                
                <span className="text-gray-400">
                  {isExpanded ? '▼' : '▶'}
                </span>
              </button>
              
              {/* Details */}
              {isExpanded && (
                <div className="p-4 bg-gray-50 border-t space-y-3">
                  {qa.issues.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-red-700 mb-2">Issues Detected:</h4>
                      <ul className="space-y-1">
                        {qa.issues.map((issue, idx) => (
                          <li key={idx} className="text-sm text-red-600">
                            • {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {qa.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-blue-700 mb-2">Recommendations:</h4>
                      <ul className="space-y-1">
                        {qa.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-blue-600">
                            • {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Decision Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => {/* Go back to edit prompts */}}
        >
          ← Edit Prompts & Regenerate
        </Button>
        
        <Button
          onClick={() => {/* Proceed to video */}}
          disabled={passedCount < totalCount}
        >
          All Good! Generate Videos →
        </Button>
      </div>
    </div>
  );
};
```

---

## 4. Orchestration Service Layer

```typescript
// services/ugcOrchestration.ts

export class UGCOrchestrationService {
  /**
   * Main orchestration pipeline
   */
  async orchestrateProject(
    inputs: InputAssets,
    onProgress: (event: OrchestrationProgressEvent) => void
  ): Promise<UGCProjectOutput> {
    try {
      // Phase 1: Analyze inputs
      onProgress({
        stage: 'ANALYZING',
        progress: 10,
        message: 'Analyzing uploaded images and links...'
      });
      
      const [modelProfile, productProfile, narrativeContext] = await Promise.all([
        this.analyzeModelPhotos(inputs.modelPhotos),
        this.analyzeProductPhotos(inputs.productPhotos),
        this.parseNarrativeLinks(inputs.narrativeLinks),
      ]);
      
      onProgress({
        stage: 'ANALYZING',
        progress: 30,
        message: 'Profile extraction complete'
      });
      
      // Phase 2: Generate script
      onProgress({
        stage: 'SCRIPTING',
        progress: 35,
        message: 'Generating advertisement script...'
      });
      
      const script = await generateAdvertScript({
        modelProfile,
        productProfile,
        narrativeContext,
      });
      
      onProgress({
        stage: 'SCRIPTING',
        progress: 50,
        message: 'Script generated successfully'
      });
      
      // Phase 3: Generate prompts
      onProgress({
        stage: 'PROMPTING',
        progress: 55,
        message: 'Engineering generation prompts...'
      });
      
      const visualStyleGuide = await generateVisualStyleGuide({
        modelProfile,
        productProfile,
        narrativeContext,
        script,
      });
      
      const prompts = await Promise.all(
        script.sceneBreakdown.map(scene =>
          generateScenePrompt(scene, {
            modelPhotos: inputs.modelPhotos,
            productPhotos: inputs.productPhotos,
            visualStyleGuide,
          })
        )
      );
      
      onProgress({
        stage: 'PROMPTING',
        progress: 70,
        message: 'All prompts engineered'
      });
      
      // Phase 4: Generate images
      onProgress({
        stage: 'GENERATING',
        progress: 75,
        message: 'Starting image generation...'
      });
      
      const images = await generateSceneImages(
        script.sceneBreakdown,
        {
          modelPhotos: inputs.modelPhotos,
          productPhotos: inputs.productPhotos,
          prompts,
        },
        (imageEvent) => {
          onProgress({
            stage: 'GENERATING',
            progress: 75 + (imageEvent.index / imageEvent.total) * 20,
            message: `Generated ${imageEvent.index + 1}/${imageEvent.total} images`,
            imageUrl: imageEvent.imageUrl,
          });
        }
      );
      
      // Phase 5: Quality assurance
      onProgress({
        stage: 'QA',
        progress: 95,
        message: 'Running quality assurance checks...'
      });
      
      const qaResults = await Promise.all(
        images.map(image =>
          runQualityAssurance(image, prompts[Number(image.sceneId) - 1].consistencyCheckpoints)
        )
      );
      
      onProgress({
        stage: 'COMPLETE',
        progress: 100,
        message: 'All phases complete! Ready for video generation.'
      });
      
      return {
        script,
        visualStyleGuide,
        prompts,
        images,
        qaResults,
      };
      
    } catch (error) {
      onProgress({
        stage: 'ERROR',
        progress: 0,
        message: `Orchestration failed: ${error.message}`,
      });
      throw error;
    }
  }
  
  private async analyzeModelPhotos(photos: UploadedAsset[]): Promise<ModelProfile> {
    // Use Vision API or Claude to analyze
    const analysis = await analyzeImageContent(photos[0].supabaseUrl);
    return {
      appearance: analysis.appearance,
      poses: analysis.poses,
      expressions: analysis.expressions,
      outfitStyle: analysis.outfitStyle,
    };
  }
  
  private async analyzeProductPhotos(photos: UploadedAsset[]): Promise<ProductProfile> {
    // Extract product information
    const analysis = await analyzeImageContent(photos[0].supabaseUrl);
    return {
      name: analysis.objectName,
      colors: analysis.colors,
      dimensions: analysis.dimensions,
      keyFeatures: analysis.features,
      highlightAngles: analysis.angles,
    };
  }
  
  private async parseNarrativeLinks(links: string[]): Promise<NarrativeContext> {
    // Fetch content from links
    const contexts = await Promise.all(
      links.map(link => fetchAndParseLink(link))
    );
    
    // Synthesize into narrative context
    return {
      brandVoice: synthesizeBrandVoice(contexts),
      targetAudience: synthesizeTargetAudience(contexts),
      campaignGoal: synthesizeCampaignGoal(contexts),
      keyMessages: synthesizeKeyMessages(contexts),
    };
  }
}
```

---

## 5. Real-Time Progress Updates (WebSocket)

```typescript
// hooks/useOrchestrationProgress.ts

export const useOrchestrationProgress = () => {
  const [progress, setProgress] = useState<OrchestrationProgressEvent | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    // Connect to WebSocket server
    socketRef.current = new WebSocket(`wss://${process.env.REACT_APP_API_URL}/ws/ugc`);
    
    socketRef.current.onmessage = (event) => {
      const progressEvent = JSON.parse(event.data) as OrchestrationProgressEvent;
      setProgress(progressEvent);
    };
    
    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return () => {
      socketRef.current?.close();
    };
  }, []);
  
  return { progress };
};
```

---

## 6. Component Integration Example

```typescript
// pages/UGCOrchestrationPage.tsx

export const UGCOrchestrationPage: React.FC = () => {
  const store = useUGCStore();
  const { progress } = useOrchestrationProgress();
  
  const handleStartGeneration = async () => {
    store.updateWorkflowProgress({
      status: 'processing',
      completion: 0,
    });
    
    try {
      const orchestration = new UGCOrchestrationService();
      const output = await orchestration.orchestrateProject(
        store.inputAssets,
        (event) => {
          // Update store with progress
          store.updateWorkflowProgress({
            stage: event.stage,
            completion: event.progress,
          });
        }
      );
      
      // Save output to store
      store.setGeneratedScript(output.script);
      store.setVisualStyleGuide(output.visualStyleGuide);
      output.prompts.forEach(p => store.addPrompt(p));
      output.images.forEach(img => store.addGeneratedImage(img));
      
      store.setCurrentStage('SCRIPT_REVIEW');
      
    } catch (error) {
      store.updateWorkflowProgress({
        status: 'error',
        errorMessage: error.message,
      });
    }
  };
  
  return (
    <div className="h-screen flex flex-col">
      <UGCOrchestrationWorkspace>
        {store.currentStage === 'INPUT' && (
          <InputModule
            onComplete={() => handleStartGeneration()}
          />
        )}
        
        {store.currentStage === 'SCRIPT_REVIEW' && (
          <ScriptReviewPanel />
        )}
        
        {store.currentStage === 'PROMPTING' && (
          <PromptEngineeringPanel />
        )}
        
        {store.currentStage === 'GENERATING' && (
          <ImageGalleryView />
        )}
        
        {store.currentStage === 'QA' && (
          <QAResultsPanel />
        )}
        
        {store.currentStage === 'VIDEO_GENERATION' && (
          <VideoGenerationPanel />
        )}
      </UGCOrchestrationWorkspace>
    </div>
  );
};
```

---

## Summary

**Key Architecture Principles:**

1. **Centralized State Management** (Zustand) - Workflow state synchronization
2. **Stage-Specific Components** - Each stage has focused UI
3. **Service Layer Orchestration** - Business logic separated from UI
4. **Real-Time Progress** - WebSocket updates for long-running tasks
5. **Modular & Reusable** - Components can be tested independently
6. **Cost-Optimized** - Parallel processing, lazy video generation, caching

**Next Implementation Priority:**

1. Build core data models & Supabase schema
2. Implement input module with upload
3. Integrate OpenAI for script generation
4. Build prompt engineering system
5. Integrate KIE.AI Nano Banana for image generation
6. Add QA engine with vision analysis
7. Integrate Veo 3.1 for video generation
8. Polish UI/UX for production

