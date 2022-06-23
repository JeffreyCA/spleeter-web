import * as React from 'react';
import { Button, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { BoxArrowUpRight } from 'react-bootstrap-icons';
import { OverlayInjectedProps } from 'react-bootstrap/esm/Overlay';

interface Props {
  className?: string;
  disabled: boolean;
  error?: string;
  loading: boolean;
  onClick: () => void;
}

/**
 * Component for the export button.
 */
class ExportButton extends React.Component<Props> {
  render(): JSX.Element {
    let content = null;
    if (this.props.loading) {
      content = <Spinner animation="border" />;
    } else {
      content = (
        <>
          <BoxArrowUpRight className="align-middle" />
          <span className="ml-1 align-middle">Export</span>
        </>
      );
    }

    const renderTooltip = (props: OverlayInjectedProps) => (
      <Tooltip id="button-tooltip" {...props}>
        {this.props.error}
      </Tooltip>
    );

    const disabledStyle: React.CSSProperties = {
      cursor: 'not-allowed',
      pointerEvents: 'none',
    };

    let button = (
      <Button
        className={`text-btn ${this.props.className}`}
        variant="success"
        size="sm"
        onClick={this.props.onClick}
        style={this.props.disabled ? disabledStyle : {}}>
        {content}
      </Button>
    );

    if (this.props.error) {
      button = (
        <OverlayTrigger placement="right" overlay={renderTooltip}>
          <div style={{ display: 'inline-block', cursor: 'not-allowed' }}>{button}</div>
        </OverlayTrigger>
      );
    }

    return button;
  }
}

export default ExportButton;
