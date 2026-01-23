// services/scriptGeneration.ts
// OpenAI Integration untuk Script Generation

import {
  ModelProfile,
  ProductProfile,
  NarrativeContext,
  GeneratedScript,
  SceneBreakdown,
} from '../types/ugc';

export interface ScriptGenerationConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Generate UGC script using OpenAI GPT
 * Creates scene-based script with model/product integration
 */
export async function generateScriptWithOpenAI(
  modelProfile: ModelProfile,
  productProfile: ProductProfile,
  narrativeContext: NarrativeContext,
  config: ScriptGenerationConfig
): Promise<GeneratedScript> {
  const {
    apiKey,
    model = 'gpt-3.5-turbo',
    temperature = 0.7,
    maxTokens = 1500,
  } = config;

  // Build detailed prompt for script generation
  const systemPrompt = `You are an expert UGC content writer. Generate authentic, engaging UGC scripts for social media (TikTok, Instagram Reels, YouTube Shorts).

The script should:
- Feel natural and authentic (not overly polished)
- Include the model naturally throughout
- Showcase the product organically
- Be optimized for 15-30 second videos
- Include 3 scenes with clear transitions
- Have specific actions and dialogue for the model

Respond with ONLY valid JSON (no markdown, no code blocks).`;

  const userPrompt = `Create a UGC script with these details:

MODEL PROFILE:
- Look: ${modelProfile.lookDescription}
- Skin Tone: ${modelProfile.skinTone}
- Body Type: ${modelProfile.bodyType}
- Facial Features: ${modelProfile.facialFeatures}
- Expression Style: ${modelProfile.expressionStyle}

PRODUCT:
- Name: ${productProfile.name}
- Category: ${productProfile.category}
- Colors: ${productProfile.colors.join(', ')}
- Key Features: ${productProfile.keyFeatures.join(', ')}
- Price Range: ${productProfile.priceRange}

BRAND NARRATIVE:
- Voice: ${narrativeContext.brandVoice}
- Target Audience: ${narrativeContext.targetAudience}
- Product Story: ${narrativeContext.productStory}
- Cultural Context: ${narrativeContext.culturalContext}
- Emotional Tone: ${narrativeContext.emotionalTone}

Generate a 3-scene UGC script. Return as JSON with this structure:
{
  "title": "Script title",
  "duration": 24,
  "scenes": [
    {
      "sceneNumber": 1,
      "setting": "Description of setting",
      "action": "What the model does",
      "dialogue": "What the model says",
      "productPlacement": "How product is shown",
      "emotionalBeat": "The emotional moment"
    }
  ],
  "voiceoverText": "Optional narration",
  "cta": "Call to action"
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `OpenAI API Error: ${error.error?.message || 'Unknown error'}`
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Parse JSON response
    const scriptData = JSON.parse(content);

    // Build scenes with proper typing
    const scenes: SceneBreakdown[] = scriptData.scenes.map(
      (scene: any, idx: number) => ({
        sceneNumber: idx + 1,
        setting: scene.setting,
        action: scene.action,
        dialogue: scene.dialogue,
        productPlacement: scene.productPlacement,
        emotionalBeat: scene.emotionalBeat,
      })
    );

    const generatedScript: GeneratedScript = {
      id: crypto.randomUUID(),
      title: scriptData.title || 'Untitled Script',
      duration: scriptData.duration || 24,
      scenes,
      voiceoverText: scriptData.voiceoverText || '',
      generatedAt: Date.now(),
      model: model as 'gpt-4' | 'gpt-3.5-turbo',
    };

    return generatedScript;
  } catch (error) {
    throw new Error(
      `Script generation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Estimate cost for script generation
 */
export function estimateScriptGenerationCost(model: string): number {
  // Based on OpenAI pricing (as of Jan 2026)
  const costs: Record<string, number> = {
    'gpt-3.5-turbo': 0.0005, // $0.0005 per 1K tokens
    'gpt-4': 0.03, // $0.03 per 1K tokens
  };
  return costs[model] || 0.001;
}

/**
 * Refine/iterate on existing script
 */
export async function refineScriptWithOpenAI(
  currentScript: GeneratedScript,
  feedback: string,
  config: ScriptGenerationConfig
): Promise<GeneratedScript> {
  const { apiKey, model = 'gpt-3.5-turbo' } = config;

  const refinementPrompt = `You are refining a UGC script based on feedback.

CURRENT SCRIPT:
${JSON.stringify(currentScript, null, 2)}

FEEDBACK:
${feedback}

Please refine the script based on the feedback. Return as JSON with the same structure as the current script.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: refinementPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refine script');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No refinement content received');
    }

    const refinedData = JSON.parse(content);

    return {
      id: crypto.randomUUID(),
      title: refinedData.title || currentScript.title,
      duration: refinedData.duration || currentScript.duration,
      scenes: refinedData.scenes,
      voiceoverText: refinedData.voiceoverText || currentScript.voiceoverText,
      generatedAt: Date.now(),
      model: model as 'gpt-4' | 'gpt-3.5-turbo',
    };
  } catch (error) {
    throw new Error(
      `Script refinement failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
