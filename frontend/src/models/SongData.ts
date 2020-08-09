import { DynamicMix } from './DynamicMix';
import { StaticMix } from './StaticMix';

/**
 * Represents a "SourceTrack" from the backend.
 */
export interface SongData {
  id: string;
  source_file: string;
  artist: string;
  title: string;
  url: string;
  date_created: string;
  dynamic: DynamicMix | null;
  static: StaticMix[];
}
