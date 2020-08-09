import * as React from 'react';
import { Button } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';
import { SongData } from '../../models/SongData';

interface Props {
  disabled: boolean;
  song: SongData;
  onClick: (song: SongData) => void;
}

/**
 * Delete button component.
 */
class DeleteButton extends React.Component<Props> {
  handleClick = (): void => {
    this.props.onClick(this.props.song);
  };

  render(): JSX.Element {
    return (
      <Button
        variant="danger"
        className="ml-2"
        style={{ whiteSpace: 'nowrap' }}
        disabled={this.props.disabled}
        onClick={this.handleClick}>
        <Trash />
      </Button>
    );
  }
}

export default DeleteButton;
