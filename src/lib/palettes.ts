// Predefined color palettes for pixel art

export interface ColorPalette {
    id: string;
    name: string;
    colors: string[];
    description: string;
}

export const PALETTES: ColorPalette[] = [
    {
        id: 'gameboy',
        name: 'Game Boy',
        colors: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'],
        description: 'Classic Game Boy green palette'
    },
    {
        id: 'nes',
        name: 'NES Classic',
        colors: ['#000000', '#fcfcfc', '#f8f8f8', '#bcbcbc', '#7c7c7c', '#a4e4fc', '#3cbcfc', '#0078f8', '#0000fc', '#b8b8f8', '#6888fc', '#0058f8', '#0000bc', '#d8b8f8', '#9878f8', '#6844fc', '#4428bc', '#f8b8f8', '#f878f8', '#d800cc', '#940084', '#f8a4c0', '#f85898', '#e40058', '#a80020', '#f0d0b0', '#f87858', '#f83800', '#a81000', '#fce0a8', '#fca044', '#e45c10', '#881400', '#f8d878', '#f8b800', '#ac7c00', '#503000', '#d8f878', '#b8f818', '#00b800', '#007800', '#b8f8b8', '#58d854', '#00a800', '#006800', '#b8f8d8', '#58f898', '#00a844', '#005800', '#00fcfc', '#00e8d8', '#008888', '#004058', '#f8d8f8', '#787878'],
        description: 'Full NES color palette'
    },
    {
        id: 'snes',
        name: 'SNES 16-bit',
        colors: ['#000000', '#1d2b53', '#7e2553', '#008751', '#ab5236', '#5f574f', '#c2c3c7', '#fff1e8', '#ff004d', '#ffa300', '#ffec27', '#00e436', '#29adff', '#83769c', '#ff77a8', '#ffccaa'],
        description: 'SNES inspired 16-color palette'
    },
    {
        id: 'pico8',
        name: 'PICO-8',
        colors: ['#000000', '#1d2b53', '#7e2553', '#008751', '#ab5236', '#5f574f', '#c2c3c7', '#fff1e8', '#ff004d', '#ffa300', '#ffec27', '#00e436', '#29adff', '#83769c', '#ff77a8', '#ffccaa'],
        description: 'Fantasy console PICO-8 palette'
    },
    {
        id: 'commodore64',
        name: 'Commodore 64',
        colors: ['#000000', '#ffffff', '#880000', '#aaffee', '#cc44cc', '#00cc55', '#0000aa', '#eeee77', '#dd8855', '#664400', '#ff7777', '#333333', '#777777', '#aaff66', '#0088ff', '#bbbbbb'],
        description: 'Commodore 64 classic palette'
    },
    {
        id: 'cga',
        name: 'CGA Mode 4',
        colors: ['#000000', '#55ffff', '#ff55ff', '#ffffff'],
        description: 'IBM CGA graphics mode 4'
    },
    {
        id: 'grayscale',
        name: 'Grayscale',
        colors: ['#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080', '#999999', '#b3b3b3', '#cccccc', '#e6e6e6', '#ffffff'],
        description: '11-shade grayscale'
    },
    {
        id: 'sepia',
        name: 'Sepia Tone',
        colors: ['#2b1810', '#4a2c17', '#6b4423', '#8c5c2f', '#ad743b', '#c98c4a', '#e5a55c', '#f5bd72', '#ffd58a', '#ffeda8'],
        description: 'Vintage sepia tones'
    },
    {
        id: 'sunset',
        name: 'Sunset Dreams',
        colors: ['#1a0a1f', '#2d1b3d', '#4a235c', '#6b2d5b', '#8c374a', '#ad4139', '#ce5a2f', '#ef7326', '#ff9c3a', '#ffc55f', '#ffe894'],
        description: 'Warm sunset gradient'
    },
    {
        id: 'ocean',
        name: 'Ocean Depths',
        colors: ['#0a1628', '#0d2137', '#103046', '#134055', '#165064', '#196073', '#1c7082', '#1f8091', '#2290a0', '#25a0af', '#28b0bf'],
        description: 'Cool ocean blues'
    },
    {
        id: 'forest',
        name: 'Forest Moss',
        colors: ['#0a1f0a', '#143214', '#1e461e', '#285a28', '#326e32', '#3c823c', '#469646', '#50aa50', '#5abe5a', '#64d264', '#6ee66e'],
        description: 'Natural forest greens'
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk Neon',
        colors: ['#0a0a14', '#1a0a28', '#2a1450', '#3c1e78', '#5028a0', '#6432c8', '#7846f0', '#00f0ff', '#ff00aa', '#ffff00'],
        description: 'Neon cyberpunk vibes'
    },
    {
        id: 'pastel',
        name: 'Pastel Dreams',
        colors: ['#ffd5dc', '#ffb5c5', '#d5c4e0', '#b5d8eb', '#a5e6d0', '#c5e8b0', '#ebe8a5', '#ffe8c5', '#ffd5b5', '#e8d5c5', '#d5d5e5'],
        description: 'Soft pastel colors'
    },
    {
        id: 'autumn',
        name: 'Autumn Harvest',
        colors: ['#2d1b0e', '#4a2c17', '#6b3d20', '#8c4e29', '#ad5f32', '#ce703b', '#b45a28', '#963c14', '#781e00', '#5a0000'],
        description: 'Warm autumn tones'
    },
    {
        id: 'retrowave',
        name: 'Retrowave',
        colors: ['#2b0f3a', '#4a1c5c', '#6929a0', '#8836e4', '#a54fff', '#c268ff', '#df81ff', '#ff9aff', '#ffb3ff', '#ffccff', '#00ffff', '#ff00ff'],
        description: '80s synthwave aesthetic'
    },
    {
        id: 'earth',
        name: 'Earth Tones',
        colors: ['#1a1410', '#2d241e', '#40342c', '#534439', '#665447', '#796455', '#8c7463', '#9f8471', '#b2947f', '#c5a48d'],
        description: 'Natural earth palette'
    }
];

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

