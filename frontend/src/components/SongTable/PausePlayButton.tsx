import * as React from 'react';
import { Button } from 'react-bootstrap';
import { PauseFill, PlayFill } from 'react-bootstrap-icons';
import { SongData } from '../../models/SongData';
import { StaticMix } from '../../models/StaticMix';

interface Props {
  song: SongData | StaticMix;
  disabled: boolean;
  disabledText: string;
  playing: boolean;
  onPauseClick: (song: SongData | StaticMix) => void;
  onPlayClick: (song: SongData | StaticMix) => void;
}

class PausePlayButton extends React.Component<Props> {
  handlePlay = (): void => {
    if (this.props.playing) {
      this.props.onPauseClick(this.props.song);
    } else {
      this.props.onPlayClick(this.props.song);
    }
  };

  render(): JSX.Element {
    const { playing, disabled } = this.props;

    const customButtonStyle: React.CSSProperties = disabled
      ? {
          pointerEvents: 'none',
        }
      : {};
    const customButton = (
      <Button
        disabled={disabled}
        style={customButtonStyle}
        onClick={this.handlePlay}
        className="btn-circle p-1"
        variant="secondary"
        size="lg">
        {playing && !disabled ? <PauseFill size={28} /> : <PlayFill size={28} />}
      </Button>
    );

    return customButton;
  }
}

export default PausePlayButton;
