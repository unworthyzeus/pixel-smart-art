'use client';

import { PALETTES, ColorPalette } from '@/lib/palettes';

interface PaletteSelectorProps {
    paletteMode: 'predefined' | 'extracted' | 'custom';
    selectedPaletteId: string;
    customPalette: string[];
    extractedColorCount: number;
    onPaletteModeChange: (mode: 'predefined' | 'extracted' | 'custom') => void;
    onPaletteSelect: (id: string) => void;
    onCustomPaletteChange: (colors: string[]) => void;
    onExtractedCountChange: (count: number) => void;
}

export default function PaletteSelector({
    paletteMode,
    selectedPaletteId,
    customPalette,
    extractedColorCount,
    onPaletteModeChange,
    onPaletteSelect,
    onCustomPaletteChange,
    onExtractedCountChange
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
            <div className="section-title">Color Palette</div>

            {/* Mode Selection */}
            <div className="flex gap-2 flex-wrap">
                {(['predefined', 'extracted', 'custom'] as const).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => onPaletteModeChange(mode)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${paletteMode === mode
                                ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]'
                                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                            }`}
                    >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
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
                                {palette.name} ({palette.colors.length} colors)
                            </option>
                        ))}
                    </select>

                    <p className="text-xs text-[var(--text-muted)]">
                        {selectedPalette.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {selectedPalette.colors.slice(0, 24).map((color, idx) => (
                            <div
                                key={idx}
                                className="palette-color"
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                        {selectedPalette.colors.length > 24 && (
                            <div className="w-8 h-8 flex items-center justify-center text-xs text-[var(--text-muted)]">
                                +{selectedPalette.colors.length - 24}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Extracted Palette */}
            {paletteMode === 'extracted' && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                        <label className="text-sm">Colors:</label>
                        <input
                            type="range"
                            min="2"
                            max="32"
                            value={extractedColorCount}
                            onChange={(e) => onExtractedCountChange(parseInt(e.target.value))}
                            className="flex-1"
                        />
                        <span className="text-[var(--accent-primary)] font-mono w-8">{extractedColorCount}</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                        Automatically extract dominant colors from your image using AI clustering
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
                                    className="w-10 h-10 rounded-lg cursor-pointer border-2 border-transparent hover:border-[var(--accent-primary)] transition-all"
                                />
                                <button
                                    onClick={() => handleRemoveColor(idx)}
                                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={handleAddColor}
                            className="w-10 h-10 rounded-lg border-2 border-dashed border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all"
                        >
                            +
                        </button>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                        Create your own custom color palette
                    </p>
                </div>
            )}
        </div>
    );
}
