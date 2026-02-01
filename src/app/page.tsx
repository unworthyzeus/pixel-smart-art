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
  const [customAspectWidth, setCustomAspectWidth] = useState(1);
  const [customAspectHeight, setCustomAspectHeight] = useState(1);

  // Palette state
  const [paletteMode, setPaletteMode] = useState<'predefined' | 'extracted' | 'custom'>(DEFAULT_CONFIG.paletteMode);
  const [selectedPaletteId, setSelectedPaletteId] = useState('pico8');
  const [customPalette, setCustomPalette] = useState<string[]>(['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00']);
  const [extractedColorCount, setExtractedColorCount] = useState(DEFAULT_CONFIG.extractedColorCount || 16);
  const [extractedPalette, setExtractedPalette] = useState<string[]>([]);

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
        customAspectWidth,
        customAspectHeight,
        paletteMode,
        paletteId: selectedPaletteId,
        customPalette,
        extractedColorCount,
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
    originalImage, pixelSize, outputWidth, outputHeight, aspectRatio,
    customAspectWidth, customAspectHeight, paletteMode, selectedPaletteId,
    customPalette, extractedColorCount, preFilters, postFilters, showGrid, getCurrentPalette
  ]);

  // Auto-process on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      processImage();
    }, 300);
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
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-tertiary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
              Transform Images into Pixel Art
            </h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
              Upload any image and convert it to stunning retro pixel art with smart color palettes,
              customizable filters, and precise controls.
            </p>
          </section>

          {/* App Layout */}
          <div className="grid lg:grid-cols-[1fr_400px] gap-6">
            {/* Preview Panel */}
            <div className="glass-card p-6">
              {!originalImage ? (
                <ImageDropZone onImageLoad={handleImageLoad} />
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Controls Bar */}
                  <div className="flex flex-wrap items-center gap-4 justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setOriginalImage(null)}
                        className="btn-secondary text-sm py-2 px-4"
                      >
                        New Image
                      </button>
                      <div className="w-px h-6 bg-[var(--border-color)]" />
                      <button
                        onClick={() => setShowOriginal(!showOriginal)}
                        className={`px-3 py-2 rounded-lg text-sm transition-all ${showOriginal
                            ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]'
                            : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                          }`}
                      >
                        Original
                      </button>
                      <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={`px-3 py-2 rounded-lg text-sm transition-all ${showGrid
                            ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]'
                            : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                          }`}
                      >
                        Grid
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportPNG}
                        disabled={!pixelatedCanvas || isProcessing}
                        className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
                      >
                        Export PNG
                      </button>
                      <button
                        onClick={handleExportJPG}
                        disabled={!pixelatedCanvas || isProcessing}
                        className="btn-secondary text-sm py-2 px-4 disabled:opacity-50"
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
            <div className="glass-card p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              {/* Tabs */}
              <div className="flex border-b border-[var(--border-color)] mb-6 -mx-6 px-6">
                {(['palette', 'size', 'prefilters', 'postfilters'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                  >
                    {tab === 'prefilters' ? 'Pre' : tab === 'postfilters' ? 'Post' : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                    onPaletteModeChange={setPaletteMode}
                    onPaletteSelect={setSelectedPaletteId}
                    onCustomPaletteChange={setCustomPalette}
                    onExtractedCountChange={setExtractedColorCount}
                  />
                )}

                {activeTab === 'size' && (
                  <SizeControls
                    pixelSize={pixelSize}
                    outputWidth={outputWidth}
                    outputHeight={outputHeight}
                    aspectRatio={aspectRatio}
                    customAspectWidth={customAspectWidth}
                    customAspectHeight={customAspectHeight}
                    onPixelSizeChange={setPixelSize}
                    onOutputWidthChange={setOutputWidth}
                    onOutputHeightChange={setOutputHeight}
                    onAspectRatioChange={setAspectRatio}
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

          {/* How It Works Section */}
          <section id="how-it-works" className="mt-20">
            <h3 className="text-2xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-tertiary)] bg-clip-text text-transparent">
              How It Works
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: '📤',
                  title: 'Upload Image',
                  description: 'Drag and drop or click to upload any image file (PNG, JPG, WEBP, GIF)'
                },
                {
                  icon: '🎨',
                  title: 'Customize',
                  description: 'Adjust pixel size, choose a color palette, and apply filters to your liking'
                },
                {
                  icon: '💾',
                  title: 'Export',
                  description: 'Download your pixel art masterpiece in PNG or JPG format'
                }
              ].map((step, idx) => (
                <div key={idx} className="glass-card p-6 text-center">
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h4 className="text-lg font-semibold mb-2">{step.title}</h4>
                  <p className="text-[var(--text-secondary)] text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="mt-20">
            <h3 className="text-2xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-secondary)] to-[var(--accent-tertiary)] bg-clip-text text-transparent">
              Powerful Features
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: '🎮', title: 'Classic Palettes', desc: 'Game Boy, NES, SNES, PICO-8, and more' },
                { icon: '🔍', title: 'Smart Extraction', desc: 'AI-powered color palette extraction' },
                { icon: '⚙️', title: 'Pre/Post Filters', desc: 'Sharpen, blur, contrast, dither, and more' },
                { icon: '📐', title: 'Aspect Ratios', desc: 'Square, 16:9, 4:3, or custom ratios' },
                { icon: '🔲', title: 'Pixel Size Control', desc: 'From fine detail to chunky retro pixels' },
                { icon: '📱', title: 'Mobile Ready', desc: 'Works on all devices' },
                { icon: '⚡', title: 'Real-time Preview', desc: 'See changes instantly' },
                { icon: '🌐', title: 'No Upload Required', desc: 'Everything processes locally' }
              ].map((feature, idx) => (
                <div key={idx} className="glass-card p-4 flex items-start gap-3">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <h4 className="font-semibold text-sm">{feature.title}</h4>
                    <p className="text-xs text-[var(--text-muted)]">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-[var(--text-muted)]">
          <p className="mb-2">
            Made with 💜 by <a href="https://github.com/unworthyzeus" className="text-[var(--accent-primary)] hover:underline">unworthyzeus</a>
          </p>
          <p>
            Open source on <a href="https://github.com/unworthyzeus/pixel-smart-art" className="text-[var(--accent-primary)] hover:underline">GitHub</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
