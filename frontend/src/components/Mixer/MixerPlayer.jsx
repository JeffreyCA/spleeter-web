import React, { Component } from 'react'
import PlayerUI from './PlayerUI'
import VolumeUI from './VolumeUI'
import * as Tone from 'tone'

class MixerPlayer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoaded: false,
      isPlaying: false,
      durationSeconds: 0,
      secondsElapsed: 0,
      secondsRemaining: 0
    }

    this.interval = null
    this.tonePlayers = new Tone.Players({
      'vocals':
        '',
      'drums':
        ''
    }).toDestination()
  }

  isPlaying = audioElement => {
    if (audioElement) {
      return audioElement.duration > 0 && !audioElement.paused
    }
    return false
  }

  isStopped = audioElement => {
    return !audioElement.currentTime
  }

  play = async () => {
    const { isPlaying } = this.state
    if (isPlaying) {
      Tone.Transport.pause()
      clearInterval(this.interval)
    } else {
      if (!this.state.isLoaded) {
        await Tone.start()
        this.tonePlayers.player('vocals').sync().start(0, 0)
        this.tonePlayers.player('drums').sync().start(0, 0)
        this.setState({
          isLoaded: true
        })
      }

      Tone.Transport.start()

      this.interval = setInterval(() => {
        this.onUpdate()
      }, 500)
    }

    this.setState({
      isPlaying: !this.state.isPlaying
    })
  }

  onBeforeSeek = () => {
    clearInterval(this.interval)
  }

  onSeeking = seconds => {
    this.setState({
      secondsElapsed: seconds
    })
  }

  onAfterSeek = seconds => {
    Tone.Transport.seconds = seconds
    this.interval = setInterval(() => {
      this.onUpdate()
    }, 500)
  }

  onEnded = () => {
    this.audioElements.forEach(element => {
      element.pause()
    })
    const firstAudioElement = this.audioElements[0]
    if (firstAudioElement) {
      this.setState({
        isPlaying: false,
        durationSeconds: firstAudioElement.duration,
        secondsElapsed: firstAudioElement.duration,
        secondsRemaining: 0
      })
    }
  }

  onUpdate = () => {
    const durationSeconds = this.tonePlayers.player('vocals').buffer.duration
    const secondsElapsed = Math.min(durationSeconds, Tone.Transport.seconds)
    const secondsRemaining = Math.max(0, durationSeconds - secondsElapsed)
    
    if (secondsElapsed === durationSeconds) {
      Tone.Transport.stop()
    }
    const isPlaying = Tone.Transport.state === 'started'

    this.setState({
      isPlaying: isPlaying,
      durationSeconds: durationSeconds,
      secondsElapsed: secondsElapsed,
      secondsRemaining: secondsRemaining
    })

    if (!isPlaying) {
      clearInterval(this.interval)
    }
  }

  onMuteClick = (id) => {
    const player = this.tonePlayers.player(id)
    player.mute = !player.mute
  }

  onVolChange = (id, val) => {
    const db = 10 * Math.log10(val / 100.0)
    this.tonePlayers.player(id).volume.value = db;
  }

  render() {
    const {
      durationSeconds,
      secondsElapsed,
      secondsRemaining
    } = this.state

    const player1Muted = this.tonePlayers.player('vocals').mute
    const player2Muted = this.tonePlayers.player('drums').mute

    return (
      <div>
        <PlayerUI
          isPlaying={this.state.isPlaying}
          onPlayClick={this.play}
          onBeforeSeek={this.onBeforeSeek}
          onSeeking={this.onSeeking}
          onAfterSeek={this.onAfterSeek}
          secondsElapsed={secondsElapsed}
          secondsRemaining={secondsRemaining}
          durationSeconds={durationSeconds}
        />
        <VolumeUI
          id="vocals"
          isMuted={player1Muted}
          onMuteClick={this.onMuteClick}
          onVolChange={this.onVolChange}
        />
        <VolumeUI
          id="drums"
          isMuted={player2Muted}
          onMuteClick={this.onMuteClick}
          onVolChange={this.onVolChange}
        />
      </div>
    )
  }
}

export default MixerPlayer
