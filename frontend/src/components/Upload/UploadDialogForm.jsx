import React from 'react';
import { Col, Form } from 'react-bootstrap';
import './UploadDialog.css'

class UploadDialogForm extends React.Component {
  constructor(props) {
      super(props)
  }

  render() {
      const { artist, title, handleChange } = this.props
      return (
      <Form.Row>
          <Form.Group as={Col} controlId="formGridFirst">
              <Form.Label>Artist</Form.Label>
              <Form.Control name="artist" defaultValue={artist} onChange={handleChange}/>
          </Form.Group>

          <Form.Group as={Col} controlId="formGridLast">
              <Form.Label>Title</Form.Label>
              <Form.Control name = "title" defaultValue={title} onChange={handleChange}/>
          </Form.Group>
      </Form.Row>
      )
  }
}

export default UploadDialogForm;
