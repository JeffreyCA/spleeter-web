import * as React from 'react';
import { Alert, Form } from 'react-bootstrap';
import { SongData } from '../../../models/SongData';
import SeparatorFormGroup from './SeparatorFormGroup';
import SongInfoFormGroup from './SongInfoFormGroup';
import './StaticMixModalForm.css';

interface Props {
  song: SongData;
  errors: string[];
  handleModelChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleRandomShiftsChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

interface State {
  selectedModel: string;
}

/**
 * Source separation form portion of the modal.
 */
class DynamicMixModalForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedModel: 'spleeter',
    };
  }

  render(): JSX.Element {
    const { song, errors, handleModelChange, handleRandomShiftsChange } = this.props;

    return (
      <Form>
        <SongInfoFormGroup song={song} />
        <SeparatorFormGroup
          className="mt-3"
          handleModelSelectChange={handleModelChange}
          handleRandomShiftsChange={handleRandomShiftsChange}
        />
        {errors.length > 0 && (
          <Alert variant="danger">
            {errors.map((val, idx) => (
              <div key={idx}>{val}</div>
            ))}
          </Alert>
        )}
      </Form>
    );
  }
}

export default DynamicMixModalForm;
