# UGC AI Backend Services - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Environment Setup (2 minutes)

```bash
# Copy environment template
cp .env.example .env.local

# Add your API keys
VITE_OPENAI_API_KEY=sk-...
VITE_NANO_BANANA_API_KEY=...
VITE_VISION_API_KEY=...
VITE_VEO_API_KEY=...
```

### Step 2: Verify Configuration (1 minute)

```typescript
import { getAPIConfig, validateAPIConfig, checkAPIHealth } from './services/apiConfig';

const config = getAPIConfig();
const validation = validateAPIConfig(config);

if (!validation.valid) {
  console.error('Errors:', validation.errors);
}

const health = await checkAPIHealth(config);
console.log('Health:', health); // Check if services are online
```

### Step 3: Execute Pipeline (2 minutes)

```typescript
import { executeFullPipeline } from './services/ugcOrchestration';
import { getAPIConfig } from './services/apiConfig';

const config = getAPIConfig();
const project = { /* your UGC project */ };

const results = await executeFullPipeline(project, {
  openaiApiKey: config.openai.apiKey,
  nanoBananaApiKey: config.nanoBanana.apiKey,
  visionApiKey: config.vision.apiKey,
  veoApiKey: config.veo.apiKey,
});

console.log('Success! Cost: $', results.totalCost);
console.log('Assets:', results.generatedAssets);
```

---

## 📋 What You Get

### 4 Production-Ready Services

| Service | Purpose | Cost | Time |
|---------|---------|------|------|
| **Script** | Generate UGC scripts | $0.01 | 30s |
| **Images** | Create product images | $0.20/ea | 12s |
| **QA** | Verify quality | $0.005/ea | 0.3s |
| **Video** | Compile final video | $3.50 | 90s |

### Complete Pipeline
```
Input Assets → Scripts → Images → QA Filter → Video → Done
```

---

## 🔧 Integration Examples

### With Zustand Store

```typescript
// In your Zustand store
export const useUGCStore = create((set, get) => ({
  executeProject: async (project) => {
    const config = getAPIConfig();
    try {
      const results = await executeFullPipeline(project, {
        openaiApiKey: config.openai.apiKey,
        nanoBananaApiKey: config.nanoBanana.apiKey,
        visionApiKey: config.vision.apiKey,
        veoApiKey: config.veo.apiKey,
        enableParallelProcessing: true,
      });
      
      set({ 
        generatedAssets: results.generatedAssets,
        totalCost: results.totalCost,
      });
    } catch (error) {
      set({ error: error.message });
    }
  }
}));
```

### With React Components

```typescript
function UGCExecutor() {
  const [loading, setLoading] = useState(false);
  const executeProject = useUGCStore(state => state.executeProject);
  
  const handleExecute = async () => {
    setLoading(true);
    try {
      await executeProject(currentProject);
      showSuccess('Project completed!');
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button onClick={handleExecute} disabled={loading}>
      {loading ? 'Processing...' : 'Generate UGC'}
    </button>
  );
}
```

### Cost Estimation

```typescript
import { estimateProjectCost } from './services/ugcOrchestration';

const estimatedCost = estimateProjectCost(project);
console.log(`This project will cost: $${estimatedCost}`);
```

### Individual Service Usage

```typescript
// Just generate script
import { generateScriptWithOpenAI } from './services/scriptGeneration';
const script = await generateScriptWithOpenAI(model, product, narrative, config);

// Just generate images
import { generateImageVariations } from './services/imageGeneration';
const images = await generateImageVariations(scene, 3, config);

// Just run QA
import { analyzeImageQuality } from './services/qualityAssurance';
const qa = await analyzeImageQuality(imageUrl, config);

// Just generate video
import { generateVideoWithVeo } from './services/videoGeneration';
const video = await generateVideoWithVeo(images, config);
```

---

## ⚙️ Configuration Reference

### Required Environment Variables

```env
# API Keys (required)
VITE_OPENAI_API_KEY=sk-...
VITE_NANO_BANANA_API_KEY=...
VITE_VISION_API_KEY=...
VITE_VEO_API_KEY=...
```

### Optional Configuration

