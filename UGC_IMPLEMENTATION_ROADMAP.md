# UGC AI Orchestration - Implementation Roadmap & Cost Analysis

---

## 1. Detailed Implementation Phases

### Phase 1: Foundation & Infrastructure (Week 1-2)

**Objective:** Setup dev environment, database schema, authentication

#### 1.1 Database Schema (Supabase)

```sql
-- Projects table
CREATE TABLE ugc_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'IDLE',
  current_stage VARCHAR(50) DEFAULT 'INPUT',
  
  -- Input assets metadata
  model_photos JSONB,
  product_photos JSONB,
  narrative_links TEXT[],
  
  -- Generated content
  generated_script JSONB,
  visual_style_guide JSONB,
  prompts JSONB[],
  
  -- Assets
  generated_images JSONB[],
  generated_videos JSONB[],
  
  -- QA Results
  qa_results JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, name)
);

-- Version history
CREATE TABLE ugc_project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES ugc_projects(id),
  version_number INT,
  snapshot JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Asset tracking
CREATE TABLE ugc_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES ugc_projects(id),
  asset_type VARCHAR(50), -- 'model_photo', 'product_photo', 'generated_image', 'generated_video'
  supabase_path VARCHAR(500),
  supabase_url VARCHAR(1000),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Task tracking (for KIE.AI & OpenAI calls)
CREATE TABLE ugc_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES ugc_projects(id),
  task_type VARCHAR(50), -- 'script_generation', 'image_generation', 'video_generation'
  external_task_id VARCHAR(255), -- KIE.AI taskId or OpenAI request ID
  status VARCHAR(50) DEFAULT 'PENDING',
  request_payload JSONB,
  response_payload JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_ugc_projects_user_id ON ugc_projects(user_id);
CREATE INDEX idx_ugc_tasks_project_id ON ugc_tasks(project_id);
CREATE INDEX idx_ugc_assets_project_id ON ugc_assets(project_id);
```

#### 1.2 API Routes (Backend)

```
POST   /api/ugc/projects                    - Create new project
GET    /api/ugc/projects/:id                - Get project details
PATCH  /api/ugc/projects/:id                - Update project
DELETE /api/ugc/projects/:id                - Delete project

POST   /api/ugc/projects/:id/upload         - Upload model/product photos
POST   /api/ugc/projects/:id/analyze        - Analyze inputs & extract profiles

POST   /api/ugc/projects/:id/generate-script - Trigger script generation
POST   /api/ugc/projects/:id/generate-prompts - Generate visual style & prompts
POST   /api/ugc/projects/:id/generate-images  - Trigger image generation
POST   /api/ugc/projects/:id/run-qa          - Run QA checks
POST   /api/ugc/projects/:id/generate-videos  - Trigger video generation

POST   /api/ugc/projects/:id/regenerate-image - Regenerate single image

GET    /api/ugc/projects/:id/assets        - List all project assets
GET    /api/ugc/projects/:id/versions      - Get version history
POST   /api/ugc/projects/:id/restore       - Restore from version

WS     /ws/ugc/:projectId                  - WebSocket for real-time progress
```

#### 1.3 Environment Setup

```bash
# Install dependencies
npm install zustand socket.io-client axios

# Environment variables (.env.local)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_OPENAI_API_KEY= (free tier)
VITE_KIE_AI_API_KEY=
VITE_API_URL=http://localhost:3000
```

**Deliverables:**
- [x] Supabase schema created
- [x] Authentication integrated
- [x] Backend routes scaffolded
- [x] Frontend store (Zustand) setup
- [x] TypeScript types defined

---

### Phase 2: Input Module & Context Extraction (Week 2-3)

**Objective:** Build input UI, file upload, and context analysis

#### 2.1 Input Module Components

```typescript
// components/UGC/InputModule/
├── ModelPhotoUpload.tsx       // Drag-drop model photo upload
├── ProductPhotoUpload.tsx     // Product photo upload
├── NarrativeLinkInput.tsx     // Paste narrative links
├── MoodboardUpload.tsx        // Optional mood board
├── InputPreview.tsx           // Show uploaded assets
└── InputValidation.tsx        // Validate inputs before proceeding
```

#### 2.2 Context Extraction Service

