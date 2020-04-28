import React, { Component } from 'react'
import { Button } from 'react-bootstrap';
import { PauseFill, PlayFill } from 'react-bootstrap-icons';

class PausePlayButton extends Component {
  handlePlay = () => {
    if (this.props.playing) {
      this.props.onPauseClick(this.props.song)
    } else {
      this.props.onPlayClick(this.props.song)
    }
  }

  render() {
    const { playing } = this.props;
    return (
      <Button onClick={this.handlePlay} className="btn-circle p-1" variant="secondary" size="lg">
        {playing ? <PauseFill size={28} /> : <PlayFill size={28} />}
      </Button>
    )
  }
}

export default PausePlayButton
