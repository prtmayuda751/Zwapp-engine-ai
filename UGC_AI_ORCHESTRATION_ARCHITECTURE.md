# AI Orchestration Workspace - UGC System Architecture

**Konsep:** Intelligent Middleware untuk Content Creator, Marketer, Brand Owner  
**Date:** January 23, 2026  
**Status:** Architecture Proposal

---

## 1. High-Level Concept

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI ORCHESTRATION WORKSPACE                           │
│                                                                             │
│  User Input (Sederhana)                                                    │
│  ├─ Upload Model Photo                                                    │
│  ├─ Upload Product Reference(s)                                           │
│  ├─ Input Narrative Link (TikTok, Instagram, Brand Brief)                 │
│  └─ Optional: Scene Descriptions, Mood Board                              │
│                    ↓                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │         INTELLIGENT ORCHESTRATION ENGINE (Backend)                  │  │
│  │                                                                     │  │
│  │  Step 1: ANALYZE & EXTRACT                                         │  │
│  │  ├─ Parse user reference links → Extract narrative context        │  │
│  │  ├─ Analyze model photos → Extract pose, expression, style        │  │
│  │  └─ Analyze product photos → Extract colors, shapes, details      │  │
│  │                                                                     │  │
│  │  Step 2: SCRIPT GENERATION (OpenAI Chat - FREE)                   │  │
│  │  ├─ Generate advertisement narrative                              │  │
│  │  ├─ Hook → Problem → Solution → CTA                               │  │
│  │  └─ Scene breakdown with gestures, expressions, actions           │  │
│  │                                                                     │  │
│  │  Step 3: PROMPT ENGINEERING                                        │  │
│  │  ├─ Create visual consistency guidelines                           │  │
│  │  ├─ Generate scene-specific image generation prompts              │  │
│  │  ├─ Define model pose, outfit, product placement                  │  │
│  │  ├─ Control camera angle, lighting, background                    │  │
│  │  └─ Create "consistency checkpoints" for multi-frame generation   │  │
│  │                                                                     │  │
│  │  Step 4: IMAGE GENERATION (KIE.AI Nano Banana Multimodal)         │  │
│  │  ├─ Input: reference images + generated prompts                   │  │
│  │  ├─ Output: realistic composite images (model + product)          │  │
│  │  └─ Multiple scenes maintaining consistency                       │  │
│  │                                                                     │  │
│  │  Step 5: QUALITY ASSURANCE                                         │  │
│  │  ├─ Analyze output vs consistency checkpoints                     │  │
│  │  ├─ Detect issues (face change, product distortion, style shift)  │  │
│  │  └─ Provide feedback & regeneration recommendations               │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                    ↓                                                       │
│  User Review & Choice                                                     │
│  ├─ Option A: Accept & Generate Video (Image-to-Video on KIE.AI)        │  │
│  ├─ Option B: Regenerate Images (adjust prompts, iterate)                │  │
│  └─ Option C: Manual Edit & Refinement                                   │  │
│                    ↓                                                       │
│  OUTPUT: Consistent, Professional UGC Content                             │
│  ├─ Raw Images (4K, multiple angles)                                     │
│  ├─ Video Clips (via Image-to-Video)                                     │  │
│  └─ Metadata (scripts, prompts, version history)                         │  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Problem: "Control & Consistency"

### Challenges AI Generative Solves

| Problem | Zwapp Solution | Tech |
|---------|----------------|------|
| **Halusinasi Produk** | Produk dari user upload dijadikan reference image, Nano Banana tahu exactly apa yang render | Multimodal Image Generation |
| **Inkonsistensi Wajah** | Generated "consistency checkpoints" untuk setiap scene, AI tau pose/expression mana yg match | Vision Analysis + Prompt Engineering |
| **Gaya Visual Tidak Konsisten** | Central "Visual Style Guide" generated sekali, applied ke semua scenes | Prompt Standardization |
| **Background Continuity** | Explicit background specification dalam prompt, QA layer detect mismatch | Semantic Analysis |
| **Product Placement Accuracy** | Nano Banana punya reference foto produk yg real, bukan imagined | Reference-Based Generation |
| **Lighting & Camera Consistency** | Exact camera specs (35mm, f/2.8, 5600K lighting) baked ke prompt | Structured Prompt Engineering |

