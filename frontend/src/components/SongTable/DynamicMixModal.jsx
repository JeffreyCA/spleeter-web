import React from 'react'
import { Alert, Button, Modal } from 'react-bootstrap'
import axios from 'axios'

 /**
  * Modal for creating dynamic mix.
  */
class DynamicMixModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      errors: []
    }
  }

  /**
   * Called when modal hidden without finishing
   */
  onHide = () => {
    this.props.hide()
    this.props.exit()
  }

  /**
   * Called when primary modal button is clicked
   */
  onSubmit = () => {
    const data = {
      source_track: this.props.song.id,
      overwrite: true
    }
    // Make API request to create the mix
    axios
      .post('/api/mix/dynamic/', data)
      .then(({ data }) => {
        this.props.hide()
        this.props.submit(data.id)
      })
      .catch(({ response }) => {
        const { data } = response
        this.setState({
          errors: data.errors
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
      <Modal show={show} onHide={this.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Create dynamic mix</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to create the mix? This will take a couple of minutes.
          {errors.length > 0 && (
            <Alert variant="danger">
              {errors.map((val, idx) => (
                <div key={idx}>{val}</div>
              ))}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-danger" onClick={this.onHide}>
            Cancel
          </Button>
          <Button variant="success" onClick={this.onSubmit}>
            Create Mix
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

export default DynamicMixModal
