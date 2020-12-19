import * as React from 'react';
import { CheckCircleFill, ClockFill, XCircleFill } from 'react-bootstrap-icons';
import { OverlayInjectedProps } from 'react-bootstrap/esm/Overlay';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { TaskStatus } from '../../models/TaskStatus';

interface Props {
  status: TaskStatus | null;
  overlayText?: string;
}

const StatusComponentMap = {
  'Queued': <ClockFill color="#6c757d" />,
  'In Progress': <ClockFill color="#007bff" />,
  'Done': <CheckCircleFill color="#28a745" />,
  'Error': <XCircleFill color="#dc3545" />,
};

/**
 * Status icon component.
 */
class StatusIcon extends React.Component<Props> {
  render(): JSX.Element {
    const icon = StatusComponentMap[this.props.status ?? 'Done'];
    const { status, overlayText } = this.props;

    const renderTooltip = (props: OverlayInjectedProps) => {
      return (
        <Tooltip id="status-tooltip" {...props}>
          {overlayText || status}
        </Tooltip>
      );
    };

    return (
      <OverlayTrigger placement="left" delay={{ show: 100, hide: 100 }} overlay={renderTooltip}>
        {icon}
      </OverlayTrigger>
    );
  }
}

export default StatusIcon;
