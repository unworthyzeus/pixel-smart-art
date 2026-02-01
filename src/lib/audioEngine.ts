// Chiptune Audio Engine
// Converts audio to authentic retro chiptune style using waveform synthesis

export type ChipStyle = 'nes' | 'gameboy' | 'c64' | 'atari';
export type WaveformType = 'square' | 'pulse25' | 'pulse12' | 'triangle' | 'sawtooth' | 'noise';

export interface ChiptuneConfig {
    chipStyle: ChipStyle;
    bitDepth: number;           // 4-16 bits
    sampleRate: number;         // Playback sample rate
    waveform: WaveformType;     // Primary waveform
    pulseWidth: number;         // Pulse width for square waves (0.1-0.9)
    arpeggioSpeed: number;      // Arpeggio speed in Hz (0 = disabled)
    vibratoDepth: number;       // Vibrato depth (0-1)
    vibratoSpeed: number;       // Vibrato speed in Hz
    noiseBlend: number;         // Blend noise for texture (0-1)
    lowPassFreq: number;        // Low-pass filter cutoff
    gain: number;               // Output gain
    quantizeNotes: boolean;     // Quantize to musical notes
    echo: boolean;              // Add chip-style echo
    echoDelay: number;          // Echo delay in ms
    echoDecay: number;          // Echo decay (0-1)
}

export const DEFAULT_CHIPTUNE_CONFIG: ChiptuneConfig = {
    chipStyle: 'nes',
    bitDepth: 8,
    sampleRate: 22050,
    waveform: 'square',
    pulseWidth: 0.5,
    arpeggioSpeed: 0,
    vibratoDepth: 0,
    vibratoSpeed: 5,
    noiseBlend: 0,
    lowPassFreq: 8000,
    gain: 0.8,
    quantizeNotes: true,
    echo: false,
    echoDelay: 100,
    echoDecay: 0.4
};

// Chip style presets
export const CHIP_PRESETS: Record<ChipStyle, Partial<ChiptuneConfig>> = {
    nes: {
        bitDepth: 8,
        sampleRate: 22050,
        waveform: 'square',
        pulseWidth: 0.5,
        lowPassFreq: 8000
    },
    gameboy: {
        bitDepth: 4,
        sampleRate: 16384,
        waveform: 'square',
        pulseWidth: 0.5,
        lowPassFreq: 6000
    },
    c64: {
        bitDepth: 8,
        sampleRate: 22050,
        waveform: 'sawtooth',
        pulseWidth: 0.5,
        lowPassFreq: 10000
    },
    atari: {
        bitDepth: 4,
        sampleRate: 15700,
        waveform: 'square',
        pulseWidth: 0.5,
        lowPassFreq: 4000
    }
};

export interface ProcessedAudio {
    buffer: AudioBuffer;
    blob: Blob;
    duration: number;
}

// Note frequencies (A4 = 440Hz)
const NOTE_FREQUENCIES: number[] = [];
for (let i = 0; i < 128; i++) {
    NOTE_FREQUENCIES.push(440 * Math.pow(2, (i - 69) / 12));
}

// Quantize frequency to nearest musical note
function quantizeToNote(freq: number): number {
    if (freq <= 20) return 0;
    let minDiff = Infinity;
    let closestFreq = freq;
    for (const noteFreq of NOTE_FREQUENCIES) {
        const diff = Math.abs(freq - noteFreq);
        if (diff < minDiff) {
            minDiff = diff;
            closestFreq = noteFreq;
        }
    }
    return closestFreq;
}

// Generate waveform oscillator sample
function generateWaveformSample(
    phase: number,
    waveform: WaveformType,
    pulseWidth: number,
    noiseState: { value: number; lfsr: number }
): number {
    const normalizedPhase = phase % 1;

    switch (waveform) {
        case 'square':
            return normalizedPhase < 0.5 ? 1 : -1;

        case 'pulse25':
            return normalizedPhase < 0.25 ? 1 : -1;

        case 'pulse12':
            return normalizedPhase < 0.125 ? 1 : -1;

        case 'triangle':
            if (normalizedPhase < 0.5) {
                return 4 * normalizedPhase - 1;
            } else {
                return 3 - 4 * normalizedPhase;
            }

        case 'sawtooth':
            return 2 * normalizedPhase - 1;

        case 'noise':
            // Linear feedback shift register for authentic chip noise
            if (Math.random() < 0.1) {
                const bit = ((noiseState.lfsr >> 0) ^ (noiseState.lfsr >> 2)) & 1;
                noiseState.lfsr = (noiseState.lfsr >> 1) | (bit << 14);
                noiseState.value = (noiseState.lfsr & 1) ? 1 : -1;
            }
            return noiseState.value;

        default:
            return normalizedPhase < pulseWidth ? 1 : -1;
    }
}

