import * as React from 'react';
import { Col, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { QuestionCircle } from 'react-bootstrap-icons';
import { OverlayInjectedProps } from 'react-bootstrap/esm/Overlay';
import {
  ALL_MIX_BITRATES,
  DEFAULT_MIX_BITRATE,
  DEFAULT_MODEL,
  DEFAULT_SOFTMASK_ALPHA,
  MAX_SHIFT_ITER,
} from '../../../Constants';
import { Separator } from '../../../models/Separator';

interface Props {
  className: string;
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
  selectedModel: Separator;
  /**
   * Random shifts/EM iterations.
   */
  shiftIters: number;
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
      shiftIters: 0,
      softmask: false,
      alpha: DEFAULT_SOFTMASK_ALPHA.toString(),
      bitrate: DEFAULT_MIX_BITRATE,
    };
  }

  onModelSelectChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const parsedVal = event.target.value as Separator;
    this.setState({
      selectedModel: parsedVal,
    });
    this.props.handleModelChange(parsedVal);
    if (parsedVal === 'xumx') {
      // X-UMX
      this.props.handleIterationsChange(this.state.shiftIters);
    } else if (parsedVal !== 'spleeter') {
      // Demucs
      this.props.handleRandomShiftsChange(this.state.shiftIters);
    }
  };

  onRandomShiftsChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const parsedVal = parseInt(event.target.value);
    this.setState({
      shiftIters: parsedVal,
    });
    this.props.handleRandomShiftsChange(parsedVal);
  };

  onIterationsChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const parsedVal = parseInt(event.target.value);
    this.setState({
      shiftIters: parsedVal,
    });
    this.props.handleIterationsChange(parsedVal);
  };

  onSoftmaskChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      softmask: event.target.checked,
    });
    this.props.handleSoftmaskChange(event.target.checked);
  };

  onAlphaFocusOut = (event: React.FocusEvent<HTMLInputElement>): void => {
    // If field is empty on focus out, then fill in with default value
    if (!event.target.value) {
      event.target.value = '1.0';
      this.setState({
        alpha: event.target.value,
      });
      this.props.handleAlphaChange(parseFloat(event.target.value));
    }
  };

  onAlphaChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.value) {
      this.setState({
        alpha: event.target.value,
      });
      this.props.handleAlphaChange(parseFloat(event.target.value));
    }
  };

  onBitrateChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const parsedVal = parseInt(event.target.value);
    this.setState({
      bitrate: parsedVal,
    });
    this.props.handleBitrateChange(parsedVal);
  };

  render(): JSX.Element {
    const { selectedModel, shiftIters, softmask, alpha, bitrate } = this.state;
    const { className } = this.props;

    // Reuse same components for Demucs's random shifts and X-UMX's EM iterations
    const shiftIterLabel = selectedModel === 'xumx' ? 'Iterations' : 'Random shifts';
    const shiftIterRenderTooltip = (props: OverlayInjectedProps) => {
      // Show different help text for 'random shift' param for X-UMX and Demucs
      const text =
        selectedModel === 'xumx'
          ? 'Number of expectation–maximization steps for refining initial estimates in the post-processing stage.'
          : 'Number of random shifts for equivariant stabilization. Higher values improve quality at the cost of longer processing times.';

      return (
        <Tooltip id="status-tooltip" {...props}>
          {text}
        </Tooltip>
      );
    };
    const shiftIterOverlay = (
      <OverlayTrigger placement="right" delay={{ show: 100, hide: 100 }} overlay={shiftIterRenderTooltip}>
        <QuestionCircle className="ml-1" id="random-shifts-question" size={14} />
      </OverlayTrigger>
    );
    const shiftIterOptions = Array.from(Array(MAX_SHIFT_ITER - 1), (_, i) => i + 1).map((val, _) => (
      <option key={val} value={val}>
        {val}
      </option>
    ));
    const shiftIterOnChange = selectedModel === 'xumx' ? this.onIterationsChange : this.onRandomShiftsChange;
    const shiftIterId = selectedModel === 'xumx' ? 'em-iter' : 'random-shifts';

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
              <Form.Label id={shiftIterId}>
                {shiftIterLabel}: {shiftIterOverlay}
              </Form.Label>
              <Form.Control as="select" defaultValue={shiftIters} onChange={shiftIterOnChange}>
                <option value={0}>0 (fastest)</option>
                {shiftIterOptions}
                <option value={MAX_SHIFT_ITER}>{MAX_SHIFT_ITER} (slowest)</option>
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
                  onBlur={this.onAlphaFocusOut}
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
