import React from 'react'
import { CaretDownFill, CaretUpFill } from 'react-bootstrap-icons'
import BootstrapTable from 'react-bootstrap-table-next'
import { toRelativeDateSpan } from '../../Utils'
import PausePlayButton from './PausePlayButton'
import ProcessedSongTable from './ProcessedSongTable'
import DeleteButton from './DeleteButton'
import SpleetButton from './SpleetButton'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'
import './SongTable.css'

/**
 * Formatter function for play column
 */
const playColFormatter = (cell, row, rowIndex, formatExtraData) => {
  const {
    currentSongUrl,
    isPlaying,
    handleSrcSongPause,
    handleSrcSongPlay
  } = formatExtraData
  const isPlayingCurrent = isPlaying && currentSongUrl === row.url
  const isDisabled = !row.url

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
  )
}

/**
 * Formatter function for separate button column. 
 */
const spleetColFormatter = (cell, row, rowIndex, formatExtraData) => {
  const { onDeleteClick, onSpleetClick } = formatExtraData
  return (
    <div className="d-flex align-items-center justify-content-center">
      <SpleetButton onClick={onSpleetClick} song={row} />
      <DeleteButton onClick={onDeleteClick} song={row} />
    </div>
  )
}

/**
 * Component for the song table, containing the uploaded songs and their processed tracks.
 */
class SongTable extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {
      data,
      currentSongUrl,
      isPlaying,
      expandedIds,
      onDeleteClick,
      onSpleetClick,
      onSepSongPauseClick,
      onSepSongPlayClick,
      onSrcSongPauseClick,
      onSrcSongPlayClick,
      onExpandRow,
      onExpandAll
    } = this.props

    // Show processed song details inside expand row
    const expandRow = {
      renderer: row => {
        return (
          <ProcessedSongTable
            data={row.processed}
            currentSongUrl={currentSongUrl}
            isPlaying={isPlaying}
            onPauseClick={onSepSongPauseClick}
            onPlayClick={onSepSongPlayClick}
          />
        )
      },
      expanded: expandedIds,
      onExpand: onExpandRow,
      onExpandAll: onExpandAll,
      showExpandColumn: true,
      expandColumnPosition: 'right',
      expandByColumnOnly: true,
      expandHeaderColumnRenderer: ({ isAnyExpands }) => {
        return isAnyExpands ? <CaretUpFill /> : <CaretDownFill />
      },
      expandColumnRenderer: ({ expanded }) => {
        return expanded ? <CaretUpFill /> : <CaretDownFill />
      }
    }
    // Song table columns
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
          return { width: '65px' }
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
        sort: true
      },
      {
        dataField: 'artist',
        text: 'Artist',
        sort: true
      },
      {
        dataField: 'date_created',
        text: 'Uploaded',
        formatter: toRelativeDateSpan,
        sort: true
      },
      {
        dataField: 'download_dummy',
        isDummyField: true,
        text: '',
        formatter: spleetColFormatter,
        formatExtraData: {
          onDeleteClick: onDeleteClick,
          onSpleetClick: onSpleetClick
        }
      }
    ]
    const sort = [{ dataField: 'date_created', order: 'desc' }]
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
    )
  }
}

export default SongTable
