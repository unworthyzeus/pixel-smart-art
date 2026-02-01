'use client';

import { FILTERS, FilterConfig, FilterType } from '@/lib/filters';

interface FilterControlsProps {
    label: string;
    filters: FilterConfig[];
    onFiltersChange: (filters: FilterConfig[]) => void;
}

export default function FilterControls({ label, filters, onFiltersChange }: FilterControlsProps) {
    const activeFilters = filters.filter(f => f.type !== 'none');

    const handleAddFilter = (type: FilterType) => {
        const filterDef = FILTERS.find(f => f.id === type)!;
        onFiltersChange([...filters, { type, intensity: filterDef.defaultIntensity }]);
    };

    const handleRemoveFilter = (index: number) => {
        onFiltersChange(filters.filter((_, i) => i !== index));
    };

    const handleIntensityChange = (index: number, intensity: number) => {
        const newFilters = [...filters];
        newFilters[index] = { ...newFilters[index], intensity };
        onFiltersChange(newFilters);
    };

    const availableFilters = FILTERS.filter(
        f => f.id !== 'none' && !filters.some(af => af.type === f.id)
    );

    const filtersByCategory = {
        basic: availableFilters.filter(f => f.category === 'basic'),
        artistic: availableFilters.filter(f => f.category === 'artistic'),
        pixel: availableFilters.filter(f => f.category === 'pixel')
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="section-title">{label}</div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
                <div className="flex flex-col gap-2">
                    {filters.map((filter, idx) => {
                        const filterDef = FILTERS.find(f => f.id === filter.type)!;
                        return (
                            <div
                                key={idx}
                                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">{filterDef.name}</span>
                                        <button
                                            onClick={() => handleRemoveFilter(idx)}
                                            className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={filter.intensity}
                                            onChange={(e) => handleIntensityChange(idx, parseInt(e.target.value))}
                                            className="flex-1"
                                        />
                                        <span className="text-xs text-[var(--accent-primary)] font-mono w-8">
                                            {filter.intensity}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Filter */}
            {availableFilters.length > 0 && (
                <div className="flex flex-col gap-2">
                    <span className="text-xs text-[var(--text-muted)]">Add Filter:</span>

                    {Object.entries(filtersByCategory).map(([category, categoryFilters]) => (
                        categoryFilters.length > 0 && (
                            <div key={category} className="flex flex-wrap gap-1">
                                <span className="text-xs text-[var(--text-secondary)] w-full mb-1 capitalize">{category}</span>
                                {categoryFilters.map((filter) => (
                                    <button
                                        key={filter.id}
                                        onClick={() => handleAddFilter(filter.id)}
                                        className="px-2 py-1 text-xs rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all"
                                        title={filter.description}
                                    >
                                        {filter.name}
                                    </button>
                                ))}
                            </div>
                        )
                    ))}
                </div>
            )}

            {activeFilters.length === 0 && (
                <p className="text-xs text-[var(--text-muted)]">
                    No filters applied. Add filters to modify the image.
                </p>
            )}
        </div>
    );
}
