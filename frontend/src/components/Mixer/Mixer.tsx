import axios from 'axios';
import * as React from 'react';
import { Alert, Container, Row, Spinner } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router';
import { DynamicMix } from '../../models/DynamicMix';
import PlainNavBar from '../Nav/PlainNavBar';
import CancelButton from './CancelButton';
import CancelTaskModal from './CancelTaskModal';
import MixerPlayer from './MixerPlayer';

interface MatchParams {
  mixId: string;
}

interface State {
  data?: DynamicMix;
  isAborted: boolean;
  isLoaded: boolean;
  showCancelTaskModal: boolean;
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
      isLoaded: false,
      showCancelTaskModal: false,
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
    axios
      .get<DynamicMix>(`/api/mix/dynamic/${mixId}/`)
      .then(({ data }) => {
        if (data) {
          this.setState({ isLoaded: true, data: data });
          document.title = `${data.artist} - ${data.title} · Spleeter Web`;
        }
        if (data.error) {
          this.setState({
            errors: [data.error],
          });
        }
        if (data.status === 'Queued' || data.status === 'In Progress') {
          this.timeout = setTimeout(() => this.loadData(), 5000);
        } else if (data.status === 'Done') {
          this.setState({ showCancelTaskModal: false });
        }
      })
      .catch(() => {
        this.setState({
          isLoaded: true,
          errors: [`Dynamic mix ${mixId} does not exist.`],
        });
      });
  };

  cancelTask = (): void => {
    const mixId = this.getMixId();
    // Cancel dynamic mix task
    axios
      .delete(`/api/mix/dynamic/${mixId}/`)
      .then(() => {
        this.setState({
          isAborted: true,
        });
        clearTimeout(this.timeout);
      })
      .catch(({ response }) => {
        const { data } = response;
        this.setState({
          errors: [data.error],
        });
      });
  };

  componentDidMount(): void {
    this.loadData();
  }

  componentWillUnmount(): void {
    clearInterval(this.timeout);
  }

  onCancelTaskClick = (): void => {
    this.setState({ showCancelTaskModal: true });
  };

  handleCancelTaskModalHide = (): void => {
    this.setState({ showCancelTaskModal: false });
  };

  render(): JSX.Element | null {
    const { data, errors, isAborted, isLoaded, showCancelTaskModal } = this.state;
    let alert = null;

    if (!isLoaded) {
      return null;
    }

    const isQueued = data && data.status === 'Queued';
    const isProcessing = data && data.status === 'In Progress';
    const isDone = data && data.status === 'Done';

    if (isAborted) {
      // Dynamic mix task was aborted
      alert = <Alert variant="danger">Aborted.</Alert>;
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

    return (
      <div>
        <PlainNavBar />
        <Container>
          <h2 className="mt-3">Mixer</h2>
          {data ? (
            <h4 className="mt-3">
              {data.artist} - {data.title}
            </h4>
          ) : null}
          {alert}
          {(isQueued || isProcessing) && !isAborted && <CancelButton onClick={this.onCancelTaskClick} />}
          {isDone && <MixerPlayer data={data} />}
        </Container>
        <CancelTaskModal show={showCancelTaskModal} hide={this.handleCancelTaskModalHide} submit={this.cancelTask} />
      </div>
    );
  }
}

export default Mixer;
