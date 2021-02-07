import * as React from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Download } from 'react-bootstrap-icons';
import ReactSlider from 'react-slider';
import { PartId } from '../../models/PartId';
import { AccompShortBadge, BassBadge, DrumsBadge, VocalsBadge } from '../Badges';
import MuteButton from './MuteButton';
import SoloButton from './SoloButton';
import './VolumeUI.css';

interface Props {
  id: PartId;
  url?: string;
  disabled: boolean;
  isActive: boolean;
  isMuted: boolean;
  isSoloed: boolean;
  onMuteClick: (id: PartId) => void;
  onSoloClick: (id: PartId, overwrite: boolean) => void;
  onVolChange: (id: PartId, newVal: number) => void;
}

/**
 * Component for volume slider with mute/solo/download buttons.
 */
const VolumeUI = (props: Props): JSX.Element => {
  const onMuteClick = () => {
    props.onMuteClick(props.id);
  };

  const onSoloClick = (event: React.MouseEvent<HTMLElement>) => {
    props.onSoloClick(props.id, !event.ctrlKey && !event.metaKey && !event.shiftKey);
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

  const trackInactive = props.isActive ? '' : 'track-inactive';
  return (
    <Row noGutters className="volume-ui">
      <div className={`badge-group ${trackInactive}`}>{badge}</div>
      <MuteButton
        className={`${trackInactive}`}
        disabled={props.disabled}
        isMuted={props.isMuted}
        onClick={onMuteClick}
      />
      <SoloButton
        className={`ml-2 ${trackInactive}`}
        disabled={props.disabled}
        isSoloed={props.isSoloed}
        onClick={onSoloClick}
      />
      <Col className={`${trackInactive}`} xs={4}>
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
      <Button className="ml-4" size="sm" variant="success" disabled={!props.url} href={props.url} target="_blank">
        <Download />
      </Button>
    </Row>
  );
};

export default VolumeUI;
