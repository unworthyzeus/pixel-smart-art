# Mobile Adaptation Guide

This document outlines the strategies and steps for adapting PixelSmart Art from a web application to native mobile apps for Android and iOS.

## Table of Contents

1. [Overview](#overview)
2. [Option 1: Capacitor (Hybrid)](#option-1-capacitor-hybrid)
3. [Option 2: React Native (Native)](#option-2-react-native-native)
4. [Feature Considerations](#feature-considerations)
5. [App Store Deployment](#app-store-deployment)
6. [Performance Optimization](#performance-optimization)

---

## Overview

PixelSmart Art is designed with mobile adaptation in mind. The web version already:

✅ Responsive design for all screen sizes
✅ Touch-friendly controls
✅ No server dependencies
✅ Client-side image processing
✅ React component architecture

### Migration Options

| Approach | Effort | Performance | Native Features |
|----------|--------|-------------|-----------------|
| **PWA** | Low | Good | Limited |
| **Capacitor** | Medium | Good | Full |
| **React Native** | High | Best | Full |

---

## Option 1: Capacitor (Hybrid)

Capacitor wraps the existing web app in a native container, providing access to device APIs.

### Setup

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor
npx cap init "PixelSmart Art" "com.pixelsmartart.app"

# Add platforms
npx cap add android
npx cap add ios

# Build web app
npm run build

# Sync to native projects
npx cap sync
```

### Project Structure After Setup

```
pixel-smart-art/
├── android/           # Android Studio project
├── ios/              # Xcode project
├── src/              # Web source (unchanged)
├── capacitor.config.json
└── ...
```

### Required Plugins

```bash
# Camera for live photo capture
npm install @capacitor/camera

# Filesystem for saving images
npm install @capacitor/filesystem

# Share for social sharing
npm install @capacitor/share

# Status bar customization
npm install @capacitor/status-bar
```

### Implementation Example

```typescript
import { Camera, CameraResultType } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

// Take photo with camera
async function takePhoto() {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.DataUrl
  });
  
  // Load into pixel art generator
  loadImageFromDataUrl(image.dataUrl);
}

// Save to gallery
async function saveToGallery(canvas: HTMLCanvasElement) {
  const dataUrl = canvas.toDataURL('image/png');
  const base64Data = dataUrl.split(',')[1];
  
  await Filesystem.writeFile({
    path: `pixel-art-${Date.now()}.png`,
    data: base64Data,
    directory: Directory.Documents
  });
}

// Share result
async function shareImage(canvas: HTMLCanvasElement) {
  const dataUrl = canvas.toDataURL('image/png');
  
  await Share.share({
    title: 'My Pixel Art',
    text: 'Created with PixelSmart Art',
    url: dataUrl,
    dialogTitle: 'Share your pixel art'
  });
}
```

### Capacitor Config

```json
// capacitor.config.json
{
  "appId": "com.pixelsmartart.app",
  "appName": "PixelSmart Art",
  "webDir": "out",
  "bundledWebRuntime": false,
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#0a0a0f",
      "showSpinner": false
    },
    "StatusBar": {
      "style": "dark",
      "backgroundColor": "#0a0a0f"
    }
  }
}
```

### Building for Stores

```bash
# Android
npx cap open android
# Build signed APK/AAB in Android Studio

# iOS
npx cap open ios
# Build and archive in Xcode
```

---

## Option 2: React Native (Native)

For better performance and native feel, port to React Native.

### Project Setup

```bash
npx react-native init PixelSmartArt --template react-native-template-typescript
cd PixelSmartArt
```

### Key Component Mappings

| Web Component | React Native Equivalent |
|---------------|------------------------|
| `<div>` | `<View>` |
| `<span>`, `<p>` | `<Text>` |
| `<img>` | `<Image>` |
| `<canvas>` | `react-native-canvas` |
| CSS | StyleSheet.create() |
| `<input type="range">` | `@react-native-community/slider` |

### Canvas Handling

Use `react-native-canvas` for image processing:

```tsx
import Canvas, { Image as CanvasImage } from 'react-native-canvas';

function PixelProcessor({ imageUri, config }) {
  const canvasRef = useRef<Canvas>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const img = new CanvasImage(canvas);
    
    img.addEventListener('load', () => {
      ctx.drawImage(img, 0, 0);
      processPixelArt(ctx, config);
    });
    
    img.src = imageUri;
  }, [imageUri, config]);
  
  return <Canvas ref={canvasRef} style={styles.canvas} />;
}
```

### Image Picker Integration

```tsx
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

async function pickImage() {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    quality: 1,
    includeBase64: true
  });
  
  if (result.didCancel) return;
  
  const asset = result.assets?.[0];
  if (asset?.uri) {
    setSourceImage(asset.uri);
  }
}

