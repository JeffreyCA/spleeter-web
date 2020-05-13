import React from 'react'
import { getDroppedOrSelectedFiles } from 'html5-file-selector'
import { CloudUpload } from 'react-bootstrap-icons'

/**
 * Custom file input component for the dropzone uploader.
 */
const CustomInput = ({ accept, onFiles, files, disabled }) => {
  const text = 'Select file'
  const buttonClass = disabled ? 'btn btn-primary disabled' : 'btn btn-primary' 
  /**
   * Get dropped files.
   */
  const getFilesFromEvent = e => {
    return new Promise(resolve => {
      getDroppedOrSelectedFiles(e).then(chosenFiles => {
        resolve(chosenFiles.map(f => f.fileObject))
      })
    })
  }
  
  return files.length > 0 ? null : (
    <div className="text-center p-3">
      <CloudUpload color="grey" size={70} />
      <p>Drag and drop an audio file (.mp3, .flac, .wav)</p>
      <label className={buttonClass}>
        {text}
        <input
          style={{ display: 'none' }}
          type="file"
          accept={accept}
          onChange={e => {
            getFilesFromEvent(e).then(chosenFiles => {
              onFiles(chosenFiles)
            })
          }}
        />
      </label>
    </div>
  )
}

export default CustomInput
