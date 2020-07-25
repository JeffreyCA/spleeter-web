import React from 'react'
import { Button } from 'react-bootstrap'
import { Trash } from 'react-bootstrap-icons';

/**
 * Delete button component.
 */
class DeleteButton extends React.Component {
  handleClick = () => {
    this.props.onClick(this.props.song)
  }

  render() {
    return (
      <Button variant="danger" className="ml-2" style={{whiteSpace: "nowrap"}} disabled={this.props.disabled} onClick={this.handleClick}>
        <Trash />
      </Button>
    )
  }
}

export default DeleteButton
