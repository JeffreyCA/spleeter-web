/* eslint-disable @typescript-eslint/ban-types */
import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';

interface Props {
  show: boolean;
  submit: () => void;
  hide: () => void;
}

/**
 * Component of the cancel dynamic mix modal.
 */
class CancelTaskModal extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  submit = (): void => {
    this.props.submit();
    this.props.hide();
  };

  render(): JSX.Element | null {
    return (
      <Modal show={this.props.show} onHide={this.props.hide}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>Are you sure you want to cancel this task?</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={this.props.hide}>
            Cancel
          </Button>
          <Button variant="danger" onClick={this.submit}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default CancelTaskModal;
