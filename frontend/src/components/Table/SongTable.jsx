import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { CaretDownFill, CaretUpFill } from 'react-bootstrap-icons';
import SeparatedSongTable from './SeparatedSongTable'
import SpleetButton from './SpleetButton'
import PausePlayButton from './PausePlayButton'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './SongTable.css'

const playColFormatter = (cell, row, rowIndex, formatExtraData) => {
  const { currentSongUrl, isPlaying, handleSrcSongPause, handleSrcSongPlay } = formatExtraData
  const isPlayingCurrent = isPlaying && currentSongUrl === row.url

  return (
    <div className="d-flex align-items-center justify-content-center">
      <PausePlayButton playing={isPlayingCurrent} song={row} onPauseClick={handleSrcSongPause} onPlayClick={handleSrcSongPlay} />
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

class SongTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sort: { dataField: 'title', order: 'asc' }
    }
  }

  render() {
    const { sort } = this. state;
    const { data, onSpleetClick, currentSongUrl, isPlaying, onSepSongPauseClick, onSepSongPlayClick, onSrcSongPauseClick, onSrcSongPlayClick } = this.props;
    const expandRow = {
      renderer: row => {
        return <SeparatedSongTable data={row.separated} currentSongUrl={currentSongUrl} isPlaying={isPlaying} onPauseClick={onSepSongPauseClick} onPlayClick={onSepSongPlayClick} />
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
    }
    const columns = [
      {
        dataField: 'url',
        text: '',
        formatter: playColFormatter,
        formatExtraData: {
          currentSongUrl: currentSongUrl,
          isPlaying: isPlaying,
          handleSrcSongPause: onSrcSongPauseClick,
          handleSrcSongPlay: onSrcSongPlayClick
        },
        headerStyle: () => {
          return { width: '65px' };
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
        expandRow={expandRow} bordered={false} />
    );
  }
}

export default SongTable;
