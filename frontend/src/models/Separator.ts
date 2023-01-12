export type SeparatorFamily = 'spleeter' | 'd3net' | 'xumx' | 'demucs';

export type Separator =
  | 'spleeter'
  | 'spleeter_5stems'
  | 'd3net'
  | 'xumx'
  // Demucs v4
  | 'htdemucs'
  | 'htdemucs_ft'
  // Demucs v3
  | 'hdemucs_mmi'
  | 'mdx'
  | 'mdx_extra'
  | 'mdx_q'
  | 'mdx_extra_q'
  // Deprecated
  | 'demucs'
  | 'demucs48_hq'
  | 'demucs_extra'
  | 'demucs_quantized'
  | 'tasnet'
  | 'tasnet_extra'
  | 'light'
  | 'light_extra';

// Map of separator IDs to labels
export const separatorLabelMap = {
  spleeter: 'Spleeter',
  spleeter_5stems: 'Spleeter 5 stems',
  d3net: 'D3Net',
  xumx: 'X-UMX',
  // Demucs v4
  htdemucs: 'Demucs v4',
  htdemucs_ft: 'Demucs v4 Fine-tuned',
  // Demucs v3
  hdemucs_mmi: 'Demucs v3 MMI',
  mdx: 'Demucs v3',
  mdx_extra: 'Demucs v3 Extra',
  mdx_q: 'Demucs v3 Q',
  mdx_extra_q: 'Demucs v3 Extra Q',
  // Demucs v2
  demucs: 'Demucs v2',
  demucs48_hq: 'Demucs v2 HQ',
  demucs_extra: 'Demucs v2 Extra',
  demucs_quantized: 'Demucs v2 Q',
  tasnet: 'Tasnet v2',
  tasnet_extra: 'Tasnet v2 Extra',
  light: 'Demucs v1 Light',
  light_extra: 'Demucs v1 Light (extra)',
};

export const isDemucsOrTasnet = (separator: Separator): boolean => {
  return (
    // Demucs v4
    separator === 'htdemucs' ||
    separator === 'htdemucs_ft' ||
    // Demucs v3
    separator === 'hdemucs_mmi' ||
    separator === 'mdx' ||
    separator === 'mdx_extra' ||
    separator === 'mdx_q' ||
    separator === 'mdx_extra_q' ||
    // Deprecated
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
