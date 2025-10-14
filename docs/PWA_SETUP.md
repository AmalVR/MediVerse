# PWA Setup Guide for MediVerse

## Overview

MediVerse is configured as a Progressive Web App (PWA) to provide:

- Offline support for anatomy models
- Fast loading through caching
- Install capability on devices
- Background updates

## Features

### 1. Service Worker

- Caches Unity WebGL builds
- Provides offline access
- Smart caching strategies:
  - Static assets: Cache-first
  - Unity builds: Cache-first with network fallback
  - API calls: Network-first with cache fallback

### 2. Caching Strategy

- Unity builds (~200MB) are cached on first load
- Subsequent visits load instantly from cache
- Background sync for updates
- Cache management UI for users

### 3. Network Detection

- Adapts to user's connection speed
- Warns on slow/metered connections
- Optimizes concurrent downloads
- Shows loading estimates

### 4. Install Experience

- Custom install prompt
- Platform-specific builds
- Home screen icon
- Splash screen

## Implementation Details

### Service Worker Registration

```typescript
// main.tsx
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered:", registration);
      })
      .catch((error) => {
        console.error("SW registration failed:", error);
      });
  });
}
```

### Cache Management

```typescript
// Clear cache
await caches.delete("unity-builds");

// Add to cache
const cache = await caches.open("unity-builds");
await cache.add("/unity/pc-build/Build.data.unityweb");

// Get cache size
const cache = await caches.open("unity-builds");
const keys = await cache.keys();
const size = await Promise.all(
  keys.map(async (key) => {
    const response = await cache.match(key);
    const blob = await response.blob();
    return blob.size;
  })
);
```

### Network Detection

```typescript
// Check connection
const connection = navigator.connection;
const effectiveType = connection?.effectiveType; // 4g, 3g, 2g, slow-2g
const saveData = connection?.saveData; // true if data saver enabled
```

## Testing

1. **Offline Testing**

   - Use Chrome DevTools > Network > Offline
   - Verify cached models load
   - Check offline UI indicators

2. **Installation**

   - Clear site data
   - Visit app
   - Verify install prompt
   - Test installed version

3. **Updates**

   - Deploy new version
   - Verify update notification
   - Check cache refresh

4. **Network Conditions**
   - Test on various connections
   - Verify adaptive loading
   - Check warning messages

## Common Issues

### Cache Storage Limits

- Chrome: ~80% of available storage
- Safari: ~50MB limit
- Firefox: Dynamic based on disk space

**Solution:** Use low-poly models for mobile, clear old caches

### iOS PWA Limitations

- No background sync
- Limited storage
- No push notifications

**Solution:** Provide fallback experiences

### Update Detection

- Service workers can be slow to update
- Users might see old versions

**Solution:** Add version checking and manual refresh option

## Best Practices

1. **Progressive Enhancement**

   - Start with basic experience
   - Add features based on capability
   - Provide fallbacks

2. **Performance**

   - Minimize initial bundle
   - Lazy load non-critical assets
   - Use compression

3. **User Experience**

   - Clear loading indicators
   - Offline-first design
   - Smooth transitions

4. **Security**
   - HTTPS only
   - Content Security Policy
   - Careful with cache headers

## Deployment Checklist

- [ ] HTTPS enabled
- [ ] Service worker registered
- [ ] Manifest.json valid
- [ ] Icons generated
- [ ] Cache strategies tested
- [ ] Offline functionality verified
- [ ] Install flow tested
- [ ] Update process confirmed
- [ ] Analytics added
- [ ] Error tracking implemented

## Resources

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [PWA Builder](https://www.pwabuilder.com/)
- [Chrome PWA Documentation](https://developer.chrome.com/docs/workbox/)
