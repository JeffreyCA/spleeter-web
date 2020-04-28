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
      currentSong: null,
      isPlaying: false,
      task: null
    }
  }

  onAudioPlay = (song) => {
    console.log('Playing: ' + song.title)
    this.setState({
      currentSong: song,
      isPlaying: true
    })
  }

  onAudioPause = (song) => {
    console.log('Paused: ' + song.title)
    this.setState({
      isPlaying: false
    })
  }

  onSpleetTaskSubmit = (id, status) => {
    this.setState({ task: {id: id, status: status} });
  }

  onSpleetClick = (song) => {
    this.setState({ showSpleetModal: true, currentSong: song });
  }

  onUploadClick = () => {
    this.setState({ showUploadModal: true });
  }

  handleSpleetModalHide = () => {
    this.setState({ showSpleetModal: false });
  }

  handleSpleetModalExited = () => {
    this.setState({ currentSong: null });
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
    const { songList, showSpleetModal, showUploadModal, currentSong, isPlaying, task } = this.state;
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
              onAudioPause={this.onAudioPause}
              onAudioPlay={this.onAudioPlay}
              onSpleetClick={this.onSpleetClick} />
          </div>
        </div>
        <MusicPlayer song={currentSong} onAudioPause={this.onAudioPause} onAudioPlay={this.onAudioPlay} />
        <UploadModal show={showUploadModal} hide={this.handleUploadModalHide} refresh={this.loadData} />
        <SpleetModal show={showSpleetModal} hide={this.handleSpleetModalHide} exit={this.handleSpleetModalExited} submit={this.onSpleetTaskSubmit} refresh={this.loadData} song={currentSong} />
      </div>
    );
  }
}

export default Home;
