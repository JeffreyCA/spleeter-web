import * as React from 'react';
import { Col, Form } from 'react-bootstrap';

interface Props {
  artist: string;
  title: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Upload form portion of the modal.
 */
class UploadModalForm extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    const { artist, title, handleChange } = this.props;
    return (
      <Form.Row>
        <Form.Group as={Col} controlId="formGridFirst">
          <Form.Label>Artist</Form.Label>
          <Form.Control name="artist" defaultValue={artist} onChange={handleChange} />
        </Form.Group>

        <Form.Group as={Col} controlId="formGridLast">
          <Form.Label>Title</Form.Label>
          <Form.Control name="title" defaultValue={title} onChange={handleChange} />
        </Form.Group>
      </Form.Row>
    );
  }
}

export default UploadModalForm;
