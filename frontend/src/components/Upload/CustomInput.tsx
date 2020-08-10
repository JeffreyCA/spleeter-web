/* eslint-disable @typescript-eslint/no-explicit-any */
import { IInputProps } from '@jeffreyca/react-dropzone-uploader';
import { getDroppedOrSelectedFiles } from 'html5-file-selector';
import * as React from 'react';
import { CloudUpload } from 'react-bootstrap-icons';

/**
 * Custom file input component for the dropzone uploader.
 */
const CustomInput = ({ accept, onFiles, files, disabled }: IInputProps): JSX.Element | null => {
  const text = 'Select file';
  const buttonClass = disabled ? 'btn btn-primary disabled' : 'btn btn-primary';
  /**
   * Get dropped files.
   */
  const getFilesFromEvent = (e: any) => {
    return new Promise(resolve => {
      getDroppedOrSelectedFiles(e).then((chosenFiles: any) => {
        resolve(chosenFiles.map((f: any) => f.fileObject));
      });
    });
  };

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
            getFilesFromEvent(e).then((chosenFiles: any) => {
              onFiles(chosenFiles);
            });
          }}
        />
      </label>
    </div>
  );
};

export default CustomInput;
