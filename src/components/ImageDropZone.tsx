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
                    <span className="text-[var(--text-dim)]">LOADING...</span>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <div className="text-4xl text-[var(--text-dim)]">[+]</div>
                    <div className="text-center">
                        <p className="text-[var(--foreground)] mb-1">
                            DROP IMAGE HERE
                        </p>
                        <p className="text-[var(--text-dim)] text-sm">
                            OR CLICK TO BROWSE
                        </p>
                    </div>
                    <div className="flex gap-2 text-sm text-[var(--text-dim)]">
                        <span className="badge">PNG</span>
                        <span className="badge">JPG</span>
                        <span className="badge">WEBP</span>
                        <span className="badge">GIF</span>
                    </div>
                </div>
            )}
        </div>
    );
}