```env
# Feature flags
VITE_ENABLE_VIDEO_GENERATION=true
VITE_ENABLE_BATCH_PROCESSING=true
VITE_PARALLEL_PROCESSING=true

# Performance tuning
VITE_MAX_IMAGE_VARIATIONS=3
VITE_IMAGE_BATCH_SIZE=3
VITE_IMAGE_BATCH_DELAY_MS=1000
VITE_QA_BATCH_DELAY_MS=100

# Timeouts
VITE_API_TIMEOUT=30000
VITE_VIDEO_GENERATION_TIMEOUT=300000

# Quality
VITE_QA_THRESHOLD=0.8  # 0-1, minimum confidence

# Cost control
VITE_MAX_PROJECT_COST=50
VITE_WARN_COST_THRESHOLD=40
```

---

## 🐛 Common Issues

### Issue: "API key not configured"
```
Solution: Check .env.local exists and has VITE_OPENAI_API_KEY
```

### Issue: "Image generation timeout"
```
Solution: Increase VITE_IMAGE_BATCH_DELAY_MS to 2000 or 5000
```

### Issue: "QA failed - no images passed"
```
Solution: Lower VITE_QA_THRESHOLD to 0.6 or 0.5
```

### Issue: "Rate limit exceeded"
```
Solution: Reduce VITE_IMAGE_BATCH_SIZE to 1 or 2
```

---

## 📊 Monitoring

### Health Check

```typescript
import { checkAPIHealth } from './services/apiConfig';

const health = await checkAPIHealth(config);
if (!health.overall) {
  console.warn('Some APIs are down:', health);
}
```

### Error Tracking

```typescript
try {
  await executeFullPipeline(project, config);
} catch (error) {
  // Send to error tracking service
  Sentry.captureException(error);
  
  // Get detailed error info
  console.error('Service:', error.service);
  console.error('Stage:', error.stage);
  console.error('Message:', error.message);
}
```

---

## 📈 Performance Tips

### 1. Enable Parallel Processing
```env
VITE_PARALLEL_PROCESSING=true
```
Reduces image generation time from 108s to ~36s

### 2. Adjust Batch Size
```env
VITE_IMAGE_BATCH_SIZE=3  # Default: optimal balance
```
- Smaller = slower but more reliable
- Larger = faster but more API quota usage

### 3. Sequential Processing for Testing
```env
VITE_PARALLEL_PROCESSING=false
```
Makes debugging easier, useful for development

---

## 💰 Cost Management

### Estimate Cost
```typescript
const cost = estimateProjectCost(project);
if (cost > 50) {
  showWarning(`Project will cost $${cost}`);
}
```

### Track Spending
```typescript
const results = await executeFullPipeline(project, config);
console.log('Cost breakdown:', {
  scripts: results.results[0].data.length * 0.01,
  images: results.results[1].data.length * 0.20,
  qa: results.results[2].data.length * 0.005,
  video: results.results[3].data.length * 3.50,
});
```

---

## 🧪 Testing

### Unit Test
```typescript
import { estimateProjectCost } from './services/ugcOrchestration';

test('cost estimation', () => {
  const cost = estimateProjectCost(mockProject);
  expect(cost).toBeCloseTo(3.60, 2);
});
```

### Integration Test
```typescript
import { executeFullPipeline } from './services/ugcOrchestration';

test('full pipeline', async () => {
  const results = await executeFullPipeline(mockProject, mockConfig);
  
  expect(results.generatedAssets.scripts.length).toBeGreaterThan(0);
  expect(results.generatedAssets.images.length).toBeGreaterThan(0);
  expect(results.totalCost).toBeGreaterThan(0);
});
```

---

## 📚 Further Reading

- [Full Backend Services Guide](./BACKEND_SERVICES_GUIDE.md)
- [API Configuration Reference](./services/apiConfig.ts)
- [Orchestration Service](./services/ugcOrchestration.ts)
- [Service Implementation Details](./BACKEND_SERVICES_COMPLETE.md)

---

## 🔗 API Documentation

- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)
- [KIE.AI Nano Banana](https://www.kie.ai/api/docs)
- [Google Vision API](https://cloud.google.com/vision/docs)
- [KIE.AI Veo 3.1](https://www.kie.ai/api/docs)

---

## 💡 Next Steps

1. ✅ **Setup** - Copy `.env.example` to `.env.local` and add API keys
2. ✅ **Test** - Run `checkAPIHealth()` to verify connectivity
3. ✅ **Integrate** - Wire services into your Zustand store
4. ✅ **Execute** - Call `executeFullPipeline()` from your components
5. ✅ **Monitor** - Track costs and errors in production

---

**Status**: All services ready. Time to integrate! 🚀
