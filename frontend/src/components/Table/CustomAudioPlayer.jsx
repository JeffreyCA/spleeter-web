import React from 'react';
import AudioPlayer from 'react-h5-audio-player';
import { Icon } from '@iconify/react'
import pauseCircle from '@iconify/icons-mdi/pause-circle'
import stopCircle from '@iconify/icons-mdi/stop-circle'
import './CustomAudioPlayer.css'

class CustomAudioPlayer extends React.Component {
  onPause = (e) => {
    // Make pause button act like stop button in minimal view
    if (this.props.isMinimal) {
      e.target.currentTime = 0
    }
  }

  render() {
    const { isMinimal, sourceUrl } = this.props
    const pauseIcon = isMinimal ? <Icon className="stop-icon" icon={stopCircle}/>
                                : <Icon className="pause-icon" icon={pauseCircle}/>

    return (
      <AudioPlayer
        src={sourceUrl}
        layout="horizontal"
        showJumpControls={false}
        customVolumeControls={[]}
        customAdditionalControls={[]}
        onPause={this.onPause}
        preload="none"
        customIcons={{ pause: pauseIcon }} />
    );
  }
}

export default CustomAudioPlayer