---

## 3. System Architecture

### 3.1 Component Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Input   │  │  Script  │  │  Prompt  │  │  Gallery │        │
│  │  Module  │  │ Review   │  │ Editor   │  │ Viewer   │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│              ORCHESTRATION & STATE MANAGEMENT                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Workflow Engine (State Machine)                  │  │
│  │  IDLE → ANALYZING → SCRIPTING → PROMPTING →             │  │
│  │  GENERATING → REVIEWING → (GENERATE_VIDEO | REGENERATE) │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Project Context Manager                          │  │
│  │  ├─ Model Profile (pose preferences, style)             │  │
│  │  ├─ Product Profile (colors, dimensions, highlights)    │  │
│  │  ├─ Narrative Context (brand voice, target audience)    │  │
│  │  └─ Generated Assets (scripts, prompts, images)         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Quality Assurance Engine                         │  │
│  │  ├─ Vision Analysis (consistency checks)                │  │
│  │  ├─ Prompt Validation (completeness)                    │  │
│  │  └─ Output Comparison (before/after prompts)            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│            AI SERVICES LAYER (Orchestration)                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Content     │  │  Prompt      │  │  Image Gen   │          │
│  │  Analyzer    │  │  Engineer    │  │  Orchestrator│          │
│  │  (Vision API)│  │ (OpenAI Chat)│  │ (KIE.AI)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│         EXTERNAL AI SERVICES (Cost-Optimized)                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ OpenAI       │  │ Google       │  │ KIE.AI       │          │
│  │ GPT-4 (FREE) │  │ Vision API   │  │ Services:    │          │
│  │ for scripting│  │ (optional)   │  │ • Nano Banana│          │
│  │ & prompting  │  │ for analysis │  │ • Veo 3.1    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│              STORAGE & RETRIEVAL LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Supabase     │  │ Asset Cloud  │  │ Vector DB    │          │
│  │ (Projects,   │  │ (Images,     │  │ (Embeddings  │          │
│  │ Metadata)    │  │ Videos)      │  │ for search)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Model & Schema

### 4.1 Project Structure

```typescript
// SUPABASE SCHEMA

interface UGCProject {
  id: string;
  userId: string;
  name: string;
  
  // Input Assets
  modelPhotos: UploadedAsset[]; // Reference: model appearance
  productPhotos: UploadedAsset[]; // Reference: product appearance
  narrativeLinks: string[]; // URLs to TikTok, Instagram, brand brief
  moodBoard?: string[]; // Optional: style references
  
  // Generated Context
  modelProfile: {
    appearance: string; // Height, skin tone, style
    poses: string[]; // Preferred poses
    expressions: string[]; // Typical expressions
    outfitStyle: string; // Fashion preferences
  };
  
  productProfile: {
    name: string;
    colors: string[];
    dimensions: string;
    keyFeatures: string[];
    highlightAngles: string[];
  };
  
  narrativeContext: {
    brandVoice: string; // Professional, casual, luxury, etc
    targetAudience: string; // Demographics, interests
    campaignGoal: string; // Awareness, conversion, engagement
    keyMessages: string[];
    competitorAnalysis?: string;
  };
  
  // Generated Assets
  generatedScript: {
    hook: string;
    problemStatement: string;
    solution: string;
    cta: string;
    fullNarrative: string;
    sceneBreakdown: SceneBreakdown[];
  };
  
  visualStyleGuide: {
    cameraSpecs: string; // "35mm lens, f/2.8, 5600K"
    lighting: string; // Natural, studio, golden hour
    backgroundStyle: string; // Urban, minimal, lifestyle
    colorPalette: string[];
    compositions: string[];
  };
  
  // Generated Images & Videos
  generatedAssets: {
    images: GeneratedImage[];
    videos: GeneratedVideo[];
  };
  
  // Metadata
  status: ProjectStatus; // IDLE, SCRIPTING, GENERATING, COMPLETED
  createdAt: timestamp;
  updatedAt: timestamp;
  versionHistory: ProjectVersion[];
}

interface SceneBreakdown {
  sceneNumber: number;
  description: string;
  modelAction: string; // "Holds product, smiles at camera"
  modelExpression: string; // "Happy, engaged"
  productPlacement: string; // "Hand-held at eye level"
  backgroundDescription: string;
  cameraAngle: string; // "Close-up, 45 degrees"
  narrativePoint: string; // Which part of script
}

interface PromptTemplate {
  sceneId: string;
  basePrompt: string; // Static part
  dynamicVariables: Record<string, string>; // Variables from context
  consistencyCheckpoints: {
    modelFaceConsistency: string;
    productAccuracy: string;
    backgroundContinuity: string;
    styleMaintenance: string;
  };
  generatedPrompt: string; // Final rendered prompt
}

interface GeneratedImage {
  id: string;
  sceneId: string;
  prompt: string;
  imageUrl: string; // Supabase URL
  nanobananaTaskId: string; // KIE.AI task ID for traceability
  qualityScore: number; // 0-100, from QA analysis
  issues?: string[]; // Issues detected by QA
  createdAt: timestamp;
}

interface GeneratedVideo {
  id: string;
  imageId: string; // From which generated image
  videoUrl: string; // Supabase URL
  veoTaskId: string; // KIE.AI Veo task ID
  duration: number; // seconds
  createdAt: timestamp;
}
```

