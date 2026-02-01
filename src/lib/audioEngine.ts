// Chiptune Audio Engine v2
// Proper pre/post filtering for better sound quality

export type ChipStyle = 'nes' | 'gameboy' | 'c64' | 'atari';
export type WaveformType = 'square' | 'pulse25' | 'pulse12' | 'triangle' | 'sawtooth' | 'noise';

export interface ChiptuneConfig {
    chipStyle: ChipStyle;
    bitDepth: number;
    sampleRate: number;
    waveform: WaveformType;
    pulseWidth: number;

    // Pre-processing
    preHighPass: number;        // High-pass filter to remove rumble (Hz)
    preCompression: number;     // Compression amount (0-1)
    preGain: number;            // Input gain before processing

    // Synthesis
    noiseBlend: number;
    quantizeNotes: boolean;
    pitchSmoothing: number;     // Smooth pitch changes (0-1)
    envelopeFollow: number;     // How closely to follow original envelope (0-1)

    // Post-processing
    postLowPass: number;        // Low-pass to smooth output
    postHighPass: number;       // High-pass to remove DC offset
    warmth: number;             // Analog warmth/saturation (0-1)
    gain: number;

    // Effects
    echo: boolean;
    echoDelay: number;
    echoDecay: number;
    chorus: boolean;            // Subtle chorus for thickness
}

export const DEFAULT_CHIPTUNE_CONFIG: ChiptuneConfig = {
    chipStyle: 'nes',
    bitDepth: 8,
    sampleRate: 22050,
    waveform: 'square',
    pulseWidth: 0.5,

    preHighPass: 80,
    preCompression: 0.5,
    preGain: 1.0,

    noiseBlend: 0,
    quantizeNotes: true,
    pitchSmoothing: 0.8,
    envelopeFollow: 0.7,

    postLowPass: 8000,
    postHighPass: 30,
    warmth: 0.3,
    gain: 0.8,

    echo: false,
    echoDelay: 120,
    echoDecay: 0.35,
    chorus: false
};

export const CHIP_PRESETS: Record<ChipStyle, Partial<ChiptuneConfig>> = {
    nes: {
        bitDepth: 8,
        sampleRate: 22050,
        waveform: 'square',
        postLowPass: 8000,
        warmth: 0.2
    },
    gameboy: {
        bitDepth: 4,
        sampleRate: 16384,
        waveform: 'square',
        postLowPass: 6000,
        warmth: 0.4
    },
    c64: {
        bitDepth: 8,
        sampleRate: 22050,
        waveform: 'sawtooth',
        postLowPass: 10000,
        warmth: 0.5
    },
    atari: {
        bitDepth: 4,
        sampleRate: 15700,
        waveform: 'square',
        postLowPass: 4000,
        warmth: 0.3
    }
};

export interface ProcessedAudio {
    buffer: AudioBuffer;
    blob: Blob;
    duration: number;
}

// ============== FILTER IMPLEMENTATIONS ==============

// Biquad filter coefficients
interface BiquadCoeffs {
    b0: number; b1: number; b2: number;
    a1: number; a2: number;
}

// Calculate high-pass biquad coefficients
function calcHighPassCoeffs(freq: number, sampleRate: number, Q: number = 0.707): BiquadCoeffs {
    const w0 = 2 * Math.PI * freq / sampleRate;
    const cosW0 = Math.cos(w0);
    const sinW0 = Math.sin(w0);
    const alpha = sinW0 / (2 * Q);

    const a0 = 1 + alpha;
    return {
        b0: ((1 + cosW0) / 2) / a0,
        b1: (-(1 + cosW0)) / a0,
        b2: ((1 + cosW0) / 2) / a0,
        a1: (-2 * cosW0) / a0,
        a2: (1 - alpha) / a0
    };
}

// Calculate low-pass biquad coefficients  
function calcLowPassCoeffs(freq: number, sampleRate: number, Q: number = 0.707): BiquadCoeffs {
    const w0 = 2 * Math.PI * freq / sampleRate;
    const cosW0 = Math.cos(w0);
    const sinW0 = Math.sin(w0);
    const alpha = sinW0 / (2 * Q);

    const a0 = 1 + alpha;
    return {
        b0: ((1 - cosW0) / 2) / a0,
        b1: (1 - cosW0) / a0,
        b2: ((1 - cosW0) / 2) / a0,
        a1: (-2 * cosW0) / a0,
        a2: (1 - alpha) / a0
    };
}

