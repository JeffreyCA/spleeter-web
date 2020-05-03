import React from 'react'
import { Col, InputGroup, Form, Spinner } from 'react-bootstrap'
import { Check, X } from 'react-bootstrap-icons'
import './YouTubeLinkField.css'

export const FetchStatus = {
  IDLE: 0,
  IS_FETCHING: 1,
  DONE: 2,
  ERROR: 3
}

/**
 * YouTube link field.
 */
export class YouTubeLinkField extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { link, disabled, fetchingState, handleChange } = this.props
    var appendContent = null
    if (fetchingState === FetchStatus.IS_FETCHING) {
      appendContent = <Spinner
      className="ml-2"
      animation="border"
      size="sm"
      role="status"
      aria-hidden="true"
      />
    } else if (fetchingState === FetchStatus.DONE) {
      appendContent = <Check className="ml-2" />
    } else if (fetchingState === FetchStatus.ERROR) {
      appendContent = <X className="ml-2" />
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
            <InputGroup.Append className="justify-content-center align-items-center">
              {appendContent}
            </InputGroup.Append>
          </InputGroup>
        </Form.Group>
      </Form.Row>
    )
  }
}

export default YouTubeLinkField
