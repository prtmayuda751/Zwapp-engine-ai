// services/ugcOrchestration.ts
// Main orchestration service menghubungkan semua AI services

import { UGCProject, GeneratedAssets } from '../types/ugc';
import { generateScriptWithOpenAI } from './scriptGeneration';
import { generateImageVariations } from './imageGeneration';
import { analyzeImageQuality } from './qualityAssurance';
import { generateVideoWithVeo } from './videoGeneration';

export interface OrchestrationConfig {
  openaiApiKey: string;
  nanoBananaApiKey: string;
  visionApiKey: string;
  veoApiKey: string;
  enableParallelProcessing?: boolean;
  maxImageVariations?: number;
  qaThreshold?: number; // 0-1, minimum confidence score to pass
}

export interface StageResult {
  stage: string;
  status: 'success' | 'failed' | 'partial';
  duration: number; // milliseconds
  data: any;
  error?: string;
  warnings?: string[];
}

/**
 * Execute complete UGC project pipeline
 * Orchestrates all stages from input to final video
 */
export async function executeFullPipeline(
  project: UGCProject,
  config: OrchestrationConfig
): Promise<{
  results: StageResult[];
  generatedAssets: GeneratedAssets;
  totalCost: number;
  totalDuration: number;
}> {
  const startTime = Date.now();
  const results: StageResult[] = [];
  const generatedAssets: GeneratedAssets = {
    scripts: [],
    images: [],
    videos: [],
    qaReports: [],
  };

  try {
    // Stage 1: Script Generation
    const scriptResult = await executeScriptGeneration(project, config);
    results.push(scriptResult);

    if (scriptResult.status === 'failed') {
      throw new Error(scriptResult.error || 'Script generation failed');
    }

    generatedAssets.scripts.push(...scriptResult.data);

    // Stage 2: Image Generation (Parallel variations)
    const imageResult = await executeImageGeneration(
      project,
      generatedAssets.scripts,
      config
    );
    results.push(imageResult);

    if (imageResult.status === 'failed') {
      throw new Error(imageResult.error || 'Image generation failed');
    }

    generatedAssets.images.push(...imageResult.data);

    // Stage 3: Quality Assurance (Batch QA)
    const qaResult = await executeQualityAssurance(
      generatedAssets.images,
      config
    );
    results.push(qaResult);

    generatedAssets.qaReports.push(...qaResult.data);

    // Filter images that passed QA
    const passedImages = generatedAssets.images.filter((img) => {
      const qaReport = generatedAssets.qaReports.find(
        (qa) => qa.imageId === img.id
      );
      return qaReport && qaReport.status === 'passed';
    });

    if (passedImages.length === 0) {
      throw new Error('No images passed QA - regenerate required');
    }

    // Stage 4: Video Generation
    const videoResult = await executeVideoGeneration(passedImages, config);
    results.push(videoResult);

    if (videoResult.status === 'failed') {
      throw new Error(videoResult.error || 'Video generation failed');
    }

    generatedAssets.videos.push(...videoResult.data);

    // Calculate total cost
    const totalCost = calculateProjectCost(results);
    const totalDuration = Date.now() - startTime;

    return {
      results,
      generatedAssets,
      totalCost,
      totalDuration,
    };
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    throw {
      error: error instanceof Error ? error.message : String(error),
      results,
      generatedAssets,
      totalDuration,
    };
  }
}

/**
 * Execute script generation stage
 */
