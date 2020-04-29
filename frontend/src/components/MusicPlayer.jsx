import React, { Component } from 'react'
import ReactJkMusicPlayer from '@jeffreyca/react-jinke-music-player';
import '@jeffreyca/react-jinke-music-player/assets/index.css';
import './MusicPlayer.css'

class MusicPlayer extends Component {
  render() {
    const { getAudioInstance, song, onAudioPause, onAudioPlay } = this.props
    if (!song) {
      return null
    }

    const audioList = [{
      name: song.title,
      singer: song.artist,
      musicSrc: song.url
    }]

    return (
      <ReactJkMusicPlayer
        audioLists={audioList}
        getAudioInstance={getAudioInstance}
        theme="light"
        mode="full"                     // Show player at bottom of page
        clearPriorAudioLists={true}     // Never keep old audio list 
        autoPlayInitLoadPlayList={true} // Autoplay after updating audio list
        toggleMode={false}              // Disable minimizing audio player bar
        remove={false}                  // Disable removing tracks from playlist
        drag={false}
        preload={true}
        autoHiddenCover={true}
        showDownload={false} showPlayMode={false} showReload={false} showThemeSwitch={false} showLyric={false}
        onAudioPause={onAudioPause} onAudioPlay={onAudioPlay} 
        onAudioListsChange={this.onAudioListsChange}
        locale={{ playListsText: 'Now Playing' }} />
    );
  }
}

export default MusicPlayer;
