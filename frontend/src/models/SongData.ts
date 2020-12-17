import { DynamicMix } from './DynamicMix';
import { StaticMix } from './StaticMix';
import { TaskStatus } from './TaskStatus';

/**
 * Represents a "SourceTrack" from the backend.
 */
export interface SongData {
  id: string;
  source_file: string;
  artist: string;
  title: string;
  url: string;
  dynamic: DynamicMix | null;
  static: StaticMix[];
  is_youtube: boolean;
  youtube_link: string | null;
  fetch_task_status: TaskStatus | null;
  fetch_task_error: string;
  date_created: string;
}
