import * as React from 'react';
import { Form } from 'react-bootstrap';
import { SongData } from '../../../models/SongData';
import SeparatorFormGroup from './SeparatorFormGroup';
import SongInfoFormGroup from './SongInfoFormGroup';
import './MixModalForm.css';

interface Props {
  song: SongData;
  handleModelChange: (newModel: string) => void;
  handleRandomShiftsChange: (newRandomShifts: number) => void;
  handleIterationsChange: (newIterations: number) => void;
  handleSoftmaskChange: (newSoftmaskChecked: boolean) => void;
  handleAlphaChange: (newAlpha: number) => void;
  handleOutputFormatChange: (newOutputFormatChange: number) => void;
}

/**
 * Source separation form portion of the modal.
 */
class DynamicMixModalForm extends React.Component<Props> {
  render(): JSX.Element {
    const {
      song,
      handleModelChange,
      handleRandomShiftsChange,
      handleIterationsChange,
      handleSoftmaskChange,
      handleAlphaChange,
      handleOutputFormatChange,
    } = this.props;

    return (
      <Form>
        <SongInfoFormGroup song={song} />
        <SeparatorFormGroup
          className="mt-3"
          handleModelChange={handleModelChange}
          handleRandomShiftsChange={handleRandomShiftsChange}
          handleIterationsChange={handleIterationsChange}
          handleSoftmaskChange={handleSoftmaskChange}
          handleAlphaChange={handleAlphaChange}
          handleOutputFormatChange={handleOutputFormatChange}
        />
      </Form>
    );
  }
}

export default DynamicMixModalForm;
