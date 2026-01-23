# UGC AI Backend Services Integration Guide

## Overview

This document provides comprehensive setup and integration instructions for all UGC AI backend services.

## Architecture

```
Frontend (React Components)
         ↓
Zustand Store (State Management)
         ↓
Orchestration Service (Pipeline Control)
         ↓
┌─────────┬──────────────┬─────────────┬──────────────┐
│ Script  │ Image        │ Quality     │ Video        │
│ Service │ Service      │ Assurance   │ Service      │
│ (OpenAI)│ (NanoBanana) │ (Vision API)│ (Veo 3.1)    │
└─────────┴──────────────┴─────────────┴──────────────┘
         ↓
    External APIs
```

## Setup Instructions

### 1. Environment Configuration

#### 1.1 Create `.env.local` file

```bash
# Copy the example file
cp .env.example .env.local

# Edit and add your API keys
nano .env.local
```

#### 1.2 Required API Keys

**OpenAI API Key**
- Get from: https://platform.openai.com/api-keys
- Required for: Script generation
- Cost: ~$0.0005-$0.03 per script (GPT-3.5-turbo/GPT-4)
- Free tier: Starts with $5 credit

**KIE.AI Nano Banana API Key**
- Get from: https://www.kie.ai/api/docs
- Required for: Image generation
- Cost: $0.20 per image
- Features: Multimodal input (model + product photos)

**Google Cloud Vision API Key**
- Get from: https://console.cloud.google.com/
- Required for: Quality assurance analysis
- Cost: ~$0.005 per image (mostly free with quota)
- Features: Text detection, object recognition, position analysis

**KIE.AI Veo 3.1 API Key**
- Get from: https://www.kie.ai/api/docs
- Required for: Video generation
- Cost: $2-5 per minute depending on resolution
- Features: Smooth transitions, various resolutions

### 2. Service Implementation

#### 2.1 Script Generation Service

**File**: `services/scriptGeneration.ts`

**Key Functions**:
- `generateScriptWithOpenAI()` - Main script generation
- `refineScriptWithOpenAI()` - Iterative script refinement
- `estimateScriptGenerationCost()` - Cost calculation

**Usage**:
```typescript
import { generateScriptWithOpenAI } from './services/scriptGeneration';

const script = await generateScriptWithOpenAI(
  modelProfile,
  productProfile,
  narrativeContext,
  { apiKey: config.openaiApiKey }
);
```

**Features**:
- 3-scene structure with dialogue
- Model/product integration
- Authentic UGC tone
- Scene durations and voiceover
- Iterative refinement capability

#### 2.2 Image Generation Service

**File**: `services/imageGeneration.ts`

**Key Functions**:
- `generateImageWithNanoBanana()` - Single image generation
- `generateImageVariations()` - Batch generation (3 at a time)
- `regenerateImage()` - Iterative regeneration
- `analyzeImageConsistency()` - Consistency checking
- `estimateImageGenerationCost()` - Cost calculation ($0.20/image)

**Usage**:
```typescript
import { generateImageVariations } from './services/imageGeneration';

const images = await generateImageVariations(
  sceneConfig,
  3, // variations
  { apiKey: config.nanoBananaApiKey }
);
```

**Features**:
- Multimodal input (model + product photos)
- Batch processing with rate limiting (1s between batches)
- Consistency metrics (model match, product placement, style, quality)
- Error handling for partial failures
- A/B testing variations

#### 2.3 Quality Assurance Service

**File**: `services/qualityAssurance.ts`

**Key Functions**:
- `analyzeImageQuality()` - Main QA entry point
- `analyzeModelConsistency()` - Face/body/expression matching
- `analyzeProductPlacement()` - Product visibility verification
- `detectHallucinations()` - Artifact and anomaly detection
- `analyzeStyleCohesion()` - Lighting and color consistency
- `runBatchQA()` - Process multiple images

**Usage**:
```typescript
import { analyzeImageQuality } from './services/qualityAssurance';

const qaReport = await analyzeImageQuality(imageUrl, {
  apiKey: config.visionApiKey
});
```

**QA Checks**:
1. **Model Consistency** (0-100 score)
   - Face recognition match
   - Body proportion consistency
   - Expression and pose accuracy

2. **Product Placement** (0-100 score)
   - Product visibility
   - Correct positioning
   - Feature visibility

3. **Hallucination Detection**
   - Extra fingers/limbs
   - Anatomical errors
   - Duplicated objects
   - Glitch artifacts

