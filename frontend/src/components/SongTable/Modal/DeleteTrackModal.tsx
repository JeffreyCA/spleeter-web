/* eslint-disable @typescript-eslint/ban-types */
import * as React from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { SongData } from '../../../models/SongData';

interface Props {
  song?: SongData;
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
 * Component for the delete track modal.
 */
class DeleteTrackModal extends React.Component<Props, State> {
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
    if (!this.props.song) {
      return;
    }

    this.setState({
      isDeleting: true,
    });

    // DELETE request to delete the source track.
    const songId = this.props.song.id;
    axios
      .delete(`/api/source-track/${songId}/`)
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
    const { show, song } = this.props;
    if (!song) {
      return null;
    }

    return (
      <Modal show={show} onHide={!isDeleting ? this.onHide : undefined} onExited={this.onExited}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm track deletion</Modal.Title>
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
            Are you sure you want to delete &ldquo;{song.artist} - {song.title}&rdquo; and all of its mixes?
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" disabled={isDeleting} onClick={this.onHide}>
            Cancel
          </Button>
          <Button variant="danger" disabled={isDeleting} onClick={this.onSubmit}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default DeleteTrackModal;
