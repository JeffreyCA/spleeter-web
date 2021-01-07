import axios from 'axios';
import * as React from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import {
  DEFAULT_MIX_BITRATE,
  DEFAULT_MODEL,
  DEFAULT_SOFTMASK_ALPHA,
  MAX_SOFTMASK_ALPHA,
  MIN_SOFTMASK_ALPHA,
} from '../../../Constants';
import { DynamicMix } from '../../../models/DynamicMix';
import { SongData } from '../../../models/SongData';
import DynamicMixModalForm from '../Form/DynamicMixModalForm';

interface Props {
  song?: SongData;
  show: boolean;
  exit: () => void;
  hide: () => void;
  refresh: () => void;
  submit: (srcId: string, id: string) => void;
}

interface State {
  /**
   * Separator model.
   */
  model: string;
  /**
   * Random shifts/iterations parameter (for Demucs/X-UMX).
   */
  randomShifts: number;
  /**
   * Whether to use softmask (X-UMX)
   */
  softmask: boolean;
  /**
   * Alpha value for softmask (X-UMX)
   */
  softmask_alpha: number;
  /**
   * Output bitrate.
   */
  bitrate: number;
  /**
   * Errors.
   */
  errors: string[];
}

/**
 * Modal for creating dynamic mix.
 */
class DynamicMixModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      model: DEFAULT_MODEL,
      randomShifts: 0,
      softmask: false,
      softmask_alpha: DEFAULT_SOFTMASK_ALPHA,
      bitrate: DEFAULT_MIX_BITRATE,
      errors: [],
    };
  }

  /**
   * Reset all non-error state fields
   */
  resetState = (): void => {
    this.setState({
      model: DEFAULT_MODEL,
      randomShifts: 0,
      softmask: false,
      softmask_alpha: DEFAULT_SOFTMASK_ALPHA,
      bitrate: DEFAULT_MIX_BITRATE,
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
      separator: this.state.model,
      separator_args: {
        random_shifts: this.state.randomShifts,
        softmask: this.state.softmask,
        alpha: this.state.softmask_alpha,
      },
      bitrate: this.state.bitrate,
      overwrite: true,
    };

    console.log(data);

    // Make API request to create the mix
    axios
      .post<DynamicMix>('/api/mix/dynamic/', data)
      .then(({ data }) => {
        this.props.hide();
        this.props.submit(data.source_track, data.id);
      })
      .catch(({ response }) => {
        const { data } = response;
        this.setState({
          errors: data.errors,
        });
      });
  };

  handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const { value } = event.target;
    this.setState({ model: value });
    console.log('Model change:', value);
  };

  handleRandomShiftsChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const { value } = event.target;
    this.setState({ randomShifts: parseInt(value) });
    console.log('Rand shift change:', parseInt(value));
  };

  handleSoftmaskChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { checked } = event.target;
    // Hide softmask alpha errors if unchecked
    this.setState({ softmask: checked });
    console.log('Softmask change:', checked);
  };

  handleAlphaChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    this.setState({ softmask_alpha: parseFloat(value) });
    console.log('Softmask alpha change:', parseFloat(value));
  };

  handleBitrateChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const { value } = event.target;
    this.setState({ bitrate: parseInt(value) });
    console.log('Bitrate change:', parseInt(value));
  };

  render(): JSX.Element | null {
    const { model, softmask, softmask_alpha, errors } = this.state;
    const { show, song } = this.props;
    if (!song) {
      return null;
    }

    const invalidAlpha =
      model === 'xumx' && softmask && (softmask_alpha < MIN_SOFTMASK_ALPHA || softmask_alpha > MAX_SOFTMASK_ALPHA);

    return (
      <Modal show={show} onHide={this.onHide} onExited={this.onExited}>
        <Modal.Header closeButton>
          <Modal.Title>Create dynamic mix</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DynamicMixModalForm
            song={song}
            handleModelChange={this.handleModelChange}
            handleRandomShiftsChange={this.handleRandomShiftsChange}
            handleSoftmaskChange={this.handleSoftmaskChange}
            handleAlphaChange={this.handleAlphaChange}
            handleBitrateChange={this.handleBitrateChange}
          />
          {invalidAlpha && (
            <Alert variant="danger">
              Softmask alpha must be between {MIN_SOFTMASK_ALPHA} and {MAX_SOFTMASK_ALPHA}.
            </Alert>
          )}
          {errors.length > 0 && (
            <Alert variant="danger" className="m-0">
              {errors.map((val, idx) => (
                <div key={idx}>{val}</div>
              ))}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-danger" onClick={this.onHide}>
            Cancel
          </Button>
          <Button variant="success" onClick={this.onSubmit} disabled={invalidAlpha}>
            Create Mix
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default DynamicMixModal;
