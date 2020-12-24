import * as React from 'react';
import { Badge, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Download } from 'react-bootstrap-icons';
import BootstrapTable, { ColumnFormatter, SortOrder } from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { OverlayInjectedProps } from 'react-bootstrap/esm/Overlay';
import { separatorLabelMap } from '../../models/Separator';
import { StaticMix } from '../../models/StaticMix';
import { toRelativeDateSpan } from '../../Utils';
import { AccompBadge, BassBadge, DrumsBadge, VocalsBadge } from '../Badges';
import DeleteStaticMixButton from './DeleteStaticMixButton';
import PausePlayButton from './PausePlayButton';
import './StaticMixTable.css';
import StatusIcon from './StatusIcon';

/**
 * Formatter function for status column
 */
const statusColFormatter: ColumnFormatter<StaticMix> = (cell, row, rowIndex) => {
  return (
    <div className="d-flex align-items-center justify-content-start">
      <StatusIcon status={row.status} overlayText={row.error} />
    </div>
  );
};

/**
 * Formatter function for play column
 */
const playColFormatter: ColumnFormatter<StaticMix> = (cell, row, rowIndex, formatExtraData) => {
  const { currentSongUrl, isPlaying, onPauseClick, onPlayClick } = formatExtraData;
  const isPlayingCurrent = isPlaying && currentSongUrl === row.url;

  return (
    <div className="d-flex align-items-center justify-content-start">
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

const downloadFormatter: ColumnFormatter<StaticMix> = (cell, row, rowIndex, formatExtraData) => {
  const { onDeleteStaticMixClick } = formatExtraData;
  const { url } = row;
  return (
    <div className="d-flex align-items-center justify-content-end">
      <Button variant="success" disabled={!url} href={url}>
        <Download />
      </Button>
      <DeleteStaticMixButton onClick={onDeleteStaticMixClick} mix={row} />
    </div>
  );
};

const modelFormatter: ColumnFormatter<StaticMix> = (cellContent, row) => {
  const separator = row.separator;
  const shouldShowTooltip = separator !== 'spleeter';

  const badge = (
    <Badge variant="secondary" style={shouldShowTooltip ? { cursor: 'pointer' } : {}}>
      {separatorLabelMap[separator]}
    </Badge>
  );

  const demucsRenderTooltip = (props: OverlayInjectedProps) => {
    return (
      <Tooltip id="status-tooltip" {...props}>
        Random shifts: {row.random_shifts}
      </Tooltip>
    );
  };

  return (
    <h5 className="mb-0">
      {shouldShowTooltip ? (
        <OverlayTrigger placement="right" delay={{ show: 100, hide: 100 }} overlay={demucsRenderTooltip}>
          {badge}
        </OverlayTrigger>
      ) : (
        badge
      )}
    </h5>
  );
};

const partsFormatter: ColumnFormatter<StaticMix> = (cellContent, row) => {
  return (
    <h5 className="mb-0">
      {row.vocals && <VocalsBadge />}
      {row.other && <AccompBadge />}
      {row.bass && <BassBadge />}
      {row.drums && <DrumsBadge />}
    </h5>
  );
};

interface Props {
  data: StaticMix[];
  currentSongUrl?: string;
  isPlaying: boolean;
  onDeleteStaticMixClick: (song: StaticMix) => void;
  onPauseClick: (song: StaticMix) => void;
  onPlayClick: (song: StaticMix) => void;
}

class StaticMixTable extends React.Component<Props> {
  render(): JSX.Element {
    const { data, currentSongUrl, isPlaying, onDeleteStaticMixClick, onPauseClick, onPlayClick } = this.props;
    const columns = [
      {
        dataField: 'status_dummy',
        isDummyField: true,
        text: '',
        formatter: statusColFormatter,
        headerStyle: () => {
          return { width: '40px' };
        },
        style: () => {
          return { width: '40px' };
        },
      },
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
        dataField: 'separator',
        text: 'Model',
        formatter: modelFormatter,
        sort: true,
        style: () => {
          return { width: '200px' };
        },
        headerStyle: () => {
          return { width: '200px' };
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
        dataField: 'file',
        text: '',
        formatter: downloadFormatter,
        formatExtraData: {
          onDeleteStaticMixClick: onDeleteStaticMixClick,
        },
        style: () => {
          return { paddingRight: 28 };
        },
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
            defaultSorted={[sort]}
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
