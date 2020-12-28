import * as React from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { PauseFill, PlayFill } from 'react-bootstrap-icons';

interface Props {
  disabled: boolean;
  isPlaying: boolean;
  onClick: () => void;
}

const PlayButton = (props: Props): JSX.Element => {
  let content = null;
  if (props.disabled) {
    content = <Spinner animation="border" />;
  } else if (props.isPlaying) {
    content = <PauseFill size={28} />;
  } else {
    content = <PlayFill size={28} style={{ marginLeft: 1.25, marginRight: -1.25 }} />;
  }

  return (
    <Button
      disabled={props.disabled}
      onClick={props.onClick}
      className="p-1"
      variant="secondary"
      size="lg"
      style={{ borderRadius: '50%' }}>
      {content}
    </Button>
  );
};

export default PlayButton;
