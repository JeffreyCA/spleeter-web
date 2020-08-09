/**
 * Dynamic mix model from backend.
 */
export interface DynamicMix {
  id: string;
  source_track: string;
  artist: string;
  title: string;
  status: string;
  error: string;
  date_created: string;
  vocals_file: string | null;
  other_file: string | null;
  bass_file: string | null;
  drums_file: string | null;
}
