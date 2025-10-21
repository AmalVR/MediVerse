# Unity Anatomy Viewer - Command Reference

## Complete list of commands available for the GameManager

This document provides a comprehensive reference of all commands that can be sent from React to Unity for anatomy visualization.

---

## Core Commands

### HighlightPart

Highlights a specific anatomical part in yellow.

**Usage:**

```javascript
sendToUnity("HighlightPart", "femur");
```

**Examples:**

- `HighlightPart("skull")`
- `HighlightPart("humerus")`
- `HighlightPart("heart")`

---

### ShowSystem

Shows all parts belonging to a body system.

**Usage:**

```javascript
sendToUnity("ShowSystem", "skeletal");
```

**Supported Systems:**

- `skeletal` / `skeleton` → Bones
- `muscular` / `muscles` → Muscles
- `circulatory` / `cardiovascular` / `vascular` → Blood vessels & heart
- `nervous` / `neural` → Brain, spinal cord, nerves
- `digestive` / `gastrointestinal` → Digestive organs
- `respiratory` / `pulmonary` → Lungs, airways
- `lymphatic` → Lymph nodes & vessels
- `endocrine` → Glands (pituitary, thyroid, etc.)
- `urinary` / `renal` → Kidneys, bladder
- `reproductive` → Reproductive organs
- `integumentary` / `skin` → Skin

**Examples:**

```javascript
sendToUnity("ShowSystem", "skeletal");
sendToUnity("ShowSystem", "muscular");
sendToUnity("ShowSystem", "cardiovascular");
```

---

### HideSystem

Hides all parts belonging to a body system.

**Usage:**

```javascript
sendToUnity("HideSystem", "muscular");
```

---

### IsolatePart

Shows only the specified part, hiding everything else.

**Usage:**

```javascript
sendToUnity("IsolatePart", "skull");
```

**Examples:**

- `IsolatePart("brain")`
- `IsolatePart("heart")`
- `IsolatePart("spine")`

---

### ShowAll

Makes all body parts visible.

**Usage:**

```javascript
sendToUnity("ShowAll", "");
```

---

### HideAll

Hides all body parts.

**Usage:**

```javascript
sendToUnity("HideAll", "");
```

---

## Camera & View Commands

### RotateToView

Rotates camera to a specific anatomical view.

**Usage:**

```javascript
sendToUnity("RotateToView", "front");
```

**Supported Views:**

- `front` → Anterior view (0°)
- `back` → Posterior view (180°)
- `left` → Left lateral view (-90°)
- `right` → Right lateral view (90°)
- `top` → Superior view (90° pitch)
- `bottom` → Inferior view (-90° pitch)

**Examples:**

```javascript
sendToUnity("RotateToView", "left");
sendToUnity("RotateToView", "top");
```

---

### FocusRegion

Moves camera to focus on a specific body region.

**Usage:**

```javascript
sendToUnity("FocusRegion", "head");
```

**Supported Regions:**

- `head` / `skull` / `cranial` → Head region
- `neck` / `cervical` → Neck region
- `chest` / `thorax` / `thoracic` → Chest region
- `abdomen` / `abdominal` → Abdominal region
- `pelvis` / `pelvic` → Pelvic region
- `arm` / `upper limb` → Arm region
- `leg` / `lower limb` → Leg region

**Examples:**

```javascript
sendToUnity("FocusRegion", "thorax");
sendToUnity("FocusRegion", "abdomen");
```

---

### ResetView

Resets camera to default position and clears all highlights.

**Usage:**

```javascript
sendToUnity("ResetView", "");
```

---

## Visual Effects

### SetTransparency

Sets the transparency (alpha) of a specific part.

**Usage:**

```javascript
sendToUnity("SetTransparency", "skull:0.5");
```

**Format:** `partName:alphaValue`

- `alphaValue`: 0.0 (fully transparent) to 1.0 (fully opaque)

**Examples:**

```javascript
sendToUnity("SetTransparency", "ribs:0.3");
sendToUnity("SetTransparency", "skin:0.1");
sendToUnity("SetTransparency", "skull:0.5");
```

---

### ExplodeView

Separates all parts outward from center (exploded view).

**Usage:**

```javascript
sendToUnity("ExplodeView", "2.0");
```

**Parameter:** Explosion intensity (float)

- `0.0` → No explosion
- `1.0` → Normal separation
- `2.0` → Double separation

**Examples:**

```javascript
sendToUnity("ExplodeView", "1.0");
sendToUnity("ExplodeView", "0.5");
```

---

### CompareParts

Places two parts side by side for comparison.

**Usage:**

