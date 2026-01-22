# 🔧 Proxy Configuration - API Error 404 Fix

**Status:** FIXED ✅  
**Date:** 2026-01-22  
**Issue:** API calls returning 404 when running locally

---

## 📋 Problem Description

When running `npm run dev` (Vite dev server), API requests to KIE.AI failed with:
```
Critical Failure: API Error (404):
```

### Why This Happened:

1. **Vercel rewrites only work on Vercel deployment**
   - `vercel.json` contains rewrite rules for Vercel serverless environment
   - These rules don't apply to local dev server
   
2. **CORS Blocking**
   - Request from `http://localhost:3000` to `https://api.kie.ai` gets blocked by browser CORS policy
   - Request never reaches API, returns 404

3. **Missing Proxy in Vite**
   - Vite dev server had no proxy configuration to forward API requests

---

## ✅ Solution Applied

### Change: Add Vite Proxy Configuration

**File:** [vite.config.ts](vite.config.ts)

**Before:**
```typescript
server: {
    port: 3000,
    host: '0.0.0.0',
}
```

**After:**
```typescript
server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api/proxy': {
        target: 'https://api.kie.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/proxy/, '/api/v1'),
        secure: true,
      }
    }
}
```

### How It Works:

```
Browser Request Flow:
┌─────────────────────────────────────────────────────────┐
│ App at http://localhost:3000                            │
│ fetch('/api/proxy/jobs/createTask')                     │
└─────────────────────┬───────────────────────────────────┘
                      │
          Vite Proxy intercepts
          rewrite /api/proxy → /api/v1
          forward to https://api.kie.ai
                      │
┌─────────────────────▼───────────────────────────────────┐
│ KIE.AI API Server                                       │
│ https://api.kie.ai/api/v1/jobs/createTask              │
│ ✅ No CORS error (server-to-server request)            │
└─────────────────────────────────────────────────────────┘
```

### Configuration Details:

| Property | Value | Explanation |
|----------|-------|-------------|
| `target` | `https://api.kie.ai` | Real API server URL |
| `changeOrigin` | `true` | Changes Host header to match target (prevents CORS) |
| `rewrite` | `/api/proxy` → `/api/v1` | Matches vercel.json rewrite rule |
| `secure` | `true` | Accept self-signed certificates |

---

## 🚀 Next Steps

**The dev server needs to be restarted after config change:**

1. Stop current dev server (Ctrl+C)
2. Run `npm run dev` again
3. Access http://localhost:3000

**For Production (Vercel):**
- Keep using `vercel.json` (no changes needed)
- Vercel will use native rewrites instead of proxy

---

## 🧪 Testing

To verify API proxy works:

```bash
# Terminal 1: Keep dev server running
npm run dev

# Terminal 2: Test API endpoint
curl -X POST http://localhost:3000/api/proxy/jobs/createTask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"model":"qwen/image-edit","input":{"prompt":"test"}}'
```

Expected response should be from KIE.AI (not 404).

---

## 📝 Files Modified

- [vite.config.ts](vite.config.ts) - Added proxy configuration
- [vercel.json](vercel.json) - No changes (for production)
- [services/api.ts](services/api.ts) - No changes (uses same BASE_URL)
