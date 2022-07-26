import * as React from 'react';
import ReactSlider from 'react-slider';
import { formatTime } from '../../Utils';
import PlayButton from './PlayButton';
import './PlayerUI.css';
import ExportButton from './ExportButton';

interface Props {
  isExportDisabled: boolean;
  isExportInitializing: boolean;
  isPlayDisabled: boolean;
  isPlaying: boolean;
  durationSeconds: number;
  exportError?: string;
  secondsElapsed: number;
  onPlayClick: () => void;
  onExportClick: () => void;
  onBeforeSeek: (seconds: number | number[] | undefined | null) => void;
  onSeeking: (seconds: number | number[] | undefined | null) => void;
  onAfterSeek: (seconds: number | number[] | undefined | null) => void;
}

const PlayerUI = (props: Props): JSX.Element => {
  const {
    isExportDisabled,
    isExportInitializing,
    isPlayDisabled,
    isPlaying,
    exportError,
    onExportClick,
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
      <ExportButton
        disabled={isExportDisabled}
        error={exportError}
        loading={isExportInitializing}
        onClick={onExportClick}
      />
    </div>
  );
};

export default PlayerUI;
