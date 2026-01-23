# UGC AI Orchestration - Quick Start Development Guide

---

## 1. Project Setup (30 minutes)

### 1.1 Create React + TypeScript + Vite Project

```bash
# Create new project
npm create vite@latest zwapp-ugc-orchestration -- --template react-ts
cd zwapp-ugc-orchestration

# Install dependencies
npm install

# Install UI & State Management
npm install zustand axios socket.io-client
npm install -D tailwindcss postcss autoprefixer
npm install @tailwindcss/ui shadcn-ui

# Initialize Tailwind
npx tailwindcss init -p

# Install additional useful libraries
npm install react-dropzone uuid js-cookie

npm run dev
```

### 1.2 Environment Variables

```bash
# .env.local
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_OPENAI_API_KEY=sk-... (optional, backend will use)
VITE_KIE_AI_API_KEY=your-kie-api-key
VITE_API_URL=http://localhost:3000
```

### 1.3 Project Structure

```
zwapp-ugc-orchestration/
├── src/
│   ├── components/
│   │   ├── UGC/
│   │   │   ├── Orchestration/
│   │   │   │   ├── InputModule.tsx
│   │   │   │   ├── ScriptReviewPanel.tsx
│   │   │   │   ├── PromptEngineeringPanel.tsx
│   │   │   │   ├── ImageGalleryView.tsx
│   │   │   │   ├── QAResultsPanel.tsx
│   │   │   │   └── VideoGenerationPanel.tsx
│   │   │   ├── Common/
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   ├── FileUpload.tsx
│   │   │   │   └── Toast.tsx
│   │   │   └── UGCOrchestrationWorkspace.tsx
│   │   └── Layout/
│   │       └── MainLayout.tsx
│   │
│   ├── services/
│   │   ├── api.ts (HTTP client)
│   │   ├── orchestration.ts (main orchestrator)
│   │   ├── scriptGeneration.ts
│   │   ├── promptEngineering.ts
│   │   ├── imageGeneration.ts
│   │   ├── qualityAssurance.ts
│   │   ├── videoGeneration.ts
│   │   └── supabase.ts
│   │
│   ├── store/
│   │   └── ugcStore.ts (Zustand)
│   │
│   ├── hooks/
│   │   ├── useOrchestrationProgress.ts
│   │   └── useProjectContext.ts
│   │
│   ├── types/
│   │   └── ugc.ts (all TypeScript types)
│   │
│   ├── pages/
│   │   └── UGCOrchestration.tsx
│   │
│   ├── App.tsx
│   └── main.tsx
│
└── package.json
```

---

## 2. Core TypeScript Types

### 2.1 Create `src/types/ugc.ts`

```typescript
// src/types/ugc.ts

// Enums
export type WorkflowStage = 'INPUT' | 'ANALYSIS' | 'SCRIPTING' | 'PROMPTING' | 'GENERATING' | 'QA' | 'VIDEO_GENERATION' | 'COMPLETE';
export type ProjectStatus = 'IDLE' | 'PROCESSING' | 'PAUSED' | 'COMPLETE' | 'ERROR';

// Assets
export interface UploadedAsset {
  id: string;
  fileName: string;
  supabaseUrl: string;
  supabasePath: string;
  size: number; // bytes
  uploadedAt: number;
}

export interface InputAssets {
  modelPhotos: UploadedAsset[];
  productPhotos: UploadedAsset[];
  narrativeLinks: string[];
  moodboardImages?: UploadedAsset[];
}

// Extracted Profiles
export interface ModelProfile {
  appearance: string;
  poses: string[];
  expressions: string[];
  outfitStyle: string;
}

export interface ProductProfile {
  name: string;
  colors: string[];
  dimensions: string;
  keyFeatures: string[];
  highlightAngles: string[];
}

export interface NarrativeContext {
  brandVoice: string;
  targetAudience: string;
  campaignGoal: string;
  keyMessages: string[];
  competitorAnalysis?: string;
}

// Generated Content
export interface SceneBreakdown {
  sceneNumber: number;
  description: string;
  modelAction: string;
  modelExpression: string;
  productPlacement: string;
  backgroundDescription: string;
  cameraAngle: string;
  narrativePoint: string;
}

export interface GeneratedScript {
  hook: string;
  problemStatement: string;
  solution: string;
  cta: string;
  fullNarrative: string;
  sceneBreakdown: SceneBreakdown[];
}

export interface VisualStyleGuide {
  cameraSpecs: string;
  lighting: string;
  backgroundStyle: string;
  colorPalette: string[];
  compositions: string[];
}

export interface ConsistencyCheckpoint {
  aspect: 'model_face' | 'product_accuracy' | 'background' | 'style' | 'lighting';
  baseline: string;
  requirement: string;
}

export interface PromptTemplate {
  sceneId: string;
  basePrompt: string;
  dynamicVariables: Record<string, string>;
  consistencyCheckpoints: ConsistencyCheckpoint[];
  generatedPrompt: string;
}

export interface GeneratedImage {
  id: string;
  sceneId: string;
  prompt: string;
  imageUrl: string;
  nanobananaTaskId: string;
  qualityScore: number;
  issues?: string[];
  createdAt: number;
}

export interface GeneratedVideo {
  id: string;
  imageId: string;
  videoUrl: string;
  veoTaskId: string;
  duration?: number;
  createdAt: number;
}

export interface QAResult {
  qualityScore: number;
  issues: string[];
  recommendations: string[];
  timestamp: number;
}

// Project
export interface UGCProject {
  id: string;
  userId: string;
  projectName: string;
  status: ProjectStatus;
  currentStage: WorkflowStage;
  
  inputAssets: InputAssets;
  extractedContext: {
    modelProfile?: ModelProfile;
    productProfile?: ProductProfile;
    narrativeContext?: NarrativeContext;
  };
  
  generatedContent: {
    script?: GeneratedScript;
    visualStyleGuide?: VisualStyleGuide;
    prompts: PromptTemplate[];
    images: GeneratedImage[];
    videos: GeneratedVideo[];
  };
  
  qaResults: Map<string, QAResult>;
  
  createdAt: number;
  updatedAt: number;
}

// Progress Events
export interface ProgressEvent {
  stage: WorkflowStage;
  progress: number; // 0-100
  status: 'idle' | 'processing' | 'complete' | 'error';
  message?: string;
  sceneNumber?: number;
  imageUrl?: string;
  videoUrl?: string;
  error?: string;
}
```

