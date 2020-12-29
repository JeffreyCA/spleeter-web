import * as React from 'react';
import { Col, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { QuestionCircle } from 'react-bootstrap-icons';
import { OverlayInjectedProps } from 'react-bootstrap/esm/Overlay';
import { Separator } from '../../../models/Separator';

interface Props {
  className: string;
  handleModelSelectChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleRandomShiftsChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

interface State {
  selectedModel: Separator;
}

/**
 * Source separation form portion of the modal.
 */
class SeparatorFormGroup extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedModel: 'spleeter',
    };
  }

  onModelSelectChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({
      selectedModel: event.target.value as Separator,
    });
    this.props.handleModelSelectChange(event);
  };

  render(): JSX.Element {
    const { selectedModel } = this.state;
    const { className, handleRandomShiftsChange } = this.props;

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

    return (
      <Form.Group className={className} controlId="separator">
        <Form.Row>
          <Col xs={6}>
            <Form.Label>Model:</Form.Label>
            <Form.Control as="select" defaultValue="spleeter" onChange={this.onModelSelectChange}>
              <optgroup label="Spleeter">
                <option value="spleeter">Spleeter</option>
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
          {selectedModel !== 'spleeter' && (
            <Col xs={6}>
              <Form.Label id="random-shifts">Random shifts: {randomShiftsOverlay}</Form.Label>
              <Form.Control as="select" defaultValue="0" onChange={handleRandomShiftsChange}>
                <option value="0">0 (fastest)</option>
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
    );
  }
}

export default SeparatorFormGroup;