export function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

export function colorDistance(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }): number {
    // Using weighted Euclidean distance that accounts for human perception
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

export function findClosestColor(color: { r: number; g: number; b: number }, palette: string[]): string {
    let closestColor = palette[0];
    let minDistance = Infinity;

    for (const paletteColor of palette) {
        const pColor = hexToRgb(paletteColor);
        const distance = colorDistance(color, pColor);
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = paletteColor;
        }
    }

    return closestColor;
}

// Extract dominant colors from an image using k-means clustering
export function extractPalette(imageData: ImageData, colorCount: number = 16): string[] {
    const pixels: { r: number; g: number; b: number }[] = [];

    // Sample pixels (every 4th pixel for performance)
    for (let i = 0; i < imageData.data.length; i += 16) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const a = imageData.data[i + 3];
        if (a > 128) { // Skip transparent pixels
            pixels.push({ r, g, b });
        }
    }

    if (pixels.length === 0) return ['#000000'];

    // Simple k-means clustering
    let centroids = pixels.slice(0, colorCount).map(p => ({ ...p }));

    for (let iter = 0; iter < 10; iter++) {
        const clusters: { r: number; g: number; b: number }[][] = centroids.map(() => []);

        // Assign pixels to nearest centroid
        for (const pixel of pixels) {
            let minDist = Infinity;
            let closestIdx = 0;
            for (let i = 0; i < centroids.length; i++) {
                const dist = colorDistance(pixel, centroids[i]);
                if (dist < minDist) {
                    minDist = dist;
                    closestIdx = i;
                }
            }
            clusters[closestIdx].push(pixel);
        }

        // Update centroids
        for (let i = 0; i < centroids.length; i++) {
            if (clusters[i].length > 0) {
                centroids[i] = {
                    r: clusters[i].reduce((s, p) => s + p.r, 0) / clusters[i].length,
                    g: clusters[i].reduce((s, p) => s + p.g, 0) / clusters[i].length,
                    b: clusters[i].reduce((s, p) => s + p.b, 0) / clusters[i].length
                };
            }
        }
    }

    // Sort by luminance
    centroids.sort((a, b) => {
        const lumA = 0.299 * a.r + 0.587 * a.g + 0.114 * a.b;
        const lumB = 0.299 * b.r + 0.587 * b.g + 0.114 * b.b;
        return lumA - lumB;
    });

    return centroids.map(c => rgbToHex(c.r, c.g, c.b));
}
