import React from 'react';
import { Alert, Col, Form, Row } from 'react-bootstrap';

class SpleetModalForm extends React.Component {
  constructor(props) {
      super(props)
  }

  render() {
    const { parts, song, showAlert, handleCheckboxChange } = this.props
    const checkboxes = parts.map(part => {
      return (
        <Form.Group key={part} controlId={`${part}-checkbox`} className="mb-0">
          <Form.Check type="checkbox" name={part} label={part} onChange={handleCheckboxChange} />
        </Form.Group>)})

    return (
      <Form>
        <Form.Group as={Row} controlId="formGridFirst" className="mb-2">
          <Form.Label column sm="2">Artist:</Form.Label>
          <Col>
            <Form.Control name="artist" disabled value={song.artist} />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="formGridFirst" className="mb-2">
          <Form.Label column sm="2">Title:</Form.Label>
          <Col>
            <Form.Control name="title" disabled value={song.title} />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="formGridFirst">
          <Form.Label column sm="2">Duration:</Form.Label>
          <Col>
            <Form.Control name="duration" disabled value="10:20"/>
          </Col>
        </Form.Group>
        <Form.Group>
          <Form.Label>Parts to keep:</Form.Label>
          <div className="ml-3">
            {checkboxes}
          </div>
        </Form.Group>
        {showAlert && (
        <Alert variant="warning">
        You must leave at least one part out.
        </Alert>)}
      </Form>
    )
  }
}

export default SpleetModalForm;
