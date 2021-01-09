import * as React from 'react';
import { Form } from 'react-bootstrap';
import { MusicPartMap } from '../../../models/MusicParts';
import { SongData } from '../../../models/SongData';
import SeparatorFormGroup from './SeparatorFormGroup';
import SongInfoFormGroup from './SongInfoFormGroup';
import './MixModalForm.css';

interface Props {
  song: SongData;
  handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleModelChange: (newModel: string) => void;
  handleRandomShiftsChange: (newRandomShifts: number) => void;
  handleIterationsChange: (newIterations: number) => void;
  handleSoftmaskChange: (newSoftmaskChecked: boolean) => void;
  handleAlphaChange: (newAlpha: number) => void;
  handleBitrateChange: (newBitrate: number) => void;
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

  render(): JSX.Element {
    const {
      song,
      handleModelChange,
      handleCheckboxChange,
      handleRandomShiftsChange,
      handleIterationsChange,
      handleSoftmaskChange,
      handleAlphaChange,
      handleBitrateChange,
    } = this.props;

    // Map part names to checkboxes
    const checkboxes = Array.from(MusicPartMap.keys()).map(
      (key: string): JSX.Element => {
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
      }
    );

    return (
      <Form>
        <SongInfoFormGroup song={song} />
        <SeparatorFormGroup
          className="mt-3 mb-0"
          handleModelChange={handleModelChange}
          handleRandomShiftsChange={handleRandomShiftsChange}
          handleIterationsChange={handleIterationsChange}
          handleSoftmaskChange={handleSoftmaskChange}
          handleAlphaChange={handleAlphaChange}
          handleBitrateChange={handleBitrateChange}
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