4. **Style Cohesion** (0-100 score)
   - Lighting consistency
   - Color palette matching
   - Professional quality

#### 2.4 Video Generation Service

**File**: `services/videoGeneration.ts`

**Key Functions**:
- `generateVideoWithVeo()` - Main video generation
- `generateVideoWithEffects()` - Add transitions/effects
- `generateShortFormVideo()` - Social media optimization
- `estimateVideoGenerationCost()` - Cost calculation ($2-5/min)
- `getVideoStatus()` - Check generation status
- `mergeVideos()` - Combine multiple videos

**Usage**:
```typescript
import { generateVideoWithVeo } from './services/videoGeneration';

const video = await generateVideoWithVeo(images, {
  apiKey: config.veoApiKey,
  resolution: '1080p',
  frameRate: 30,
  duration: 30
});
```

**Features**:
- Smooth image-to-video transitions
- Multiple resolution options (720p, 1080p, 1440p)
- Various frame rates (24, 30, 60 fps)
- Short-form optimization (TikTok, Instagram, YouTube)
- Async job processing with polling

### 3. Orchestration Service

**File**: `services/ugcOrchestration.ts`

**Main Functions**:
- `executeFullPipeline()` - Complete workflow orchestration
- `executeSingleStage()` - Test individual stages
- `estimateProjectCost()` - Total cost estimation
- `estimateProjectDuration()` - Timeline estimation

**Workflow Stages**:

1. **Script Generation**
   - Input: Model/Product profiles, Narratives
   - Output: 3-scene scripts
   - Time: ~30 seconds per script
   - Cost: $0.01 per script

2. **Image Generation**
   - Input: Scripts (scenes)
   - Output: 3 variations per scene
   - Time: ~12 seconds per image
   - Cost: $0.20 per image
   - Parallel: Yes (batch size 3)

3. **Quality Assurance**
   - Input: Generated images
   - Output: QA reports with pass/fail status
   - Time: ~0.3 seconds per image
   - Cost: ~$0.005 per image (mostly free)
   - Filtering: Only passed images continue

4. **Video Generation**
   - Input: Passed images (sorted by scene)
   - Output: Final video file
   - Time: 1-2 minutes per minute of video
   - Cost: $3.50-5.00 per video

**Example Usage**:
```typescript
import { executeFullPipeline } from './services/ugcOrchestration';

const results = await executeFullPipeline(project, {
  openaiApiKey: config.openaiApiKey,
  nanoBananaApiKey: config.nanoBananaApiKey,
  visionApiKey: config.visionApiKey,
  veoApiKey: config.veoApiKey,
  enableParallelProcessing: true,
  maxImageVariations: 3,
});

console.log('Total cost:', results.totalCost);
console.log('Total duration:', results.totalDuration);
console.log('Generated assets:', results.generatedAssets);
```

### 4. API Configuration Management

**File**: `services/apiConfig.ts`

**Key Functions**:
- `loadAPIConfig()` - Load from environment variables
- `validateAPIConfig()` - Validate configuration
- `checkAPIHealth()` - Verify all API connections
- `getAPIConfig()` - Get singleton instance
- `getSafeAPIConfig()` - Get config without API keys

**Validation Example**:
```typescript
import { getAPIConfig, validateAPIConfig, checkAPIHealth } from './services/apiConfig';

const config = getAPIConfig();
const validation = validateAPIConfig(config);

if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
}

const health = await checkAPIHealth(config);
console.log('API Health:', health);
```

## Cost Estimation

### Per-Project Cost Breakdown

For a typical 1-minute UGC video:
- **Script Generation**: $0.01 (1 script × $0.01)
- **Image Generation**: $1.80 (9 images × $0.20)
- **QA Analysis**: $0.04 (9 images × $0.005)
- **Video Generation**: $1.75 (1 min × $3.50/min)

**Total**: ~$3.60 per video

### Cost Limits

Add to `.env.local`:
```
VITE_MAX_PROJECT_COST=50
VITE_WARN_COST_THRESHOLD=40
```

## Error Handling

### Common Errors and Solutions

**API Key Missing**
```
Error: OpenAI API key not configured
Solution: Check .env.local has VITE_OPENAI_API_KEY
```

**Rate Limiting**
```
Error: Too many requests
Solution: Implement exponential backoff (automatic in batch functions)
```

**Timeout**
```
Error: Video generation timeout
Solution: Increase VITE_VIDEO_GENERATION_TIMEOUT to 300000ms
```

