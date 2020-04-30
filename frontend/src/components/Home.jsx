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
      currentSrcSong: null,
      currentSepSong: null,
      currentModalSong: null,
      isPlaying: false,
      task: null,
      expandedIds: []
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
    setInterval(() => {
      this.setState({ 
        task: null
      })
    }, 3000)
  }

  // Manually handle which rows are expanded
  onExpandRow = (row, isExpand) => {
    if (isExpand) {
      this.setState({
        expandedIds: [...this.state.expandedIds, row.id]
      })
    } else {
      this.setState({
        expandedIds: this.state.expandedIds.filter(s => s !== row.id)
      })
    }
  }

  onExpandAll = (isExpandAll, results) => {
    if (isExpandAll) {
      this.setState({
        expandedIds: results.map(i => i.id)
      })
    } else {
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

  componentDidMount() {
    this.loadData()
    setInterval(this.loadData, 10000)
  }

  loadData = async () => {
    console.log('loading data')
    console.log(this.state.expandedIds)
    axios.get('/api/source-song/')
    .then(({ data }) => {
      if (data) {
        this.setState({ songList: data })
      }
    })
    .catch(error => console.log('API errors:', error))
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
    const songType = currentSrcSong ? 'src' : (currentSepSong ? 'sep' : null)

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
        <MusicPlayer getAudioInstance={this.getAudioInstance} songType={songType} song={currentSong} onAudioPause={this.onAudioPause} onAudioPlay={this.onAudioPlay} />
        <UploadModal show={showUploadModal} hide={this.handleUploadModalHide} refresh={this.loadData} />
        <SpleetModal show={showSpleetModal} hide={this.handleSpleetModalHide} exit={this.handleSpleetModalExited} submit={this.onSpleetTaskSubmit} refresh={this.loadData} song={currentModalSong} />
      </div>
    );
  }
}

export default Home;
