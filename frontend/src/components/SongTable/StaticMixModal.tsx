import axios from 'axios';
import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { SongData } from '../../models/SongData';
import { StaticMix } from '../../models/StaticMix';
import StaticMixModalForm from './StaticMixModalForm';

interface Props {
  song?: SongData;
  show: boolean;
  hide: () => void;
  exit: () => void;
  refresh: () => void;
  submit: (srcId: string, id: string, status: string) => void;
}

interface State {
  vocals: boolean;
  drums: boolean;
  bass: boolean;
  other: boolean;
  overwrite: boolean;
  errors: string[];
}

/**
 * Component of the source separation modal.
 */
class StaticMixModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      vocals: false, // Include vocals
      drums: false, // Include drums
      bass: false, // Include bass
      other: false, // Include accompaniment
      overwrite: false, // Whether to overwrite existing static mix, if exists
      errors: [],
    };
  }

  /**
   * Reset all non-error state fields
   */
  resetState = (): void => {
    this.setState({
      vocals: false,
      drums: false,
      bass: false,
      other: false,
      overwrite: false,
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
    // Reset here so modal contents do not flicker during animation
    this.resetState();
    this.props.exit();
  };

  /**
   * Called when primary modal button is clicked
   */
  onSubmit = (): void => {
    if (!this.props.song) {
      return;
    }

    const data = {
      source_track: this.props.song.id,
      vocals: this.state.vocals,
      drums: this.state.drums,
      bass: this.state.bass,
      other: this.state.other,
      overwrite: this.state.overwrite,
    };
    // Make request to add Song
    axios
      .post<StaticMix>('/api/mix/static/', data)
      .then(({ data }) => {
        this.props.hide();
        this.props.submit(data.source_track, data.id, data.status);
      })
      .catch(({ response }) => {
        const { data } = response;
        this.setState({
          errors: data.errors,
        });
      });
  };

  handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, checked } = event.target;
    this.setState({ [name]: checked, errors: [] } as any);
  };

  render(): JSX.Element | null {
    const { vocals, drums, bass, other, errors } = this.state;
    const { show, song } = this.props;
    if (!song) {
      return null;
    }

    // Display error if all or no parts are checked
    const allChecked = vocals && drums && bass && other;
    const noneChecked = !(vocals || drums || bass || other);

    return (
      <Modal show={show} onHide={this.onHide} onExited={this.onExited}>
        <Modal.Header closeButton>
          <Modal.Title>Create static mix</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <StaticMixModalForm
            song={song}
            allChecked={allChecked}
            noneChecked={noneChecked}
            errors={errors}
            handleCheckboxChange={this.handleCheckboxChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-danger" onClick={this.onHide}>
            Cancel
          </Button>
          <Button variant="primary" disabled={allChecked || noneChecked} onClick={this.onSubmit}>
            Create Mix
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default StaticMixModal;
