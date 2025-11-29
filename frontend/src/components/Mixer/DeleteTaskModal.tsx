import * as React from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';

interface Props {
  isDeleting: boolean;
  show: boolean;
  submit: () => Promise<void>;
  hide: () => void;
}

/**
 * Component for the delete dynamic mix modal.
 */
class DeleteTaskModal extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  submit = async (): Promise<void> => {
    await this.props.submit();
    this.props.hide();
  };

  render(): JSX.Element | null {
    const { isDeleting } = this.props;
    return (
      <Modal show={this.props.show} onHide={!isDeleting ? this.props.hide : undefined}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <div>Functionality disabled for demo purposes.</div>
          </Alert>
          <div>Are you sure you want to delete this mix?</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" disabled>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default DeleteTaskModal;
