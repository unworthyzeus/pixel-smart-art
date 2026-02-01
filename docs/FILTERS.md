# Image Filters Reference

This document provides detailed information about each filter available in PixelSmart Art, including algorithms, use cases, and recommended settings.

## Table of Contents

1. [Filter Pipeline](#filter-pipeline)
2. [Basic Filters](#basic-filters)
3. [Artistic Filters](#artistic-filters)
4. [Pixel Art Filters](#pixel-art-filters)
5. [Combining Filters](#combining-filters)

---

## Filter Pipeline

### Pre-Pixelation vs Post-Pixelation

**Pre-Pixelation Filters** are applied BEFORE the image is downscaled. Best for:
- Preparing the source image
- Cleaning up noise
- Enhancing edges for better pixelation
- Adjusting colors before palette mapping

**Post-Pixelation Filters** are applied AFTER pixelation. Best for:
- Adding artistic effects to the final result
- Creating retro aesthetics
- Adding grain or dithering
- Color grading the output

---

## Basic Filters

### Sharpen

**Purpose**: Enhance edges and details

**Algorithm**: Unsharp mask convolution kernel
```
[  0, -k,  0 ]
[ -k, 1+4k, -k ]
[  0, -k,  0 ]
```
Where `k` = intensity / 100

**Recommended Settings**:
- **Pre-filter**: 30-50% for cleaner pixel edges
- **Post-filter**: Generally not recommended

**Best For**: Images that appear soft or blurry

---

### Blur

**Purpose**: Soften the image, reduce noise

**Algorithm**: Box blur with variable kernel size
```
[ 1, 1, 1 ]
[ 1, 1, 1 ]
[ 1, 1, 1 ] / 9
```
Kernel size scales with intensity.

**Recommended Settings**:
- **Pre-filter**: 10-30% to reduce noise before pixelation
- **Post-filter**: Not recommended (destroys pixel edges)

**Best For**: Noisy photos, JPEG artifacts

---

### Contrast

**Purpose**: Adjust the difference between light and dark areas

**Algorithm**: Linear transform
```
output = factor * (input - 128) + 128
factor = (259 * (I * 2.55 + 255)) / (255 * (259 - I * 2.55))
```

**Recommended Settings**:
- **Pre-filter**: 10-30% for more distinct colors
- **Post-filter**: 10-20% for punchier output

**Best For**: Flat, washed-out images

---

### Brightness

**Purpose**: Make image lighter or darker

**Algorithm**: Additive adjustment
```
output = input + (intensity - 50) * 2.55
```
(50 = no change, lower = darker, higher = brighter)

**Recommended Settings**:
- **Pre-filter**: Adjust as needed based on source
- **Post-filter**: Fine-tune final appearance

**Best For**: Under/overexposed images

---

### Saturation

**Purpose**: Adjust color intensity

**Algorithm**: Blend with grayscale
```
gray = 0.299R + 0.587G + 0.114B
output = gray + factor * (input - gray)
```

**Recommended Settings**:
- **Pre-filter**: 40-60% for vibrant pixel art
- **Post-filter**: Great for color grading

**Best For**: Making colors pop or creating muted palettes

---

## Artistic Filters

### Hue Rotate

**Purpose**: Shift all colors around the color wheel

**Algorithm**: Color matrix rotation
```
| 0.213+0.787c-0.213s  0.715-0.715c-0.715s  0.072-0.072c+0.928s |   | R |
| 0.213-0.213c+0.143s  0.715+0.285c+0.140s  0.072-0.072c-0.283s | × | G |
| 0.213-0.213c-0.787s  0.715-0.715c+0.715s  0.072+0.928c+0.072s |   | B |
```
Where c = cos(angle), s = sin(angle)

**Intensity**: 0 = 0°, 50 = 180°, 100 = 360°

**Recommended Settings**:
- **Pre-filter**: Create interesting color schemes
- **Post-filter**: Dramatic color shifts

**Best For**: Creating alternate color versions

---

### Invert

**Purpose**: Reverse all colors (negative)

**Algorithm**: 
```
output = 255 - input
# With intensity blending:
output = input + factor * (255 - 2 * input)
```

**Recommended Settings**:
- Use at 100% for full negative effect
- Lower values create interesting mid-tones

**Best For**: Creating negatives, artistic effects

---

### Sepia

**Purpose**: Vintage brown-toned effect

**Algorithm**: Color matrix
```
R' = 0.393R + 0.769G + 0.189B
G' = 0.349R + 0.686G + 0.168B
B' = 0.272R + 0.534G + 0.131B
```

**Recommended Settings**:
- **Post-filter**: 40-60% for subtle vintage look
- 100% for full sepia conversion

**Best For**: Vintage, nostalgic aesthetics

---

### Grayscale

**Purpose**: Convert to black and white

**Algorithm**: Luminance-based
```
gray = 0.299R + 0.587G + 0.114B
```

**Recommended Settings**:
- Use before selecting a grayscale palette
- Combine with contrast for better results

**Best For**: Game Boy style, classic pixel art

---

### Vignette

**Purpose**: Darken corners, focus attention on center

**Algorithm**: Radial darkening
```
distance = sqrt((x - centerX)² + (y - centerY)²) / maxDistance
vignette = 1 - (distance² * intensity)
output = input * vignette
```

**Recommended Settings**:
- **Post-filter**: 30-50% for subtle effect
- Higher values for dramatic focus

**Best For**: Drawing attention to center, movie-like look

---

## Pixel Art Filters

### Posterize

**Purpose**: Reduce color levels for a stylized look

**Algorithm**: Level quantization
```
levels = (100 - intensity) / 10 + 2
step = 255 / (levels - 1)
output = round(input / step) * step
```

**Recommended Settings**:
- **Pre-filter**: 40-60% to reduce color complexity before palette mapping
- Helps with images that have too many colors

**Best For**: Simplifying complex images

---

### Edge Detect

**Purpose**: Highlight outlines and edges

**Algorithm**: Laplacian kernel
```
[ -1, -1, -1 ]
[ -1,  8, -1 ]
[ -1, -1, -1 ]
```

**Recommended Settings**:
- **Pre-filter**: Blend at 20-40% for enhanced edges
- Creates comic/sketch effects at higher values

**Best For**: Line art, enhancing details

---

### Emboss

**Purpose**: Create 3D raised effect

**Algorithm**: Directional kernel
```
[ -2f, -f,  0 ]
[ -f,   1,  f ]
[  0,   f, 2f ]
```
Plus 128 offset

**Recommended Settings**:
- **Post-filter**: 30-50% for subtle depth
- Creates metallic/relief appearance

**Best For**: Button effects, texture

---

### Noise

**Purpose**: Add film grain/static

**Algorithm**: Random addition
```
noise = (random() - 0.5) * intensity * 2.55
output = clamp(input + noise, 0, 255)
```

**Recommended Settings**:
- **Post-filter**: 5-20% for subtle grain
- Higher values for retro CRT effect

**Best For**: Retro aesthetics, reducing banding

---

### Dither (Floyd-Steinberg)

**Purpose**: Create halftone-style color reduction

**Algorithm**: Error diffusion
```
for each pixel:
  old = current value
  new = quantized value
  error = old - new
  
  distribute error to neighbors:
  right:      7/16
  bottom-left: 3/16
  bottom:     5/16
  bottom-right: 1/16
```

**Recommended Settings**:
- **Post-filter**: 40-70% for classic dithering
- Lower intensity = more color levels

**Best For**: Reducing banding, retro look, limited palettes

---

## Combining Filters

### Recommended Combinations

#### Clean Pixel Art (from photo)
```
Pre-filters:
1. Blur: 10-20% (reduce noise)
2. Contrast: 20% (separate colors)
3. Sharpen: 30% (enhance edges)
```

#### Retro Game Look
```
Pre-filters:
1. Posterize: 50% (reduce colors)
2. Saturation: 60% (vivid colors)

Post-filters:
1. Dither: 50%
2. Noise: 10%
```

#### Vintage Photo
```
Pre-filters:
1. Contrast: 15%

Post-filters:
1. Sepia: 40%
2. Vignette: 30%
3. Noise: 10%
```

#### High Contrast Black & White
```
Pre-filters:
1. Grayscale: 100%
2. Contrast: 40%
3. Posterize: 80%
```

---

## Filter Order Matters

Filters are applied in sequence. Different orders produce different results:

**Example 1**: Blur → Sharpen = slightly blurred
**Example 2**: Sharpen → Blur = very blurred

**General Rule**: Apply corrective filters first, creative filters last.

---

*This document is part of the PixelSmart Art project documentation.*
