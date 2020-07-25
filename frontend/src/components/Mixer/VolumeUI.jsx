import React from 'react'
import MuteButton from './MuteButton'
import ReactSlider from 'react-slider'
import { Col, Row } from 'react-bootstrap'
import { VocalsBadge, AccompShortBadge, DrumsBadge, BassBadge } from '../Badges'
import './VolumeUI.css'

/**
 * Volume slider with mute button component.
 */
const VolumeUI = props => {
  const onMuteClick = () => {
    props.onMuteClick(props.id)
  }

  const onVolChange = (newVal) => {
    props.onVolChange(props.id, newVal)
  }

  let badge = null
  if (props.id === 'vocals') {
    badge = <VocalsBadge className="vol-badge" />
  } else if (props.id === 'accomp') {
    badge = <AccompShortBadge className="vol-badge" />
  } else if (props.id === 'bass') {
    badge = <BassBadge className="vol-badge" />
  } else if (props.id === 'drums') {
    badge = <DrumsBadge className="vol-badge" />
  }

  return (
    <Row noGutters className="volume-ui">
      <div className="badge-group">{badge}</div>
      <MuteButton isMuted={props.isMuted} onClick={onMuteClick} />
      <Col xs={4}>
        <ReactSlider
          className="vol-slider"
          thumbClassName="vol-thumb"
          trackClassName="vol-track"
          defaultValue={100}
          onChange={onVolChange}
          min={1}
          max={100}
          renderThumb={(props, state) => (
            <div {...props}>
              <span className="vol-label">{state.valueNow}</span>
            </div>
          )}
        />
      </Col>
    </Row>
  )
}

export default VolumeUI
