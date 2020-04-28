import React, { Component } from 'react';
import UploadModal from './Upload/UploadModal'
import SpleetModal from './Table/SpleetModal'
import SongTable from './Table/SongTable'
import MyNavBar from './MyNavBar'
import axios from 'axios'
import { Alert } from 'react-bootstrap';
import MusicPlayer from './MusicPlayer'

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSpleetModal: false,
      showUploadModal: false,
      songList: [],
      audioInstance: null,
      currentSong: null,
      currentModalSong: null,
      isPlaying: false,
      task: null
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

  onSongPauseButtonClick = (song) => {
    this.setState({
      isPlaying: false
    })
    if (this.state.audioInstance) {
      this.state.audioInstance.pause()
    }
  }

  onSongPlayButtonClick = (song) => {
    if (this.state.currentSong === song) {
      this.setState({
        isPlaying: true
      })
      if (this.state.audioInstance) {
        this.state.audioInstance.play()
      }
    } else {
      this.setState({
        currentSong: song,
        isPlaying: true
      })
    }
  }

  onSpleetTaskSubmit = (id, status) => {
    this.setState({ task: {id: id, status: status} });
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

  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    axios.get('/api/source-song/')
    .then(({ data }) => {
      if (data) {
        this.setState({ songList: data })
      }
    })
    .catch(error => console.log('API errors:', error))
  }

  render() {
    const { songList, showSpleetModal, showUploadModal, currentSong, currentModalSong, isPlaying, task } = this.state;
    return (
      <div>
        <MyNavBar onUploadClick={this.onUploadClick} />
        <div className="jumbotron jumbotron-fluid bg-transparent">
          <div className="container secondary-color">
            <h1 className="display-4">Spleeter Web</h1>
            <p className="lead">
              Source separation on the go.
            </p>
            <hr className="my-4" />
            {task && (<Alert variant="success">
              <span><a href={`/api/separate/${task.id}`}>{task.id}</a>: {task.status}</span>
            </Alert>)}
            <SongTable data={songList}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPauseButtonClick={this.onSongPauseButtonClick}
              onPlayButtonClick={this.onSongPlayButtonClick}
              onSpleetClick={this.onSpleetClick} />
          </div>
        </div>
        <MusicPlayer getAudioInstance={this.getAudioInstance} song={currentSong} onAudioPause={this.onAudioPause} onAudioPlay={this.onAudioPlay} />
        <UploadModal show={showUploadModal} hide={this.handleUploadModalHide} refresh={this.loadData} />
        <SpleetModal show={showSpleetModal} hide={this.handleSpleetModalHide} exit={this.handleSpleetModalExited} submit={this.onSpleetTaskSubmit} refresh={this.loadData} song={currentModalSong} />
      </div>
    );
  }
}

export default Home;
