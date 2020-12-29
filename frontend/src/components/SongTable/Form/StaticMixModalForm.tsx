import * as React from 'react';
import { Alert, Form } from 'react-bootstrap';
import { MusicPartMap } from '../../../models/MusicParts';
import { SongData } from '../../../models/SongData';
import SeparatorFormGroup from './SeparatorFormGroup';
import SongInfoFormGroup from './SongInfoFormGroup';
import './StaticMixModalForm.css';

interface Props {
  song: SongData;
  allChecked: boolean;
  noneChecked: boolean;
  errors: string[];
  handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleModelChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleRandomShiftsChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

interface State {
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
    const { song, allChecked, noneChecked, errors, handleCheckboxChange, handleRandomShiftsChange } = this.props;

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
          className="mt-3"
          handleModelSelectChange={this.props.handleModelChange}
          handleRandomShiftsChange={handleRandomShiftsChange}
        />
        <Form.Group>
          <Form.Label>Parts to keep:</Form.Label>
          <div className="ml-3">{checkboxes}</div>
        </Form.Group>
        <Form.Group controlId="overwrite-checkbox">
          <Form.Check
            type="checkbox"
            inline
            name="overwrite"
            label="Overwrite existing mix?"
            onChange={handleCheckboxChange}
          />
        </Form.Group>
        {allChecked && <Alert variant="warning">You must leave at least one part unchecked.</Alert>}
        {noneChecked && <Alert variant="warning">You must check at least one part.</Alert>}
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

export default StaticMixModalForm;
