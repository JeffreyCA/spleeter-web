import React from 'react'
import { Button } from 'react-bootstrap'
import './TextButton.css'

class TextButton extends React.Component {
  handleClick = () => {
    this.props.onClick(this.props.song)
  }

  render() {
    return (
      <Button
        className={`text-btn ml-2 ${this.props.className}`}
        variant={this.props.variant}
        disabled={this.props.disabled}
        onClick={this.handleClick}>
        {this.props.children}
      </Button>
    )
  }
}

export default TextButton
