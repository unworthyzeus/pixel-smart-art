'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

interface ImageDropZoneProps {
    onImageLoad: (image: HTMLImageElement) => void;
    disabled?: boolean;
}

export default function ImageDropZone({ onImageLoad, disabled }: ImageDropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize PWA elements for web camera support
    useEffect(() => {
        defineCustomElements(window);
    }, []);

    const handleCamera = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering file input
        if (disabled) return;

        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera
            });

            if (image.dataUrl) {
                setIsLoading(true);
                const img = new Image();
                img.onload = () => {
                    onImageLoad(img);
                    setIsLoading(false);
                };
                img.onerror = () => {
                    alert('Failed to load camera image');
                    setIsLoading(false);
                };
                img.src = image.dataUrl;
            }
        } catch (error) {
            // User cancelled or no camera permission
            console.log('Camera error:', error);
        }
    };

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
                            <p className="text-[var(--text-dim)] text-sm">OR CLICK TO BROWSE</p>
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
                            <span className="text-lg">📷</span> TAKE PHOTO
                        </button>

                        <div className="flex gap-2 text-sm text-[var(--text-dim)] mt-2">
                            <span className="badge">PNG</span>
                            <span className="badge">JPG</span>
                            <span className="badge">WEBP</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
