/* eslint-disable @typescript-eslint/ban-types */
import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';

interface Props {
  isCancelling: boolean;
  show: boolean;
  submit: () => Promise<void>;
  hide: () => void;
}

/**
 * Component for the cancel dynamic mix modal.
 */
class CancelTaskModal extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  submit = async (): Promise<void> => {
    await this.props.submit();
    this.props.hide();
  };

  render(): JSX.Element | null {
    const { isCancelling } = this.props;
    return (
      <Modal show={this.props.show} onHide={!isCancelling && this.props.hide}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>Are you sure you want to cancel this task?</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" disabled={isCancelling} onClick={this.submit}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default CancelTaskModal;
