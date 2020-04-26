import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import SpleetModalForm from './SpleetModalForm'
import axios from 'axios';

const PARTS = [ 'vocals', 'drums', 'bass', 'other' ]

class SpleetModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      vocals: false,
      drums: false,
      bass: false,
      other: false,
      errors: []
    }
  }

  /**
   * Reset all non-error state fields
   */
  resetState = () => {
    console.log('reset state')
    this.setState({ checkedParts: new Set() })
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
    console.log(this.props.song)
    const data = {
      source_song: this.props.song.id,
      vocals: this.state.vocals,
      drums: this.state.drums,
      bass: this.state.bass,
      other: this.state.other
    }
    // Make request to add Song
    axios.post('/api/separate/', data)
      .then(({ data }) => {
        this.props.submit(data.id, data.status)
        this.props.hide()
    }).catch(({ response }) => {
      const { data } = response
      if (data['non_field_errors']) {
        this.setState({
          errors: data['non_field_errors']
        })
      }
    })
  }

  handleCheckboxChange = (event) => {
    const { name, checked } = event.target
    this.setState({ [name]: checked, errors: [] });
  }

  render() {
    const { vocals, drums, bass, other, errors } = this.state
    const { show, song } = this.props
    if (!song) {
      return null
    }
  
    const allChecked = vocals && drums && bass && other
    const noneChecked = !(vocals || drums || bass || other)

    return (
      <Modal show={show} onHide={this.onHide} onExited={this.onExited}>
        <Modal.Header closeButton>
        <Modal.Title>Separate Source</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SpleetModalForm parts={PARTS} song={song} allChecked={allChecked} noneChecked={noneChecked} errors={errors} handleCheckboxChange={this.handleCheckboxChange} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-danger" onClick={this.onHide}>
            Cancel
          </Button>
          <Button variant="primary" disabled={allChecked || noneChecked} onClick={this.onSubmit}>
            Finish
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default SpleetModal;
