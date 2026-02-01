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
import { generatePixelArt, downloadCanvas, PixelArtConfig, DEFAULT_CONFIG } from '@/lib/pixelEngine';

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
  const [activeTab, setActiveTab] = useState<'size' | 'palette' | 'prefilters' | 'postfilters'>('palette');

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
      <main className="flex-1 pt-24 pb-12 px-4" style={{ width: '100%' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          {/* Hero Section */}
          <section className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl mb-4" style={{ borderBottom: 'none' }}>
              PIXEL ART GENERATOR
            </h2>
            <p className="text-[var(--text-dim)] text-lg" style={{ maxWidth: '640px', margin: '0 auto' }}>
              Convert images to pixel art with custom palettes and filters
            </p>
          </section>

          {/* App Layout */}
          <div className="grid lg:grid-cols-[1fr_380px] gap-6">
            {/* Preview Panel */}
            <div className="glass-card">
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportPNG}
                        disabled={!pixelatedCanvas || isProcessing}
                        className="btn-primary text-sm"
                      >
                        EXPORT PNG
                      </button>
                      <button
                        onClick={handleExportJPG}
                        disabled={!pixelatedCanvas || isProcessing}
                        className="btn-secondary text-sm"
                      >
                        JPG
                      </button>
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
            <div className="glass-card overflow-y-auto max-h-[calc(100vh-200px)]">
              {/* Tabs */}
              <div className="flex border-b-2 border-[var(--border)] mb-4 -mx-6 px-4">
                {(['palette', 'size', 'prefilters', 'postfilters'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`tab-button ${activeTab === tab ? 'active' : ''}`}
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
