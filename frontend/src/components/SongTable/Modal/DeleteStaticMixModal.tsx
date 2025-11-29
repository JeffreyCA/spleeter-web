import axios from 'axios';
import * as React from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import { StaticMix } from '../../../models/StaticMix';

interface Props {
  mix?: StaticMix;
  show: boolean;
  exit: () => void;
  hide: () => void;
  refresh: () => void;
}

interface State {
  isDeleting: boolean;
  errors: string[];
}

/**
 * Component for the delete static mix modal.
 */
class DeleteStaticMixModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isDeleting: false,
      errors: [],
    };
  }

  /**
   * Reset errors
   */
  resetErrors = (): void => {
    this.setState({
      isDeleting: false,
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

    // DELETE request to delete the source track.
    const mixId = this.props.mix.id;
    console.log(mixId);

    this.setState({
      isDeleting: true,
    });

    axios
      .delete(`/api/mix/static/${mixId}/`)
      .then(() => {
        this.props.refresh();
        this.props.hide();
        this.setState({
          isDeleting: false,
        });
      })
      .catch(({ response }) => {
        const { data } = response;
        this.setState({
          isDeleting: false,
          errors: [data.error],
        });
      });
  };

  render(): JSX.Element | null {
    const { isDeleting, errors } = this.state;
    const { show, mix } = this.props;
    if (!mix) {
      return null;
    }

    const parts: string[] = [];
    if (mix.vocals) {
      parts.push('vocals');
    }
    if (mix.other) {
      parts.push('accompaniment');
    }
    if (mix.bass) {
      parts.push('bass');
    }
    if (mix.drums) {
      parts.push('drums');
    }
    if (mix.piano) {
      parts.push('piano');
    }
    if (mix.guitar) {
      parts.push('guitar');
    }

    const description = parts.join(', ');

    return (
      <Modal show={show} onHide={!isDeleting ? this.onHide : undefined} onExited={this.onExited}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm static mix deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <div>Functionality disabled for demo purposes.</div>
          </Alert>
          <div>
            Are you sure you want to delete the static mix &ldquo;{mix.artist} - {mix.title}&rdquo; with {description}?
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" disabled={isDeleting} onClick={this.onHide}>
            Cancel
          </Button>
          <Button variant="danger" disabled>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default DeleteStaticMixModal;
