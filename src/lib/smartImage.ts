import { FilterConfig } from './filters';

export type SmartLookId = 'clean' | 'retro' | 'detailed';

export interface SmartLook {
    id: SmartLookId;
    name: string;
    description: string;
    pixelSize: number;
    outputWidth: number;
    outputHeight: number;
    paletteMode: 'predefined' | 'extracted' | 'custom' | 'none';
    selectedPaletteId?: string;
    extractedColorCount: number;
    samplingMode: 'nearest' | 'average' | 'bilinear' | 'center';
    preFilters: FilterConfig[];
    postFilters: FilterConfig[];
}

export interface SmartImageAnalysis {
    width: number;
    height: number;
    orientation: 'square' | 'landscape' | 'portrait';
    megapixels: number;
    brightness: number;
    contrast: number;
    saturation: number;
    detail: number;
    colorfulness: number;
    recommendation: string;
    looks: SmartLook[];
    recommendedLookId: SmartLookId;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function getOrientation(width: number, height: number): SmartImageAnalysis['orientation'] {
    const ratio = width / height;
    if (ratio > 1.12) return 'landscape';
    if (ratio < 0.88) return 'portrait';
    return 'square';
}

function getOutputSize(width: number, height: number, longSide: number): { outputWidth: number; outputHeight: number } {
    const ratio = width / height;
    if (ratio >= 1) {
        return {
            outputWidth: longSide,
            outputHeight: Math.max(16, Math.round(longSide / ratio))
        };
    }

    return {
        outputWidth: Math.max(16, Math.round(longSide * ratio)),
        outputHeight: longSide
    };
}

export async function analyzeImageForPixelArt(image: HTMLImageElement): Promise<SmartImageAnalysis> {
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    const orientation = getOrientation(width, height);
    const megapixels = (width * height) / 1_000_000;

    const maxSide = 128;
    const scale = Math.min(1, maxSide / Math.max(width, height));
    const sampleWidth = Math.max(1, Math.round(width * scale));
    const sampleHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(image, 0, 0, sampleWidth, sampleHeight);

    await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
    });

    const { data } = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
    const lumas = new Float32Array(sampleWidth * sampleHeight);
    let lumaSum = 0;
    let saturationSum = 0;
    let colorfulnessSum = 0;
    let count = 0;

    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
        const alpha = data[i + 3];
        if (alpha < 16) continue;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;

        lumas[p] = luma;
        lumaSum += luma;
        saturationSum += max === 0 ? 0 : (max - min) / max;
        colorfulnessSum += (Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r)) / 765;
        count++;
    }

    const brightness = count === 0 ? 0.5 : lumaSum / count / 255;
    let variance = 0;
    let edgeSum = 0;
    let edgeCount = 0;
    const meanLuma = brightness * 255;

    for (let y = 0; y < sampleHeight; y++) {
        for (let x = 0; x < sampleWidth; x++) {
            const idx = y * sampleWidth + x;
            const luma = lumas[idx];
            variance += (luma - meanLuma) * (luma - meanLuma);

            if (x > 0) {
                edgeSum += Math.abs(luma - lumas[idx - 1]);
                edgeCount++;
            }
            if (y > 0) {
                edgeSum += Math.abs(luma - lumas[idx - sampleWidth]);
                edgeCount++;
            }
        }
    }

    const contrast = clamp(Math.sqrt(variance / Math.max(1, sampleWidth * sampleHeight)) / 96, 0, 1);
    const saturation = clamp(saturationSum / Math.max(1, count), 0, 1);
    const detail = clamp((edgeSum / Math.max(1, edgeCount)) / 44, 0, 1);
    const colorfulness = clamp(colorfulnessSum / Math.max(1, count), 0, 1);

    const colorCount = clamp(
        Math.round(8 + colorfulness * 18 + detail * 10 + saturation * 8),
        8,
        36
    );
    const autoLongSide = megapixels > 8 || detail > 0.55 ? 768 : 512;
    const cleanOutput = getOutputSize(width, height, autoLongSide);
    const retroOutput = getOutputSize(width, height, 512);
    const detailedOutput = getOutputSize(width, height, megapixels > 5 ? 1024 : 768);

    const basePreFilters: FilterConfig[] = [];
    if (contrast < 0.33) basePreFilters.push({ type: 'contrast', intensity: 18 });
    if (saturation < 0.25 && colorfulness > 0.08) basePreFilters.push({ type: 'saturation', intensity: 58 });
    if (detail < 0.35) basePreFilters.push({ type: 'sharpen', intensity: 22 });

    const cleanPixelSize = detail > 0.6 ? 2.5 : detail < 0.3 ? 4.5 : 3.5;
    const retroPixelSize = detail > 0.55 ? 4.5 : 5.5;
    const detailedPixelSize = detail > 0.65 ? 1.5 : 2.25;

    const looks: SmartLook[] = [
        {
            id: 'clean',
            name: 'Clean',
            description: 'Fast balanced result with extracted colors.',
            pixelSize: cleanPixelSize,
            outputWidth: cleanOutput.outputWidth,
            outputHeight: cleanOutput.outputHeight,
            paletteMode: 'extracted',
            extractedColorCount: colorCount,
            samplingMode: 'nearest',
            preFilters: basePreFilters,
            postFilters: []
        },
        {
            id: 'retro',
            name: 'Retro',
            description: 'Chunkier console-style palette and dither.',
            pixelSize: retroPixelSize,
            outputWidth: retroOutput.outputWidth,
            outputHeight: retroOutput.outputHeight,
            paletteMode: 'predefined',
            selectedPaletteId: colorfulness > 0.18 ? 'pico8' : 'gameboy',
            extractedColorCount: 16,
            samplingMode: 'nearest',
            preFilters: contrast < 0.42 ? [{ type: 'contrast', intensity: 22 }] : [],
            postFilters: [{ type: 'dither', intensity: 34 }]
        },
        {
            id: 'detailed',
            name: 'Detailed',
            description: 'More pixels and a richer smart palette.',
            pixelSize: detailedPixelSize,
            outputWidth: detailedOutput.outputWidth,
            outputHeight: detailedOutput.outputHeight,
            paletteMode: 'extracted',
            extractedColorCount: clamp(colorCount + 12, 18, 48),
            samplingMode: 'center',
            preFilters: [
                ...basePreFilters,
                { type: 'sharpen', intensity: detail > 0.6 ? 18 : 28 }
            ],
            postFilters: []
        }
    ];

    const recommendedLookId: SmartLookId = detail > 0.58 || megapixels > 6 ? 'detailed' : colorfulness > 0.18 ? 'clean' : 'retro';
    const recommendation = [
        orientation.toUpperCase(),
        detail > 0.58 ? 'HIGH DETAIL' : detail < 0.28 ? 'SOFT DETAIL' : 'BALANCED DETAIL',
        colorfulness > 0.18 ? 'RICH COLOR' : 'LIMITED COLOR'
    ].join(' / ');

    return {
        width,
        height,
        orientation,
        megapixels,
        brightness,
        contrast,
        saturation,
        detail,
        colorfulness,
        recommendation,
        looks,
        recommendedLookId
    };
}
