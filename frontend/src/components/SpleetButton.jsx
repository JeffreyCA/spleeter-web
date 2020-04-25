import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { Button } from 'react-bootstrap';
import './SpleetButton.css'

class SpleetButton extends React.Component {
  handleClick = () => {
    this.props.onSpleetClick(this.props.sourceId);
  }

  render() {
    return (
      <Button className="spleet-btn ml-2" onClick={this.handleClick}>Spleet</Button>
    );
  }
}

export default SpleetButton
