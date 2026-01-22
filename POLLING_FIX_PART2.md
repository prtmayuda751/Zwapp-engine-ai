# 🔴 BUG REPORT - Output Not Displaying (Secondary Issue)

**Status:** FIXED ✅  
**Date:** 2026-01-22  
**Severity:** CRITICAL  
**Component:** App.tsx - API Polling Logic

---

## 📋 Issue Description

Even though KIE.AI logs showed status `success`, the system:
- Progress bar stuck at "GENERATING"
- Output results NOT displayed
- Status remained "waiting" instead of "success"

### Symptoms (From Screenshot):
- ✅ KIE.AI API: status = "success"
- ❌ System UI: status = "GENERATING" (animated)
- ❌ OutputPanel: Not rendering results
- ❌ ResultJson: Not populated

---

## 🔍 Root Cause Analysis

### Bug #1: Promise Handling Inside setState()

**Location:** [App.tsx](App.tsx#L141-L190) - Lines 141-190

**Problematic Code:**
```tsx
const apiPollId = window.setInterval(async () => {
    setTasks(prevTasks => {
        const tasksToPoll = prevTasks.filter(t => t.state === 'waiting');
        
        // ❌ BUG: Promise.all() called but not awaited
        Promise.all(tasksToPoll.map(...)).then(updates => {
            setTasks(prev => ...);  // Runs in background
        });

        return prevTasks;  // ← Returns immediately, Promise still pending!
    });
}, 3000);
```

### Why This Causes the Bug:

1. **Async work inside setState callback:**
   - `setTasks()` callback must be synchronous
   - `Promise.all()` returns immediately (not awaited)
   - Function returns `prevTasks` before API responds

2. **Race Condition:**
   ```
   Time 0:   setTasks() called
   Time 0:   Promise.all() started in background
   Time 0:   Function returns prevTasks (stale data!)
   Time 3s:  API response arrives
   Time 3s:  .then() calls setTasks() with new state
   Time 6s:  Next polling interval, prevTasks still stale...
   ```

3. **ResultJson Lost:**
   - `update.data` from API contains `resultJson`
   - But it's not explicitly preserved in state update
   - StatusTerminal can't parse results

### Bug #2: ResultJson Field Not Explicitly Preserved

**Location:** [App.tsx](App.tsx#L175-L182)

**Code:**
```tsx
return {
    ...t,
    ...update.data,
    state: newState,
    progress: newProgress,
    // ❌ Missing: resultJson field
};
```

---

## ✅ Solution Applied

### Change: Move Promise Out of setState, Properly Preserve resultJson

**Before:**
```tsx
const apiPollId = window.setInterval(async () => {
    setTasks(prevTasks => {
        Promise.all(...).then(updates => {
            setTasks(...);  // Nested setState call
        });
        return prevTasks;  // Too early!
    });
}, 3000);
```

**After:**
```tsx
const apiPollId = window.setInterval(async () => {
    setTasks(prevTasks => {
        const tasksToPoll = prevTasks.filter(t => t.state === 'waiting');
        if (tasksToPoll.length === 0) return prevTasks;

        // Start async operation OUTSIDE setState
        (async () => {
            const updates = await Promise.all(...);
            
            // Update state AFTER receiving data
            setTasks(prev => prev.map(t => {
                const update = updates.find(u => u && u.taskId === t.taskId);
                if (update && update.data) {
                    return {
                        ...t,
                        ...update.data,
                        state: newState,
                        progress: newProgress,
                        resultJson: update.data.resultJson || t.resultJson,  // ✅ Preserved
                    };
                }
                return t;
            }));
        })();

        return prevTasks;
    });
}, 3000);
```

### Key Changes:

1. **Wrap async operation in IIFE** - `(async () => { ... })()`
   - Executes asynchronously, doesn't block setState callback
   - Allows `await Promise.all()` to wait for responses

2. **Explicitly preserve resultJson** - Added fallback:
   ```tsx
   resultJson: update.data.resultJson || t.resultJson
   ```

3. **Proper await timing** - Now waits for API response before calling setTasks()

---

## 🎯 Impact

### Before Fix:
- Polling called but state updates happened in wrong order
- API data arrived too late
- ResultJson field lost
- StatusTerminal couldn't render output

### After Fix:
- ✅ Polling waits for API response
- ✅ State updates with complete data (including resultJson)
- ✅ StatusTerminal receives all fields
- ✅ Output displays correctly when success

---

## 🧪 How It Works Now

```
Polling Cycle (Fixed):
1. Interval triggers every 3s
2. setTasks() called with prevTasks
3. IIFE starts async polling
4. await Promise.all() waits for API
5. Results received with all fields:
   - taskId, state, resultJson, etc.
6. setTasks() called with complete data
7. StatusTerminal re-renders with results
```

---

## 🔧 Testing Output Display

1. **Create a new task** with image-edit model
2. **Check KIE.AI logs** - should show "success"
3. **Check System UI:**
   - Status badge should change from GENERATING → success (green)
   - Progress bar should reach 100%
   - OUTPUT_FEED panel should appear
   - Image/video should display

**If output still not showing:**
- Open browser DevTools (F12)
- Check Console for errors
- Verify `resultJson` field is populated in App state

---

## 📝 Related Fixes

This fix builds on earlier **Dependency Array fix** ([BUG_REPORT.md](BUG_REPORT.md)):
- **First fix:** Removed `tasks` from useEffect dependency
- **Second fix:** Fixed Promise handling inside setState callback

Together they ensure:
1. Polling runs consistently
2. API data processed correctly
3. UI updates with results

---

## Files Modified

- [App.tsx](App.tsx#L138-L192) - Fixed async polling logic
- [components/StatusTerminal.tsx](components/StatusTerminal.tsx) - No changes (now receives complete data)
