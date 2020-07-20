import React from 'react'
import { Button } from 'react-bootstrap'
import { PauseFill, PlayFill } from 'react-bootstrap-icons'

const PlayButton = props => {
  return (
    <Button
      onClick={props.onClick}
      className="btn-circle p-1"
      variant="secondary"
      size="lg">
      {props.isPlaying ? <PauseFill size={28} /> : <PlayFill size={28} />}
    </Button>
  )
}

export default PlayButton
