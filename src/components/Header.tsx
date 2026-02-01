'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 no-underline">
                    <div className="w-10 h-10 border-2 border-[var(--foreground)] flex items-center justify-center bg-[var(--background)]">
                        <span className="text-xl font-bold">P</span>
                    </div>
                    <div>
                        <h1 className="text-lg m-0 p-0 border-none" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                            PIXELSMART
                        </h1>
                    </div>
                </Link>

                {/* Navigation - Desktop */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/guide" className="text-[var(--text-dim)] hover:text-[var(--foreground)]">
                        GUIDE
                    </Link>
                    <a
                        href="https://github.com/unworthyzeus/pixel-smart-art"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--text-dim)] hover:text-[var(--foreground)]"
                    >
                        SOURCE
                    </a>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden"
                    style={{ boxShadow: 'none', padding: '0.5rem' }}
                >
                    {isMenuOpen ? 'X' : '='}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t-2 border-[var(--border)] bg-[var(--background)]">
                    <nav className="flex flex-col p-4 gap-4">
                        <Link
                            href="/guide"
                            className="text-[var(--text-dim)] hover:text-[var(--foreground)]"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            GUIDE
                        </Link>
                        <a
                            href="https://github.com/unworthyzeus/pixel-smart-art"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--text-dim)] hover:text-[var(--foreground)]"
                        >
                            SOURCE
                        </a>
                    </nav>
                </div>
            )}
        </header>
    );
}
