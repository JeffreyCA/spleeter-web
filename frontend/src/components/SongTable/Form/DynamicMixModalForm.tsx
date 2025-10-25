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
      handleOutputFormatChange,
    } = this.props;

    return (
      <Form>
        <SongInfoFormGroup song={song} />
        <SeparatorFormGroup
          className="mt-3"
          handleModelChange={handleModelChange}
          handleRandomShiftsChange={handleRandomShiftsChange}
          handleOutputFormatChange={handleOutputFormatChange}
        />
      </Form>
    );
  }
}

export default DynamicMixModalForm;
