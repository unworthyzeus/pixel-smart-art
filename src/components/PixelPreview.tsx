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
            ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
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
                    <div className="absolute inset-0 bg-[var(--background)] flex items-center justify-center z-10" style={{ opacity: 0.9 }}>
                        <div className="flex flex-col items-center gap-4">
                            <div className="loading-spinner" />
                            <span className="text-[var(--text-dim)]">PROCESSING...</span>
                        </div>
                    </div>
                )}

                {!hasContent ? (
                    <div className="flex flex-col items-center gap-4 text-[var(--text-dim)]">
                        <div className="text-4xl">[?]</div>
                        <p>UPLOAD AN IMAGE TO START</p>
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
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-[var(--background)] border-2 border-[var(--border)] p-1">
                        <button
                            onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}
                            className="w-8 h-8 flex items-center justify-center"
                            style={{ boxShadow: 'none', padding: '0.25rem' }}
                        >
                            -
                        </button>
                        <span className="text-sm text-[var(--foreground)] w-12 text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={() => setZoom(z => Math.min(4, z + 0.25))}
                            className="w-8 h-8 flex items-center justify-center"
                            style={{ boxShadow: 'none', padding: '0.25rem' }}
                        >
                            +
                        </button>
                        <button
                            onClick={resetView}
                            className="w-8 h-8 flex items-center justify-center"
                            style={{ boxShadow: 'none', padding: '0.25rem' }}
                            title="Reset view"
                        >
                            R
                        </button>
                    </div>
                )}
            </div>

            {/* Extracted Palette Preview */}
            {extractedPalette.length > 0 && (
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-[var(--text-dim)]">
                        EXTRACTED: {extractedPalette.length} COLORS
                    </span>
                    <div className="flex flex-wrap gap-1">
                        {extractedPalette.map((color, idx) => (
                            <div
                                key={idx}
                                className="palette-color"
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
