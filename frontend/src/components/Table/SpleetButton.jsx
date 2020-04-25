import React from 'react';
import { Button } from 'react-bootstrap';
import './SpleetButton.css'

class SpleetButton extends React.Component {
  handleClick = () => {
    console.log(this.props.song)
    this.props.onSpleetClick(this.props.song);
  }

  render() {
    return (
      <Button className="spleet-btn ml-2" onClick={this.handleClick}>Spleet</Button>
    );
  }
}

export default SpleetButton
