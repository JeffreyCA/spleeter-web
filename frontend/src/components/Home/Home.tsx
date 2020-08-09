import axios from 'axios';
import * as React from 'react';
import { Alert } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { SongData } from '../../models/SongData';
import { StaticMix } from '../../models/StaticMix';
import HomeNavBar from '../Nav/HomeNavBar';
import DeleteModal from '../SongTable/DeleteModal';
import DynamicMixModal from '../SongTable/DynamicMixModal';
import SongTable from '../SongTable/SongTable';
import StaticMixModal from '../SongTable/StaticMixModal';
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
   * Whether to show delete track modal
   */
  showDeleteModal: boolean;
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
   * Current song displayed in modal
   */
  currentModalSong?: SongData;
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
      showDeleteModal: false,
      showDynamicMixModal: false,
      showStaticMixModal: false,
      showUploadModal: false,
      songList: [],
      audioInstance: undefined,
      currentSrcSong: undefined,
      currentStaticMix: undefined,
      currentModalSong: undefined,
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
    setTimeout(() => {
      this.props.history.push(`/mixer/${id}`);
    }, 500);
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

  onDeleteClick = (song: SongData): void => {
    this.setState({ showDeleteModal: true, currentModalSong: song });
  };

  onDynamicMixClick = (song: SongData): void => {
    if (song.dynamic && song.dynamic.status !== 'Error') {
      setTimeout(() => {
        this.props.history.push(`/mixer/${song.dynamic?.id}`);
      }, 500);
    } else {
      this.setState({ showDynamicMixModal: true, currentModalSong: song });
    }
  };

  onStaticMixClick = (song: SongData): void => {
    this.setState({ showStaticMixModal: true, currentModalSong: song });
  };

  onUploadClick = (): void => {
    this.setState({ showUploadModal: true });
  };

  handleDeleteModalHide = (): void => {
    this.setState({ showDeleteModal: false });
  };

  handleDeleteModalExited = (): void => {
    this.setState({ currentModalSong: undefined });
  };

  handleDynamicMixModalHide = (): void => {
    this.setState({ showDynamicMixModal: false });
  };

  handleDynamicMixModalExited = (): void => {
    this.setState({ currentModalSong: undefined });
  };

  handleStaticMixModalHide = (): void => {
    this.setState({ showStaticMixModal: false });
  };

  handleStaticMixModalExited = (): void => {
    this.setState({ currentModalSong: undefined });
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
    // Auto-refresh data every 15 seconds
    this.refreshInterval = setInterval(this.loadData, 15000);
  }

  componentWillUnmount(): void {
    clearInterval(this.refreshInterval);
    clearInterval(this.taskInterval);
  }

  render(): JSX.Element {
    const {
      songList,
      showDeleteModal,
      showStaticMixModal,
      showDynamicMixModal,
      showUploadModal,
      currentSrcSong,
      currentStaticMix,
      currentModalSong,
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
            <h2 className="display-5">Song List</h2>
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
              onDeleteClick={this.onDeleteClick}
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
          submit={this.onMixTaskSubmit}
          exit={this.handleDynamicMixModalExited}
          refresh={this.loadData}
          song={currentModalSong}
        />
        <StaticMixModal
          show={showStaticMixModal}
          hide={this.handleStaticMixModalHide}
          exit={this.handleStaticMixModalExited}
          submit={this.onStaticMixSubmit}
          refresh={this.loadData}
          song={currentModalSong}
        />
        <DeleteModal
          show={showDeleteModal}
          hide={this.handleDeleteModalHide}
          exit={this.handleDeleteModalExited}
          refresh={this.loadData}
          song={currentModalSong}
        />
      </div>
    );
  }
}

export default Home;
