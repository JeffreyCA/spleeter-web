import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import ReactSlider from 'react-slider';
import { PartId } from '../../models/PartId';
import { AccompShortBadge, BassBadge, DrumsBadge, VocalsBadge } from '../Badges';
import MuteButton from './MuteButton';
import './VolumeUI.css';

interface Props {
  id: PartId;
  disabled: boolean;
  isMuted: boolean;
  onMuteClick: (id: PartId) => void;
  onVolChange: (id: PartId, newVal: number) => void;
}

/**
 * Volume slider with mute button component.
 */
export const VolumeUI = (props: Props): JSX.Element => {
  const onMuteClick = () => {
    props.onMuteClick(props.id);
  };

  const onVolChange = (value: number | number[] | undefined | null): void => {
    if (typeof value === 'number') {
      props.onVolChange(props.id, value);
    }
  };

  let badge = null;
  if (props.id === 'vocals') {
    badge = <VocalsBadge className="vol-badge" />;
  } else if (props.id === 'accomp') {
    badge = <AccompShortBadge className="vol-badge" />;
  } else if (props.id === 'bass') {
    badge = <BassBadge className="vol-badge" />;
  } else if (props.id === 'drums') {
    badge = <DrumsBadge className="vol-badge" />;
  }

  return (
    <Row noGutters className="volume-ui">
      <div className="badge-group">{badge}</div>
      <MuteButton disabled={props.disabled} isMuted={props.isMuted} onClick={onMuteClick} />
      <Col xs={4}>
        <ReactSlider
          className="vol-slider"
          thumbClassName="vol-thumb"
          trackClassName="vol-track"
          disabled={props.disabled}
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
  );
};
