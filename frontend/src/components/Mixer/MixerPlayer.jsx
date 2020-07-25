import React, { Component } from 'react'
import PlayerUI from './PlayerUI'
import VolumeUI from './VolumeUI'
import * as Tone from 'tone'

class MixerPlayer extends Component {
  isMounted = false

  constructor(props) {
    super(props)
    this.state = {
      isReady: false,
      isInit: false,
      isPlaying: false,
      durationSeconds: 0,
      secondsElapsed: 0,
      secondsRemaining: 0
    }

    this.interval = null
    this.tonePlayers = null
  }

  componentDidMount() {
    this.isMounted = true
    const { data } = this.props
    this.tonePlayers = new Tone.Players(
      {
        vocals: data.vocals_file,
        accomp: data.other_file,
        drums: data.drums_file,
        bass: data.bass_file
      },
      () => {
        if (this.isMounted) {
          this.setState({
            isReady: true
          })
        }
      }
    ).toDestination()
  }

  componentWillUnmount() {
    this.isMounted = false
    clearInterval(this.interval)
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
      if (!this.state.isInit) {
        await Tone.start()
        this.tonePlayers.player('vocals').sync().start(0, 0)
        this.tonePlayers.player('accomp').sync().start(0, 0)
        this.tonePlayers.player('bass').sync().start(0, 0)
        this.tonePlayers.player('drums').sync().start(0, 0)
        this.setState({
          isInit: true
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

  onMuteClick = id => {
    const player = this.tonePlayers.player(id)
    player.mute = !player.mute
  }

  onVolChange = (id, val) => {
    const db = 20 * Math.log10(val / 100.0)
    this.tonePlayers.player(id).volume.value = db
  }

  render() {
    const { durationSeconds, secondsElapsed, secondsRemaining } = this.state

    const vocalsMuted = this.tonePlayers
      ? this.tonePlayers.player('vocals').mute
      : false
    const accompMuted = this.tonePlayers
      ? this.tonePlayers.player('accomp').mute
      : false
    const bassMuted = this.tonePlayers
      ? this.tonePlayers.player('bass').mute
      : false
    const drumsMuted = this.tonePlayers
      ? this.tonePlayers.player('drums').mute
      : false

    return (
      <div>
        <PlayerUI
          isPlayDisabled={!this.state.isReady}
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
          isMuted={vocalsMuted}
          onMuteClick={this.onMuteClick}
          onVolChange={this.onVolChange}
        />
        <VolumeUI
          id="accomp"
          isMuted={accompMuted}
          onMuteClick={this.onMuteClick}
          onVolChange={this.onVolChange}
        />
        <VolumeUI
          id="bass"
          isMuted={bassMuted}
          onMuteClick={this.onMuteClick}
          onVolChange={this.onVolChange}
        />
        <VolumeUI
          id="drums"
          isMuted={drumsMuted}
          onMuteClick={this.onMuteClick}
          onVolChange={this.onVolChange}
        />
      </div>
    )
  }
}

export default MixerPlayer
