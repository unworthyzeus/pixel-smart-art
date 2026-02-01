// Image filters for pre and post-processing

export type FilterType =
    | 'none'
    | 'sharpen'
    | 'blur'
    | 'contrast'
    | 'brightness'
    | 'saturation'
    | 'hue-rotate'
    | 'invert'
    | 'sepia'
    | 'grayscale'
    | 'posterize'
    | 'edge-detect'
    | 'emboss'
    | 'vignette'
    | 'noise'
    | 'dither';

export interface FilterConfig {
    type: FilterType;
    intensity: number; // 0-100
}

export interface FilterDefinition {
    id: FilterType;
    name: string;
    description: string;
    defaultIntensity: number;
    category: 'basic' | 'artistic' | 'pixel';
}

export const FILTERS: FilterDefinition[] = [
    { id: 'none', name: 'None', description: 'No filter applied', defaultIntensity: 0, category: 'basic' },
    { id: 'sharpen', name: 'Sharpen', description: 'Enhance edges and details', defaultIntensity: 50, category: 'basic' },
    { id: 'blur', name: 'Blur', description: 'Soften the image', defaultIntensity: 30, category: 'basic' },
    { id: 'contrast', name: 'Contrast', description: 'Adjust image contrast', defaultIntensity: 20, category: 'basic' },
    { id: 'brightness', name: 'Brightness', description: 'Adjust image brightness', defaultIntensity: 10, category: 'basic' },
    { id: 'saturation', name: 'Saturation', description: 'Adjust color saturation', defaultIntensity: 30, category: 'basic' },
    { id: 'hue-rotate', name: 'Hue Rotate', description: 'Shift color hues', defaultIntensity: 50, category: 'artistic' },
    { id: 'invert', name: 'Invert', description: 'Invert all colors', defaultIntensity: 100, category: 'artistic' },
    { id: 'sepia', name: 'Sepia', description: 'Vintage sepia tone', defaultIntensity: 60, category: 'artistic' },
    { id: 'grayscale', name: 'Grayscale', description: 'Convert to grayscale', defaultIntensity: 100, category: 'artistic' },
    { id: 'posterize', name: 'Posterize', description: 'Reduce color levels', defaultIntensity: 60, category: 'pixel' },
    { id: 'edge-detect', name: 'Edge Detect', description: 'Highlight edges', defaultIntensity: 50, category: 'pixel' },
    { id: 'emboss', name: 'Emboss', description: 'Create embossed effect', defaultIntensity: 50, category: 'pixel' },
    { id: 'vignette', name: 'Vignette', description: 'Dark corners effect', defaultIntensity: 50, category: 'artistic' },
    { id: 'noise', name: 'Noise', description: 'Add grain/noise', defaultIntensity: 20, category: 'pixel' },
    { id: 'dither', name: 'Dither', description: 'Apply dithering pattern', defaultIntensity: 50, category: 'pixel' },
];

// Apply a convolution kernel to image data
function applyKernel(imageData: ImageData, kernel: number[][], divisor: number = 1, offset: number = 0): ImageData {
    const { width, height, data } = imageData;
    const output = new ImageData(width, height);
    const kSize = kernel.length;
    const kHalf = Math.floor(kSize / 2);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0;

            for (let ky = 0; ky < kSize; ky++) {
                for (let kx = 0; kx < kSize; kx++) {
                    const px = Math.min(Math.max(x + kx - kHalf, 0), width - 1);
                    const py = Math.min(Math.max(y + ky - kHalf, 0), height - 1);
                    const idx = (py * width + px) * 4;

                    r += data[idx] * kernel[ky][kx];
                    g += data[idx + 1] * kernel[ky][kx];
                    b += data[idx + 2] * kernel[ky][kx];
                }
            }

            const idx = (y * width + x) * 4;
            output.data[idx] = Math.min(255, Math.max(0, r / divisor + offset));
            output.data[idx + 1] = Math.min(255, Math.max(0, g / divisor + offset));
            output.data[idx + 2] = Math.min(255, Math.max(0, b / divisor + offset));
            output.data[idx + 3] = data[idx + 3];
        }
    }

    return output;
}

// Sharpen filter
export function applySharpen(imageData: ImageData, intensity: number): ImageData {
    const factor = intensity / 100;
    const kernel = [
        [0, -factor, 0],
        [-factor, 1 + 4 * factor, -factor],
        [0, -factor, 0]
    ];
    return applyKernel(imageData, kernel);
}

// Blur filter
export function applyBlur(imageData: ImageData, intensity: number): ImageData {
    const size = Math.ceil(intensity / 20) * 2 + 1;
    const kernel = Array(size).fill(null).map(() => Array(size).fill(1));
    return applyKernel(imageData, kernel, size * size);
}

