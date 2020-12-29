import { Separator } from './Separator';
import { TaskStatus } from './TaskStatus';

/**
 * Static mix model from backend.
 */
export interface StaticMix {
  id: string;
  source_track: string;
  separator: Separator;
  random_shifts?: number;
  extra_info: string[];
  artist: string;
  title: string;
  url: string;
  status: TaskStatus;
  error: string;
  date_created: string;
  vocals: boolean;
  other: boolean;
  bass: boolean;
  drums: boolean;
}
