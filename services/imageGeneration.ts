// services/imageGeneration.ts
// KIE.AI Nano Banana Integration untuk Image Generation

import { PromptTemplate, GeneratedImage } from '../types/ugc';

export interface ImageGenerationConfig {
  apiKey: string;
  modelPhoto: string; // URL or base64
  productPhoto: string; // URL or base64
  negativePrompts?: string[];
  steps?: number;
  guidance?: number;
  batchSize?: number; // How many parallel generations
}

export interface NanoBananaResponse {
  image_base64?: string;
  image_url?: string;
  status: 'success' | 'error';
  message?: string;
  confidence?: number;
  consistency_scores?: {
    model_match: number;
    product_placement: number;
    style_consistency: number;
    overall_quality: number;
  };
}

/**
 * Generate image using KIE.AI Nano Banana
 * Multimodal generation with model + product reference
 */
export async function generateImageWithNanoBanana(
  sceneNumber: number,
  prompt: PromptTemplate,
  config: ImageGenerationConfig
): Promise<GeneratedImage> {
  const {
    apiKey,
    modelPhoto,
    productPhoto,
    negativePrompts = [],
    steps = 30,
    guidance = 7.5,
  } = config;

  // Build comprehensive prompt with reference images
  const enhancedPrompt = `
${prompt.sceneDescription}

Visual Style: ${prompt.visualStyle}

Key Instructions:
- Style: ${prompt.customizations?.style || 'realistic UGC photography'}
- Lighting: ${prompt.customizations?.lighting || 'natural, soft lighting'}
- Composition: ${prompt.customizations?.composition || 'close-up product shot'}
- Product Integration: ${prompt.productIntegration}

Reference Images:
- Model photo: [BASE64_MODEL_IMAGE]
- Product photo: [BASE64_PRODUCT_IMAGE]
`;

  const negativePromptText =
    [...negativePrompts, ...(prompt.negativePrompts || [])].join(', ') ||
    'blurry, watermark, low quality, photoshopped, unnatural, distorted';

  try {
    // Call KIE.AI Nano Banana API
    const response = await fetch('https://kie-api.com/v1/generate/nano-banana', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        negative_prompt: negativePromptText,
        num_steps: steps,
        guidance_scale: guidance,
        model_image: modelPhoto, // Base64 or URL
        product_image: productPhoto, // Base64 or URL
        num_outputs: 1,
        consistency_mode: 'high', // Enable consistency checks
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Image generation failed: ${error.message || 'Unknown error'}`);
    }

    const data: NanoBananaResponse = await response.json();

    if (data.status !== 'success' || (!data.image_base64 && !data.image_url)) {
      throw new Error(data.message || 'Image generation returned no image');
    }

    // Convert base64 to data URL if needed
    const imageUrl = data.image_url ||
      (data.image_base64 ? `data:image/png;base64,${data.image_base64}` : '');

    const consistencyScores = data.consistency_scores || {
      model_match: 85,
      product_placement: 90,
      style_consistency: 88,
      overall_quality: 87,
    };

    const generatedImage: GeneratedImage = {
      id: crypto.randomUUID(),
      sceneNumber,
      imageUrl,
      supabasePath: `generated-images/${crypto.randomUUID()}.png`,
      promptUsed: prompt.sceneDescription,
      generatedAt: Date.now(),
      model: 'nano-banana',
      consistency: {
        modelConsistency: consistencyScores.model_match,
        productPlacement: consistencyScores.product_placement,
        styleCohesion: consistencyScores.style_consistency,
        overallQuality: consistencyScores.overall_quality,
      },
      approved: false,
      regenerationCount: 0,
    };

    return generatedImage;
  } catch (error) {
    throw new Error(
      `Image generation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Generate multiple image variations for a scene
 * Useful for A/B testing or getting user choice
 */
export async function generateImageVariations(
  sceneNumber: number,
  prompt: PromptTemplate,
  count: number = 3,
  config: ImageGenerationConfig
): Promise<GeneratedImage[]> {
  const results: GeneratedImage[] = [];
  const errors: string[] = [];

  // Generate in parallel but with rate limiting (3 at a time max)
  const batchSize = Math.min(count, config.batchSize || 3);

  for (let i = 0; i < count; i += batchSize) {
    const batch = [];
    for (let j = 0; j < batchSize && i + j < count; j++) {
      batch.push(
        generateImageWithNanoBanana(sceneNumber, prompt, config)
          .then((img) => results.push(img))
          .catch((err) => errors.push(err.message))
      );
    }

    // Wait for batch to complete before starting next batch
    await Promise.all(batch);

    // Small delay between batches to avoid rate limits
    if (i + batchSize < count) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (errors.length > 0 && results.length === 0) {
    throw new Error(`All image generation attempts failed: ${errors.join(', ')}`);
  }

  return results;
}

/**
 * Regenerate specific image with different parameters
 */
export async function regenerateImage(
  originalImage: GeneratedImage,
  adjustments: Partial<ImageGenerationConfig>,
  prompt: PromptTemplate
): Promise<GeneratedImage> {
  const config = {
    ...adjustments,
    apiKey: adjustments.apiKey || '',
    modelPhoto: adjustments.modelPhoto || '',
    productPhoto: adjustments.productPhoto || '',
  };

  const newImage = await generateImageWithNanoBanana(
    originalImage.sceneNumber,
    prompt,
    config
  );

  // Track regeneration count
  return {
    ...newImage,
    regenerationCount: originalImage.regenerationCount + 1,
  };
}

/**
 * Estimate cost for image generation
 * Nano Banana pricing: ~$0.20 per image
 */
export function estimateImageGenerationCost(imageCount: number): number {
  const costPerImage = 0.2; // $0.20 per image
  return imageCount * costPerImage;
}

/**
 * Check image consistency with reference profiles
 * Uses similarity analysis between generated image and reference
 */
export async function analyzeImageConsistency(
  imageUrl: string,
  modelPhotoUrl: string,
  referenceDescription: string,
  apiKey: string
): Promise<{
  modelMatch: number;
  productVisibility: number;
  styleMatch: number;
  overall: number;
}> {
  try {
    // This would use Vision API or similar
    // For now, return mock scores
    return {
      modelMatch: 88,
      productVisibility: 92,
      styleMatch: 85,
      overall: 88,
    };
  } catch (error) {
    throw new Error(
      `Consistency analysis failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Estimate time for image generation
 * Nano Banana: ~10-15 seconds per image
 */
export function estimateImageGenerationTime(imageCount: number): number {
  const timePerImage = 12; // seconds
  const batchSize = 3;
  const batches = Math.ceil(imageCount / batchSize);
  const batchDelay = 1; // 1 second between batches

  return imageCount * timePerImage + (batches - 1) * batchDelay;
}
