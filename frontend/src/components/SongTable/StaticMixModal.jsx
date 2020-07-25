import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import axios from 'axios'
import StaticMixModalForm from './StaticMixModalForm'

/**
 * Mapping of song components from backend-supported keys to user-friendly names.
 */
const PARTS = {
  'vocals': 'Vocals',
  'other': 'Accompaniment',
  'bass': 'Bass',
  'drums': 'Drums'
}
 /**
  * Component of the source separation modal.
  */
class StaticMixModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      vocals: false, // Include vocals
      drums: false, // Include drums
      bass: false, // Include bass
      other: false, // Include accompaniment
      overwrite: false, // Whether to overwrite existing static mix, if exists
      errors: []
    }
  }

  /**
   * Reset all non-error state fields
   */
  resetState = () => {
    this.setState({
      vocals: false,
      drums: false,
      bass: false,
      other: false,
      overwrite: false
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
    // Reset here so modal contents do not flicker during animation
    this.resetState()
    this.props.exit()
  }

  /**
   * Called when primary modal button is clicked
   */
  onSubmit = () => {
    const data = {
      source_track: this.props.song.id,
      vocals: this.state.vocals,
      drums: this.state.drums,
      bass: this.state.bass,
      other: this.state.other,
      overwrite: this.state.overwrite
    }
    // Make request to add Song
    axios
      .post('/api/mix/static/', data)
      .then(({ data }) => {
        this.props.hide()
        this.props.submit(data.source_track, data.id, data.status)
      })
      .catch(({ response }) => {
        const { data } = response
        this.setState({
          errors: data.errors
        })
      })
  }

  handleCheckboxChange = event => {
    const { name, checked } = event.target
    this.setState({ [name]: checked, errors: [] })
  }

  render() {
    const { vocals, drums, bass, other, errors } = this.state
    const { show, song } = this.props
    if (!song) {
      return null
    }

    // Display error if all or no parts are checked
    const allChecked = vocals && drums && bass && other
    const noneChecked = !(vocals || drums || bass || other)

    return (
      <Modal show={show} onHide={this.onHide} onExited={this.onExited}>
        <Modal.Header closeButton>
          <Modal.Title>Create static mix</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <StaticMixModalForm
            parts={PARTS}
            song={song}
            allChecked={allChecked}
            noneChecked={noneChecked}
            errors={errors}
            handleCheckboxChange={this.handleCheckboxChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-danger" onClick={this.onHide}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={allChecked || noneChecked}
            onClick={this.onSubmit}>
            Create Mix
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

export default StaticMixModal
