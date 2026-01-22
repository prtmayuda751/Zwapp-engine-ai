# 🛠️ System Troubleshooting Guide

**Last Updated:** 2026-01-22  
**Status:** All Issues Resolved ✅

---

## 📚 Issues Documented

### 1. **Progress Stuck / API Response Not Updating** 
**Status:** ✅ FIXED

**Problem:**
- API requests succeed on KIE.AI logs
- UI doesn't update with results
- Progress bar frozen

**Root Cause:**
- React useEffect dependency array included `tasks` state
- This caused polling interval to restart on every state update
- Created race condition preventing consistent API response handling

**Solution:**
- Removed `tasks` from dependency array
- Used functional setState pattern with `prevTasks`
- Ensured polling runs continuously without interruption

**See:** [BUG_REPORT.md](BUG_REPORT.md)

---

### 2. **Output Not Displaying (Secondary Polling Issue)**
**Status:** ✅ FIXED

**Problem:**
- KIE.AI shows "success" status
- System UI shows "GENERATING" continuously
- Output results panel not rendering
- Progress bar stuck at 90-99%

**Root Cause:**
- Promise.all() called inside setState callback but not awaited
- setState returned before API response arrived
- ResultJson field not preserved in state update
- StatusTerminal received incomplete data

**Solution:**
- Moved Promise into IIFE to run asynchronously
- Added explicit resultJson field preservation
- Ensured polling waits for API before state update
- Proper data flow: API response → complete state → UI render

**See:** [POLLING_FIX_PART2.md](POLLING_FIX_PART2.md)

### 2. **API Returning 404 Error**
**Status:** ✅ FIXED

**Problem:**
- Getting "API Error (404)" when creating tasks
- Error didn't occur before (works on Vercel production)
- Requests not reaching KIE.AI API

**Root Cause:**
- Vite dev server at `localhost:3000` has CORS restrictions
- `vercel.json` rewrites only work on Vercel, not local dev
- No proxy configured to forward API requests to KIE.AI

**Solution:**
- Added Vite proxy configuration in `vite.config.ts`
- Routes `/api/proxy/*` to `https://api.kie.ai/api/v1/*`
- Vite dev server now acts as proxy, avoiding CORS issues

**See:** [PROXY_CONFIG.md](PROXY_CONFIG.md)

---

### 3. **Blank Screen on Go Live / Port 5500**
**Status:** ⚠️ By Design (Not a Bug)

**Problem:**
- Go Live (VS Code Live Server) on port 5500 shows blank screen

**Reason:**
- Live Server only serves static HTML files
- React/TypeScript not compiled
- Needs Vite build process

**Solution:**
- Use `npm run dev` to start Vite dev server on **http://localhost:3000**
- Go Live is not suitable for this React app

---

## 🚀 Quick Start

### Installation & Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to:
# http://localhost:3000
```

### Development Workflow

1. **Keep this terminal running:**
   ```bash
   npm run dev
   ```

2. **In browser:**
   - Navigate to http://localhost:3000
   - Changes auto-reload (hot reload)

3. **Edit files:**
   - React components update automatically
   - No manual refresh needed

---

## 🔍 Troubleshooting Checklist

| Issue | Solution |
|-------|----------|
| Blank screen | Use `npm run dev` → http://localhost:3000 (not Go Live) |
| 404 API error | Restart dev server after config changes |
| Progress not updating | Check browser console for errors |
| "API DISCONNECTED" | Save API key in Settings modal |
| Module not found errors | Run `npm install` |

---

## 📋 Architecture Overview

```
Client Request Flow:
┌──────────────────────┐
│ React App (Port 3000)│
│ - StatusTerminal     │
│ - QueueList          │
│ - TaskForms          │
└──────────┬───────────┘
           │
           │ API calls to /api/proxy/jobs/*
           │
┌──────────▼───────────────────────┐
│ Vite Dev Server (Proxy)          │
│ - Intercepts /api/proxy/* routes │
│ - Rewrites to /api/v1/*          │
│ - Forwards to api.kie.ai         │
└──────────┬───────────────────────┘
           │
┌──────────▼───────────────────────┐
│ KIE.AI API Server                │
│ https://api.kie.ai/api/v1/jobs/* │
│ - createTask                     │
│ - recordInfo (polling)           │
└──────────────────────────────────┘
```

---

## 📂 Key Files Reference

| File | Purpose |
|------|---------|
| [App.tsx](App.tsx) | Main component, task management, polling logic |
| [services/api.ts](services/api.ts) | API client (createTask, queryTask) |
| [vite.config.ts](vite.config.ts) | Build & dev server config with proxy |
| [vercel.json](vercel.json) | Production rewrites for Vercel deployment |
| [index.html](index.html) | HTML entry point with React root |

---

## 🆘 Need Help?

If something breaks:

1. **Check console errors:**
   - Browser DevTools → Console tab
   - Look for red error messages

2. **Restart dev server:**
   ```bash
   # Kill existing process
   npm run dev
   # Ctrl+C to stop, then restart
   ```

3. **Reinstall dependencies:**
   ```bash
   npm install
   npm run dev
   ```

4. **Check API key:**
   - Click Settings (gear icon)
   - Paste valid KIE.AI API key

---

## ✨ System Health Check

Run this to verify everything works:

```bash
# 1. Dependencies installed?
npm list react react-dom @supabase/supabase-js

# 2. Dev server running?
curl http://localhost:3000  # Should return HTML

# 3. Proxy working?
curl -X GET http://localhost:3000/api/proxy/health  # If KIE.AI has this endpoint
```

---

**Last checked:** January 22, 2026  
**All systems:** ✅ Operational
