export type Separator =
  | 'spleeter'
  | 'xumx'
  | 'demucs'
  | 'demucs48_hq'
  | 'demucs_extra'
  | 'demucs_quantized'
  | 'tasnet'
  | 'tasnet_extra';

// Map of separator IDs to labels
export const separatorLabelMap = {
  spleeter: 'Spleeter',
  xumx: 'X-UMX',
  demucs: 'Demucs',
  demucs48_hq: 'Demucs HQ',
  demucs_extra: 'Demucs Extra',
  demucs_quantized: 'Demucs Quantized',
  tasnet: 'Tasnet',
  tasnet_extra: 'Tasnet Extra',
};