---

## 5. Workflow Execution Flow

### 5.1 State Machine

```
START (User uploads inputs)
  ↓
[ANALYZING PHASE] - Run in parallel
  ├─ Analyze Model Photos (extract pose, expression, style)
  ├─ Analyze Product Photos (extract colors, shapes, highlights)
  ├─ Fetch & Parse Narrative Links (extract context, brand voice, audience)
  └─ Build Model, Product, Narrative profiles
  ↓
[SCRIPTING PHASE]
  ├─ Call: OpenAI Chat
  │   Input: {modelProfile, productProfile, narrativeContext}
  │   Output: {hook, problem, solution, cta, sceneBreakdown}
  └─ User Reviews Script (iterate if needed)
  ↓
[VISUAL STYLE DEFINITION]
  ├─ Generate Visual Style Guide (from inputs + script context)
  │   {cameraSpecs, lighting, background, colorPalette}
  └─ Display for user approval
  ↓
[PROMPT ENGINEERING PHASE]
  ├─ For each scene in breakdown:
  │   ├─ Create base prompt (from script + style guide)
  │   ├─ Add consistency checkpoints
  │   ├─ Render final prompt with dynamic variables
  │   └─ Display in Prompt Editor for user modification
  ├─ User can iterate on prompts
  └─ Lock prompts for generation
  ↓
[IMAGE GENERATION PHASE] - KIE.AI Nano Banana
  ├─ For each scene:
  │   ├─ Call: Nano Banana with {modelPhoto, productPhoto, prompt}
  │   ├─ Receive: Generated image (realistic composite)
  │   └─ Store: Image + metadata + KIE.AI taskId
  ├─ Monitor progress (show gallery as images arrive)
  └─ All scenes generated
  ↓
[QUALITY ASSURANCE]
  ├─ For each generated image:
  │   ├─ Analyze consistency (face, product, style, lighting)
  │   ├─ Compare with checkpoints
  │   └─ Generate feedback report
  ├─ Display QA results to user
  └─ Allow regeneration if needed
  ↓
[USER DECISION]
  ├─ Option A: Approve & Generate Video
  │   └─ → [VIDEO GENERATION PHASE]
  ├─ Option B: Regenerate Images
  │   └─ → [EDIT PROMPTS] → [IMAGE GENERATION PHASE]
  └─ Option C: Manual Refinement
      └─ → [MANUAL EDIT MODE]
  ↓
[VIDEO GENERATION PHASE] - KIE.AI Veo 3.1
  ├─ For each scene image:
  │   ├─ Add script audio (optional)
  │   ├─ Call: Image-to-Video on KIE.AI Veo 3.1
  │   ├─ Receive: Video clip
  │   └─ Store: Video + metadata
  ├─ Optionally: Compose clips into full campaign video
  └─ Delivery: Video + source images + scripts
  ↓
END (Assets ready for download/export)
```

