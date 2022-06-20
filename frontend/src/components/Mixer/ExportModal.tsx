/* eslint-disable @typescript-eslint/ban-types */
import * as React from 'react';
import { Alert, Button, Modal, ProgressBar } from 'react-bootstrap';
import ExportForm from './ExportForm';
import './ExportModal.css';

interface Props {
  defaultName: string;
  show: boolean;
  hide: () => void;
  submit: (mixName: string) => Promise<void>;
  isExporting: boolean;
  exportRatio: number;
}

interface State {
  mixName: string;
}

/**
 * Component for the export modal.
 */
class ExportModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      mixName: props.defaultName,
    };
  }

  submit = async (): Promise<void> => {
    await this.props.submit(this.state.mixName);
  };

  handleMixNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const name = e.currentTarget.value;
    console.log('name changed: ' + name && name !== '' ? name : this.props.defaultName);
    this.setState({
      mixName: name && name !== '' ? name : this.props.defaultName,
    });
    e.stopPropagation();
  };

  render(): JSX.Element | null {
    const { defaultName, isExporting, exportRatio } = this.props;
    const exportPct = Math.round(exportRatio * 100);

    return (
      <Modal show={this.props.show} onHide={!isExporting ? this.props.hide : undefined}>
        <Modal.Header closeButton>
          <Modal.Title>Export mix</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="mb-2">
            This exports a custom mix using the current volume levels set for each part.
          </Alert>
          <ExportForm defaultName={defaultName} mixName={this.state.mixName} handleChange={this.handleMixNameChange} />
          <ProgressBar
            bsPrefix="export-progress"
            variant="success"
            now={exportPct}
            label={exportPct > 5 ? `${exportPct}%` : ''}
            animated={isExporting}
            min={0}
            max={100}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={this.submit} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export mix'}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ExportModal;
