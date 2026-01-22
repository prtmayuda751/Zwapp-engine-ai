/**
 * Credit pricing for different AI models
 * Based on KIE.AI pricing: https://kie.ai/pricing
 * Prices are typically 30-50% lower than official APIs
 */

export const CREDIT_PRICING: Record<string, number> = {
  // Motion Control - Kling 2.6
  'kling-2.6/motion-control': 300,
  
  // Nano Banana
  'google/nano-banana': 10,
  'google/nano-banana-edit': 15,
  'nano-banana-pro': 20,
  
  // Qwen Image
  'qwen/image-to-image': 20,
  
  // Z-Image
  'z-image': 15,
  
  // Other common models (for reference)
  'flux-2/pro-text-to-image': 50,
  'grok-imagine/text-to-image': 30,
  'seedream/generate': 25,
};

/**
 * Get credit cost for a specific model
 */
export const getCreditCost = (modelName: string): number => {
  return CREDIT_PRICING[modelName] ?? 10; // Default 10 credits if model not found
};

/**
 * Format credits display (e.g., "150 credits")
 */
export const formatCredits = (credits: number): string => {
  return `${credits.toLocaleString()} credits`;
};

/**
 * Fetch user's current credit balance from KIE.AI
 */
export const fetchUserCredits = async (apiKey: string): Promise<number> => {
  if (!apiKey || apiKey.trim() === '') {
    return 0;
  }

  try {
    // Try primary endpoint: user info
    try {
      const response = await fetch('https://api.kie.ai/v1/user/info', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const credits = data.data?.balance ?? data.data?.credits ?? data.balance ?? data.credits ?? 0;
        console.log('[Credits] Fetched from /v1/user/info:', credits);
        return credits;
      }
    } catch (e) {
      console.log('[Credits] Primary endpoint failed, trying alternatives...');
    }

    // Try alternative endpoint: user profile/account
    try {
      const response = await fetch('https://api.kie.ai/v1/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const credits = data.data?.balance ?? data.data?.credits ?? data.balance ?? data.credits ?? 0;
        console.log('[Credits] Fetched from /v1/user:', credits);
        return credits;
      }
    } catch (e) {
      console.log('[Credits] Alternative endpoint 1 failed...');
    }

    // Try account endpoint
    try {
      const response = await fetch('https://api.kie.ai/v1/account', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const credits = data.data?.balance ?? data.data?.credits ?? data.balance ?? data.credits ?? 0;
        console.log('[Credits] Fetched from /v1/account:', credits);
        return credits;
      }
    } catch (e) {
      console.log('[Credits] Alternative endpoint 2 failed...');
    }

    console.warn('[Credits] All endpoints exhausted, returning 0');
    return 0;
  } catch (error) {
    console.error('[Credits] Fatal error fetching credits:', error);
    return 0;
  }
};

/**
 * Format large credit numbers (e.g., 150000 → 150k)
 */
export const formatCreditsShort = (credits: number): string => {
  if (credits >= 1000000) {
    return `${(credits / 1000000).toFixed(1)}M`;
  }
  if (credits >= 1000) {
    return `${(credits / 1000).toFixed(1)}k`;
  }
  return credits.toString();
};

/**
 * Get warning level for credit balance
 */
export const getCreditWarningLevel = (current: number, cost: number): 'safe' | 'warning' | 'danger' => {
  if (current < cost) {
    return 'danger'; // Not enough credits
  }
  if (current < cost * 3) {
    return 'warning'; // Only enough for 3 generations
  }
  return 'safe'; // Plenty of credits
};
