'use client';

interface SizeControlsProps {
    pixelSize: number;
    outputWidth: number;
    outputHeight: number;
    aspectRatio: string;
    customAspectWidth: number;
    customAspectHeight: number;
    onPixelSizeChange: (size: number) => void;
    onOutputWidthChange: (width: number) => void;
    onOutputHeightChange: (height: number) => void;
    onAspectRatioChange: (ratio: string) => void;
    onCustomAspectChange: (width: number, height: number) => void;
}

const ASPECT_RATIOS = [
    { id: 'original', label: 'Original', icon: '⬛' },
    { id: '1:1', label: '1:1', icon: '◼' },
    { id: '4:3', label: '4:3', icon: '▬' },
    { id: '16:9', label: '16:9', icon: '▭' },
    { id: '3:2', label: '3:2', icon: '▬' },
    { id: '2:3', label: '2:3', icon: '▮' },
    { id: '9:16', label: '9:16', icon: '▯' },
    { id: '3:4', label: '3:4', icon: '▮' },
    { id: 'custom', label: 'Custom', icon: '⚙' },
];

const PRESET_SIZES = [
    { label: '16×16', width: 16, height: 16 },
    { label: '32×32', width: 32, height: 32 },
    { label: '64×64', width: 64, height: 64 },
    { label: '128×128', width: 128, height: 128 },
    { label: '256×256', width: 256, height: 256 },
    { label: '512×512', width: 512, height: 512 },
];

export default function SizeControls({
    pixelSize,
    outputWidth,
    outputHeight,
    aspectRatio,
    customAspectWidth,
    customAspectHeight,
    onPixelSizeChange,
    onOutputWidthChange,
    onOutputHeightChange,
    onAspectRatioChange,
    onCustomAspectChange
}: SizeControlsProps) {
    const pixelCount = Math.ceil(outputWidth / pixelSize) * Math.ceil(outputHeight / pixelSize);

    return (
        <div className="flex flex-col gap-4">
            {/* Pixel Size */}
            <div>
                <div className="section-title">Pixel Size</div>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="1"
                        max="64"
                        value={pixelSize}
                        onChange={(e) => onPixelSizeChange(parseInt(e.target.value))}
                        className="flex-1"
                    />
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="1"
                            max="64"
                            value={pixelSize}
                            onChange={(e) => onPixelSizeChange(Math.max(1, Math.min(64, parseInt(e.target.value) || 1)))}
                            className="w-16 text-center"
                        />
                        <span className="text-xs text-[var(--text-muted)]">px</span>
                    </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-[var(--text-muted)]">
                    <span>Fine detail</span>
                    <span>~{pixelCount.toLocaleString()} pixels</span>
                    <span>Chunky pixels</span>
                </div>
            </div>

            {/* Output Size */}
            <div>
                <div className="section-title">Output Size</div>
                <div className="flex gap-4 flex-wrap">
                    <div className="flex-1 min-w-[120px]">
                        <label className="text-xs text-[var(--text-muted)] mb-1 block">Width</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="16"
                                max="2048"
                                value={outputWidth}
                                onChange={(e) => onOutputWidthChange(Math.max(16, Math.min(2048, parseInt(e.target.value) || 256)))}
                                className="w-full"
                            />
                            <span className="text-xs text-[var(--text-muted)]">px</span>
                        </div>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                        <label className="text-xs text-[var(--text-muted)] mb-1 block">Height</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="16"
                                max="2048"
                                value={outputHeight}
                                onChange={(e) => onOutputHeightChange(Math.max(16, Math.min(2048, parseInt(e.target.value) || 256)))}
                                className="w-full"
                            />
                            <span className="text-xs text-[var(--text-muted)]">px</span>
                        </div>
                    </div>
                </div>

                {/* Preset Sizes */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {PRESET_SIZES.map((preset) => (
                        <button
                            key={preset.label}
                            onClick={() => {
                                onOutputWidthChange(preset.width);
                                onOutputHeightChange(preset.height);
                            }}
                            className={`px-2 py-1 text-xs rounded transition-all ${outputWidth === preset.width && outputHeight === preset.height
                                    ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]'
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                }`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Aspect Ratio */}
            <div>
                <div className="section-title">Aspect Ratio</div>
                <div className="grid grid-cols-3 gap-2">
                    {ASPECT_RATIOS.map((ratio) => (
                        <button
                            key={ratio.id}
                            onClick={() => onAspectRatioChange(ratio.id)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${aspectRatio === ratio.id
                                    ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]'
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                }`}
                        >
                            <span className="text-lg">{ratio.icon}</span>
                            <span className="text-xs">{ratio.label}</span>
                        </button>
                    ))}
                </div>

                {/* Custom Aspect Ratio */}
                {aspectRatio === 'custom' && (
                    <div className="flex items-center gap-2 mt-3">
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={customAspectWidth}
                            onChange={(e) => onCustomAspectChange(Math.max(1, parseInt(e.target.value) || 1), customAspectHeight)}
                            className="w-16 text-center"
                        />
                        <span className="text-[var(--text-muted)]">:</span>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={customAspectHeight}
                            onChange={(e) => onCustomAspectChange(customAspectWidth, Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 text-center"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
