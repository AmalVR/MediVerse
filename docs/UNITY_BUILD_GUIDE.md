# Unity Z-Anatomy Build Guide

## Overview

This guide explains how to build Z-Anatomy Unity project for WebGL (both PC and Mobile versions) and integrate them into MediVerse.

**Repository:** [https://github.com/LluisV/Z-Anatomy](https://github.com/LluisV/Z-Anatomy)

## Prerequisites

1. **Unity Hub** - Download from [unity.com](https://unity.com/download)
2. **Unity Editor 2021.3 LTS** (or compatible version)
3. **WebGL Build Support** module installed

## Step 1: Clone Z-Anatomy Repository

Already done:

```bash
cd /Users/avr/dev-external
git clone https://github.com/LluisV/Z-Anatomy.git
```

## Step 2: Build PC Version

### 2.1 Open PC Project in Unity

```bash
cd Z-Anatomy
git checkout PC-Version
```

1. Open **Unity Hub**
2. Click "Add" → Select `/Users/avr/dev-external/Z-Anatomy/Z-Anatomy PC` folder
3. Open the project

### 2.2 Configure WebGL Build Settings

1. **File → Build Settings**
2. Select **WebGL** platform
3. Click **Switch Platform**
4. Click **Player Settings**

In Player Settings:

- **Resolution and Presentation:**
  - Default Canvas Width: 1920
  - Default Canvas Height: 1080
  - Run In Background: ✅ Enabled
- **Publishing Settings:**
  - Compression Format: **Disabled** (to avoid WASM issues)
  - Or use **Gzip** (smaller but slower)
- **Other Settings:**
  - Strip Engine Code: ✅ Enabled (reduces size)

### 2.3 Build

1. **File → Build Settings**
2. Click **Build**
3. Select output folder: `/Users/avr/dev-external/MediVerse/public/unity/pc-build`
4. Wait for build to complete (5-15 minutes)

## Step 3: Build Mobile Version

### 3.1 Open Mobile Project

```bash
cd Z-Anatomy
git checkout Mobile-Version
```

1. In Unity Hub: Click "Add"
2. Select `/Users/avr/dev-external/Z-Anatomy` folder (root, not subfolder)
3. Open the project

### 3.2 Configure WebGL Build Settings

Same as PC version but with mobile optimizations:

**Player Settings:**

- **Resolution and Presentation:**
  - Default Canvas Width: 1280
  - Default Canvas Height: 720
- **Quality Settings:**
  - Reduce quality level for better performance
- **Publishing Settings:**
  - Compression Format: **Gzip**

### 3.3 Build

1. **File → Build Settings**
2. Click **Build**
3. Select output folder: `/Users/avr/dev-external/MediVerse/public/unity/mobile-build`
4. Wait for build to complete

## Step 4: Verify Build Output

Check that these files exist:

### PC Build:

```
public/unity/pc-build/
├── Build/
│   ├── pc-build.data
│   ├── pc-build.framework.js
│   ├── pc-build.loader.js
│   └── pc-build.wasm
├── Build/
└── index.html
```

### Mobile Build:

```
public/unity/mobile-build/
├── Build/
│   ├── mobile-build.data
│   ├── mobile-build.framework.js
│   ├── mobile-build.loader.js
│   └── mobile-build.wasm
└── index.html
```

## Step 5: Update Build Paths (If Needed)

If Unity names the build files differently, update paths in:

**`src/components/UnityAnatomyViewer.tsx`:**

```typescript
const { unityProvider } = useUnityContext({
  loaderUrl: `${buildPath}/Build/<actual-name>.loader.js`,
  dataUrl: `${buildPath}/Build/<actual-name>.data`,
  frameworkUrl: `${buildPath}/Build/<actual-name>.framework.js`,
  codeUrl: `${buildPath}/Build/<actual-name>.wasm`,
});
```

## Step 6: Test Integration

```bash
# Start MediVerse dev server
cd /Users/avr/dev-external/MediVerse
npm run dev
```

1. Open http://localhost:5173
2. Go to Teacher dashboard
3. Start a session
4. Click "Unity" viewer toggle
5. Unity should load and display anatomy

## Unity-React Communication Setup

### In Unity (C# Scripts):

Create `GameManager.cs`:

```csharp
using UnityEngine;
using System.Runtime.InteropServices;

public class GameManager : MonoBehaviour
{
    // Import JavaScript function
    [DllImport("__Internal")]
    private static extern void SendMessageToReact(string message);

    // Called from React
    public void HighlightPart(string partName)
    {
        Debug.Log("Highlighting: " + partName);
        // Implement highlighting logic
        FindAndHighlight(partName);
    }

    public void ShowSystem(string systemName)
    {
        Debug.Log("Showing system: " + systemName);
        // Implement show system logic
    }

    // Send message to React
    public void OnPartClicked(string partName)
    {
        SendMessageToReact(partName);
    }

    void FindAndHighlight(string partName)
    {
        GameObject part = GameObject.Find(partName);
        if (part != null)
        {
            // Apply highlight material/effect
            Renderer renderer = part.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.material.color = Color.yellow;
            }
        }
    }
}
```

### In Unity WebGL Template:

Create `Assets/WebGLTemplates/MediVerse/index.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <script>
      // Function Unity can call
      function SendMessageToReact(message) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(message);
        }
        // For regular web
        window.parent.postMessage(
          {
            type: "UNITY_PART_CLICKED",
            partName: message,
          },
          "*"
        );
      }
    </script>
  </head>
  <body>
    <div id="unity-container"></div>
    {{{ UNITY_WEBGL_LOADER_GLUE }}}
  </body>
</html>
```

## Troubleshooting

### Build is too large (>50MB)

**Solutions:**

1. Enable **Strip Engine Code** in Player Settings
2. Use **Code Stripping** Level: High
3. Disable unused modules in **Player Settings → Other Settings → Managed Stripping Level**
4. Use **Gzip** or **Brotli** compression

### Unity doesn't load in browser

**Check:**

1. Browser console for errors
2. Network tab - are files loading?
3. CORS headers (run from same origin)
4. File paths are correct

### WASM out of memory

**Solution:**

- Build Unity with **Non-WASM** backend (if available)
- Or use **Memory Size** limit in Player Settings
- Reduce texture quality
- Use lower poly models

## File Sizes

Expected sizes after build:

| Build Type     | Uncompressed | Gzip    | Brotli  |
| -------------- | ------------ | ------- | ------- |
| PC Version     | 40-60MB      | 15-25MB | 12-20MB |
| Mobile Version | 30-50MB      | 12-20MB | 10-18MB |

## Platform Detection

The app automatically detects device type and loads:

- **PC Build** → Desktop browsers
- **Mobile Build** → Mobile & tablet devices

See `src/lib/platform-detect.ts` for detection logic.

## Next Steps

1. ✅ Install Unity Hub & Editor
2. ✅ Clone Z-Anatomy repo
3. ⬜ Build PC version
4. ⬜ Build Mobile version
5. ⬜ Test in MediVerse
6. ⬜ Add Unity C# scripts for React communication
7. ⬜ Integrate with voice commands
8. ⬜ Connect to session sync

## Resources

- [Unity WebGL Documentation](https://docs.unity3d.com/Manual/webgl.html)
- [react-unity-webgl Docs](https://www.npmjs.com/package/react-unity-webgl)
- [Z-Anatomy GitHub](https://github.com/LluisV/Z-Anatomy)
- [Unity-React Communication](https://docs.unity3d.com/Manual/webgl-interactingwithbrowserscripting.html)
