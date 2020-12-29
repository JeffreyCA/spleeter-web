import * as React from 'react';
import { Button } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';
import { DynamicMix } from '../../../models/DynamicMix';

interface Props {
  disabled?: boolean;
  mix: DynamicMix;
  onClick: (song: DynamicMix) => void;
}

/**
 * Delete dynamic mix button component.
 */
class DeleteDynamicMixButton extends React.Component<Props> {
  handleClick = (): void => {
    this.props.onClick(this.props.mix);
  };

  render(): JSX.Element {
    return (
      <Button
        variant="danger"
        className="ml-2"
        style={{ whiteSpace: 'nowrap' }}
        title="Delete"
        disabled={this.props.disabled}
        onClick={this.handleClick}>
        <Trash />
      </Button>
    );
  }
}

export default DeleteDynamicMixButton;
