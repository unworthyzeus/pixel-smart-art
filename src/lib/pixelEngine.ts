// Core Pixel Art Generation Engine

import { findClosestColor, hexToRgb, extractPalette } from './palettes';
import { applyFilters, FilterConfig } from './filters';

export interface PixelArtConfig {
    // Image dimensions
    pixelSize: number;          // Size of each pixel block (1-64)
    outputWidth: number;        // Output width in pixels
    outputHeight: number;       // Output height in pixels

    // Aspect ratio
    aspectRatio: string;        // 'original', '1:1', '4:3', '16:9', '3:2', '2:3', '9:16', '3:4', 'custom'
    aspectMode: 'crop' | 'stretch';  // How to handle aspect ratio mismatch
    customAspectWidth?: number;
    customAspectHeight?: number;

    // Color palette
    paletteMode: 'predefined' | 'extracted' | 'custom' | 'none';
    paletteId?: string;
    customPalette?: string[];
    extractedColorCount?: number;

    // Sampling/interpolation mode
    samplingMode: 'nearest' | 'average' | 'bilinear' | 'center';

    // Filters
    preFilters: FilterConfig[];
    postFilters: FilterConfig[];

    // Additional options
    preserveAspect: boolean;
    smoothing: boolean;
    outline: boolean;
    outlineColor: string;
    backgroundColor: string;
}

export const DEFAULT_CONFIG: PixelArtConfig = {
    pixelSize: 8,
    outputWidth: 512,
    outputHeight: 512,
    aspectRatio: 'original',
    aspectMode: 'stretch',
    paletteMode: 'extracted',
    extractedColorCount: 16,
    samplingMode: 'nearest',
    preFilters: [],
    postFilters: [],
    preserveAspect: true,
    smoothing: false,
    outline: false,
    outlineColor: '#000000',
    backgroundColor: '#000000'
};

export function calculateAspectRatio(
    originalWidth: number,
    originalHeight: number,
    aspectRatio: string,
    customWidth?: number,
    customHeight?: number
): { width: number; height: number } {
    switch (aspectRatio) {
        case 'original':
            return { width: originalWidth, height: originalHeight };
        case '1:1':
            return { width: 1, height: 1 };
        case '4:3':
            return { width: 4, height: 3 };
        case '16:9':
            return { width: 16, height: 9 };
        case '3:2':
            return { width: 3, height: 2 };
        case '2:3':
            return { width: 2, height: 3 };
        case '9:16':
            return { width: 9, height: 16 };
        case '3:4':
            return { width: 3, height: 4 };
        case 'custom':
            return {
                width: customWidth || originalWidth,
                height: customHeight || originalHeight
            };
        default:
            return { width: originalWidth, height: originalHeight };
    }
}

export function scaleToAspect(
    originalWidth: number,
    originalHeight: number,
    targetAspect: { width: number; height: number },
    maxSize: number
): { width: number; height: number } {
    const targetRatio = targetAspect.width / targetAspect.height;
    let width: number, height: number;

    if (targetRatio > 1) {
        width = maxSize;
        height = Math.round(maxSize / targetRatio);
    } else {
        height = maxSize;
        width = Math.round(maxSize * targetRatio);
    }

    return { width, height };
}