---

## 6. Key Features & Implementation

### 6.1 Script Generation (OpenAI - FREE)

```typescript
async function generateAdvertScript(context: {
  modelProfile: ModelProfile;
  productProfile: ProductProfile;
  narrativeContext: NarrativeContext;
}): Promise<GeneratedScript> {
  
  const systemPrompt = `
You are an expert advertising copywriter who creates compelling UGC (User Generated Content) scripts.
Your output must follow the HOOK-PROBLEM-SOLUTION-CTA framework.
Be specific about model actions, expressions, and product interactions.
Make it authentic, relatable, and conversion-focused.
Output format: JSON with {hook, problem, solution, cta, sceneBreakdown[]}
  `;
  
  const userPrompt = `
Create an advertisement script for:
- Product: ${context.productProfile.name} (Colors: ${context.productProfile.colors.join(', ')})
- Model: ${context.modelProfile.appearance}
- Brand Voice: ${context.narrativeContext.brandVoice}
- Target: ${context.narrativeContext.targetAudience}
- Goal: ${context.narrativeContext.campaignGoal}
- Key Message: ${context.narrativeContext.keyMessages.join('; ')}

Generate 4-5 scenes with specific model actions and product placements.
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo", // Free tier available
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" }
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

### 6.2 Prompt Engineering (Consistency Control)

```typescript
interface ConsistencyCheckpoint {
  aspect: "model_face" | "product_accuracy" | "background" | "style" | "lighting";
  baseline: string; // From scene 1
  requirement: string; // How to maintain consistency
}

async function generateScenePrompt(
  scene: SceneBreakdown,
  context: {
    modelPhotos: string[]; // URLs of reference images
    productPhotos: string[];
    visualStyleGuide: VisualStyleGuide;
    previousScene?: GeneratedImage; // For continuity
  }
): Promise<PromptTemplate> {
  
  const consistencyCheckpoints: ConsistencyCheckpoint[] = [
    {
      aspect: "model_face",
      baseline: "Same model appearance, consistent facial expression (engaged, natural)",
      requirement: "MUST maintain same eye color, skin tone, hairstyle. Expression transitions smoothly from previous scene."
    },
    {
      aspect: "product_accuracy",
      baseline: `Product ${context.productPhotos.length} images provided - MUST match exactly`,
      requirement: "Product colors, logos, dimensions must match reference images. No hallucination or distortion."
    },
    {
      aspect: "background",
      baseline: context.visualStyleGuide.backgroundStyle,
      requirement: "Consistent background environment. If urban, same location feel. Lighting and shadows match."
    },
    {
      aspect: "style",
      baseline: context.visualStyleGuide.compositions.join(", "),
      requirement: "Camera angle, depth of field, composition style must be consistent across scenes."
    },
    {
      aspect: "lighting",
      baseline: context.visualStyleGuide.lighting,
      requirement: `Lighting setup: ${context.visualStyleGuide.cameraSpecs}. Color temperature, shadows, highlights consistent.`
    }
  ];
  
  const basePrompt = `
[REFERENCE IMAGES PROVIDED]
- Model reference: ${context.modelPhotos.length} images
- Product reference: ${context.productPhotos.length} images

[SCENE DESCRIPTION]
Scene ${scene.sceneNumber}: ${scene.description}
- Model Action: ${scene.modelAction}
- Model Expression: ${scene.modelExpression}
- Product Placement: ${scene.productPlacement}
- Camera: ${scene.cameraAngle}
- Background: ${scene.backgroundDescription}

