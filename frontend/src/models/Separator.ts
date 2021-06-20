export type Separator =
  | 'spleeter'
  | 'd3net'
  | 'xumx'
  | 'demucs'
  | 'demucs48_hq'
  | 'demucs_extra'
  | 'demucs_quantized'
  | 'tasnet'
  | 'tasnet_extra'
  // Deprecated
  | 'light'
  | 'light_extra';

// Map of separator IDs to labels
export const separatorLabelMap = {
  spleeter: 'Spleeter',
  d3net: 'D3Net',
  xumx: 'X-UMX',
  demucs: 'Demucs',
  demucs48_hq: 'Demucs HQ',
  demucs_extra: 'Demucs Extra',
  demucs_quantized: 'Demucs Quantized',
  tasnet: 'Tasnet',
  tasnet_extra: 'Tasnet Extra',
  light: 'Demucs Light',
  light_extra: 'Demucs Light (extra)',
};

export const isDemucsOrTasnet = (separator: Separator): boolean => {
  return (
    separator === 'demucs' ||
    separator === 'demucs48_hq' ||
    separator === 'demucs_extra' ||
    separator === 'demucs_quantized' ||
    separator === 'tasnet' ||
    separator === 'tasnet_extra' ||
    separator === 'light' ||
    separator === 'light_extra'
  );
};
