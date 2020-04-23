import React from 'react'
import { CloudUpload } from 'react-bootstrap-icons';
import { getDroppedOrSelectedFiles } from 'html5-file-selector'

const CustomInput = ({ accept, onFiles, files }) => {
  const text = 'Select file'

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
      <p>Drag and drop an MP3 file</p>
      <label className="btn btn-primary">
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

export default CustomInput;
