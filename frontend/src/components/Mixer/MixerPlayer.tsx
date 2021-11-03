import * as React from 'react';
import { Alert } from 'react-bootstrap';
import * as Tone from 'tone';
import { FADE_DURATION_S } from '../../Constants';
import { DynamicMix } from '../../models/DynamicMix';
import { PartId, PartIds } from '../../models/PartId';
import './MixerPlayer.css';
import PlayerUI from './PlayerUI';
import VolumeUI from './VolumeUI';

interface VolumeLevels {
  vocals: number;
  accomp: number;
  drums: number;
  bass: number;
}

interface MuteStatus {
  vocals: boolean;
  accomp: boolean;
  drums: boolean;
  bass: boolean;
}

interface SoloStatus {
  vocals: boolean;
  accomp: boolean;
  drums: boolean;
  bass: boolean;
}

interface Props {
  data?: DynamicMix;
}

interface State {
  isReady: boolean;
  isInit: boolean;
  isPlaying: boolean;
  durationSeconds: number;
  secondsElapsed: number;
  volume: VolumeLevels;
  muteStatus: MuteStatus;
  soloStatus: SoloStatus;
}

/**
 * Audio player interface that plays the vocals, accomp, bass, and drum parts in sync
 * with individual adjustable volume controls.
 *
 * It uses the Tone.js framework (built on the Web Audio API) to perform timing-sensitive
 * audio playback. Simply using HTMLAudioElement introduces a lot of latency/lag causing
 * the four tracks to be out-of-sync easily.
 */
class MixerPlayer extends React.Component<Props, State> {
  isMounted = false;
  interval?: number;
  tonePlayers?: Tone.Players;