// Main pixelation function
export function pixelateImage(
    sourceCanvas: HTMLCanvasElement,
    config: PixelArtConfig,
    palette: string[]
): HTMLCanvasElement {
    const { pixelSize, outputWidth, outputHeight, samplingMode, paletteMode } = config;

    // Create working canvas for pixelation
    const pixelWidth = Math.ceil(outputWidth / pixelSize);
    const pixelHeight = Math.ceil(outputHeight / pixelSize);

    // Create downscale canvas
    const downCanvas = document.createElement('canvas');
    downCanvas.width = pixelWidth;
    downCanvas.height = pixelHeight;
    const downCtx = downCanvas.getContext('2d')!;

    // Set smoothing based on sampling mode
    if (samplingMode === 'bilinear') {
        downCtx.imageSmoothingEnabled = true;
        downCtx.imageSmoothingQuality = 'high';
    } else {
        downCtx.imageSmoothingEnabled = false;
    }

    // Apply sampling mode
    if (samplingMode === 'average') {
        // Manual averaging: sample each pixel block
        const srcCtx = sourceCanvas.getContext('2d')!;
        const srcData = srcCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
        const dstData = downCtx.createImageData(pixelWidth, pixelHeight);

        const blockW = sourceCanvas.width / pixelWidth;
        const blockH = sourceCanvas.height / pixelHeight;

        for (let py = 0; py < pixelHeight; py++) {
            for (let px = 0; px < pixelWidth; px++) {
                let r = 0, g = 0, b = 0, a = 0, count = 0;

                const startX = Math.floor(px * blockW);
                const startY = Math.floor(py * blockH);
                const endX = Math.floor((px + 1) * blockW);
                const endY = Math.floor((py + 1) * blockH);

                for (let sy = startY; sy < endY; sy++) {
                    for (let sx = startX; sx < endX; sx++) {
                        const idx = (sy * sourceCanvas.width + sx) * 4;
                        r += srcData.data[idx];
                        g += srcData.data[idx + 1];
                        b += srcData.data[idx + 2];
                        a += srcData.data[idx + 3];
                        count++;
                    }
                }

                const dstIdx = (py * pixelWidth + px) * 4;
                dstData.data[dstIdx] = Math.round(r / count);
                dstData.data[dstIdx + 1] = Math.round(g / count);
                dstData.data[dstIdx + 2] = Math.round(b / count);
                dstData.data[dstIdx + 3] = Math.round(a / count);
            }
        }
        downCtx.putImageData(dstData, 0, 0);
    } else if (samplingMode === 'center') {
        // Sample from center of each block
        const srcCtx = sourceCanvas.getContext('2d')!;
        const srcData = srcCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
        const dstData = downCtx.createImageData(pixelWidth, pixelHeight);

        const blockW = sourceCanvas.width / pixelWidth;
        const blockH = sourceCanvas.height / pixelHeight;

        for (let py = 0; py < pixelHeight; py++) {
            for (let px = 0; px < pixelWidth; px++) {
                const cx = Math.floor((px + 0.5) * blockW);
                const cy = Math.floor((py + 0.5) * blockH);
                const idx = (cy * sourceCanvas.width + cx) * 4;

                const dstIdx = (py * pixelWidth + px) * 4;
                dstData.data[dstIdx] = srcData.data[idx];
                dstData.data[dstIdx + 1] = srcData.data[idx + 1];
                dstData.data[dstIdx + 2] = srcData.data[idx + 2];
                dstData.data[dstIdx + 3] = srcData.data[idx + 3];
            }
        }
        downCtx.putImageData(dstData, 0, 0);
    } else {
        // Default: nearest neighbor or bilinear (handled by imageSmoothingEnabled)
        downCtx.drawImage(sourceCanvas, 0, 0, pixelWidth, pixelHeight);
    }

    // Get pixel data for palette mapping (only if using a palette)
    if (paletteMode !== 'none' && palette.length > 0) {
        const imageData = downCtx.getImageData(0, 0, pixelWidth, pixelHeight);

        for (let i = 0; i < imageData.data.length; i += 4) {
            const color = {
                r: imageData.data[i],
                g: imageData.data[i + 1],
                b: imageData.data[i + 2]
            };

            if (imageData.data[i + 3] > 0) { // Skip fully transparent
                const closestHex = findClosestColor(color, palette);
                const closest = hexToRgb(closestHex);
                imageData.data[i] = closest.r;
                imageData.data[i + 1] = closest.g;
                imageData.data[i + 2] = closest.b;
            }
        }

        downCtx.putImageData(imageData, 0, 0);
    }

    // Create output canvas at full size
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = pixelWidth * pixelSize;
    outputCanvas.height = pixelHeight * pixelSize;
    const outputCtx = outputCanvas.getContext('2d')!;

    // Fill background
    outputCtx.fillStyle = config.backgroundColor;
    outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

    // Disable smoothing for crisp upscaling
    outputCtx.imageSmoothingEnabled = false;

    // Scale up the pixelated image
    outputCtx.drawImage(
        downCanvas,
        0, 0, pixelWidth, pixelHeight,
        0, 0, outputCanvas.width, outputCanvas.height
    );

    // Apply outline if enabled
    if (config.outline) {
        applyPixelOutline(outputCtx, pixelSize, config.outlineColor);
    }

    return outputCanvas;
}

