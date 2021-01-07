import * as React from 'react';
import { Form } from 'react-bootstrap';
import { SongData } from '../../../models/SongData';
import SeparatorFormGroup from './SeparatorFormGroup';
import SongInfoFormGroup from './SongInfoFormGroup';
import './StaticMixModalForm.css';

interface Props {
  song: SongData;
  handleModelChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleRandomShiftsChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSoftmaskChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleAlphaChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleBitrateChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
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
      handleSoftmaskChange,
      handleAlphaChange,
      handleBitrateChange,
    } = this.props;

    return (
      <Form>
        <SongInfoFormGroup song={song} />
        <SeparatorFormGroup
          className="mt-3"
          handleModelSelectChange={handleModelChange}
          handleRandomShiftsChange={handleRandomShiftsChange}
          handleSoftmaskChange={handleSoftmaskChange}
          handleAlphaChange={handleAlphaChange}
          handleBitrateChange={handleBitrateChange}
        />
      </Form>
    );
  }
}

export default DynamicMixModalForm;
