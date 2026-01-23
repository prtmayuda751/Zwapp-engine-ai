// types/ugc.ts - UGC AI Orchestration Workspace Types

// ============ ENUMS ============
export type WorkflowStage = 
  | 'INPUT' 
  | 'ANALYSIS' 
  | 'SCRIPTING' 
  | 'PROMPTING' 
  | 'GENERATING' 
  | 'QA' 
  | 'VIDEO_GENERATION' 
  | 'COMPLETE';

export type ProjectStatus = 'IDLE' | 'PROCESSING' | 'PAUSED' | 'COMPLETE' | 'ERROR';

// ============ ASSETS ============
export interface UploadedAsset {
  id: string;
  fileName: string;
  supabaseUrl: string;
  supabasePath: string;
  size: number; // bytes
  uploadedAt: number;
  type?: 'model' | 'product' | 'moodboard';
}

export interface InputAssets {
  modelPhotos: UploadedAsset[];
  productPhotos: UploadedAsset[];
  narrativeLinks: string[];
  moodboardImages?: UploadedAsset[];
}

// ============ EXTRACTED PROFILES ============
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

// ============ GENERATED CONTENT ============
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
  nanobananaTaskId?: string;
  qualityScore: number;
  issues?: string[];
  createdAt: number;
}

export interface GeneratedVideo {
  id: string;
  imageId: string;
  videoUrl: string;
  veoTaskId?: string;
  duration?: number;
  createdAt: number;
}

export interface QAResult {
  qualityScore: number;
  issues: string[];
  recommendations: string[];
  timestamp: number;
}

// ============ PROJECT ============
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
  
  qaResults: Record<string, QAResult>;
  
  createdAt: number;
  updatedAt: number;
}

// ============ PROGRESS EVENTS ============
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

// ============ API RESPONSES ============
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
