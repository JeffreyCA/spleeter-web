import * as React from 'react';
import { Alert, Col, Form, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { OverlayInjectedProps } from 'react-bootstrap/esm/Overlay';
import { QuestionCircle } from 'react-bootstrap-icons';
import { MusicPartMap } from '../../models/MusicParts';
import { SongData } from '../../models/SongData';
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

  onModelSelectChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({
      selectedModel: event.target.value,
    });
    this.props.handleModelChange(event);
  };

  render(): JSX.Element {
    const { song, allChecked, noneChecked, errors, handleCheckboxChange } = this.props;

    const renderTooltip = (props: OverlayInjectedProps) => {
      return (
        <Tooltip id="status-tooltip" {...props}>
          Number of random shifts for equivariant stabilization. Higher values improve quality at the cost of longer
          processing times.
        </Tooltip>
      );
    };

    const randomShiftsOverlay = (
      <OverlayTrigger placement="right" delay={{ show: 100, hide: 100 }} overlay={renderTooltip}>
        <QuestionCircle className="ml-1" id="random-shifts-question" size={14} />
      </OverlayTrigger>
    );

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
        <Form.Group className="mt-3" controlId="separator">
          <Form.Row>
            <Col xs={6}>
              <Form.Label>Model:</Form.Label>
              <Form.Control as="select" onChange={this.onModelSelectChange}>
                <optgroup label="Spleeter">
                  <option value="spleeter" selected>
                    Spleeter
                  </option>
                </optgroup>
                <optgroup label="Demucs">
                  <option value="demucs">Demucs</option>
                  <option value="demucs_extra">Demucs (extra)</option>
                  <option value="light">Demucs Light</option>
                  <option value="light_extra">Demucs Light (extra)</option>
                  <option value="tasnet">Tasnet</option>
                  <option value="tasnet_extra">Tasnet (extra)</option>
                </optgroup>
              </Form.Control>
            </Col>
            {this.state.selectedModel !== 'spleeter' && (
              <Col xs={6}>
                <Form.Label id="random-shifts">Random shifts: {randomShiftsOverlay}</Form.Label>
                <Form.Control as="select" onChange={this.props.handleRandomShiftsChange}>
                  <option value="0" selected>
                    0 (fastest)
                  </option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10 (slowest)</option>
                </Form.Control>
              </Col>
            )}
          </Form.Row>
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
