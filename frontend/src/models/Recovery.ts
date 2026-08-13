export interface RecoveryTrackMatch {
  kind: 'track';
  id: string;
}

export interface RecoveryUpload {
  id: string;
  filename: string;
  url: string;
  artist: string;
  title: string;
  date: string;
}

export interface RecoveryMix {
  id: string;
  type: 'static' | 'dynamic';
  files: string[];
  preview_url: string;
  stem_urls: { [stem: string]: string };
  prefix: string;
  artist: string;
  title: string;
  parts: string[];
  separator: string;
  separator_args: Record<string, unknown>;
  bitrate: number;
  parsed: boolean;
  normalized: boolean;
  match: RecoveryTrackMatch | null;
  date: string;
  // Client-side only: the user's track association choice, encoded as
  // 'track:<id>', or '' when no track is selected
  track: string;
}

export interface RecoveryTrackRef {
  id: string;
  artist: string;
  title: string;
  path: string;
}

export interface RecoveryScanResponse {
  uploads: RecoveryUpload[];
  mixes: Omit<RecoveryMix, 'track'>[];
  existing_tracks: RecoveryTrackRef[];
}

export interface RecoveryImportResult {
  id: string;
  status: 'imported' | 'skipped' | 'error';
  detail?: string;
  track_id?: string;
}

export interface RecoveryImportResponse {
  uploads: RecoveryImportResult[];
  placeholders: RecoveryImportResult[];
  mixes: RecoveryImportResult[];
}
