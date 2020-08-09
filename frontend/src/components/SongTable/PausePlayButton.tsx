import * as React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
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
    const { playing, disabled, disabledText } = this.props;

    function renderTooltip(props: Props) {
      return (
        <Tooltip id="button-tooltip" {...props}>
          {disabledText}
        </Tooltip>
      );
    }

    const customButtonStyle = disabled
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

    const buttonOverlay = (
      <OverlayTrigger placement="right" delay={{ show: 100, hide: 100 }} overlay={renderTooltip}>
        <span className="d-inline-block">{customButton}</span>
      </OverlayTrigger>
    );

    if (disabled && disabledText) {
      return buttonOverlay;
    } else {
      return customButton;
    }
  }
}

export default PausePlayButton;
