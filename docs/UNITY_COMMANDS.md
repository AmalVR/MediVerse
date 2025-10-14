# Unity Command System Documentation

## Architecture Overview

The Unity command system follows **SOLID principles** and uses clean separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      Teacher/Student UI                      │
│                 (React Components)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ executeCommand(UnityCommand)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│             UnityAnatomyViewer Component                     │
│  Exposes: IUnityViewerHandle via forwardRef                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Delegates to
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            UnityCommandExecutor                              │
│  - Validates commands                                        │
│  - Maps actions to Unity methods                            │
│  - Executes via sendMessage()                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ sendMessage(gameObject, method, param)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Unity WebGL Instance                            │
│  GameManager GameObject with methods:                        │
│  - ShowSystem, HideSystem, HighlightPart, etc.             │
└─────────────────────────────────────────────────────────────┘
```

## SOLID Principles Applied

### 1. Single Responsibility Principle (SRP)

Each class/module has ONE reason to change:

- **`UnityCommandExecutor`**: Only responsible for executing Unity commands
- **`UnityAnatomyViewer`**: Only responsible for rendering Unity and exposing command interface
- **`Teacher/Student`** components: Only responsible for UI and coordination

### 2. Open/Closed Principle (OCP)

The system is open for extension, closed for modification:

- **Add new commands**: Just add to `UNITY_METHOD_MAP` in `types/unity.ts`
- **Add new command types**: Extend the mapping, no changes to executor logic

### 3. Liskov Substitution Principle (LSP)

Interfaces can be substituted:

- Any component implementing `IUnityViewerHandle` can be used
- Any executor implementing `IUnityCommandExecutor` can be swapped

### 4. Interface Segregation Principle (ISP)

Clients only depend on methods they use:

- `IUnityViewerHandle` exposes minimal API (3 methods only)
- Consumers don't need to know about Unity internals

### 5. Dependency Inversion Principle (DIP)

High-level modules depend on abstractions:

- Teacher/Student depend on `IUnityViewerHandle`, not concrete implementation
- `UnityCommandExecutor` depends on `SendMessageFn` type, not react-unity-webgl directly

## File Structure

```
src/
├── types/
│   └── unity.ts                      # Type definitions and interfaces
├── lib/
│   └── unity/
│       └── UnityCommandExecutor.ts   # Command execution logic
├── components/
│   └── UnityAnatomyViewer.tsx        # Unity viewer component
└── pages/
    ├── Teacher.tsx                   # Teacher interface
    └── Student.tsx                   # Student interface
```

## Available Commands

| Action             | Unity Method      | Description                    | Example                                    |
| ------------------ | ----------------- | ------------------------------ | ------------------------------------------ |
| `show` / `enable`  | `ShowSystem`      | Show an anatomical system      | `{ action: "show", target: "skeletal" }`   |
| `hide` / `disable` | `HideSystem`      | Hide an anatomical system      | `{ action: "hide", target: "muscular" }`   |
| `highlight`        | `HighlightPart`   | Highlight a specific part      | `{ action: "highlight", target: "femur" }` |
| `isolate`          | `IsolateSystem`   | Isolate a system (hide others) | `{ action: "isolate", target: "nervous" }` |
| `reset`            | `ResetView`       | Reset to default view          | `{ action: "reset", target: "" }`          |
| `rotate`           | `RotateView`      | Rotate the view                | `{ action: "rotate", target: "left" }`     |
| `zoom`             | `ZoomView`        | Zoom in/out                    | `{ action: "zoom", target: "in" }`         |
| `transparency`     | `SetTransparency` | Set transparency level         | `{ action: "transparency", target: "50" }` |

## Usage Examples

### From Teacher Component

```typescript
// Get Unity ref
const unityRef = useRef<IUnityViewerHandle>(null);

// Execute command
const handleCommand = (action: string, target: string) => {
  if (!unityRef.current) {
    console.error("Unity not ready");
    return;
  }

  const result = unityRef.current.executeCommand({ action, target });

  if (!result.success) {
    console.error("Command failed:", result.error);
  }
};

// Example: Show skeletal system
handleCommand("show", "skeletal");

// Example: Highlight specific bone
handleCommand("highlight", "skull");

