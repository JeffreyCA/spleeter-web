import React from 'react'
import PlayButton from './PlayButton'
import ReactSlider from 'react-slider'
import { formatTime } from '../../Utils'
import './PlayerUI.css'

const PlayerUI = (props) => {
  const {
    isPlayDisabled,
    isPlaying,
    onPlayClick,
    onBeforeSeek,
    onSeeking,
    onAfterSeek,
    durationSeconds,
    secondsElapsed,
    secondsRemaining
  } = props
  return (
    <div className="player-ui">
      <PlayButton
        disabled={isPlayDisabled}
        className="play-button"
        isPlaying={isPlaying}
        onClick={onPlayClick}
      />
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
        value={secondsElapsed}
        max={isNaN(durationSeconds) ? 0 : durationSeconds}
      />
      <span className="time-remaining">{formatTime(secondsRemaining)}</span>
    </div>
  )
}

export default PlayerUI
