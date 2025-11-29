import * as React from 'react';
import { Button } from 'react-bootstrap';
import { ArrowClockwise } from 'react-bootstrap-icons';

interface Props {
  period: number;
  onRefresh: () => Promise<void>;
}

interface State {
  isRefreshing: boolean;
  seconds: number;
}

/**
 * Refreshing actually takes very little time, causing the refresh button to briefly flicker.
 * This controls how long to delay a "fake" refresh.
 */
const fakeRefreshDuration = 250;

/**
 * Component for an auto-refresh button.
 */
class AutoRefreshButton extends React.Component<Props, State> {
  tickInterval?: number;

  constructor(props: Props) {
    super(props);
    this.state = {
      isRefreshing: false,
      seconds: props.period,
    };
  }

  /**
   * Function called once per tick (every second).
   */
  tick = async (): Promise<void> => {
    const { period } = this.props;
    const { isRefreshing, seconds } = this.state;

    if (isRefreshing) {
      return;
    }

    // Time for refresh
    if (seconds <= 0) {
      // Stop interval
      clearInterval(this.tickInterval);
      this.setState({
        isRefreshing: true,
      });
      // Invoke callback and wait for it to resolve
      await this.props.onRefresh();
      // Reset ticks
      this.setState({
        isRefreshing: false,
        seconds: period,
      });
      // Restart interval
      this.tickInterval = setInterval(this.tick, 1000);
    } else {
      // Decrement ticks
      this.setState({
        seconds: this.state.seconds - 1,
      });
    }
  };

  refreshNow = async (): Promise<void> => {
    const { period } = this.props;
    const { isRefreshing } = this.state;

    if (isRefreshing) {
      return;
    }

    // Stop interval
    clearInterval(this.tickInterval);
    this.setState({
      isRefreshing: true,
    });
    // Invoke callback and wait for it to resolve
    await this.props.onRefresh();
    // Make manual refresh appear longer...
    await new Promise(resolve => setTimeout(resolve, fakeRefreshDuration));
    // Reset ticks
    this.setState({
      isRefreshing: false,
      seconds: period,
    });
    // Restart interval
    this.tickInterval = setInterval(this.tick, 1000);
  };

  componentDidMount(): void {
    // Tick every second
    // this.tickInterval = setInterval(this.tick, 1000);
  }

  componentWillUnmount(): void {
    // clearInterval(this.tickInterval);
  }

  render(): JSX.Element {
    const { isRefreshing, seconds } = this.state;
    const appearRefreshing = isRefreshing || seconds <= 0;
    const text = !appearRefreshing ? `Refreshing in ${seconds}` : 'Refreshing...';

    return (
      <div style={{ display: 'flex', alignItems: 'center', alignContent: 'center' }}>
        <pre style={{ fontSize: 13, margin: 0 }}></pre>
        <Button
          variant="secondary"
          className="ml-3"
          size="sm"
          disabled
          onClick={this.refreshNow}
          // style={{ cursor: appearRefreshing ? 'progress' : 'pointer' }}
        >
          <ArrowClockwise />
        </Button>
      </div>
    );
  }
}

export default AutoRefreshButton;
