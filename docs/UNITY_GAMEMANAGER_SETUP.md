# Unity GameManager Setup Guide

## Quick Setup (5 minutes)

This guide shows you how to add the GameManager script to your Unity Z-Anatomy project so it can communicate with MediVerse React app.

## Step 1: Open Your Unity Project

1. Open **Unity Hub**
2. Open the Z-Anatomy project (PC or Mobile version)
3. Wait for Unity to load

## Step 2: Create GameManager Script

### 2.1 Create the Script File

1. In Unity Editor, find the **Project** panel (usually bottom)
2. Navigate to `Assets/Scripts` folder (or create it if it doesn't exist)
   - Right-click in Project panel → **Create → Folder** → Name it "Scripts"
3. Right-click in `Assets/Scripts` folder
4. Select **Create → C# Script**
5. Name it **GameManager**

### 2.2 Add the Code

1. Double-click `GameManager.cs` to open it in your code editor
2. Replace ALL the code with this:

```csharp
using UnityEngine;
using System.Runtime.InteropServices;
using System.Collections.Generic;

public class GameManager : MonoBehaviour
{
    // Import JavaScript function to send messages to React
    [DllImport("__Internal")]
    private static extern void SendMessageToReact(string message);

    // Singleton instance
    public static GameManager Instance { get; private set; }

    // Dictionary to store body parts
    private Dictionary<string, GameObject> bodyParts = new Dictionary<string, GameObject>();

    // Currently highlighted part
    private GameObject currentHighlightedPart;
    private Color originalColor;
    private Color highlightColor = Color.yellow;

    void Awake()
    {
        // Singleton pattern
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    void Start()
    {
        Debug.Log("GameManager initialized and ready for React commands");
        CacheBodyParts();
    }

    // Cache all body parts for faster lookup
    void CacheBodyParts()
    {
        GameObject[] allObjects = FindObjectsOfType<GameObject>();
        foreach (GameObject obj in allObjects)
        {
            if (obj.name.Contains("bone") || obj.name.Contains("muscle") ||
                obj.name.Contains("organ") || obj.GetComponent<Renderer>() != null)
            {
                bodyParts[obj.name.ToLower()] = obj;
            }
        }
        Debug.Log($"Cached {bodyParts.Count} body parts");
    }

    // ========== CALLED FROM REACT ==========

    // Highlight a specific body part
    public void HighlightPart(string partName)
    {
        Debug.Log($"[React→Unity] HighlightPart: {partName}");

        // Clear previous highlight
        ClearHighlight();

        // Find and highlight new part
        GameObject part = FindPart(partName);
        if (part != null)
        {
            Renderer renderer = part.GetComponent<Renderer>();
            if (renderer != null)
            {
                currentHighlightedPart = part;
                originalColor = renderer.material.color;
                renderer.material.color = highlightColor;

                Debug.Log($"Highlighted: {partName}");
                SendMessageToReact($"HIGHLIGHTED:{partName}");
            }
        }
        else
        {
            Debug.LogWarning($"Part not found: {partName}");
            SendMessageToReact($"NOT_FOUND:{partName}");
        }
    }

    // Show/hide entire body system
    public void ShowSystem(string systemName)
    {
        Debug.Log($"[React→Unity] ShowSystem: {systemName}");

        // Map system names to Unity layer/tag names
        string unitySystemName = MapSystemName(systemName);

        GameObject[] allObjects = FindObjectsOfType<GameObject>();
        int count = 0;

        foreach (GameObject obj in allObjects)
        {
            if (obj.name.ToLower().Contains(unitySystemName.ToLower()))
            {
                obj.SetActive(true);
                count++;
            }
        }

        Debug.Log($"Showed {count} objects for system: {systemName}");
        SendMessageToReact($"SYSTEM_SHOWN:{systemName}:{count}");
    }

    // Hide a body system
    public void HideSystem(string systemName)
    {
        Debug.Log($"[React→Unity] HideSystem: {systemName}");

        string unitySystemName = MapSystemName(systemName);

        GameObject[] allObjects = FindObjectsOfType<GameObject>();
        int count = 0;

        foreach (GameObject obj in allObjects)
        {
            if (obj.name.ToLower().Contains(unitySystemName.ToLower()))
            {
                obj.SetActive(false);
                count++;
            }
        }

        Debug.Log($"Hid {count} objects for system: {systemName}");
        SendMessageToReact($"SYSTEM_HIDDEN:{systemName}:{count}");
    }

    // Rotate camera to view
    public void RotateToView(string viewName)
    {
        Debug.Log($"[React→Unity] RotateToView: {viewName}");

        Camera cam = Camera.main;
        if (cam == null) return;

        Vector3 newRotation = Vector3.zero;

        switch (viewName.ToLower())
        {
            case "front":
                newRotation = new Vector3(0, 0, 0);
                break;
            case "back":
                newRotation = new Vector3(0, 180, 0);
                break;
            case "left":
                newRotation = new Vector3(0, -90, 0);
                break;
            case "right":
                newRotation = new Vector3(0, 90, 0);
                break;
            case "top":
                newRotation = new Vector3(90, 0, 0);
                break;
            case "bottom":
                newRotation = new Vector3(-90, 0, 0);
                break;
        }

        cam.transform.rotation = Quaternion.Euler(newRotation);
        SendMessageToReact($"VIEW_CHANGED:{viewName}");
    }

    // Reset view to default
    public void ResetView()
    {
        Debug.Log("[React→Unity] ResetView");

        ClearHighlight();

        Camera cam = Camera.main;
        if (cam != null)
        {
            cam.transform.position = new Vector3(0, 0, -10);
            cam.transform.rotation = Quaternion.identity;
        }

        SendMessageToReact("VIEW_RESET");
    }

    // ========== CALLED FROM UNITY (Mouse Clicks) ==========

    // Send clicked part to React
    public void OnPartClicked(string partName)
    {
        Debug.Log($"[Unity→React] Part clicked: {partName}");
        SendMessageToReact($"PART_CLICKED:{partName}");
    }

    // ========== HELPER FUNCTIONS ==========

    void ClearHighlight()
    {
        if (currentHighlightedPart != null)
        {
            Renderer renderer = currentHighlightedPart.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.material.color = originalColor;
            }
            currentHighlightedPart = null;
        }
    }

    GameObject FindPart(string partName)
    {
        // Try cached lookup first
        string lowerName = partName.ToLower();
        if (bodyParts.ContainsKey(lowerName))
        {
            return bodyParts[lowerName];
        }

        // Try direct find
        GameObject part = GameObject.Find(partName);
        if (part != null) return part;

        // Try case-insensitive search
        foreach (var kvp in bodyParts)
        {
            if (kvp.Key.Contains(lowerName) || lowerName.Contains(kvp.Key))
            {
                return kvp.Value;
            }
        }

        return null;
    }

    string MapSystemName(string systemName)
    {
        // Map MediVerse system names to Z-Anatomy naming
        switch (systemName.ToLower())
        {
            case "skeletal":
            case "skeleton":
                return "bone";
            case "muscular":
            case "muscles":
                return "muscle";
            case "circulatory":
            case "cardiovascular":
            case "vascular":
                return "vascular";
            case "nervous":
            case "neural":
                return "nerve";
            case "digestive":
            case "gastrointestinal":
                return "digestive";
            case "respiratory":
            case "pulmonary":
                return "respiratory";
            case "lymphatic":
                return "lymph";
            case "endocrine":
                return "gland";
            case "urinary":
            case "renal":
                return "kidney";
            case "reproductive":
                return "reproductive";
            case "integumentary":
            case "skin":
                return "skin";
            default:
                return systemName;
        }
    }

    // ========== ADDITIONAL COMMANDS ==========

    // Isolate a specific part (hide everything else)
    public void IsolatePart(string partName)
    {
        Debug.Log($"[React→Unity] IsolatePart: {partName}");

        GameObject part = FindPart(partName);
        if (part == null)
        {
            SendMessageToReact($"NOT_FOUND:{partName}");
            return;
        }

        // Hide all other objects
        GameObject[] allObjects = FindObjectsOfType<GameObject>();
        foreach (GameObject obj in allObjects)
        {
            if (obj.GetComponent<Renderer>() != null && obj != part)
            {
                obj.SetActive(false);
            }
        }

        part.SetActive(true);
        SendMessageToReact($"ISOLATED:{partName}");
    }

    // Show all body parts
    public void ShowAll()
    {
        Debug.Log("[React→Unity] ShowAll");

        GameObject[] allObjects = FindObjectsOfType<GameObject>();
        foreach (GameObject obj in allObjects)
        {
            obj.SetActive(true);
        }

        SendMessageToReact("SHOW_ALL_COMPLETE");
    }

    // Hide all body parts
    public void HideAll()
    {
        Debug.Log("[React→Unity] HideAll");

        GameObject[] allObjects = FindObjectsOfType<GameObject>();
        foreach (GameObject obj in allObjects)
        {
            if (obj.GetComponent<Renderer>() != null)
            {
                obj.SetActive(false);
            }
        }

        SendMessageToReact("HIDE_ALL_COMPLETE");
    }

    // Set transparency level
    public void SetTransparency(string params)
    {
        // params format: "partName:alphaValue" (e.g., "skull:0.5")
        string[] parts = params.Split(':');
        if (parts.Length != 2) return;

        string partName = parts[0];
        float alpha;
        if (!float.TryParse(parts[1], out alpha)) return;

        Debug.Log($"[React→Unity] SetTransparency: {partName} = {alpha}");

        GameObject part = FindPart(partName);
        if (part != null)
        {
            Renderer renderer = part.GetComponent<Renderer>();
            if (renderer != null)
            {
                Color color = renderer.material.color;
                color.a = Mathf.Clamp01(alpha);
                renderer.material.color = color;

                // Enable transparent rendering
                renderer.material.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.SrcAlpha);
                renderer.material.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
                renderer.material.SetInt("_ZWrite", 0);
                renderer.material.DisableKeyword("_ALPHATEST_ON");
                renderer.material.EnableKeyword("_ALPHABLEND_ON");
                renderer.material.DisableKeyword("_ALPHAPREMULTIPLY_ON");
                renderer.material.renderQueue = 3000;

                SendMessageToReact($"TRANSPARENCY_SET:{partName}:{alpha}");
            }
        }
    }

    // Explode view (separate parts)
    public void ExplodeView(string intensity)
    {
        float explodeAmount;
        if (!float.TryParse(intensity, out explodeAmount))
        {
            explodeAmount = 1.0f;
        }

        Debug.Log($"[React→Unity] ExplodeView: {explodeAmount}");

        GameObject[] allObjects = FindObjectsOfType<GameObject>();
        foreach (GameObject obj in allObjects)
        {
            if (obj.GetComponent<Renderer>() != null)
            {
                // Move object away from origin
                Vector3 direction = obj.transform.position.normalized;
                obj.transform.position += direction * explodeAmount;
            }
        }

        SendMessageToReact($"EXPLODE_VIEW:{explodeAmount}");
    }

    // Focus on specific region
    public void FocusRegion(string regionName)
    {
        Debug.Log($"[React→Unity] FocusRegion: {regionName}");

        // Map region names to positions
        Vector3 focusPosition = Vector3.zero;

        switch (regionName.ToLower())
        {
            case "head":
            case "skull":
            case "cranial":
                focusPosition = new Vector3(0, 8, 0);
                break;
            case "neck":
            case "cervical":
                focusPosition = new Vector3(0, 6, 0);
                break;
            case "chest":
            case "thorax":
            case "thoracic":
                focusPosition = new Vector3(0, 4, 0);
                break;
            case "abdomen":
            case "abdominal":
                focusPosition = new Vector3(0, 2, 0);
                break;
            case "pelvis":
            case "pelvic":
                focusPosition = new Vector3(0, 0, 0);
                break;
            case "arm":
            case "upper limb":
                focusPosition = new Vector3(3, 4, 0);
                break;
            case "leg":
            case "lower limb":
                focusPosition = new Vector3(1, -3, 0);
                break;
        }

        Camera cam = Camera.main;
        if (cam != null)
        {
            cam.transform.position = focusPosition + new Vector3(0, 0, -5);
            cam.transform.LookAt(focusPosition);
        }

        SendMessageToReact($"REGION_FOCUSED:{regionName}");
    }

    // Animate rotation
    public void StartRotation(string axis)
    {
        Debug.Log($"[React→Unity] StartRotation: {axis}");
        // Implementation would require a coroutine or Update loop
        SendMessageToReact($"ROTATION_STARTED:{axis}");
    }

    public void StopRotation()
    {
        Debug.Log("[React→Unity] StopRotation");
        SendMessageToReact("ROTATION_STOPPED");
    }

    // Compare two parts (side by side or overlay)
    public void CompareParts(string params)
    {
        // params format: "part1:part2"
        string[] parts = params.Split(':');
        if (parts.Length != 2) return;

        Debug.Log($"[React→Unity] CompareParts: {parts[0]} vs {parts[1]}");

        GameObject part1 = FindPart(parts[0]);
        GameObject part2 = FindPart(parts[1]);

        if (part1 != null && part2 != null)
        {
            // Position them side by side
            part1.transform.position = new Vector3(-2, 0, 0);
            part2.transform.position = new Vector3(2, 0, 0);

            SendMessageToReact($"COMPARING:{parts[0]}:{parts[1]}");
        }
    }
}
```

3. **Save** the file (Ctrl+S / Cmd+S)
4. Go back to Unity Editor - it will auto-compile

## Step 3: Add GameManager to Scene

### 3.1 Create GameObject

1. In Unity **Hierarchy** panel (usually left side)
2. Right-click → **Create Empty**
3. Rename it to **GameManager**

### 3.2 Attach Script

1. Select the **GameManager** object in Hierarchy
2. In **Inspector** panel (usually right side)
3. Click **Add Component**
4. Type "GameManager" and select it
5. The script is now attached!

### 3.3 Verify

In the Inspector, you should see:

- GameManager (Script)
- Script: GameManager

## Step 4: Create WebGL Template (For React Communication)

### 4.1 Create Template Folder

1. In Project panel, navigate to `Assets` folder
2. Right-click → **Create → Folder** → Name it **WebGLTemplates**
3. Inside WebGLTemplates, create another folder: **MediVerse**

### 4.2 Create index.html

1. In `Assets/WebGLTemplates/MediVerse/`
2. Right-click → **Create → Text File**
3. Name it **index.html**
4. Double-click to edit, paste this:

```html
<!DOCTYPE html>
<html lang="en-us">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, user-scalable=no"
    />
    <title>{{{ PRODUCT_NAME }}}</title>
    <style>
      body {
        margin: 0;
        padding: 0;
      }
      #unity-container {
        width: 100%;
        height: 100vh;
      }
      #unity-canvas {
        width: 100%;
        height: 100%;
      }
    </style>

    <script>
      // Function Unity can call to send messages to React
      function SendMessageToReact(message) {
        console.log("[Unity→React]", message);

        // Post message to parent window (React)
        if (window.parent) {
          window.parent.postMessage(
            {
              type: "UNITY_MESSAGE",
              payload: message,
            },
            "*"
          );
        }
      }

      // Listen for messages from React
      window.addEventListener("message", function (event) {
        if (event.data && event.data.type === "REACT_TO_UNITY") {
          console.log("[React→Unity]", event.data);

          // Get Unity instance (will be available after Unity loads)
          if (window.unityInstance) {
            var command = event.data.command;
            var params = event.data.params || "";

            // Call Unity function
            window.unityInstance.SendMessage("GameManager", command, params);
          }
        }
      });
    </script>
  </head>
  <body>
    <div id="unity-container">
      <canvas id="unity-canvas"></canvas>
    </div>
    {{{ UNITY_WEBGL_LOADER_GLUE }}}
  </body>
</html>
```

5. Save the file

### 4.3 Select Template in Build Settings

1. Go to **Edit → Project Settings**
2. Select **Player** in left sidebar
3. Find **Resolution and Presentation** section
4. Under **WebGL Template**, select **MediVerse**

## Step 5: Configure Build Settings

1. **File → Build Settings**
2. Select **WebGL** platform
3. Click **Switch Platform** (if not already)
4. Click **Player Settings**

### Recommended Settings:

**Resolution and Presentation:**

- Default Canvas Width: 1920 (PC) or 1280 (Mobile)
- Default Canvas Height: 1080 (PC) or 720 (Mobile)
- Run In Background: ✅ Enabled

**Publishing Settings:**

- Compression Format: **Gzip** (smaller) or **Disabled** (faster)
- Enable Exceptions: **None** (reduces size)

**Other Settings:**

- Strip Engine Code: ✅ Enabled
- Managed Stripping Level: **Medium** or **High**

## Step 6: Build

1. **File → Build Settings**
2. Click **Build**
3. Navigate to: `/Users/avr/dev-external/MediVerse/public/unity/pc-build`
   - Create the folder if it doesn't exist
4. Click **Select Folder**
5. Wait 5-15 minutes for build to complete

## Step 7: Test in MediVerse

```bash
cd /Users/avr/dev-external/MediVerse
npm run dev
```

1. Open http://localhost:5173
2. Go to Teacher page
3. Toggle Unity viewer
4. Open browser console (F12)
5. Try voice commands like "highlight femur"
6. You should see console logs:
   - `[React→Unity] HighlightPart: femur`
   - `[Unity→React] HIGHLIGHTED:femur`

## Common Issues

### "GameManager" script not found

- Make sure script is saved in `Assets/Scripts/GameManager.cs`
- Wait for Unity to compile (check bottom-right corner)
- Click **Assets → Refresh**

### Build fails

- Check **Console** panel in Unity for errors
- Make sure WebGL module is installed in Unity Hub
- Try **Edit → Clear All PlayerPrefs**

### Unity doesn't load in browser

- Check browser console for errors
- Verify files exist in `public/unity/pc-build/Build/`
- Check CORS (run from same localhost)

### SendMessageToReact not working

- Make sure you selected **MediVerse** WebGL template
- Rebuild the project
- Check browser console for `[Unity→React]` messages

## Next Steps

After Unity build is working:

1. Test all voice commands (highlight, show system, etc.)
2. Build mobile version (same steps, different branch)
3. Connect to real-time session sync
4. Add visual feedback for highlights

## Need Help?

- Check Unity Console for errors (Window → General → Console)
- Check browser DevTools console (F12)
- Look for `[Unity→React]` and `[React→Unity]` log messages
- Read full build guide: `docs/UNITY_BUILD_GUIDE.md`
