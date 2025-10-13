# Memory Issue Fix Guide

## Problem

WebAssembly Out of Memory Error:

```
RuntimeError: Aborted(RangeError: WebAssembly.instantiate():
Out of memory: Cannot allocate Wasm memory for new instance)
```

**Root Cause**: The DRACO decoder (used to decompress GLB models) runs out of WebAssembly memory when loading multiple compressed models simultaneously.

## Current Solution (Temporary)

✅ **Skeleton model works** - Using uncompressed 2MB GLB  
⚠️ **Other models use placeholder geometry** - Simple shapes to represent systems

## Permanent Fix Options

### Option 1: Re-export Models WITHOUT DRACO Compression (Recommended)

**Steps in Blender:**

1. Open `/public/models/Z-Anatomy/Startup.blend`
2. Select the system you want to export (cardiovascular, muscular, etc.)
3. File > Export > glTF 2.0 (.glb/.gltf)
4. **In Export Settings:**
   - Format: GLB Binary (.glb)
   - **Compression: NONE** (critical - disable DRACO)
   - Include: Selected Objects
   - Transform: +Y Up
   - Geometry: Apply Modifiers
5. Export to `/public/models/[system]/[system]-uncompressed.glb`
6. Update path in `AnatomyViewer.tsx`

**File Size Comparison:**

- With DRACO: ~9.6MB (compressed, causes WASM error)
- Without DRACO: ~15-25MB (uncompressed, works fine)
- Network: Modern browsers handle 20MB files easily with HTTP/2

### Option 2: Use Basis Universal Texture Compression

Instead of DRACO mesh compression, use texture compression:

**Blender Export Settings:**

- Compression: None (for meshes)
- Images: WebP or Basis (for textures only)
- This compresses textures but not geometry

### Option 3: Split Models into Smaller Parts

Export each organ/muscle individually:

- `heart.glb` (small, loads easily)
- `left-lung.glb` (small, loads easily)
- `right-lung.glb` (small, loads easily)

Load them together in the viewer.

### Option 4: Server-Side Conversion

Create a Node.js script to decompress DRACO models server-side:

```bash
npm install @gltf-transform/core @gltf-transform/extensions
```

```javascript
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, draco } from "@gltf-transform/functions";

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read("model-compressed.glb");

// Remove DRACO compression
await doc.transform(
  draco({ encoder: null }) // Decodes but doesn't re-encode
);

await io.write("model-uncompressed.glb", doc);
```

## Quick Fix Commands

### Check Model Compression

```bash
# Install gltf-pipeline
npm install -g gltf-pipeline

# Check if DRACO compressed
gltf-pipeline -i model.glb --stats
```

### Decompress Model

```bash
# Decompress DRACO
gltf-pipeline -i model-draco.glb -o model-uncompressed.glb

# Or with optimization
gltf-pipeline -i model-draco.glb -o model-optimized.glb --draco.uncompressed
```

## Memory-Efficient Loading Strategy

Currently implemented:

1. ✅ Load skeleton first (always works)
2. ✅ Use placeholders for other systems
3. ✅ Disabled DRACO decoder

To improve:

1. Re-export 1-2 key models without DRACO
2. Load models sequentially (one at a time)
3. Implement model LOD (Level of Detail):
   - Far view: Very low poly
   - Medium view: Medium poly
   - Close view: High poly

## Recommended Action

**For Development:**

1. Keep skeleton model (works perfectly)
2. Re-export **cardiovascular system** without DRACO for demo
3. Use placeholders for others until needed

**For Production:**

1. Re-export all models from Blender **without DRACO compression**
2. Implement progressive loading (load skeleton first, then others)
3. Use CDN with HTTP/2 for efficient delivery
4. Consider model LOD system

## Testing

After re-exporting without DRACO:

```javascript
// In AnatomyViewer.tsx, replace placeholder with:
{
  visibleParts.includes("cardiovascular") && (
    <AnatomyModel
      modelPath="/models/cardiovascular/cardiovascular-uncompressed.glb"
      // ... other props
    />
  );
}
```

**Expected Result:**

- ✅ No WASM memory errors
- ✅ Models load successfully
- ✅ Larger file size but acceptable for modern browsers
- ✅ Better performance (no decompression overhead)

## File Naming Convention

```
/models/
  ├── skeleton/
  │   └── skeleton-full.glb (2MB, uncompressed ✅)
  ├── cardiovascular/
  │   ├── cardiovascular-full.glb (OLD, DRACO, 5.4MB ❌)
  │   └── cardiovascular-uncompressed.glb (NEW, 18MB ✅)
  ├── muscular/
  │   └── muscles-uncompressed.glb (NEW ✅)
  └── nervous/
      └── nervous-uncompressed.glb (NEW ✅)
```

## Summary

🔴 **Problem**: DRACO WASM decoder runs out of memory  
🟡 **Temporary Fix**: Using placeholder geometry  
🟢 **Permanent Fix**: Re-export models without DRACO compression

**Trade-off**: Larger file sizes (~15-25MB) vs No memory errors  
**Winner**: Uncompressed GLB (browsers handle it fine, users get reliable experience)
