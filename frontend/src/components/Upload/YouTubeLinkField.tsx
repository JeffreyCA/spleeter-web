import * as React from 'react';
import { Col, Form, InputGroup, Spinner } from 'react-bootstrap';
import { Check, X } from 'react-bootstrap-icons';
import { YouTubeFetchStatus } from '../../models/YouTubeFetchStatus';
import './YouTubeLinkField.css';

interface Props {
  link: string;
  disabled: boolean;
  fetchStatus: YouTubeFetchStatus;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * YouTube link field.
 */
export class YouTubeLinkField extends React.Component<Props> {
  render(): JSX.Element {
    const { link, disabled, fetchStatus, handleChange } = this.props;
    let appendContent = null;
    if (fetchStatus === YouTubeFetchStatus.IS_FETCHING) {
      appendContent = <Spinner className="ml-2" animation="border" size="sm" role="status" aria-hidden="true" />;
    } else if (fetchStatus === YouTubeFetchStatus.DONE) {
      appendContent = <Check className="ml-2" />;
    } else if (fetchStatus === YouTubeFetchStatus.ERROR) {
      appendContent = <X className="ml-2" />;
    }

    return (
      <Form.Row>
        <Form.Group as={Col} controlId="formGridFirst">
          <Form.Label>YouTube Link</Form.Label>
          <InputGroup>
            <Form.Control
              name="link"
              disabled={disabled}
              value={link}
              placeholder="https://www.youtube.com/watch?v="
              onChange={handleChange}
            />
            <InputGroup.Append className="justify-content-center align-items-center">{appendContent}</InputGroup.Append>
          </InputGroup>
        </Form.Group>
      </Form.Row>
    );
  }
}

export default YouTubeLinkField;
