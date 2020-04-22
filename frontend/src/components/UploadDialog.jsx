import React from 'react';
import { Button, Modal, ProgressBar } from 'react-bootstrap';
import Dropzone from 'react-dropzone-uploader'
import './UploadDialog.css'
import { getDroppedOrSelectedFiles } from 'html5-file-selector'
import { CloudUpload } from 'react-bootstrap-icons';
import CustomPreview from './Dropzone/CustomPreview'
import CustomInput from './Dropzone/CustomInput'

/*
const CustomInput = () => {
  const handleSubmit = (files, allFiles) => {
    console.log(files.map(f => f.meta))
    allFiles.forEach(f => f.remove())
  }

  const getFilesFromEvent = e => {
    return new Promise(resolve => {
      getDroppedOrSelectedFiles(e).then(chosenFiles => {
        resolve(chosenFiles.map(f => f.fileObject))
      })
    })
  }

  return (
    <Dropzone
      maxFiles={1}
      multiple={false}
      accept="image/*,audio/*,video/*,.pdf"
      getUploadParams={() => ({ url: 'https://httpbin.org/post' })}
      InputComponent={Input}
      PreviewComponent={MyPrev}
      getFilesFromEvent={getFilesFromEvent}
    />
  )
}
*/

class UploadDialog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      droppedFile: false,
      isUploading: false
    }
  }

  onUploadComplete() {

  }

  handleChangeStatus = ({ meta, remove }, status) => {
    console.log(status)
    const aborted = status === 'aborted' || status === 'removed' || status === 'rejected_file_type' || status === 'rejected_max_files' || status === 'error_file_size' || status === 'error_validation' || status === 'error_upload_params' || status === 'error_upload'
  
    if (status === 'preparing') {
      this.setState({
        droppedFile: true,
        isUploading: true
      })
    } else if (aborted) {
      this.setState({
        droppedFile: false,
        isUploading: false
      })
    } else if (status === 'headers_received') {
      console.log(`${meta.name} uploaded!`)
      this.setState({
        isUploading: false
      })
    }
  }

  getFilesFromEvent = e => {
    return new Promise(resolve => {
      getDroppedOrSelectedFiles(e).then(chosenFiles => {
        resolve(chosenFiles.map(f => f.fileObject))
      })
    })
  }

  render() {
    const { droppedFile, isUploading } = this.state;
    const { show, close } = this.props;

    return (
      <Modal show={show} onHide={close}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Song</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Dropzone
          maxFiles={1}
          multiple={false}
          accept="image/*,audio/*,video/*,.pdf"
          onChangeStatus={this.handleChangeStatus}
          getUploadParams={() => ({ url: 'https://httpbin.org/post' })}
          InputComponent={CustomInput}
          PreviewComponent={CustomPreview}
        />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={close}>
            Cancel
          </Button>
          <Button variant="success" disabled={!(droppedFile && !isUploading)} onClick={close}>
            Upload
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default UploadDialog;
