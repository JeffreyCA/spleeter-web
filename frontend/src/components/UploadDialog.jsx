import React from 'react';
import { Button, Col, Form, Modal } from 'react-bootstrap';
import axios from 'axios';
import Dropzone from 'react-dropzone-uploader'
import CustomPreview from './Dropzone/CustomPreview'
import CustomInput from './Dropzone/CustomInput'
import './UploadDialog.css'

class UploadDialogForm extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { artist, title, handleChange } = this.props
    return (
      <Form.Row>
        <Form.Group as={Col} controlId="formGridFirst">
            <Form.Label>Artist</Form.Label>
            <Form.Control name="artist" defaultValue={artist} onChange={handleChange}/>
        </Form.Group>

        <Form.Group as={Col} controlId="formGridLast">
            <Form.Label>Title</Form.Label>
            <Form.Control name = "title" defaultValue={title} onChange={handleChange}/>
        </Form.Group>
      </Form.Row>
    )
  }
}

class UploadDialog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      droppedFile: false,
      isUploading: false,
      detailsStep: false,
      fileId: -1,
      artist: '',
      title: ''
    }
  }

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

  deleteCurrentFile = () => {
    if (this.state.fileId != -1) {
      console.log('Deleted ' + this.state.fileId)
      axios.delete('/api/upload/', { data: { id: this.state.fileId } });
    }
  }

  onHide = () => {
    this.deleteCurrentFile()
    this.resetState()
    this.props.close()
  }

  onNext = () => {
    if (!this.state.detailsStep) {
      this.setState({
        detailsStep: true
      })
    } else {
      console.log('Finish song upload')
      console.log('Artist: ' + this.state.artist)
      console.log('Title: ' + this.state.title)
      this.resetState()
      this.props.close()
    }
  }

  handleChangeStatus = ({ meta, remove, xhr }, status) => {
    const aborted = status === 'aborted' || status === 'rejected_file_type' || status === 'rejected_max_files' || status === 'error_file_size' || status === 'error_validation' || status === 'error_upload_params' || status === 'error_upload'

    if (aborted) {
      this.resetState()
    } else if (status === 'removed') {
      this.deleteCurrentFile()
      this.resetState()
    } else if (status === 'preparing') {
      this.setState({
        droppedFile: true,
        isUploading: true
      })
    } else if (status === 'done') {
      const responseObject = JSON.parse(xhr.response)
      if (responseObject['file_id']) {
        this.setState({
          isUploading: false,
          fileId: responseObject['file_id'],
          artist: 'Test Artist',
          title: 'Test Title'
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
    const { droppedFile, isUploading, detailsStep, artist, title } = this.state;
    const { show } = this.props;
    const modalTitle = detailsStep ? 'Fill in the details' : 'Upload song'
    const primaryText = detailsStep ? 'Finish' : 'Next'
    const buttonDisabled = detailsStep ? (!artist && !title) : !(droppedFile && !isUploading);
    
    return (
      <Modal show={show} onHide={this.onHide}>
        <Modal.Header closeButton>
        <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {detailsStep ? <UploadDialogForm artist={artist} title={title} handleChange={this.handleChange} /> : (
          <Dropzone
          maxFiles={1}
          multiple={false}
          accept="audio/*"
          onChangeStatus={this.handleChangeStatus}
          getUploadParams={() => ({ url: '/api/upload/' })}
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

export default UploadDialog;