// Contrast adjustment
export function applyContrast(imageData: ImageData, intensity: number): ImageData {
    const { width, height, data } = imageData;
    const output = new ImageData(width, height);
    const factor = (259 * (intensity * 2.55 + 255)) / (255 * (259 - intensity * 2.55));

    for (let i = 0; i < data.length; i += 4) {
        output.data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
        output.data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
        output.data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
        output.data[i + 3] = data[i + 3];
    }

    return output;
}

// Brightness adjustment
export function applyBrightness(imageData: ImageData, intensity: number): ImageData {
    const { width, height, data } = imageData;
    const output = new ImageData(width, height);
    const adjustment = (intensity - 50) * 2.55;

    for (let i = 0; i < data.length; i += 4) {
        output.data[i] = Math.min(255, Math.max(0, data[i] + adjustment));
        output.data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + adjustment));
        output.data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + adjustment));
        output.data[i + 3] = data[i + 3];
    }

    return output;
}

// Saturation adjustment
export function applySaturation(imageData: ImageData, intensity: number): ImageData {
    const { width, height, data } = imageData;
    const output = new ImageData(width, height);
    const factor = intensity / 50;

    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        output.data[i] = Math.min(255, Math.max(0, gray + factor * (data[i] - gray)));
        output.data[i + 1] = Math.min(255, Math.max(0, gray + factor * (data[i + 1] - gray)));
        output.data[i + 2] = Math.min(255, Math.max(0, gray + factor * (data[i + 2] - gray)));
        output.data[i + 3] = data[i + 3];
    }

    return output;
}

// Hue rotation
export function applyHueRotate(imageData: ImageData, intensity: number): ImageData {
    const { width, height, data } = imageData;
    const output = new ImageData(width, height);
    const angle = (intensity / 100) * 360;
    const cos = Math.cos(angle * Math.PI / 180);
    const sin = Math.sin(angle * Math.PI / 180);

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        output.data[i] = Math.min(255, Math.max(0,
            0.213 + 0.787 * cos - 0.213 * sin) * r +
            (0.715 - 0.715 * cos - 0.715 * sin) * g +
            (0.072 - 0.072 * cos + 0.928 * sin) * b);
        output.data[i + 1] = Math.min(255, Math.max(0,
            (0.213 - 0.213 * cos + 0.143 * sin) * r +
            (0.715 + 0.285 * cos + 0.140 * sin) * g +
            (0.072 - 0.072 * cos - 0.283 * sin) * b));
        output.data[i + 2] = Math.min(255, Math.max(0,
            (0.213 - 0.213 * cos - 0.787 * sin) * r +
            (0.715 - 0.715 * cos + 0.715 * sin) * g +
            (0.072 + 0.928 * cos + 0.072 * sin) * b));
        output.data[i + 3] = data[i + 3];
    }

    return output;
}

// Invert colors
export function applyInvert(imageData: ImageData, intensity: number): ImageData {
    const { width, height, data } = imageData;
    const output = new ImageData(width, height);
    const factor = intensity / 100;

    for (let i = 0; i < data.length; i += 4) {
        output.data[i] = data[i] + factor * (255 - 2 * data[i]);
        output.data[i + 1] = data[i + 1] + factor * (255 - 2 * data[i + 1]);
        output.data[i + 2] = data[i + 2] + factor * (255 - 2 * data[i + 2]);
        output.data[i + 3] = data[i + 3];
    }

    return output;
}

// Sepia tone
export function applySepia(imageData: ImageData, intensity: number): ImageData {
    const { width, height, data } = imageData;
    const output = new ImageData(width, height);
    const factor = intensity / 100;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const sepiaR = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
        const sepiaG = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
        const sepiaB = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);

        output.data[i] = r + factor * (sepiaR - r);
        output.data[i + 1] = g + factor * (sepiaG - g);
        output.data[i + 2] = b + factor * (sepiaB - b);
        output.data[i + 3] = data[i + 3];
    }

    return output;
}

// Grayscale
export function applyGrayscale(imageData: ImageData, intensity: number): ImageData {
    const { width, height, data } = imageData;
    const output = new ImageData(width, height);
    const factor = intensity / 100;

    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        output.data[i] = data[i] + factor * (gray - data[i]);
        output.data[i + 1] = data[i + 1] + factor * (gray - data[i + 1]);
        output.data[i + 2] = data[i + 2] + factor * (gray - data[i + 2]);
        output.data[i + 3] = data[i + 3];
    }

    return output;
}

// Posterize
export function applyPosterize(imageData: ImageData, intensity: number): ImageData {
    const { width, height, data } = imageData;
    const output = new ImageData(width, height);
    const levels = Math.max(2, Math.round((100 - intensity) / 10) + 2);
    const step = 255 / (levels - 1);

    for (let i = 0; i < data.length; i += 4) {
        output.data[i] = Math.round(data[i] / step) * step;
        output.data[i + 1] = Math.round(data[i + 1] / step) * step;
        output.data[i + 2] = Math.round(data[i + 2] / step) * step;
        output.data[i + 3] = data[i + 3];
    }

    return output;
}