[VISUAL STYLE]
- Camera Specs: ${context.visualStyleGuide.cameraSpecs}
- Lighting: ${context.visualStyleGuide.lighting}
- Colors: ${context.visualStyleGuide.colorPalette.join(", ")}
- Composition: ${context.visualStyleGuide.compositions.join(", ")}

[CONSISTENCY REQUIREMENTS]
${consistencyCheckpoints.map((cp, i) => 
  `${i + 1}. ${cp.aspect.toUpperCase()}: ${cp.requirement}`
).join('\n')}

[OUTPUT REQUIREMENTS]
- Photorealistic image combining model + product
- NO photoshop tanda-tanda (natural integration)
- 4K quality
- Professional commercial standard
  `;
  
  return {
    sceneId: scene.sceneNumber.toString(),
    basePrompt,
    consistencyCheckpoints,
    generatedPrompt: basePrompt
  };
}
```

### 6.3 Image Generation Orchestration (KIE.AI Nano Banana)

```typescript
async function generateSceneImages(
  scenes: SceneBreakdown[],
  context: {
    modelPhotos: UploadedAsset[];
    productPhotos: UploadedAsset[];
    prompts: PromptTemplate[];
  }
): Promise<GeneratedImage[]> {
  
  const generatedImages: GeneratedImage[] = [];
  
  for (const [index, scene] of scenes.entries()) {
    const prompt = context.prompts[index];
    
    try {
      // Call KIE.AI Nano Banana Multimodal
      // Input: model image + product image + engineered prompt
      const response = await kieAI.nanobanana.generateImage({
        model: "google/nano-banana",
        input: {
          prompt: prompt.generatedPrompt,
          image_urls: [
            context.modelPhotos[0].supabaseUrl, // Primary model image
            context.productPhotos[0].supabaseUrl // Primary product reference
          ],
          output_format: "png",
          image_size: "landscape_16_9", // Or user preference
        }
      });
      
      if (response.code === 200) {
        const imageUrl = response.data.resultJson.resultUrls[0];
        
        // Store generated image with all metadata
        const generatedImage: GeneratedImage = {
          id: crypto.randomUUID(),
          sceneId: scene.sceneNumber.toString(),
          prompt: prompt.generatedPrompt,
          imageUrl,
          nanobananaTaskId: response.data.taskId,
          qualityScore: 0, // To be filled by QA
          createdAt: Date.now()
        };
        
        generatedImages.push(generatedImage);
        
        // Emit progress event to UI
        emitProgress({
          type: "IMAGE_GENERATED",
          sceneNumber: index + 1,
          totalScenes: scenes.length,
          imageUrl
        });
      }
    } catch (error) {
      console.error(`Failed to generate scene ${scene.sceneNumber}:`, error);
      // Could trigger fallback or manual regeneration
    }
  }
  
  return generatedImages;
}
```

### 6.4 Quality Assurance Engine

```typescript
async function runQualityAssurance(
  image: GeneratedImage,
  checkpoints: ConsistencyCheckpoint[]
): Promise<{
  qualityScore: number;
  issues: string[];
  recommendations: string[];
}> {
  
  const issues: string[] = [];
  const recommendations: string[] = [];
  let qualityScore = 100;
  
  // 1. Model Face Consistency Check
  // (Using Vision API or Claude to analyze)
  const modelFaceAnalysis = await analyzeModelConsistency(image.imageUrl);
  if (!modelFaceAnalysis.consistent) {
    issues.push("Model face appearance changed");
    recommendations.push("Regenerate with stricter face consistency prompt");
    qualityScore -= 20;
  }
  
  // 2. Product Accuracy Check
  const productAnalysis = await analyzeProductAccuracy(image.imageUrl);
  if (!productAnalysis.accurate) {
    issues.push("Product details inaccurate or hallucinated");
    recommendations.push("Regenerate or adjust product reference image");
    qualityScore -= 25;
  }
  
  // 3. Lighting Consistency Check
  const lightingAnalysis = await analyzeLighting(image.imageUrl);
  if (!lightingAnalysis.consistent) {
    issues.push("Lighting differs from style guide");
    recommendations.push("Adjust lighting specifications in prompt");
    qualityScore -= 10;
  }
  
  // 4. Overall Photorealism Check
  const realismScore = await analyzePhotorealism(image.imageUrl);
  if (realismScore < 80) {
    issues.push("Image appears too AI-generated or artificial");
    recommendations.push("Refine prompt to emphasize photorealism");
    qualityScore = Math.min(qualityScore, realismScore);
  }
  
  return {
    qualityScore: Math.max(0, qualityScore),
    issues,
    recommendations
  };
}
```

