'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

interface ImageDropZoneProps {
    onImageLoad: (image: HTMLImageElement, sourceLabel?: string) => void;
    disabled?: boolean;
}

export default function ImageDropZone({ onImageLoad, disabled }: ImageDropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize PWA elements for web camera support.
    useEffect(() => {
        defineCustomElements(window);
    }, []);

    const loadImageFromUrl = useCallback(async (url: string, sourceLabel?: string, revokeUrl: boolean = false) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = url;

        try {
            await img.decode();
            onImageLoad(img, sourceLabel);
        } finally {
            if (revokeUrl) {
                URL.revokeObjectURL(url);
            }
        }
    }, [onImageLoad]);

    const handleCamera = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;

        try {
            setIsLoading(true);
            const image = await Camera.getPhoto({
                quality: 82,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera
            });

            if (image.dataUrl) {
                await loadImageFromUrl(image.dataUrl, 'CAMERA');
            }
        } catch (error) {
            console.log('Camera error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFile = useCallback(async (file: File, sourceLabel: string = file.name) => {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        setIsLoading(true);
        const objectUrl = URL.createObjectURL(file);

        try {
            await loadImageFromUrl(objectUrl, sourceLabel, true);
        } catch {
            alert('Failed to read file');
        } finally {
            setIsLoading(false);
        }
    }, [loadImageFromUrl]);

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            if (disabled) return;

            const file = Array.from(event.clipboardData?.files || []).find(item => item.type.startsWith('image/'));
            if (file) {
                event.preventDefault();
                handleFile(file, 'PASTED IMAGE');
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [disabled, handleFile]);

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
        if (file) {
            handleFile(file);
        }
    }, [disabled, handleFile]);

    return (
        <div
            className={`drop-zone ${isDragging ? 'dragging' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={disabled}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                    e.currentTarget.value = '';
                }}
            />

            <div className="flex flex-col items-center gap-4">
                {isLoading ? (
                    <div className="text-xl animate-pulse">LOADING...</div>
                ) : (
                    <>
                        <div className="text-4xl text-[var(--text-dim)]">[+]</div>
                        <div className="text-center">
                            <p className="text-[var(--foreground)] mb-1">DROP IMAGE HERE</p>
                            <p className="text-[var(--text-dim)] text-sm">CLICK, PASTE, OR BROWSE</p>
                        </div>

                        <div className="flex items-center gap-2 w-full max-w-[200px]">
                            <div className="h-[1px] bg-[var(--dim)] flex-1"></div>
                            <span className="text-xs text-[var(--text-dim)]">OR</span>
                            <div className="h-[1px] bg-[var(--dim)] flex-1"></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleCamera}
                            disabled={disabled}
                            className="btn-secondary text-sm flex items-center gap-2"
                        >
                            <span className="text-lg">CAM</span> TAKE PHOTO
                        </button>

                        <div className="flex gap-2 text-sm text-[var(--text-dim)] mt-2">
                            <span className="badge">PNG</span>
                            <span className="badge">JPG</span>
                            <span className="badge">WEBP</span>
                            <span className="badge">PASTE</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
