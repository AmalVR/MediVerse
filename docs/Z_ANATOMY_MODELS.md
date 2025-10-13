# Z-Anatomy Models Setup Guide

Complete guide for setting up 3D anatomical models from Z-Anatomy Blender files.

## Quick Start

**You have Z-Anatomy.zip with Blender files!** Here's how to convert them:

```bash
# 1. Inspect the Blender file structure
blender --background public/models/Z-Anatomy/Startup.blend \
  --python scripts/inspect-blender.py

# 2. Convert to GLB format (takes ~5-10 minutes)
blender --background public/models/Z-Anatomy/Startup.blend \
  --python scripts/export-z-anatomy-main-systems.py

# 3. Or use make
make convert-models

# 4. Verify exported models
ls -lh public/models/*/

# 5. Start the app
npm start
```

The seed script works without models - it stores paths. Models load automatically when files are added.

## Converting Your Z-Anatomy Blender Files

### What You Have

Z-Anatomy.zip contains:

- `Startup.blend` (~291MB) - Complete anatomy in Blender format
- 1,944 collections with all anatomical systems

### Automated Conversion

```bash
# Export main systems (skeleton, muscles, organs, nerves, etc.)
blender --background public/models/Z-Anatomy/Startup.blend \
  --python scripts/export-z-anatomy-main-systems.py
```

**This creates:**

- `skeleton/skeleton-full.glb` (+ low, medium LOD)
- `muscular/muscles-full.glb` (+ LODs)
- `cardiovascular/cardiovascular-full.glb` (+ LODs)
- `nervous/nervous-full.glb` (+ LODs)
- `respiratory/visceral-full.glb` (+ LODs)
- Plus individual organs (lung-left, lung-right, etc.)

**Time:** 5-10 minutes ⏱️

### Getting Z-Anatomy (If You Don't Have It)

1. **Visit:** https://www.z-anatomy.com/
2. **Download** Blender files or GLTF/GLB models
3. **License:** CC BY-SA 4.0 (free with attribution)

### Option 2: Use Placeholder Models

For development/testing without real models:

```bash
# Create placeholder structure
mkdir -p public/models/{skeleton,cardiovascular,respiratory,nervous,muscular}

# The viewer will work with basic shapes until real models are added
```

### Option 3: Use Alternative 3D Models

You can use any anatomical models in GLTF/GLB format:

- https://sketchfab.com/ (search "anatomy")
- https://www.turbosquid.com/
- Create your own with Blender

## Recommended Directory Structure

```
public/models/
├── skeleton/
│   ├── skeleton-full.glb       # Complete skeleton
│   ├── skeleton-low.glb        # Low detail (LOD)
│   ├── skeleton-med.glb        # Medium detail (LOD)
│   ├── skull.glb               # Individual parts
│   ├── femur-left.glb
│   ├── femur-right.glb
│   └── vertebrae.glb
├── cardiovascular/
│   ├── heart.glb
│   ├── heart-low.glb
│   ├── heart-med.glb
│   ├── left-ventricle.glb
│   └── aorta.glb
├── respiratory/
│   ├── lungs.glb
│   ├── lung-left.glb
│   ├── lung-right.glb
│   └── trachea.glb
├── nervous/
│   ├── brain.glb
│   ├── brain-low.glb
│   ├── spinal-cord.glb
│   └── nerves.glb
├── muscular/
│   ├── biceps.glb
│   ├── triceps.glb
│   └── muscles-full.glb
└── digestive/
    ├── stomach.glb
    └── intestines.glb
```

## Converting Models to GLTF/GLB

If you have models in other formats (OBJ, FBX, etc.):

### Using Blender (Free)

```bash
# Install Blender
brew install --cask blender  # macOS
# or download from https://www.blender.org/

# Open Blender
# File → Import → [Your Format]
# File → Export → glTF 2.0 (.glb)
```

### Using gltf-pipeline

```bash
# Install
npm install -g gltf-pipeline

# Convert and optimize
gltf-pipeline -i model.gltf -o model.glb -d

# Options:
# -d : Draco compression (smaller files)
# -b : Convert to binary GLB
```

### Using Online Converters

- https://products.aspose.app/3d/conversion
- https://anyconv.com/3d-converter/
- https://www.greentoken.de/onlineconv/

## Creating LOD (Level of Detail) Versions

LOD improves performance by showing less detail when far away:

### In Blender

1. **Import model**
2. **Select mesh** → Edit Mode
3. **Add Modifier** → Decimate
4. **Ratio:**
   - Low: 0.2 (20% polygons)
   - Medium: 0.5 (50% polygons)
   - High: 1.0 (100% - original)
5. **Apply modifier**
6. **Export each as separate GLB**

### Using meshoptimizer

```bash
npm install -g gltfpack

# High detail (original)
cp model.glb model-high.glb

# Medium detail
gltfpack -i model.glb -o model-med.glb -si 0.5

# Low detail
gltfpack -i model.glb -o model-low.glb -si 0.2
```

## Model Requirements

### File Format

- **Preferred:** GLB (binary GLTF)
- **Alternative:** GLTF with external textures
- **Size:** Under 10MB per model (use compression)