### 6.5 Video Generation (KIE.AI Veo 3.1)

```typescript
async function generateVideoFromImages(
  images: GeneratedImage[],
  script: GeneratedScript
): Promise<GeneratedVideo[]> {
  
  const videos: GeneratedVideo[] = [];
  
  for (const [index, image] of images.entries()) {
    try {
      // Optional: Add audio from script narrative
      const audioNarrative = script.sceneBreakdown[index]?.narrativePoint || "";
      
      // Call KIE.AI Veo 3.1 Image-to-Video
      const response = await kieAI.veo.generateVideo({
        model: "veo3", // or "veo3_fast"
        input: {
          imageUrls: [image.imageUrl],
          prompt: `${audioNarrative}. Smooth, natural motion following the product and model interaction.`,
          generationType: "FIRST_AND_LAST_FRAMES_2_VIDEO",
          aspect_ratio: "16:9",
          // Optional: callBackUrl for async completion
          callBackUrl: `${APP_URL}/api/webhooks/veo-completion`
        }
      });
      
      if (response.code === 200) {
        const video: GeneratedVideo = {
          id: crypto.randomUUID(),
          imageId: image.id,
          videoUrl: response.data.resultJson.resultUrls[0],
          veoTaskId: response.data.taskId,
          duration: 0, // Can be fetched from video metadata
          createdAt: Date.now()
        };
        
        videos.push(video);
        
        // Emit progress to UI
        emitProgress({
          type: "VIDEO_GENERATED",
          sceneNumber: index + 1,
          videoUrl: video.videoUrl
        });
      }
    } catch (error) {
      console.error(`Failed to generate video for image ${image.id}:`, error);
    }
  }
  
  return videos;
}
```

---

## 7. UI/UX Component Structure

### 7.1 Main Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│                     UGC AI ORCHESTRATION WORKSPACE                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  LEFT PANEL (35%)                  CENTER PANEL (40%)  RIGHT PANEL  │
│  ┌─────────────────────────┐      ┌──────────────────┐ (25%)       │
│  │ INPUT SECTION           │      │ PREVIEW/EDITOR   │ ┌────────┐  │
│  ├─────────────────────────┤      ├──────────────────┤ │ ASSETS │  │
│  │ [Upload Model Photo]    │      │ Current Stage    │ │ PANEL  │  │
│  │ ┌───────────────────┐   │      │ Display          │ ├────────┤  │
│  │ │ Model image 1     │   │      │                  │ │Images  │  │
│  │ │ (drag to reorder) │   │      │ Real-time render │ │Grid    │  │
│  │ └───────────────────┘   │      │                  │ │        │  │
│  │                         │      │ (Script/Prompt/  │ │Videos  │  │
│  │ [Upload Product Photo]  │      │  Image preview)  │ │        │  │
│  │ ┌───────────────────┐   │      │                  │ └────────┘  │
│  │ │ Product image 1   │   │      └──────────────────┘           │
│  │ │ Product image 2   │   │                                      │
│  │ └───────────────────┘   │      BOTTOM ACTIONS:                 │
│  │                         │      ┌──────────────────────────────┐ │
│  │ [Paste Narrative Link]  │      │ [◀ Back] [Next ▶]            │ │
│  │ ┌───────────────────┐   │      │ [Regenerate] [Edit] [Export] │ │
│  │ │ https://tiktok... │   │      └──────────────────────────────┘ │
│  │ └───────────────────┘   │                                      │
│  │                         │      PROGRESS INDICATOR:             │
│  │ [Optional: Mood Board]  │      [ANALYZING] → [SCRIPTING] →    │
│  │ [Optional: Scene Notes] │      [PROMPTING] → [GENERATING] →   │
│  │                         │      [QA] → [VIDEO] → [COMPLETE]   │
│  │                         │                                      │
│  │ STATUS:                 │                                      │
│  │ ⏳ Analyzing inputs...  │                                      │
│  │                         │                                      │
│  │ [Start Generation]      │                                      │
│  │ [Load Previous Project] │                                      │
│  └─────────────────────────┘                                      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 7.2 Stage-Specific Views