```typescript
// services/contextExtraction.ts

async function extractContextFromInputs(
  inputs: InputAssets
): Promise<ExtractedContext> {
  // Step 1: Analyze model photos
  const modelProfile = await analyzeModelPhotos(inputs.modelPhotos);
  
  // Step 2: Analyze product photos
  const productProfile = await analyzeProductPhotos(inputs.productPhotos);
  
  // Step 3: Parse narrative links
  const narrativeContext = await parseNarrativeLinks(inputs.narrativeLinks);
  
  return {
    modelProfile,
    productProfile,
    narrativeContext
  };
}

async function analyzeModelPhotos(photos: UploadedAsset[]): Promise<ModelProfile> {
  // Option 1: Use GCP Vision API (free tier available)
  const visionClient = new vision.ImageAnnotatorClient();
  
  const [result] = await visionClient.labelDetection({
    image: { source: { imageUri: photos[0].supabaseUrl } }
  });
  
  const labels = result.labelAnnotations || [];
  
  return {
    appearance: extractAppearanceFromLabels(labels),
    poses: extractPosesFromLabels(labels),
    expressions: [], // Could enhance with face detection
    outfitStyle: extractOutfitStyleFromLabels(labels),
  };
  
  // Option 2: Use OpenAI Vision (paid but more accurate)
  // const response = await openai.vision.analyze({
  //   image_url: photos[0].supabaseUrl,
  //   prompt: "Describe the model's appearance, typical poses, and outfit style..."
  // });
}

async function parseNarrativeLinks(links: string[]): Promise<NarrativeContext> {
  const contexts = await Promise.all(
    links.map(async (link) => {
      if (link.includes('tiktok.com')) {
        return parseTikTokLink(link);
      } else if (link.includes('instagram.com')) {
        return parseInstagramLink(link);
      } else if (link.includes('drive.google.com')) {
        return parseGoogleDocLink(link);
      }
      return { brandVoice: '', targetAudience: '', campaignGoal: '' };
    })
  );
  
  // Synthesize multiple contexts into one
  return synthesizeNarrativeContext(contexts);
}
```

**Deliverables:**
- [x] Input module fully functional
- [x] File upload working
- [x] Context extraction service built
- [x] Profile data structured and stored

---

### Phase 3: Script Generation (OpenAI) (Week 3)

**Objective:** Generate advertisement scripts using OpenAI Chat

#### 3.1 Script Generation Service

```typescript
// services/scriptGeneration.ts

async function generateAdvertScript(context: {
  modelProfile: ModelProfile;
  productProfile: ProductProfile;
  narrativeContext: NarrativeContext;
}): Promise<GeneratedScript> {
  const systemPrompt = `
You are an expert advertising copywriter specializing in UGC (User Generated Content).
Create compelling scripts following the HOOK-PROBLEM-SOLUTION-CTA framework.
Be specific about model actions, expressions, and product interactions.
Make it authentic, relatable, and conversion-focused.

Output MUST be valid JSON with this structure:
{
  "hook": "string",
  "problemStatement": "string",
  "solution": "string",
  "cta": "string",
  "fullNarrative": "string",
  "sceneBreakdown": [
    {
      "sceneNumber": 1,
      "description": "string",
      "modelAction": "string",
      "modelExpression": "string",
      "productPlacement": "string",
      "backgroundDescription": "string",
      "cameraAngle": "string",
      "narrativePoint": "string"
    }
  ]
}
  `;
  
  const userPrompt = `
Create a ${context.narrativeContext.campaignGoal} advertisement script for:

PRODUCT:
- Name: ${context.productProfile.name}
- Colors: ${context.productProfile.colors.join(', ')}
- Key Features: ${context.productProfile.keyFeatures.join(', ')}

MODEL:
- Appearance: ${context.modelProfile.appearance}
- Typical Poses: ${context.modelProfile.poses.join(', ')}

BRAND:
- Voice: ${context.narrativeContext.brandVoice}
- Target Audience: ${context.narrativeContext.targetAudience}
- Key Messages: ${context.narrativeContext.keyMessages.join('; ')}

Create 4-5 short scenes (each 3-5 seconds) that flow naturally and tell a compelling story.
Emphasize how the product solves the problem for the target audience.
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
    max_tokens: 2000
  });
  
  const scriptJSON = JSON.parse(response.choices[0].message.content || '{}');
  return scriptJSON as GeneratedScript;
}
```

#### 3.2 Script Review Component

```typescript
// components/UGC/ScriptReviewPanel/
├── ScriptDisplay.tsx          // Show generated script (H-P-S-CTA)
├── SceneBreakdownList.tsx     // List all scenes with thumbnails
├── EditScriptModal.tsx        // Regenerate/edit script
└── ScriptApprovalButton.tsx   // Approve to proceed
```

**Deliverables:**
- [x] OpenAI integration working
- [x] Script generation producing valid JSON
- [x] Script review UI polished
- [x] User can regenerate if unsatisfied

---

### Phase 4: Prompt Engineering & Visual Style (Week 4)

**Objective:** Generate structured prompts with consistency controls

#### 4.1 Prompt Engineering Service

```typescript
// services/promptEngineering.ts

