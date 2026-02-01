# Project Prompt & Requirements

This document contains the original project requirements and prompt that led to the creation of PixelSmart Art.

---

## Original User Request

> I want to create a website to deploy to vercel, that later I would like to adapt to a android/IOS app that generates a pixel art with palettes from an image, being able to tweek image and pixel size, aspect ratio, custom palettes, smart filters (pre and after pixelation), and also document everything you do and this prompt in readmes

---

## Interpreted Requirements

### Core Features

1. **Image to Pixel Art Conversion**
   - Upload any image (PNG, JPG, WEBP, GIF)
   - Convert to pixel art style
   - Real-time preview

2. **Pixel Size Control**
   - Adjustable pixel block size (1-64 pixels)
   - Preview pixel count
   - Preset sizes for common resolutions

3. **Aspect Ratio Options**
   - Original aspect ratio
   - Preset ratios: 1:1, 4:3, 16:9, 3:2, 2:3, 9:16, 3:4
   - Custom aspect ratio input

4. **Color Palettes**
   - **Predefined Palettes**: Classic gaming (Game Boy, NES, SNES, PICO-8, etc.) and artistic palettes
   - **Extracted Palettes**: AI-powered dominant color extraction using k-means clustering
   - **Custom Palettes**: User-created with color picker

5. **Smart Filters**
   - **Pre-Pixelation Filters**: Applied before downscaling for better source preparation
   - **Post-Pixelation Filters**: Applied after for artistic effects
   - Filter types: Sharpen, Blur, Contrast, Brightness, Saturation, Sepia, Grayscale, Dither, etc.

6. **Export Options**
   - PNG export (lossless)
   - JPG export (compressed)
   - Download to device

### Technical Requirements

1. **Web Deployment**
   - Deploy to Vercel (free tier compatible)
   - No backend required (client-side processing)
   - Fast loading and responsive

2. **Mobile Adaptation Ready**
   - Responsive design from the start
   - Touch-friendly controls
   - Architecture suitable for React Native or Capacitor

3. **Documentation**
   - README with features, installation, usage
   - Technical architecture documentation
   - Filter and palette reference guides
   - Mobile adaptation guide

---

## Implementation Decisions

### Technology Stack

| Choice | Reasoning |
|--------|-----------|
| **Next.js 16** | Modern React framework, excellent Vercel integration |
| **TypeScript** | Type safety for image processing logic |
| **Tailwind CSS v4** | Rapid UI development, responsive by default |
| **Canvas API** | Client-side image processing, no server needed |
| **CSS Variables** | Consistent theming, easy dark mode |

### Architecture Decisions

1. **Client-Side Processing**
   - Privacy: Images never leave user's device
   - Cost: No server infrastructure
   - Speed: No upload/download latency

2. **Modular Filter System**
   - Each filter is a pure function
   - Filters can be composed/stacked
   - Easy to add new filters

3. **Palette System**
   - Separation of predefined, extracted, and custom modes
   - Perceptually-weighted color matching
   - K-means clustering for intelligent extraction

4. **Responsive Component Design**
   - Mobile-first CSS approach
   - Touch-friendly slider controls
   - Collapsible panels for small screens

---

## Feature Implementation Status

### ✅ Completed Features

- [x] Image upload via drag-and-drop
- [x] Image upload via file browser
- [x] Real-time pixel art preview
- [x] Zoom and pan in preview
- [x] Pixel size control (1-64px)
- [x] Output size control
- [x] Preset size options
- [x] Aspect ratio selection
- [x] Custom aspect ratio
- [x] 16 predefined palettes
- [x] AI palette extraction
- [x] Custom palette creation
- [x] 15 image filters
- [x] Pre-pixelation filter stack
- [x] Post-pixelation filter stack
- [x] Filter intensity control
- [x] PNG export
- [x] JPG export
- [x] Grid overlay toggle
- [x] Original image toggle
- [x] Responsive design
- [x] Dark theme
- [x] Glassmorphism UI
- [x] README documentation
- [x] Architecture documentation
- [x] Filter reference documentation
- [x] Palette reference documentation
- [x] Mobile adaptation guide

### 🔄 Future Enhancements

- [ ] Undo/redo history
- [ ] Animation support (GIF input)
- [ ] Palette import/export
- [ ] Share to social media
- [ ] PWA offline support
- [ ] WebGL acceleration
- [ ] Mobile app (Capacitor/React Native)

---

## File Structure

```
pixel-smart-art/
├── src/
│   ├── app/
│   │   ├── globals.css      # Design tokens & theme
│   │   ├── layout.tsx       # Root layout with SEO
│   │   └── page.tsx         # Main application
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── ImageDropZone.tsx
│   │   ├── PixelPreview.tsx
│   │   ├── PaletteSelector.tsx
│   │   ├── FilterControls.tsx
│   │   └── SizeControls.tsx
│   └── lib/
│       ├── palettes.ts      # Palette data & utilities
│       ├── filters.ts       # Filter implementations
│       └── pixelEngine.ts   # Core processing engine
├── docs/
│   ├── ARCHITECTURE.md
│   ├── FILTERS.md
│   ├── PALETTES.md
│   ├── MOBILE.md
│   └── PROMPT.md            # This file
├── public/
├── README.md
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## Deployment

### Vercel Deployment

```bash
# Option 1: Vercel CLI
npm i -g vercel
vercel

# Option 2: GitHub Integration
# Connect repository to Vercel dashboard
```

### GitHub Repository

Repository: https://github.com/unworthyzeus/pixel-smart-art.git

---

## Summary

PixelSmart Art fulfills all the original requirements:

1. ✅ **Vercel-deployable website** - Built with Next.js for seamless Vercel deployment
2. ✅ **Mobile-adaptable architecture** - React components ready for Capacitor/RN
3. ✅ **Pixel art generation** - Canvas-based pixelation engine
4. ✅ **Palette support** - Predefined, extracted, and custom palettes
5. ✅ **Size/aspect controls** - Full control over output dimensions
6. ✅ **Smart filters** - Pre and post-pixelation filter stacks
7. ✅ **Complete documentation** - README, architecture, and reference guides

---

*Created: February 2026*
*Author: AI Assistant*
*Project Owner: @unworthyzeus*
