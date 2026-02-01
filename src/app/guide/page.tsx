import Link from 'next/link';
import Header from '@/components/Header';

export default function GuidePage() {
    return (
        <div className="min-h-screen">
            {/* Header */}
            <Header />

            {/* Content */}
            <main className="px-4 py-8" style={{ width: '100%', paddingTop: '100px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                    <h1>USER GUIDE</h1>

                    <section className="card mb-6">
                        <h2>GETTING STARTED</h2>
                        <p className="mb-4">
                            PixelSmart converts any image into pixel art. Upload an image by dragging it
                            onto the drop zone or clicking to browse your files.
                        </p>
                        <p className="text-[var(--text-dim)]">
                            Supported formats: PNG, JPG, WEBP, GIF
                        </p>
                    </section>

                    <section className="card mb-6">
                        <h2>PALETTES</h2>
                        <p className="mb-4">
                            Choose how colors are mapped in your pixel art:
                        </p>
                        <ul className="list-none p-0 m-0">
                            <li className="mb-2 pl-4 border-l-2 border-[var(--border)]">
                                <strong>PREDEFINED</strong> - Classic gaming palettes like Game Boy, NES, PICO-8, etc.
                            </li>
                            <li className="mb-2 pl-4 border-l-2 border-[var(--border)]">
                                <strong>EXTRACTED</strong> - Automatically extract dominant colors from your image.
                            </li>
                            <li className="mb-2 pl-4 border-l-2 border-[var(--border)]">
                                <strong>CUSTOM</strong> - Create your own palette with a color picker.
                            </li>
                        </ul>
                    </section>

                    <section className="card mb-6">
                        <h2>SIZE CONTROLS</h2>
                        <ul className="list-none p-0 m-0">
                            <li className="mb-2 pl-4 border-l-2 border-[var(--border)]">
                                <strong>PIXEL SIZE</strong> - Size of each pixel block (1-64). Larger values = chunkier pixels.
                            </li>
                            <li className="mb-2 pl-4 border-l-2 border-[var(--border)]">
                                <strong>OUTPUT SIZE</strong> - Final image dimensions. Use presets for quick square sizes.
                            </li>
                            <li className="mb-2 pl-4 border-l-2 border-[var(--border)]">
                                <strong>ASPECT RATIO</strong> - Crop the image to a specific ratio before pixelation.
                            </li>
                        </ul>
                    </section>

                    <section className="card mb-6">
                        <h2>FILTERS</h2>
                        <p className="mb-4">
                            Filters modify your image at different stages of the pipeline:
                        </p>
                        <h3 className="text-base mt-4 mb-2" style={{ borderBottom: 'none' }}>PRE-PIXELATION</h3>
                        <p className="mb-4 text-[var(--text-dim)]">
                            Applied before downscaling. Use these to prepare your source image:
                        </p>
                        <ul className="list-none p-0 m-0 mb-4">
                            <li className="mb-1 pl-4 border-l-2 border-[var(--border)]">SHARPEN - Enhance edges for cleaner pixelation</li>
                            <li className="mb-1 pl-4 border-l-2 border-[var(--border)]">BLUR - Reduce noise in the source</li>
                            <li className="mb-1 pl-4 border-l-2 border-[var(--border)]">CONTRAST / BRIGHTNESS - Adjust exposure</li>
                            <li className="mb-1 pl-4 border-l-2 border-[var(--border)]">SATURATION - Boost or reduce colors</li>
                        </ul>

                        <h3 className="text-base mt-4 mb-2" style={{ borderBottom: 'none' }}>POST-PIXELATION</h3>
                        <p className="mb-4 text-[var(--text-dim)]">
                            Applied after pixelation for artistic effects:
                        </p>
                        <ul className="list-none p-0 m-0">
                            <li className="mb-1 pl-4 border-l-2 border-[var(--border)]">DITHER - Floyd-Steinberg dithering for retro look</li>
                            <li className="mb-1 pl-4 border-l-2 border-[var(--border)]">SEPIA / GRAYSCALE - Color grading</li>
                            <li className="mb-1 pl-4 border-l-2 border-[var(--border)]">NOISE - Add grain</li>
                            <li className="mb-1 pl-4 border-l-2 border-[var(--border)]">VIGNETTE - Darken corners</li>
                        </ul>
                    </section>

                    <section className="card mb-6">
                        <h2>EXPORTING</h2>
                        <p className="mb-4">
                            Download your pixel art in PNG (lossless) or JPG (compressed) format.
                            All processing happens in your browser - images are never uploaded.
                        </p>
                    </section>

                    <section className="card mb-6">
                        <h2>KEYBOARD SHORTCUTS</h2>
                        <ul className="list-none p-0 m-0">
                            <li className="mb-1 pl-4 border-l-2 border-[var(--border)]">Scroll wheel on preview - Zoom in/out</li>
                            <li className="mb-1 pl-4 border-l-2 border-[var(--border)]">Click and drag - Pan the preview</li>
                        </ul>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t-2 border-[var(--border)] py-6 px-4">
                <div className="max-w-4xl mx-auto text-center text-sm text-[var(--text-dim)]">
                    <p>
                        <a href="https://github.com/unworthyzeus/pixel-smart-art">SOURCE CODE</a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
