import React, { Component } from 'react'
import { Badge } from 'react-bootstrap'
import ReactJkMusicPlayer from '@jeffreyca/react-jinke-music-player';
import '@jeffreyca/react-jinke-music-player/assets/index.css';
import './MusicPlayer.css'

/**
 * Music player component that controls audio playback. It shows up as a horizontal bar at the
 * bottom of the screen.
 */
class MusicPlayer extends Component {
  render() {
    const { getAudioInstance, isSource, song, onAudioPause, onAudioPlay } = this.props
    if (!song) {
      return null
    }

    // Show a colour-coded badge indicating the components that are included
    var audioTitleExtra
    if (isSource) {
      audioTitleExtra = <Badge className="ml-2 mr-2" pill variant="primary">Original</Badge>
    } else {
      const vocalBadge = song.vocals ? <Badge pill variant="vocals">Vocals</Badge> : null
      const accompBadge = song.other ? <Badge pill variant="accomp">Accomp.</Badge> : null
      const bassBadge = song.bass ? <Badge pill variant="bass">Bass</Badge> : null
      const drumsBadge = song.drums ? <Badge pill variant="drums">Drums</Badge> : null
      audioTitleExtra = (<div className="badge-flex ml-2 mr-2">{vocalBadge} {accompBadge} {bassBadge} {drumsBadge}</div>)
    }

    // List of audio tracks conforming to music player API
    const audioList = [{
      name: song.title,
      singer: song.artist,
      musicSrc: song.url
    }]

    return (
      <ReactJkMusicPlayer
        audioLists={audioList}
        getAudioInstance={getAudioInstance}
        audioTitleExtra={audioTitleExtra}
        responsive={false}
        theme="light"
        mode="full"                     // Show player at bottom of page
        clearPriorAudioLists={true}     // Never keep old audio list 
        autoPlayInitLoadPlayList={true} // Autoplay after updating audio list
        toggleMode={false}              // Disable minimizing audio player bar
        remove={false}                  // Disable removing tracks from playlist
        drag={false}
        preload={true}
        autoHiddenCover={true}
        showDownload={false}
        showPlayMode={false}
        showReload={false}
        showThemeSwitch={false}
        showLyric={false}
        onAudioPause={onAudioPause}
        onAudioPlay={onAudioPlay} 
        onAudioListsChange={this.onAudioListsChange}
        locale={{ playListsText: 'Now Playing' }} />
    );
  }
}

export default MusicPlayer;
