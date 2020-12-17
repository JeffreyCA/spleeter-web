import * as React from 'react';
import { Button } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';
import { StaticMix } from '../../models/StaticMix';

interface Props {
  disabled?: boolean;
  mix: StaticMix;
  onClick: (song: StaticMix) => void;
}

/**
 * Delete static mix button component.
 */
class DeleteStaticMixButton extends React.Component<Props> {
  handleClick = (): void => {
    console.log(this.props.mix)
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

export default DeleteStaticMixButton;
