import axios from 'axios';
import * as React from 'react';
import { Alert, Badge, Button, Container, Form, Spinner, Tab, Tabs } from 'react-bootstrap';
import { PauseFill, Pencil, PlayFill } from 'react-bootstrap-icons';
import BootstrapTable, { ColumnDescription, SelectRowProps } from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import cellEditFactory from 'react-bootstrap-table2-editor';
import './Recovery.css';
import {
  RecoveryImportResponse,
  RecoveryImportResult,
  RecoveryMix,
  RecoveryScanResponse,
  RecoveryTrackRef,
  RecoveryUpload,
} from '../../models/Recovery';
import { toRelativeDateSpan } from '../../Utils';
import PlainNavBar from '../Nav/PlainNavBar';

const BITRATE_LABELS: { [bitrate: number]: string } = {
  0: 'WAV',
  1: 'FLAC',
  192: '192 kbps',
  256: '256 kbps',
  320: '320 kbps',
};

const nonEmptyValidator = (newValue: string) => {
  if (!newValue) {
    return {
      valid: false,
      message: 'Cannot be empty.',
    };
  }
  return true;
};

/**
 * Render an editable cell with a dashed underline and pencil icon so it is
 * apparent which fields can be clicked to edit.
 */
const editableCell = (value: string): JSX.Element => (
  <span className="recovery-editable">
    {value || <em>none</em>}
    <Pencil size={12} className="recovery-edit-icon" />
  </span>
);

interface State {
  isLoaded: boolean;
  scanErrors: string[];
  uploads: RecoveryUpload[];
  mixes: RecoveryMix[];
  existingTracks: RecoveryTrackRef[];
  selectedUploadIds: string[];
  selectedMixIds: string[];
  importing: boolean;
  importResults?: RecoveryImportResponse;
  resultLabels: { [id: string]: string };
  playingUrl?: string;
  activeTab: string;
  placeholderArtist: string;
  placeholderTitle: string;
}

/**
 * Hidden maintenance page (not linked from the UI) that scans the media directory for
 * uploads and mixes missing from the database and re-imports them on a best-effort basis.
 * Used to recover from database loss when the media files survived.
 */
class Recovery extends React.Component<Record<string, never>, State> {
  audio: HTMLAudioElement;

  constructor(props: Record<string, never>) {
    super(props);
    this.audio = new Audio();
    this.audio.onended = () => this.setState({ playingUrl: undefined });
    this.state = {
      isLoaded: false,
      scanErrors: [],
      uploads: [],
      mixes: [],
      existingTracks: [],
      selectedUploadIds: [],
      selectedMixIds: [],
      importing: false,
      importResults: undefined,
      resultLabels: {},
      playingUrl: undefined,
      activeTab: 'uploads',
      placeholderArtist: '',
      placeholderTitle: '',
    };
  }

  componentDidMount(): void {
    this.loadScan();
  }

  componentWillUnmount(): void {
    this.audio.pause();
  }

  stopPlayback = (): void => {
    this.audio.pause();
    this.setState({ playingUrl: undefined });
  };

  togglePlay = (url: string): void => {
    if (this.state.playingUrl === url) {
      this.stopPlayback();
    } else {
      this.audio.src = url;
      this.audio.play().catch(() => this.setState({ playingUrl: undefined }));
      this.setState({ playingUrl: url });
    }
  };

