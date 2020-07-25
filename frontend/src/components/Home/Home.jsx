import React, { Component } from 'react'
import axios from 'axios'
import { Alert } from 'react-bootstrap'
import MusicPlayer from './MusicPlayer'
import HomeNavBar from '../Nav/HomeNavBar'
import SongTable from '../SongTable/SongTable'
import DeleteModal from '../SongTable/DeleteModal'
import DynamicMixModal from '../SongTable/DynamicMixModal'
import StaticMixModal from '../SongTable/StaticMixModal'
import UploadModal from '../Upload/UploadModal'
import './Home.css'

/**
 * Home component where main functionality happens, consisting of the main nav bar
 * and the song table.
 */
class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showDeleteModal: false, // Whether to show delete track modal
      showDynamicMixModal: false, // Whether to show mix modal
      showStaticMixModal: false, // Whether to show source separation modal
      showUploadModal: false, // Whether to show upload modal
      songList: [], // List of songs seen in the song table
      audioInstance: null, // Reference audio player instance
      currentSrcSong: null, // Current song, if it is a source song
      currentStaticMix: null, // Current song, if it is a static mixed song
      currentModalSong: null, // Current song displayed in the separation modal
      isPlaying: false, // Whether audio is playing
      task: null, // The separation task that was just submitted
      expandedIds: [] // List of IDs of expanded rows
    }
  }

  getAudioInstance = instance => {
    this.setState({
      audioInstance: instance
    })
  }

  onAudioPause = audioInfo => {
    this.setState({
      isPlaying: false
    })
  }

  onAudioPlay = audioInfo => {
    this.setState({
      isPlaying: true
    })
  }

  onSrcSongPauseClick = song => {
    this.setState({
      isPlaying: false
    })
    if (this.state.audioInstance) {
      this.state.audioInstance.pause()
    }
  }

  onSrcSongPlayClick = song => {
    if (
      this.state.currentSrcSong &&
      this.state.currentSrcSong.url === song.url
    ) {
      this.setState({
        isPlaying: true
      })
      if (this.state.audioInstance) {
        this.state.audioInstance.play()
      }
    } else {
      this.setState({
        currentSrcSong: song,
        currentStaticMix: null,
        isPlaying: true
      })
    }
  }

  onStaticMixPauseClick = song => {
    this.setState({
      isPlaying: false
    })
    if (this.state.audioInstance) {
      this.state.audioInstance.pause()
    }
  }

  onStaticMixPlayClick = song => {
    if (
      this.state.currentStaticMix &&
      this.state.currentStaticMix.url === song.url
    ) {
      this.setState({
        isPlaying: true
      })
      if (this.state.audioInstance) {
        this.state.audioInstance.play()
      }
    } else {
      this.setState({
        currentSrcSong: null,
        currentStaticMix: song,
        isPlaying: true
      })
    }
  }

  onMixTaskSubmit = id => {
    setTimeout(() => {
      this.props.history.push(`/mixer/${id}`)
    }, 500)
  }

  onStaticMixSubmit = (src_id, id, status) => {
    this.setState({
      task: {
        src_id: src_id,
        id: id,
        status: status
      },
      expandedIds: [...this.state.expandedIds, src_id]
    })
    this.loadData()
    // Set task state to null after 5 seconds
    setInterval(() => {
      this.setState({
        task: null
      })
    }, 5000)
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

  onDeleteClick = song => {
    this.setState({ showDeleteModal: true, currentModalSong: song })
  }

  onDynamicMixClick = song => {
    if (song.dynamic && song.dynamic.status !== 'Error') {
      setTimeout(() => {
        this.props.history.push(`/mixer/${song.dynamic.id}`)
      }, 500)
    } else {
      this.setState({ showDynamicMixModal: true, currentModalSong: song })
    }
  }

  onStaticMixClick = song => {
    this.setState({ showStaticMixModal: true, currentModalSong: song })
  }

  onUploadClick = () => {
    this.setState({ showUploadModal: true })
  }

  handleDeleteModalHide = () => {
    this.setState({ showDeleteModal: false })
  }

  handleDeleteModalExited = () => {
    this.setState({ currentModalSong: null })
  }

  handleDynamicMixModalHide = () => {
    this.setState({ showDynamicMixModal: false })
  }

  handleDynamicMixModalExited = () => {
    this.setState({ currentModalSong: null })
  }

  handleStaticMixModalHide = () => {
    this.setState({ showStaticMixModal: false })
  }

  handleStaticMixModalExited = () => {
    this.setState({ currentModalSong: null })
  }

  handleUploadModalHide = () => {
    this.setState({ showUploadModal: false })
  }

  /**
   * Fetch song data from backend
   */
  loadData = async () => {
    axios
      .get('/api/source-track/')
      .then(({ data }) => {
        if (data) {
          this.setState({ songList: data })
        }
      })
      .catch(error => console.log('API errors:', error))
  }

  componentDidMount() {
    this.loadData()
    // Auto-refresh data every 15 seconds
    this.interval = setInterval(this.loadData, 15000)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
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
      expandedIds
    } = this.state
    const currentSong = currentSrcSong
      ? currentSrcSong
      : currentStaticMix
      ? currentStaticMix
      : null
    const currentSongUrl = currentSrcSong
      ? currentSrcSong.url
      : currentStaticMix
      ? currentStaticMix.url
      : null

    return (
      <div>
        <HomeNavBar onUploadClick={this.onUploadClick} />
        <div className="jumbotron jumbotron-fluid bg-transparent">
          <div className="container secondary-color">
            <h2 className="display-5">Song List</h2>
            <p className="lead">
              Get started by uploading a song or separating an existing song.
            </p>
            <Alert variant="info" style={{ fontSize: '0.9em' }}>
              <p className="mb-0">
                <b>Static mix </b>only keeps the selected parts and completely
                discards the other parts. No individual volume controls.
                <br />
                <b>Dynamic mix</b> gives you a playback interface with controls
                to individually adjust the volume levels of all the parts.
              </p>
            </Alert>
            {task && (
              <Alert variant="success">
                <span>
                  <a target="_blank" href={`/api/mix/static/${task.id}`}>
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
          isSource={currentSrcSong}
          song={currentSong}
          onAudioPause={this.onAudioPause}
          onAudioPlay={this.onAudioPlay}
        />
        <UploadModal
          show={showUploadModal}
          hide={this.handleUploadModalHide}
          refresh={this.loadData}
        />
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
    )
  }
}

export default Home
