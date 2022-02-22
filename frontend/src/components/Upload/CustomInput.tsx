/* eslint-disable @typescript-eslint/no-explicit-any */
import { IInputProps } from '@jeffreyca/react-dropzone-uploader';
import { getDroppedOrSelectedFiles } from 'html5-file-selector';
import * as React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { CloudUpload, InfoCircle } from 'react-bootstrap-icons';
import { OverlayInjectedProps } from 'react-bootstrap/esm/Overlay';
import { ALLOWED_EXTENSIONS } from '../../Constants';

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

  const supportedFormatsTooltip = (props: OverlayInjectedProps) => {
    const text = 'Supported: ' + ALLOWED_EXTENSIONS.sort().join(', ');

    return (
      <Tooltip id="status-tooltip" {...props}>
        {text}
      </Tooltip>
    );
  };

  return files.length > 0 ? null : (
    <div className="text-center p-3">
      <CloudUpload color="grey" size={70} />
      <p className="d-flex align-items-center justify-content-start">
        Drag and drop an audio file. {'  '}
        <OverlayTrigger placement="right" delay={{ show: 50, hide: 50 }} overlay={supportedFormatsTooltip}>
          <InfoCircle className="ml-1" size={14} style={{ cursor: 'pointer' }} />
        </OverlayTrigger>
      </p>

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