```javascript
sendToUnity("CompareParts", "femur:tibia");
```

**Format:** `part1:part2`

**Examples:**

```javascript
sendToUnity("CompareParts", "left_kidney:right_kidney");
sendToUnity("CompareParts", "healthy_lung:diseased_lung");
```

---

## Animation Commands

### StartRotation

Starts continuous rotation around an axis.

**Usage:**

```javascript
sendToUnity("StartRotation", "y");
```

**Supported Axes:**

- `x` → Rotate around X axis (pitch)
- `y` → Rotate around Y axis (yaw)
- `z` → Rotate around Z axis (roll)

---

### StopRotation

Stops all rotation animations.

**Usage:**

```javascript
sendToUnity("StopRotation", "");
```

---

## Common Anatomical Parts (Ontology)

### Skeletal System

**Skull:**

- `skull`
- `cranium`
- `mandible` (jaw)
- `maxilla`
- `frontal_bone`
- `parietal_bone`
- `temporal_bone`
- `occipital_bone`
- `sphenoid_bone`
- `ethmoid_bone`

**Spine:**

- `spine` / `vertebral_column`
- `cervical_vertebrae` (C1-C7)
- `thoracic_vertebrae` (T1-T12)
- `lumbar_vertebrae` (L1-L5)
- `sacrum`
- `coccyx`

**Ribcage:**

- `ribs`
- `sternum`
- `clavicle` (collarbone)
- `scapula` (shoulder blade)

**Upper Limb:**

- `humerus` (upper arm)
- `radius` (forearm)
- `ulna` (forearm)
- `carpals` (wrist bones)
- `metacarpals` (hand bones)
- `phalanges` (finger bones)

**Lower Limb:**

- `pelvis`
- `ilium`
- `ischium`
- `pubis`
- `femur` (thigh bone)
- `patella` (kneecap)
- `tibia` (shin bone)
- `fibula` (calf bone)
- `tarsals` (ankle bones)
- `metatarsals` (foot bones)
- `phalanges` (toe bones)

### Muscular System

**Head & Neck:**

- `temporalis`
- `masseter`
- `sternocleidomastoid`
- `trapezius`

**Trunk:**

- `pectoralis_major`
- `pectoralis_minor`
- `rectus_abdominis`
- `external_oblique`
- `internal_oblique`
- `latissimus_dorsi`
- `erector_spinae`

**Upper Limb:**

- `deltoid`
- `biceps_brachii`
- `triceps_brachii`
- `brachialis`
- `flexor_carpi_radialis`
- `extensor_carpi_radialis`

**Lower Limb:**

- `gluteus_maximus`
- `gluteus_medius`
- `quadriceps_femoris`
- `hamstrings`
- `gastrocnemius`
- `soleus`
- `tibialis_anterior`

### Circulatory System

**Heart:**

- `heart`
- `right_atrium`
- `right_ventricle`
- `left_atrium`
- `left_ventricle`
- `aorta`
- `pulmonary_artery`
- `superior_vena_cava`
- `inferior_vena_cava`

**Major Arteries:**

- `carotid_artery`
- `subclavian_artery`
- `brachial_artery`
- `radial_artery`
- `ulnar_artery`
- `femoral_artery`
- `popliteal_artery`

**Major Veins:**

- `jugular_vein`
- `subclavian_vein`
- `femoral_vein`

### Nervous System

**Central:**

- `brain`
- `cerebrum`
- `cerebellum`
- `brainstem`
- `spinal_cord`

**Peripheral:**

- `brachial_plexus`
- `lumbar_plexus`
- `sciatic_nerve`
- `median_nerve`
- `radial_nerve`
- `ulnar_nerve`

### Digestive System

- `esophagus`
- `stomach`
- `small_intestine`
- `duodenum`
- `jejunum`
- `ileum`
- `large_intestine`
- `cecum`
- `colon`
- `rectum`
- `liver`
- `gallbladder`
- `pancreas`

### Respiratory System

- `nasal_cavity`
- `pharynx`
- `larynx`
- `trachea`
- `bronchi`
- `lungs`
- `left_lung`
- `right_lung`
- `diaphragm`

### Urinary System

- `kidneys`
- `left_kidney`
- `right_kidney`
- `ureters`
- `bladder`
- `urethra`

### Endocrine System

- `pituitary_gland`
- `pineal_gland`
- `thyroid_gland`
- `parathyroid_glands`
- `adrenal_glands`
- `pancreas` (endocrine function)

---

## Voice Command Examples

Here are natural language commands that get translated to Unity commands:

