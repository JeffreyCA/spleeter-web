import * as React from 'react';
import { Form } from 'react-bootstrap';
import { MusicPartMap4, MusicPartMap5Guitar, MusicPartMap5Piano, MusicPartMap6 } from '../../../models/MusicParts';
import { SongData } from '../../../models/SongData';
import SeparatorFormGroup from './SeparatorFormGroup';
import SongInfoFormGroup from './SongInfoFormGroup';
import './MixModalForm.css';

interface Props {
  song: SongData;
  handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleModelChange: (newModel: string) => void;
  handleRandomShiftsChange: (newRandomShifts: number) => void;
  handleOutputFormatChange: (newOutputFormat: number) => void;
}

interface State {
  /**
   * Selected separation model.
   */
  selectedModel: string;
}

/**
 * Source separation form portion of the modal.
 */
class StaticMixModalForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedModel: 'spleeter',
    };
  }

  handleModelChange = (newModel: string): void => {
    this.setState({
      selectedModel: newModel,
    });
    this.props.handleModelChange(newModel);
  };

  getMusicPartMap = (): Map<string, string> => {
    const { selectedModel } = this.state;
    switch (selectedModel) {
      case 'spleeter_5stems':
      case 'bs_roformer_5s_piano':
        return MusicPartMap5Piano;
      case 'bs_roformer_5s_guitar':
        return MusicPartMap5Guitar;
      case 'bs_roformer_6s':
        return MusicPartMap6;
      default:
        return MusicPartMap4;
    }
  };

  render(): JSX.Element {
    const { song, handleCheckboxChange, handleRandomShiftsChange, handleOutputFormatChange } = this.props;
    const MusicPartMap = this.getMusicPartMap();

    // Map part names to checkboxes
    const checkboxes = Array.from(MusicPartMap.keys()).map((key: string): JSX.Element => {
      return (
        <Form.Group key={key} controlId={`${key}-checkbox`} className="mb-0">
          <Form.Check
            type="checkbox"
            name={key}
            label={MusicPartMap.get(key)}
            onChange={handleCheckboxChange}
            className="capitalize"
          />
        </Form.Group>
      );
    });

    return (
      <Form>
        <SongInfoFormGroup song={song} />
        <SeparatorFormGroup
          className="mt-3 mb-0"
          handleModelChange={this.handleModelChange}
          handleRandomShiftsChange={handleRandomShiftsChange}
          handleOutputFormatChange={handleOutputFormatChange}
        />
        <Form.Group className="mt-3">
          <Form.Label>Parts to keep:</Form.Label>
          <div className="ml-3">{checkboxes}</div>
        </Form.Group>
      </Form>
    );
  }
}

export default StaticMixModalForm;
