import axios from 'axios';
import * as React from 'react';
import { Alert, Container, Row, Spinner } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router';
import { DynamicMix } from '../../models/DynamicMix';
import PlainNavBar from '../Nav/PlainNavBar';
import MixerPlayer from './MixerPlayer';

interface MatchParams {
  mixId: string;
}

interface State {
  data?: DynamicMix;
  isLoaded: boolean;
  hasError: boolean;
}

class Mixer extends React.Component<RouteComponentProps<MatchParams>, State> {
  timeout?: number;

  constructor(props: RouteComponentProps<MatchParams>) {
    super(props);
    this.state = {
      data: undefined,
      isLoaded: false,
      hasError: false,
    };
  }

  loadData = (mixId: string): void => {
    axios
      .get<DynamicMix>(`/api/mix/dynamic/${mixId}/`)
      .then(({ data }) => {
        if (data) {
          this.setState({ isLoaded: true, data: data });
        }
        if (data.status === 'Queued' || data.status === 'In Progress') {
          this.timeout = setTimeout(() => this.loadData(mixId), 10000);
        }
      })
      .catch(() => {
        this.setState({
          isLoaded: true,
          hasError: true,
        });
      });
  };

  componentDidMount(): void {
    const {
      match: { params },
    } = this.props;
    const mixId = params.mixId;
    this.loadData(mixId);
  }

  componentWillUnmount(): void {
    clearInterval(this.timeout);
  }

  render(): JSX.Element | null {
    const { data, hasError, isLoaded } = this.state;
    let alert = null;

    if (!isLoaded) {
      return null;
    }

    if (!data || hasError) {
      alert = <Alert variant="danger">An error occurred.</Alert>;
    } else if (data.status === 'Queued' || data.status === 'In Progress') {
      alert = (
        <Alert className="mt-3" variant="warning">
          <Row className="align-items-center pl-2">
            <span>Processing mix...</span>
            <Spinner className="ml-2" animation="border" size="sm" />
          </Row>
        </Alert>
      );
    }

    const mixDone = data && data.status === 'Done';

    return (
      <div>
        <PlainNavBar />
        <Container>
          <h2 className="mt-3">Mixer</h2>
          {data ? (
            <h3>
              {data.artist} - {data.title}
            </h3>
          ) : null}
          {alert}
          {mixDone && <MixerPlayer data={data} />}
        </Container>
      </div>
    );
  }
}

export default Mixer;
