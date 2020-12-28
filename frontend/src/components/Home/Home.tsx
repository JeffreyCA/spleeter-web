import axios from 'axios';
import * as React from 'react';
import { Alert } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { DynamicMix } from '../../models/DynamicMix';
import { SongData } from '../../models/SongData';
import { StaticMix } from '../../models/StaticMix';
import HomeNavBar from '../Nav/HomeNavBar';
import DeleteDynamicMixModal from '../SongTable/Modal/DeleteDynamicMixModal';
import DeleteStaticMixModal from '../SongTable/Modal/DeleteStaticMixModal';
import DeleteTrackModal from '../SongTable/Modal/DeleteTrackModal';
import DynamicMixModal from '../SongTable/Modal/DynamicMixModal';
import StaticMixModal from '../SongTable/Modal/StaticMixModal';
import SongTable from '../SongTable/SongTable';
import UploadModal from '../Upload/UploadModal';
import './Home.css';
import MusicPlayer from './MusicPlayer';

interface SeparationTask {
  srcId: string;
  id: string;
  status: string;
}

interface State {
  /**
   * Whether to show delete dynamic mix modal
   */
  showDeleteDynamicMixModal: boolean;
  /**
   * Whether to show delete static mix modal
   */
  showDeleteStaticMixModal: boolean;
  /**
   * Whether to show delete track modal
   */
  showDeleteTrackModal: boolean;
  /**
   * Whether to show mix modal
   */
  showDynamicMixModal: boolean;
  /**
   * Whether to show source separation modal
   */
  showStaticMixModal: boolean;
  /**
   * Whether to show upload modal
   */
  showUploadModal: boolean;
  /**
   * List of songs seen in the song table
   */
  songList: SongData[];
  /**
   * Reference to audio player instance
   */
  audioInstance?: HTMLAudioElement;
  /**
   * Current song, if it is a source song
   */
  currentSrcSong?: SongData;
  /**
   * Current song, if it is a static mix
   */
  currentStaticMix?: StaticMix;
  /**
   * Current source song displayed in modal
   */
  currentModalSrcSong?: SongData;
  /**
   * Current dynamic mix displayed in modal
   */
  currentModalDynamicMix?: DynamicMix;
  /**
   * Current static mix displayed in modal
   */
  currentModalStaticMix?: StaticMix;
  /**
   * Whether audio is playing
   */
  isPlaying: boolean;
  /**
   * The separation task that was just submitted
   */
  task?: SeparationTask;
  /**
   * List of IDs of expanded rows
   */
  expandedIds: string[];
}

/**
 * Home component where main functionality happens, consisting of the main nav bar
 * and the song table.
 */
