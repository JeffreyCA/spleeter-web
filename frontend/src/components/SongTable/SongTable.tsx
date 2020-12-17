import * as React from 'react';
import { CaretDownFill, CaretUpFill, Plus } from 'react-bootstrap-icons';
import BootstrapTable, {
  ColumnDescription,
  ColumnFormatter,
  ExpandRowProps,
  SortOrder,
} from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { SongData } from '../../models/SongData';
import { StaticMix } from '../../models/StaticMix';
import { toRelativeDateSpan } from '../../Utils';
import DeleteTrackButton from './DeleteTrackButton';
import PausePlayButton from './PausePlayButton';
import './SongTable.css';
import StaticMixTable from './StaticMixTable';
import TextButton from './TextButton';
import StatusIcon from './StatusIcon';

/**
 * Formatter function for status column
 */
const statusColFormatter: ColumnFormatter<SongData> = (cell, row, rowIndex, formatExtraData) => {
  return (
    <div className="d-flex align-items-center justify-content-start">
      <StatusIcon status={row.fetch_task_status} overlayText={row.fetch_task_error} />
    </div>
  );
};

/**
 * Formatter function for play column
 */
const playColFormatter: ColumnFormatter<SongData> = (cell, row, rowIndex, formatExtraData) => {
  const { currentSongUrl, isPlaying, handleSrcSongPause, handleSrcSongPlay } = formatExtraData;
  const isPlayingCurrent = isPlaying && currentSongUrl === row.url;
  const isDisabled = !row.url;

  return (
    <div className="d-flex align-items-center justify-content-center">
      <PausePlayButton
        disabled={isDisabled}
        disabledText="Processing"
        playing={isPlayingCurrent}
        song={row}
        onPauseClick={handleSrcSongPause}
        onPlayClick={handleSrcSongPlay}
      />
    </div>
  );
};

/**
 * Formatter function for separate button column.
 */
const spleetColFormatter: ColumnFormatter<SongData> = (cell, row, rowIndex, formatExtraData) => {
  const { onDeleteTrackClick, onDynamicMixClick, onStaticMixClick } = formatExtraData;
  const disabled = !row.url;
  const hasDynamicMix = row.dynamic;

  return (
    <div className="d-flex align-items-center justify-content-end">
      <TextButton
        className={hasDynamicMix ? '' : 'pl-1'}
        variant="info"
        disabled={disabled}
        onClick={onDynamicMixClick}
        song={row}>
        {!hasDynamicMix && <Plus className="align-middle" size={24} />}
        <span className="align-middle">Dynamic Mix</span>
      </TextButton>
      <TextButton className="pl-1" disabled={disabled} onClick={onStaticMixClick} song={row}>
        <Plus className="align-middle" size={24} />
        <span className="align-middle">Static Mix</span>
      </TextButton>
      <DeleteTrackButton onClick={onDeleteTrackClick} song={row} />
    </div>
  );
};

interface Props {
  data: SongData[];
  currentSongUrl?: string;
  isPlaying: boolean;
  expandedIds: string[];
  onExpandRow: (row: SongData, isExpand: boolean) => void;
  onExpandAll: (isExpandAll: boolean, results: SongData[], e: React.SyntheticEvent) => void;
  onDeleteStaticMixClick: (staticMix: StaticMix) => void;
  onDeleteTrackClick: (song: SongData) => void;
  onDynamicMixClick: (song: SongData) => void;
  onStaticMixClick: (song: SongData) => void;
  onStaticMixPauseClick: (staticMix: StaticMix) => void;
  onStaticMixPlayClick: (staticMix: StaticMix) => void;
  onSrcSongPauseClick: (song: SongData) => void;
  onSrcSongPlayClick: (song: SongData) => void;
}

/**
 * Component for the song table, containing the uploaded songs and their static mixes.
 */
class SongTable extends React.Component<Props> {
  render(): JSX.Element {
    const {
      data,
      currentSongUrl,
      isPlaying,
      expandedIds,
      onDeleteStaticMixClick,
      onDeleteTrackClick,
      onDynamicMixClick,
      onStaticMixClick,
      onStaticMixPauseClick,
      onStaticMixPlayClick,
      onSrcSongPauseClick,
      onSrcSongPlayClick,
      onExpandRow,
      onExpandAll,
    } = this.props;

    // Show static mix details inside expand row
    const expandRow: ExpandRowProps<SongData> = {
      renderer: (row: SongData) => {
        return (
          <StaticMixTable
            data={row.static}
            currentSongUrl={currentSongUrl}
            isPlaying={isPlaying}
            onDeleteStaticMixClick={onDeleteStaticMixClick}
            onPauseClick={onStaticMixPauseClick}
            onPlayClick={onStaticMixPlayClick}
          />
        );
      },
      expanded: expandedIds,
      onExpand: onExpandRow,
      onExpandAll: onExpandAll,
      showExpandColumn: true,
      expandColumnPosition: 'right',
      expandByColumnOnly: true,
      expandHeaderColumnRenderer: ({ isAnyExpands }) => {
        return isAnyExpands ? <CaretUpFill /> : <CaretDownFill />;
      },
      expandColumnRenderer: ({ expanded }) => {
        return expanded ? <CaretUpFill /> : <CaretDownFill />;
      },
    };
    // Song table columns
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
        }
      },
      {
        dataField: 'url',
        text: '',
        formatter: playColFormatter,
        formatExtraData: {
          currentSongUrl: currentSongUrl,
          isPlaying: isPlaying,
          handleSrcSongPause: onSrcSongPauseClick,
          handleSrcSongPlay: onSrcSongPlayClick,
        },
        headerStyle: () => {
          return { width: '65px' };
        },
      },
      {
        dataField: 'id',
        text: 'ID',
        hidden: true,
      },
      {
        dataField: 'title',
        text: 'Title',
        sort: true,
      },
      {
        dataField: 'artist',
        text: 'Artist',
        sort: true,
      },
      {
        dataField: 'date_created',
        text: 'Uploaded',
        formatter: toRelativeDateSpan,
        sort: true,
      },
      {
        dataField: 'download_dummy',
        isDummyField: true,
        text: '',
        formatter: spleetColFormatter,
        formatExtraData: {
          onDeleteTrackClick: onDeleteTrackClick,
          onDynamicMixClick: onDynamicMixClick,
          onStaticMixClick: onStaticMixClick,
        },
      },
    ];
    const sort = [{ dataField: 'date_created', order: 'desc' }] as [
      {
        dataField: string;
        order: SortOrder;
      }
    ];

    return (
      <BootstrapTable
        bootstrap4
        keyField="id"
        data={data}
        columns={columns}
        defaultSorted={sort}
        expandRow={expandRow}
        bordered={false}
      />
    );
  }
}

export default SongTable;