// Apply pixel grid outline
function applyPixelOutline(ctx: CanvasRenderingContext2D, pixelSize: number, color: string): void {
    const { width, height } = ctx.canvas;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    // Draw vertical lines
    for (let x = pixelSize; x < width; x += pixelSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = pixelSize; y < height; y += pixelSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

// Complete pixel art generation pipeline
export async function generatePixelArt(
    sourceImage: HTMLImageElement | HTMLCanvasElement,
    config: PixelArtConfig,
    palette: string[]
): Promise<HTMLCanvasElement> {
    // Step 1: Create source canvas
    const sourceCanvas = document.createElement('canvas');
    const sourceCtx = sourceCanvas.getContext('2d')!;

    // Calculate dimensions based on aspect ratio
    const originalWidth = sourceImage instanceof HTMLImageElement
        ? sourceImage.naturalWidth
        : sourceImage.width;
    const originalHeight = sourceImage instanceof HTMLImageElement
        ? sourceImage.naturalHeight
        : sourceImage.height;

    const targetAspect = calculateAspectRatio(
        originalWidth,
        originalHeight,
        config.aspectRatio,
        config.customAspectWidth,
        config.customAspectHeight
    );

    // Determine output dimensions
    let outputWidth = config.outputWidth;
    let outputHeight = config.outputHeight;

    if (config.aspectRatio !== 'original') {
        const ratio = targetAspect.width / targetAspect.height;
        if (ratio > 1) {
            outputHeight = Math.round(outputWidth / ratio);
        } else {
            outputWidth = Math.round(outputHeight * ratio);
        }
    } else {
        const originalRatio = originalWidth / originalHeight;
        if (originalRatio > 1) {
            outputHeight = Math.round(outputWidth / originalRatio);
        } else {
            outputWidth = Math.round(outputHeight * originalRatio);
        }
    }

    sourceCanvas.width = outputWidth;
    sourceCanvas.height = outputHeight;

    // Draw source image to canvas (handles cropping or stretching for aspect ratio)
    if (config.aspectRatio !== 'original') {
        if (config.aspectMode === 'stretch') {
            // Stretch: simply draw the full image to fit the new aspect
            sourceCtx.drawImage(sourceImage, 0, 0, outputWidth, outputHeight);
        } else {
            // Crop: center crop to maintain aspect
            const sourceRatio = originalWidth / originalHeight;
            const targetRatio = targetAspect.width / targetAspect.height;

            let sx = 0, sy = 0, sw = originalWidth, sh = originalHeight;

            if (sourceRatio > targetRatio) {
                // Source is wider, crop sides
                sw = originalHeight * targetRatio;
                sx = (originalWidth - sw) / 2;
            } else {
                // Source is taller, crop top/bottom
                sh = originalWidth / targetRatio;
                sy = (originalHeight - sh) / 2;
            }

            sourceCtx.drawImage(sourceImage, sx, sy, sw, sh, 0, 0, outputWidth, outputHeight);
        }
    } else {
        sourceCtx.drawImage(sourceImage, 0, 0, outputWidth, outputHeight);
    }

    // Step 2: Apply pre-filters
    if (config.preFilters.length > 0) {
        let imageData = sourceCtx.getImageData(0, 0, outputWidth, outputHeight);
        imageData = applyFilters(imageData, config.preFilters);
        sourceCtx.putImageData(imageData, 0, 0);
    }

    // Step 3: Pixelate with palette
    const pixelatedCanvas = pixelateImage(sourceCanvas, {
        ...config,
        outputWidth,
        outputHeight
    }, palette);

    // Step 4: Apply post-filters
    if (config.postFilters.length > 0) {
        const ctx = pixelatedCanvas.getContext('2d')!;
        let imageData = ctx.getImageData(0, 0, pixelatedCanvas.width, pixelatedCanvas.height);
        imageData = applyFilters(imageData, config.postFilters);
        ctx.putImageData(imageData, 0, 0);
    }

    return pixelatedCanvas;
}

// Export utilities
export function canvasToBlob(canvas: HTMLCanvasElement, type: string = 'image/png', quality: number = 1): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
            type,
            quality
        );
    });
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string, type: string = 'image/png'): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL(type);
    link.click();
}

