import React from 'react'
import { Alert, Button, Modal } from 'react-bootstrap'
import axios from 'axios'
import Dropzone from '@jeffreyca/react-dropzone-uploader'
import CustomPreview from './CustomPreview'
import CustomInput from './CustomInput'
import UploadModalForm from './UploadModalForm'
import { YouTubeLinkField, FetchStatus } from './YouTubeLinkField'
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

function isValidYouTubeLink(link) {
  const re = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/
  return re.test(link)
}

class UploadModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      droppedFile: false,
      fetchingState: FetchStatus.IDLE,
      isUploading: false,
      detailsStep: false,
      fileId: -1,
      artist: '',
      title: '',
      link: '',
      errors: []
    }
  }

  /**
   * Reset all non-error state fields
   */
  resetState = () => {
    this.setState({
      droppedFile: false,
      fetchingState: FetchStatus.IDLE,
      isUploading: false,
      detailsStep: false,
      fileId: -1,
      artist: '',
      title: '',
      link: ''
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

  resetFetchState = () => {
    this.setState({
      fetchingState: FetchStatus.IDLE
    })
  }

  /**
   * Make API request to delete SourceFile from DB and filesystem
   */
  deleteCurrentFile = () => {
    if (this.state.fileId != -1) {
      console.log('Deleted ' + this.state.fileId)
      axios.delete('/api/source-file/', { data: { id: this.state.fileId } })
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
    } else if (this.state.droppedFile) {
      const song = {
        source_id: this.state.fileId,
        artist: this.state.artist,
        title: this.state.title
      }
      // Make request to add Song
      axios
        .post('/api/source-song/', song)
        .then(({ data }) => {
          console.log(data)
          this.props.hide()
          this.props.refresh()
        })
        .catch(err => {
          this.setState({
            errors: [err]
          })
        })
    } else if (this.state.link) {
      const details = {
        youtube_link: this.state.link,
        artist: this.state.artist,
        title: this.state.title
      }
      axios
      .post('/api/source-song/youtube/', details)
      .then(({ data }) => {
        this.props.hide()
        this.props.refresh()
      })
      .catch(({ response }) => {
        const { data } = response
        this.setState({
          errors: data.errors
        })
      })
    }
  }

  handleChangeStatus = ({ meta, remove, xhr }, status) => {
    const aborted =
      status === 'aborted' ||
      status === 'rejected_file_type' ||
      status === 'rejected_max_files' ||
      status === 'error_file_size' ||
      status === 'error_validation' ||
      status === 'error_upload_params'

    if (aborted) {
      // Upload aborted, so reset state and show error message
      const errorMsg = ERROR_MAP[status] ? [ERROR_MAP[status]] : []
      this.resetState()
      this.setState({ errors: errorMsg })
    } else if (status === 'error_upload') {
      // Error with upload, so show error message
      const responseObject = JSON.parse(xhr.response)
      if (responseObject && responseObject['errors']) {
        this.setState({ errors: responseObject['errors'] })
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
        isUploading: true,
        link: ''
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

  handleChange = event => {
    event.preventDefault()
    const { name, value } = event.target
    this.resetErrors()
    this.setState({ [name]: value })

    // YouTube link input was changed
    if (name === 'link') {
      // Clear state if input field was cleared
      if (!value) {
        this.resetFetchState()
      } else if (value && !isValidYouTubeLink(value)) {
        // Invalid link
        this.resetFetchState()
        this.setState({ errors: ['Invalid YouTube link.'] })
      } else {
        // Wait for results from backend
        this.setState({
          fetchingState: FetchStatus.IS_FETCHING
        })

        axios.get('/api/source-file/youtube/', {
          params: {
            link: value
          }
        }).then(({ data }) => {
          const { artist, title } = data
          this.setState({
            fetchingState: FetchStatus.DONE,
            artist: artist,
            title: title
          })
        }).catch(({ response }) => {
          console.log(response)
          const { data } = response
          if (data.status === 'duplicate') {
            this.setState({
              dupeId: data.id,
              fetchingState: FetchStatus.ERROR
            })
          } else {
            this.setState({
              errors: response.data.errors,
              fetchingState: FetchStatus.ERROR
            })
          }
        })
      }
    }
  }

  render() {
    const {
      droppedFile,
      fetchingState,
      isUploading,
      detailsStep,
      artist,
      title,
      link,
      errors
    } = this.state
    const { show } = this.props
    const modalTitle = detailsStep ? 'Fill in the details' : 'Upload song or provide YouTube link'
    const primaryText = detailsStep ? 'Finish' : 'Next'
    var buttonEnabled
    if (!detailsStep) {
      if (droppedFile) {
        buttonEnabled = !isUploading
      } else {
        buttonEnabled = errors.length == 0 && link && fetchingState === FetchStatus.DONE
      }
    } else {
      buttonEnabled = artist && title
    }

    return (
      <Modal show={show} onHide={this.onHide} onExited={this.onExited}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errors.length > 0 && (
            <Alert variant="danger">
              {errors.map((val, idx) => (
                <div key={idx}>{val}</div>
              ))}
            </Alert>
          )}
          {detailsStep ? (
            <UploadModalForm
              artist={artist}
              title={title}
              handleChange={this.handleChange}
            />
          ) : (
            <div>
              <Dropzone
                disabled={link}
                maxFiles={1}
                maxSizeBytes={MAX_FILE_BYTES}
                multiple={false}
                accept=".mp3"
                onChangeStatus={this.handleChangeStatus}
                getUploadParams={() => ({ url: '/api/source-file/' })}
                InputComponent={CustomInput}
                PreviewComponent={CustomPreview}
              />
              <hr className="hr-text" data-content="OR" />
              <YouTubeLinkField fetchingState={fetchingState} disabled={droppedFile} link={link} handleChange={this.handleChange} />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-danger" onClick={this.onHide}>
            Cancel
          </Button>
          <Button
            variant={detailsStep ? 'success' : 'primary'}
            disabled={!buttonEnabled}
            onClick={this.onNext}>
            {primaryText}
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

export default UploadModal
