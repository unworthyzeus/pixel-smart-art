'use client';

import { SmartImageAnalysis, SmartLook } from '@/lib/smartImage';

interface SmartAssistPanelProps {
    analysis: SmartImageAnalysis | null;
    sourceLabel: string | null;
    selectedLookId: string | null;
    isAnalyzing: boolean;
    onApplyLook: (look: SmartLook) => void;
}

function percent(value: number): string {
    return `${Math.round(value * 100)}%`;
}

export default function SmartAssistPanel({
    analysis,
    sourceLabel,
    selectedLookId,
    isAnalyzing,
    onApplyLook
}: SmartAssistPanelProps) {
    if (isAnalyzing) {
        return (
            <div className="smart-panel">
                <div className="flex items-center justify-between gap-3">
                    <span className="section-title compact-title">SMART UPLOAD</span>
                    <span className="text-sm text-[var(--text-dim)] animate-pulse">SCANNING...</span>
                </div>
            </div>
        );
    }

    if (!analysis) return null;

    return (
        <div className="smart-panel">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="section-title compact-title">SMART UPLOAD</div>
                    <div className="text-sm text-[var(--text-dim)]">
                        {sourceLabel || 'IMAGE'} / {analysis.width}x{analysis.height} / {analysis.recommendation}
                    </div>
                </div>
                <div className="smart-metrics" aria-label="Image analysis metrics">
                    <span>DETAIL {percent(analysis.detail)}</span>
                    <span>COLOR {percent(analysis.colorfulness)}</span>
                    <span>CONTRAST {percent(analysis.contrast)}</span>
                </div>
            </div>

            <div className="smart-look-grid">
                {analysis.looks.map((look) => (
                    <button
                        key={look.id}
                        onClick={() => onApplyLook(look)}
                        className={`smart-look ${selectedLookId === look.id ? 'active' : ''}`}
                        title={look.description}
                    >
                        <span className="smart-look-name">{look.name}</span>
                        <span className="smart-look-meta">
                            {look.pixelSize}px / {look.extractedColorCount} colors
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
