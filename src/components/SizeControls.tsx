'use client';

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
    { label: '16', width: 16, height: 16 },
    { label: '32', width: 32, height: 32 },
    { label: '64', width: 64, height: 64 },
    { label: '128', width: 128, height: 128 },
    { label: '256', width: 256, height: 256 },
    { label: '512', width: 512, height: 512 },
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
                        type="number"
                        min="1"
                        max="64"
                        step="0.1"
                        value={pixelSize}
                        onChange={(e) => onPixelSizeChange(Math.max(1, Math.min(64, parseFloat(e.target.value) || 1)))}
                        className="w-16 text-center"
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
                            max="2048"
                            value={outputWidth}
                            onChange={(e) => onOutputWidthChange(Math.max(16, Math.min(2048, parseInt(e.target.value) || 256)))}
                            className="w-full"
                        />
                    </div>
                    <div className="flex-1 min-w-[100px]">
                        <label className="text-sm text-[var(--text-dim)] mb-1 block">HEIGHT</label>
                        <input
                            type="number"
                            min="16"
                            max="2048"
                            value={outputHeight}
                            onChange={(e) => onOutputHeightChange(Math.max(16, Math.min(2048, parseInt(e.target.value) || 256)))}
                            className="w-full"
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
                                className={`text-sm flex-1 ${aspectMode === 'crop' ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ padding: '0.4rem', boxShadow: '2px 2px 0px var(--dim)' }}
                            >
                                CROP
                            </button>
                            <button
                                onClick={() => onAspectModeChange('stretch')}
                                className={`text-sm flex-1 ${aspectMode === 'stretch' ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ padding: '0.4rem', boxShadow: '2px 2px 0px var(--dim)' }}
                            >
                                STRETCH
                            </button>
                        </div>
                    </div>
                )}

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
                        <span className="text-[var(--text-dim)]">:</span>
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
