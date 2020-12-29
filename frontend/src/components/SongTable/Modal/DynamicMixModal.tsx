import axios from 'axios';
import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { DynamicMix } from '../../../models/DynamicMix';
import { SongData } from '../../../models/SongData';
import DynamicMixModalForm from '../Form/DynamicMixModalForm';

interface Props {
  song?: SongData;
  show: boolean;
  exit: () => void;
  hide: () => void;
  refresh: () => void;
  submit: (id: string) => void;
}

interface State {
  model: string;
  randomShifts: number;
  errors: string[];
}

/**
 * Modal for creating dynamic mix.
 */
class DynamicMixModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      model: 'spleeter',
      randomShifts: 0,
      errors: [],
    };
  }

  /**
   * Reset all non-error state fields
   */
  resetState = (): void => {
    this.setState({
      model: 'spleeter',
      randomShifts: 0,
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
      random_shifts: this.state.randomShifts,
      overwrite: true,
    };

    // Make API request to create the mix
    axios
      .post<DynamicMix>('/api/mix/dynamic/', data)
      .then(({ data }) => {
        this.props.hide();
        this.props.submit(data.id);
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
    console.log('model change:', value);
  };

  handleRandomShiftsChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const { value } = event.target;
    this.setState({ randomShifts: parseInt(value) });
    console.log('rand shift change:', parseInt(value));
  };

  render(): JSX.Element | null {
    const { errors } = this.state;
    const { show, song } = this.props;
    if (!song) {
      return null;
    }

    return (
      <Modal show={show} onHide={this.onHide} onExited={this.onExited}>
        <Modal.Header closeButton>
          <Modal.Title>Create dynamic mix</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DynamicMixModalForm
            song={song}
            errors={errors}
            handleModelChange={this.handleModelChange}
            handleRandomShiftsChange={this.handleRandomShiftsChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-danger" onClick={this.onHide}>
            Cancel
          </Button>
          <Button variant="success" onClick={this.onSubmit}>
            Create Mix
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default DynamicMixModal;
