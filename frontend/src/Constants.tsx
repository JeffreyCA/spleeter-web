export const DEFAULT_MODEL = 'spleeter';
export const LOSSY_OUTPUT_FORMATS: [number, string][] = [
  [192, '192 kbps'],
  [256, '256 kbps'],
  [320, '320 kbps'],
];
// Reserve 0 and 1 for backcompat
export const LOSSLESS_OUTPUT_FORMATS: [number, string][] = [
  [0, 'WAV'],
  [1, 'FLAC'],
];
export const DEFAULT_OUTPUT_FORMAT = 256;
export const DEFAULT_SOFTMASK_ALPHA = 1.0;
export const MAX_SHIFT_ITER = 50;
export const FADE_DURATION_MS = 300;
export const FADE_DURATION_S = 0.3;

// This value is the same on the server-side (settings.py)
export const MAX_FILE_BYTES = 100 * 1024 * 1024;

export const ALLOWED_EXTENSIONS = [
  // Lossless
  '.aif',
  '.aifc',
  '.aiff',
  '.flac',
  '.wav',
  // Lossy
  '.aac',
  '.m4a',
  '.mp3',
  '.opus',
  '.weba',
  '.webm',
  // Ogg-Vorbis (Lossy)
  '.ogg',
  '.oga',
  '.mogg',
];
