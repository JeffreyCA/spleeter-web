import * as React from 'react';
import { Button } from 'react-bootstrap';
import { BoxArrowUpRight } from 'react-bootstrap-icons';

interface Props {
  className?: string;
  disabled: boolean;
  onClick: () => void;
}

/**
 * Component for the export button.
 */
class ExportButton extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <Button
        className={`text-btn ${this.props.className}`}
        variant="success"
        size="sm"
        disabled={this.props.disabled}
        onClick={this.props.onClick}>
        <BoxArrowUpRight className="align-middle" />
        <span className="ml-1 align-middle">Export</span>
      </Button>
    );
  }
}

export default ExportButton;
