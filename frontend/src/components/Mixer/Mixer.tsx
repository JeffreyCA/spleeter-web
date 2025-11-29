import * as React from 'react';
import { Alert, Badge, Container, Row, Spinner } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router';
import { DynamicMixData } from '../../DemoData';
import { DynamicMix } from '../../models/DynamicMix';
import { separatorLabelMap } from '../../models/Separator';
import PlainNavBar from '../Nav/PlainNavBar';
import CancelButton from './CancelButton';
import CancelTaskModal from './CancelTaskModal';
import DeleteButton from './DeleteButton';
import DeleteTaskModal from './DeleteTaskModal';
import MixerPlayer from './MixerPlayer';

interface MatchParams {
  mixId: string;
}

interface State {
  data?: DynamicMix;
  isAborted: boolean;
  isDeleting: boolean;
  isDeleted: boolean;
  isLoaded: boolean;
  showCancelTaskModal: boolean;
  showDeleteTaskModal: boolean;
  errors: string[];
}

/**
 * Component for playing dynamic mixes.
 */
class Mixer extends React.Component<RouteComponentProps<MatchParams>, State> {
  timeout?: number;

  constructor(props: RouteComponentProps<MatchParams>) {
    super(props);
    this.state = {
      data: undefined,
      isAborted: false,
      isDeleting: false,
      isDeleted: false,
      isLoaded: false,
      showCancelTaskModal: false,
      showDeleteTaskModal: false,
      errors: [],
    };
  }

  getMixId = (): string => {
    const {
      match: { params },
    } = this.props;
    const mixId = params.mixId;
    return mixId;
  };

  loadData = (): void => {
    const mixId = this.getMixId();
    const data = DynamicMixData.get(mixId);
    if (data?.title && data?.artist) {
      document.title = `${data.title} - ${data.artist} · Spleeter Web`;
    }
    this.setState({
      isLoaded: true,
      data: data,
    });
  };

  cancelTask = (): Promise<void> => {
    return Promise.resolve();
  };

  deleteTask = (): Promise<void> => {
    return Promise.resolve();
  };

  componentDidMount(): void {
    this.loadData();
  }

  componentWillUnmount(): void {
    // clearInterval(this.timeout);
  }

  onCancelTaskClick = (): void => {
    this.setState({ showCancelTaskModal: true });
  };

  handleCancelTaskModalHide = (): void => {
    this.setState({ showCancelTaskModal: false });
  };

  onDeleteTaskClick = (): void => {
    this.setState({ showDeleteTaskModal: true });
  };

  handleDeleteTaskModalHide = (): void => {
    this.setState({ showDeleteTaskModal: false });
  };

  render(): JSX.Element | null {
    const { data, errors, isAborted, isDeleting, isDeleted, isLoaded, showCancelTaskModal, showDeleteTaskModal } =
      this.state;
    let alert = null;

    if (!isLoaded) {
      return null;
    }

    const isQueued = data && data.status === 'Queued';
    const isProcessing = data && data.status === 'In Progress';
    const isDone = data && data.status === 'Done';
    const isError = data && data.status === 'Error';

    if (isAborted) {
      // Dynamic mix task was aborted
      alert = <Alert variant="danger">Aborted.</Alert>;
    } else if (isDeleted) {
      // Dynamic mix task was aborted
      alert = <Alert variant="danger">Deleted.</Alert>;
    } else if (errors.length > 0) {
      // Some other error has occurred
      alert = (
        <Alert variant="danger">
          {errors.map((val, idx) => (
            <div key={idx}>{val}</div>
          ))}
        </Alert>
      );
    } else if (isQueued) {
      // Task is queued
      alert = (
        <Alert className="mt-3" variant="secondary">
          <Row className="align-items-center pl-2">
            <span>In queue </span>
            <Spinner className="ml-2" animation="border" size="sm" />
          </Row>
        </Alert>
      );
    } else if (isProcessing) {
      // Task is in progress
      alert = (
        <Alert className="mt-3" variant="warning">
          <Row className="align-items-center pl-2">
            <span>Processing mix...</span>
            <Spinner className="ml-2" animation="border" size="sm" />
          </Row>
        </Alert>
      );
    }

    const extraBadges = !data
      ? null
      : data.extra_info.map((extra, idx) => (
          <Badge variant="light" key={idx}>
            {extra}
          </Badge>
        ));

    return (
      <div>
        <PlainNavBar />
        <Container>
          <h2 className="mt-3">Mixer</h2>
          {data ? (
            <div>
              <h4 className="mt-3">
                {data.title} - {data.artist}
              </h4>
              <h5 className="mt-1">
                <Badge variant="dark">{separatorLabelMap[data.separator]}</Badge>
                {extraBadges}
              </h5>
            </div>
          ) : null}
          {alert}
          {(isQueued || isProcessing) && !(isAborted || isDeleted) && (
            <CancelButton disabled={isDeleting} onClick={this.onCancelTaskClick} />
          )}
          {isDone && !isDeleted && <MixerPlayer data={data} />}
          {(isDone || isError) && !(isAborted || isDeleted) && (
            <DeleteButton className="mt-4" disabled={isDeleting} onClick={this.onDeleteTaskClick} />
          )}
        </Container>
        <CancelTaskModal
          show={showCancelTaskModal}
          hide={this.handleCancelTaskModalHide}
          isCancelling={isDeleting}
          submit={this.cancelTask}
        />
        <DeleteTaskModal
          show={showDeleteTaskModal}
          hide={this.handleDeleteTaskModalHide}
          isDeleting={isDeleting}
          submit={this.deleteTask}
        />
      </div>
    );
  }
}

export default Mixer;