---

## 3. State Management

### 3.1 Create `src/store/ugcStore.ts`

```typescript
// src/store/ugcStore.ts

import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { UGCProject, UploadedAsset, GeneratedScript, VisualStyleGuide, PromptTemplate, GeneratedImage, GeneratedVideo, QAResult, WorkflowStage } from '../types/ugc';

interface UGCStoreState {
  // Current project
  currentProject: UGCProject | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializeProject: (projectName: string, userId: string) => void;
  addModelPhotos: (assets: UploadedAsset[]) => void;
  addProductPhotos: (assets: UploadedAsset[]) => void;
  addNarrativeLink: (link: string) => void;
  
  setGeneratedScript: (script: GeneratedScript) => void;
  setVisualStyleGuide: (guide: VisualStyleGuide) => void;
  addPrompt: (prompt: PromptTemplate) => void;
  addGeneratedImage: (image: GeneratedImage) => void;
  addGeneratedVideo: (video: GeneratedVideo) => void;
  setQAResult: (imageId: string, result: QAResult) => void;
  
  setCurrentStage: (stage: WorkflowStage) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  resetProject: () => void;
}

export const useUGCStore = create<UGCStoreState>()(
  devtools((set, get) => ({
    currentProject: null,
    isLoading: false,
    error: null,
    
    initializeProject: (projectName, userId) => {
      const newProject: UGCProject = {
        id: crypto.randomUUID(),
        userId,
        projectName,
        status: 'IDLE',
        currentStage: 'INPUT',
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
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      set({ currentProject: newProject });
    },
    
    addModelPhotos: (assets) => set((state) => {
      if (!state.currentProject) return {};
      return {
        currentProject: {
          ...state.currentProject,
          inputAssets: {
            ...state.currentProject.inputAssets,
            modelPhotos: [...state.currentProject.inputAssets.modelPhotos, ...assets],
          },
          updatedAt: Date.now(),
        },
      };
    }),
    
    addProductPhotos: (assets) => set((state) => {
      if (!state.currentProject) return {};
      return {
        currentProject: {
          ...state.currentProject,
          inputAssets: {
            ...state.currentProject.inputAssets,
            productPhotos: [...state.currentProject.inputAssets.productPhotos, ...assets],
          },
          updatedAt: Date.now(),
        },
      };
    }),
    
    addNarrativeLink: (link) => set((state) => {
      if (!state.currentProject) return {};
      return {
        currentProject: {
          ...state.currentProject,
          inputAssets: {
            ...state.currentProject.inputAssets,
            narrativeLinks: [...state.currentProject.inputAssets.narrativeLinks, link],
          },
          updatedAt: Date.now(),
        },
      };
    }),
    
    setGeneratedScript: (script) => set((state) => {
      if (!state.currentProject) return {};
      return {
        currentProject: {
          ...state.currentProject,
          generatedContent: {
            ...state.currentProject.generatedContent,
            script,
          },
          updatedAt: Date.now(),
        },
      };
    }),
    
    addGeneratedImage: (image) => set((state) => {
      if (!state.currentProject) return {};
      return {
        currentProject: {
          ...state.currentProject,
          generatedContent: {
            ...state.currentProject.generatedContent,
            images: [...state.currentProject.generatedContent.images, image],
          },
          updatedAt: Date.now(),
        },
      };
    }),
    
    setCurrentStage: (stage) => set((state) => {
      if (!state.currentProject) return {};
      return {
        currentProject: {
          ...state.currentProject,
          currentStage: stage,
          updatedAt: Date.now(),
        },
      };
    }),
    
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    
    resetProject: () => set({ currentProject: null, error: null }),
    
    // ... other action implementations
  }))
);
```

