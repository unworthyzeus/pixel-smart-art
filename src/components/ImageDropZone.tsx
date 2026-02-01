'use client';

import { useRef, useCallback, useState } from 'react';

interface ImageDropZoneProps {
    onImageLoad: (image: HTMLImageElement) => void;
    disabled?: boolean;
}

export default function ImageDropZone({ onImageLoad, disabled }: ImageDropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        setIsLoading(true);
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                onImageLoad(img);
                setIsLoading(false);
            };
            img.onerror = () => {
                alert('Failed to load image');
                setIsLoading(false);
            };
            img.src = e.target?.result as string;
        };

        reader.onerror = () => {
            alert('Failed to read file');
            setIsLoading(false);
        };

        reader.readAsDataURL(file);
    }, [onImageLoad]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled) return;

        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [disabled, handleFile]);

    const handleClick = useCallback(() => {
        if (!disabled) fileInputRef.current?.click();
    }, [disabled]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    }, [handleFile]);

    return (
        <div
            className={`drop-zone ${isDragging ? 'dragging' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
                disabled={disabled}
            />

            {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                    <div className="loading-spinner" />
                    <span className="text-[var(--text-secondary)]">Loading image...</span>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="w-16 h-16 text-[var(--text-muted)]"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <div className="text-center">
                        <p className="text-[var(--text-primary)] font-medium mb-1">
                            Drop your image here
                        </p>
                        <p className="text-[var(--text-secondary)] text-sm">
                            or click to browse
                        </p>
                    </div>
                    <div className="flex gap-2 text-xs text-[var(--text-muted)]">
                        <span className="px-2 py-1 rounded bg-[var(--bg-tertiary)]">PNG</span>
                        <span className="px-2 py-1 rounded bg-[var(--bg-tertiary)]">JPG</span>
                        <span className="px-2 py-1 rounded bg-[var(--bg-tertiary)]">WEBP</span>
                        <span className="px-2 py-1 rounded bg-[var(--bg-tertiary)]">GIF</span>
                    </div>
                </div>
            )}
        </div>
    );
}
