import * as React from 'react';
import { Badge, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Download } from 'react-bootstrap-icons';
import BootstrapTable, { ColumnDescription, ColumnFormatter, SortOrder } from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { OverlayInjectedProps } from 'react-bootstrap/esm/Overlay';
import { DynamicMix } from '../../models/DynamicMix';
import { separatorLabelMap } from '../../models/Separator';
import { StaticMix } from '../../models/StaticMix';
import { toRelativeDateSpan } from '../../Utils';
import { AccompBadge, AllBadge, BassBadge, DrumsBadge, VocalsBadge } from '../Badges';
import DeleteDynamicMixButton from './DeleteDynamicMixButton';
import DeleteStaticMixButton from './DeleteStaticMixButton';
import './MixTable.css';
import PausePlayButton from './PausePlayButton';
import PlayMixButton from './PlayMixButton';
import { RecordPlayer } from './RecordPlayer';
import StatusIcon from './StatusIcon';

interface MixItem {
  id: string;
  static: boolean;
  mix: StaticMix | DynamicMix;
  date_created: string;
}

/**
 * Formatter function for status column
 */
const statusColFormatter: ColumnFormatter<MixItem> = (cell, row, rowIndex) => {
  return (
    <div className="d-flex align-items-center justify-content-start">
      <StatusIcon status={row.mix.status} overlayText={row.mix.error} />
    </div>
  );
};

/**
 * Formatter function for play column
 */
const playColFormatter: ColumnFormatter<MixItem> = (cell, row, rowIndex, formatExtraData) => {
  if (row.static) {
    const { currentSongUrl, isPlaying, onPauseClick, onPlayClick } = formatExtraData;
    const mix = row.mix as StaticMix;
    const isPlayingCurrent = isPlaying && currentSongUrl === mix.url;

    return (
      <div className="d-flex align-items-center justify-content-start">
        <PausePlayButton
          playing={isPlayingCurrent}
          disabled={!mix.url}
          disabledText="Processing"
          song={mix}
          onPauseClick={onPauseClick}
          onPlayClick={onPlayClick}
        />
      </div>
    );
  } else {
    const mix = row.mix as DynamicMix;
    return (
      <div className="d-flex align-items-center justify-content-start">
        <PlayMixButton mixId={mix.id} />
      </div>
    );
  }
};

const downloadFormatter: ColumnFormatter<MixItem> = (cell, row, rowIndex, formatExtraData) => {
  const { onDeleteDynamicMixClick, onDeleteStaticMixClick } = formatExtraData;

  if (row.static) {
    const mix = row.mix as StaticMix;
    const { url } = mix;

    return (
      <div className="d-flex align-items-center justify-content-end">
        <Button variant="success" disabled={!url} href={url}>
          <Download />
        </Button>
        <DeleteStaticMixButton onClick={onDeleteStaticMixClick} mix={mix} />
      </div>
    );
  } else {
    const mix = row.mix as DynamicMix;
    return (
      <div className="d-flex align-items-center justify-content-end">
        <DeleteDynamicMixButton onClick={onDeleteDynamicMixClick} mix={mix} />
      </div>
    );
  }
};

const modelFormatter: ColumnFormatter<MixItem> = (cellContent, row) => {
  const separator = row.mix.separator;
  const shouldShowTooltip = separator !== 'spleeter';

  const badge = (
    <Badge variant="dark" style={shouldShowTooltip ? { cursor: 'pointer' } : {}}>
      {separatorLabelMap[separator]}
    </Badge>
  );

  const demucsRenderTooltip = (props: OverlayInjectedProps) => {
    return (
      <Tooltip id="status-tooltip" {...props}>
        Random shifts: {row.mix.random_shifts}
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

const partsFormatter: ColumnFormatter<MixItem> = (cellContent, row) => {
  if (row.static) {
    const mix = row.mix as StaticMix;
    return (
      <h5 className="mb-0">
        {mix.vocals && <VocalsBadge />}
        {mix.other && <AccompBadge />}
        {mix.bass && <BassBadge />}
        {mix.drums && <DrumsBadge />}
      </h5>
    );
  } else {
    return (
      <h5 className="mb-0">
        <AllBadge />
      </h5>
    );
  }
};

interface Props {
  dynamicMixes: DynamicMix[];
  staticMixes: StaticMix[];
  currentSongUrl?: string;
  isPlaying: boolean;
  onDeleteDynamicMixClick: (mix: DynamicMix) => void;
  onDeleteStaticMixClick: (mix: StaticMix) => void;
  onPauseClick: (song: StaticMix) => void;
  onPlayClick: (song: StaticMix) => void;
}

class MixTable extends React.Component<Props> {
  render(): JSX.Element {
    const {
      staticMixes,
      dynamicMixes,
      currentSongUrl,
      isPlaying,
      onDeleteDynamicMixClick,
      onDeleteStaticMixClick,
      onPauseClick,
      onPlayClick,
    } = this.props;
    const columns: ColumnDescription[] = [
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
        dataField: 'url_dummy',
        isDummyField: true,
        text: '',
        formatter: playColFormatter,
        formatExtraData: {
          currentSongUrl: currentSongUrl,
          isPlaying: isPlaying,
          onPauseClick: onPauseClick,
          onPlayClick: onPlayClick,
        },
        sort: true,
        sortFunc: (_a: boolean, b: boolean, order: SortOrder, _dataField: unknown, rowA: MixItem, rowB: MixItem) => {
          if (rowA.static && !rowB.static) {
            return order === 'asc' ? 1 : -1;
          } else if (!rowA.static && rowB.static) {
            return order === 'asc' ? -1 : 1;
          }
          return 0;
        },
        headerStyle: () => {
          return { width: '65px' };
        },
      },
      {
        dataField: 'separator_dummy',
        isDummyField: true,
        text: 'Model',
        formatter: modelFormatter,
        sort: true,
        sortFunc: (a: string, b: string, order: SortOrder, _dataField: unknown, rowA: MixItem, rowB: MixItem) => {
          a = rowA.mix.separator;
          b = rowB.mix.separator;

          if (order === 'asc') {
            return a.localeCompare(b);
          } else {
            return b.localeCompare(a);
          }
        },
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
          onDeleteDynamicMixClick: onDeleteDynamicMixClick,
          onDeleteStaticMixClick: onDeleteStaticMixClick,
        },
        style: () => {
          return { paddingRight: 28 };
        },
      },
    ];

    let data: MixItem[] = [];
    const defaultSort = { dataField: 'date_created', order: 'desc' as SortOrder };

    data = data.concat(
      staticMixes.map(mix => {
        return {
          id: mix.id,
          static: true,
          mix: mix,
          date_created: mix.date_created,
        } as MixItem;
      })
    );

    data = data.concat(
      dynamicMixes.map(mix => {
        return {
          id: mix.id,
          static: false,
          mix: mix,
          date_created: mix.date_created,
        } as MixItem;
      })
    );

    if (data.length > 0) {
      return (
        <div>
          <BootstrapTable
            classes="inner-table mb-0"
            bootstrap4
            keyField="id"
            data={data}
            columns={columns}
            defaultSorted={[defaultSort]}
            defaultSortDirection="asc"
            bordered={false}
          />
        </div>
      );
    } else {
      return (
        <div className="m-4 text-center">
          <p>No mixes. Click &ldquo;Dynamic Mix&rdquo; or &ldquo;Static Mix&rdquo; to create one.</p>
        </div>
      );
    }
  }
}

export default MixTable;
