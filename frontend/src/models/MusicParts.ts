/**
 * Mapping of song components from backend-supported keys to user-friendly names.
 */
export const MusicPartMap = new Map([
  ['vocals', 'Vocals'],
  ['other', 'Accompaniment'],
  ['bass', 'Bass'],
  ['drums', 'Drums'],
]);

export type MusicParts = 'vocals' | 'other' | 'bass' | 'drums';
