import React, { Component } from 'react'
import PlayerUI from './PlayerUI'
import VolumeUI from './VolumeUI'
import * as Tone from 'tone'

/**
 * Audio player interface that plays the vocals, accomp, bass, and drum parts in sync
 * with individual adjustable volume controls.
 *
 * It uses the Tone.js framework (built on the Web Audio API) to perform timing-sensitive
 * audio playback. Simply using HTMLAudioElement introduces a lot of latency/lag causing
 * the four tracks to be out-of-sync easily.
 */
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
      volume: {
        vocals: 0,
        accomp: 0,
        drums: 0,
        bass: 0
      }
    }

    this.interval = null
    this.tonePlayers = null
  }

  componentDidMount() {
    this.isMounted = true
    const { data } = this.props
    // Initialize Player objects pointing to the four track files
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
    if (this.tonePlayers) {
      this.tonePlayers.stopAll()
      this.tonePlayers.dispose()
    }
    clearInterval(this.interval)
  }

  /**
   * Handle play/pause button click.
   */
  play = async () => {
    const { isPlaying } = this.state
    if (isPlaying) {
      // Pause playback and refresh interval
      Tone.Transport.pause()
      clearInterval(this.interval)
    } else {
      // If playing for first time, ask browser to start audio context
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

      // Resume/start playback
      Tone.Transport.start()

      // Set regular refresh interval (twice a second)
      this.interval = setInterval(() => {
        this.onUpdate()
      }, 200)
    }

    this.setState({
      isPlaying: !this.state.isPlaying
    })
  }

  onBeforeSeek = () => {
    // Disable refresh while seeking
    clearInterval(this.interval)
  }

  onSeeking = seconds => {
    this.setState({
      secondsElapsed: seconds
    })
  }

  onAfterSeek = seconds => {
    Tone.Transport.seconds = seconds
    // Resume refresh after seek
    this.interval = setInterval(() => {
      this.onUpdate()
    }, 200)
  }

  /**
   * Called to update playback progress.
   */
  onUpdate = () => {
    // Arbitrarily use vocals track as source of truth (they should all have same duration anyways)
    const durationSeconds = this.tonePlayers.player('vocals').buffer.duration
    const secondsElapsed = Math.min(durationSeconds, Tone.Transport.seconds)

    if (secondsElapsed === durationSeconds) {
      Tone.Transport.stop()
    }
    const isPlaying = Tone.Transport.state === 'started'

    this.setState({
      isPlaying: isPlaying,
      durationSeconds: durationSeconds,
      secondsElapsed: secondsElapsed,
    })

    if (!isPlaying) {
      clearInterval(this.interval)
    }
  }

  /**
   * Handle when mute button click.
   * @param id Track ID
   */
  onMuteClick = id => {
    const player = this.tonePlayers.player(id)

    if (player.volume.value === -Infinity) {
      // Restore volume level to previous value
      player.volume.value = this.state.volume[id]
    } else {
      // Mute the player volume
      player.volume.value = -Infinity
    }
    this.forceUpdate()
  }

  /**
   * Handle when volume slider changes.
   * @param id Track ID
   * @param val New volume in dB
   */
  onVolChange = (id, pct) => {
    // Convert percentage to dB
    const db = 20 * Math.log10(pct / 100.0)
    // Change player volume
    this.tonePlayers.player(id).volume.value = db

    // Save volume level in state so that if it's muted, the previous volume level is saved
    const currentVolumes = this.state.volume
    currentVolumes[id] = db
    this.setState({
      volume: currentVolumes
    })
  }

  render() {
    const {
      durationSeconds,
      secondsElapsed,
      isReady
    } = this.state

    const vocalsMuted = this.tonePlayers
      ? this.tonePlayers.player('vocals').volume.value === -Infinity
      : false
    const accompMuted = this.tonePlayers
      ? this.tonePlayers.player('accomp').volume.value === -Infinity
      : false
    const bassMuted = this.tonePlayers
      ? this.tonePlayers.player('bass').volume.value === -Infinity
      : false
    const drumsMuted = this.tonePlayers
      ? this.tonePlayers.player('drums').volume.value === -Infinity
      : false

    return (
      <div>
        <PlayerUI
          isPlayDisabled={!isReady}
          isPlaying={this.state.isPlaying}
          onPlayClick={this.play}
          onBeforeSeek={this.onBeforeSeek}
          onSeeking={this.onSeeking}
          onAfterSeek={this.onAfterSeek}
          secondsElapsed={secondsElapsed}
          durationSeconds={durationSeconds}
        />
        <VolumeUI
          id="vocals"
          disabled={!isReady}
          isMuted={vocalsMuted}
          onMuteClick={this.onMuteClick}
          onVolChange={this.onVolChange}
        />
        <VolumeUI
          id="accomp"
          disabled={!isReady}
          isMuted={accompMuted}
          onMuteClick={this.onMuteClick}
          onVolChange={this.onVolChange}
        />
        <VolumeUI
          id="bass"
          disabled={!isReady}
          isMuted={bassMuted}
          onMuteClick={this.onMuteClick}
          onVolChange={this.onVolChange}
        />
        <VolumeUI
          id="drums"
          disabled={!isReady}
          isMuted={drumsMuted}
          onMuteClick={this.onMuteClick}
          onVolChange={this.onVolChange}
        />
      </div>
    )
  }
}

export default MixerPlayer
