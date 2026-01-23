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
 * Uses Vercel proxy to avoid CORS issues (in production and dev)
 */
export const fetchUserCredits = async (apiKey: string): Promise<number> => {
  if (!apiKey || apiKey.trim() === '') {
    console.warn('[Credits] No API key provided');
    return 0;
  }

  try {
    // Primary endpoint: user info - using proxy
    try {
      const response = await fetch('/api/proxy/user/info', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const credits = parseCreditsFromResponse(data);
        console.log('[Credits] Successfully fetched from /user/info:', credits);
        return credits;
      } else if (response.status === 404 || response.status === 401) {
        console.log(`[Credits] Endpoint /user/info returned ${response.status}, trying alternatives...`);
      } else {
        console.warn(`[Credits] Unexpected status ${response.status} from /user/info`);
      }
    } catch (e) {
      console.log('[Credits] Primary endpoint fetch failed, trying alternatives...');
    }

    // Alternative endpoint: user account
    try {
      const response = await fetch('/api/proxy/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const credits = parseCreditsFromResponse(data);
        console.log('[Credits] Successfully fetched from /user:', credits);
        return credits;
      } else if (response.status === 404 || response.status === 401) {
        console.log(`[Credits] Endpoint /user returned ${response.status}, trying next...`);
      }
    } catch (e) {
      console.log('[Credits] Alternative endpoint 1 failed...');
    }

    // Fallback endpoint: account
    try {
      const response = await fetch('/api/proxy/account', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const credits = parseCreditsFromResponse(data);
        console.log('[Credits] Successfully fetched from /account:', credits);
        return credits;
      }
    } catch (e) {
      console.log('[Credits] Fallback endpoint also failed...');
    }

    console.warn('[Credits] All endpoints exhausted, returning 0. Check API key validity.');
    return 0;
  } catch (error) {
    console.error('[Credits] Fatal error fetching credits:', error);
    return 0;
  }
};

/**
 * Parse credit balance from different API response formats
 * Handles both nested and flat response structures
 */
const parseCreditsFromResponse = (data: any): number => {
  if (!data) {
    console.debug('[Credits] Response is null or undefined');
    return 0;
  }
  
  // Try different possible response structures
  const balance = 
    data.data?.balance ?? // Nested structure: { data: { balance: X } }
    data.data?.credits ?? // Nested structure: { data: { credits: X } }
    data.balance ??        // Flat structure: { balance: X }
    data.credits ??        // Flat structure: { credits: X }
    data.user?.balance ??  // User object structure
    data.user?.credits ??
    0;
  
  // Ensure we return a valid number
  const numBalance = Number(balance);
  const result = isNaN(numBalance) ? 0 : numBalance;
  
  if (result === 0) {
    console.debug('[Credits] Response structure:', JSON.stringify(data).substring(0, 200));
  }
  
  return result;
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
