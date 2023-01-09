import * as React from 'react';
import { Col, Form, OverlayTrigger, ToggleButton, ToggleButtonGroup, Tooltip } from 'react-bootstrap';
import { QuestionCircle } from 'react-bootstrap-icons';
import { OverlayInjectedProps } from 'react-bootstrap/esm/Overlay';
import {
  DEFAULT_DEMUCS_MODEL,
  DEFAULT_MODEL,
  DEFAULT_MODEL_FAMILY,
  DEFAULT_OUTPUT_FORMAT,
  DEFAULT_SOFTMASK_ALPHA,
  DEFAULT_SPLEETER_MODEL,
  LOSSLESS_OUTPUT_FORMATS,
  LOSSY_OUTPUT_FORMATS,
  MAX_SHIFT_ITER,
  MAX_SOFTMASK_ALPHA,
  MIN_SOFTMASK_ALPHA,
} from '../../../Constants';
import { isDemucsOrTasnet, Separator, SeparatorFamily } from '../../../models/Separator';
import XUMXFormSubgroup from './XUMXFormSubgroup';

interface Props {
  className: string;
  handleModelChange: (newModel: string) => void;
  handleRandomShiftsChange: (newRandomShifts: number) => void;
  handleIterationsChange: (newIterations: number) => void;
  handleSoftmaskChange: (newSoftmaskChecked: boolean) => void;
  handleAlphaChange: (newAlpha: number) => void;
  handleOutputFormatChange: (newOutputFormat: number) => void;
}

interface State {
  /**
   * Selected separation model.
   */
  selectedModel: Separator;
  /**
   * Selected separation model family.
   */
  selectedModelFamily: SeparatorFamily;
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
   * Output format/bitrate.
   */
  output_format: number;
}

/**
 * Source separation form portion of the modal.
 */