#### Stage 1: Input Module
```
Drag-drop or click to upload model photos
Show thumbnails with delete/reorder buttons
Input field for narrative links (with link preview)
Optional: Mood board upload
Validation before proceeding
```

#### Stage 2: Script Review
```
Display generated script with H-P-S-CTA breakdown
Show scene breakdown with model actions
Edit button to refine (triggers OpenAI regeneration)
Approve/iterate buttons
Save script to project
```

#### Stage 3: Prompt Engineering
```
Show visual style guide summary
Display prompt for each scene
Edit field to modify prompt
Live word count (warn if too long)
Consistency checkpoint checklist
Preview: "How this prompt will work"
Lock/unlock prompts before generation
```

#### Stage 4: Image Gallery
```
Grid view of generated images
Show as they arrive (real-time updates via WebSocket)
Quality score badge on each image
Issues/recommendations popover
Regenerate button per image
Next/Previous for detailed view
Full-screen mode
```

#### Stage 5: QA & Approval
```
Show consistency analysis report
Flag images with issues
Recommendations displayed
Option to regenerate with feedback
Before/After comparison (if regenerated)
Approve all for video generation
Or go back to edit prompts
```

#### Stage 6: Video Generation
```
Show progress for each video
Video preview as they complete
Compose clip option (create montage)
Download individual or batch
Project summary with all assets
Export options (zip, share link, etc)
```

---

## 8. Cost Optimization Strategy

### 8.1 Cost Breakdown

| Service | Cost | Usage | Strategy |
|---------|------|-------|----------|
| **OpenAI Chat (Script)** | $0 (Free tier) / $20/month | 1 per project | Use free tier, excellent for scripts |
| **Vision Analysis** | Free (GCP) / Included | Optional enhancement | Use GCP free quota for QA |
| **KIE.AI Nano Banana** | ~$0.08 per image | 4-5 images per project | Bulk discount available |
| **KIE.AI Veo 3.1** | ~$0.12-0.24 per video | Optional (user choice) | 25% cheaper than Google |
| **Supabase Storage** | Free tier: 1GB | Project files + outputs | Sufficient for SMBs |
| **Supabase Vectors** | Free tier | Optional similarity search | Not critical for MVP |

**Total Cost per Project:** ~$0.50-$1.50 (depending on video generation)

### 8.2 Cost-Saving Tactics

1. **Lazy Video Generation:** Only generate video if user clicks "Generate Video" button
2. **Batch Processing:** Queue multiple projects, generate during off-peak hours
3. **Prompt Caching:** Store common prompt structures, reuse templates
4. **Image Variants:** Generate 1 best image first, user can request variants
5. **Free Tier Prioritization:** OpenAI free + GCP free vision API

---

## 9. Tech Stack Recommendation

### Frontend
```
Framework: React 18+ (or Vue 3)
State Management: Zustand (lightweight orchestration)
UI Components: Tailwind CSS + shadcn/ui
Real-time Updates: WebSocket (Socket.io) or Server-Sent Events
Image Preview: React Image Gallery / Lightbox
Forms: React Hook Form + Zod validation
```

### Backend
```
Runtime: Node.js + Express (or Python FastAPI)
Async Jobs: Bull Queue (Redis) or Celery
Orchestration: Temporal (for complex workflows)
Database: Supabase (PostgreSQL)
Storage: Supabase Storage (S3-compatible)
API Integration:
  - OpenAI SDK
  - KIE.AI custom client (Nano Banana + Veo)
  - GCP Vision API (optional)
```

