import React from 'react'
import { Button } from 'react-bootstrap'
import { Trash } from 'react-bootstrap-icons';
import './SpleetButton.css'

/**
 * Delete button component.
 */
class DeleteButton extends React.Component {
  handleClick = () => {
    this.props.onClick(this.props.song)
  }

  render() {
    return (
      <Button variant="danger" className="spleet-btn ml-2" onClick={this.handleClick}>
        <Trash />
      </Button>
    )
  }
}

export default DeleteButton
