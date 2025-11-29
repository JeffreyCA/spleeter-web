import * as React from 'react';
import { Col, Form, OverlayTrigger, ToggleButton, ToggleButtonGroup, Tooltip } from 'react-bootstrap';
import { QuestionCircle } from 'react-bootstrap-icons';
import { OverlayInjectedProps } from 'react-bootstrap/esm/Overlay';
import {
  DEFAULT_BS_ROFORMER_MODEL,
  DEFAULT_DEMUCS_MODEL,
  DEFAULT_MODEL,
  DEFAULT_MODEL_FAMILY,
  DEFAULT_OUTPUT_FORMAT,
  DEFAULT_SPLEETER_MODEL,
  LOSSLESS_OUTPUT_FORMATS,
  LOSSY_OUTPUT_FORMATS,
  MAX_RANDOM_SHIFT,
} from '../../../Constants';
import { isDemucsOrTasnet, Separator, SeparatorFamily } from '../../../models/Separator';

interface Props {
  className: string;
  handleModelChange: (newModel: string) => void;
  handleRandomShiftsChange: (newRandomShifts: number) => void;
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
   * Random shifts.
   */
  randomShifts: number;
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
      randomShifts: 0,
      output_format: DEFAULT_OUTPUT_FORMAT,
    };
  }

  onModelFamilyChange = (modelFamily: SeparatorFamily): void => {
    this.setState({
      selectedModelFamily: modelFamily,
    });
    if (modelFamily === 'spleeter') {
      this.onModelSelectChange(DEFAULT_SPLEETER_MODEL);
    } else if (modelFamily === 'demucs') {
      this.onModelSelectChange(DEFAULT_DEMUCS_MODEL);
    } else if (modelFamily === 'bs_roformer') {
      this.onModelSelectChange(DEFAULT_BS_ROFORMER_MODEL);
    }
  };

  onModelSelectChange = (model: Separator): void => {
    this.setState({
      selectedModel: model,
    });
    this.props.handleModelChange(model);
    if (isDemucsOrTasnet(model)) {
      // Demucs/Tasnet
      this.props.handleRandomShiftsChange(this.state.randomShifts);
    }
  };

  onRandomShiftFocusOut = (event: React.FocusEvent<HTMLInputElement>, callback: any): void => {
    // If field is empty or outside of allowable range on focus out, fall back to defaults
    if (!event.target.value || parseInt(event.target.value) > MAX_RANDOM_SHIFT || parseInt(event.target.value) < 0) {
      event.target.value = '0';
      this.setState({
        randomShifts: 0,
      });
      callback(0);
    }
  };

  onRandomShiftsChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const parsedVal = parseInt(event.target.value);
    this.setState({
      randomShifts: parsedVal,
    });
    this.props.handleRandomShiftsChange(parsedVal);
  };

  onBitrateChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const parsedVal = parseInt(event.target.value);
    this.setState({
      output_format: parsedVal,
    });
    this.props.handleOutputFormatChange(parsedVal);
  };

  render(): JSX.Element {
    const { selectedModel, selectedModelFamily, randomShifts, output_format: bitrate } = this.state;
    const { className } = this.props;

    const randomShiftLabel = 'Random shifts';
    const randomShiftRenderTooltip = (props: OverlayInjectedProps) => {
      const text =
        'Number of random shifts for equivariant stabilization. Higher values improve quality at the cost of longer processing times.';
      return (
        <Tooltip id="status-tooltip" {...props}>
          {text}
        </Tooltip>
      );
    };
    const randomShiftOverlay = (
      <OverlayTrigger placement="right" delay={{ show: 50, hide: 50 }} overlay={randomShiftRenderTooltip}>
        <QuestionCircle className="ml-1" id="random-shifts-question" size={14} />
      </OverlayTrigger>
    );
    const randomShiftOnChange = this.onRandomShiftsChange;
    const randomShiftId = 'random-shifts';

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
                5-stem (piano)
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

    const bsRoformerVariantPicker = (
      <Form.Group className="mt-2 mb-1">
        <Form.Label>Variant:</Form.Label>
        <Form.Row>
          <Col>
            <ToggleButtonGroup type="radio" name="options" value={selectedModel} onChange={this.onModelSelectChange}>
              <ToggleButton id="variant-bsroformer-4stem" variant="outline-secondary" value="bs_roformer">
                4-stem
              </ToggleButton>
              <ToggleButton
                id="variant-bsroformer-5stem-guitar"
                variant="outline-secondary"
                value="bs_roformer_5s_guitar">
                5-stem (guitar)
              </ToggleButton>
              <ToggleButton
                id="variant-bsroformer-5stem-piano"
                variant="outline-secondary"
                value="bs_roformer_5s_piano">
                5-stem (piano)
              </ToggleButton>
              <ToggleButton id="variant-bsroformer-6stem" variant="outline-secondary" value="bs_roformer_6s">
                6-stem (guitar + piano)
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
                <ToggleButton id="family-bsroformer" variant="outline-secondary" value="bs_roformer">
                  BS-RoFormer
                </ToggleButton>
                <ToggleButton id="family-spleeter" variant="outline-secondary" value="spleeter">
                  Spleeter
                </ToggleButton>
                <ToggleButton id="family-demucs" variant="outline-secondary" value="demucs">
                  Demucs
                </ToggleButton>
              </ToggleButtonGroup>
            </Col>
          </Form.Row>
        </Form.Group>
        {selectedModelFamily === 'spleeter' && spleeterVariantPicker}
        {selectedModelFamily === 'demucs' && demucsVariantPicker}
        {selectedModelFamily === 'bs_roformer' && bsRoformerVariantPicker}
        {selectedModelFamily === 'demucs' && (
          <Form.Group className="mb-0 mt-2">
            <Form.Label id={randomShiftId}>
              {randomShiftLabel}: {randomShiftOverlay}
            </Form.Label>
            <Form.Row>
              <Col xs={6}>
                <Form.Control
                  type="number"
                  min={0}
                  max={MAX_RANDOM_SHIFT}
                  step={1}
                  defaultValue={randomShifts}
                  placeholder="1"
                  onChange={randomShiftOnChange}
                  onBlur={(e: React.FocusEvent<HTMLInputElement, Element>) =>
                    this.onRandomShiftFocusOut(e, randomShiftOnChange)
                  }
                />
              </Col>
            </Form.Row>
          </Form.Group>
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
