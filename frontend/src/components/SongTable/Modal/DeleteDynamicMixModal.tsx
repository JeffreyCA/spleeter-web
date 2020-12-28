import axios from 'axios';
import * as React from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import { DynamicMix } from '../../../models/DynamicMix';

interface Props {
  mix?: DynamicMix;
  show: boolean;
  exit: () => void;
  hide: () => void;
  refresh: () => void;
}

interface State {
  errors: string[];
}

/**
 * Component for the delete dynamic mix modal.
 */
class DeleteDynamicMixModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      errors: [],
    };
  }

  /**
   * Reset errors
   */
  resetErrors = (): void => {
    this.setState({
      errors: [],
    });
  };

  /**
   * Called when modal hidden without finishing
   */
  onHide = (): void => {
    this.props.hide();
  };

  /**
   * Called when modal finishes exit animation
   */
  onExited = (): void => {
    this.resetErrors();
    this.props.exit();
  };

  /**
   * Called when primary modal button is clicked
   */
  onSubmit = (): void => {
    if (!this.props.mix) {
      return;
    }

    // DELETE request to delete the mix
    const mixId = this.props.mix.id;
    console.log(mixId);

    axios
      .delete(`/api/mix/dynamic/${mixId}/`)
      .then(() => {
        this.props.refresh();
        this.props.hide();
      })
      .catch(({ response }) => {
        const { data } = response;
        this.setState({
          errors: [data.error],
        });
      });
  };

  render(): JSX.Element | null {
    const { errors } = this.state;
    const { show, mix } = this.props;
    if (!mix) {
      return null;
    }

    const extraInfo =
      mix.separator === 'spleeter' ? 'spleeter' : `${mix.separator} with random shift ${mix.random_shifts}`;

    return (
      <Modal show={show} onHide={this.onHide} onExited={this.onExited}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm dynamic mix deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errors.length > 0 && (
            <Alert variant="danger">
              {errors.map((val, idx) => (
                <div key={idx}>{val}</div>
              ))}
            </Alert>
          )}
          <div>
            Are you sure you want to delete the dynamic mix &ldquo;{mix.artist} - {mix.title}&rdquo; ({extraInfo})?
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={this.onHide}>
            Cancel
          </Button>
          <Button variant="danger" onClick={this.onSubmit}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default DeleteDynamicMixModal;
