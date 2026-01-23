// services/apiConfig.ts
// Centralized API configuration and key management

export interface APIConfig {
  openai: {
    apiKey: string;
    model: 'gpt-3.5-turbo' | 'gpt-4';
    baseURL?: string;
  };
  nanoBanana: {
    apiKey: string;
    baseURL: string;
  };
  vision: {
    apiKey: string;
    projectId?: string;
  };
  veo: {
    apiKey: string;
    baseURL: string;
  };
  supabase: {
    url: string;
    anonKey: string;
  };
  rateLimit: {
    imageBatchSize: number;
    imageBatchDelayMs: number;
    qaBatchDelayMs: number;
    apiTimeoutMs: number;
  };
  features: {
    enableVideoGeneration: boolean;
    enableBatchProcessing: boolean;
    parallelProcessing: boolean;
    maxImageVariations: number;
    qaThreshold: number;
  };
}

/**
 * Load API configuration from environment variables
 */
export function loadAPIConfig(): APIConfig {
  // Validate required API keys
  const requiredKeys = [
    'VITE_OPENAI_API_KEY',
    'VITE_NANO_BANANA_API_KEY',
    'VITE_VISION_API_KEY',
    'VITE_VEO_API_KEY',
  ];

  const missingKeys = requiredKeys.filter((key) => !import.meta.env[key]);

  if (missingKeys.length > 0) {
    console.warn(
      `Missing API keys: ${missingKeys.join(', ')}. Some features may not work.`
    );
  }

  return {
    openai: {
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo',
      baseURL: import.meta.env.VITE_OPENAI_BASE_URL,
    },
    nanoBanana: {
      apiKey: import.meta.env.VITE_NANO_BANANA_API_KEY || '',
      baseURL: import.meta.env.VITE_NANO_BANANA_BASE_URL || 'https://api.kie.ai',
    },
    vision: {
      apiKey: import.meta.env.VITE_VISION_API_KEY || '',
      projectId: import.meta.env.VITE_VISION_PROJECT_ID,
    },
    veo: {
      apiKey: import.meta.env.VITE_VEO_API_KEY || '',
      baseURL: import.meta.env.VITE_VEO_BASE_URL || 'https://api.kie.ai',
    },
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL || '',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },
    rateLimit: {
      imageBatchSize: parseInt(import.meta.env.VITE_IMAGE_BATCH_SIZE || '3'),
      imageBatchDelayMs: parseInt(
        import.meta.env.VITE_IMAGE_BATCH_DELAY_MS || '1000'
      ),
      qaBatchDelayMs: parseInt(
        import.meta.env.VITE_QA_BATCH_DELAY_MS || '100'
      ),
      apiTimeoutMs: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    },
    features: {
      enableVideoGeneration:
        import.meta.env.VITE_ENABLE_VIDEO_GENERATION !== 'false',
      enableBatchProcessing:
        import.meta.env.VITE_ENABLE_BATCH_PROCESSING !== 'false',
      parallelProcessing: import.meta.env.VITE_PARALLEL_PROCESSING !== 'false',
      maxImageVariations: parseInt(
        import.meta.env.VITE_MAX_IMAGE_VARIATIONS || '3'
      ),
      qaThreshold: parseFloat(import.meta.env.VITE_QA_THRESHOLD || '0.8'),
    },
  };
}

/**
 * Validate API configuration
 */
export function validateAPIConfig(config: APIConfig): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check API keys
  if (!config.openai.apiKey) {
    warnings.push('OpenAI API key not configured - script generation disabled');
  }
  if (!config.nanoBanana.apiKey) {
    warnings.push('Nano Banana API key not configured - image generation disabled');
  }
  if (!config.vision.apiKey) {
    warnings.push('Vision API key not configured - QA analysis disabled');
  }
  if (!config.veo.apiKey) {
    warnings.push('Veo API key not configured - video generation disabled');
  }

  // Check rate limits
  if (config.rateLimit.imageBatchSize < 1) {
    errors.push('Image batch size must be at least 1');
  }
  if (config.rateLimit.imageBatchDelayMs < 0) {
    errors.push('Image batch delay cannot be negative');
  }
  if (config.rateLimit.apiTimeoutMs < 1000) {
    errors.push('API timeout must be at least 1000ms');
  }

  // Check feature settings
  if (config.features.qaThreshold < 0 || config.features.qaThreshold > 1) {
    errors.push('QA threshold must be between 0 and 1');
  }
  if (config.features.maxImageVariations < 1 || config.features.maxImageVariations > 10) {
    errors.push('Max image variations must be between 1 and 10');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check API key health (ping each service)
 */
export async function checkAPIHealth(
  config: APIConfig
): Promise<{
  openai: boolean;
  nanoBanana: boolean;
  vision: boolean;
  veo: boolean;
  overall: boolean;
}> {
  const health = {
    openai: false,
    nanoBanana: false,
    vision: false,
    veo: false,
    overall: false,
  };

  // Check OpenAI
  if (config.openai.apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          Authorization: `Bearer ${config.openai.apiKey}`,
        },
      });
      health.openai = response.ok;
    } catch (error) {
      console.error('OpenAI health check failed:', error);
    }
  }

  // Check Nano Banana
  if (config.nanoBanana.apiKey) {
    try {
      const response = await fetch(`${config.nanoBanana.baseURL}/v1/health`, {
        headers: {
          Authorization: `Bearer ${config.nanoBanana.apiKey}`,
        },
      });
      health.nanoBanana = response.ok;
    } catch (error) {
      console.error('Nano Banana health check failed:', error);
    }
  }

  // Check Vision API
  if (config.vision.apiKey) {
    try {
      const response = await fetch(
        'https://vision.googleapis.com/v1/projects/0:detectText',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': config.vision.apiKey,
          },
        }
      );
      // 400 is expected (bad request) but means API is accessible
      health.vision = response.status === 400 || response.ok;
    } catch (error) {
      console.error('Vision API health check failed:', error);
    }
  }

  // Check Veo
  if (config.veo.apiKey) {
    try {
      const response = await fetch(`${config.veo.baseURL}/v1/health`, {
        headers: {
          Authorization: `Bearer ${config.veo.apiKey}`,
        },
      });
      health.veo = response.ok;
    } catch (error) {
      console.error('Veo health check failed:', error);
    }
  }

  health.overall = Object.values(health).filter((v) => v === true).length >= 3;

  return health;
}

/**
 * Create a singleton instance for easy access
 */
let configInstance: APIConfig | null = null;

export function getAPIConfig(): APIConfig {
  if (!configInstance) {
    configInstance = loadAPIConfig();
  }
  return configInstance;
}

export function setAPIConfig(config: APIConfig): void {
  configInstance = config;
}

/**
 * Safe API key accessor (masks sensitive data)
 */
export function getSafeAPIConfig(config: APIConfig): Record<string, any> {
  return {
    openai: {
      model: config.openai.model,
      configured: !!config.openai.apiKey,
    },
    nanoBanana: {
      baseURL: config.nanoBanana.baseURL,
      configured: !!config.nanoBanana.apiKey,
    },
    vision: {
      configured: !!config.vision.apiKey,
      projectId: config.vision.projectId,
    },
    veo: {
      baseURL: config.veo.baseURL,
      configured: !!config.veo.apiKey,
    },
    rateLimit: config.rateLimit,
    features: config.features,
  };
}
