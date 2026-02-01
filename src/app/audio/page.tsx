'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
    ChiptuneConfig,
    DEFAULT_CHIPTUNE_CONFIG,
    CHIP_PRESETS,
    ChipStyle,
    WaveformType,
    ProcessedAudio,
    convertToChiptune,
    loadAudioFile,
    formatDuration
} from '@/lib/audioEngine';

export default function AudioPage() {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [originalBuffer, setOriginalBuffer] = useState<AudioBuffer | null>(null);
    const [processedAudio, setProcessedAudio] = useState<ProcessedAudio | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playingOriginal, setPlayingOriginal] = useState(false);
    const [config, setConfig] = useState<ChiptuneConfig>(DEFAULT_CHIPTUNE_CONFIG);

    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPlayback();
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const handleFileSelect = useCallback(async (file: File) => {
        if (!file.type.startsWith('audio/')) {
            alert('Please select an audio file');
            return;
        }

        setAudioFile(file);
        setProcessedAudio(null);

        try {
            const buffer = await loadAudioFile(file);
            setOriginalBuffer(buffer);
        } catch (error) {
            console.error('Error loading audio:', error);
            alert('Failed to load audio file');
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    const processAudio = useCallback(async () => {
        if (!originalBuffer) return;

        setIsProcessing(true);
        stopPlayback();

        try {
            // Use setTimeout to allow UI to update
            await new Promise(resolve => setTimeout(resolve, 50));
            const result = await convertToChiptune(originalBuffer, config);
            setProcessedAudio(result);
        } catch (error) {
            console.error('Error processing audio:', error);
            alert('Failed to process audio');
        } finally {
            setIsProcessing(false);
        }
    }, [originalBuffer, config]);

    const stopPlayback = useCallback(() => {
        if (sourceNodeRef.current) {
            try {
                sourceNodeRef.current.stop();
            } catch { /* ignore */ }
            sourceNodeRef.current = null;
        }
        setIsPlaying(false);
        setPlayingOriginal(false);
    }, []);

    const playBuffer = useCallback(async (buffer: AudioBuffer, isOriginal: boolean) => {
        stopPlayback();

        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new AudioContext();
        }

        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);

        source.onended = () => {
            setIsPlaying(false);
            setPlayingOriginal(false);
        };

        sourceNodeRef.current = source;
        source.start(0);

        setIsPlaying(true);
        setPlayingOriginal(isOriginal);
    }, [stopPlayback]);

    const downloadProcessed = useCallback(() => {
        if (!processedAudio || !audioFile) return;

        const url = URL.createObjectURL(processedAudio.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chiptune_${audioFile.name.replace(/\.[^/.]+$/, '')}.wav`;
        a.click();
        URL.revokeObjectURL(url);
    }, [processedAudio, audioFile]);

    const applyPreset = useCallback((style: ChipStyle) => {
        setConfig(prev => ({
            ...prev,
            ...CHIP_PRESETS[style],
            chipStyle: style
        }));
    }, []);

    const updateConfig = useCallback(<K extends keyof ChiptuneConfig>(
        key: K,
        value: ChiptuneConfig[K]
    ) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b-2 border-[var(--border)] bg-[var(--background)]">
                <div style={{ maxWidth: '1600px', margin: '0 auto', width: '100%', padding: '1rem' }} className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 no-underline">
                        <div className="w-10 h-10 border-2 border-[var(--foreground)] flex items-center justify-center bg-[var(--background)]">
                            <span className="text-xl font-bold">P</span>
                        </div>
                        <h1 className="text-lg m-0 p-0" style={{ borderBottom: 'none' }}>
                            PIXELSMART
                        </h1>
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link href="/" className="text-[var(--text-dim)] hover:text-[var(--foreground)]">
                            PIXEL ART
                        </Link>
                        <span className="text-[var(--foreground)]">CHIPTUNE</span>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 py-6" style={{ width: '100%', paddingTop: '80px' }}>
                <div style={{ maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
                    <p className="text-center text-[var(--text-dim)] mb-6">
                        Convert audio to authentic 8-bit chiptune style
                    </p>

                    <div className="grid lg:grid-cols-[1fr_400px] gap-6">
                        {/* Audio Preview Panel */}
                        <div className="glass-card">
                            {!audioFile ? (
                                <div
                                    className="drop-zone"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="audio/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileSelect(file);
                                        }}
                                    />
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="text-4xl text-[var(--text-dim)]">[~]</div>
                                        <div className="text-center">
                                            <p className="text-[var(--foreground)] mb-1">DROP AUDIO HERE</p>
                                            <p className="text-[var(--text-dim)] text-sm">OR CLICK TO BROWSE</p>
                                        </div>
                                        <div className="flex gap-2 text-sm text-[var(--text-dim)]">
                                            <span className="badge">MP3</span>
                                            <span className="badge">WAV</span>
                                            <span className="badge">OGG</span>
                                            <span className="badge">FLAC</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6" style={{ minHeight: '600px' }}>
                                    {/* File Info */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[var(--foreground)] text-lg">{audioFile.name}</p>
                                            {originalBuffer && (
                                                <p className="text-[var(--text-dim)] text-sm">
                                                    {formatDuration(originalBuffer.duration)} | {originalBuffer.sampleRate}Hz | {originalBuffer.numberOfChannels}ch
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => {
                                                stopPlayback();
                                                setAudioFile(null);
                                                setOriginalBuffer(null);
                                                setProcessedAudio(null);
                                            }}
                                            className="btn-secondary text-sm"
                                        >
                                            CLEAR
                                        </button>
                                    </div>

                                    {/* Playback Controls */}
                                    <div className="flex gap-4 flex-wrap">
                                        <button
                                            onClick={() => originalBuffer && playBuffer(originalBuffer, true)}
                                            disabled={!originalBuffer || (isPlaying && playingOriginal)}
                                            className={`${isPlaying && playingOriginal ? 'btn-primary' : 'btn-secondary'}`}
                                        >
                                            {isPlaying && playingOriginal ? 'PLAYING ORIGINAL' : 'PLAY ORIGINAL'}
                                        </button>

                                        {processedAudio && (
                                            <button
                                                onClick={() => playBuffer(processedAudio.buffer, false)}
                                                disabled={isPlaying && !playingOriginal}
                                                className={`${isPlaying && !playingOriginal ? 'btn-primary' : 'btn-secondary'}`}
                                            >
                                                {isPlaying && !playingOriginal ? 'PLAYING CHIPTUNE' : 'PLAY CHIPTUNE'}
                                            </button>
                                        )}

                                        {isPlaying && (
                                            <button onClick={stopPlayback} className="btn-secondary">
                                                STOP
                                            </button>
                                        )}
                                    </div>

                                    {/* Process Button */}
                                    <button
                                        onClick={processAudio}
                                        disabled={isProcessing || !originalBuffer}
                                        className="btn-primary text-xl py-4"
                                    >
                                        {isProcessing ? 'CONVERTING...' : 'CONVERT TO CHIPTUNE'}
                                    </button>

                                    {/* Download */}
                                    {processedAudio && (
                                        <div className="flex gap-4">
                                            <button onClick={downloadProcessed} className="btn-primary flex-1">
                                                DOWNLOAD WAV
                                            </button>
                                        </div>
                                    )}

                                    {/* Waveform Visualization (placeholder) */}
                                    <div className="flex-1 flex items-center justify-center border-2 border-[var(--border)] bg-[var(--input-bg)]">
                                        {isProcessing ? (
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="loading-spinner" />
                                                <span className="text-[var(--text-dim)]">ANALYZING AUDIO...</span>
                                            </div>
                                        ) : processedAudio ? (
                                            <div className="text-center">
                                                <div className="text-6xl mb-4 text-[var(--foreground)]">[8-BIT]</div>
                                                <p className="text-[var(--text-dim)]">CHIPTUNE READY</p>
                                                <p className="text-[var(--foreground)]">{formatDuration(processedAudio.duration)}</p>
                                            </div>
                                        ) : (
                                            <div className="text-center text-[var(--text-dim)]">
                                                <div className="text-4xl mb-4">[?]</div>
                                                <p>CLICK CONVERT TO CREATE CHIPTUNE</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Controls Panel */}
                        <div className="glass-card overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                            <div className="section-title">CHIP STYLE</div>

                            {/* Chip Presets */}
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                {(['nes', 'gameboy', 'c64', 'atari'] as ChipStyle[]).map((style) => (
                                    <button
                                        key={style}
                                        onClick={() => applyPreset(style)}
                                        className={`text-sm ${config.chipStyle === style ? 'btn-primary' : 'btn-secondary'}`}
                                        style={{ padding: '0.4rem', boxShadow: '2px 2px 0px var(--dim)' }}
                                    >
                                        {style.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            <div className="section-title">WAVEFORM</div>

                            {/* Waveform Selection */}
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                {(['square', 'pulse25', 'triangle', 'sawtooth'] as WaveformType[]).map((wave) => (
                                    <button
                                        key={wave}
                                        onClick={() => updateConfig('waveform', wave)}
                                        className={`text-sm ${config.waveform === wave ? 'btn-primary' : 'btn-secondary'}`}
                                        style={{ padding: '0.4rem', boxShadow: '2px 2px 0px var(--dim)' }}
                                    >
                                        {wave.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            <div className="section-title">SETTINGS</div>

                            {/* Bit Depth */}
                            <div className="mb-4">
                                <label className="text-sm text-[var(--text-dim)] mb-2 block">
                                    BIT DEPTH: {config.bitDepth}
                                </label>
                                <input
                                    type="range"
                                    min="2"
                                    max="16"
                                    value={config.bitDepth}
                                    onChange={(e) => updateConfig('bitDepth', parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            {/* Sample Rate */}
                            <div className="mb-4">
                                <label className="text-sm text-[var(--text-dim)] mb-2 block">
                                    SAMPLE RATE: {config.sampleRate}Hz
                                </label>
                                <input
                                    type="range"
                                    min="4000"
                                    max="44100"
                                    step="1000"
                                    value={config.sampleRate}
                                    onChange={(e) => updateConfig('sampleRate', parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            {/* Low Pass Filter */}
                            <div className="mb-4">
                                <label className="text-sm text-[var(--text-dim)] mb-2 block">
                                    LOW PASS: {config.lowPassFreq}Hz
                                </label>
                                <input
                                    type="range"
                                    min="1000"
                                    max="16000"
                                    step="500"
                                    value={config.lowPassFreq}
                                    onChange={(e) => updateConfig('lowPassFreq', parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            {/* Noise Blend */}
                            <div className="mb-4">
                                <label className="text-sm text-[var(--text-dim)] mb-2 block">
                                    NOISE: {Math.round(config.noiseBlend * 100)}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="0.5"
                                    step="0.01"
                                    value={config.noiseBlend}
                                    onChange={(e) => updateConfig('noiseBlend', parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            {/* Gain */}
                            <div className="mb-4">
                                <label className="text-sm text-[var(--text-dim)] mb-2 block">
                                    GAIN: {Math.round(config.gain * 100)}%
                                </label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="2"
                                    step="0.1"
                                    value={config.gain}
                                    onChange={(e) => updateConfig('gain', parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            {/* Toggle Options */}
                            <div className="flex flex-col gap-2 mb-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.quantizeNotes}
                                        onChange={(e) => updateConfig('quantizeNotes', e.target.checked)}
                                    />
                                    <span className="text-sm">QUANTIZE TO NOTES</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.echo}
                                        onChange={(e) => updateConfig('echo', e.target.checked)}
                                    />
                                    <span className="text-sm">CHIP ECHO</span>
                                </label>
                            </div>

                            {/* Echo Settings */}
                            {config.echo && (
                                <div className="mb-4 pl-4 border-l-2 border-[var(--border)]">
                                    <label className="text-sm text-[var(--text-dim)] mb-2 block">
                                        ECHO DELAY: {config.echoDelay}ms
                                    </label>
                                    <input
                                        type="range"
                                        min="50"
                                        max="500"
                                        step="10"
                                        value={config.echoDelay}
                                        onChange={(e) => updateConfig('echoDelay', parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                    <label className="text-sm text-[var(--text-dim)] mb-2 block mt-2">
                                        ECHO DECAY: {Math.round(config.echoDecay * 100)}%
                                    </label>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="0.8"
                                        step="0.05"
                                        value={config.echoDecay}
                                        onChange={(e) => updateConfig('echoDecay', parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t-2 border-[var(--border)] py-4 px-4">
                <div style={{ maxWidth: '1600px', margin: '0 auto' }} className="text-center text-sm text-[var(--text-dim)]">
                    <a href="https://github.com/unworthyzeus/pixel-smart-art">SOURCE CODE</a> | <Link href="/guide">GUIDE</Link>
                </div>
            </footer>
        </div>
    );
}