// Bit crush effect
function bitCrush(sample: number, bits: number): number {
    const levels = Math.pow(2, bits);
    const step = 2 / levels;
    return Math.round(sample / step) * step;
}

// Simple pitch detection using zero-crossing rate and autocorrelation
function detectPitch(
    data: Float32Array,
    sampleRate: number,
    windowStart: number,
    windowSize: number
): number {
    const endIndex = Math.min(windowStart + windowSize, data.length);
    const actualSize = endIndex - windowStart;

    if (actualSize < 64) return 0;

    // Calculate RMS to check if there's enough signal
    let rms = 0;
    for (let i = windowStart; i < endIndex; i++) {
        rms += data[i] * data[i];
    }
    rms = Math.sqrt(rms / actualSize);

    if (rms < 0.01) return 0; // Too quiet

    // Autocorrelation for pitch detection
    const minPeriod = Math.floor(sampleRate / 1000); // Max 1000 Hz
    const maxPeriod = Math.floor(sampleRate / 50);   // Min 50 Hz

    let bestCorrelation = 0;
    let bestPeriod = 0;

    for (let period = minPeriod; period < Math.min(maxPeriod, actualSize / 2); period++) {
        let correlation = 0;
        let count = 0;

        for (let i = 0; i < actualSize - period; i++) {
            correlation += data[windowStart + i] * data[windowStart + i + period];
            count++;
        }

        correlation /= count;

        if (correlation > bestCorrelation) {
            bestCorrelation = correlation;
            bestPeriod = period;
        }
    }

    if (bestCorrelation < 0.3 * rms * rms) return 0; // Not periodic enough

    return sampleRate / bestPeriod;
}

// Extract amplitude envelope
function getAmplitude(
    data: Float32Array,
    windowStart: number,
    windowSize: number
): number {
    const endIndex = Math.min(windowStart + windowSize, data.length);
    let sum = 0;
    let count = 0;

    for (let i = windowStart; i < endIndex; i++) {
        sum += Math.abs(data[i]);
        count++;
    }

    return count > 0 ? sum / count : 0;
}

// Low-pass filter
function lowPassFilter(data: Float32Array, cutoffFreq: number, sampleRate: number): Float32Array {
    if (cutoffFreq <= 0 || cutoffFreq >= sampleRate / 2) return data;

    const output = new Float32Array(data.length);
    const rc = 1.0 / (cutoffFreq * 2 * Math.PI);
    const dt = 1.0 / sampleRate;
    const alpha = dt / (rc + dt);

    output[0] = data[0];
    for (let i = 1; i < data.length; i++) {
        output[i] = output[i - 1] + alpha * (data[i] - output[i - 1]);
    }

    return output;
}

// Add chip-style echo
function addEcho(
    data: Float32Array,
    sampleRate: number,
    delayMs: number,
    decay: number
): Float32Array {
    const delaySamples = Math.floor(sampleRate * delayMs / 1000);
    const output = new Float32Array(data.length);

    for (let i = 0; i < data.length; i++) {
        output[i] = data[i];
        if (i >= delaySamples) {
            output[i] += output[i - delaySamples] * decay;
        }
    }

    return output;
}

// Normalize audio
function normalizeAudio(data: Float32Array, targetPeak: number = 0.95): Float32Array {
    let maxAbs = 0;
    for (let i = 0; i < data.length; i++) {
        const abs = Math.abs(data[i]);
        if (abs > maxAbs) maxAbs = abs;
    }

    if (maxAbs === 0) return data;

    const scale = targetPeak / maxAbs;
    const output = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) {
        output[i] = data[i] * scale;
    }

    return output;
}