// Apply biquad filter
function applyBiquad(data: Float32Array, coeffs: BiquadCoeffs): Float32Array {
    const output = new Float32Array(data.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;

    for (let i = 0; i < data.length; i++) {
        const x0 = data[i];
        const y0 = coeffs.b0 * x0 + coeffs.b1 * x1 + coeffs.b2 * x2
            - coeffs.a1 * y1 - coeffs.a2 * y2;
        output[i] = y0;
        x2 = x1; x1 = x0;
        y2 = y1; y1 = y0;
    }
    return output;
}

// Simple compressor
function compress(data: Float32Array, threshold: number, ratio: number, attack: number, release: number, sampleRate: number): Float32Array {
    const output = new Float32Array(data.length);
    const attackCoeff = Math.exp(-1 / (attack * sampleRate));
    const releaseCoeff = Math.exp(-1 / (release * sampleRate));

    let envelope = 0;

    for (let i = 0; i < data.length; i++) {
        const inputAbs = Math.abs(data[i]);

        // Envelope follower
        if (inputAbs > envelope) {
            envelope = attackCoeff * envelope + (1 - attackCoeff) * inputAbs;
        } else {
            envelope = releaseCoeff * envelope + (1 - releaseCoeff) * inputAbs;
        }

        // Gain reduction
        let gain = 1;
        if (envelope > threshold) {
            const overDb = 20 * Math.log10(envelope / threshold);
            const reducedDb = overDb * (1 - 1 / ratio);
            gain = Math.pow(10, -reducedDb / 20);
        }

        output[i] = data[i] * gain;
    }

    return output;
}

// Soft saturation for warmth
function saturate(data: Float32Array, amount: number): Float32Array {
    const output = new Float32Array(data.length);
    const k = 2 * amount / (1 - amount + 0.01);

    for (let i = 0; i < data.length; i++) {
        const x = data[i];
        // Soft clipping curve
        output[i] = (1 + k) * x / (1 + k * Math.abs(x));
    }

    return output;
}

// ============== PITCH DETECTION ==============

// Autocorrelation-based pitch detection with improvements
function detectPitch(
    data: Float32Array,
    sampleRate: number,
    windowStart: number,
    windowSize: number
): { freq: number; confidence: number } {
    const endIndex = Math.min(windowStart + windowSize, data.length);
    const actualSize = endIndex - windowStart;

    if (actualSize < 64) return { freq: 0, confidence: 0 };

    // Calculate RMS
    let rms = 0;
    for (let i = windowStart; i < endIndex; i++) {
        rms += data[i] * data[i];
    }
    rms = Math.sqrt(rms / actualSize);

    if (rms < 0.01) return { freq: 0, confidence: 0 };

    // Normalized autocorrelation
    const minPeriod = Math.floor(sampleRate / 1000);
    const maxPeriod = Math.floor(sampleRate / 50);

    let bestCorrelation = 0;
    let bestPeriod = 0;

    for (let period = minPeriod; period < Math.min(maxPeriod, actualSize / 2); period++) {
        let correlation = 0;
        let norm1 = 0;
        let norm2 = 0;

        for (let i = 0; i < actualSize - period; i++) {
            const v1 = data[windowStart + i];
            const v2 = data[windowStart + i + period];
            correlation += v1 * v2;
            norm1 += v1 * v1;
            norm2 += v2 * v2;
        }

        const normalizedCorr = correlation / (Math.sqrt(norm1 * norm2) + 0.0001);

        if (normalizedCorr > bestCorrelation) {
            bestCorrelation = normalizedCorr;
            bestPeriod = period;
        }
    }

    if (bestCorrelation < 0.5) return { freq: 0, confidence: bestCorrelation };

    return {
        freq: sampleRate / bestPeriod,
        confidence: bestCorrelation
    };
}

// Get RMS amplitude
function getAmplitude(data: Float32Array, start: number, size: number): number {
    const end = Math.min(start + size, data.length);
    let sum = 0;
    for (let i = start; i < end; i++) {
        sum += data[i] * data[i];
    }
    return Math.sqrt(sum / (end - start));
}

// ============== WAVEFORM GENERATION ==============

const NOTE_FREQUENCIES: number[] = [];
for (let i = 0; i < 128; i++) {
    NOTE_FREQUENCIES.push(440 * Math.pow(2, (i - 69) / 12));
}

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

function generateWaveformSample(
    phase: number,
    waveform: WaveformType,
    pulseWidth: number,
    noiseState: { value: number; lfsr: number }
): number {
    const p = phase % 1;

    switch (waveform) {
        case 'square':
            return p < 0.5 ? 1 : -1;
        case 'pulse25':
            return p < 0.25 ? 1 : -1;
        case 'pulse12':
            return p < 0.125 ? 1 : -1;
        case 'triangle':
            return p < 0.5 ? 4 * p - 1 : 3 - 4 * p;
        case 'sawtooth':
            return 2 * p - 1;
        case 'noise':
            if (Math.random() < 0.1) {
                const bit = ((noiseState.lfsr >> 0) ^ (noiseState.lfsr >> 2)) & 1;
                noiseState.lfsr = (noiseState.lfsr >> 1) | (bit << 14);
                noiseState.value = (noiseState.lfsr & 1) ? 1 : -1;
            }
            return noiseState.value;
        default:
            return p < pulseWidth ? 1 : -1;
    }
}

// Bit crush
function bitCrush(sample: number, bits: number): number {
    const levels = Math.pow(2, bits);
    const step = 2 / levels;
    return Math.round(sample / step) * step;
}

// Simple chorus effect
function applyChorus(data: Float32Array, sampleRate: number): Float32Array {
    const output = new Float32Array(data.length);
    const delayMs = 20;
    const depth = 3; // ms
    const rate = 0.5; // Hz
    const delaySamples = Math.floor(sampleRate * delayMs / 1000);
    const depthSamples = Math.floor(sampleRate * depth / 1000);

    for (let i = 0; i < data.length; i++) {
        const lfo = Math.sin(2 * Math.PI * rate * i / sampleRate);
        const delay = delaySamples + Math.floor(depthSamples * lfo);

        let delayed = 0;
        if (i >= delay) {
            delayed = data[i - delay];
        }

        output[i] = data[i] * 0.7 + delayed * 0.3;
    }

    return output;
}

// Echo effect
function applyEcho(data: Float32Array, sampleRate: number, delayMs: number, decay: number): Float32Array {
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

// Normalize
function normalizeAudio(data: Float32Array, targetPeak: number = 0.95): Float32Array {
    let maxAbs = 0;
    for (let i = 0; i < data.length; i++) {
        if (Math.abs(data[i]) > maxAbs) maxAbs = Math.abs(data[i]);
    }

    if (maxAbs === 0) return data;

    const scale = targetPeak / maxAbs;
    const output = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) {
        output[i] = data[i] * scale;
    }

    return output;
}

// ============== MAIN CONVERSION ==============

export async function convertToChiptune(
    audioBuffer: AudioBuffer,
    config: ChiptuneConfig
): Promise<ProcessedAudio> {
    const sampleRate = audioBuffer.sampleRate;

    // Mix to mono
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

    // ============ PRE-PROCESSING ============
    console.log('Pre-processing...');

    // Apply input gain
    for (let i = 0; i < inputData.length; i++) {
        inputData[i] *= config.preGain;
    }

    // High-pass filter to remove DC offset and rumble
    if (config.preHighPass > 0) {
        const hpCoeffs = calcHighPassCoeffs(config.preHighPass, sampleRate);
        inputData = applyBiquad(inputData, hpCoeffs);
    }

    // Compression to even out dynamics
    if (config.preCompression > 0) {
        const threshold = 0.3 - config.preCompression * 0.2;
        const ratio = 2 + config.preCompression * 4;
        inputData = compress(inputData, threshold, ratio, 0.01, 0.1, sampleRate);
    }

    // ============ ANALYSIS ============
    console.log('Analyzing audio...');

    const windowSize = Math.floor(sampleRate * 0.03); // 30ms windows
    const hopSize = Math.floor(windowSize / 4);
    const numWindows = Math.floor((inputData.length - windowSize) / hopSize);

    // Pre-analyze all windows
    const pitches: number[] = [];
    const amplitudes: number[] = [];
    const confidences: number[] = [];

    for (let w = 0; w < numWindows; w++) {
        const start = w * hopSize;
        const { freq, confidence } = detectPitch(inputData, sampleRate, start, windowSize);
        const amp = getAmplitude(inputData, start, windowSize);

        pitches.push(freq);
        amplitudes.push(amp);
        confidences.push(confidence);
    }

    // Smooth pitches
    const smoothedPitches = [...pitches];
    if (config.pitchSmoothing > 0) {
        const smoothFactor = config.pitchSmoothing;
        for (let i = 1; i < smoothedPitches.length; i++) {
            if (pitches[i] > 0 && pitches[i - 1] > 0) {
                smoothedPitches[i] = smoothedPitches[i - 1] * smoothFactor + pitches[i] * (1 - smoothFactor);
            }
        }
    }

    // Smooth amplitudes
    const smoothedAmps = [...amplitudes];
    for (let i = 1; i < smoothedAmps.length; i++) {
        smoothedAmps[i] = smoothedAmps[i - 1] * 0.7 + amplitudes[i] * 0.3;
    }

    // ============ SYNTHESIS ============
    console.log('Synthesizing chiptune...');

    const output = new Float32Array(inputData.length);
    let phase = 0;
    const noiseState = { value: 0, lfsr: 0x7FFF };

    for (let w = 0; w < numWindows; w++) {
        let freq = smoothedPitches[w];
        const amp = smoothedAmps[w];
        const confidence = confidences[w];

        // Quantize to musical notes
        if (config.quantizeNotes && freq > 0) {
            freq = quantizeToNote(freq);
        }

        const windowStart = w * hopSize;
        const windowEnd = Math.min(windowStart + hopSize, inputData.length);

        for (let i = windowStart; i < windowEnd; i++) {
            let sample = 0;

            if (freq > 30 && amp > 0.005 && confidence > 0.4) {
                // Generate waveform
                sample = generateWaveformSample(phase, config.waveform, config.pulseWidth, noiseState);
                phase += freq / sampleRate;

                // Apply envelope following
                const targetAmp = amp * 3;
                sample *= targetAmp * config.envelopeFollow + (1 - config.envelopeFollow) * 0.5;
            }

            // Blend noise
            if (config.noiseBlend > 0 && amp > 0.005) {
                const noiseSample = generateWaveformSample(0, 'noise', 0.5, noiseState);
                sample = sample * (1 - config.noiseBlend) + noiseSample * config.noiseBlend * amp;
            }

            // Bit crush
            sample = bitCrush(sample, config.bitDepth);

            output[i] = sample;
        }
    }

    // ============ POST-PROCESSING ============
    console.log('Post-processing...');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let processed: any = output;

    // Low-pass filter to remove harsh aliasing
    if (config.postLowPass > 0 && config.postLowPass < sampleRate / 2) {
        const lpCoeffs = calcLowPassCoeffs(config.postLowPass, sampleRate);
        processed = applyBiquad(processed, lpCoeffs);
        // Apply twice for steeper rolloff
        processed = applyBiquad(processed, lpCoeffs);
    }

    // High-pass to remove DC offset
    if (config.postHighPass > 0) {
        const hpCoeffs = calcHighPassCoeffs(config.postHighPass, sampleRate);
        processed = applyBiquad(processed, hpCoeffs);
    }

    // Add warmth/saturation
    if (config.warmth > 0) {
        processed = saturate(processed, config.warmth);
    }

    // Chorus
    if (config.chorus) {
        processed = applyChorus(processed, sampleRate);
    }

    // Echo
    if (config.echo) {
        processed = applyEcho(processed, sampleRate, config.echoDelay, config.echoDecay);
    }

    // Apply output gain
    for (let i = 0; i < processed.length; i++) {
        processed[i] *= config.gain;
    }

    // Final normalize
    processed = normalizeAudio(processed);

    // Create output buffer
    const audioContext = new AudioContext();
    const outputBuffer = audioContext.createBuffer(1, processed.length, sampleRate);
    const channelData = outputBuffer.getChannelData(0);
    for (let i = 0; i < processed.length; i++) {
        channelData[i] = processed[i];
    }

    const wavBlob = audioBufferToWav(outputBuffer);

    await audioContext.close();

    return {
        buffer: outputBuffer,
        blob: wavBlob,
        duration: outputBuffer.duration
    };
}

// WAV export
function audioBufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
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
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < samples; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
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

export async function loadAudioFile(file: File): Promise<AudioBuffer> {
    const arrayBuffer = await file.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    await audioContext.close();
    return audioBuffer;
}

export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