class Home extends React.Component<RouteComponentProps, State> {
  refreshInterval?: number;
  taskInterval?: number;

  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      showDeleteDynamicMixModal: false,
      showDeleteStaticMixModal: false,
      showDeleteTrackModal: false,
      showDynamicMixModal: false,
      showStaticMixModal: false,
      showUploadModal: false,
      songList: [],
      audioInstance: undefined,
      currentSrcSong: undefined,
      currentStaticMix: undefined,
      currentModalSrcSong: undefined,
      currentModalDynamicMix: undefined,
      currentModalStaticMix: undefined,
      isPlaying: false,
      task: undefined,
      expandedIds: [],
    };
  }

  getAudioInstance = (instance: HTMLAudioElement): void => {
    this.setState({
      audioInstance: instance,
    });
  };

  onAudioPause = (): void => {
    this.setState({
      isPlaying: false,
    });
  };

  onAudioPlay = (): void => {
    this.setState({
      isPlaying: true,
    });
  };

  onSrcSongPauseClick = (): void => {
    this.setState({
      isPlaying: false,
    });
    if (this.state.audioInstance) {
      this.state.audioInstance.pause();
    }
  };

  onSrcSongPlayClick = (song: SongData): void => {
    if (this.state.currentSrcSong && this.state.currentSrcSong.url === song.url) {
      this.setState({
        isPlaying: true,
      });
      if (this.state.audioInstance) {
        this.state.audioInstance.play();
      }
    } else {
      this.setState({
        currentSrcSong: song,
        currentStaticMix: undefined,
        isPlaying: true,
      });
    }
  };

  onStaticMixPauseClick = (): void => {
    this.setState({
      isPlaying: false,
    });
    if (this.state.audioInstance) {
      this.state.audioInstance.pause();
    }
  };

  onStaticMixPlayClick = (staticMix: StaticMix): void => {
    if (this.state.currentStaticMix && this.state.currentStaticMix.url === staticMix.url) {
      this.setState({
        isPlaying: true,
      });
      if (this.state.audioInstance) {
        this.state.audioInstance.play();
      }
    } else {
      this.setState({
        currentSrcSong: undefined,
        currentStaticMix: staticMix,
        isPlaying: true,
      });
    }
  };

  onMixTaskSubmit = (id: string): void => {
    // Open Mixer page in new tab
    const win = window.open(`/mixer/${id}`, '_blank');
    win?.focus();
    this.loadData();
  };

  onStaticMixSubmit = (srcId: string, id: string, status: string): void => {
    this.setState({
      task: {
        srcId,
        id,
        status,
      },
      expandedIds: [...this.state.expandedIds, srcId],
    });
    this.loadData();
    // Set task state to null after 5 seconds
    this.taskInterval = setInterval(() => {
      this.setState({
        task: undefined,
      });
    }, 5000);
  };

  /**
   * Called when single table row is expanded
   */
  onExpandRow = (row: SongData, isExpand: boolean): void => {
    if (isExpand) {
      // Row is expanded, add the row ID to expanded row ID list
      this.setState({
        expandedIds: [...this.state.expandedIds, row.id],
      });
    } else {
      // Row is collapsed, remove current row ID from list
      this.setState({
        expandedIds: this.state.expandedIds.filter(s => s !== row.id),
      });
    }
  };

  /**
   * Called when the expand-all button is pressed
   */
  onExpandAll = (isExpandAll: boolean, results: SongData[]): void => {
    if (isExpandAll) {
      // Update expanded row ID list to contain every row
      this.setState({
        expandedIds: results.map((i: SongData) => i.id),
      });
    } else {
      // Clear expanded row ID list
      this.setState({
        expandedIds: [],
      });
    }
  };

  onDeleteDynamicMixClick = (mix: DynamicMix): void => {
    this.setState({ showDeleteDynamicMixModal: true, currentModalDynamicMix: mix });
  };

  onDeleteStaticMixClick = (mix: StaticMix): void => {
    this.setState({ showDeleteStaticMixModal: true, currentModalStaticMix: mix });
  };

  onDeleteTrackClick = (song: SongData): void => {
    this.setState({ showDeleteTrackModal: true, currentModalSrcSong: song });
  };

  onDynamicMixClick = (song: SongData): void => {
    this.setState({ showDynamicMixModal: true, currentModalSrcSong: song });
  };

  onStaticMixClick = (song: SongData): void => {
    this.setState({ showStaticMixModal: true, currentModalSrcSong: song });
  };

  onUploadClick = (): void => {
    this.setState({ showUploadModal: true });
  };

  handleDeleteDynamicMixModalHide = (): void => {
    this.setState({ showDeleteDynamicMixModal: false });
  };

  handleDeleteDynamicMixModalExited = (): void => {
    this.setState({ currentModalDynamicMix: undefined });
  };

  handleDeleteStaticMixModalHide = (): void => {
    this.setState({ showDeleteStaticMixModal: false });
  };

  handleDeleteStaticMixModalExited = (): void => {
    this.setState({ currentModalStaticMix: undefined });
  };

  handleDeleteTrackModalHide = (): void => {
    this.setState({ showDeleteTrackModal: false });
  };

  handleDeleteTrackModalExited = (): void => {
    this.setState({ currentModalSrcSong: undefined });
  };

  handleDynamicMixModalHide = (): void => {
    this.setState({ showDynamicMixModal: false });
  };

  handleDynamicMixModalExited = (): void => {
    this.setState({ currentModalSrcSong: undefined });
  };

  handleStaticMixModalHide = (): void => {
    this.setState({ showStaticMixModal: false });
  };

  handleStaticMixModalExited = (): void => {
    this.setState({ currentModalSrcSong: undefined });
  };

  handleUploadModalHide = (): void => {
    this.setState({ showUploadModal: false });
  };

  /**
   * Fetch song data from backend
   */
  loadData = async (): Promise<void> => {
    axios
      .get<SongData[]>('/api/source-track/')
      .then(({ data }) => {
        if (data) {
          this.setState({ songList: data });
        }
      })
      .catch(error => console.log('API errors:', error));
  };

  componentDidMount(): void {
    this.loadData();
    // Auto-refresh data every 5 seconds
    this.refreshInterval = setInterval(this.loadData, 5000);
  }

  componentWillUnmount(): void {
    clearInterval(this.refreshInterval);
    clearInterval(this.taskInterval);
  }

  render(): JSX.Element {
    const {
      songList,
      showDeleteDynamicMixModal,
      showDeleteStaticMixModal,
      showDeleteTrackModal,
      showStaticMixModal,
      showDynamicMixModal,
      showUploadModal,
      currentSrcSong,
      currentStaticMix,
      currentModalSrcSong,
      currentModalDynamicMix,
      currentModalStaticMix,
      isPlaying,
      task,
      expandedIds,
    } = this.state;
    const currentSongUrl = currentSrcSong ? currentSrcSong.url : currentStaticMix ? currentStaticMix.url : undefined;

    return (
      <div>
        <HomeNavBar onUploadClick={this.onUploadClick} />
        <div className="jumbotron jumbotron-fluid bg-transparent">
          <div className="container secondary-color">
            <h2 className="display-5">Track List</h2>
            <p className="lead">Get started by uploading a song or creating a new mix.</p>
            <Alert variant="info" style={{ fontSize: '0.9em' }}>
              <p className="mb-0">
                <b>Static mix </b>only keeps the selected parts and completely discards the other parts. No individual
                volume controls.
                <br />
                <b>Dynamic mix</b> gives you a playback interface with controls to individually adjust the volume levels
                of all the parts.
              </p>
            </Alert>
            {task && (
              <Alert variant="success">
                <span>
                  <a target="_blank" rel="noreferrer" href={`/api/mix/static/${task.id}`}>
                    {task.id}
                  </a>
                  : {task.status}
                </span>
              </Alert>
            )}
            <SongTable
              data={songList}
              currentSongUrl={currentSongUrl}
              isPlaying={isPlaying}
              expandedIds={expandedIds}
              onExpandRow={this.onExpandRow}
              onExpandAll={this.onExpandAll}
              onDeleteDynamicMixClick={this.onDeleteDynamicMixClick}
              onDeleteStaticMixClick={this.onDeleteStaticMixClick}
              onDeleteTrackClick={this.onDeleteTrackClick}
              onDynamicMixClick={this.onDynamicMixClick}
              onStaticMixClick={this.onStaticMixClick}
              onStaticMixPauseClick={this.onStaticMixPauseClick}
              onStaticMixPlayClick={this.onStaticMixPlayClick}
              onSrcSongPauseClick={this.onSrcSongPauseClick}
              onSrcSongPlayClick={this.onSrcSongPlayClick}
            />
          </div>
        </div>
        <MusicPlayer
          getAudioInstance={this.getAudioInstance}
          songData={currentSrcSong}
          staticMix={currentStaticMix}
          onAudioPause={this.onAudioPause}
          onAudioPlay={this.onAudioPlay}
        />
        <UploadModal show={showUploadModal} hide={this.handleUploadModalHide} refresh={this.loadData} />
        <DynamicMixModal
          show={showDynamicMixModal}
          hide={this.handleDynamicMixModalHide}
          exit={this.handleDynamicMixModalExited}
          submit={this.onMixTaskSubmit}
          refresh={this.loadData}
          song={currentModalSrcSong}
        />
        <StaticMixModal
          show={showStaticMixModal}
          hide={this.handleStaticMixModalHide}
          exit={this.handleStaticMixModalExited}
          submit={this.onStaticMixSubmit}
          refresh={this.loadData}
          song={currentModalSrcSong}
        />
        <DeleteDynamicMixModal
          show={showDeleteDynamicMixModal}
          hide={this.handleDeleteDynamicMixModalHide}
          exit={this.handleDeleteDynamicMixModalExited}
          refresh={this.loadData}
          mix={currentModalDynamicMix}
        />
        <DeleteStaticMixModal
          show={showDeleteStaticMixModal}
          hide={this.handleDeleteStaticMixModalHide}
          exit={this.handleDeleteStaticMixModalExited}
          refresh={this.loadData}
          mix={currentModalStaticMix}
        />
        <DeleteTrackModal
          show={showDeleteTrackModal}
          hide={this.handleDeleteTrackModalHide}
          exit={this.handleDeleteTrackModalExited}
          refresh={this.loadData}
          song={currentModalSrcSong}
        />
      </div>
    );
  }
}

export default Home;
