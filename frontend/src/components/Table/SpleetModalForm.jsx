import React from 'react';
import { Alert, Col, Form, Row } from 'react-bootstrap';
import './SpleetModalForm.css'

class SpleetModalForm extends React.Component {
  constructor(props) {
      super(props)
  }

  render() {
    const { parts, song, allChecked, noneChecked, errors, handleCheckboxChange } = this.props
    const checkboxes = parts.map(part => {
      return (
        <Form.Group key={part} controlId={`${part}-checkbox`} className="mb-0">
          <Form.Check type="checkbox" name={part} label={part} onChange={handleCheckboxChange} className="capitalize" />
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
        <Form.Group controlId="overwrite-checkbox">
            <Form.Check type="checkbox" inline name="overwrite" label="Overwrite if exists?" onChange={handleCheckboxChange} />
          </Form.Group>
        {allChecked && (
        <Alert variant="warning">
        You must leave at least one part unchecked.
        </Alert>)}
        {noneChecked && (
        <Alert variant="warning">
        You must check at least one part.
        </Alert>)}
        {errors.length > 0 && (
        <Alert variant="danger">
        {errors.map((val, idx) => (<div key={idx}>{val}</div>))}
        </Alert>)}
      </Form>
    )
  }
}

export default SpleetModalForm;