async function generateVisualStyleGuide(context: {
  modelProfile: ModelProfile;
  productProfile: ProductProfile;
  narrativeContext: NarrativeContext;
  script: GeneratedScript;
}): Promise<VisualStyleGuide> {
  // Use structured prompting to generate style guide
  
  const stylePrompt = `
Based on the product (${context.productProfile.name}) and brand voice (${context.narrativeContext.brandVoice}),
generate a visual style guide:

OUTPUT as JSON:
{
  "cameraSpecs": "e.g., 35mm lens, f/2.8, ISO 400",
  "lighting": "e.g., Natural, golden hour, soft studio",
  "backgroundStyle": "e.g., Urban, minimal, lifestyle",
  "colorPalette": ["color1", "color2", "color3"],
  "compositions": ["rule of thirds", "close-up focus", "wide establishing shot"]
}
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: stylePrompt }],
    temperature: 0.7,
    response_format: { type: "json_object" }
  });
  
  return JSON.parse(response.choices[0].message.content || '{}');
}

async function generateScenePrompt(
  scene: SceneBreakdown,
  context: {
    modelPhotos: string[]; // Supabase URLs
    productPhotos: string[];
    visualStyleGuide: VisualStyleGuide;
  }
): Promise<PromptTemplate> {
  
  const consistencyCheckpoints = [
    {
      aspect: "model_face",
      requirement: `MUST maintain same model as reference image. Same eye color (${extractEyeColor(context.modelPhotos[0])}), skin tone, hairstyle`
    },
    {
      aspect: "product_accuracy",
      requirement: `Product MUST match reference photos exactly. Colors: ${context.visualStyleGuide.colorPalette.join(', ')}`
    },
    {
      aspect: "background",
      requirement: `Background style: ${context.visualStyleGuide.backgroundStyle}. Consistent lighting and environment.`
    },
    {
      aspect: "lighting",
      requirement: `Camera: ${context.visualStyleGuide.cameraSpecs}. Lighting: ${context.visualStyleGuide.lighting}. Consistent throughout scenes.`
    }
  ];
  
  const basePrompt = `
[REFERENCE IMAGES]
- Model: ${context.modelPhotos.length} reference image(s)
- Product: ${context.productPhotos.length} reference image(s)

[SCENE ${scene.sceneNumber}]
${scene.description}
- Model Action: ${scene.modelAction}
- Expression: ${scene.modelExpression}
- Product Placement: ${scene.productPlacement}
- Camera: ${scene.cameraAngle}
- Background: ${scene.backgroundDescription}

[STYLE REQUIREMENTS]
- Camera: ${context.visualStyleGuide.cameraSpecs}
- Lighting: ${context.visualStyleGuide.lighting}
- Style: ${context.visualStyleGuide.compositions.join(', ')}
- Colors: ${context.visualStyleGuide.colorPalette.join(', ')}

[CONSISTENCY REQUIREMENTS]
${consistencyCheckpoints.map(cp =>
  `- ${cp.aspect}: ${cp.requirement}`
).join('\n')}

[OUTPUT]
Generate photorealistic image combining reference model + reference product.
NO photoshop evidence - natural integration.
4K quality, professional commercial standard.
  `;
  
  return {
    sceneId: scene.sceneNumber.toString(),
    basePrompt,
    consistencyCheckpoints,
    generatedPrompt: basePrompt
  };
}
```

#### 4.2 Prompt Editor Component

```typescript
// components/UGC/PromptEngineeringPanel/
├── VisualStyleGuideSummary.tsx    // Show extracted style
├── ScenePromptAccordion.tsx       // Editable prompt per scene
├── PromptPreview.tsx              // Live preview of how it'll be used
├── ConsistencyChecklist.tsx       // Checklist of consistency requirements
└── LockPromptsButton.tsx          // Lock & proceed to generation
```

**Deliverables:**
- [x] Visual style guide auto-generated
- [x] Scene prompts structured with variables
- [x] Consistency checkpoints defined per scene
- [x] User can iterate on prompts
- [x] Prompts locked before image generation

---

### Phase 5: Image Generation (KIE.AI Nano Banana) (Week 5-6)

**Objective:** Generate images with reference-based multimodal generation

#### 5.1 Image Generation Service

```typescript
// services/imageGeneration.ts

async function generateSceneImages(
  scenes: SceneBreakdown[],
  context: {
    modelPhotos: UploadedAsset[];
    productPhotos: UploadedAsset[];
    prompts: PromptTemplate[];
  },
  onProgress?: (event: ImageGenerationProgressEvent) => void
): Promise<GeneratedImage[]> {
  
  const generatedImages: GeneratedImage[] = [];
  
  // Generate images in parallel (up to 3 at a time)
  const batchSize = 3;
  for (let i = 0; i < scenes.length; i += batchSize) {
    const batch = scenes.slice(i, i + batchSize);
    
    const batchResults = await Promise.all(
      batch.map(async (scene, batchIndex) => {
        const sceneIndex = i + batchIndex;
        const prompt = context.prompts[sceneIndex];
        
        try {
          onProgress?.({
            sceneNumber: sceneIndex + 1,
            total: scenes.length,
            status: 'generating'
          });
          
          // Call KIE.AI Nano Banana
          const response = await kieAI.nanobanana.generateImage({
            model: "google/nano-banana", // or "google/nano-banana-vision"
            input: {
              prompt: prompt.generatedPrompt,
              image_urls: [
                context.modelPhotos[0].supabaseUrl,
                context.productPhotos[0].supabaseUrl
              ],
              output_format: "png",
              image_size: "landscape_16_9",
            }
          });
          
          if (response.code === 200) {
            const imageUrl = response.data.resultJson.resultUrls[0];
            
            // Store image metadata
            const generatedImage: GeneratedImage = {
              id: crypto.randomUUID(),
              sceneId: scene.sceneNumber.toString(),
              prompt: prompt.generatedPrompt,
              imageUrl,
              nanobananaTaskId: response.data.taskId,
              qualityScore: 0,
              createdAt: Date.now()
            };
            
            onProgress?.({
              sceneNumber: sceneIndex + 1,
              total: scenes.length,
              status: 'complete',
              imageUrl
            });
            
            return generatedImage;
          } else {
            throw new Error(`KIE.AI error: ${response.msg}`);
          }
          
        } catch (error) {
          onProgress?.({
            sceneNumber: sceneIndex + 1,
            total: scenes.length,
            status: 'error',
            error: error.message
          });
          throw error;
        }
      })
    );
    
    generatedImages.push(...batchResults);
  }
  
  return generatedImages;
}
```

#### 5.2 Image Gallery Components

```typescript
// components/UGC/ImageGalleryView/
├── ImageGrid.tsx              // Grid view of generated images
├── ImageCard.tsx              // Individual image with quality score
├── ImageDetailModal.tsx       // Fullscreen image preview
├── QualityBadge.tsx          // Quality score display
├── RegenerateButton.tsx       // Trigger regeneration
└── ImageLoadingState.tsx      // Show progress as images arrive
```

**Deliverables:**
- [x] KIE.AI Nano Banana integration working
- [x] Images generated with reference-based prompts
- [x] Real-time progress updates via WebSocket
- [x] Gallery view with all generated images
- [x] Per-image regeneration working

---

### Phase 6: Quality Assurance Engine (Week 6)

**Objective:** Implement automated consistency checking

#### 6.1 QA Service

```typescript
// services/qualityAssurance.ts

async function runQualityAssurance(
  image: GeneratedImage,
  checkpoints: ConsistencyCheckpoint[],
  context: {
    modelPhotos: string[];
    productPhotos: string[];
    previousImage?: GeneratedImage;
  }
): Promise<QAResult> {
  
  const issues: string[] = [];
  const recommendations: string[] = [];
  let qualityScore = 100;
  
  // 1. Model Face Consistency
  const faceConsistency = await checkModelFaceConsistency(
    image.imageUrl,
    context.modelPhotos[0]
  );
  
  if (!faceConsistency.consistent) {
    issues.push(`Model face appearance changed: ${faceConsistency.reason}`);
    recommendations.push("Regenerate with stricter face consistency constraint");
    qualityScore -= 25;
  }
  
  // 2. Product Accuracy
  const productAccuracy = await checkProductAccuracy(
    image.imageUrl,
    context.productPhotos
  );
  
  if (!productAccuracy.accurate) {
    issues.push(`Product inaccuracy: ${productAccuracy.reason}`);
    recommendations.push("Regenerate with clearer product reference");
    qualityScore -= 30;
  }
  
  // 3. Lighting Consistency (if previous image exists)
  if (context.previousImage) {
    const lightingConsistency = await checkLightingConsistency(
      image.imageUrl,
      context.previousImage.imageUrl
    );
    
    if (!lightingConsistency.consistent) {
      issues.push("Lighting differs from previous scene");
      recommendations.push("Adjust lighting parameters in prompt");
      qualityScore -= 15;
    }
  }
  
  // 4. Photorealism Score
  const realismScore = await assessPhotorealism(image.imageUrl);
  
  if (realismScore < 75) {
    issues.push("Image appears AI-generated or artificial");
    recommendations.push("Refine prompt to emphasize photorealism and natural integration");
    qualityScore = Math.min(qualityScore, realismScore);
  }
  
  // 5. Overall Composition
  const compositionScore = await assessComposition(image.imageUrl);
  if (compositionScore < 70) {
    issues.push("Composition could be improved");
    recommendations.push("Adjust camera angle or framing in prompt");
    qualityScore = Math.min(qualityScore, compositionScore);
  }
  
  return {
    qualityScore: Math.max(0, qualityScore),
    issues,
    recommendations,
    timestamp: Date.now()
  };
}

// Helper: Face consistency checking
async function checkModelFaceConsistency(
  generatedImageUrl: string,
  referenceImageUrl: string
): Promise<{ consistent: boolean; reason?: string }> {
  
  // Option 1: Use face detection + embedding comparison
  // Extract face embeddings from both images
  const generatedFace = await detectAndEmbedFace(generatedImageUrl);
  const referenceFace = await detectAndEmbedFace(referenceImageUrl);
  
  if (!generatedFace || !referenceFace) {
    return { consistent: false, reason: "Could not detect face in one or both images" };
  }
  
  // Compare embeddings (cosine similarity > 0.8 = similar)
  const similarity = cosineSimilarity(generatedFace.embedding, referenceFace.embedding);
  
  return {
    consistent: similarity > 0.75,
    reason: similarity < 0.75 ? `Face similarity only ${(similarity * 100).toFixed(1)}%` : undefined
  };
}

// Helper: Product accuracy checking
async function checkProductAccuracy(
  generatedImageUrl: string,
  productReferenceUrls: string[]
): Promise<{ accurate: boolean; reason?: string }> {
  
  // Use object detection to find product in generated image
  const detectedObjects = await detectObjects(generatedImageUrl);
  
  // Compare color distribution with reference
  const referenceColors = await analyzeColorDistribution(productReferenceUrls[0]);
  const generatedColors = await analyzeColorDistribution(generatedImageUrl);
  
  // Check if colors match
  const colorMatch = compareColorDistributions(referenceColors, generatedColors);
  
  if (colorMatch < 0.7) {
    return {
      accurate: false,
      reason: `Product colors don't match reference. Match score: ${(colorMatch * 100).toFixed(1)}%`
    };
  }
  
  return { accurate: true };
}