// Export as BMP (uncompressed bitmap)
export function downloadAsBMP(canvas: HTMLCanvasElement, filename: string): void {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    // BMP file structure (24-bit uncompressed)
    const rowSize = Math.ceil(width * 3 / 4) * 4; // Row must be multiple of 4 bytes
    const pixelDataSize = rowSize * height;
    const fileSize = 54 + pixelDataSize; // 54 = header size

    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);

    // BMP Header
    view.setUint16(0, 0x4D42, true); // 'BM'
    view.setUint32(2, fileSize, true);
    view.setUint32(6, 0, true); // Reserved
    view.setUint32(10, 54, true); // Pixel data offset

    // DIB Header
    view.setUint32(14, 40, true); // DIB header size
    view.setInt32(18, width, true);
    view.setInt32(22, -height, true); // Negative = top-down
    view.setUint16(26, 1, true); // Color planes
    view.setUint16(28, 24, true); // Bits per pixel
    view.setUint32(30, 0, true); // No compression
    view.setUint32(34, pixelDataSize, true);
    view.setUint32(38, 2835, true); // Horizontal resolution (72 DPI)
    view.setUint32(42, 2835, true); // Vertical resolution
    view.setUint32(46, 0, true); // Colors in palette
    view.setUint32(50, 0, true); // Important colors

    // Pixel data (BGR order)
    let offset = 54;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            view.setUint8(offset++, data[i + 2]); // B
            view.setUint8(offset++, data[i + 1]); // G
            view.setUint8(offset++, data[i]);     // R
        }
        // Padding to 4-byte boundary
        while (offset % 4 !== 0) {
            view.setUint8(offset++, 0);
        }
    }

    const blob = new Blob([buffer], { type: 'image/bmp' });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
}

// Export as PPM (Plain text RGB matrix - Portable Pixmap)
export function downloadAsPPM(canvas: HTMLCanvasElement, filename: string): void {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    // PPM P3 format (ASCII)
    let ppm = `P3\n${width} ${height}\n255\n`;

    for (let y = 0; y < height; y++) {
        const row: string[] = [];
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            row.push(`${data[i]} ${data[i + 1]} ${data[i + 2]}`);
        }
        ppm += row.join(' ') + '\n';
    }

    const blob = new Blob([ppm], { type: 'image/x-portable-pixmap' });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
}

// Export as raw binary (just RGB bytes, no header)
export function downloadAsRaw(canvas: HTMLCanvasElement, filename: string): void {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    // Create RGB buffer (no alpha)
    const buffer = new Uint8Array(width * height * 3);
    let offset = 0;

    for (let i = 0; i < data.length; i += 4) {
        buffer[offset++] = data[i];     // R
        buffer[offset++] = data[i + 1]; // G
        buffer[offset++] = data[i + 2]; // B
    }

    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
}

// Export as JSON matrix
export function downloadAsJSON(canvas: HTMLCanvasElement, filename: string): void {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    const matrix: string[][] = [];

    for (let y = 0; y < height; y++) {
        const row: string[] = [];
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const hex = '#' +
                data[i].toString(16).padStart(2, '0') +
                data[i + 1].toString(16).padStart(2, '0') +
                data[i + 2].toString(16).padStart(2, '0');
            row.push(hex);
        }
        matrix.push(row);
    }

    const json = JSON.stringify({
        width,
        height,
        pixels: matrix
    }, null, 2);

    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
}

// Export as GIF (using canvas approach)
export function downloadAsGIF(canvas: HTMLCanvasElement, filename: string): void {
    // GIF export via data URL (limited browser support, basic)
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/gif');
    link.click();
}

// Export as WebP
export function downloadAsWebP(canvas: HTMLCanvasElement, filename: string, quality: number = 0.9): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/webp', quality);
    link.click();
}

// Re-export palette utilities
export { extractPalette, hexToRgb, findClosestColor };