// Example: Zoom in
handleCommand("zoom", "in");
```

### From Voice Commands (AIInteractivePanel)

The AI panel sends commands through the `onCommand` callback:

```typescript
<AIInteractivePanel onCommand={(cmd) => handleVoiceCommand(cmd)} />
```

Commands flow: **Voice/Text Input → AI Processing → Command → Teacher → Unity**

### From Student View (Synced)

Students receive commands via WebSocket:

```typescript
useEffect(() => {
  sessionSync.onViewerStateUpdate((state: ViewerState) => {
    if (state.command && unityRef.current) {
      unityRef.current.executeCommand(state.command);
    }
  });
}, []);
```

Commands flow: **Teacher → WebSocket → Student → Unity**

## Command Validation

The `UnityCommandExecutor` validates commands before execution:

```typescript
const result = executor.executeCommand({ action: "invalid", target: "test" });

if (!result.success) {
  console.log(result.error);
  // "Unknown command action: invalid"
}
```

Validation checks:

1. ✅ Unity is loaded
2. ✅ Action is in `UNITY_METHOD_MAP`
3. ✅ Target is provided (except for 'reset')

## Error Handling

The system provides comprehensive error feedback:

```typescript
interface UnityCommandResult {
  success: boolean;
  command: UnityCommand;
  error?: string;
}

// Example responses:
// ✅ Success
{ success: true, command: { action: "show", target: "skeletal" } }

// ❌ Unity not ready
{ success: false, command: {...}, error: "Unity is not loaded yet..." }

// ❌ Invalid action
{ success: false, command: {...}, error: "Unknown command action: xyz" }
```

## Adding New Commands

To add a new command type:

### 1. Add to Unity Method Map

```typescript
// src/types/unity.ts
export const UNITY_METHOD_MAP: Record<string, UnityMethodMapping> = {
  // ... existing commands
  slice: { gameObject: "GameManager", method: "SliceModel" },
};
```

### 2. (Optional) Add Type Hint

```typescript
// src/types/unity.ts
export type UnityAction =
  | "show"
  | "hide"
  // ... existing actions
  | "slice"; // Add your new action
```

### 3. Implement in Unity

In your Unity `GameManager.cs`:

```csharp
public void SliceModel(string axis) {
    // Implementation
    Debug.Log($"Slicing model on axis: {axis}");
}
```

That's it! No changes needed to the executor or viewer components.

## Testing

### Manual Testing in Browser Console

```javascript
// After getting a reference to the viewer
const command = { action: "show", target: "skeletal" };

// In Teacher view:
// The unityRef is internal, but you can test via voice commands

// Type in the AI chat:
("Show the skeletal system");
("Highlight the femur");
("Zoom in");
("Reset view");
```

### Integration Tests

See `tests/e2e/teacher.spec.ts` for examples of testing Unity commands:

```typescript
test("should execute Unity commands", async ({ page }) => {
  // Type command in AI chat
  await page.fill('[placeholder*="anatomy"]', "show skeletal system");
  await page.click('[aria-label="Send"]');

  // Verify command executed
  await expect(page.locator(".toast")).toContainText("Command executed");
});
```

## Debugging

Enable detailed logging by checking the browser console:

```
[Teacher] Voice command received: {action: "show", target: "skeletal"}
[UnityCommandExecutor] Executing: GameManager.ShowSystem("skeletal")
[Teacher] Command executed: show skeletal
```

Look for these log prefixes:

- `[Teacher]` - Teacher component actions
- `[Student]` - Student component actions
- `[UnityCommandExecutor]` - Command execution details
- `[Unity]` - Messages from Unity itself (if configured)

## Best Practices

1. **Always check if Unity is loaded**

   ```typescript
   if (!unityRef.current) {
     // Show error to user
     return;
   }
   ```

2. **Handle command results**

   ```typescript
   const result = unityRef.current.executeCommand(command);
   if (!result.success) {
     // Show error toast
   }
   ```

3. **Use TypeScript types**

   ```typescript
   const ref = useRef<IUnityViewerHandle>(null); // ✅ Typed
   const ref = useRef(null); // ❌ Untyped
   ```

4. **Validate before sending**
   ```typescript
   if (!command.action || !command.target) {
     return; // Don't send invalid commands
   }
   ```

## Troubleshooting

| Issue                   | Solution                                    |
| ----------------------- | ------------------------------------------- |
| "Unity not ready" error | Wait for `isLoaded()` to return true        |
| Command not executing   | Check browser console for validation errors |
| Unknown command action  | Verify action exists in `UNITY_METHOD_MAP`  |
| Student not syncing     | Check WebSocket connection status           |
| Type errors             | Ensure proper imports from `@/types/unity`  |

## Future Enhancements

Potential improvements following SOLID:

1. **Command Queue** - Queue commands when Unity is loading
2. **Command History** - Undo/Redo functionality
3. **Batch Commands** - Execute multiple commands at once
4. **Command Macros** - Combine commands into sequences
5. **Custom Validators** - Per-command validation rules

All can be added without modifying existing code (Open/Closed Principle).
