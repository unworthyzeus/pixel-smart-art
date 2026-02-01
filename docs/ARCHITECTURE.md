# PixelSmart Art - Technical Architecture

This document provides a detailed technical overview of the PixelSmart Art application architecture, design decisions, and implementation details.

## Table of Contents

1. [Overview](#overview)
2. [Technology Choices](#technology-choices)
3. [Application Architecture](#application-architecture)
4. [Core Engine](#core-engine)
5. [Component Design](#component-design)
6. [State Management](#state-management)
7. [Performance Optimizations](#performance-optimizations)
8. [Mobile Adaptation Path](#mobile-adaptation-path)

---

## Overview

PixelSmart Art is a client-side web application that transforms images into pixel art. All processing happens in the browser using the Canvas API, ensuring user privacy and eliminating server costs.

### Design Principles

1. **Privacy First**: No images are uploaded to any server
2. **Performance**: Debounced processing, efficient algorithms
3. **Extensibility**: Modular filter and palette system
4. **Mobile Ready**: Responsive design, touch-friendly controls
5. **Accessibility**: Semantic HTML, keyboard navigation

---

## Technology Choices

### Framework: Next.js 16

**Why Next.js?**
- App Router for modern React features
- Optimized build and deployment
- Excellent Vercel integration
- Future-ready for server components if needed

### Language: TypeScript

- Type safety for complex image processing
- Better IDE support and refactoring
- Self-documenting code

### Styling: Tailwind CSS v4

- Utility-first for rapid development
- CSS variables for theming
- Minimal runtime overhead

### Key Decision: Client-Side Processing

All image processing uses the **Canvas API** instead of server-side solutions:

**Pros:**
- Zero server costs
- Complete privacy
- Instant preview updates
- No upload/download latency

**Cons:**
- No GPU acceleration (WebGL would be complex)
- Large images may lag on mobile
- Browser memory limits

---

## Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        page.tsx                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   State Management                     │   │
│  │  - originalImage: HTMLImageElement                    │   │
│  │  - pixelatedCanvas: HTMLCanvasElement                 │   │
│  │  - config: PixelArtConfig                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                  │
│    ┌───────────────────────┼───────────────────────────┐    │
│    │                       │                           │    │
│    ▼                       ▼                           ▼    │
│ ┌──────────┐    ┌────────────────┐    ┌──────────────────┐ │
│ │DropZone  │    │  PixelPreview  │    │  Control Panels  │ │
│ └──────────┘    └────────────────┘    │  - Palette       │ │
│                        │              │  - Size          │ │
│                        │              │  - Filters       │ │
│                        ▼              └──────────────────┘ │
│              ┌──────────────────┐                          │
│              │   pixelEngine    │                          │
│              │  - generatePixelArt()                       │
│              │  - applyFilters()                           │
│              │  - extractPalette()                         │
│              └──────────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Engine

### File: `lib/pixelEngine.ts`

The main processing pipeline:

```typescript
async function generatePixelArt(
  sourceImage: HTMLImageElement,
  config: PixelArtConfig,
  palette: string[]
): Promise<HTMLCanvasElement>
```

### Pipeline Steps

#### 1. Source Canvas Creation

```typescript
const sourceCanvas = document.createElement('canvas');
sourceCanvas.width = outputWidth;
sourceCanvas.height = outputHeight;
ctx.drawImage(sourceImage, 0, 0, outputWidth, outputHeight);
```

#### 2. Aspect Ratio Handling

Crops source image to match target aspect ratio:

```typescript
function calculateAspectRatio(
  originalWidth, originalHeight,
  aspectRatio, customWidth?, customHeight?
): { width: number; height: number }
```

#### 3. Pre-Filter Application

Applies filters before pixelation for best results:

```typescript
let imageData = ctx.getImageData(0, 0, width, height);
imageData = applyFilters(imageData, config.preFilters);
ctx.putImageData(imageData, 0, 0);
```

#### 4. Downscale Pixelation

```typescript
const pixelWidth = Math.ceil(outputWidth / pixelSize);
const pixelHeight = Math.ceil(outputHeight / pixelSize);

// Draw scaled down
downCtx.drawImage(sourceCanvas, 0, 0, pixelWidth, pixelHeight);
```

#### 5. Palette Mapping

```typescript
for (let i = 0; i < imageData.data.length; i += 4) {
  const color = { r: data[i], g: data[i+1], b: data[i+2] };
  const closest = findClosestColor(color, palette);
  data[i] = closest.r;
  data[i+1] = closest.g;
  data[i+2] = closest.b;
}
```

#### 6. Upscale

```typescript
outputCtx.imageSmoothingEnabled = false; // Crisp pixels!
outputCtx.drawImage(
  downCanvas,
  0, 0, pixelWidth, pixelHeight,
  0, 0, outputCanvas.width, outputCanvas.height
);
```

---

## Filter System

### File: `lib/filters.ts`

Modular filter architecture:

```typescript
interface FilterConfig {
  type: FilterType;
  intensity: number; // 0-100
}

function applyFilter(
  imageData: ImageData,
  filter: FilterConfig
): ImageData
```

### Convolution Filters

Shared kernel application:

```typescript
function applyKernel(
  imageData: ImageData,
  kernel: number[][],
  divisor: number = 1,
  offset: number = 0
): ImageData
```

### Available Filters

| Filter | Category | Algorithm |
|--------|----------|-----------|
| Sharpen | Basic | Convolution kernel |
| Blur | Basic | Box blur kernel |
| Contrast | Basic | Linear transform |
| Brightness | Basic | Additive adjust |
| Saturation | Basic | Grayscale blend |
| Hue Rotate | Artistic | Matrix multiplication |
| Sepia | Artistic | Color matrix |
| Grayscale | Artistic | Luminance |
| Posterize | Pixel | Level quantization |
| Dither | Pixel | Floyd-Steinberg |
| Edge Detect | Pixel | Sobel operator |
| Emboss | Pixel | Directional kernel |
| Vignette | Artistic | Radial darkening |
| Noise | Pixel | Random addition |

---

## Palette System

### File: `lib/palettes.ts`

### Color Matching

Uses perceptually-weighted Euclidean distance:

```typescript
function colorDistance(c1, c2): number {
  const rMean = (c1.r + c2.r) / 2;
  const dR = c1.r - c2.r;
  const dG = c1.g - c2.g;
  const dB = c1.b - c2.b;
  
  return Math.sqrt(
    (2 + rMean / 256) * dR * dR +
    4 * dG * dG +
    (2 + (255 - rMean) / 256) * dB * dB
  );
}
```

### K-Means Palette Extraction

```typescript
function extractPalette(imageData: ImageData, colorCount: number): string[] {
  // 1. Sample pixels (every 4th for performance)
  // 2. Initialize centroids
  // 3. Iterate 10 times:
  //    a. Assign pixels to nearest centroid
  //    b. Update centroid positions
  // 4. Sort by luminance
  // 5. Return as hex colors
}
```

---

## Component Design

### Unidirectional Data Flow

```
User Input → State Update → processImage() → Canvas Update → Display
```

### Key Components

| Component | Responsibility |
|-----------|----------------|
| `ImageDropZone` | File input, drag/drop, validation |
| `PixelPreview` | Canvas display, zoom, pan, grid |
| `PaletteSelector` | Mode switching, palette UI |
| `FilterControls` | Filter stack management |
| `SizeControls` | Dimensions, aspect ratio |

---

## State Management

Uses React `useState` with:
- **Debounced processing**: 300ms delay before re-processing
- **Memoized palette getter**: `useCallback` for palette resolution
- **Effect-based auto-processing**: Reprocess on config changes

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    processImage();
  }, 300);
  return () => clearTimeout(timer);
}, [processImage]);
```

---

## Performance Optimizations

### 1. Debounced Processing
Prevents excessive re-renders during slider adjustments.

### 2. Pixel Sampling
K-means samples every 4th pixel for faster extraction.

### 3. Canvas Reuse
Reuses canvas elements instead of creating new ones.

### 4. Lazy Filter Loading
Filters are only computed when in the filter stack.

### 5. Image Smoothing Disabled
```typescript
ctx.imageSmoothingEnabled = false;
```
Ensures crisp pixel scaling without blur.

---

## Mobile Adaptation Path

### Option 1: React Native

Convert components to React Native:
- Replace `canvas` with `react-native-canvas` or native modules
- Use `expo-image-picker` for photo selection
- Store in device gallery

### Option 2: Capacitor

Wrap existing web app:
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android
npx cap add ios
```

### Key Considerations

1. **Camera Integration**: Native photo capture
2. **Gallery Saving**: Save to device photos
3. **Performance**: May need WebGL for larger images
4. **Offline Support**: Service worker caching

See [MOBILE.md](./MOBILE.md) for detailed migration guide.

---

## Future Enhancements

- [ ] WebGL acceleration for filters
- [ ] Undo/redo history
- [ ] Animation support (GIF import)
- [ ] Custom palette import/export
- [ ] Share to social media
- [ ] PWA with offline support

---

*This document is part of the PixelSmart Art project documentation.*
