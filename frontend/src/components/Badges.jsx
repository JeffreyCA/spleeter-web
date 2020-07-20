import React from 'react'
import { Badge } from 'react-bootstrap'

export const OriginalBadge = () => {
  return (
    <Badge className="ml-2 mr-2" pill variant="primary">
      Original
    </Badge>
  )
}

export const VocalsBadge = props => {
  const { faded } = props
  return (
    <Badge pill variant={faded ? "vocals-faded" : "vocals"}>
      Vocals
    </Badge>
  )
}

export const AccompBadge = props => {
  const { faded } = props
  return (
    <Badge pill variant={faded ? 'accomp-faded' : 'accomp'}>
      Accompaniment
    </Badge>
  )
}

export const AccompShortBadge = props => {
  const { faded } = props
  return (
    <Badge pill variant={faded ? 'accomp-faded' : 'accomp'}>
      Accomp.
    </Badge>
  )
}

export const DrumsBadge = props => {
  const { faded } = props
  return (
    <Badge pill variant={faded ? 'drums-faded' : 'drums'}>
      Drums
    </Badge>
  )
}

export const BassBadge = props => {
  const { faded } = props
  return (
    <Badge pill variant={faded ? 'bass-faded' : 'bass'}>
      Bass
    </Badge>
  )
}
