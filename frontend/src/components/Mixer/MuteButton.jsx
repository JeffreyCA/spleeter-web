import React from 'react'
import { Button } from 'react-bootstrap'
import { VolumeMuteFill, VolumeUpFill } from 'react-bootstrap-icons'

const MuteButton = props => {
  return (
    <Button
      onClick={props.onClick}
      className="btn-circle p-1"
      variant="secondary"
      size="lg">
      {props.isMuted ? <VolumeMuteFill size={28} /> : <VolumeUpFill size={28} />}
    </Button>
  )
}

export default MuteButton
