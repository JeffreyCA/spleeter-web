import axios from 'axios';
import * as React from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import { DEFAULT_MODEL, DEFAULT_OUTPUT_FORMAT } from '../../../Constants';
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
   * Output bitrate.
   */
  outputFormat: number;
  /**
   * Whether currently in process of creating mix.
   */
  isCreating: boolean;
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
      outputFormat: DEFAULT_OUTPUT_FORMAT,
      isCreating: false,
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
      outputFormat: DEFAULT_OUTPUT_FORMAT,
      isCreating: false,
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
      },
      bitrate: this.state.outputFormat,
    };

    this.setState({
      isCreating: true,
    });

    // Make API request to create the mix
    axios
      .post<DynamicMix>('/api/mix/dynamic/', data)
      .then(({ data }) => {
        this.props.hide();
        this.props.submit(data.source_track, data.id);
        this.setState({
          isCreating: false,
        });
      })
      .catch(({ response }) => {
        const { data } = response;
        this.setState({
          isCreating: false,
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

  handleOutputFormatChange = (newOutputFormat: number): void => {
    this.setState({ outputFormat: newOutputFormat });
    console.log('Output format change:', newOutputFormat);
  };

  render(): JSX.Element | null {
    const { isCreating, errors } = this.state;
    const { show, song } = this.props;
    if (!song) {
      return null;
    }

    return (
      <Modal size="lg" show={show} onHide={!isCreating ? this.onHide : undefined} onExited={this.onExited}>
        <Modal.Header closeButton>
          <Modal.Title>Create dynamic mix</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DynamicMixModalForm
            song={song}
            handleModelChange={this.handleModelChange}
            handleRandomShiftsChange={this.handleRandomShiftsChange}
            handleOutputFormatChange={this.handleOutputFormatChange}
          />
          {errors.length > 0 && (
            <Alert variant="danger" className="m-0">
              {errors.map((val, idx) => (
                <div key={idx}>{val}</div>
              ))}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-danger" disabled={isCreating} onClick={this.onHide}>
            Cancel
          </Button>
          <Button variant="primary" onClick={this.onSubmit} disabled={isCreating}>
            Create Mix
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default DynamicMixModal;