  loadScan = (): void => {
    this.stopPlayback();
    this.setState({ isLoaded: false, scanErrors: [] });
    axios
      .get<RecoveryScanResponse>('/api/recovery/scan/')
      .then(({ data }) => {
        // Rescans happen after every import; carry over the user's in-progress
        // edits, track choices, and deselections for rows that are still listed
        const prevUploads = new Map(this.state.uploads.map(upload => [upload.id, upload]));
        const prevMixes = new Map(this.state.mixes.map(mix => [mix.id, mix]));
        const prevSelectedUploads = new Set(this.state.selectedUploadIds);
        const prevSelectedMixes = new Set(this.state.selectedMixIds);

        const uploads: RecoveryUpload[] = data.uploads.map(upload => {
          const prev = prevUploads.get(upload.id);
          return prev ? { ...upload, artist: prev.artist, title: prev.title } : upload;
        });
        const mixes: RecoveryMix[] = data.mixes.map(mix => {
          const prev = prevMixes.get(mix.id);
          const matchedTrack = mix.match ? `track:${mix.match.id}` : '';
          return { ...mix, track: prev && prev.track ? prev.track : matchedTrack };
        });
        this.setState({
          isLoaded: true,
          uploads: uploads,
          mixes: mixes,
          existingTracks: data.existing_tracks,
          selectedUploadIds: uploads
            .map(upload => upload.id)
            .filter(id => !prevUploads.has(id) || prevSelectedUploads.has(id)),
          selectedMixIds: mixes.map(mix => mix.id).filter(id => !prevMixes.has(id) || prevSelectedMixes.has(id)),
          // Uploads should be recovered first, so advance to mixes once none
          // remain - but never pull the user back from the mixes tab
          activeTab: this.state.activeTab === 'uploads' && data.uploads.length === 0 ? 'mixes' : this.state.activeTab,
        });
      })
      .catch(error => {
        const errors = error.response?.data?.errors ?? ['Could not scan the media directory.'];
        this.setState({ isLoaded: true, scanErrors: errors });
      });
  };

  postImport = (payload: Record<string, unknown>, resultLabels: { [id: string]: string }): void => {
    this.setState({ importing: true });
    axios
      .post<RecoveryImportResponse>('/api/recovery/import/', payload)
      .then(({ data }) => {
        this.setState({ importing: false, importResults: data, resultLabels: resultLabels });
        this.loadScan();
      })
      .catch(error => {
        const errors = error.response?.data?.errors ?? ['Import failed.'];
        this.setState({ importing: false, scanErrors: errors });
      });
  };

  handleImportUploads = (): void => {
    const { uploads, selectedUploadIds } = this.state;
    const selectedUploads = uploads.filter(upload => selectedUploadIds.includes(upload.id));

    // Remember row descriptions so import results stay readable after rescan
    const resultLabels: { [id: string]: string } = {};
    selectedUploads.forEach(upload => (resultLabels[upload.id] = upload.filename));

    this.postImport(
      {
        uploads: selectedUploads.map(upload => ({
          id: upload.id,
          artist: upload.artist,
          title: upload.title,
        })),
      },
      resultLabels
    );
  };

  handleImportMixes = (): void => {
    const importableMixes = this.importableMixes();

    const resultLabels: { [id: string]: string } = {};
    importableMixes.forEach(mix => (resultLabels[mix.id] = `${mix.prefix} (${mix.type})`));

    this.postImport(
      {
        mixes: importableMixes.map(mix => ({
          id: mix.id,
          track: { kind: 'track', id: mix.track.split(':')[1] },
        })),
      },
      resultLabels
    );
  };

  handleCreatePlaceholder = (): void => {
    const artist = this.state.placeholderArtist.trim();
    const title = this.state.placeholderTitle.trim();
    const label = artist ? `${artist} - ${title}` : title;
    this.setState({ placeholderArtist: '', placeholderTitle: '' });
    this.postImport({ placeholders: [{ artist, title }] }, { [label]: `Placeholder track: ${label}` });
  };

  // Selected mixes that have a source track chosen; only these can be imported
  importableMixes = (): RecoveryMix[] => {
    const { mixes, selectedMixIds } = this.state;
    return mixes.filter(mix => selectedMixIds.includes(mix.id) && mix.track !== '');
  };

  onTabSelect = (tab: string | null): void => {
    this.stopPlayback();
    this.setState({ activeTab: tab ?? 'uploads' });
  };

