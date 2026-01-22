# 🔴 BUG REPORT - Progress Stuck Issue

**Status:** FIXED ✅  
**Date:** 2026-01-22  
**Severity:** CRITICAL  
**Component:** App.tsx - Central Polling Logic

---

## 📋 Issue Description

API requests to KIE.AI are **successful** (confirmed in logs), but the UI progress remains stuck and doesn't display the output results.

### Symptoms:
- ✅ KIE.AI logs show request succeeded with status 200
- ❌ StatusTerminal doesn't update with task results
- ❌ Progress bar stays frozen
- ❌ Output results not displayed
- ❌ State transitions not reflected in UI

---

## 🔍 Root Cause Analysis

### Primary Bug: Dependency Array in useEffect

**Location:** [App.tsx](App.tsx#L116-L185) - Lines 116-193

**Problematic Code:**
```tsx
useEffect(() => {
    // ... polling setup ...
}, [tasks, apiKey, session]);  // ❌ WRONG - includes `tasks`
```

### Why This Causes the Bug:

1. **Infinite Loop / Race Condition:**
   - API polling interval calls `setTasks()` to update task state
   - React's dependency array detects `tasks` has changed
   - useEffect cleanup runs, clearing the polling interval
   - useEffect setup runs again, creating a new polling interval
   - This creates an unstable polling loop that continuously restarts

2. **State Update Race:**
   ```
   Time 0:  setInterval starts polling every 3s
   Time 3s: API response arrives → setTasks(prevTasks => ...)
   Time 3s: React sees `tasks` dependency changed
   Time 3s: useEffect cleanup() → clearInterval()
   Time 3s: useEffect setup again → new setInterval() created
   Time 6s: Previous interval already cleared, only new one runs...
   ```

3. **Result:**
   - Polling doesn't run consistently
   - Response data updates are queued but never fully processed
   - UI remains stale even though API succeeded

---

## ✅ Solution Applied

### Change: Remove `tasks` from Dependency Array

**Before:**
```tsx
useEffect(() => {
    // ... polling logic using `tasks` ...
}, [tasks, apiKey, session]);
```

**After:**
```tsx
useEffect(() => {
    if (!session || !apiKey) return;
    
    // Use prevTasks from setTasks callback
    setTasks(prevTasks => {
        const tasksToPoll = prevTasks.filter(t => t.state === 'waiting');
        // ... query API ...
        return prevTasks;  // Return state, don't depend on it
    });
}, [apiKey, session]);  // ✅ CORRECT - only external deps
```

### Key Changes:

1. **Remove `tasks` from dependency array** - Only keep `apiKey` and `session` (external values that should trigger re-setup)

2. **Use functional setState pattern** - Access current state via `prevTasks` parameter instead of dependency:
   ```tsx
   setTasks(prevTasks => {
       const tasksToPoll = prevTasks.filter(t => t.state === 'waiting');
       // ... fetch API ...
       return prevTasks;
   });
   ```

3. **Chain Promise updates properly** - Moved `setTasks()` inside `.then()` to ensure updates happen after API response:
   ```tsx
   Promise.all(requests).then(updates => {
       setTasks(prev => prev.map(t => {
           // Apply updates here
       }));
   });
   ```

---

## 🎯 Impact

### Before Fix:
- Polling interval restarts every 3 seconds (when state updates)
- No consistent polling rhythm
- API responses processed but not reflected in UI

### After Fix:
- ✅ Polling interval runs uninterrupted every 3 seconds
- ✅ API responses processed and UI updates correctly
- ✅ Task progress displays in real-time
- ✅ Output results shown in StatusTerminal

---

## 🧪 Verification

The fix ensures:
1. **Polling stability** - Single interval runs continuously
2. **State consistency** - Latest task data always used (via prevTasks)
3. **UI updates** - Response data properly rendered to screen
4. **No memory leaks** - Cleanup still removes interval on unmount

---

## 📝 Technical Details

### Why `tasks` in dependencies causes issues:

In React, when a dependency changes:
1. Cleanup function runs: `clearInterval(apiPollId)`
2. Effect runs again: `new setInterval(...)` created
3. Old requests might resolve after new interval created
4. State updates from old requests apply to new state snapshot
5. Timing issues cause missed updates

### Why removing `tasks` fixes it:

- `apiKey` and `session` are **external** to the polling logic
- They control **whether** to poll, not **what** to poll
- `tasks` is **created by** the polling logic, so it shouldn't be a dependency
- Using `prevTasks` in setState gives us current state without dependency

---

## Related Files

- [App.tsx](App.tsx) - Fixed useEffect
- [services/api.ts](services/api.ts) - API calls work correctly
- [components/StatusTerminal.tsx](components/StatusTerminal.tsx) - Displays results
- [components/QueueList.tsx](components/QueueList.tsx) - Shows task progress