---

## 4. API Integration Layer

### 4.1 Create `src/services/api.ts`

```typescript
// src/services/api.ts

import axios, { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class APIClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }
  
  // Project Management
  async createProject(projectName: string) {
    const res = await this.client.post('/api/ugc/projects', { projectName });
    return res.data;
  }
  
  async uploadImages(projectId: string, files: File[], type: 'model' | 'product') {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const res = await this.client.post(
      `/api/ugc/projects/${projectId}/upload?type=${type}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data;
  }
  
  // Orchestration
  async analyzeInputs(projectId: string) {
    const res = await this.client.post(`/api/ugc/projects/${projectId}/analyze`);
    return res.data;
  }
  
  async generateScript(projectId: string) {
    const res = await this.client.post(`/api/ugc/projects/${projectId}/generate-script`);
    return res.data;
  }
  
  async generateImages(projectId: string) {
    const res = await this.client.post(`/api/ugc/projects/${projectId}/generate-images`);
    return res.data;
  }
  
  async generateVideos(projectId: string) {
    const res = await this.client.post(`/api/ugc/projects/${projectId}/generate-videos`);
    return res.data;
  }
}

export const apiClient = new APIClient();
```

---

## 5. First Component: Input Module

### 5.1 Create `src/components/UGC/Orchestration/InputModule.tsx`

```typescript
// src/components/UGC/Orchestration/InputModule.tsx

import React, { useState } from 'react';
import { useUGCStore } from '../../../store/ugcStore';
import { apiClient } from '../../../services/api';
import { UploadedAsset } from '../../../types/ugc';
import FileUpload from '../../Common/FileUpload';
import Button from '../../Common/Button';

interface InputModuleProps {
  projectId: string;
  onComplete: () => void;
}