// Main chiptune conversion
export async function convertToChiptune(
    audioBuffer: AudioBuffer,
    config: ChiptuneConfig
): Promise<ProcessedAudio> {
    const originalRate = audioBuffer.sampleRate;
    const outputRate = config.sampleRate;

    // Mix to mono if stereo
    let inputData: Float32Array;
    if (audioBuffer.numberOfChannels > 1) {
        const left = audioBuffer.getChannelData(0);
        const right = audioBuffer.getChannelData(1);
        inputData = new Float32Array(left.length);
        for (let i = 0; i < left.length; i++) {
            inputData[i] = (left[i] + right[i]) / 2;
        }
    } else {
        inputData = new Float32Array(audioBuffer.getChannelData(0));
    }

    // Analysis window settings
    const windowSize = Math.floor(originalRate * 0.02); // 20ms windows
    const hopSize = Math.floor(windowSize / 2);
    const numWindows = Math.floor((inputData.length - windowSize) / hopSize);

    // Synthesize chiptune audio
    const outputLength = inputData.length;
    const output = new Float32Array(outputLength);

    let phase = 0;
    const noiseState = { value: 0, lfsr: 0x7FFF };

    for (let w = 0; w < numWindows; w++) {
        const windowStart = w * hopSize;
        const windowEnd = Math.min(windowStart + windowSize, inputData.length);

        // Detect pitch and amplitude from original audio
        let freq = detectPitch(inputData, originalRate, windowStart, windowSize);
        const amplitude = getAmplitude(inputData, windowStart, windowSize);

        // Quantize to musical note if enabled
        if (config.quantizeNotes && freq > 0) {
            freq = quantizeToNote(freq);
        }

        // Synthesize this window
        for (let i = windowStart; i < windowEnd && i < outputLength; i++) {
            let sample = 0;

            if (freq > 20 && amplitude > 0.01) {
                // Apply vibrato
                let actualFreq = freq;
                if (config.vibratoDepth > 0) {
                    const vibratoMod = Math.sin(2 * Math.PI * config.vibratoSpeed * i / originalRate);
                    actualFreq = freq * (1 + config.vibratoDepth * 0.05 * vibratoMod);
                }

                // Generate waveform
                const phaseIncrement = actualFreq / originalRate;
                sample = generateWaveformSample(phase, config.waveform, config.pulseWidth, noiseState);
                phase += phaseIncrement;

                // Apply amplitude envelope from original
                sample *= amplitude * 3; // Boost to match original level
            }

            // Blend in noise for texture
            if (config.noiseBlend > 0) {
                const noiseSample = generateWaveformSample(0, 'noise', 0.5, noiseState);
                sample = sample * (1 - config.noiseBlend) + noiseSample * config.noiseBlend * amplitude;
            }

            // Bit crush
            sample = bitCrush(sample, config.bitDepth);

            // Apply gain
            sample *= config.gain;

            // Soft clipping
            if (sample > 1) sample = 1 - 1 / (sample + 1);
            else if (sample < -1) sample = -1 - 1 / (sample - 1);

            output[i] = sample;
        }
    }

    // Apply low-pass filter
    let processed = lowPassFilter(output, config.lowPassFreq, originalRate);

    // Add echo if enabled
    if (config.echo) {
        processed = addEcho(processed, originalRate, config.echoDelay, config.echoDecay);
    }

    // Normalize
    processed = normalizeAudio(processed);

    // Create output AudioBuffer
    const audioContext = new AudioContext();
    const outputBuffer = audioContext.createBuffer(1, processed.length, originalRate);
    outputBuffer.getChannelData(0).set(processed);

    // Create WAV blob
    const wavBlob = audioBufferToWav(outputBuffer);

    await audioContext.close();

    return {
        buffer: outputBuffer,
        blob: wavBlob,
        duration: outputBuffer.duration
    };
}

// Convert AudioBuffer to WAV Blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const samples = buffer.length;
    const dataSize = samples * blockAlign;
    const bufferSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < samples; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
            const sample = buffer.getChannelData(channel)[i];
            const clamped = Math.max(-1, Math.min(1, sample));
            const intSample = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
            view.setInt16(offset, intSample, true);
            offset += 2;
        }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
    }
}

// Load audio file
export async function loadAudioFile(file: File): Promise<AudioBuffer> {
    const arrayBuffer = await file.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    await audioContext.close();
    return audioBuffer;
}

// Format duration as MM:SS
export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