// Helper: Photorealism assessment
async function assessPhotorealism(imageUrl: string): Promise<number> {
  // Use a pre-trained model to assess photorealism
  // Or use Claude's vision capabilities with structured output
  
  const response = await openai.vision.analyze({
    image_url: imageUrl,
    prompt: `Rate the photorealism of this image on a scale of 0-100, where 100 is perfectly photorealistic and 0 is obviously AI-generated. 
             Consider: texture quality, lighting consistency, natural shadows, object integration, absence of artifacts.
             Respond with ONLY a number.`
  });
  
  return parseInt(response) || 50;
}
```

#### 6.2 QA Results Display

```typescript
// components/UGC/QAResultsPanel/
├── QASummary.tsx              // Overall pass/fail summary
├── QAResultsList.tsx          // List all images with issues
├── IssueDetail.tsx            // Detailed issue explanation
├── RecommendationPanel.tsx    // Suggested fixes
└── ApprovalButton.tsx         // Approve all for video
```

**Deliverables:**
- [x] QA engine evaluating all generated images
- [x] Issues detected and categorized
- [x] Recommendations provided
- [x] User can regenerate based on feedback
- [x] Clear pass/fail criteria

---

### Phase 7: Video Generation (KIE.AI Veo 3.1) (Week 7)

**Objective:** Convert images to videos with narrative audio

#### 7.1 Video Generation Service

```typescript
// services/videoGeneration.ts

