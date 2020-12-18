import * as React from 'react';
import { Button } from 'react-bootstrap';

interface Props {
  onClick: () => void;
}

class CancelButton extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <Button className={`text-btn`} variant="danger" onClick={this.props.onClick}>
        Cancel
      </Button>
    );
  }
}

export default CancelButton;
