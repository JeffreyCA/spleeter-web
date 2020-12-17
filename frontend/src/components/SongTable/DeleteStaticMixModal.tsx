/* eslint-disable @typescript-eslint/ban-types */
import * as React from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { StaticMix } from '../../models/StaticMix';

interface Props {
  song?: StaticMix;
  show: boolean;
  exit: () => void;
  hide: () => void;
  refresh: () => void;
}

interface State {
  errors: string[];
}

/**
 * Component of the delete track modal.
 */
class DeleteTrackModal extends React.Component<Props, State> {
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
    if (!this.props.song) {
      return;
    }

    // DELETE request to delete the source track.
    const mixId = this.props.song.id;
    console.log(mixId);

    axios
      .delete(`/api/mix/static/${mixId}/`)
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
    const { show, song } = this.props;
    if (!song) {
      return null;
    }

    let parts: string[] = [];
    if (song.vocals) {
      parts.push('vocals');
    }
    if (song.other) {
      parts.push('accompaniment');
    }
    if (song.bass) {
      parts.push('bass');
    }
    if (song.drums) {
      parts.push('drums');
    }

    const description = parts.join(', ');

    return (
      <Modal show={show} onHide={this.onHide} onExited={this.onExited}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm static mix deletion</Modal.Title>
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
            Are you sure you want to delete the static mix &ldquo;{song.artist} - {song.title}&rdquo; with {description}?
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

export default DeleteTrackModal;
