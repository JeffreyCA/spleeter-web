import * as React from 'react';
import { Badge, Button, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { Download } from 'react-bootstrap-icons';
import BootstrapTable, { ColumnFormatter, SortOrder } from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { OverlayInjectedProps } from 'react-bootstrap/esm/Overlay';
import { StaticMix } from '../../models/StaticMix';
import { toRelativeDateSpan } from '../../Utils';
import { AccompBadge, BassBadge, DrumsBadge, VocalsBadge } from '../Badges';
import PausePlayButton from './PausePlayButton';
import './StaticMixTable.css';

const statusVariantMap = new Map([
  ['Done', 'success'],
  ['Error', 'danger'],
  ['In Progress', 'primary'],
  ['Queued', 'secondary'],
]);

const playColFormatter: ColumnFormatter<StaticMix> = (cell, row, rowIndex, formatExtraData) => {
  const { currentSongUrl, isPlaying, onPauseClick, onPlayClick } = formatExtraData;
  const isPlayingCurrent = isPlaying && currentSongUrl === row.url;

  return (
    <div className="d-flex align-items-center justify-content-center">
      <PausePlayButton
        playing={isPlayingCurrent}
        disabled={!row.url}
        disabledText="Processing"
        song={row}
        onPauseClick={onPauseClick}
        onPlayClick={onPlayClick}
      />
    </div>
  );
};

const downloadFormatter: ColumnFormatter<any> = (cell, row, rowIndex) => {
  const { url } = row;
  return (
    <Button variant="success" disabled={!url} href={url}>
      <Download />
    </Button>
  );
};

const statusFormatter: ColumnFormatter<StaticMix> = (cellValue, row) => {
  const variant = cellValue ? statusVariantMap.get(cellValue) : 'secondary';
  const badgeLabel = cellValue ? cellValue : 'Other';

  if (cellValue === 'Error') {
    const renderErrorTooltip = (props: OverlayInjectedProps): JSX.Element => {
      const errorText = row.error ? row.error : 'Unknown Error';
      return (
        <Tooltip id="button-tooltip" {...props}>
          {errorText}
        </Tooltip>
      );
    };
    const ErrorOverlay = () => (
      <OverlayTrigger placement="right" delay={{ show: 100, hide: 100 }} overlay={renderErrorTooltip}>
        <Badge variant={variant}>{badgeLabel}</Badge>
      </OverlayTrigger>
    );
    return (
      <h5 className="mb-0">
        <ErrorOverlay />
      </h5>
    );
  } else if (cellValue === 'In Progress') {
    return (
      <h5 className="mb-0">
        <Badge variant={variant}>{badgeLabel}</Badge>
        <Spinner className="ml-2" animation="border" variant="primary" size="sm" />
      </h5>
    );
  }
  return (
    <h5 className="mb-0">
      <Badge variant={variant}>{badgeLabel}</Badge>
    </h5>
  );
};

const partsFormatter: ColumnFormatter<StaticMix> = (cellContent, row) => {
  return (
    <h5 className="mb-0">
      <VocalsBadge faded={!row.vocals} />
      <AccompBadge faded={!row.other} />
      <BassBadge faded={!row.bass} />
      <DrumsBadge faded={!row.drums} />
    </h5>
  );
};

interface Props {
  data: StaticMix[];
  currentSongUrl?: string;
  isPlaying: boolean;
  onPauseClick: (song: StaticMix) => void;
  onPlayClick: (song: StaticMix) => void;
}

class StaticMixTable extends React.Component<Props> {
  render(): JSX.Element {
    const { data, currentSongUrl, isPlaying, onPauseClick, onPlayClick } = this.props;
    const columns = [
      {
        dataField: 'url',
        text: '',
        formatter: playColFormatter,
        formatExtraData: {
          currentSongUrl: currentSongUrl,
          isPlaying: isPlaying,
          onPauseClick: onPauseClick,
          onPlayClick: onPlayClick,
        },
        headerStyle: () => {
          return { width: '65px' };
        },
      },
      {
        dataField: 'parts',
        isDummyField: true,
        text: 'Included parts',
        formatter: partsFormatter,
      },
      {
        dataField: 'date_created',
        text: 'Created',
        formatter: toRelativeDateSpan,
        sort: true,
      },
      {
        dataField: 'status',
        text: 'Status',
        formatter: statusFormatter,
        sort: true,
      },
      {
        dataField: 'file',
        text: 'Download',
        formatter: downloadFormatter,
      },
    ];

    const sort = { dataField: 'date_created', order: 'desc' as SortOrder };

    if (data.length > 0) {
      return (
        <div>
          <BootstrapTable
            classes="inner-table mb-0"
            bootstrap4
            keyField="id"
            data={data}
            columns={columns}
            sort={sort}
            defaultSortDirection="asc"
            bordered={false}
          />
        </div>
      );
    } else {
      return (
        <div className="m-4 text-center">
          <p>No static mixes. Click &ldquo;Static Mix&rdquo; to create one.</p>
        </div>
      );
    }
  }
}

export default StaticMixTable;