  onTrackChoiceChange = (mixId: string, value: string): void => {
    // Replace the row object so the table repaints the whole row, including the
    // artist/title cells whose editability depends on this choice
    this.setState(state => ({
      mixes: state.mixes.map(mix => (mix.id === mixId ? { ...mix, track: value } : mix)),
    }));
  };

  onUploadSelect = (row: RecoveryUpload, isSelected: boolean): void => {
    this.setState(state => ({
      selectedUploadIds: isSelected
        ? [...state.selectedUploadIds, row.id]
        : state.selectedUploadIds.filter(id => id !== row.id),
    }));
  };

  onUploadSelectAll = (isSelected: boolean, rows: RecoveryUpload[]): void => {
    this.setState({ selectedUploadIds: isSelected ? rows.map(row => row.id) : [] });
  };

  onMixSelect = (row: RecoveryMix, isSelected: boolean): void => {
    this.setState(state => ({
      selectedMixIds: isSelected ? [...state.selectedMixIds, row.id] : state.selectedMixIds.filter(id => id !== row.id),
    }));
  };

  onMixSelectAll = (isSelected: boolean, rows: RecoveryMix[]): void => {
    this.setState({ selectedMixIds: isSelected ? rows.map(row => row.id) : [] });
  };

  trackChoiceOptions = (): Array<{ value: string; label: string }> => {
    const { existingTracks } = this.state;
    return [
      { value: '', label: 'Select a track...' },
      ...existingTracks.map(track => ({
        value: `track:${track.id}`,
        label: `${track.artist ? `${track.artist} - ` : ''}${track.title}`,
      })),
    ];
  };

  renderResults = (): JSX.Element | null => {
    const { importResults, resultLabels } = this.state;
    if (!importResults) {
      return null;
    }
    const results: RecoveryImportResult[] = [
      ...importResults.uploads,
      ...(importResults.placeholders ?? []),
      ...importResults.mixes,
    ];
    const numImported = results.filter(result => result.status === 'imported').length;
    const variantMap = { imported: 'success', skipped: 'warning', error: 'danger' } as const;
    return (
      <Alert variant={numImported === results.length ? 'success' : 'warning'}>
        <Alert.Heading>
          Imported {numImported} of {results.length} items
        </Alert.Heading>
        <ul className="mb-0">
          {results.map(result => (
            <li key={result.id}>
              <Badge variant={variantMap[result.status]}>{result.status}</Badge> {resultLabels[result.id] ?? result.id}
              {result.detail ? ` - ${result.detail}` : ''}
            </li>
          ))}
        </ul>
      </Alert>
    );
  };

  renderPlayButton = (url: string): JSX.Element => {
    const isPlaying = this.state.playingUrl === url;
    return (
      <Button variant="link" size="sm" className="p-0" title="Preview" onClick={() => this.togglePlay(url)}>
        {isPlaying ? <PauseFill size={22} /> : <PlayFill size={22} />}
      </Button>
    );
  };

  renderParts = (parts: string[], row: RecoveryMix): JSX.Element => {
    return (
      <span>
        {parts.map((part, index) => {
          const url = row.stem_urls[part];
          const separator = index < parts.length - 1 ? ', ' : '';
          if (!url) {
            return (
              <span key={part}>
                {part}
                {separator}
              </span>
            );
          }
          const isPlaying = this.state.playingUrl === url;
          return (
            <span key={part}>
              <Button
                variant="link"
                size="sm"
                className="p-0 align-baseline"
                title={`Preview ${part} stem`}
                onClick={() => this.togglePlay(url)}>
                {part}
                {isPlaying && <PauseFill size={14} />}
              </Button>
              {separator}
            </span>
          );
        })}
      </span>
    );
  };

