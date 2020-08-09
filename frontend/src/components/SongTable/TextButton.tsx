import * as React from 'react';
import { Button } from 'react-bootstrap';
import { SongData } from '../../models/SongData';
import './TextButton.css';

interface Props {
  className: string;
  variant?: string;
  disabled: boolean;
  song: SongData;
  onClick: (song: SongData) => void;
}

class TextButton extends React.Component<Props> {
  handleClick = (): void => {
    this.props.onClick(this.props.song);
  };

  render(): JSX.Element {
    return (
      <Button
        className={`text-btn ml-2 ${this.props.className}`}
        variant={this.props.variant}
        disabled={this.props.disabled}
        onClick={this.handleClick}>
        {this.props.children}
      </Button>
    );
  }
}

export default TextButton;
