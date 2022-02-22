import * as React from 'react';
import { CheckCircleFill, ClockFill, XCircleFill } from 'react-bootstrap-icons';
import { Overlay, Tooltip } from 'react-bootstrap';
import { TaskStatus } from '../../models/TaskStatus';

const StatusToComponent = (
  status: TaskStatus,
  ref: React.MutableRefObject<HTMLElement | null>,
  onMouseOver: () => void,
  onMouseOut: () => void
) => {
  switch (status) {
    case 'Queued':
      return <ClockFill color="#6c757d" ref={ref} onMouseOver={onMouseOver} onMouseOut={onMouseOut} />;
    case 'In Progress':
      return <ClockFill color="#007bff" ref={ref} onMouseOver={onMouseOver} onMouseOut={onMouseOut} />;
    case 'Error':
      return <XCircleFill color="#dc3545" ref={ref} onMouseOver={onMouseOver} onMouseOut={onMouseOut} />;
    default:
      return <CheckCircleFill color="#28a745" ref={ref} onMouseOver={onMouseOver} onMouseOut={onMouseOut} />;
  }
};

interface Props {
  status: TaskStatus | null;
  overlayText?: string;
}

export const StatusIcon = ({ status, overlayText }: Props): JSX.Element => {
  const [show, setShow] = React.useState(false);
  const target = React.useRef(null);

  const statusComponent = StatusToComponent(
    status ?? 'Done',
    target,
    () => setShow(true),
    () => setShow(false)
  );

  return (
    <>
      {statusComponent}
      <Overlay target={target.current} show={show} placement="left">
        {props => (
          <Tooltip id="overlay-example" {...props}>
            {overlayText || (status ?? 'Done')}
          </Tooltip>
        )}
      </Overlay>
    </>
  );
};

export default StatusIcon;
