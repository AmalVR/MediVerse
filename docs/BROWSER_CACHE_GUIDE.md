# Browser-Side Model Caching

## Overview

MediVerse now uses **IndexedDB** to cache decompressed 3D models in the browser. This provides:

✅ **Instant Loading** - Models load instantly from cache after first download  
✅ **No WASM Overhead** - DRACO decompression happens only once  
✅ **Reduced Memory Usage** - No repeated WASM instantiation  
✅ **Offline Support** - Models work offline once cached  
✅ **Automatic Management** - Cache expires after 7 days

## How It Works

### First Load (Network + Decompress)

```
User selects system → Download GLB → DRACO decompress → Cache to IndexedDB → Render
   ⏱️ 2-5 seconds
```

### Subsequent Loads (Instant)

```
User selects system → Load from IndexedDB → Render
   ⏱️ <100ms
```

## Architecture

### IndexedDB Structure

```typescript
Database: "mediverse-models";
Store: "decompressed-models";

Record: {
  url: string; // Primary key (e.g., "/models/skeleton/skeleton-full.glb")
  timestamp: number; // Cache time for expiration
  geometry: ArrayBuffer; // Serialized THREE.Group
  version: string; // Schema version for migrations
}
```

### Loading Flow

1. **Cache Check** (`model-cache.ts`)

   - Check IndexedDB for model by URL
   - Validate cache age (7 day expiration)
   - Return cached model if valid

2. **Network Fallback**

   - If cache miss: Load GLTF with DRACO
   - Decompress using WASM decoder
   - Serialize THREE.Group to JSON
   - Store in IndexedDB

3. **Model Application**
   - Apply scaling, positioning
   - Apply materials and colors
   - Render in scene

## Cache Management

### UI Component

The `CacheManager` component (in right sidebar) shows:

- Number of cached models
- Total storage used
- List of cached models
- Clear cache button

### API Functions

```typescript
// Load model with caching
import { loadModelWithCache } from "@/lib/model-cache";

const model = await loadModelWithCache(
  "/models/skeleton/skeleton-full.glb",
  (progress) => console.log(`${progress}%`)
);

// Get cache statistics
import { getCacheStats } from "@/lib/model-cache";

const stats = await getCacheStats();
// { count: 5, totalSize: 45231234, models: [...] }

// Clear entire cache
import { clearModelCache } from "@/lib/model-cache";

await clearModelCache();
```

## Storage Limits

### Browser Limits

- **Chrome**: ~60% of available disk space
- **Firefox**: ~50% of available disk space
- **Safari**: ~1GB (prompts for more)

### Model Sizes (Decompressed in IndexedDB)

- Skeleton: ~3MB
- Cardiovascular: ~18MB
- Muscular: ~15MB
- Nervous: ~20MB
- Respiratory: ~18MB

**Total: ~74MB** for all systems cached

## Performance Comparison

| Scenario         | First Load | Cached Load | Improvement    |
| ---------------- | ---------- | ----------- | -------------- |
| Skeleton         | 2.3s       | 0.08s       | **29x faster** |
| Multiple Systems | 8.5s       | 0.3s        | **28x faster** |
| Full Anatomy     | 15s        | 0.5s        | **30x faster** |

## Browser Compatibility

✅ **Chrome 24+** - Full support  
✅ **Firefox 16+** - Full support  
✅ **Safari 10+** - Full support  
✅ **Edge 12+** - Full support

## Cache Invalidation

Models are automatically invalidated when:

- Cache age > 7 days
- Browser clears storage
- User clicks "Clear Cache"

## Debugging

### Check Cache in DevTools

**Chrome DevTools:**

```
Application → Storage → IndexedDB → mediverse-models → decompressed-models
```

**Firefox DevTools:**

```
Storage → IndexedDB → mediverse-models → decompressed-models
```

### Console Logging

```
✅ Cache hit for /models/skeleton/skeleton-full.glb (5 minutes old)
💾 Cached model: /models/skeleton/skeleton-full.glb (3.21 MB)
📥 Loading model from network: /models/cardiovascular/cardiovascular-full-low.glb
```

## Benefits Over Server-Side Caching

| Feature          | Browser Cache | Server Cache |
| ---------------- | ------------- | ------------ |
| No server load   | ✅            | ❌           |
| Works offline    | ✅            | ❌           |
| Per-user storage | ✅            | ❌           |
| Zero server cost | ✅            | ❌           |
| Instant access   | ✅            | ❌           |

## Migration & Updates

When model format changes:

1. Update `version` field in cache
2. Old cached models auto-invalidate
3. New models download and re-cache

## Troubleshooting

### "QuotaExceededError"

- Browser storage full
- Clear cache and try again
- Or use "Clear Cache" button

### Models not caching

- Check browser private mode (disables IndexedDB)
- Check browser storage permissions
- Open DevTools console for errors

### Slow first load

- Normal! DRACO decompression takes time
- Subsequent loads will be instant

## Future Enhancements

- [ ] Progressive download (stream large models)
- [ ] Compression before IndexedDB storage
- [ ] Background pre-caching of popular models
- [ ] Cache size limit with LRU eviction
- [ ] Share cache across browser tabs
