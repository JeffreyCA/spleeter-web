import * as React from 'react';
import { Alert, Col, Form, Row } from 'react-bootstrap';
import { MusicPartMap } from '../../models/MusicParts';
import { SongData } from '../../models/SongData';
import './StaticMixModalForm.css';

interface Props {
  song: SongData;
  allChecked: boolean;
  noneChecked: boolean;
  errors: string[];
  handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Source separation form portion of the modal.
 */
class StaticMixModalForm extends React.Component<Props> {
  render(): JSX.Element {
    const { song, allChecked, noneChecked, errors, handleCheckboxChange } = this.props;
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
        <Form.Group as={Row} controlId="formGridFirst" className="mb-2">
          <Form.Label column sm="2">
            Title:
          </Form.Label>
          <Col>
            <Form.Control name="title" disabled value={song.title} />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="formGridSecond" className="mb-2">
          <Form.Label column sm="2">
            Artist:
          </Form.Label>
          <Col>
            <Form.Control name="artist" disabled value={song.artist} />
          </Col>
        </Form.Group>
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
