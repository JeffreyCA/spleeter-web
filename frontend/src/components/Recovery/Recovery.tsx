import axios from 'axios';
import * as React from 'react';
import { Alert, Badge, Button, Container, Form, ListGroup, Modal, Spinner, Tab, Tabs } from 'react-bootstrap';
import { Clipboard, ClipboardCheck, PauseFill, Pencil, PlayFill } from 'react-bootstrap-icons';
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
  // Mix whose source track is being chosen in the picker modal, if any
  pickerMixId?: string;
  pickerFilter: string;
  // Path most recently copied from the picker, briefly shown with a checkmark
  copiedPath?: string;
}

/**
 * Hidden maintenance page (not linked from the UI) that scans the media directory for
 * uploads and mixes missing from the database and re-imports them on a best-effort basis.
 * Used to recover from database loss when the media files survived.
 */
class Recovery extends React.Component<Record<string, never>, State> {
  audio: HTMLAudioElement;
  pickerSearchRef = React.createRef<HTMLInputElement>();
  copyResetTimer?: number;

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
      pickerMixId: undefined,
      pickerFilter: '',
      copiedPath: undefined,
    };
  }

  componentDidMount(): void {
    this.loadScan();
  }

  componentWillUnmount(): void {
    this.audio.pause();
    window.clearTimeout(this.copyResetTimer);
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

  openPicker = (mixId: string): void => {
    this.setState({ pickerMixId: mixId, pickerFilter: '' });
  };

  closePicker = (): void => {
    this.setState({ pickerMixId: undefined });
  };

  pickTrack = (value: string): void => {
    if (this.state.pickerMixId) {
      this.onTrackChoiceChange(this.state.pickerMixId, value);
    }
    this.closePicker();
  };

  focusPickerSearch = (): void => {
    this.pickerSearchRef.current?.focus();
  };

  // navigator.clipboard needs a secure context, and this page may well be
  // served over plain http
  copyViaTextarea = (path: string): void => {
    const textarea = document.createElement('textarea');
    textarea.value = path;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  copyPath = (path: string, event: React.MouseEvent): void => {
    // The copy icon sits inside the clickable list entry; don't pick the track
    event.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(path).catch(() => this.copyViaTextarea(path));
    } else {
      this.copyViaTextarea(path);
    }
    this.setState({ copiedPath: path });
    window.clearTimeout(this.copyResetTimer);
    this.copyResetTimer = window.setTimeout(() => this.setState({ copiedPath: undefined }), 1500);
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

  trackChoiceOptions = (): Array<{ value: string; label: string; path: string }> => {
    const { existingTracks } = this.state;
    const trackName = (track: RecoveryTrackRef) => `${track.artist ? `${track.artist} - ` : ''}${track.title}`;
    const countBy = (values: string[]) => {
      const counts: { [value: string]: number } = {};
      values.forEach(value => (counts[value] = (counts[value] ?? 0) + 1));
      return counts;
    };

    // The file path shown with every entry is what tells tracks with the same
    // name apart. The same file can also be uploaded twice, so entries whose
    // name and path both collide get part of the track ID appended.
    const identityCounts = countBy(existingTracks.map(track => `${trackName(track)} ${track.path}`));
    // Sorted, because this list can run to hundreds of entries and is
    // otherwise in database insertion order
    return existingTracks
      .map(track => {
        const name = trackName(track);
        return {
          value: `track:${track.id}`,
          label: identityCounts[`${name} ${track.path}`] > 1 ? `${name}  #${track.id.slice(0, 8)}` : name,
          path: track.path,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label) || a.path.localeCompare(b.path));
  };

  // One shared modal serves every row's source track picker: it filters as the
  // user types, which beats scrolling a native dropdown of hundreds of tracks,
  // and it avoids rendering the full track list once per table row
  renderTrackPicker = (trackOptions: Array<{ value: string; label: string; path: string }>): JSX.Element => {
    const { pickerMixId, pickerFilter, mixes } = this.state;
    const mix = mixes.find(mix => mix.id === pickerMixId);
    const tokens = pickerFilter.toLowerCase().split(/\s+/).filter(Boolean);
    const visibleOptions = trackOptions.filter(option =>
      tokens.every(token => `${option.label} ${option.path}`.toLowerCase().includes(token))
    );
    return (
      <Modal show={!!mix} onHide={this.closePicker} onEntered={this.focusPickerSearch}>
        <Modal.Header closeButton>
          <Modal.Title as="h6">Source track for: {mix?.prefix}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            ref={this.pickerSearchRef}
            placeholder="Search by name or file..."
            value={pickerFilter}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              this.setState({ pickerFilter: event.target.value })
            }
            onKeyDown={(event: React.KeyboardEvent) => {
              if (event.key === 'Enter' && visibleOptions.length === 1) {
                this.pickTrack(visibleOptions[0].value);
              }
            }}
          />
          {visibleOptions.length === 0 ? (
            <p className="text-muted mt-3 mb-0">No tracks match.</p>
          ) : (
            <ListGroup className="recovery-track-list mt-3">
              {visibleOptions.map(option => (
                <ListGroup.Item
                  action
                  key={option.value}
                  active={mix?.track === option.value}
                  onClick={() => this.pickTrack(option.value)}>
                  {option.label}
                  <small className="recovery-track-path d-block">
                    {option.path || 'no file'}
                    {option.path && (
                      <span
                        className="recovery-copy ml-1"
                        title="Copy file path"
                        onClick={event => this.copyPath(option.path, event)}>
                        {this.state.copiedPath === option.path ? <ClipboardCheck size={12} /> : <Clipboard size={12} />}
                      </span>
                    )}
                  </small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <span className="text-muted small">
            {visibleOptions.length} of {trackOptions.length} tracks
          </span>
          <Button variant="outline-danger" size="sm" disabled={!mix?.track} onClick={() => this.pickTrack('')}>
            Clear selection
          </Button>
        </Modal.Footer>
      </Modal>
    );
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
    const trackOptionByValue: { [value: string]: { label: string; path: string } } = {};
    trackOptions.forEach(option => (trackOptionByValue[option.value] = option));

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

    // These always describe the mix file itself, never the selected source track.
    // They are what identifies the row, and what makes a wrong assignment visible
    // when compared against the Source track column.
    const mixMetadataFormatter = (cell: string) => <span title="Read from the mix file name">{cell}</span>;

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
        text: 'Mix artist',
        formatter: mixMetadataFormatter,
      },
      {
        dataField: 'title',
        editable: false,
        text: 'Mix title',
        formatter: mixMetadataFormatter,
      },
      {
        dataField: 'track',
        editable: false,
        text: 'Source track',
        formatter: (cell: string, row: RecoveryMix) => (
          <Button
            variant={cell ? 'outline-secondary' : 'outline-primary'}
            size="sm"
            className="recovery-track-choice"
            title={cell ? trackOptionByValue[cell]?.path : undefined}
            onClick={() => this.openPicker(row.id)}>
            {cell ? trackOptionByValue[cell]?.label ?? cell : 'Select a track...'}
          </Button>
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
            If the database was lost or reset, this page rebuilds its entries from the audio files still in the media
            directory.
          </p>
          <p className="text-muted">
            Import uploads first, then mixes (a mix can only be assigned to a track that already exists). If a
            mix&apos;s upload is gone, add a placeholder track for it in the Uploads tab. Click any underlined field to
            correct it before importing, or edit it later on the main page.
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
              {this.renderTrackPicker(trackOptions)}
            </div>
          )}
        </Container>
      </div>
    );
  }
}

export default Recovery;