**Image QA Failure**
```
Error: No images passed QA
Solution: Lower VITE_QA_THRESHOLD or manually select images
```

## Integration with Zustand Store

### State Updates

```typescript
// In ugcStore actions
export const executeProject = async (project: UGCProject) => {
  const state = get();
  const config = getAPIConfig();
  
  try {
    // Update UI state
    state.updateProjectStage('GENERATING');
    
    // Execute pipeline
    const results = await executeFullPipeline(project, {
      openaiApiKey: config.openai.apiKey,
      nanoBananaApiKey: config.nanoBanana.apiKey,
      visionApiKey: config.vision.apiKey,
      veoApiKey: config.veo.apiKey,
      enableParallelProcessing: true,
    });
    
    // Update with results
    state.setGeneratedAssets(results.generatedAssets);
    state.setProjectCost(results.totalCost);
    state.updateProjectStage('COMPLETE');
    
  } catch (error) {
    state.setError(error.message);
    state.updateProjectStage('FAILED');
  }
};
```

## Testing

### Unit Test Example

```typescript
import { estimateProjectCost } from './services/ugcOrchestration';

test('estimateProjectCost', () => {
  const project = {
    narratives: [{/* ... */}]
  };
  
  const cost = estimateProjectCost(project);
  expect(cost).toBeCloseTo(3.60, 2);
});
```

### Integration Test Example

```typescript
import { executeFullPipeline } from './services/ugcOrchestration';
import { getAPIConfig } from './services/apiConfig';

test('executeFullPipeline', async () => {
  const config = getAPIConfig();
  const project = createTestProject();
  
  const results = await executeFullPipeline(project, {
    openaiApiKey: config.openai.apiKey,
    // ... other keys
  });
  
  expect(results.generatedAssets.scripts).toBeDefined();
  expect(results.generatedAssets.images.length).toBeGreaterThan(0);
  expect(results.totalCost).toBeGreaterThan(0);
});
```

## Production Checklist

- [ ] All API keys configured in `.env.local`
- [ ] API health check passes (`checkAPIHealth()`)
- [ ] Environment validation passes
- [ ] Rate limits configured appropriately
- [ ] Error handling implemented in UI
- [ ] Cost warnings configured
- [ ] Logging/monitoring setup
- [ ] Backup API key rotation strategy
- [ ] QA threshold tuned for your use case
- [ ] Test with at least 3 projects end-to-end

## Troubleshooting

### Service Timeouts

**Issue**: Video generation times out
**Solution**: 
- Increase `VITE_VIDEO_GENERATION_TIMEOUT`
- Check Veo API status at https://www.kie.ai/status
- Consider smaller image batches

### Inconsistent QA Results

**Issue**: Same image passes QA one time, fails another
**Solution**:
- Lower `VITE_QA_THRESHOLD` value
- Check lighting consistency in reference images
- Verify Vision API quotas not exceeded

### API Rate Limiting

**Issue**: "Too many requests" errors
**Solution**:
- Increase `VITE_IMAGE_BATCH_DELAY_MS`
- Reduce `VITE_IMAGE_BATCH_SIZE`
- Enable request queuing in service layer

### Memory Issues with Large Batches

**Issue**: Browser crashes with many images
**Solution**:
- Reduce `VITE_MAX_IMAGE_VARIATIONS`
- Use sequential processing: `VITE_PARALLEL_PROCESSING=false`
- Process images in smaller chunks

## Advanced Configuration

### Custom Rate Limiting

```typescript
// In apiConfig.ts
rateLimit: {
  imageBatchSize: 1, // Process one at a time
  imageBatchDelayMs: 5000, // 5 second delay
  qaBatchDelayMs: 500, // 0.5 second delay
  apiTimeoutMs: 60000, // 60 second timeout
}
```

### Feature Flags

```typescript
// Disable expensive features
VITE_ENABLE_VIDEO_GENERATION=false
VITE_PARALLEL_PROCESSING=false
VITE_MAX_IMAGE_VARIATIONS=1
```

## API References

- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)
- [KIE.AI Nano Banana Docs](https://www.kie.ai/api/docs)
- [Google Vision API Docs](https://cloud.google.com/vision/docs)
- [KIE.AI Veo 3.1 Docs](https://www.kie.ai/api/docs)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API service status pages
3. Check console logs for specific error messages
4. Verify API key permissions and quotas
5. Run `checkAPIHealth()` to diagnose issues
