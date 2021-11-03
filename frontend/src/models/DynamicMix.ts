import { Separator } from './Separator';
import { TaskStatus } from './TaskStatus';

/**
 * Dynamic mix model from backend.
 */
export interface DynamicMix {
  id: string;
  source_track: string;
  separator: Separator;
  random_shifts?: number;
  extra_info: string[];
  artist: string;
  title: string;
  status: TaskStatus;
  error: string;
  date_created: string;
  vocals_url: string | null;
  other_url: string | null;
  bass_url: string | null;
  drums_url: string | null;
}
