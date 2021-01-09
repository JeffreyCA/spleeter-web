import axios from 'axios';
import * as React from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import { DEFAULT_MIX_BITRATE, DEFAULT_MODEL, DEFAULT_SOFTMASK_ALPHA } from '../../../Constants';
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
   * Random shifts parameter (Demucs).
   */
  randomShifts: number;
  /**
   * Expectation-maximization algorithm iterations (X-UMX).
   */
  emIterations: number;
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
      emIterations: 1,
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
      emIterations: 1,
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
        iterations: this.state.emIterations,
        softmask: this.state.softmask,
        alpha: this.state.softmask_alpha,
      },
      bitrate: this.state.bitrate,
    };

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

  handleModelChange = (newModel: string): void => {
    this.setState({ model: newModel });
    console.log('Model change:', newModel);
  };

  handleRandomShiftsChange = (newRandomShifts: number): void => {
    this.setState({ randomShifts: newRandomShifts });
    console.log('Rand shift change:', newRandomShifts);
  };

  handleIterationsChange = (newIterations: number): void => {
    this.setState({ emIterations: newIterations });
    console.log('EM iteration change:', newIterations);
  };

  handleSoftmaskChange = (newSoftmaskChecked: boolean): void => {
    // Hide softmask alpha errors if unchecked
    this.setState({ softmask: newSoftmaskChecked });
    console.log('Softmask change:', newSoftmaskChecked);
  };

  handleAlphaChange = (newAlpha: number): void => {
    this.setState({ softmask_alpha: newAlpha });
    console.log('Softmask alpha change:', newAlpha);
  };

  handleBitrateChange = (newBitrate: number): void => {
    this.setState({ bitrate: newBitrate });
    console.log('Bitrate change:', newBitrate);
  };

  render(): JSX.Element | null {
    const { model, softmask, softmask_alpha, errors } = this.state;
    const { show, song } = this.props;
    if (!song) {
      return null;
    }

    const invalidAlpha = model === 'xumx' && softmask && softmask_alpha < 0.0;

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
            handleIterationsChange={this.handleIterationsChange}
            handleSoftmaskChange={this.handleSoftmaskChange}
            handleAlphaChange={this.handleAlphaChange}
            handleBitrateChange={this.handleBitrateChange}
          />
          {invalidAlpha && <Alert variant="danger">Softmask alpha must be greater than 0.</Alert>}
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
