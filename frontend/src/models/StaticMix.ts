/**
 * Static mix model from backend.
 */
export interface StaticMix {
  id: string;
  source_track: string;
  artist: string;
  title: string;
  url: string;
  status: string;
  error: string;
  date_created: string;
  vocals: boolean;
  other: boolean;
  bass: boolean;
  drums: boolean;
}