  constructor(props: Props) {
    super(props);
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
        bass: 0,
      },
      muteStatus: {
        vocals: false,
        accomp: false,
        drums: false,
        bass: false,
      },
      soloStatus: {
        vocals: false,
        accomp: false,
        drums: false,
        bass: false,
      },
    };
  }

  onKeyPress = (event: KeyboardEvent): void => {
    // Mute keyboard shortcuts
    if (event.key === '1' || event.key === '!') {
      this.onMuteClick('vocals');
    } else if (event.key === '2' || event.key === '@') {
      this.onMuteClick('accomp');
    } else if (event.key === '3' || event.key === '#') {
      this.onMuteClick('bass');
    } else if (event.key === '4' || event.key === '$') {
      this.onMuteClick('drums');
    }

    // Solo keyboard shortcuts
    if (event.key.toLowerCase() === 'q') {
      this.onSoloClick('vocals', !event.ctrlKey && !event.metaKey && !event.shiftKey);
    } else if (event.key.toLowerCase() === 'w') {
      this.onSoloClick('accomp', !event.ctrlKey && !event.metaKey && !event.shiftKey);
    } else if (event.key.toLowerCase() === 'e') {
      this.onSoloClick('bass', !event.ctrlKey && !event.metaKey && !event.shiftKey);
    } else if (event.key.toLowerCase() === 'r') {
      this.onSoloClick('drums', !event.ctrlKey && !event.metaKey && !event.shiftKey);
    }

    if (event.key === ' ' && this.state.isReady) {
      this.play();
      event.preventDefault();
    }
  };

  componentDidMount(): void {
    this.isMounted = true;
    const { data } = this.props;
    // Initialize Player objects pointing to the four track files
    const players = new Tone.Players(
      {
        vocals: data?.vocals_url ?? '',
        accomp: data?.other_url ?? '',
        drums: data?.drums_url ?? '',
        bass: data?.bass_url ?? '',
      },
      () => {
        players.toDestination();
        this.tonePlayers = players;
        this.tonePlayers.fadeIn = FADE_DURATION_S;
        this.tonePlayers.fadeOut = FADE_DURATION_S;
        // Tracks are now ready to be played
        if (this.isMounted) {
          this.setState({
            isReady: true,
          });
        }
      }
    );
    document.addEventListener('keydown', this.onKeyPress, false);
  }

  componentWillUnmount(): void {
    this.isMounted = false;
    Tone.Transport.stop();
    if (this.tonePlayers) {
      this.tonePlayers.stopAll();
      this.tonePlayers.dispose();
    }
    clearInterval(this.interval);
    document.removeEventListener('keydown', this.onKeyPress, false);
  }

  /**
   * Handle play/pause button click.
   */
  play = async (): Promise<void> => {
    const { isPlaying } = this.state;
    if (isPlaying) {
      // Pause playback and refresh interval
      Tone.Transport.pause();
      clearInterval(this.interval);
    } else {
      // If playing for first time, ask browser to start audio context
      if (!this.state.isInit) {
        await Tone.start();
        this.tonePlayers?.player('vocals').sync().start(0, 0);
        this.tonePlayers?.player('accomp').sync().start(0, 0);
        this.tonePlayers?.player('bass').sync().start(0, 0);
        this.tonePlayers?.player('drums').sync().start(0, 0);
        this.setState({
          isInit: true,
        });
      }

      // Resume/start playback
      Tone.Transport.start();

      // Set regular refresh interval
      this.interval = setInterval(() => {
        this.onUpdate();
      }, 100);
    }

    this.setState({
      isPlaying: !this.state.isPlaying,
    });
  };

  onBeforeSeek = (): void => {
    // Disable refresh while seeking
    clearInterval(this.interval);
  };

  onSeeking = (seconds: number | number[] | undefined | null): void => {
    if (typeof seconds === 'number') {
      this.setState({
        secondsElapsed: seconds,
      });
    }
  };

  onAfterSeek = (seconds: number | number[] | undefined | null): void => {
    if (typeof seconds === 'number') {
      Tone.Transport.seconds = seconds;
      // Resume refresh after seek
      this.interval = setInterval(() => {
        this.onUpdate();
      }, 200);
    }
  };

  isNoneSoloed = (soloStatus: SoloStatus = this.state.soloStatus): boolean => {
    return !soloStatus.vocals && !soloStatus.accomp && !soloStatus.bass && !soloStatus.drums;
  };

  /**
   * Called to update playback progress.
   */
  onUpdate = (): void => {
    if (!this.tonePlayers) {
      return;
    }

    // Arbitrarily use vocals track as source of truth (they should all have same duration anyways)
    const durationSeconds = this.tonePlayers.player('vocals').buffer.duration;
    const secondsElapsed = Math.min(durationSeconds, Tone.Transport.seconds);

    if (secondsElapsed === durationSeconds) {
      Tone.Transport.stop();
    }
    const isPlaying = Tone.Transport.state === 'started';

    this.setState({
      isPlaying: isPlaying,
      durationSeconds: durationSeconds,
      secondsElapsed: secondsElapsed,
    });

    if (!isPlaying) {
      clearInterval(this.interval);
    }
  };

  /**
   * Handle when mute button click.
   * @param id Track ID
   */
  onMuteClick = (id: PartId): void => {
    if (!this.tonePlayers) {
      return;
    }

    const newMuteStatus = this.state.muteStatus;
    newMuteStatus[id] = !newMuteStatus[id];
    this.setState({
      muteStatus: newMuteStatus,
    });

    const noneSoloed = this.isNoneSoloed(this.state.soloStatus);
    if (noneSoloed || this.state.soloStatus[id]) {
      const player = this.tonePlayers.player(id);
      if (newMuteStatus[id]) {
        // Mute the player volume
        player.volume.value = -Infinity;
      } else {
        // Restore volume level to previous value
        player.volume.value = this.state.volume[id];
      }
    }
  };

  /**
   * Handle solo button click.
   * @param id Track ID
   */
  onSoloClick = (id: PartId, overwrite: boolean): void => {
    if (!this.tonePlayers) {
      return;
    }

    const prevSoloed = this.state.soloStatus[id];

    // Reset solo state if modifier key was not pressed and the track is changing from non-solo to solo state
    const newSoloStatus: SoloStatus =
      !prevSoloed && overwrite
        ? {
            vocals: false,
            accomp: false,
            drums: false,
            bass: false,
          }
        : this.state.soloStatus;

    newSoloStatus[id] = !prevSoloed;
    this.setState({ soloStatus: newSoloStatus });

    const noneSoloed = this.isNoneSoloed(newSoloStatus);

    for (const part of PartIds) {
      const player = this.tonePlayers.player(part);
      if (!this.state.muteStatus[part] && (noneSoloed || newSoloStatus[part])) {
        // Make track audible if none of the tracks are soloed or the track itself is soloed
        player.volume.value = this.state.volume[part];
      } else {
        // Otherwise mute
        player.volume.value = -Infinity;
      }
    }
  };

  /**
   * Handle when volume slider changes.
   * @param id Track ID
   * @param val New volume in dB
   */
  onVolChange = (id: PartId, pct: number): void => {
    if (!this.tonePlayers) {
      return;
    }

    // Convert percentage to dB
    const db = 20 * Math.log10(pct / 100.0);
    // Save volume level in state so that if it's muted, the previous volume level is saved
    const currentVolumes = this.state.volume;
    currentVolumes[id] = db;

    this.setState({
      volume: currentVolumes,
    });

    const soloStatus = this.state.soloStatus;
    // Adjust player volume only if not muted and is active
    if (!this.state.muteStatus[id] && (this.isNoneSoloed(soloStatus) || soloStatus[id])) {
      // Change player volume
      this.tonePlayers.player(id).volume.value = db;
    }
  };

  render(): JSX.Element {
    const { data } = this.props;
    const { durationSeconds, secondsElapsed, isReady, muteStatus, soloStatus } = this.state;
    const noneSoloed = this.isNoneSoloed(soloStatus);

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
          url={data?.vocals_url ?? ''}
          disabled={!isReady}
          isActive={!muteStatus.vocals && (soloStatus.vocals || noneSoloed)}
          isMuted={muteStatus.vocals}
          isSoloed={soloStatus.vocals}
          onMuteClick={this.onMuteClick}
          onSoloClick={this.onSoloClick}
          onVolChange={this.onVolChange}
        />
        <VolumeUI
          id="accomp"
          url={data?.other_url ?? ''}
          disabled={!isReady}
          isActive={!muteStatus.accomp && (soloStatus.accomp || noneSoloed)}
          isMuted={muteStatus.accomp}
          isSoloed={soloStatus.accomp}
          onMuteClick={this.onMuteClick}
          onSoloClick={this.onSoloClick}
          onVolChange={this.onVolChange}
        />
        <VolumeUI
          id="bass"
          url={data?.bass_url ?? ''}
          disabled={!isReady}
          isActive={!muteStatus.bass && (soloStatus.bass || noneSoloed)}
          isSoloed={soloStatus.bass}
          isMuted={muteStatus.bass}
          onMuteClick={this.onMuteClick}
          onSoloClick={this.onSoloClick}
          onVolChange={this.onVolChange}
        />
        <VolumeUI
          id="drums"
          url={data?.drums_url ?? ''}
          disabled={!isReady}
          isActive={!muteStatus.drums && (soloStatus.drums || noneSoloed)}
          isSoloed={soloStatus.drums}
          isMuted={muteStatus.drums}
          onMuteClick={this.onMuteClick}
          onSoloClick={this.onSoloClick}
          onVolChange={this.onVolChange}
        />
        <Alert className="mt-5" variant="info" style={{ fontSize: '0.9em' }}>
          <p className="mb-0">
            <b>Mute/unmute parts: </b>
            <kbd>1</kbd>
            <kbd>2</kbd>
            <kbd>3</kbd>
            <kbd>4</kbd>
            <br />
            <b>Solo/unsolo parts: </b>
            <kbd>Q</kbd>
            <kbd>W</kbd>
            <kbd>E</kbd>
            <kbd>R</kbd>
            &nbsp;(Hold either<kbd>Ctrl/Cmd/Shift</kbd>to solo/unsolo multiple parts)
          </p>
        </Alert>
      </div>
    );
  }
}

export default MixerPlayer;
