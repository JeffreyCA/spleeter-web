export type Separator =
  | 'spleeter'
  | 'xumx'
  | 'demucs'
  | 'demucs_extra'
  | 'light'
  | 'light_extra'
  | 'tasnet'
  | 'tasnet_extra';

// Map of separator IDs to labels
export const separatorLabelMap = {
  spleeter: 'Spleeter',
  xumx: 'X-UMX',
  demucs: 'Demucs',
  demucs_extra: 'Demucs (extra)',
  light: 'Demucs Light',
  light_extra: 'Demucs Light (extra)',
  tasnet: 'Tasnet',
  tasnet_extra: 'Tasnet (extra)',
};
