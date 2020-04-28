import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { CaretDownFill, CaretUpFill } from 'react-bootstrap-icons';
import SeparatedSongTable from './SeparatedSongTable'
import SpleetButton from './SpleetButton'
import PausePlayButton from './PausePlayButton'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-h5-audio-player/lib/styles.css';
import './SongTable.css'

const playColFormatter = (cell, row, rowIndex, formatExtraData) => {
  const { currentSong, isPlaying, handlePause, handlePlay } = formatExtraData
  const isPlayingCurrent = currentSong === row && isPlaying

  return (
    <div className="d-flex align-items-center justify-content-center">
      <PausePlayButton playing={isPlayingCurrent} song={row} onPauseClick={handlePause} onPlayClick={handlePlay} />
    </div>
  );
}

const spleetColFormatter = (cell, row, rowIndex, formatExtraData) => {
  const { onSpleetClick } = formatExtraData
  return (
    <div className="d-flex align-items-center">
      <SpleetButton onClick={onSpleetClick} song={row} />
    </div>
  );
}

const expandRow = {
  renderer: row => {
    return <SeparatedSongTable data={row.separated} />
  },
  showExpandColumn: true,
  expandColumnPosition: 'right',
  expandByColumnOnly: true,
  expandHeaderColumnRenderer: ({ isAnyExpands }) => {
    return (<div className="header-col" onClick={(e) => { e.stopPropagation() }}></div>)
  },
  expandColumnRenderer: ({ expanded }) => {
    return expanded ? <CaretUpFill /> : <CaretDownFill />
  }
};

class SongTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sort: { dataField: 'title', order: 'asc' }
    }
  }

  render() {
    const { sort } = this. state;
    const { data, onSpleetClick, currentSong, isPlaying, onPauseButtonClick, onPlayButtonClick } = this.props;
    const columns = [
      {
        dataField: 'source_url',
        text: '',
        formatter: playColFormatter,
        formatExtraData: {
          currentSong: currentSong,
          isPlaying: isPlaying,
          handlePause: onPauseButtonClick,
          handlePlay: onPlayButtonClick,
          onSpleetClick: onSpleetClick
        }
      },
      {
        dataField: 'id',
        text: 'ID',
        hidden: true
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
        dataField: 'download_dummy',
        isDummyField: true,
        text: 'Separate Source',
        formatter: spleetColFormatter,
        formatExtraData: {
          onSpleetClick: onSpleetClick
        }
      }]
    return (
      <BootstrapTable
        bootstrap4
        keyField='id'
        data={data}
        columns={columns}
        sort={sort}
        expandRow={expandRow} />
    );
  }
}

export default SongTable;