// Edge detection
export function applyEdgeDetect(imageData: ImageData, intensity: number): ImageData {
    const kernel = [
        [-1, -1, -1],
        [-1, 8, -1],
        [-1, -1, -1]
    ];
    const edgeData = applyKernel(imageData, kernel);

    // Blend with original based on intensity
    const { width, height, data } = imageData;
    const output = new ImageData(width, height);
    const factor = intensity / 100;

    for (let i = 0; i < data.length; i += 4) {
        output.data[i] = data[i] * (1 - factor) + edgeData.data[i] * factor;
        output.data[i + 1] = data[i + 1] * (1 - factor) + edgeData.data[i + 1] * factor;
        output.data[i + 2] = data[i + 2] * (1 - factor) + edgeData.data[i + 2] * factor;
        output.data[i + 3] = data[i + 3];
    }

    return output;
}

// Emboss effect
export function applyEmboss(imageData: ImageData, intensity: number): ImageData {
    const factor = intensity / 50;
    const kernel = [
        [-2 * factor, -factor, 0],
        [-factor, 1, factor],
        [0, factor, 2 * factor]
    ];
    return applyKernel(imageData, kernel, 1, 128);
}

// Vignette effect
export function applyVignette(imageData: ImageData, intensity: number): ImageData {
    const { width, height, data } = imageData;
    const output = new ImageData(width, height);
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
    const factor = intensity / 100;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) / maxDist;
            const vignette = 1 - (dist * dist * factor);

            output.data[idx] = data[idx] * vignette;
            output.data[idx + 1] = data[idx + 1] * vignette;
            output.data[idx + 2] = data[idx + 2] * vignette;
            output.data[idx + 3] = data[idx + 3];
        }
    }

    return output;
}

// Noise filter
export function applyNoise(imageData: ImageData, intensity: number): ImageData {
    const { width, height, data } = imageData;
    const output = new ImageData(width, height);
    const factor = intensity * 2.55;

    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * factor;
        output.data[i] = Math.min(255, Math.max(0, data[i] + noise));
        output.data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        output.data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
        output.data[i + 3] = data[i + 3];
    }

    return output;
}

// Dithering (Floyd-Steinberg)
export function applyDither(imageData: ImageData, intensity: number): ImageData {
    const { width, height, data } = imageData;
    const output = new ImageData(width, height);
    const workData = new Float32Array(data);
    const levels = Math.max(2, Math.round((100 - intensity) / 10) + 2);
    const step = 255 / (levels - 1);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;

            for (let c = 0; c < 3; c++) {
                const oldVal = workData[idx + c];
                const newVal = Math.round(oldVal / step) * step;
                workData[idx + c] = newVal;
                const error = oldVal - newVal;

                if (x + 1 < width) workData[idx + 4 + c] += error * 7 / 16;
                if (y + 1 < height) {
                    if (x > 0) workData[idx + width * 4 - 4 + c] += error * 3 / 16;
                    workData[idx + width * 4 + c] += error * 5 / 16;
                    if (x + 1 < width) workData[idx + width * 4 + 4 + c] += error * 1 / 16;
                }
            }
        }
    }

    for (let i = 0; i < data.length; i++) {
        output.data[i] = Math.min(255, Math.max(0, Math.round(workData[i])));
    }

    return output;
}

// Main filter application function
export function applyFilter(imageData: ImageData, filter: FilterConfig): ImageData {
    if (filter.type === 'none' || filter.intensity === 0) return imageData;

    switch (filter.type) {
        case 'sharpen': return applySharpen(imageData, filter.intensity);
        case 'blur': return applyBlur(imageData, filter.intensity);
        case 'contrast': return applyContrast(imageData, filter.intensity);
        case 'brightness': return applyBrightness(imageData, filter.intensity);
        case 'saturation': return applySaturation(imageData, filter.intensity);
        case 'hue-rotate': return applyHueRotate(imageData, filter.intensity);
        case 'invert': return applyInvert(imageData, filter.intensity);
        case 'sepia': return applySepia(imageData, filter.intensity);
        case 'grayscale': return applyGrayscale(imageData, filter.intensity);
        case 'posterize': return applyPosterize(imageData, filter.intensity);
        case 'edge-detect': return applyEdgeDetect(imageData, filter.intensity);
        case 'emboss': return applyEmboss(imageData, filter.intensity);
        case 'vignette': return applyVignette(imageData, filter.intensity);
        case 'noise': return applyNoise(imageData, filter.intensity);
        case 'dither': return applyDither(imageData, filter.intensity);
        default: return imageData;
    }
}

// Apply multiple filters in sequence
export function applyFilters(imageData: ImageData, filters: FilterConfig[]): ImageData {
    let result = imageData;
    for (const filter of filters) {
        result = applyFilter(result, filter);
    }
    return result;
}
