import React from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import axios from 'axios';

// This value is the same on the server-side (settings.py)
const MAX_FILE_BYTES = 30 * 1024 * 1024

const ERROR_MAP = {
  'aborted': 'Operation aborted.',
  'rejected_file_type': 'File type not supported.',
  'rejected_max_files': 'Only one file is allowed.',
  'error_file_size': 'File exceeds size limit (30 MB).',
  'error_upload_params': 'Unknown error occurred.'
}

class SpleetModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      droppedFile: false,
      isUploading: false,
      detailsStep: false,
      fileId: -1,
      artist: '',
      title: '',
      errors: []
    }
  }

  /**
   * Reset all non-error state fields
   */
  resetState = () => {
    this.setState({
      droppedFile: false,
      isUploading: false,
      detailsStep: false,
      fileId: -1,
      artist: '',
      title: ''
    })
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
   * Make API request to delete SourceFile from DB and filesystem
   */
  deleteCurrentFile = () => {
    if (this.state.fileId != -1) {
      console.log('Deleted ' + this.state.fileId)
      axios.delete('/api/upload/', { data: { id: this.state.fileId } });
    }
  }

  /**
   * Called when modal hidden without finishing
   */
  onHide = () => {
    this.deleteCurrentFile()
    this.props.close()
  }

  /**
   * Called when modal finishes exit animation
   */
  onExited = () => {
    // Reset here so modal contents do not flicker during animation
    this.resetState()
    this.resetErrors()
  }

  /**
   * Called when primary modal button is clicked
   */
  onNext = () => {
    
  }

  handleChangeStatus = ({ meta, remove, xhr }, status) => {
    
  }

  handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  render() {
    const { droppedFile, isUploading, detailsStep, artist, title, errors } = this.state;
    const { show } = this.props;
    const modalTitle = detailsStep ? 'Fill in the details' : 'Upload song'
    const primaryText = detailsStep ? 'Finish' : 'Next'
    const buttonDisabled = detailsStep ? !(artist && title) : !(droppedFile && !isUploading);
    
    return (
      <Modal show={show} onHide={this.onHide} onExited={this.onExited}>
        <Modal.Header closeButton>
        <Modal.Title>Spleet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {errors.length > 0 && (
        <Alert variant="danger">
          {errors.map((val, idx) => (<div key={idx}>{val}</div>))}
        </Alert>)}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-danger" onClick={this.onHide}>
            Cancel
          </Button>
          <Button variant="primary" disabled={buttonDisabled} onClick={this.onNext}>
            Finish
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default SpleetModal;
