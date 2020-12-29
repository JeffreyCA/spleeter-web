import * as React from 'react';
import { Button } from 'react-bootstrap';
import { RecordPlayer } from './RecordPlayer';

interface Props {
  mixId: string;
}

/**
 * Component for the 'play mix' button shown in the MixTable.
 */
class PlayMixButton extends React.Component<Props> {
  render(): JSX.Element {
    const { mixId } = this.props;

    return (
      <Button
        variant="secondary"
        className="btn-circle p-2"
        href={`/mixer/${mixId}/`}
        size="lg"
        style={{ borderRadius: '50%' }}>
        <RecordPlayer width={20} height={20} />
      </Button>
    );
  }
}

export default PlayMixButton;
