import axios from 'axios';
import * as React from 'react';
import { CaretDownFill, CaretUpFill, Plus } from 'react-bootstrap-icons';
import BootstrapTable, {
  ColumnDescription,
  ColumnFormatter,
  ExpandRowProps,
  SortOrder,
} from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { DynamicMix } from '../../models/DynamicMix';
import { SongData } from '../../models/SongData';
import { StaticMix } from '../../models/StaticMix';
import { toLocaleDateTimeString, toRelativeDateSpan } from '../../Utils';
import DeleteTrackButton from './Button/DeleteTrackButton';
import PausePlayButton from './Button/PausePlayButton';
import TextButton from './Button/TextButton';
import MixTable from './MixTable';
import './SongTable.css';
import StatusIcon from './StatusIcon';

/**
 * Formatter function for status column
 */
const statusColFormatter: ColumnFormatter<SongData> = (cell, row, rowIndex) => {
  let finishedDateTimeText = row.fetch_task_date_finished
    ? `Done at ${toLocaleDateTimeString(row.fetch_task_date_finished)}`
    : undefined;
  if (row.fetch_task_error) {
    if (finishedDateTimeText) {
      finishedDateTimeText += '\n';
    }
    finishedDateTimeText += `Error: ${row.fetch_task_error}`;
  }

  return (
    <div className="d-flex align-items-center justify-content-start">
      <StatusIcon status={row.fetch_task_status} overlayText={finishedDateTimeText} />
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

  return (
    <div className="d-flex align-items-center justify-content-end">
      <TextButton className="pl-1" variant="primary" disabled={disabled} onClick={onDynamicMixClick} song={row}>
        <Plus className="align-middle" size={24} />
        <span className="align-middle">Dynamic Mix</span>
      </TextButton>
      <TextButton className="pl-1" variant="light" disabled={disabled} onClick={onStaticMixClick} song={row}>
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
  onDeleteDynamicMixClick: (dynamicMix: DynamicMix) => void;
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
      onDeleteDynamicMixClick,
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

    const onSaveEditedCell = (oldValue: string, newValue: string, row: SongData, column: ColumnDescription) => {
      if (oldValue !== newValue && newValue) {
        const id = row.id;
        const dataField = column.dataField;
        axios.patch(`/api/source-track/${id}/`, { [dataField]: newValue });
      }
    };

    // Show static mix details inside expand row
    const expandRow: ExpandRowProps<SongData, string> = {
      renderer: (row: SongData) => {
        return (
          <MixTable
            dynamicMixes={row.dynamic}
            staticMixes={row.static}
            currentSongUrl={currentSongUrl}
            isPlaying={isPlaying}
            onDeleteDynamicMixClick={onDeleteDynamicMixClick}
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
    const columns: ColumnDescription<SongData>[] = [
      {
        dataField: 'status_dummy',
        isDummyField: true,
        editable: false,
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
        editable: false,
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
        editable: false,
        text: 'ID',
        hidden: true,
      },
      {
        dataField: 'title',
        editable: true,
        text: 'Title',
        sort: true,
        validator: (newValue: string) => {
          if (!newValue) {
            return {
              valid: false,
              message: 'Cannot be empty.',
            };
          }
          return true;
        },
      },
      {
        dataField: 'artist',
        editable: true,
        text: 'Artist',
        sort: true,
        validator: (newValue: string) => {
          if (!newValue) {
            return {
              valid: false,
              message: 'Cannot be empty.',
            };
          }
          return true;
        },
      },
      {
        dataField: 'date_created',
        editable: false,
        text: 'Uploaded',
        formatter: toRelativeDateSpan,
        sort: true,
      },
      {
        dataField: 'download_dummy',
        isDummyField: true,
        editable: false,
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
        cellEdit={cellEditFactory({
          mode: 'click',
          blurToSave: true,
          autoSelectText: true,
          afterSaveCell: onSaveEditedCell,
        })}
      />
    );
  }
}

export default SongTable;
