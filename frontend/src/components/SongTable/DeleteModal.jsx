import React from 'react'
import { Alert, Button, Modal } from 'react-bootstrap'
import axios from 'axios'

 /**
  * Component of the delete track modal.
  */
class DeleteModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      errors: []
    }
  }

  /**
   * Reset errors
   */
  resetErrors = () => {
    this.setState({
      errors: []
    })
  }

  /**
   * Called when modal hidden without finishing
   */
  onHide = () => {
    this.props.hide()
  }

  /**
   * Called when modal finishes exit animation
   */
  onExited = () => {
    this.resetErrors()
    this.props.exit()
  }

  /**
   * Called when primary modal button is clicked
   */
  onSubmit = () => {
    // DELETE request to delete the source track.
    const songId = this.props.song.id
    axios
      .delete(`/api/source-track/${songId}/`)
      .then(() => {
        this.props.refresh()
        this.props.hide()
      })
      .catch(({ response }) => {
        const { data } = response
        this.setState({
          errors: [ data.error ]
        })
      })
  }

  render() {
    const { errors } = this.state
    const { show, song } = this.props
    if (!song) {
      return null
    }

    return (
      <Modal show={show} onHide={this.onHide} onExited={this.onExited}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Track Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errors.length > 0 && (
            <Alert variant="danger">
              {errors.map((val, idx) => (
                <div key={idx}>{val}</div>
              ))}
            </Alert>
          )}
          <div>
            Are you sure you want to delete "{song.artist} - {song.title}" and all of its mixes?
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={this.onHide}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={this.onSubmit}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

export default DeleteModal
