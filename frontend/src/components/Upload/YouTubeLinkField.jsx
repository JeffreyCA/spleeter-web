import React from 'react'
import { Col, Form } from 'react-bootstrap'

/**
 * YouTube link field.
 */
class YouTubeLinkField extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { link, disabled, handleChange } = this.props
    return (
      <Form.Row>
        <Form.Group as={Col} controlId="formGridFirst">
          <Form.Label>YouTube Link</Form.Label>
          <Form.Control
            name="link"
            disabled={disabled}
            value={link}
            placeholder="https://www.youtube.com/watch?v="
            onChange={handleChange}
          />
        </Form.Group>
      </Form.Row>
    )
  }
}

export default YouTubeLinkField
