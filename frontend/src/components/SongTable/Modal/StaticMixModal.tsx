import axios from 'axios';
import * as React from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import { DEFAULT_MIX_BITRATE, DEFAULT_MODEL, DEFAULT_SOFTMASK_ALPHA } from '../../../Constants';
import { SongData } from '../../../models/SongData';
import { StaticMix } from '../../../models/StaticMix';
import StaticMixModalForm from '../Form/StaticMixModalForm';

interface Props {
  song?: SongData;
  show: boolean;
  hide: () => void;
  exit: () => void;
  refresh: () => void;
  submit: (srcId: string, id: string, status: string) => void;
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
   * Whether to include vocals.
   */
  vocals: boolean;
  /**
   * Whether to include drums.
   */
  drums: boolean;
  /**
   * Whether to include bass.
   */
  bass: boolean;
  /**
   * Whether to include accompaniment.
   */
  other: boolean;
  /**
   * Whether to overwrite existing mix.
   */
  overwrite: boolean;
  /**
   * Errors.
   */
  errors: string[];
}

/**
 * Component for the source separation modal.
 */
class StaticMixModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      model: DEFAULT_MODEL,
      randomShifts: 0,
      emIterations: 1,
      softmask: false,
      softmask_alpha: DEFAULT_SOFTMASK_ALPHA,
      bitrate: DEFAULT_MIX_BITRATE,
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
      model: DEFAULT_MODEL,
      randomShifts: 0,
      emIterations: 1,
      softmask: false,
      softmask_alpha: DEFAULT_SOFTMASK_ALPHA,
      bitrate: DEFAULT_MIX_BITRATE,
      vocals: false,
      drums: false,
      bass: false,
      other: false,
      overwrite: false,
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
      vocals: this.state.vocals,
      drums: this.state.drums,
      bass: this.state.bass,
      other: this.state.other,
      overwrite: this.state.overwrite,
    };

    console.log(data);

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
    const { model, vocals, drums, bass, other, errors, softmask, softmask_alpha } = this.state;
    const { show, song } = this.props;
    if (!song) {
      return null;
    }

    // Display error if all or no parts are checked
    const allChecked = vocals && drums && bass && other;
    const noneChecked = !(vocals || drums || bass || other);
    const invalidAlpha = model === 'xumx' && softmask && softmask_alpha < 0;

    return (
      <Modal show={show} onHide={this.onHide} onExited={this.onExited}>
        <Modal.Header closeButton>
          <Modal.Title>Create static mix</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <StaticMixModalForm
            song={song}
            handleCheckboxChange={this.handleCheckboxChange}
            handleModelChange={this.handleModelChange}
            handleRandomShiftsChange={this.handleRandomShiftsChange}
            handleIterationsChange={this.handleIterationsChange}
            handleSoftmaskChange={this.handleSoftmaskChange}
            handleAlphaChange={this.handleAlphaChange}
            handleBitrateChange={this.handleBitrateChange}
          />
          {allChecked && <Alert variant="warning">You must leave at least one part unchecked.</Alert>}
          {noneChecked && <Alert variant="warning">You must check at least one part.</Alert>}
          {invalidAlpha && <Alert variant="danger">Softmask alpha must be greater than 0.</Alert>}
          {errors.length > 0 && (
            <Alert variant="danger">
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
          <Button variant="primary" disabled={allChecked || noneChecked || invalidAlpha} onClick={this.onSubmit}>
            Create Mix
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default StaticMixModal;
