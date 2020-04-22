import React from 'react'
import { CloudUpload } from 'react-bootstrap-icons';

const CustomInput = ({ accept, onFiles, files, getFilesFromEvent }) => {
  const text = 'Select file'

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