async function generateVideoFromImages(
  images: GeneratedImage[],
  script: GeneratedScript,
  onProgress?: (event: VideoGenerationProgressEvent) => void
): Promise<GeneratedVideo[]> {
  
  const videos: GeneratedVideo[] = [];
  
  for (const [index, image] of images.entries()) {
    try {
      onProgress?.({
        imageNumber: index + 1,
        totalImages: images.length,
        status: 'generating'
      });
      
      // Get narrative for this scene
      const scene = script.sceneBreakdown[index];
      const narrativePrompt = `${scene.modelAction}. ${scene.modelExpression}. ${scene.productPlacement}`;
      
      // Call KIE.AI Veo 3.1 Image-to-Video
      const response = await kieAI.veo.generateVideo({
        model: "veo3_fast", // Fast for speed, or "veo3" for quality
        input: {
          imageUrls: [image.imageUrl],
          prompt: `A professional UGC video scene. ${narrativePrompt}. Smooth, natural motion.`,
          generationType: "FIRST_AND_LAST_FRAMES_2_VIDEO",
          aspect_ratio: "16:9",
          seeds: Math.floor(Math.random() * (99999 - 10000)) + 10000,
          enableTranslation: false,
          // Optional: Add audio
          // audio: generateAudioFromScript(scene)
        }
      });
      
      if (response.code === 200) {
        const videoUrl = response.data.resultJson.resultUrls[0];
        
        const video: GeneratedVideo = {
          id: crypto.randomUUID(),
          imageId: image.id,
          videoUrl,
          veoTaskId: response.data.taskId,
          sceneNumber: index + 1,
          duration: 0, // Can be extracted from video metadata
          createdAt: Date.now()
        };
        
        videos.push(video);
        
        onProgress?.({
          imageNumber: index + 1,
          totalImages: images.length,
          status: 'complete',
          videoUrl
        });
        
      } else {
        throw new Error(`Veo API error: ${response.msg}`);
      }
      
    } catch (error) {
      console.error(`Video generation failed for image ${index}:`, error);
      onProgress?.({
        imageNumber: index + 1,
        totalImages: images.length,
        status: 'error',
        error: error.message
      });
    }
  }
  
  return videos;
}

