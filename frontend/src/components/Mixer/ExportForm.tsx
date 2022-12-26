import * as React from 'react';
import { Col, Form, InputGroup } from 'react-bootstrap';

interface Props {
  defaultName: string;
  mixName: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Dynamic mix export form.
 */
class ExportForm extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    const { defaultName, handleChange } = this.props;
    return (
      <Form>
        <Form.Row>
          <Form.Group as={Col} controlId="mix">
            <Form.Label>Mix name:</Form.Label>
            <Form.Control name="mixName" defaultValue={defaultName} placeholder={defaultName} onChange={handleChange} />
          </Form.Group>
        </Form.Row>
      </Form>
    );
  }
}

export default ExportForm;
