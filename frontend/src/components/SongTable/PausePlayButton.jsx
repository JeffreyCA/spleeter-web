import React, { Component } from 'react'
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { PauseFill, PlayFill } from 'react-bootstrap-icons'

class PausePlayButton extends Component {
  handlePlay = () => {
    if (this.props.playing) {
      this.props.onPauseClick(this.props.song)
    } else {
      this.props.onPlayClick(this.props.song)
    }
  }

  render() {
    const { playing, disabled, disabledText } = this.props

    function renderTooltip(props) {
      return (
        <Tooltip id="button-tooltip" {...props}>
          {disabledText}
        </Tooltip>
      );
    }

    const customButtonStyle = disabled? {
      pointerEvents: 'none'
    } : {}
    const customButton = (
      <Button
        disabled={disabled}
        style={customButtonStyle}
        onClick={this.handlePlay}
        className="btn-circle p-1"
        variant="secondary"
        size="lg">
        {playing && !disabled ? (
          <PauseFill size={28} />
        ) : (
          <PlayFill size={28} />
        )}
      </Button>
    )

    const buttonOverlay = (
      <OverlayTrigger
        placement="right"
        delay={{ show: 100, hide: 100 }}
        overlay={renderTooltip}>
        <span className="d-inline-block">{customButton}</span>
      </OverlayTrigger>
    )

    if (disabled && disabledText) {
      return buttonOverlay
    } else {
      return customButton
    }
  }
}

export default PausePlayButton