// Optional: Generate audio narration using TTS
async function generateAudioFromScript(scene: SceneBreakdown): Promise<string> {
  // Use ElevenLabs, Google Cloud TTS, or AWS Polly
  const audioUrl = await elevenlabs.generate({
    text: scene.narrativePoint,
    voice_id: 'default',
    model_id: 'eleven_monolingual_v1'
  });
  
  return audioUrl;
}
```

#### 7.2 Video Generation Components

```typescript
// components/UGC/VideoGenerationPanel/
├── VideoGrid.tsx              // Grid of generated videos
├── VideoCard.tsx              // Individual video preview
├── VideoPlayer.tsx            // Full video player
├── ComposeClipButton.tsx       // Montage all clips into one video
└── VideoExportButton.tsx       // Download individual or batch
```

**Deliverables:**
- [x] KIE.AI Veo 3.1 integration working
- [x] Videos generated from images
- [x] Real-time progress updates
- [x] Video gallery and player working
- [x] Export functionality

---

### Phase 8: Project Management & Finalization (Week 8)

**Objective:** Save projects, version control, export workflows

#### 8.1 Project Management Service

```typescript
// services/projectManagement.ts

async function saveProjectToSupabase(project: UGCProject): Promise<void> {
  const { data, error } = await supabase
    .from('ugc_projects')
    .upsert({
      id: project.id,
      user_id: (await getCurrentUser()).id,
      name: project.projectName,
      status: project.workflowProgress.status,
      current_stage: project.currentStage,
      model_photos: project.inputAssets.modelPhotos,
      product_photos: project.inputAssets.productPhotos,
      narrative_links: project.inputAssets.narrativeLinks,
      generated_script: project.generatedContent.script,
      visual_style_guide: project.generatedContent.visualStyleGuide,
      prompts: project.generatedContent.prompts,
      generated_images: project.generatedContent.images,
      generated_videos: project.generatedContent.videos,
      qa_results: project.qaResults,
      updated_at: new Date().toISOString()
    });
  
  if (error) throw error;
}

async function createVersionSnapshot(projectId: string): Promise<void> {
  const project = await supabase
    .from('ugc_projects')
    .select('*')
    .eq('id', projectId)
    .single();
  
  // Create version snapshot
  await supabase
    .from('ugc_project_versions')
    .insert({
      project_id: projectId,
      version_number: (await getLatestVersionNumber(projectId)) + 1,
      snapshot: project.data
    });
}

