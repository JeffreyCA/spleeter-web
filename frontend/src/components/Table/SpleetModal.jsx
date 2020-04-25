import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import SpleetModalForm from './SpleetModalForm'

const parts = [ 'Vocals', 'Drums', 'Bass', 'Other' ]

class SpleetModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      checkedParts: new Set()
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
  }

  handleCheckboxChange = (event) => {
    const { name, checked } = event.target
    this.setState({ 
      checkedParts: checked ? this.state.checkedParts.add(name) : this.state.checkedParts.delete(name)
    })
  }

  render() {
    const { checkedParts } = this.state
    const { show, song } = this.props
    if (!song) {
      return null
    }
  
    const showAlert = checkedParts.size == parts.length

    return (
      <Modal show={show} onHide={this.onHide} onExited={this.onExited}>
        <Modal.Header closeButton>
        <Modal.Title>Separate Source</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SpleetModalForm parts={parts} song={song} showAlert={showAlert} handleCheckboxChange={this.handleCheckboxChange} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-danger" onClick={this.onHide}>
            Cancel
          </Button>
          <Button variant="primary" disabled={showAlert} onClick={this.onSubmit}>
            Finish
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default SpleetModal;
