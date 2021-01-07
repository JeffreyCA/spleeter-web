import * as React from 'react';
import { Col, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { QuestionCircle } from 'react-bootstrap-icons';
import { OverlayInjectedProps } from 'react-bootstrap/esm/Overlay';
import { ALL_MIX_BITRATES, DEFAULT_MIX_BITRATE, DEFAULT_MODEL, DEFAULT_SOFTMASK_ALPHA } from '../../../Constants';
import { Separator } from '../../../models/Separator';

interface Props {
  className: string;
  handleModelSelectChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleRandomShiftsChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSoftmaskChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleAlphaChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleBitrateChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

interface State {
  /**
   * Selected separation model.
   */
  selectedModel: Separator;
  /**
   * Random shifts/iterations.
   */
  randomShifts: number;
  /**
   * Whether to use softmask.
   */
  softmask: boolean;
  /**
   * Softmask alpha.
   */
  alpha: string;
  /**
   * Output bitrate.
   */
  bitrate: number;
}

/**
 * Source separation form portion of the modal.
 */
class SeparatorFormGroup extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedModel: DEFAULT_MODEL,
      randomShifts: 0,
      softmask: false,
      alpha: DEFAULT_SOFTMASK_ALPHA.toString(),
      bitrate: DEFAULT_MIX_BITRATE,
    };
  }

  onModelSelectChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({
      selectedModel: event.target.value as Separator,
    });
    this.props.handleModelSelectChange(event);
  };

  onRandomShiftsChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({
      randomShifts: parseInt(event.target.value),
    });
    this.props.handleRandomShiftsChange(event);
  };

  onSoftmaskChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      softmask: event.target.checked,
    });
    this.props.handleSoftmaskChange(event);
  };

  onAlphaChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (!event.target.value) {
      event.target.value = '1.0';
    }
    this.setState({
      alpha: event.target.value,
    });
    this.props.handleAlphaChange(event);
  };

  onBitrateChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({
      bitrate: parseInt(event.target.value),
    });
    this.props.handleBitrateChange(event);
  };

  render(): JSX.Element {
    const { selectedModel, randomShifts, softmask, alpha, bitrate } = this.state;
    const { className } = this.props;

    const randomShiftsLabel = selectedModel === 'xumx' ? 'Iterations' : 'Random shifts';
    const renderTooltip = (props: OverlayInjectedProps) => {
      // Show different help text for 'random shift' param for X-UMX and Demucs
      const text =
        selectedModel === 'xumx'
          ? 'Number of EM steps for refining initial estimates in the post-processing stage.'
          : 'Number of random shifts for equivariant stabilization. Higher values improve quality at the cost of longer processing times.';

      return (
        <Tooltip id="status-tooltip" {...props}>
          {text}
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
          <Form.Group as={Col} xs={6} className="mb-0">
            <Form.Label>Model:</Form.Label>
            <Form.Control as="select" defaultValue="spleeter" onChange={this.onModelSelectChange}>
              <optgroup label="Spleeter">
                <option value="spleeter">Spleeter</option>
              </optgroup>
              <optgroup label="Open-Unmix">
                <option value="xumx">X-UMX (GPU-only)</option>
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
          </Form.Group>
          {selectedModel !== 'spleeter' && (
            <Form.Group as={Col} xs={6} className="mb-0">
              <Form.Label id="random-shifts">
                {randomShiftsLabel}: {randomShiftsOverlay}
              </Form.Label>
              <Form.Control as="select" defaultValue={randomShifts} onChange={this.onRandomShiftsChange}>
                <option value={0}>0 (fastest)</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
                <option value={7}>7</option>
                <option value={8}>8</option>
                <option value={9}>9</option>
                <option value={10}>10 (slowest)</option>
              </Form.Control>
            </Form.Group>
          )}
        </Form.Row>
        {selectedModel === 'xumx' && (
          <Form.Row className="mt-3">
            <Form.Group as={Col} xs={6} className="m-0" controlId="softmask-checkbox">
              <Form.Label id="softmask">Softmask:</Form.Label>
              <Form.Check
                type="checkbox"
                name="softmask"
                label="Use softmask"
                defaultChecked={softmask}
                onChange={this.onSoftmaskChange}
              />
            </Form.Group>
            {selectedModel === 'xumx' && softmask && (
              <Form.Group as={Col} xs={6} className="mb-0" controlId="validationSoftmaskAlpha">
                <Form.Label id="softmask-alpha">Softmask alpha:</Form.Label>
                <Form.Control
                  type="number"
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  defaultValue={alpha}
                  placeholder="1.0"
                  onChange={this.onAlphaChange}
                />
              </Form.Group>
            )}
          </Form.Row>
        )}
        <Form.Row className="mt-3">
          <Col xs={6}>
            <Form.Group className="mb-0" controlId="bitrate-group">
              <Form.Label id="bitrate">Bitrate:</Form.Label>
              <Form.Control as="select" defaultValue={bitrate} onChange={this.onBitrateChange}>
                <optgroup label="MP3 CBR">
                  {ALL_MIX_BITRATES.map((val, idx) => (
                    <option key={idx} value={val}>
                      {val} kbps
                    </option>
                  ))}
                </optgroup>
              </Form.Control>
            </Form.Group>
          </Col>
        </Form.Row>
      </Form.Group>
    );
  }
}

export default SeparatorFormGroup;
