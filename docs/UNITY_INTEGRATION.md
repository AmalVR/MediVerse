# Unity Z-Anatomy Integration Guide

## Overview

Z-Anatomy is an open-source Unity-based 3D anatomy visualizer that can be integrated into MediVerse as an alternative to the current Three.js implementation.

**Source:** [Z-Anatomy on itch.io](https://lluisv.itch.io/z-anatomy)

## Benefits of Unity Approach

✅ **Pre-built visualizer** - No need to build from scratch  
✅ **Proven performance** - Already optimized for anatomy viewing  
✅ **Rich interactions** - Rotation, zoom, part selection built-in  
✅ **Cross-platform** - WebGL, Android support  
✅ **Open source** - Can be customized

## Integration Options

### Option 1: Embed Unity WebGL Build (Recommended)

**Steps:**

1. **Get Z-Anatomy Source**

   ```bash
   # Clone the GitHub repository (mentioned on itch.io)
   git clone https://github.com/[Z-Anatomy-Repo]
   # Check the itch.io page for the actual GitHub link
   ```

2. **Build for WebGL**

   ```
   Unity → File → Build Settings
   Platform: WebGL
   Build and Run
   ```

3. **Integrate in React**

   ```typescript
   // src/components/UnityAnatomyViewer.tsx
   import { Unity, useUnityContext } from "react-unity-webgl";

   export function UnityAnatomyViewer() {
     const { unityProvider, sendMessage, addEventListener } = useUnityContext({
       loaderUrl: "/unity/Build.loader.js",
       dataUrl: "/unity/Build.data",
       frameworkUrl: "/unity/Build.framework.js",
       codeUrl: "/unity/Build.wasm",
     });

     // Send commands to Unity
     const highlightPart = (partName: string) => {
       sendMessage("GameManager", "HighlightPart", partName);
     };

     // Receive events from Unity
     addEventListener("PartClicked", (partName) => {
       console.log("Part clicked:", partName);
     });

     return (
       <Unity
         unityProvider={unityProvider}
         style={{ width: "100%", height: "100%" }}
       />
     );
   }
   ```

4. **Install Unity React Package**
   ```bash
   npm install react-unity-webgl
   ```

### Option 2: Use Unity as Iframe

**Simpler but less integrated:**

```typescript
// src/components/UnityIframeViewer.tsx
export function UnityIframeViewer() {
  return (
    <iframe
      src="/unity-build/index.html"
      style={{ width: "100%", height: "100%", border: "none" }}
      title="Z-Anatomy Viewer"
    />
  );
}
```

### Option 3: Hybrid Approach

Keep Three.js for simple views, use Unity for complex anatomy:

```typescript
const [viewerType, setViewerType] = useState<"threejs" | "unity">("threejs");

return viewerType === "unity" ? (
  <UnityAnatomyViewer />
) : (
  <AnatomyViewer /> // Current Three.js viewer
);
```

## Communication with Unity

### From React to Unity

```typescript
// Send commands
sendMessage("GameManager", "ShowSystem", "cardiovascular");
sendMessage("GameManager", "HidePart", "left_lung");
sendMessage("GameManager", "SetOpacity", "0.5");
sendMessage(
  "GameManager",
  "RotateModel",
  JSON.stringify({ x: 45, y: 0, z: 0 })
);
```

### From Unity to React

```csharp
// In Unity C# script
public class GameManager : MonoBehaviour
{
    public void OnPartClicked(string partName)
    {
        // Send to React
        Application.ExternalCall("PartClicked", partName);
    }
}
```

```typescript
// In React
addEventListener("PartClicked", (partName: string) => {
  setSelectedPart(partName);
  // Trigger voice feedback, update UI, etc.
});
```

## Advantages Over Current Three.js Approach

### Performance

- ✅ **No WASM memory issues** - Unity handles DRACO natively
- ✅ **Optimized rendering** - Built-in Unity optimizations
- ✅ **Better LOD handling** - Unity's LOD system

### Features

- ✅ **Pre-built interactions** - Don't need to code raycasting, highlighting, etc.
- ✅ **Animation support** - Unity's animation system
- ✅ **Advanced shaders** - Better visual effects

### Development

- ✅ **Visual editor** - Configure in Unity Editor vs code
- ✅ **Faster iteration** - Change in Unity, rebuild, refresh
- ✅ **Proven codebase** - Already tested and working

## Disadvantages

### Bundle Size

- ❌ **Larger build** - Unity WebGL is 10-50MB (vs 2-5MB for Three.js)
- ❌ **Longer load time** - Initial load is slower

### Integration

- ❌ **Less React-native** - Not as seamlessly integrated
- ❌ **Communication overhead** - Message passing between React and Unity

### Customization

- ❌ **Need Unity skills** - Requires Unity/C# knowledge for changes
- ❌ **Build process** - Extra step to build Unity project

## Recommended Approach

### For MediVerse:

**Phase 1: Quick Win (Now)**

- Use current Three.js with single-system loading workaround
- Load one system at a time to avoid WASM errors
- Browser caching provides fast subsequent loads

**Phase 2: Unity Integration (Next)**

1. Clone Z-Anatomy Unity project
2. Build for WebGL
3. Create React wrapper component
4. Implement React ↔ Unity communication
5. Integrate with voice commands & session sync

**Phase 3: Hybrid (Future)**

- Simple views: Three.js (lightweight)
- Complex anatomy: Unity (feature-rich)
- User can toggle between viewers

## File Structure

```
MediVerse/
├── public/
│   └── unity-build/          # Unity WebGL build output
│       ├── Build/
│       │   ├── Build.data
│       │   ├── Build.framework.js
│       │   ├── Build.loader.js
│       │   └── Build.wasm
│       └── index.html
├── src/
│   └── components/
│       ├── AnatomyViewer.tsx           # Current Three.js viewer
│       ├── UnityAnatomyViewer.tsx      # New Unity viewer
│       └── HybridViewer.tsx            # Toggles between both
```

## Implementation Checklist

- [ ] Clone Z-Anatomy repository from GitHub
- [ ] Open project in Unity
- [ ] Configure WebGL build settings
- [ ] Build for WebGL
- [ ] Install `react-unity-webgl` package
- [ ] Create React wrapper component
- [ ] Implement message passing
- [ ] Test part selection & highlighting
- [ ] Integrate with voice commands
- [ ] Connect to session sync (WebSocket)
- [ ] Add loading states & error handling

## Voice Command Integration

```typescript
// In Teacher.tsx
const handleVoiceCommand = async (command: {
  action: string;
  target: string;
}) => {
  // Send to Unity viewer
  if (viewerType === "unity") {
    sendMessage("GameManager", "HandleVoiceCommand", JSON.stringify(command));
  } else {
    // Current Three.js handling
    setHighlightedPart(command.target);
  }
};
```

## Session Sync with Unity

```typescript
// Unity viewer receives session updates
sessionSync.on("VIEWER_STATE_CHANGE", (state) => {
  if (viewerType === "unity") {
    sendMessage("GameManager", "SyncState", JSON.stringify(state));
  }
});
```

## Next Steps

1. **Find Z-Anatomy GitHub repo** (check itch.io page or search "Z-Anatomy GitHub")
2. **Review Unity project structure**
3. **Test local WebGL build**
4. **Create proof-of-concept React integration**
5. **Compare performance with Three.js approach**

## Resources

- [Z-Anatomy itch.io](https://lluisv.itch.io/z-anatomy)
- [Z-Anatomy GitHub](https://github.com/) (find actual repo)
- [react-unity-webgl docs](https://www.npmjs.com/package/react-unity-webgl)
- [Unity WebGL docs](https://docs.unity3d.com/Manual/webgl.html)

## Decision Matrix

| Criteria          | Three.js (Current) | Unity Z-Anatomy | Recommendation |
| ----------------- | ------------------ | --------------- | -------------- |
| **Setup Time**    | ✅ Already done    | ❌ 1-2 days     | Three.js       |
| **Performance**   | ⚠️ WASM issues     | ✅ Optimized    | Unity          |
| **Bundle Size**   | ✅ Small (5MB)     | ❌ Large (30MB) | Three.js       |
| **Features**      | ⚠️ Basic           | ✅ Rich         | Unity          |
| **Customization** | ✅ Full control    | ⚠️ Need Unity   | Three.js       |
| **Maintenance**   | ✅ Our code        | ⚠️ Upstream     | Three.js       |

**Verdict:** Use Three.js for now with workarounds, evaluate Unity for v2.0