### Infrastructure
```
Hosting: Vercel / Railway / Render
Database: Supabase Postgres
Object Storage: Supabase Storage / AWS S3
Queues: Redis (ElastiCache or upstash)
Monitoring: Sentry + DataDog
```

---

## 10. Implementation Roadmap

### MVP (4-6 weeks)
- [x] Input module (upload photos + link paste)
- [x] Script generation (OpenAI Chat)
- [x] Basic prompt engineering (templates)
- [x] Image generation (KIE.AI Nano Banana)
- [x] Basic gallery view
- [ ] Manual export only

### Phase 2 (4-6 weeks)
- [ ] QA engine (consistency checks)
- [ ] Video generation (KIE.AI Veo)
- [ ] Advanced prompt editor
- [ ] Project saving & history
- [ ] Regeneration workflow

### Phase 3 (6-8 weeks)
- [ ] Webhook callbacks for async completion
- [ ] Batch processing
- [ ] Team collaboration features
- [ ] Usage analytics & reporting
- [ ] API for third-party integrations

### Phase 4 (Ongoing)
- [ ] Fine-tuned models (for brand-specific style)
- [ ] Motion tracking (consistency across video frames)
- [ ] Multi-language support
- [ ] Mobile app

---

## 11. Key Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| **Face inconsistency across scenes** | Lock model face characteristics in prompt; use GCP Vision to compare frames |
| **Product hallucination** | Provide exact product reference images; validate output against reference |
| **Prompt too long/complex** | Use prompt compression; structured templates with variables |
| **Slow image generation** | Parallelize (generate all scenes concurrently, not sequentially) |
| **Expensive if iterating** | Use "regenerate specific scenes" not entire project; cache successful prompts |
| **User doesn't understand AI workflow** | Show "behind-the-scenes" explanations; tooltips on each stage |
| **Webhook reliability** | Implement exponential backoff + database job queue fallback |

---

## 12. Success Metrics

- **Time to Content:** < 5 minutes input, < 5 minutes generation, <1 minute export
- **Quality Consistency:** 85%+ of images pass automated QA checks
- **User Satisfaction:** 4.5+ stars (ease of use, output quality)
- **Cost Efficiency:** < $1 per project (for brand owner's perspective)
- **Iteration Reduction:** 50% fewer regenerations (vs manual AI prompting)

---

## 13. Unique Value Proposition

| Traditional AI Video Creator | Zwapp UGC Orchestration |
|------------------------------|------------------------|
| User writes complex prompts | System writes prompts for you |
| Manual consistency checking | Automated QA detects issues |
| Separate tools for script/image/video | All-in-one integrated workflow |
| $0.50+ per image + $0.24+ per video | ~$1 total per UGC shoot |
| Trial-and-error iteration | Smart regeneration based on analysis |
| Requires AI expertise | No AI knowledge needed |

---

## 14. Next Steps

1. **Design Data Models** → Create Supabase migrations
2. **Build Input Module** → File upload + link parsing
3. **Integrate OpenAI** → Script generation API
4. **Integrate KIE.AI** → Nano Banana image generation
5. **Build Orchestration Engine** → State machine for workflow
6. **Build Gallery & QA UI** → Image preview + QA results
7. **Test End-to-End** → Manual testing with real users
8. **Deploy MVP** → Vercel + Supabase

---

## Conclusion

Sistem ini **sangat feasible** dan addressable real problem dalam UGC creation. Key differentiator adalah:

✅ **"Control & Consistency"** melalui:
- Reference-based image generation (Nano Banana multimodal)
- Structured prompt engineering dengan consistency checkpoints
- Automated QA layer yang detect issues

✅ **Cost-effective** dengan:
- Free OpenAI tier untuk scripting
- Low-cost KIE.AI untuk image/video
- Smart caching & batch processing

✅ **Simple UX** untuk non-technical users:
- Drag-drop inputs
- 6-stage wizard
- Real-time progress & galleries

**Anda siap untuk mengimplementasikan ini?** 🚀
