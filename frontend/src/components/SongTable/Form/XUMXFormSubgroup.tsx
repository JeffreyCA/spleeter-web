import * as React from 'react';
import { Col, Form } from 'react-bootstrap';
import { MAX_SOFTMASK_ALPHA, MIN_SOFTMASK_ALPHA } from '../../../Constants';

interface Props {
  alpha: string;
  softmask: boolean;
  onAlphaChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAlphaFocusOut: (event: React.FocusEvent<HTMLInputElement>) => void;
  onSoftmaskChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

class XUMXFormSubgroup extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    const { alpha, onAlphaChange, onAlphaFocusOut, onSoftmaskChange, softmask } = this.props;

    return (
      <Form.Row className="mt-3">
        <Form.Group as={Col} xs={6} className="m-0" controlId="softmask-checkbox">
          <Form.Label id="softmask">Softmask:</Form.Label>
          <Form.Check
            type="checkbox"
            name="softmask"
            label="Use softmask"
            defaultChecked={softmask}
            onChange={onSoftmaskChange}
          />
        </Form.Group>
        {softmask && (
          <Form.Group as={Col} xs={6} className="mb-0" controlId="validationSoftmaskAlpha">
            <Form.Label id="softmask-alpha">Softmask alpha:</Form.Label>
            <Form.Control
              type="number"
              min={MIN_SOFTMASK_ALPHA}
              max={MAX_SOFTMASK_ALPHA}
              step={0.1}
              defaultValue={alpha}
              placeholder="1.0"
              onChange={onAlphaChange}
              onBlur={onAlphaFocusOut}
            />
          </Form.Group>
        )}
      </Form.Row>
    );
  }
}

export default XUMXFormSubgroup;
