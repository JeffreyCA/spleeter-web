import * as React from 'react';
import { Button } from 'react-bootstrap';
import { PauseFill, PlayFill } from 'react-bootstrap-icons';
import { SongData } from '../../../models/SongData';
import { StaticMix } from '../../../models/StaticMix';

interface Props {
  song: SongData | StaticMix;
  disabled: boolean;
  disabledText: string;
  playing: boolean;
  onPauseClick: (song: SongData | StaticMix) => void;
  onPlayClick: (song: SongData | StaticMix) => void;
}

/**
 * Component for pause/play button shown in the song table.
 */
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
    const customButton = (
      <Button
        disabled={disabled}
        onClick={this.handlePlay}
        className="p-1"
        variant="secondary"
        size="lg"
        style={{ borderRadius: '50%' }}>
        {playing && !disabled ? (
          <PauseFill size={28} />
        ) : (
          // Play icon is slightly off-centre when placed in circular button
          <PlayFill size={28} style={{ marginLeft: 1.25, marginRight: -1.25 }} />
        )}
      </Button>
    );

    return customButton;
  }
}

export default PausePlayButton;
