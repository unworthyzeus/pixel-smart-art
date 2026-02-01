# PixelSmart Art 🎨

> AI-Powered Pixel Art Generator with Smart Palettes & Filters

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/unworthyzeus/pixel-smart-art)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

PixelSmart Art is a modern web application that transforms any image into stunning pixel art. With intelligent color palette extraction, classic gaming palettes, and powerful pre/post-processing filters, you can create retro-style artwork with precision and style.

![PixelSmart Art Screenshot](./docs/screenshot.png)

## ✨ Features

### 🎮 Classic Gaming Palettes
- **Game Boy** - Original 4-color green palette
- **NES Classic** - Full 54-color NES palette
- **SNES** - 16-bit era colors
- **PICO-8** - Fantasy console palette
- **Commodore 64** - Retro computing colors
- **CGA Mode 4** - IBM PC nostalgia
- Plus artistic palettes: Cyberpunk, Retrowave, Pastel, and more!

### 🔍 Smart Color Extraction
- **AI-powered k-means clustering** extracts dominant colors from your image
- Adjustable color count (2-32 colors)
- Automatic palette sorting by luminance

### ⚙️ Pre-Pixelation Filters
Apply filters **before** pixelation for cleaner results:
- Sharpen, Blur, Contrast, Brightness
- Saturation, Hue Rotate
- Edge Detection, Emboss

### 🎛️ Post-Pixelation Filters
Add artistic effects **after** pixelation:
- Sepia, Grayscale, Invert
- Posterize, Dither (Floyd-Steinberg)
- Vignette, Noise

### 📐 Flexible Output Control
- **Pixel Size**: 1-64px per pixel block
- **Aspect Ratios**: Original, 1:1, 4:3, 16:9, 3:2, 9:16, custom
- **Output Size**: Up to 2048×2048 pixels
- **Preset Sizes**: 16×16 to 512×512 quick options

### 🚀 Modern Experience
- **Real-time preview** with instant updates
- **Zoom & pan** for detailed inspection
- **Grid overlay** to see pixel boundaries
- **100% client-side** - your images never leave your device
- **Export** as PNG or JPG

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel
- **Future Mobile**: Ready for React Native / Capacitor adaptation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/unworthyzeus/pixel-smart-art.git
cd pixel-smart-art

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
pixel-smart-art/
├── src/
│   ├── app/
│   │   ├── globals.css      # Design system & theme
│   │   ├── layout.tsx       # Root layout with SEO
│   │   └── page.tsx         # Main application page
│   ├── components/
│   │   ├── Header.tsx       # Navigation header
│   │   ├── ImageDropZone.tsx    # Drag & drop upload
│   │   ├── PixelPreview.tsx     # Canvas preview with zoom/pan
│   │   ├── PaletteSelector.tsx  # Palette controls
│   │   ├── FilterControls.tsx   # Pre/post filter UI
│   │   └── SizeControls.tsx     # Size & aspect ratio
│   └── lib/
│       ├── palettes.ts      # Color palettes & utilities
│       ├── filters.ts       # Image filter algorithms
│       └── pixelEngine.ts   # Core pixelation engine
├── docs/
│   ├── ARCHITECTURE.md      # Technical architecture
│   ├── FILTERS.md           # Filter documentation
│   ├── PALETTES.md          # Palette reference
│   └── MOBILE.md            # Mobile adaptation guide
├── public/                  # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

## 🎨 How It Works

### Pixelation Pipeline

1. **Load Image** → Canvas rendering
2. **Apply Pre-Filters** → Enhance/modify source
3. **Downscale** → Reduce to target "pixel" resolution
4. **Palette Mapping** → Match each pixel to nearest palette color
5. **Upscale** → Crisp pixel-perfect scaling
6. **Apply Post-Filters** → Add artistic effects
7. **Export** → Download final result

### Color Matching Algorithm

Uses **weighted Euclidean distance** that accounts for human color perception:

```typescript
const rMean = (c1.r + c2.r) / 2;
const distance = Math.sqrt(
  (2 + rMean / 256) * dR² +
  4 * dG² +
  (2 + (255 - rMean) / 256) * dB²
);
```

### Palette Extraction

Implements **k-means clustering** for intelligent color extraction:
1. Sample pixels from image
2. Initialize k centroids
3. Iteratively assign pixels to nearest centroid
4. Update centroid positions
5. Sort by luminance for consistent ordering

## 🌐 Deployment

### Deploy to Vercel

The easiest way to deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/unworthyzeus/pixel-smart-art)

Or manually:

```bash
npm i -g vercel
vercel
```

### Environment Variables

No environment variables required - everything runs client-side!

## 📱 Mobile Adaptation

This project is designed for future mobile adaptation. See [docs/MOBILE.md](./docs/MOBILE.md) for details on:

- React Native migration path
- Capacitor wrapping option
- Native camera integration
- App store deployment

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Classic gaming palettes inspired by retro consoles
- Floyd-Steinberg dithering algorithm
- K-means clustering for palette extraction

---

Made with 💜 by [unworthyzeus](https://github.com/unworthyzeus)