export const InputModule: React.FC<InputModuleProps> = ({ projectId, onComplete }) => {
  const store = useUGCStore();
  const [isUploading, setIsUploading] = useState(false);
  const [links, setLinks] = useState('');
  
  const handleModelPhotoDrop = async (files: File[]) => {
    try {
      setIsUploading(true);
      const result = await apiClient.uploadImages(projectId, files, 'model');
      store.addModelPhotos(result.assets);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleProductPhotoDrop = async (files: File[]) => {
    try {
      setIsUploading(true);
      const result = await apiClient.uploadImages(projectId, files, 'product');
      store.addProductPhotos(result.assets);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleAddLink = (link: string) => {
    if (link.trim()) {
      store.addNarrativeLink(link);
      setLinks('');
    }
  };
  
  const isComplete =
    store.currentProject?.inputAssets.modelPhotos.length! > 0 &&
    store.currentProject?.inputAssets.productPhotos.length! > 0 &&
    store.currentProject?.inputAssets.narrativeLinks.length! > 0;
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Upload Model Photos</h3>
        <FileUpload
          onDrop={handleModelPhotoDrop}
          accept="image/*"
          isLoading={isUploading}
        />
        
        {store.currentProject?.inputAssets.modelPhotos.map((asset) => (
          <div key={asset.id} className="mt-2 p-2 bg-gray-100 rounded text-sm">
            {asset.fileName}
          </div>
        ))}
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Upload Product Photos</h3>
        <FileUpload
          onDrop={handleProductPhotoDrop}
          accept="image/*"
          isLoading={isUploading}
        />
        
        {store.currentProject?.inputAssets.productPhotos.map((asset) => (
          <div key={asset.id} className="mt-2 p-2 bg-gray-100 rounded text-sm">
            {asset.fileName}
          </div>
        ))}
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Narrative Reference Links</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            placeholder="Paste TikTok, Instagram, or Google Doc link..."
            className="flex-1 px-3 py-2 border rounded"
            onKeyPress={(e) => e.key === 'Enter' && handleAddLink(links)}
          />
          <Button onClick={() => handleAddLink(links)}>Add Link</Button>
        </div>
        
        {store.currentProject?.inputAssets.narrativeLinks.map((link) => (
          <div key={link} className="mt-2 p-2 bg-gray-100 rounded text-sm truncate">
            {link}
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={onComplete}
          disabled={!isComplete || isUploading}
          className="px-8"
        >
          Analyze & Generate Script
        </Button>
      </div>
    </div>
  );
};
```

---

## 6. Main Orchestration Page

### 6.1 Create `src/pages/UGCOrchestration.tsx`

```typescript
// src/pages/UGCOrchestration.tsx

import React, { useState } from 'react';
import { useUGCStore } from '../store/ugcStore';
import { apiClient } from '../services/api';
import { InputModule } from '../components/UGC/Orchestration/InputModule';
import { ScriptReviewPanel } from '../components/UGC/Orchestration/ScriptReviewPanel';
import { ImageGalleryView } from '../components/UGC/Orchestration/ImageGalleryView';
import { QAResultsPanel } from '../components/UGC/Orchestration/QAResultsPanel';
import { ProgressBar } from '../components/Common/ProgressBar';

export const UGCOrchestrationPage: React.FC = () => {
  const store = useUGCStore();
  const [projectId, setProjectId] = useState<string | null>(null);
  
  // Initialize project
  const initializeProject = async () => {
    const userId = 'current-user-id'; // Get from auth
    store.initializeProject('New UGC Campaign', userId);
    
    // Create project on backend
    const result = await apiClient.createProject('New UGC Campaign');
    setProjectId(result.projectId);
  };
  
  if (!projectId || !store.currentProject) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">AI Orchestration Workspace</h1>
        <button
          onClick={initializeProject}
          className="px-6 py-2 bg-blue-600 text-white rounded"
        >
          New Project
        </button>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold">{store.currentProject.projectName}</h1>
        <ProgressBar stage={store.currentProject.currentStage} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {store.currentProject.currentStage === 'INPUT' && (
            <InputModule
              projectId={projectId}
              onComplete={() => {
                // Trigger analysis
                store.setCurrentStage('ANALYSIS');
                apiClient.analyzeInputs(projectId);
              }}
            />
          )}
          
          {store.currentProject.currentStage === 'SCRIPTING' && (
            <ScriptReviewPanel
              onApprove={() => store.setCurrentStage('PROMPTING')}
            />
          )}
          
          {store.currentProject.currentStage === 'GENERATING' && (
            <ImageGalleryView
              onApprove={() => store.setCurrentStage('QA')}
            />
          )}
          
          {store.currentProject.currentStage === 'QA' && (
            <QAResultsPanel
              onApprove={() => store.setCurrentStage('VIDEO_GENERATION')}
            />
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## 7. Quick Test Checklist

```markdown
# Development Checklist

## Week 1-2: Foundation
- [ ] React + Vite setup complete
- [ ] TypeScript types defined
- [ ] Zustand store working
- [ ] API client configured
- [ ] Supabase connected
- [ ] Auth integrated

## Week 2-3: Input Module
- [ ] File upload working
- [ ] Asset storage to Supabase
- [ ] URL generation
- [ ] Input validation
- [ ] Visual preview of uploads

## Week 3-4: Script Generation
- [ ] OpenAI API integration
- [ ] Script generation working
- [ ] Script UI displaying correctly
- [ ] User can review/regenerate

## Week 4-5: Prompt Engineering
- [ ] Visual style generation
- [ ] Scene-specific prompts
- [ ] Prompt editor UI
- [ ] Consistency checkpoints visible

## Week 5-6: Image Generation
- [ ] KIE.AI connection established
- [ ] Nano Banana image generation working
- [ ] Gallery displaying images
- [ ] Real-time WebSocket updates
- [ ] Regeneration per image working

## Week 6-7: QA Engine
- [ ] Vision API integration
- [ ] Consistency checks running
- [ ] Issues detected correctly
- [ ] QA results displayed
- [ ] Recommendations shown

## Week 7-8: Video Generation
- [ ] Veo 3.1 API working
- [ ] Videos generating from images
- [ ] Video gallery functional
- [ ] Project export working
```

---

## 8. Debugging Tips

### WebSocket Connection
```typescript
// Check if WebSocket is connected
const ws = new WebSocket('wss://...');
ws.onopen = () => console.log('Connected!');
ws.onerror = (e) => console.error('Error:', e);
ws.onclose = () => console.log('Disconnected');
```

### API Requests
```typescript
// Log all API calls
apiClient.interceptors.response.use(
  response => {
    console.log('Response:', response.data);
    return response;
  },
  error => {
    console.error('Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
```

### State Mutations
```typescript
// Enable Zustand devtools to track state changes
// Open browser console and type:
// zustand.getState() to see current state
```

---

## Next Steps

1. **Start with foundation** - Set up React, Zustand, API client
2. **Build Input Module** - Get file upload working first
3. **Mock API responses** - Use dummy data while backend is being built
4. **Iterate on UI** - Get user feedback early
5. **Integrate real APIs** - Swap mock data with real API calls

Good luck! 🚀