class SeparatorFormGroup extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedModel: DEFAULT_MODEL,
      selectedModelFamily: DEFAULT_MODEL_FAMILY,
      shiftIters: 0,
      softmask: false,
      alpha: DEFAULT_SOFTMASK_ALPHA.toString(),
      output_format: DEFAULT_OUTPUT_FORMAT,
    };
  }

  onModelFamilyChange = (modelFamily: SeparatorFamily): void => {
    this.setState({
      selectedModelFamily: modelFamily,
    });
    if (modelFamily === 'd3net' || modelFamily === 'xumx') {
      this.onModelSelectChange(modelFamily);
    } else if (modelFamily === 'spleeter') {
      this.onModelSelectChange(DEFAULT_SPLEETER_MODEL);
    } else if (modelFamily === 'demucs') {
      this.onModelSelectChange(DEFAULT_DEMUCS_MODEL);
    }
  };

  onModelSelectChange = (model: Separator): void => {
    this.setState({
      selectedModel: model,
    });
    this.props.handleModelChange(model);
    if (model === 'xumx') {
      // X-UMX
      this.props.handleIterationsChange(this.state.shiftIters);
    } else if (isDemucsOrTasnet(model)) {
      // Demucs/Tasnet
      this.props.handleRandomShiftsChange(this.state.shiftIters);
    }
  };

  onShiftIterFocusOut = (event: React.FocusEvent<HTMLInputElement>, callback: any): void => {
    // If field is empty or outside of allowable range on focus out, fall back to defaults
    if (!event.target.value || parseInt(event.target.value) > MAX_SHIFT_ITER || parseInt(event.target.value) < 0) {
      event.target.value = '0';
      this.setState({
        shiftIters: 0,
      });
      callback(0);
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
    // If field is empty or outside of allowable range on focus out, fall back to defaults
    if (
      !event.target.value ||
      parseFloat(event.target.value) < MIN_SOFTMASK_ALPHA ||
      parseFloat(event.target.value) > MAX_SOFTMASK_ALPHA
    ) {
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
      output_format: parsedVal,
    });
    this.props.handleOutputFormatChange(parsedVal);
  };

  render(): JSX.Element {
    const { selectedModel, selectedModelFamily, shiftIters, softmask, alpha, output_format: bitrate } = this.state;
    const { className } = this.props;

    // Reuse same components for Demucs's random shifts and X-UMX's EM iterations
    const shiftIterLabel = selectedModelFamily === 'xumx' ? 'Iterations' : 'Random shifts';
    const shiftIterRenderTooltip = (props: OverlayInjectedProps) => {
      // Show different help text for 'random shift' param for X-UMX and Demucs
      const text =
        selectedModelFamily === 'xumx'
          ? 'Number of expectation–maximization steps for refining initial estimates in the post-processing stage.'
          : 'Number of random shifts for equivariant stabilization. Higher values improve quality at the cost of longer processing times.';

      return (
        <Tooltip id="status-tooltip" {...props}>
          {text}
        </Tooltip>
      );
    };
    const shiftIterOverlay = (
      <OverlayTrigger placement="right" delay={{ show: 50, hide: 50 }} overlay={shiftIterRenderTooltip}>
        <QuestionCircle className="ml-1" id="random-shifts-question" size={14} />
      </OverlayTrigger>
    );
    const shiftIterOptions = Array.from(Array(MAX_SHIFT_ITER - 1), (_, i) => i + 1).map((val, _) => (
      <option key={val} value={val}>
        {val}
      </option>
    ));
    const shiftIterOnChange = selectedModelFamily === 'xumx' ? this.onIterationsChange : this.onRandomShiftsChange;
    const shiftIterId = selectedModelFamily === 'xumx' ? 'em-iter' : 'random-shifts';

    const spleeterVariantPicker = (
      <Form.Group className="mt-2 mb-1">
        <Form.Label>Variant:</Form.Label>
        <Form.Row>
          <Col>
            <ToggleButtonGroup type="radio" name="options" value={selectedModel} onChange={this.onModelSelectChange}>
              <ToggleButton id="variant-spleeter" variant="outline-secondary" value="spleeter">
                4-stem
              </ToggleButton>
              <ToggleButton id="variant-spleeterpiano" variant="outline-secondary" value="spleeter_5stems">
                5-stem (with piano)
              </ToggleButton>
            </ToggleButtonGroup>
          </Col>
        </Form.Row>
      </Form.Group>
    );

    const demucsVariantPicker = (
      <Form.Group className="mt-2 mb-1">
        <Form.Label>Variant:</Form.Label>
        <Form.Row>
          <Col>
            <ToggleButtonGroup type="radio" name="options" value={selectedModel} onChange={this.onModelSelectChange}>
              <ToggleButton id="tbg-radio-1" variant="outline-secondary" value="htdemucs">
                v4
              </ToggleButton>
              <ToggleButton id="tbg-radio-2" variant="outline-secondary" value="htdemucs_ft">
                v4 Fine-tuned
              </ToggleButton>
              <ToggleButton id="tbg-radio-3" variant="outline-secondary" value="hdemucs_mmi">
                v3 MMI
              </ToggleButton>
              <ToggleButton id="tbg-radio-4" variant="outline-secondary" value="mdx">
                v3
              </ToggleButton>
              <ToggleButton id="tbg-radio-5" variant="outline-secondary" value="mdx_extra">
                v3 Extra
              </ToggleButton>
              <ToggleButton id="tbg-radio-6" variant="outline-secondary" value="mdx_q">
                v3 Quantized
              </ToggleButton>
              <ToggleButton id="tbg-radio-7" variant="outline-secondary" value="mdx_extra_q">
                v3 Extra Quantized
              </ToggleButton>
            </ToggleButtonGroup>
          </Col>
        </Form.Row>
      </Form.Group>
    );

    return (
      <Form.Group className={className} controlId="separator">
        <Form.Group className="mb-1">
          <Form.Label>Model:</Form.Label>
          <Form.Row>
            <Col>
              <ToggleButtonGroup
                type="radio"
                name="options"
                value={selectedModelFamily}
                onChange={this.onModelFamilyChange}>
                <ToggleButton id="family-spleeter" variant="outline-secondary" value="spleeter">
                  Spleeter
                </ToggleButton>
                <ToggleButton id="family-demucs" variant="outline-secondary" value="demucs">
                  Demucs
                </ToggleButton>
                <ToggleButton id="family-d3net" variant="outline-secondary" value="d3net">
                  D3Net
                </ToggleButton>
                <ToggleButton id="family-xumx" variant="outline-secondary" value="xumx">
                  X-UMX
                </ToggleButton>
              </ToggleButtonGroup>
            </Col>
          </Form.Row>
        </Form.Group>
        {selectedModelFamily === 'spleeter' && spleeterVariantPicker}
        {selectedModelFamily === 'demucs' && demucsVariantPicker}
        {(selectedModelFamily === 'demucs' || selectedModelFamily === 'xumx') && (
          <Form.Group className="mb-0 mt-2">
            <Form.Label id={shiftIterId}>
              {shiftIterLabel}: {shiftIterOverlay}
            </Form.Label>
            <Form.Row>
              <Col xs={6}>
                <Form.Control
                  type="number"
                  min={0}
                  max={MAX_SHIFT_ITER}
                  step={1}
                  defaultValue={shiftIters}
                  placeholder="1"
                  onChange={shiftIterOnChange}
                  onBlur={(e: React.FocusEvent<HTMLInputElement, Element>) =>
                    this.onShiftIterFocusOut(e, shiftIterOnChange)
                  }
                />
              </Col>
            </Form.Row>
          </Form.Group>
        )}
        {selectedModelFamily === 'xumx' && (
          <XUMXFormSubgroup
            alpha={alpha}
            softmask={softmask}
            onAlphaChange={this.onAlphaChange}
            onAlphaFocusOut={this.onAlphaFocusOut}
            onSoftmaskChange={this.onSoftmaskChange}
          />
        )}
        <Form.Row className="mt-2">
          <Col xs={6}>
            <Form.Group className="mb-0" controlId="bitrate-group">
              <Form.Label id="bitrate">Format:</Form.Label>
              <Form.Row>
                <Col>
                  <Form.Control as="select" defaultValue={bitrate} onChange={this.onBitrateChange}>
                    <optgroup label="Lossy">
                      {LOSSY_OUTPUT_FORMATS.map((val, _) => (
                        <option key={val[1]} value={val[0]}>
                          MP3 {val[1]}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Lossless">
                      {LOSSLESS_OUTPUT_FORMATS.map((val, _) => (
                        <option key={val[1]} value={val[0]}>
                          {val[1]}
                        </option>
                      ))}
                    </optgroup>
                  </Form.Control>
                </Col>
              </Form.Row>
            </Form.Group>
          </Col>
        </Form.Row>
      </Form.Group>
    );
  }
}

export default SeparatorFormGroup;