async function exportProject(projectId: string, format: 'zip' | 'json' | 'pdf'): Promise<Buffer> {
  // Export project with all assets
  const project = await loadProjectFromSupabase(projectId);
  
  switch (format) {
    case 'zip':
      return await createProjectZip(project);
    case 'json':
      return JSON.stringify(project, null, 2);
    case 'pdf':
      return await generateProjectPDF(project);
    default:
      throw new Error('Unknown export format');
  }
}
```

#### 8.2 Export & Sharing Components

```typescript
// components/UGC/ProjectManagement/
├── ProjectHeader.tsx          // Project name, save status
├── ExportButton.tsx           // Download as ZIP/JSON/PDF
├── VersionHistory.tsx         // List all saved versions
├── ShareButton.tsx            // Generate share link (future)
└── ProjectSettings.tsx        // Rename, delete, etc
```

**Deliverables:**
- [x] Project saving to Supabase
- [x] Version history tracking
- [x] Export functionality (ZIP with all assets)
- [x] Project restoration from versions
- [x] Complete project lifecycle management

---

## 2. Cost Breakdown & Optimization

### 2.1 Per-Project Cost Analysis

| Service | Per Use | Per Project | Unit | Strategy |
|---------|---------|-------------|------|----------|
| **OpenAI GPT-4** | $0.015 | $0.015 | 1 script generation | Free tier sufficient |
| **KIE.AI Nano Banana** | $0.08 | $0.40 | 5 images × 4K | Bulk pricing available |
| **KIE.AI Veo 3.1** | $0.12 | $0.60 | 5 videos × 1080p | Fast mode cheaper |
| **Supabase Storage** | $0 | $0 | Per project files | Free tier: 1GB |
| **Supabase Database** | $0 | $0 | Queries, rows | Free tier sufficient |
| **GCP Vision API** | Free | Free | ~1000 requests/month | Free quota sufficient |
| **WebSocket/API** | $0 | $0 | Vercel/Railway free tier | Included in hosting |
| | | | |
| **TOTAL COST** | | **~$1.05** | **Per project** |

### 2.2 Cost Optimization Strategies

#### Strategy 1: Lazy Video Generation
```
Don't auto-generate videos. Only generate when user clicks "Generate Video" button.
Saves ~$0.60 per project if user just wants images.
```

#### Strategy 2: Image Reuse
```
If user regenerates only scene 3, don't regenerate scenes 1-2.
Use existing images, only regenerate the changed scene.
Saves ~$0.16 per regeneration (1 image instead of 5).
```

#### Strategy 3: Batch Processing
```
Queue regeneration jobs for off-peak hours.
Process 10 projects together instead of individually.
Potential 10-15% discount with KIE.AI bulk pricing.
```

#### Strategy 4: Quality Tiers
```
MVP: Nano Banana only (image generation)
Tier 1: Images only (~$0.40/project)
Tier 2: Images + Video (~$1.00/project)
Tier 3: Images + Video + Audio (~$1.20/project)
```

#### Strategy 5: Prompt Caching
```
Store common prompts & visual style guides in vector DB.
For similar projects, reuse templates instead of regenerating.
Saves ~$0.10-0.20 per similar project.
```

### 2.3 Revenue Model Options

**Option A: Pay-Per-Project**
- $2-3 per project (100% margin after ~$1 cost)
- Simple, transparent pricing
- Target: 1000 projects/month = $2000-3000 revenue

**Option B: Subscription Tiers**
- Free tier: 2 projects/month (limited to 3 scenes each)
- Pro: $9.99/month (unlimited projects, up to 5 scenes)
- Agency: $49.99/month (priority processing, custom workflows)

**Option C: API Access**
- $0.05/image generation (to third-party platforms)
- $0.10/video generation
- Target: Integrations with Shopify, Creator platforms

**Option D: White-Label**
- License platform to brands/agencies
- $499/month for private deployment
- Includes technical support, customization

---

## 3. Timeline & Resource Allocation

### 3.1 Development Timeline (8 Weeks)

```
Week 1-2: Foundation
├─ Database schema & auth
├─ API scaffolding
└─ Frontend state management
  Team: 1 Full-stack engineer

Week 2-3: Input Module
├─ Upload components
├─ Context extraction
└─ Profile analysis
  Team: 1 Frontend + 1 Backend

Week 3-4: Script Generation
├─ OpenAI integration
├─ Script UI
└─ Iteration workflow
  Team: 1 Engineer (AI integration)

Week 4-5: Prompt Engineering
├─ Visual style generation
├─ Scene-specific prompts
└─ Consistency framework
  Team: 1 Engineer + PM (design prompts)

Week 5-6: Image Generation
├─ KIE.AI Nano Banana integration
├─ Gallery UI
└─ Parallel processing setup
  Team: 1 Frontend + 1 Backend

Week 6-7: QA Engine
├─ Vision analysis integration
├─ Consistency checking
└─ Issue reporting
  Team: 1 Engineer (ML/Vision)

Week 7-8: Video & Finalization
├─ Veo 3.1 integration
├─ Project management
├─ Export workflows
└─ Testing & polish
  Team: 1 Full-stack engineer

