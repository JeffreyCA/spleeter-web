import * as React from 'react';
import PlayButton from './PlayButton';
import ReactSlider from 'react-slider';
import { formatTime } from '../../Utils';
import './PlayerUI.css';

interface Props {
  isPlayDisabled: boolean;
  isPlaying: boolean;
  durationSeconds: number;
  secondsElapsed: number;
  onPlayClick: () => void;
  onBeforeSeek: (seconds: number | number[] | undefined | null) => void;
  onSeeking: (seconds: number | number[] | undefined | null) => void;
  onAfterSeek: (seconds: number | number[] | undefined | null) => void;
}

const PlayerUI = (props: Props): JSX.Element => {
  const {
    isPlayDisabled,
    isPlaying,
    onPlayClick,
    onBeforeSeek,
    onSeeking,
    onAfterSeek,
    durationSeconds,
    secondsElapsed,
  } = props;
  return (
    <div className="player-ui">
      <PlayButton disabled={isPlayDisabled} isPlaying={isPlaying} onClick={onPlayClick} />
      <span className="time-elapsed">{formatTime(secondsElapsed)}</span>
      <ReactSlider
        className="time-slider"
        thumbClassName="player-thumb"
        trackClassName="player-track"
        disabled={isPlayDisabled}
        onBeforeChange={onBeforeSeek}
        onChange={onSeeking}
        onAfterChange={onAfterSeek}
        min={0}
        value={Math.floor(secondsElapsed)}
        max={isNaN(durationSeconds) ? 0 : durationSeconds}
      />
      <span className="time-duration">{formatTime(durationSeconds)}</span>
    </div>
  );
};

export default PlayerUI;
