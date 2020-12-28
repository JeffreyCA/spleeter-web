import * as React from 'react';
import { Button } from 'react-bootstrap';
import { VolumeMuteFill, VolumeUpFill } from 'react-bootstrap-icons';

interface Props {
  isMuted: boolean;
  disabled: boolean;
  onClick: () => void;
}

const MuteButton = (props: Props): JSX.Element => {
  return (
    <Button onClick={props.onClick} disabled={props.disabled} className="p-1" variant="secondary" size="lg">
      {props.isMuted ? <VolumeMuteFill size={28} /> : <VolumeUpFill size={28} />}
    </Button>
  );
};

export default MuteButton;
