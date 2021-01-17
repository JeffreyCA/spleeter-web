import * as React from 'react';
import { Button } from 'react-bootstrap';
import { VolumeMuteFill, VolumeUpFill } from 'react-bootstrap-icons';

interface Props {
  isMuted: boolean;
  disabled: boolean;
  onClick: () => void;
}

/**
 * Mute button component.
 */
const MuteButton = (props: Props): JSX.Element => {
  const { isMuted } = props;
  const variant = isMuted ? 'white' : 'secondary';

  return (
    <Button
      onClick={props.onClick}
      disabled={props.disabled}
      className="p-1"
      variant={variant}
      size="lg"
      active={isMuted}
      title="Mute track">
      {isMuted ? <VolumeMuteFill size={28} /> : <VolumeUpFill size={28} />}
    </Button>
  );
};

export default MuteButton;