Total: 3-4 engineers, 1 PM (8 weeks)
```

### 3.2 Post-Launch Roadmap

**Month 2:**
- [ ] Webhook callbacks for async completion
- [ ] Batch project processing
- [ ] Basic analytics dashboard
- [ ] User onboarding flow

**Month 3:**
- [ ] Team collaboration (multiple users per project)
- [ ] API endpoints for integrations
- [ ] Advanced prompt templates library
- [ ] Performance optimization

**Month 4:**
- [ ] Fine-tuned models for specific brands
- [ ] Multi-language support
- [ ] Mobile app MVP
- [ ] Monetization implementation

---

## 4. Monitoring & Performance Metrics

### 4.1 Key Metrics to Track

```
User Metrics:
- Projects created per day/week/month
- Average time per project (input → completion)
- Iteration count (how many regenerations)
- User satisfaction (quality, ease of use)

Business Metrics:
- Revenue per project (if paid)
- Cost per project (actual spend on APIs)
- Gross margin
- Churn rate (if subscription)

Technical Metrics:
- API response times (OpenAI, KIE.AI, Vision)
- Image generation success rate
- Video generation success rate
- QA check accuracy
- System uptime

Quality Metrics:
- % of generated images passing QA
- Average quality score across projects
- User regeneration rate
- User approval rate (first-time approval %)
```

### 4.2 Monitoring Setup

```typescript
// services/monitoring.ts

// Track project metrics
interface ProjectMetrics {
  projectId: string;
  totalTime: number; // ms
  inputAnalysisTime: number;
  scriptGenerationTime: number;
  imageGenerationTime: number; // total for all images
  qaScanTime: number;
  videoGenerationTime: number; // optional
  imageBatchSize: number;
  videoCount: number;
  costActual: number;
  costEstimated: number;
}

// Log to analytics service (Posthog, Mixpanel, etc)
async function trackProjectCompletion(metrics: ProjectMetrics) {
  await analytics.track('project_completed', {
    duration_seconds: metrics.totalTime / 1000,
    image_count: metrics.imageBatchSize,
    video_count: metrics.videoCount,
    cost: metrics.costActual,
    success: true
  });
}

// Alert on issues
async function alertOnFailure(projectId: string, stage: string, error: string) {
  await alerts.slack({
    channel: '#ugc-system-errors',
    message: `❌ Project ${projectId} failed at ${stage}: ${error}`
  });
}
```

---

## 5. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **KIE.AI API downtime** | Can't generate images | Implement fallback to Replicate or Hugging Face |
| **OpenAI rate limits** | Script generation blocked | Implement queue + retry logic |
| **Poor image quality** | User satisfaction drops | QA gate requires 80%+ quality before proceeding |
| **Face inconsistency** | Output unusable | Use face detection + embedding comparison in QA |
| **Product hallucination** | Unusable output | Reference-based generation mitigates this |
| **Cost overruns** | Profit margin erodes | Cap per-project cost at $2, fail gracefully at limit |
| **Slow generation** | Bad UX | Parallel processing + progress streaming |

---

## 6. Success Criteria

**MVP Launch Success (8 weeks):**
- ✓ All 6 workflow stages functional
- ✓ Images generated are photorealistic
- ✓ Consistency score ≥ 80% for 90% of projects
- ✓ Time from input to output < 10 minutes
- ✓ Cost per project < $1.50

**Post-Launch Success (3 months):**
- ✓ 100+ active users
- ✓ 500+ projects completed
- ✓ 4.5+ star rating
- ✓ <20% regeneration rate (first-time approval)
- ✓ Break-even on infrastructure costs

**Scale Success (6 months):**
- ✓ 10,000+ projects
- ✓ $50K+ monthly revenue
- ✓ 98%+ uptime
- ✓ <2% error rate
- ✓ Profitable operations

---

## Recommendation

**Feasibility:** ✅ **HIGHLY FEASIBLE**

This system is buildable in 8 weeks with the right team. The architecture is sound, cost model is sustainable, and there's real market demand for this type of tool.

**Key Success Factors:**
1. **Focus on consistency** - This is the unique value prop
2. **User education** - Help users understand the workflow
3. **Iterate on QA** - Make the QA checks smarter over time
4. **Optimize costs** - Keep per-project cost under $1
5. **Build community** - Gather user feedback, iterate quickly

**Next Steps:**
1. Validate with 10 beta users
2. Refine prompts based on feedback
3. Build MVP (4-6 weeks)
4. Launch beta (2 weeks)
5. Iterate based on feedback (ongoing)

Go untuk build! 🚀

