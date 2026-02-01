'use client';

import { PALETTES } from '@/lib/palettes';

interface PaletteSelectorProps {
    paletteMode: 'predefined' | 'extracted' | 'custom' | 'none';
    selectedPaletteId: string;
    customPalette: string[];
    extractedColorCount: number;
    samplingMode: 'nearest' | 'average' | 'bilinear' | 'center';
    onPaletteModeChange: (mode: 'predefined' | 'extracted' | 'custom' | 'none') => void;
    onPaletteSelect: (id: string) => void;
    onCustomPaletteChange: (colors: string[]) => void;
    onExtractedCountChange: (count: number) => void;
    onSamplingModeChange: (mode: 'nearest' | 'average' | 'bilinear' | 'center') => void;
}

export default function PaletteSelector({
    paletteMode,
    selectedPaletteId,
    customPalette,
    extractedColorCount,
    samplingMode,
    onPaletteModeChange,
    onPaletteSelect,
    onCustomPaletteChange,
    onExtractedCountChange,
    onSamplingModeChange
}: PaletteSelectorProps) {
    const selectedPalette = PALETTES.find(p => p.id === selectedPaletteId) || PALETTES[0];

    const handleAddColor = () => {
        const newColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        onCustomPaletteChange([...customPalette, newColor]);
    };

    const handleRemoveColor = (index: number) => {
        onCustomPaletteChange(customPalette.filter((_, i) => i !== index));
    };

    const handleColorChange = (index: number, color: string) => {
        const newPalette = [...customPalette];
        newPalette[index] = color;
        onCustomPaletteChange(newPalette);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="section-title">COLOR PALETTE</div>

            {/* Mode Selection */}
            <div className="flex gap-2 flex-wrap">
                {(['none', 'predefined', 'extracted', 'custom'] as const).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => onPaletteModeChange(mode)}
                        className={`text-sm ${paletteMode === mode ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.4rem 0.8rem', boxShadow: '2px 2px 0px var(--dim)' }}
                    >
                        {mode === 'none' ? 'ORIGINAL' : mode.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Predefined Palettes */}
            {paletteMode === 'predefined' && (
                <div className="flex flex-col gap-3">
                    <select
                        value={selectedPaletteId}
                        onChange={(e) => onPaletteSelect(e.target.value)}
                        className="w-full"
                    >
                        {PALETTES.map((palette) => (
                            <option key={palette.id} value={palette.id}>
                                {palette.name.toUpperCase()} ({palette.colors.length})
                            </option>
                        ))}
                    </select>

                    <p className="text-sm text-[var(--text-dim)]">
                        {selectedPalette.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                        {selectedPalette.colors.slice(0, 32).map((color, idx) => (
                            <div
                                key={idx}
                                className="palette-color"
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                        {selectedPalette.colors.length > 32 && (
                            <div className="w-7 h-7 flex items-center justify-center text-sm text-[var(--text-dim)] border-2 border-[var(--border)]">
                                +{selectedPalette.colors.length - 32}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Extracted Palette */}
            {paletteMode === 'extracted' && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                        <label className="text-sm">COLORS:</label>
                        <input
                            type="range"
                            min="2"
                            max="128"
                            value={extractedColorCount}
                            onChange={(e) => onExtractedCountChange(parseInt(e.target.value))}
                            className="flex-1"
                        />
                        <input
                            type="number"
                            min="2"
                            max="256"
                            value={extractedColorCount}
                            onChange={(e) => onExtractedCountChange(Math.max(2, Math.min(256, parseInt(e.target.value) || 16)))}
                            className="w-16 text-center"
                        />
                    </div>
                    <p className="text-sm text-[var(--text-dim)]">
                        Extract dominant colors from image automatically
                    </p>
                </div>
            )}

            {/* Custom Palette */}
            {paletteMode === 'custom' && (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                        {customPalette.map((color, idx) => (
                            <div key={idx} className="relative group">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => handleColorChange(idx, e.target.value)}
                                    className="w-10 h-10 cursor-pointer"
                                    style={{ padding: 0 }}
                                />
                                <button
                                    onClick={() => handleRemoveColor(idx)}
                                    className="absolute -top-1 -right-1 w-4 h-4 text-xs bg-[var(--accent)] text-[var(--background)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                    style={{ boxShadow: 'none', padding: 0, border: 'none' }}
                                >
                                    X
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={handleAddColor}
                            className="w-10 h-10 flex items-center justify-center text-xl"
                            style={{ boxShadow: '2px 2px 0px var(--dim)', padding: 0 }}
                        >
                            +
                        </button>
                    </div>
                    <p className="text-sm text-[var(--text-dim)]">
                        Create your own custom color palette
                    </p>
                </div>
            )}

            {/* None/Original Mode */}
            {paletteMode === 'none' && (
                <div className="flex flex-col gap-3">
                    <p className="text-sm text-[var(--text-dim)]">
                        Use original image colors without palette mapping
                    </p>
                </div>
            )}

            {/* Sampling Mode */}
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <div className="section-title">SAMPLING MODE</div>
                <div className="grid grid-cols-2 gap-2">
                    {(['nearest', 'average', 'bilinear', 'center'] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => onSamplingModeChange(mode)}
                            className={`text-sm ${samplingMode === mode ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '0.4rem', boxShadow: '2px 2px 0px var(--dim)' }}
                        >
                            {mode.toUpperCase()}
                        </button>
                    ))}
                </div>
                <p className="text-sm text-[var(--text-dim)] mt-2">
                    {samplingMode === 'nearest' && 'Fast, sharp edges'}
                    {samplingMode === 'average' && 'Smooth, averages pixel blocks'}
                    {samplingMode === 'bilinear' && 'Smooth interpolation'}
                    {samplingMode === 'center' && 'Sample from block center'}
                </p>
            </div>
        </div>
    );
}