  render(): JSX.Element {
    const { isLoaded, scanErrors, uploads, mixes, selectedUploadIds, selectedMixIds, importing } = this.state;
    const trackOptions = this.trackChoiceOptions();

    const uploadColumns: ColumnDescription<RecoveryUpload>[] = [
      {
        dataField: 'url',
        editable: false,
        text: '',
        formatter: (cell: string) => this.renderPlayButton(cell),
        // Changing formatExtraData is what makes the table repaint the play/pause
        // icons on playback changes; cells are memoized otherwise
        formatExtraData: this.state.playingUrl,
        headerStyle: () => ({ width: '40px' }),
      },
      { dataField: 'filename', editable: false, text: 'File' },
      {
        dataField: 'artist',
        editable: true,
        text: 'Artist',
        validator: nonEmptyValidator,
        formatter: (cell: string) => editableCell(cell),
      },
      {
        dataField: 'title',
        editable: true,
        text: 'Title',
        validator: nonEmptyValidator,
        formatter: (cell: string) => editableCell(cell),
      },
      {
        dataField: 'date',
        editable: false,
        text: 'Date',
        formatter: (cell: string) => toRelativeDateSpan(cell),
      },
    ];

    // When a source track is selected, mirror that track's metadata so the cells
    // always show what the mix will actually get; otherwise show the values
    // inferred from the filename as a hint of what the mix is.
    const existingTrackById: { [id: string]: RecoveryTrackRef } = {};
    this.state.existingTracks.forEach(track => (existingTrackById[track.id] = track));
    // eslint-disable-next-line react/display-name
    const mixMetadataFormatter = (field: 'artist' | 'title') => (cell: string, row: RecoveryMix) => {
      const track = existingTrackById[row.track.split(':')[1]];
      return track ? (
        <span className="text-muted" title="Comes from the selected source track">
          {track[field]}
        </span>
      ) : (
        <span className="text-muted font-italic" title="Inferred from the file name">
          {cell}
        </span>
      );
    };

    const mixColumns: ColumnDescription<RecoveryMix>[] = [
      {
        dataField: 'preview_url',
        editable: false,
        text: '',
        formatter: (cell: string) => this.renderPlayButton(cell),
        formatExtraData: this.state.playingUrl,
        headerStyle: () => ({ width: '40px' }),
      },
      {
        dataField: 'type',
        editable: false,
        text: 'Type',
        formatter: (cell: string) => <span>{cell === 'static' ? 'Static' : 'Dynamic'}</span>,
      },
      {
        dataField: 'separator',
        editable: false,
        text: 'Separator',
        formatter: (cell: string, row: RecoveryMix) => (
          <span>
            {cell} ({BITRATE_LABELS[row.bitrate] ?? row.bitrate})
            {(row.normalized || !row.parsed) && (
              <Badge variant="warning" className="ml-1">
                best effort
              </Badge>
            )}
          </span>
        ),
      },
      {
        dataField: 'parts',
        editable: false,
        text: 'Parts',
        formatter: (cell: string[], row: RecoveryMix) => this.renderParts(cell, row),
        formatExtraData: this.state.playingUrl,
      },
      {
        dataField: 'artist',
        editable: false,
        text: 'Artist',
        formatter: mixMetadataFormatter('artist'),
      },
      {
        dataField: 'title',
        editable: false,
        text: 'Title',
        formatter: mixMetadataFormatter('title'),
      },
      {
        dataField: 'track',
        editable: false,
        text: 'Source track',
        formatter: (cell: string, row: RecoveryMix) => (
          <Form.Control
            as="select"
            size="sm"
            value={cell}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
              this.onTrackChoiceChange(row.id, event.target.value)
            }>
            {trackOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Control>
        ),
      },
      {
        dataField: 'date',
        editable: false,
        text: 'Date',
        formatter: (cell: string) => toRelativeDateSpan(cell),
      },
    ];

    const uploadSelectRow: SelectRowProps<RecoveryUpload> = {
      mode: 'checkbox',
      selected: selectedUploadIds,
      onSelect: this.onUploadSelect,
      onSelectAll: this.onUploadSelectAll,
    };

    const mixSelectRow: SelectRowProps<RecoveryMix> = {
      mode: 'checkbox',
      selected: selectedMixIds,
      onSelect: this.onMixSelect,
      onSelectAll: this.onMixSelectAll,
    };

    const numImportableMixes = this.importableMixes().length;

    return (
      <div>
        <PlainNavBar />
        <Container className="mt-4 mb-5">
          <h2>Media Recovery</h2>
          <p className="text-muted">
            Recover missing database entries from files in the media directory, on a best-effort basis. Import the
            uploads first, then the separated mixes - a mix can only be assigned to a track that already exists. If a
            mix&apos;s original upload is gone, create a placeholder track for it from the Uploads tab. Use the play
            buttons to preview files (or individual stems) by ear, and click underlined fields to fix metadata before
            importing. Everything can still be edited later on the main page.
          </p>
          {scanErrors.length > 0 && (
            <Alert variant="danger">
              {scanErrors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </Alert>
          )}
          {!isLoaded ? (
            <Spinner animation="border" role="status" />
          ) : (
            <div>
              {this.renderResults()}
              <Tabs id="recovery-tabs" activeKey={this.state.activeTab} onSelect={this.onTabSelect} className="mt-4">
                <Tab eventKey="uploads" title={`Uploads (${uploads.length})`}>
                  {uploads.length === 0 ? (
                    <p className="mt-3">No recoverable uploads found.</p>
                  ) : (
                    <div className="mt-3">
                      <BootstrapTable
                        bootstrap4
                        keyField="id"
                        data={uploads}
                        columns={uploadColumns}
                        selectRow={uploadSelectRow}
                        cellEdit={cellEditFactory({ mode: 'click', blurToSave: true, autoSelectText: true })}
                        bordered={false}
                      />
                      <Button
                        variant="primary"
                        disabled={importing || selectedUploadIds.length === 0}
                        onClick={this.handleImportUploads}>
                        {importing ? 'Importing...' : `Import ${selectedUploadIds.length} selected uploads`}
                      </Button>
                    </div>
                  )}
                  <hr />
                  <h5>Create placeholder track</h5>
                  <p className="text-muted">
                    For mixes whose original upload is gone. Mixes with a matching name are assigned to it
                    automatically.
                  </p>
                  <Form inline>
                    <Form.Control
                      className="mr-2 mb-2"
                      placeholder="Artist"
                      value={this.state.placeholderArtist}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        this.setState({ placeholderArtist: event.target.value })
                      }
                    />
                    <Form.Control
                      className="mr-2 mb-2"
                      placeholder="Title"
                      value={this.state.placeholderTitle}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        this.setState({ placeholderTitle: event.target.value })
                      }
                    />
                    <Button
                      variant="secondary"
                      className="mb-2"
                      disabled={importing || !this.state.placeholderTitle.trim()}
                      onClick={this.handleCreatePlaceholder}>
                      Create
                    </Button>
                  </Form>
                </Tab>
                <Tab eventKey="mixes" title={`Separated mixes (${mixes.length})`}>
                  {mixes.length === 0 ? (
                    <p className="mt-3">No recoverable mixes found.</p>
                  ) : (
                    <div className="mt-3">
                      <BootstrapTable
                        bootstrap4
                        keyField="id"
                        data={mixes}
                        columns={mixColumns}
                        selectRow={mixSelectRow}
                        bordered={false}
                      />
                      <Button
                        variant="primary"
                        disabled={importing || numImportableMixes === 0}
                        onClick={this.handleImportMixes}>
                        {importing ? 'Importing...' : `Import ${numImportableMixes} selected mixes`}
                      </Button>
                      {numImportableMixes < selectedMixIds.length && (
                        <span className="text-muted ml-3">
                          {selectedMixIds.length - numImportableMixes} selected without a source track will be skipped
                        </span>
                      )}
                    </div>
                  )}
                </Tab>
              </Tabs>
            </div>
          )}
        </Container>
      </div>
    );
  }
}

export default Recovery;
