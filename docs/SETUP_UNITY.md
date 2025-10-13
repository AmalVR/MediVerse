# Unity Z-Anatomy Setup Guide

## Prerequisites

- Unity Hub installed
- Unity 2021.3 LTS with WebGL Build Support
- Z-Anatomy repository cloned

## Quick Start

### 1. Install Unity Hub

```bash
brew install --cask unity-hub
```

### 2. Install Unity Editor

1. Open Unity Hub
2. Go to "Installs" tab
3. Click "Install Editor"
4. Select **Unity 2021.3 LTS**
5. Check modules:
   - ✅ WebGL Build Support
   - ✅ Mac Build Support (macOS)
6. Click Install (~10 min)

### 3. Add Z-Anatomy Project

1. Unity Hub → "Projects" tab
2. Click "Add"
3. Select: `/path/to/Z-Anatomy/Z-Anatomy PC`
4. Open project (~2-3 min first time)

### 4. Build for WebGL

#### Configure Build Settings:

1. **File → Build Settings** (`Cmd+Shift+B`)
2. Select **WebGL** in platform list
3. Click **"Switch Platform"** (if not already)
4. Click **"Player Settings..."**

#### Player Settings:

**Publishing Settings:**

- Compression Format: **Disabled** (avoids WASM issues)
- Or: **Gzip** (smaller, slower)

**Other Settings:**

- Strip Engine Code: ✅ Enabled
- Code Stripping Level: High

#### Build:

1. Close Player Settings
2. Click **"Build"**
3. Save to: `/path/to/MediVerse/public/unity/pc-build`
4. Wait 5-15 minutes ☕

### 5. Verify Build

```bash
ls -la public/unity/pc-build/Build/

# Should contain:
# - pc-build.loader.js
# - pc-build.data.unityweb
# - pc-build.framework.js.unityweb
# - pc-build.wasm.unityweb
```

### 6. Test

```bash
npm run dev
# Open http://localhost:8080
# Go to Teacher dashboard
# Unity viewer loads with correct anatomy!
```

## Mobile Build (Optional)

For mobile/tablet optimization:

1. Checkout Mobile-Version branch in Z-Anatomy
2. Follow same build steps
3. Save to: `public/unity/mobile-build/`
4. Platform detection auto-switches

## Troubleshooting

### "WebGL platform not available"

→ Install WebGL Build Support module in Unity Hub

### "Switch Platform" grayed out

→ Already selected (proceed to build)

### Build too large (>50MB)

→ Enable "Strip Engine Code" and use High code stripping

### Unity crashes during build

→ Close other apps, free up RAM

## File Structure

```
public/unity/
├── pc-build/           # Desktop WebGL build
│   └── Build/
│       ├── *.loader.js
│       ├── *.data.unityweb
│       ├── *.framework.js.unityweb
│       └── *.wasm.unityweb
└── mobile-build/       # Mobile WebGL build (optional)
    └── Build/
```

## Expected Timeline

- Install Unity Hub: 5 min
- Install Unity Editor: 10 min
- Open Project: 3 min
- Configure & Build: 10 min
- **Total: ~30 minutes**