async function executeScriptGeneration(
  project: UGCProject,
  config: OrchestrationConfig
): Promise<StageResult> {
  const startTime = Date.now();

  try {
    const scripts = [];

    for (const narrative of project.narratives) {
      const script = await generateScriptWithOpenAI(
        project.modelProfile!,
        project.productProfile!,
        narrative,
        { apiKey: config.openaiApiKey }
      );

      scripts.push(script);
    }

    return {
      stage: 'scriptGeneration',
      status: 'success',
      duration: Date.now() - startTime,
      data: scripts,
    };
  } catch (error) {
    return {
      stage: 'scriptGeneration',
      status: 'failed',
      duration: Date.now() - startTime,
      data: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Execute image generation stage with variations
 */
async function executeImageGeneration(
  project: UGCProject,
  scripts: any[],
  config: OrchestrationConfig
): Promise<StageResult> {
  const startTime = Date.now();

  try {
    const allImages = [];
    const maxVariations = config.maxImageVariations || 3;

    if (config.enableParallelProcessing) {
      // Generate all variations in parallel batches
      const generationPromises = scripts.flatMap((script) =>
        script.scenes.map((scene: any) =>
          generateImageVariations(
            {
              sceneNumber: scene.sceneNumber,
              promptTemplate: {
                basePrompt: scene.description,
                modelModifiers: ['professional', 'confident'],
                productPlacement: 'prominent',
                lightingStyle: 'studio',
                backgroundColor: 'white',
              },
              config: {
                modelPhotoUrl: project.modelProfile?.referenceImageUrl || '',
                productPhotoUrl:
                  project.productProfile?.referenceImageUrl || '',
              },
            },
            maxVariations,
            { apiKey: config.nanoBananaApiKey }
          )
        )
      );

      const results = await Promise.allSettled(generationPromises);

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          allImages.push(...result.value);
        }
      });
    } else {
      // Sequential generation
      for (const script of scripts) {
        for (const scene of script.scenes) {
          const variations = await generateImageVariations(
            {
              sceneNumber: scene.sceneNumber,
              promptTemplate: {
                basePrompt: scene.description,
                modelModifiers: ['professional', 'confident'],
                productPlacement: 'prominent',
                lightingStyle: 'studio',
                backgroundColor: 'white',
              },
              config: {
                modelPhotoUrl: project.modelProfile?.referenceImageUrl || '',
                productPhotoUrl:
                  project.productProfile?.referenceImageUrl || '',
              },
            },
            maxVariations,
            { apiKey: config.nanoBananaApiKey }
          );

          allImages.push(...variations);
        }
      }
    }

    return {
      stage: 'imageGeneration',
      status: allImages.length > 0 ? 'success' : 'failed',
      duration: Date.now() - startTime,
      data: allImages,
      warnings:
        allImages.length < scripts.length * maxVariations
          ? ['Some image variations failed to generate']
          : undefined,
    };
  } catch (error) {
    return {
      stage: 'imageGeneration',
      status: 'failed',
      duration: Date.now() - startTime,
      data: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Execute quality assurance stage
 */
async function executeQualityAssurance(
  images: any[],
  config: OrchestrationConfig
): Promise<StageResult> {
  const startTime = Date.now();

  try {
    const qaReports = [];

    // Batch QA with 100ms delay between images
    for (const image of images) {
      const qaReport = await analyzeImageQuality(image.imageUrl, {
        apiKey: config.visionApiKey,
      });

      qaReports.push({
        ...qaReport,
        imageId: image.id,
        timestamp: Date.now(),
      });

      // Delay between API calls to avoid throttling
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return {
      stage: 'qualityAssurance',
      status: 'success',
      duration: Date.now() - startTime,
      data: qaReports,
    };
  } catch (error) {
    return {
      stage: 'qualityAssurance',
      status: 'failed',
      duration: Date.now() - startTime,
      data: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Execute video generation stage
 */
async function executeVideoGeneration(
  images: any[],
  config: OrchestrationConfig
): Promise<StageResult> {
  const startTime = Date.now();

  try {
    // Sort images by scene number for correct order
    const sortedImages = [...images].sort(
      (a, b) => (a.sceneNumber || 0) - (b.sceneNumber || 0)
    );

    const video = await generateVideoWithVeo(sortedImages, {
      apiKey: config.veoApiKey,
      resolution: '1080p',
      frameRate: 30,
      duration: sortedImages.length * 2,
    });

    return {
      stage: 'videoGeneration',
      status: 'success',
      duration: Date.now() - startTime,
      data: [video],
    };
  } catch (error) {
    return {
      stage: 'videoGeneration',
      status: 'failed',
      duration: Date.now() - startTime,
      data: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Calculate total project cost based on stage results
 */
function calculateProjectCost(results: StageResult[]): number {
  let totalCost = 0;

  for (const result of results) {
    switch (result.stage) {
      case 'scriptGeneration':
        // OpenAI: ~$0.0005-0.03 per script
        totalCost += result.data.length * 0.01;
        break;

      case 'imageGeneration':
        // Nano Banana: $0.20 per image
        totalCost += result.data.length * 0.2;
        break;

      case 'qualityAssurance':
        // Vision API: ~$0.005 per image (with free quota)
        totalCost += (result.data.length * 0.005) / 1000; // effectively free with quota
        break;

      case 'videoGeneration':
        // Veo: $3-5 per minute
        result.data.forEach((video: any) => {
          const minutes = (video.duration || 30) / 60;
          totalCost += minutes * 3.5;
        });
        break;
    }
  }

  return Math.round(totalCost * 100) / 100;
}

/**
 * Execute single stage for testing or regeneration
 */
export async function executeSingleStage(
  stage: string,
  project: UGCProject,
  config: OrchestrationConfig,
  previousData?: any
): Promise<StageResult> {
  switch (stage) {
    case 'scriptGeneration':
      return executeScriptGeneration(project, config);

    case 'imageGeneration':
      return executeImageGeneration(
        project,
        previousData || [],
        config
      );

    case 'qualityAssurance':
      return executeQualityAssurance(previousData || [], config);

    case 'videoGeneration':
      return executeVideoGeneration(previousData || [], config);

    default:
      throw new Error(`Unknown stage: ${stage}`);
  }
}

/**
 * Estimate total project cost before execution
 */
export function estimateProjectCost(project: UGCProject): number {
  const scriptCount = project.narratives.length;
  const scenesPerScript = 3;
  const imageVariations = 3;
  const totalImages = scriptCount * scenesPerScript * imageVariations;

  // Cost estimates:
  const scriptCost = scriptCount * 0.01; // $0.01 per script
  const imageCost = totalImages * 0.2; // $0.20 per image
  const qaCost = totalImages * 0.005; // $0.005 per image (mostly free)
  const videoCost = (scriptCount * 2 * 3.5) / 60; // 2 minutes per script * $3.5/min

  return Math.round((scriptCost + imageCost + qaCost + videoCost) * 100) / 100;
}

/**
 * Estimate total project duration
 */
export function estimateProjectDuration(project: UGCProject): number {
  const scriptCount = project.narratives.length;
  const scenesPerScript = 3;
  const imageVariations = 3;

  // Time estimates (in seconds):
  const scriptTime = scriptCount * 30; // ~30 seconds per script
  const imageTime = scenesPerScript * imageVariations * 12; // ~12 seconds per image
  const qaTime = (scenesPerScript * imageVariations * 3) / 10; // ~0.3 seconds per image
  const videoTime = scriptCount * 2 * 60; // 1-2 minutes per minute of video

  return Math.round((scriptTime + imageTime + qaTime + videoTime) / 60); // return in minutes
}
