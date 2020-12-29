import * as React from 'react';
import { Button } from 'react-bootstrap';

interface Props {
  className?: string;
  onClick: () => void;
}

/**
 * Component for the delete dynamic mix button.
 */
class DeleteButton extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <Button
        className={`text-btn ${this.props.className}`}
        variant="outline-danger"
        size="sm"
        onClick={this.props.onClick}>
        Delete
      </Button>
    );
  }
}

export default DeleteButton;
