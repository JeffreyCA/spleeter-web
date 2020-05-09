import React from 'react'
import { ProgressBar } from 'react-bootstrap'
import { formatBytes, formatDuration } from '@jeffreyca/react-dropzone-uploader'

import cancelImg from '../../svg/cancel.svg'
import removeImg from '../../svg/remove.svg'
import restartImg from '../../svg/restart.svg'

const iconByFn = {
  cancel: { backgroundImage: `url(${cancelImg})` },
  remove: { backgroundImage: `url(${removeImg})` },
  restart: { backgroundImage: `url(${restartImg})` }
}

/**
 * Custom file preview component for the dropzone uploader (shown after files are selected)
 */
const CustomPreview = ({
  className,
  imageClassName,
  style,
  imageStyle,
  fileWithMeta: { cancel, remove, restart },
  meta: {
    name = '',
    percent = 0,
    size = 0,
    previewUrl,
    status,
    duration,
    validationError
  },
  isUpload,
  canCancel,
  canRemove,
  canRestart,
  extra: { minSizeBytes }
}) => {
  const cancelThenRemove = () => {
    cancel()
    remove()
  }
  let title = `${name || '?'}, ${formatBytes(size)}`
  if (duration) title = `${title}, ${formatDuration(duration)}`

  if (status === 'error_file_size' || status === 'error_validation') {
    return (
      <div className={className} style={style}>
        <div className="row">
          <div className="col">
            <span className="dzu-previewFileNameError">{title}</span>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col">
            <div className="d-flex">
              {status === 'error_file_size' && (
                <span className="dzu-sizeError">
                  {size < minSizeBytes ? 'File too small!' : 'File too large!'}
                </span>
              )}
              {status === 'error_validation' && (
                <span>{String(validationError)}</span>
              )}
              {canRemove && (
                <span
                  className="dzu-previewButton align-self-center"
                  style={iconByFn.remove}
                  onClick={remove}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  var variant = 'primary'
  if (
    status === 'error_upload_params' ||
    status === 'exception_upload' ||
    status === 'error_upload'
  ) {
    title = `${title} (upload failed)`
    variant = 'danger'
  }

  if (status === 'aborted') {
    title = `${title} (cancelled)`
    variant = 'secondary'
  }

  const doneUpload = status === 'done' || status === 'headers_received'
  if (doneUpload) {
    variant = 'success'
  }

  return (
    <div className={className} style={style}>
      <div className="row">
        <div className="col">
          {previewUrl && (
            <img
              className={imageClassName}
              style={imageStyle}
              src={previewUrl}
              alt={title}
              title={title}
            />
          )}
          {!previewUrl && <span className="dzu-previewFileName">{title}</span>}
        </div>
      </div>
      <div className="row mt-2">
        <div className="col">
          <div className="d-flex">
            {isUpload && (
              <ProgressBar
                className="w-100"
                max={100}
                now={doneUpload ? 100 : percent}
                variant={variant}
              />
            )}
            {status === 'uploading' && canCancel && (
              <span
                className="dzu-previewButton"
                style={iconByFn.remove}
                onClick={cancelThenRemove}
              />
            )}
            {status !== 'preparing' &&
              status !== 'getting_upload_params' &&
              status !== 'uploading' &&
              canRemove && (
                <span
                  className="dzu-previewButton"
                  style={iconByFn.remove}
                  onClick={remove}
                />
              )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomPreview
