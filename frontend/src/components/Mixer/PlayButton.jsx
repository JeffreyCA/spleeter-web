import React from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { PauseFill, PlayFill } from 'react-bootstrap-icons'

const PlayButton = props => {
  let content = null
  if (props.disabled) {
    content = <Spinner animation="border" />
  } else if (props.isPlaying) {
    content = <PauseFill size={28} />
  } else {
    content = <PlayFill size={28} />
  }

  return (
    <Button
      disabled={props.disabled}
      onClick={props.onClick}
      className="btn-circle p-1"
      variant="secondary"
      size="lg">
      {content}
    </Button>
  )
}

export default PlayButton