| Voice Command                   | Unity Command                              |
| ------------------------------- | ------------------------------------------ |
| "Show me the femur"             | `HighlightPart("femur")`                   |
| "Highlight the heart"           | `HighlightPart("heart")`                   |
| "Show the skeletal system"      | `ShowSystem("skeletal")`                   |
| "Hide the muscles"              | `HideSystem("muscular")`                   |
| "Isolate the skull"             | `IsolatePart("skull")`                     |
| "Show everything"               | `ShowAll()`                                |
| "Hide all"                      | `HideAll()`                                |
| "Front view"                    | `RotateToView("front")`                    |
| "Rotate to left"                | `RotateToView("left")`                     |
| "Focus on the head"             | `FocusRegion("head")`                      |
| "Make the skull transparent"    | `SetTransparency("skull:0.3")`             |
| "Reset the view"                | `ResetView()`                              |
| "Explode view"                  | `ExplodeView("1.5")`                       |
| "Compare left and right kidney" | `CompareParts("left_kidney:right_kidney")` |

---

## React Integration Example

```typescript
// In UnityAnatomyViewer.tsx or AIInteractivePanel.tsx

// Send command to Unity
const sendToUnity = (command: string, params: string) => {
  if (unityInstance) {
    window.postMessage(
      {
        type: "REACT_TO_UNITY",
        command: command,
        params: params,
      },
      "*"
    );
  }
};

// Handle voice command
const handleVoiceCommand = (transcript: string) => {
  const lower = transcript.toLowerCase();

  if (lower.includes("show") && lower.includes("skeletal")) {
    sendToUnity("ShowSystem", "skeletal");
  } else if (lower.includes("highlight") && lower.includes("femur")) {
    sendToUnity("HighlightPart", "femur");
  } else if (lower.includes("front view")) {
    sendToUnity("RotateToView", "front");
  } else if (lower.includes("focus on head")) {
    sendToUnity("FocusRegion", "head");
  }
};

// Listen for Unity responses
useEffect(() => {
  const handleUnityMessage = (event: MessageEvent) => {
    if (event.data.type === "UNITY_MESSAGE") {
      console.log("Unity response:", event.data.payload);

      // Parse response
      if (event.data.payload.startsWith("HIGHLIGHTED:")) {
        const partName = event.data.payload.split(":")[1];
        toast.success(`Highlighted: ${partName}`);
      }
    }
  };

  window.addEventListener("message", handleUnityMessage);
  return () => window.removeEventListener("message", handleUnityMessage);
}, []);
```

---

## Command Flow Diagram

```
┌─────────────────┐
│  Voice Command  │
│  "Show femur"   │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  Voice Recognition  │
│  (VoiceInput.tsx)   │
└─────────┬───────────┘
          │
          ▼
┌──────────────────────────┐
│  Command Interpreter     │
│  (AIInteractivePanel)    │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  sendToUnity()           │
│  HighlightPart("femur")  │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  window.postMessage()    │
│  type: REACT_TO_UNITY    │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Unity WebGL Template    │
│  index.html listener     │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  unityInstance           │
│  .SendMessage()          │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  GameManager.cs          │
│  HighlightPart(partName) │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Unity Scene Update      │
│  (Part highlighted)      │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  SendMessageToReact()    │
│  "HIGHLIGHTED:femur"     │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  React receives response │
│  Shows toast notification│
└──────────────────────────┘
```

---

## Best Practices

1. **Always check if part exists** before operating on it
2. **Use lowercase** for part names (internally converted)
3. **Cache frequently accessed parts** for better performance
4. **Provide user feedback** for every command
5. **Handle errors gracefully** when parts not found
6. **Log all commands** for debugging

---

## Performance Tips

- Use `IsolatePart` instead of hiding everything manually
- Cache `GameObject` references in dictionaries
- Use `FindObjectsOfType` sparingly (expensive operation)
- Implement object pooling for frequently toggled parts
- Batch multiple show/hide operations when possible

---

## Troubleshooting

### Command not working

1. Check Unity Console for errors
2. Verify GameManager is in scene
3. Check WebGL template is selected
4. Ensure part name matches exactly

### Part not highlighting

1. Verify part has a `Renderer` component
2. Check part is active in hierarchy
3. Try isolating the part first
4. Check console for "NOT_FOUND" message

### Transparency not working

1. Ensure material supports transparency
2. Check shader supports alpha blending
3. Verify alpha value is between 0 and 1

---

## Next Steps

- Implement animation coroutines for smooth transitions
- Add layer system for better part organization
- Create preset views (e.g., "anterior_thorax")
- Add measurement tools
- Implement cross-sectional views
- Add pathology overlays
