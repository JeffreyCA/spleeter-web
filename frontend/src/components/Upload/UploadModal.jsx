import React from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import Dropzone from '@jeffreyca/react-dropzone-uploader'
import CustomPreview from './CustomPreview'
import CustomInput from './CustomInput'
import UploadModalForm from './UploadModalForm'
import './UploadModal.css'

// This value is the same on the server-side (settings.py)
const MAX_FILE_BYTES = 30 * 1024 * 1024

const ERROR_MAP = {
  'aborted': 'Operation aborted.',
  'rejected_file_type': 'File type not supported.',
  'rejected_max_files': 'Only one file is allowed.',
  'error_file_size': 'File exceeds size limit (30 MB).',
  'error_upload_params': 'Unknown error occurred.'
}

class UploadModal extends React.Component {
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
      axios.delete('/api/source-file/', { data: { id: this.state.fileId } });
    }
  }

  /**
   * Called when modal hidden without finishing
   */
  onHide = () => {
    this.deleteCurrentFile()
    this.props.hide()
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
    if (!this.state.detailsStep) {
      this.setState({
        detailsStep: true
      })
    } else {
      const song = {
        source_id: this.state.fileId,
        artist: this.state.artist,
        title: this.state.title
      }
      // Make request to add Song
      axios.post('/api/source-song/', song)
        .then(({ data }) => {
          console.log(data)
          this.props.hide()
          this.props.refresh()
      }).catch(err => {
        this.setState({
          errors: [err]
        })
      })
    }
  }

  handleChangeStatus = ({ meta, remove, xhr }, status) => {
    const aborted = status === 'aborted' || status === 'rejected_file_type' || status === 'rejected_max_files' || status === 'error_file_size' || status === 'error_validation' || status === 'error_upload_params'
    console.log('status change: ' + status)

    if (aborted) {
      // Upload aborted, so reset state and show error message
      const errorMsg = ERROR_MAP[status] ? [ERROR_MAP[status]] : []
      this.resetState()
      this.setState({ errors: errorMsg })
    } else if (status === 'error_upload') {
      // Error with upload, so show error message
      const responseObject = JSON.parse(xhr.response)
      if (responseObject && responseObject['file']) {
        this.setState({ errors: responseObject['file'] })
      }
    } else if (status === 'removed') {
      // File was removed
      this.deleteCurrentFile()
      this.resetState()
      this.resetErrors()
    } else if (status === 'preparing') {
      // File upload initiated
      this.resetErrors()
      this.setState({
        droppedFile: true,
        isUploading: true
      })
    } else if (status === 'done') {
      // File upload completed successfully, get returned ID and metadata info
      const responseObject = JSON.parse(xhr.response)
      if (responseObject['file_id']) {
        this.setState({
          isUploading: false,
          fileId: responseObject['file_id'],
          artist: responseObject['artist'],
          title: responseObject['title']
        })
      }
    }
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
        <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {errors.length > 0 && (
        <Alert variant="danger">
          {errors.map((val, idx) => (<div key={idx}>{val}</div>))}
        </Alert>)}
        {detailsStep ? <UploadModalForm artist={artist} title={title} handleChange={this.handleChange} /> : (
          <Dropzone
          maxFiles={1}
          maxSizeBytes={MAX_FILE_BYTES}
          multiple={false}
          accept=".mp3"
          onChangeStatus={this.handleChangeStatus}
          getUploadParams={() => ({ url: '/api/source-file/' })}
          InputComponent={CustomInput}
          PreviewComponent={CustomPreview} />
        )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-danger" onClick={this.onHide}>
            Cancel
          </Button>
          <Button variant={detailsStep ? "success" : "primary"} disabled={buttonDisabled} onClick={this.onNext}>
            {primaryText}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default UploadModal;
