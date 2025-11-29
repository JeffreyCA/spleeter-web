/**
 * Mapping of song components from backend-supported keys to user-friendly names.
 */

const baseParts = {
  vocals: 'Vocals',
  other: 'Accompaniment',
  bass: 'Bass',
  drums: 'Drums',
};

export const MusicPartMap4 = new Map(Object.entries(baseParts));

export const MusicPartMap5Piano = new Map(Object.entries({ ...baseParts, piano: 'Piano' }));

export const MusicPartMap5Guitar = new Map(Object.entries({ ...baseParts, guitar: 'Guitar' }));

export const MusicPartMap6 = new Map(Object.entries({ ...baseParts, guitar: 'Guitar', piano: 'Piano' }));
