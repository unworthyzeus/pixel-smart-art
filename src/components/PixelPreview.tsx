'use client';

import { useRef, useEffect, useState } from 'react';

interface PixelPreviewProps {
    originalImage: HTMLImageElement | null;
    pixelatedCanvas: HTMLCanvasElement | null;
    showOriginal: boolean;
    showGrid: boolean;
    pixelSize: number;
    isProcessing: boolean;
    extractedPalette: string[];
}

export default function PixelPreview({
    originalImage,
    pixelatedCanvas,
    showOriginal,
    showGrid,
    pixelSize,
    isProcessing,
    extractedPalette
}: PixelPreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const displayCanvas = showOriginal && originalImage ? null : pixelatedCanvas;

        if (showOriginal && originalImage) {
            canvas.width = originalImage.naturalWidth;
            canvas.height = originalImage.naturalHeight;
            ctx.drawImage(originalImage, 0, 0);
        } else if (pixelatedCanvas) {
            canvas.width = pixelatedCanvas.width;
            canvas.height = pixelatedCanvas.height;
            ctx.drawImage(pixelatedCanvas, 0, 0);
        } else if (originalImage) {
            canvas.width = originalImage.naturalWidth;
            canvas.height = originalImage.naturalHeight;
            ctx.drawImage(originalImage, 0, 0);
        }

        // Draw grid overlay
        if (showGrid && !showOriginal && pixelatedCanvas) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;

            for (let x = pixelSize; x < canvas.width; x += pixelSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            for (let y = pixelSize; y < canvas.height; y += pixelSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        }
    }, [originalImage, pixelatedCanvas, showOriginal, showGrid, pixelSize]);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(z => Math.min(Math.max(0.25, z * delta), 4));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const resetView = () => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    const hasContent = originalImage || pixelatedCanvas;

    return (
        <div className="flex flex-col gap-4">
            {/* Preview Container */}
            <div
                ref={containerRef}
                className={`pixel-preview ${hasContent ? 'has-image' : ''} relative`}
                style={{ minHeight: '400px', overflow: 'hidden' }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {isProcessing && (
                    <div className="absolute inset-0 bg-[var(--bg-primary)]/80 flex items-center justify-center z-10">
                        <div className="flex flex-col items-center gap-4">
                            <div className="loading-spinner" />
                            <span className="text-[var(--text-secondary)]">Processing...</span>
                        </div>
                    </div>
                )}

                {!hasContent ? (
                    <div className="flex flex-col items-center gap-4 text-[var(--text-muted)]">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>Upload an image to start</p>
                    </div>
                ) : (
                    <div
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                            transformOrigin: 'center center',
                            cursor: isDragging ? 'grabbing' : 'grab',
                            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                        }}
                    >
                        <canvas
                            ref={canvasRef}
                            style={{
                                imageRendering: 'pixelated',
                                maxWidth: '100%',
                                maxHeight: '100%'
                            }}
                        />
                    </div>
                )}

                {/* Zoom Controls */}
                {hasContent && (
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-[var(--bg-secondary)]/90 backdrop-blur-sm rounded-lg p-2">
                        <button
                            onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-tertiary)] transition-colors"
                        >
                            −
                        </button>
                        <span className="text-sm text-[var(--text-secondary)] w-12 text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={() => setZoom(z => Math.min(4, z + 0.25))}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-tertiary)] transition-colors"
                        >
                            +
                        </button>
                        <div className="w-px h-4 bg-[var(--border-color)]" />
                        <button
                            onClick={resetView}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-tertiary)] transition-colors"
                            title="Reset view"
                        >
                            ⟲
                        </button>
                    </div>
                )}
            </div>

            {/* Extracted Palette Preview */}
            {extractedPalette.length > 0 && (
                <div className="flex flex-col gap-2">
                    <span className="text-xs text-[var(--text-muted)]">
                        Extracted Colors ({extractedPalette.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                        {extractedPalette.map((color, idx) => (
                            <div
                                key={idx}
                                className="w-6 h-6 rounded transition-all hover:scale-125"
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
