import { YouTubeVideo } from './YouTubeVideo';

export interface YouTubeSearchResponse {
  next_page_token: string | null;
  results: YouTubeVideo[];
}
