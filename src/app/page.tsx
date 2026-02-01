'use client';

import { useState, useCallback, useEffect } from 'react';
import Header from '@/components/Header';
import ImageDropZone from '@/components/ImageDropZone';
import PixelPreview from '@/components/PixelPreview';
import PaletteSelector from '@/components/PaletteSelector';
import FilterControls from '@/components/FilterControls';
import SizeControls from '@/components/SizeControls';
import { PALETTES, extractPalette } from '@/lib/palettes';
import { FilterConfig } from '@/lib/filters';
import { generatePixelArt, downloadCanvas, downloadAsBMP, downloadAsPPM, downloadAsRaw, downloadAsJSON, downloadAsWebP, PixelArtConfig, DEFAULT_CONFIG } from '@/lib/pixelEngine';

export default function Home() {
  // Image state
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [pixelatedCanvas, setPixelatedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Config state
  const [pixelSize, setPixelSize] = useState(DEFAULT_CONFIG.pixelSize);
  const [outputWidth, setOutputWidth] = useState(DEFAULT_CONFIG.outputWidth);
  const [outputHeight, setOutputHeight] = useState(DEFAULT_CONFIG.outputHeight);
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_CONFIG.aspectRatio);
  const [aspectMode, setAspectMode] = useState<'crop' | 'stretch'>(DEFAULT_CONFIG.aspectMode);
  const [customAspectWidth, setCustomAspectWidth] = useState(1);
  const [customAspectHeight, setCustomAspectHeight] = useState(1);

  // Palette state
  const [paletteMode, setPaletteMode] = useState<'predefined' | 'extracted' | 'custom' | 'none'>(DEFAULT_CONFIG.paletteMode);
  const [selectedPaletteId, setSelectedPaletteId] = useState('pico8');
  const [customPalette, setCustomPalette] = useState<string[]>(['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00']);
  const [extractedColorCount, setExtractedColorCount] = useState(DEFAULT_CONFIG.extractedColorCount || 16);
  const [extractedPalette, setExtractedPalette] = useState<string[]>([]);

  // Sampling mode
  const [samplingMode, setSamplingMode] = useState<'nearest' | 'average' | 'bilinear' | 'center'>(DEFAULT_CONFIG.samplingMode);

  // Filter state
  const [preFilters, setPreFilters] = useState<FilterConfig[]>([]);
  const [postFilters, setPostFilters] = useState<FilterConfig[]>([]);

  // UI state
  const [showOriginal, setShowOriginal] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [activeTab, setActiveTab] = useState<'size' | 'palette' | 'prefilters' | 'postfilters'>('size');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Get current palette
  const getCurrentPalette = useCallback((): string[] => {
    switch (paletteMode) {
      case 'predefined':
        return PALETTES.find(p => p.id === selectedPaletteId)?.colors || PALETTES[0].colors;
      case 'extracted':
        return extractedPalette.length > 0 ? extractedPalette : ['#000000', '#ffffff'];
      case 'custom':
        return customPalette.length > 0 ? customPalette : ['#000000', '#ffffff'];
      case 'none':
        return []; // Empty palette = use original colors
      default:
        return PALETTES[0].colors;
    }
  }, [paletteMode, selectedPaletteId, extractedPalette, customPalette]);

  // Extract palette from image
  useEffect(() => {
    if (!originalImage || paletteMode !== 'extracted') return;

    const canvas = document.createElement('canvas');
    canvas.width = originalImage.naturalWidth;
    canvas.height = originalImage.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(originalImage, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const palette = extractPalette(imageData, extractedColorCount);
    setExtractedPalette(palette);
  }, [originalImage, paletteMode, extractedColorCount]);

  // Process image
  const processImage = useCallback(async () => {
    if (!originalImage) return;

    setIsProcessing(true);

    try {
      const config: PixelArtConfig = {
        pixelSize,
        outputWidth,
        outputHeight,
        aspectRatio,
        aspectMode,
        customAspectWidth,
        customAspectHeight,
        paletteMode,
        paletteId: selectedPaletteId,
        customPalette,
        extractedColorCount,
        samplingMode,
        preFilters,
        postFilters,
        preserveAspect: true,
        smoothing: false,
        outline: showGrid,
        outlineColor: 'rgba(255,255,255,0.2)',
        backgroundColor: '#000000'
      };

      const palette = getCurrentPalette();
      const result = await generatePixelArt(originalImage, config, palette);
      setPixelatedCanvas(result);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [
    originalImage, pixelSize, outputWidth, outputHeight, aspectRatio, aspectMode,
    customAspectWidth, customAspectHeight, paletteMode, selectedPaletteId,
    customPalette, extractedColorCount, samplingMode, preFilters, postFilters, showGrid, getCurrentPalette
  ]);

  // Auto-process on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      processImage();
    }, 500); // Increased debounce for less lag
    return () => clearTimeout(timer);
  }, [processImage]);

  // Handle image load
  const handleImageLoad = useCallback((img: HTMLImageElement) => {
    setOriginalImage(img);
  }, []);

  // Export handlers
  const handleExportPNG = () => {
    if (!pixelatedCanvas) return;
    downloadCanvas(pixelatedCanvas, 'pixel-art.png', 'image/png');
  };

  const handleExportJPG = () => {
    if (!pixelatedCanvas) return;
    downloadCanvas(pixelatedCanvas, 'pixel-art.jpg', 'image/jpeg');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Main Content */}
      <main className={`flex-1 px-0 lg:px-4 py-0 lg:py-6 flex flex-col ${originalImage ? 'h-[calc(100vh-80px)] lg:h-auto' : ''}`} style={{ width: '100%', paddingTop: '80px' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
          {/* Subtitle */}
          <p className={`text-center text-[var(--text-dim)] mb-6 ${originalImage ? 'hidden lg:block' : ''}`}>
            Convert images to pixel art with custom palettes and filters
          </p>

          {/* App Layout */}
          <div className={`${originalImage ? 'flex flex-col h-full lg:grid lg:grid-cols-[1fr_400px]' : ''} gap-6`}>
            {/* Preview Panel */}
            <div className={`${originalImage ? 'flex-1 overflow-hidden relative bg-[var(--background-dark)] lg:bg-transparent lg:overflow-visible lg:glass-card flex flex-col justify-center' : 'glass-card'}`}>
              {!originalImage ? (
                <ImageDropZone onImageLoad={handleImageLoad} />
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Controls Bar */}
                  <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setOriginalImage(null)}
                        className="btn-secondary text-sm"
                      >
                        NEW
                      </button>
                      <button
                        onClick={() => setShowOriginal(!showOriginal)}
                        className={showOriginal ? 'btn-primary text-sm' : 'btn-secondary text-sm'}
                      >
                        ORIG
                      </button>
                      <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={showGrid ? 'btn-primary text-sm' : 'btn-secondary text-sm'}
                      >
                        GRID
                      </button>
                    </div>
                    <div className="flex items-center gap-2 relative">
                      <button
                        onClick={handleExportPNG}
                        disabled={!pixelatedCanvas || isProcessing}
                        className="btn-primary text-sm"
                      >
                        EXPORT PNG
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setShowExportMenu(!showExportMenu)}
                          disabled={!pixelatedCanvas || isProcessing}
                          className="btn-secondary text-sm"
                        >
                          MORE ▾
                        </button>
                        {showExportMenu && (
                          <div className="absolute top-full right-0 mt-1 z-50 glass-card p-2 min-w-[140px] flex flex-col gap-1">
                            <button
                              onClick={() => { handleExportJPG(); setShowExportMenu(false); }}
                              className="btn-secondary text-xs w-full"
                            >
                              JPG
                            </button>
                            <button
                              onClick={() => { if (pixelatedCanvas) downloadAsWebP(pixelatedCanvas, 'pixel-art.webp'); setShowExportMenu(false); }}
                              className="btn-secondary text-xs w-full"
                            >
                              WebP
                            </button>
                            <button
                              onClick={() => { if (pixelatedCanvas) downloadAsBMP(pixelatedCanvas, 'pixel-art.bmp'); setShowExportMenu(false); }}
                              className="btn-secondary text-xs w-full"
                            >
                              BMP (Uncompressed)
                            </button>
                            <div className="border-t border-[var(--border)] my-1"></div>
                            <button
                              onClick={() => { if (pixelatedCanvas) downloadAsPPM(pixelatedCanvas, 'pixel-art.ppm'); setShowExportMenu(false); }}
                              className="btn-secondary text-xs w-full"
                            >
                              PPM (ASCII Matrix)
                            </button>
                            <button
                              onClick={() => { if (pixelatedCanvas) downloadAsRaw(pixelatedCanvas, 'pixel-art.raw'); setShowExportMenu(false); }}
                              className="btn-secondary text-xs w-full"
                            >
                              RAW (RGB Bytes)
                            </button>
                            <button
                              onClick={() => { if (pixelatedCanvas) downloadAsJSON(pixelatedCanvas, 'pixel-art.json'); setShowExportMenu(false); }}
                              className="btn-secondary text-xs w-full"
                            >
                              JSON (Color Matrix)
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <PixelPreview
                    originalImage={originalImage}
                    pixelatedCanvas={pixelatedCanvas}
                    showOriginal={showOriginal}
                    showGrid={showGrid}
                    pixelSize={pixelSize}
                    isProcessing={isProcessing}
                    extractedPalette={paletteMode === 'extracted' ? extractedPalette : []}
                  />
                </div>
              )}
            </div>

            {/* Controls Panel */}
            <div className={`${originalImage ? 'h-[45vh] lg:h-auto lg:max-h-[calc(100vh-120px)] overflow-y-auto bg-[var(--background)] lg:bg-transparent border-t-2 border-[var(--primary-glow)] lg:border-none rounded-t-2xl lg:rounded-none shadow-[0_-5px_20px_rgba(0,0,0,0.5)] lg:shadow-none lg:glass-card z-20' : 'glass-card'}`}>
              {/* Tabs */}
              <div className="flex gap-1 border-b-2 border-[var(--border)] mb-4 -mx-6 px-2 pb-2">
                {(['size', 'palette', 'prefilters', 'postfilters'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                    style={{ fontSize: '0.9rem', padding: '0.3rem 0.6rem' }}
                  >
                    {tab === 'prefilters' ? 'PRE' : tab === 'postfilters' ? 'POST' : tab.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div>
                {activeTab === 'palette' && (
                  <PaletteSelector
                    paletteMode={paletteMode}
                    selectedPaletteId={selectedPaletteId}
                    customPalette={customPalette}
                    extractedColorCount={extractedColorCount}
                    samplingMode={samplingMode}
                    onPaletteModeChange={setPaletteMode}
                    onPaletteSelect={setSelectedPaletteId}
                    onCustomPaletteChange={setCustomPalette}
                    onExtractedCountChange={setExtractedColorCount}
                    onSamplingModeChange={setSamplingMode}
                  />
                )}

                {activeTab === 'size' && (
                  <SizeControls
                    pixelSize={pixelSize}
                    outputWidth={outputWidth}
                    outputHeight={outputHeight}
                    aspectRatio={aspectRatio}
                    aspectMode={aspectMode}
                    customAspectWidth={customAspectWidth}
                    customAspectHeight={customAspectHeight}
                    onPixelSizeChange={setPixelSize}
                    onOutputWidthChange={setOutputWidth}
                    onOutputHeightChange={setOutputHeight}
                    onAspectRatioChange={setAspectRatio}
                    onAspectModeChange={setAspectMode}
                    onCustomAspectChange={(w, h) => {
                      setCustomAspectWidth(w);
                      setCustomAspectHeight(h);
                    }}
                  />
                )}

                {activeTab === 'prefilters' && (
                  <FilterControls
                    label="Pre-Pixelation Filters"
                    filters={preFilters}
                    onFiltersChange={setPreFilters}
                  />
                )}

                {activeTab === 'postfilters' && (
                  <FilterControls
                    label="Post-Pixelation Filters"
                    filters={postFilters}
                    onFiltersChange={setPostFilters}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-[var(--text-dim)]">
          <p>
            <a href="https://github.com/unworthyzeus/pixel-smart-art">SOURCE CODE</a>
            {' '}/{' '}
            <a href="/guide">GUIDE</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
