'use client';

import { useState, useEffect } from 'react';

interface SizeControlsProps {
    pixelSize: number;
    outputWidth: number;
    outputHeight: number;
    aspectRatio: string;
    aspectMode: 'crop' | 'stretch';
    customAspectWidth: number;
    customAspectHeight: number;
    onPixelSizeChange: (size: number) => void;
    onOutputWidthChange: (width: number) => void;
    onOutputHeightChange: (height: number) => void;
    onAspectRatioChange: (ratio: string) => void;
    onAspectModeChange: (mode: 'crop' | 'stretch') => void;
    onCustomAspectChange: (width: number, height: number) => void;
}

const ASPECT_RATIOS = [
    { id: 'original', label: 'ORIG' },
    { id: '1:1', label: '1:1' },
    { id: '4:3', label: '4:3' },
    { id: '16:9', label: '16:9' },
    { id: '3:2', label: '3:2' },
    { id: '2:3', label: '2:3' },
    { id: '9:16', label: '9:16' },
    { id: '3:4', label: '3:4' },
    { id: 'custom', label: 'CUSTOM' },
];

const PRESET_SIZES = [
    { label: '64', width: 64, height: 64 },
    { label: '128', width: 128, height: 128 },
    { label: '256', width: 256, height: 256 },
    { label: '512', width: 512, height: 512 },
    { label: '1024', width: 1024, height: 1024 },
    { label: '2048', width: 2048, height: 2048 },
];

export default function SizeControls({
    pixelSize,
    outputWidth,
    outputHeight,
    aspectRatio,
    aspectMode,
    customAspectWidth,
    customAspectHeight,
    onPixelSizeChange,
    onOutputWidthChange,
    onOutputHeightChange,
    onAspectRatioChange,
    onAspectModeChange,
    onCustomAspectChange
}: SizeControlsProps) {
    const pixelCount = Math.ceil(outputWidth / pixelSize) * Math.ceil(outputHeight / pixelSize);

    // Local state to allow typing decimals like "2." without React forcing it back to "2"
    const [localSize, setLocalSize] = useState(pixelSize.toString());

    // Sync local state with prop when prop changes externally (e.g. slider)
    useEffect(() => {
        const currentNum = parseFloat(localSize);
        // Only update if they differ significantly, allowing "2." and "2" to coexist
        if (isNaN(currentNum) || Math.abs(currentNum - pixelSize) > 0.001) {
            setLocalSize(pixelSize.toString());
        }
    }, [pixelSize]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalSize(val);

        const num = parseFloat(val);
        if (!isNaN(num)) {
            // Only notify parent if valid number (we don't clamp immediately to allow typing)
            onPixelSizeChange(Math.min(64, num));
        }
    };

    const handleBlur = () => {
        // On blur, force strict sync/clamping
        const num = parseFloat(localSize);
        if (isNaN(num)) {
            setLocalSize(pixelSize.toString());
        } else {
            const clamped = Math.max(1, Math.min(64, num));
            setLocalSize(clamped.toString());
            onPixelSizeChange(clamped);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Pixel Size */}
            <div>
                <div className="section-title">PIXEL SIZE</div>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="1"
                        max="64"
                        step="0.5"
                        value={pixelSize}
                        onChange={(e) => onPixelSizeChange(parseFloat(e.target.value))}
                        className="flex-1"
                    />
                    <input
                        type="text"
                        inputMode="decimal"
                        value={localSize}
                        onChange={handleTextChange}
                        onBlur={handleBlur}
                        className="w-16 text-center bg-[var(--input-bg)] border border-[var(--dim)] rounded text-[var(--foreground)]"
                    />
                </div>
                <div className="flex justify-between mt-2 text-sm text-[var(--text-dim)]">
                    <span>FINE</span>
                    <span>{pixelCount.toLocaleString()} PX</span>
                    <span>CHUNKY</span>
                </div>
            </div>

            {/* Output Size */}
            <div>
                <div className="section-title">OUTPUT SIZE</div>
                <div className="flex gap-4 flex-wrap">
                    <div className="flex-1 min-w-[100px]">
                        <label className="text-sm text-[var(--text-dim)] mb-1 block">WIDTH</label>
                        <input
                            type="number"
                            min="16"
                            max="4096"
                            value={outputWidth}
                            onChange={(e) => onOutputWidthChange(Math.max(16, Math.min(4096, parseInt(e.target.value) || 256)))}
                            className="w-full bg-[var(--input-bg)] border border-[var(--dim)] rounded text-[var(--foreground)] px-2 py-1"
                        />
                    </div>
                    <div className="flex-1 min-w-[100px]">
                        <label className="text-sm text-[var(--text-dim)] mb-1 block">HEIGHT</label>
                        <input
                            type="number"
                            min="16"
                            max="4096"
                            value={outputHeight}
                            onChange={(e) => onOutputHeightChange(Math.max(16, Math.min(4096, parseInt(e.target.value) || 256)))}
                            className="w-full bg-[var(--input-bg)] border border-[var(--dim)] rounded text-[var(--foreground)] px-2 py-1"
                        />
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
                            className={`text-sm ${outputWidth === preset.width && outputHeight === preset.height
                                ? 'btn-primary'
                                : 'btn-secondary'
                                }`}
                            style={{ padding: '0.25rem 0.5rem', boxShadow: '2px 2px 0px var(--dim)' }}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Aspect Ratio */}
            <div>
                <div className="section-title">ASPECT RATIO</div>
                <div className="grid grid-cols-3 gap-2">
                    {ASPECT_RATIOS.map((ratio) => (
                        <button
                            key={ratio.id}
                            onClick={() => onAspectRatioChange(ratio.id)}
                            className={`text-sm ${aspectRatio === ratio.id ? 'btn-primary' : 'btn-secondary'
                                }`}
                            style={{ padding: '0.4rem', boxShadow: '2px 2px 0px var(--dim)' }}
                        >
                            {ratio.label}
                        </button>
                    ))}
                </div>

                {/* Aspect Mode - only show when not original */}
                {aspectRatio !== 'original' && (
                    <div className="mt-3">
                        <label className="text-sm text-[var(--text-dim)] mb-2 block">MODE</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onAspectModeChange('crop')}
                                className={`flex-1 text-sm ${aspectMode === 'crop' ? 'btn-primary' : 'btn-secondary'}`}
                            >
                                CROP
                            </button>
                            <button
                                onClick={() => onAspectModeChange('stretch')}
                                className={`flex-1 text-sm ${aspectMode === 'stretch' ? 'btn-primary' : 'btn-secondary'}`}
                            >
                                STRETCH
                            </button>
                        </div>
                    </div>
                )}

                {/* Custom Aspect Ratio Inputs */}
                {aspectRatio === 'custom' && (
                    <div className="mt-3 flex gap-2 items-center">
                        <input
                            type="number"
                            min="1"
                            value={customAspectWidth}
                            onChange={(e) => onCustomAspectChange(parseInt(e.target.value) || 1, customAspectHeight)}
                            className="w-16 text-center bg-[var(--input-bg)] border border-[var(--dim)] rounded text-[var(--foreground)]"
                        />
                        <span className="text-[var(--text-dim)]">:</span>
                        <input
                            type="number"
                            min="1"
                            value={customAspectHeight}
                            onChange={(e) => onCustomAspectChange(customAspectWidth, parseInt(e.target.value) || 1)}
                            className="w-16 text-center bg-[var(--input-bg)] border border-[var(--dim)] rounded text-[var(--foreground)]"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
