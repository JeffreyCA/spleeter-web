import React, { Component } from 'react'
import ReactJkMusicPlayer from 'react-jinke-music-player-no-mobile';
import 'react-jinke-music-player-no-mobile/assets/index.css';
import './MusicPlayer.css'

class MusicPlayer extends Component {
  render() {
    const { song, onAudioPause, onAudioPlay } = this.props
    // TODO: Convert song to audiolist format
    const audioList = []
    return (
      <ReactJkMusicPlayer
        audioLists={audioList}
        mode="full"
        toggleMode={false}
        drag={false}
        remove={false}
        theme="light"
        autoHiddenCover={true}
        showDownload={false} showPlayMode={false} showReload={false} showThemeSwitch={false} showLyric={false}
        onAudioPause={onAudioPause} onAudioPlay={onAudioPlay} />
    );
  }
}

export default MusicPlayer;
