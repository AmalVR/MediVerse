# API Response Standards

## Problem: Inconsistent Response Formats

This issue has occurred multiple times because different API endpoints were returning data in different formats:

### Before Standardization:

```typescript
// Session creation endpoint
POST /api/sessions
Response: { success: true, data: { id, code, ... } }

// Join session endpoint
POST /api/sessions/join
Response: { id, code, ... }  // No wrapper!

// Update session endpoint
PATCH /api/sessions/:id/state
Response: { id, code, ... }  // No wrapper!

// End session endpoint
DELETE /api/sessions/:id
Response: { success: true }  // No data field!
```

### Why This Causes Problems:

1. **Client code becomes fragile** - needs to handle each endpoint differently
2. **Easy to forget** - when adding new endpoints, inconsistency creeps in
3. **Debugging is harder** - same operation fails differently on different endpoints
4. **TypeScript types don't help** - can't use a single response type

## Solution: Standardized Response Format

### All API endpoints MUST return:

```typescript
// Success response
{
  success: true,
  data: { /* actual data */ }
}

// Error response
{
  success: false,
  error: "Error message"
}
```

### Benefits:

1. **Single client implementation** - same parsing logic for all endpoints
2. **Type safety** - can use `APIResponse<T>` for all endpoints
3. **Predictable errors** - always check `success` and `error` fields
4. **Easy debugging** - consistent structure everywhere

## Implementation Checklist

### Server Side (Express):

```typescript
// ✅ Correct
app.post("/api/resource", async (req, res) => {
  try {
    const data = await doSomething();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ❌ Wrong
app.post("/api/resource", async (req, res) => {
  const data = await doSomething();
  res.json(data); // Missing success wrapper!
});
```

### Client Side (API Client):

```typescript
// ✅ Correct
const response = await fetch("/api/resource");
const json = await response.json();

return {
  success: response.ok && json.success,
  data: json.data,
  error: json.error,
};

// ❌ Wrong
const data = await response.json();
return {
  success: response.ok,
  data, // Might be the wrapped object or raw data!
};
```

## Migration Status

### ✅ Standardized Endpoints:

- `POST /api/sessions` - Create session
- `POST /api/sessions/join` - Join session
- `PATCH /api/sessions/:id/state` - Update session state

### ⚠️ To Be Standardized:

- `GET /api/anatomy/parts`
- `GET /api/anatomy/parts/search`
- `GET /api/anatomy/parts/:partId`
- `GET /api/anatomy/parts/:partId/synonyms`
- `POST /api/voice/process`
- `GET /api/analytics/session/:sessionId`

## Rules for New Endpoints

1. **ALWAYS** wrap responses in `{ success, data, error }`
2. **NEVER** return raw data objects directly
3. **ALWAYS** use the `APIResponse<T>` type on the client
4. **TEST** with curl/Postman to verify response structure
5. **DOCUMENT** any deviations (with good reason)

## Testing

```bash
# Test any endpoint - should always have success field
curl http://localhost:3000/api/sessions -X POST \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","teacherId":"123"}' | jq '.success'

# Should output: true
```

## Type Definitions

```typescript
// Shared type for all API responses
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Usage
const result: APIResponse<Session> = await api.createSession();
if (result.success) {
  console.log(result.data.code);
} else {
  console.error(result.error);
}
```
