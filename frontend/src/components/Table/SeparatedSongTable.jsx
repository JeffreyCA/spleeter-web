import React, { Component } from 'react'
import BootstrapTable from 'react-bootstrap-table-next';
import { Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import PausePlayButton from './PausePlayButton'

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './SeparatedSongTable.css'

const statusVariantMap = {
  'Done': 'success',
  'Error': 'danger',
  'In Progress': 'primary',
  'Created': 'secondary'
}

const playColFormatter = (cell, row, rowIndex, formatExtraData) => {
  const { currentSongUrl, isPlaying, onPauseClick, onPlayClick } = formatExtraData
  const isPlayingCurrent = isPlaying && currentSongUrl === row.url

  return (
    <div className="d-flex align-items-center justify-content-center">
      <PausePlayButton playing={isPlayingCurrent} disabled={!row.url} song={row} onPauseClick={onPauseClick} onPlayClick={onPlayClick} />
    </div>
  );
}

const downloadFormatter = (cell, row, rowIndex) => {
  const { url } = row
  if (url) {
    return (
      <a href={url}>Link</a>
    );
  } else {
    return null
  }
}

class SeparatedSongTable extends Component {
  render() {
    const { data, currentSongUrl, isPlaying, onPauseClick, onPlayClick } = this.props
    const columns = [
      {
        dataField: 'url',
        text: '',
        formatter: playColFormatter,
        formatExtraData: {
          currentSongUrl: currentSongUrl,
          isPlaying: isPlaying,
          onPauseClick: onPauseClick,
          onPlayClick: onPlayClick
        },
        headerStyle: () => {
          return { width: '65px' };
        }
      },
      {
        dataField: 'parts',
        isDummyField: true,
        text: 'Included parts',
        formatter: (cellContent, row) => {
          const vocalBadge = row.vocals ? <Badge pill variant="secondary">Vocals</Badge> : null
          const drumsBadge = row.drums ? <Badge pill variant="secondary">Drums</Badge> : null
          const bassBadge = row.bass ? <Badge pill variant="secondary">Bass</Badge> : null
          const otherBadge = row.other ? <Badge pill variant="secondary">Other</Badge> : null
          return (
            <h5 className="mb-0">{vocalBadge} {drumsBadge} {bassBadge} {otherBadge}</h5>
          );
        }
      },
      {
        dataField: 'status',
        text: 'Status',
        formatter: (cellValue, row) => {
          const variant = cellValue ? statusVariantMap[cellValue] : 'secondary'
          const badgeLabel = cellValue ? cellValue : 'Other'

          if (cellValue === 'Error') {
            function renderErrorTooltip(props) {
              return (
                <Tooltip id="button-tooltip" {...props}>
                  {row.error}
                </Tooltip>
              );
            }
            const ErrorOverlay = () => (
              <OverlayTrigger
                placement="right"
                delay={{ show: 100, hide: 100 }}
                overlay={renderErrorTooltip}>
                <Badge variant={variant}>{badgeLabel}</Badge>
              </OverlayTrigger>
            );
            return <h5 className="mb-0"><ErrorOverlay /></h5>
          }
          return (
            <h5 className="mb-0"><Badge variant={variant}>{badgeLabel}</Badge></h5>
          );
        },
        sort: true
      },
      {
        dataField: 'file',
        text: 'Download',
        formatter: downloadFormatter
      },
    ]
    const sort = { dataField: 'status', order: 'asc' }

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
            bordered={false} />
        </div>
      )
    } else {
      return (
        <div className="m-4 text-center">
          <p>No separated tracks. Press the "Spleet" button to separate this song.</p>
        </div>
      )
    }
  }
}

export default SeparatedSongTable