### Optimization

- **Draco compression** for smaller files
- **Power-of-2 textures** (256, 512, 1024, 2048)
- **Merged meshes** where possible
- **Remove unnecessary data** (animations, cameras, lights)

### Coordinate System

- **Up axis:** Y-up (Three.js standard)
- **Units:** Meters
- **Scale:** Realistic human scale (~1.7m height)

## Updating Database Paths

After adding models, update paths in `scripts/seed-anatomy.ts`:

```typescript
{
  partId: "skeleton",
  name: "Skeleton",
  system: AnatomySystem.SKELETAL,
  modelPath: "/models/skeleton/skeleton-full.glb",  // Update this
  lodLevels: {
    low: "/models/skeleton/skeleton-low.glb",       // And these
    medium: "/models/skeleton/skeleton-med.glb",
    high: "/models/skeleton/skeleton-full.glb",
  },
}
```

## Testing Models

### 1. Quick Test in Browser

```html
<!-- test.html -->
<!DOCTYPE html>
<html>
  <head>
    <script type="module">
      import * as THREE from "https://cdn.skypack.dev/three@0.170.0";
      import { GLTFLoader } from "https://cdn.skypack.dev/three@0.170.0/examples/jsm/loaders/GLTFLoader.js";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight
      );
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      const loader = new GLTFLoader();
      loader.load(
        "/models/skeleton/skeleton-full.glb",
        (gltf) => {
          scene.add(gltf.scene);
          console.log("Model loaded!");
        },
        undefined,
        (error) => {
          console.error("Error loading model:", error);
        }
      );

      camera.position.z = 5;
      function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      }
      animate();
    </script>
  </head>
  <body></body>
</html>
```

### 2. Using MediVerse Viewer

Start the app and check browser console:

```bash
npm run dev
# Open http://localhost:5173
# Check console for model loading errors
```

### 3. Validate GLTF Files

```bash
npm install -g gltf-validator

gltf-validator public/models/skeleton/skeleton-full.glb
```

## Example: Adding Your First Model

```bash
# 1. Create directory
mkdir -p public/models/skeleton

# 2. Download/copy your GLB file
# (from Z-Anatomy or other source)
cp ~/Downloads/skeleton.glb public/models/skeleton/skeleton-full.glb

# 3. Create LOD versions (optional)
gltfpack -i public/models/skeleton/skeleton-full.glb \
         -o public/models/skeleton/skeleton-med.glb -si 0.5

gltfpack -i public/models/skeleton/skeleton-full.glb \
         -o public/models/skeleton/skeleton-low.glb -si 0.2

# 4. Verify files exist
ls -lh public/models/skeleton/

# 5. Test in app
npm run dev
```

## Model Optimization Checklist

- [ ] File size under 10MB
- [ ] Draco compression applied
- [ ] Textures are power-of-2
- [ ] LOD versions created
- [ ] Correct coordinate system (Y-up)
- [ ] Realistic scale
- [ ] No unnecessary data
- [ ] Attribution included (for Z-Anatomy)

## Attribution Requirements

For Z-Anatomy models (CC BY-SA 4.0):

1. **In your app:** Display "Powered by Z-Anatomy"
2. **Link:** https://www.z-anatomy.com/
3. **License:** Maintain CC BY-SA 4.0 for derivatives

Add to your UI:

```tsx
<footer>
  <p>
    3D Models by{" "}
    <a href="https://www.z-anatomy.com/" target="_blank">
      Z-Anatomy
    </a>{" "}
    (CC BY-SA 4.0)
  </p>
</footer>
```

## Troubleshooting

### Models not loading

**Check file paths:**

```bash
# Models should be in public/ directory
ls -R public/models/

# Check paths in database match files
npm run prisma:studio
# Check anatomyPart.modelPath values
```

**Check browser console:**

```
404 errors → File path wrong
CORS errors → Serve from same domain
Loading errors → File corrupted or wrong format
```

### Models too large

```bash
# Compress with Draco
gltfpack -i large-model.glb -o compressed.glb

# Reduce texture size
# Use image editor to resize textures to 1024x1024 or smaller
```

### Models wrong size/orientation

In Three.js (AnatomyViewer component):

```tsx
// Scale
model.scale.set(0.1, 0.1, 0.1);

// Rotate (if upside down)
model.rotation.x = Math.PI / 2;

// Position
model.position.set(0, -1, 0);
```

## Resources

- **Z-Anatomy:** https://www.z-anatomy.com/
- **GLTF Spec:** https://www.khronos.org/gltf/
- **Three.js Docs:** https://threejs.org/docs/
- **Sketchfab:** https://sketchfab.com/
- **Blender:** https://www.blender.org/
- **GLTF Validator:** https://github.com/KhronosGroup/glTF-Validator
- **GLTF Pipeline:** https://github.com/CesiumGS/gltf-pipeline

## Next Steps

1. ✅ Read this guide
2. 📥 Download Z-Anatomy models or alternatives
3. 📁 Organize in `public/models/` structure
4. 🔄 Update seed script paths if needed
5. 🧪 Test in application
6. ✍️ Add attribution to UI

Models are optional for development - the app will work without them showing basic shapes!