async function capturePhoto() {
  const result = await launchCamera({
    mediaType: 'photo',
    cameraType: 'back',
    quality: 1
  });
  
  // Handle similarly
}
```

### Saving to Gallery

```tsx
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';

async function savePixelArt(canvas: Canvas) {
  const dataUrl = await canvas.toDataURL('image/png');
  const base64 = dataUrl.split(',')[1];
  
  const path = `${RNFS.CachesDirectoryPath}/pixel-art-${Date.now()}.png`;
  await RNFS.writeFile(path, base64, 'base64');
  
  await CameraRoll.save(path, { type: 'photo' });
}
```

### Required Packages

```bash
npm install react-native-canvas
npm install react-native-image-picker
npm install @react-native-camera-roll/camera-roll
npm install react-native-fs
npm install @react-native-community/slider
npm install react-native-color-picker
```

---

## Feature Considerations

### Camera Integration

| Feature | Capacitor | React Native |
|---------|-----------|--------------|
| Photo Library | ✅ Easy | ✅ Easy |
| Camera Capture | ✅ Easy | ✅ Easy |
| Live Preview | ⚠️ Limited | ✅ Better |

### Performance

| Aspect | Capacitor | React Native |
|--------|-----------|--------------|
| UI Rendering | Web (slower) | Native (faster) |
| Canvas Ops | Same | Similar |
| Memory | Higher | Lower |
| Launch Time | Slower | Faster |

### Recommendation

- **Capacitor**: Fastest path to mobile, good enough for most users
- **React Native**: Better long-term choice if mobile becomes primary focus

---

## App Store Deployment

### Android (Google Play)

1. **Generate Keystore**
```bash
keytool -genkey -v -keystore pixel-smart-art.keystore \
  -alias pixelsmartart -keyalg RSA -keysize 2048 -validity 10000
```

2. **Build AAB**
```bash
# Capacitor
cd android && ./gradlew bundleRelease

# React Native
cd android && ./gradlew assembleRelease
```

3. **Play Console**
   - Create app listing
   - Upload AAB
   - Set up pricing (free)
   - Submit for review

### iOS (App Store)

1. **Apple Developer Account** ($99/year required)

2. **Xcode Setup**
   - Configure signing
   - Set bundle ID
   - Add app icons

3. **Archive & Upload**
```bash
# In Xcode
Product → Archive → Distribute App → App Store Connect
```

4. **App Store Connect**
   - Create app listing
   - Upload screenshots
   - Set up pricing
   - Submit for review

### Required Assets

| Asset | Android | iOS |
|-------|---------|-----|
| App Icon | 512×512 | 1024×1024 |
| Screenshots | Various | 6.5", 5.5", iPad |
| Feature Graphic | 1024×500 | N/A |
| Privacy Policy | Required | Required |

---

## Performance Optimization

### Large Image Handling

```typescript
// Limit max dimensions on mobile
const MAX_MOBILE_DIMENSION = 1024;

function resizeForMobile(img: ImageData): ImageData {
  const scale = Math.min(
    1,
    MAX_MOBILE_DIMENSION / img.width,
    MAX_MOBILE_DIMENSION / img.height
  );
  
  if (scale < 1) {
    // Downscale before processing
    return scaleImageData(img, scale);
  }
  
  return img;
}
```

### Memory Management

```typescript
// Clean up canvases when not in use
useEffect(() => {
  return () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };
}, []);
```

### Debounce Processing

```typescript
// Already implemented in web version
// Critical for mobile performance
const debouncedProcess = useMemo(
  () => debounce(processImage, 500), // Longer delay on mobile
  [processImage]
);
```

---

## Progressive Web App (PWA)

As an intermediate step, enable PWA support:

### next.config.js

```js
const withPWA = require('next-pwa')({
  dest: 'public'
});

module.exports = withPWA({
  // existing config
});
```

### public/manifest.json

```json
{
  "name": "PixelSmart Art",
  "short_name": "PixelSmart",
  "description": "AI-Powered Pixel Art Generator",
  "theme_color": "#0a0a0f",
  "background_color": "#0a0a0f",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## Roadmap

### Phase 1: PWA (Week 1)
- [ ] Add manifest.json
- [ ] Configure service worker
- [ ] Add install prompt

### Phase 2: Capacitor (Weeks 2-3)
- [ ] Set up Capacitor
- [ ] Add camera plugin
- [ ] Add filesystem plugin
- [ ] Build and test on devices

### Phase 3: Store Release (Week 4)
- [ ] Create store listings
- [ ] Generate screenshots
- [ ] Submit for review

### Phase 4: React Native (Future)
- [ ] Port UI components
- [ ] Optimize canvas operations
- [ ] Add native animations

---

*This document is part of the PixelSmart Art project documentation.*
