import React from 'react'
import { Button } from 'react-bootstrap'
import './SpleetButton.css'

/**
 * Spleet button component, which triggers a source separation job.
 */
class SpleetButton extends React.Component {
  handleClick = () => {
    this.props.onClick(this.props.song)
  }

  render() {
    return (
      <Button className="spleet-btn ml-2" disabled={this.props.disabled} onClick={this.handleClick}>
        Spleet
      </Button>
    )
  }
}

export default SpleetButton
