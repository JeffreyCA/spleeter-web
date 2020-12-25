/* eslint-disable @typescript-eslint/ban-types */
import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';

interface Props {
  show: boolean;
  submit: () => void;
  hide: () => void;
}

/**
 * Component for the delete dynamic mix modal.
 */
class DeleteTaskModal extends React.Component<Props, {}> {
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
          <Modal.Title>Confirm deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>Are you sure you want to delete this mix?</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={this.submit}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default DeleteTaskModal;
