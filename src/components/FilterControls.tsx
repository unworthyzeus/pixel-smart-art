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
            <div className="section-title">{label.toUpperCase()}</div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
                <div className="flex flex-col gap-2">
                    {filters.map((filter, idx) => {
                        const filterDef = FILTERS.find(f => f.id === filter.type)!;
                        return (
                            <div
                                key={idx}
                                className="p-3 border-2 border-[var(--border)] bg-[var(--input-bg)]"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm">{filterDef.name.toUpperCase()}</span>
                                    <button
                                        onClick={() => handleRemoveFilter(idx)}
                                        className="text-[var(--text-dim)] hover:text-[var(--accent)]"
                                        style={{ boxShadow: 'none', padding: '0.25rem', border: 'none', background: 'transparent' }}
                                    >
                                        X
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
                                    <span className="text-sm text-[var(--foreground)] w-10 text-right">
                                        {filter.intensity}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Filter */}
            {availableFilters.length > 0 && (
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-[var(--text-dim)]">ADD FILTER:</span>

                    {Object.entries(filtersByCategory).map(([category, categoryFilters]) => (
                        categoryFilters.length > 0 && (
                            <div key={category} className="flex flex-wrap gap-1">
                                <span className="text-sm text-[var(--text-dim)] w-full mb-1">{category.toUpperCase()}</span>
                                {categoryFilters.map((filter) => (
                                    <button
                                        key={filter.id}
                                        onClick={() => handleAddFilter(filter.id)}
                                        className="text-sm btn-secondary"
                                        style={{ padding: '0.2rem 0.4rem', boxShadow: '2px 2px 0px var(--dim)' }}
                                        title={filter.description}
                                    >
                                        {filter.name.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        )
                    ))}
                </div>
            )}

            {activeFilters.length === 0 && (
                <p className="text-sm text-[var(--text-dim)]">
                    NO FILTERS APPLIED
                </p>
            )}
        </div>
    );
}
