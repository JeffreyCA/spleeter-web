import React, { Component } from 'react'
import { OriginalBadge, VocalsBadge, AccompShortBadge, DrumsBadge, BassBadge } from '../Badges'
import ReactJkMusicPlayer from '@jeffreyca/react-jinke-music-player'
import './MusicPlayer.css'

/**
 * Music player component that controls audio playback. It shows up as a horizontal bar at the
 * bottom of the screen.
 */
class MusicPlayer extends Component {
  render() {
    const {
      getAudioInstance,
      isSource,
      song,
      onAudioPause,
      onAudioPlay
    } = this.props
    if (!song) {
      return null
    }

    // Show a colour-coded badge indicating the components that are included
    var audioTitleExtra
    if (isSource) {
      audioTitleExtra = <OriginalBadge />
    } else {
      const vocalBadge = song.vocals ? (
        <VocalsBadge />
      ) : null
      const accompBadge = song.other ? (
        <AccompShortBadge />
      ) : null
      const bassBadge = song.bass ? <BassBadge /> : null
      const drumsBadge = song.drums ? (
        <DrumsBadge />
      ) : null
      audioTitleExtra = (
        <div className="badge-flex ml-2 mr-2">
          {vocalBadge} {accompBadge} {bassBadge} {drumsBadge}
        </div>
      )
    }

    // List of audio tracks conforming to music player API
    const audioList = [
      {
        name: song.title,
        singer: song.artist,
        musicSrc: song.url
      }
    ]

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
        locale={{ playListsText: 'Now Playing' }}
      />
    )
  }
}

export default MusicPlayer
