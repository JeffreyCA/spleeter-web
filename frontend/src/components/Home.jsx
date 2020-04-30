import React, { Component } from 'react';
import axios from 'axios'
import { Alert } from 'react-bootstrap';
import MusicPlayer from './MusicPlayer'
import MyNavBar from './MyNavBar'
import SongTable from './Table/SongTable'
import SpleetModal from './Table/SpleetModal'
import UploadModal from './Upload/UploadModal'

/**
 * Home component where main functionality happens, consisting of the main nav bar
 * and the song table.
 */
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSpleetModal: false, // Whether to show source separation modal
      showUploadModal: false, // Whether to show upload modal
      songList: [],           // List of songs seen in the song table
      audioInstance: null,    // Reference audio player instance
      currentSrcSong: null,   // Current song, if it is a source song
      currentSepSong: null,   // Current song, if it is a separated song
      currentModalSong: null, // Current song displayed in the separation modal
      isPlaying: false,       // Whether audio is playing
      task: null,             // The separation task that was just submitted
      expandedIds: []         // List of IDs of expanded rows
    }
  }

  getAudioInstance = (instance) => {
    this.setState({
      audioInstance: instance
    })
  }

  onAudioPause = (audioInfo) => {
    this.setState({
      isPlaying: false
    })
  }

  onAudioPlay = (audioInfo) => {
    this.setState({
      isPlaying: true
    })
  }

  onSrcSongPauseClick = (song) => {
    this.setState({
      isPlaying: false
    })
    if (this.state.audioInstance) {
      this.state.audioInstance.pause()
    }
  }

  onSrcSongPlayClick = (song) => {
    if (this.state.currentSrcSong && this.state.currentSrcSong.url === song.url) {
      this.setState({
        isPlaying: true
      })
      if (this.state.audioInstance) {
        this.state.audioInstance.play()
      }
    } else {
      this.setState({
        currentSrcSong: song,
        currentSepSong: null,
        isPlaying: true
      })
    }
  }

  onSepSongPauseClick = (song) => {
    this.setState({
      isPlaying: false
    })
    if (this.state.audioInstance) {
      this.state.audioInstance.pause()
    }
  }

  onSepSongPlayClick = (song) => {
    if (this.state.currentSepSong && this.state.currentSepSong.url === song.url) {
      this.setState({
        isPlaying: true
      })
      if (this.state.audioInstance) {
        this.state.audioInstance.play()
      }
    } else {
      this.setState({
        currentSrcSong: null,
        currentSepSong: song,
        isPlaying: true
      })
    }
  }

  onSpleetTaskSubmit = (src_id, id, status) => {
    this.setState({ 
      task: {
        src_id: src_id,
        id: id,
        status: status
      },
      expandedIds: [...this.state.expandedIds, src_id]
    })
    this.loadData()
    // Set task state to null after 3 seconds
    setInterval(() => {
      this.setState({ 
        task: null
      })
    }, 3000)
  }

  /**
   * Called when single table row is expanded
   */
  onExpandRow = (row, isExpand) => {
    if (isExpand) {
      // Row is expanded, add the row ID to expanded row ID list
      this.setState({
        expandedIds: [...this.state.expandedIds, row.id]
      })
    } else {
      // Row is collapsed, remove current row ID from list
      this.setState({
        expandedIds: this.state.expandedIds.filter(s => s !== row.id)
      })
    }
  }

  /**
   * Called when the expand-all button is pressed
   */
  onExpandAll = (isExpandAll, results) => {
    if (isExpandAll) {
      // Update expanded row ID list to contain every row
      this.setState({
        expandedIds: results.map(i => i.id)
      })
    } else {
      // Clear expanded row ID list
      this.setState({
        expandedIds: []
      })
    }
  }

  onSpleetClick = (song) => {
    this.setState({ showSpleetModal: true, currentModalSong: song });
  }

  onUploadClick = () => {
    this.setState({ showUploadModal: true });
  }

  handleSpleetModalHide = () => {
    this.setState({ showSpleetModal: false });
  }

  handleSpleetModalExited = () => {
    this.setState({ currentModalSong: null });
  }

  handleUploadModalHide = () => {
    this.setState({ showUploadModal: false });
  }

  /**
   * Fetch song data from backend
   */
  loadData = async () => {
    axios.get('/api/source-song/')
    .then(({ data }) => {
      if (data) {
        this.setState({ songList: data })
      }
    })
    .catch(error => console.log('API errors:', error))
  }

  componentDidMount() {
    this.loadData()
    // Auto-refresh data every 10 seconds
    setInterval(this.loadData, 10000)
  }

  render() {
    const {
      songList,
      showSpleetModal,
      showUploadModal,
      currentSrcSong,
      currentSepSong,
      currentModalSong,
      isPlaying,
      task,
      expandedIds
    } = this.state;
    const currentSong = currentSrcSong ? currentSrcSong : (currentSepSong ? currentSepSong : null)
    const currentSongUrl = currentSrcSong ? currentSrcSong.url : (currentSepSong ? currentSepSong.url : null)

    return (
      <div>
        <MyNavBar onUploadClick={this.onUploadClick} />
        <div className="jumbotron jumbotron-fluid bg-transparent">
          <div className="container secondary-color">
            <h1 className="display-4">Spleeter Web</h1>
            <p className="lead">
              Source separation on the go.
            </p>
            {task && (<Alert variant="success">
              <span><a href={`/api/separate/${task.id}`}>{task.id}</a>: {task.status}</span>
            </Alert>)}
            <SongTable data={songList}
              currentSongUrl={currentSongUrl}
              isPlaying={isPlaying}
              expandedIds={expandedIds}
              onExpandRow={this.onExpandRow}
              onExpandAll={this.onExpandAll}
              onSpleetClick={this.onSpleetClick}
              onSepSongPauseClick={this.onSepSongPauseClick}
              onSepSongPlayClick={this.onSepSongPlayClick}
              onSrcSongPauseClick={this.onSrcSongPauseClick}
              onSrcSongPlayClick={this.onSrcSongPlayClick} />
          </div>
        </div>
        <MusicPlayer getAudioInstance={this.getAudioInstance} isSource={currentSrcSong} song={currentSong} onAudioPause={this.onAudioPause} onAudioPlay={this.onAudioPlay} />
        <UploadModal show={showUploadModal} hide={this.handleUploadModalHide} refresh={this.loadData} />
        <SpleetModal show={showSpleetModal} hide={this.handleSpleetModalHide} exit={this.handleSpleetModalExited} submit={this.onSpleetTaskSubmit} refresh={this.loadData} song={currentModalSong} />
      </div>
    );
  }
}

export default Home;
