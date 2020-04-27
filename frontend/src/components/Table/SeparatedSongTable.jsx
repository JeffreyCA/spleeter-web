import React, { Component } from 'react'
import BootstrapTable from 'react-bootstrap-table-next';
import { Badge } from 'react-bootstrap';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './SeparatedSongTable.css'

const statusVariantMap = {
  'Done': 'success',
  'Error': 'danger',
  'In Progress': 'primary',
  'Created': 'secondary'
}

const downloadFormatter = (cell, separatedRow, rowIndex) => {
  const { file } = separatedRow
  if (file) {
    return (
      <a href={file}>Link</a>
    );
  } else {
    return null
  }
}

class SeparatedSongTable extends Component {
  columns = [
    {
      dataField: 'parts',
      isDummyField: true,
      text: 'Included parts',
      formatter: (cellContent, row) => {
        const vocalBadge = row.vocals ? <Badge pill variant="primary">Vocals</Badge> : null
        const drumsBadge = row.drums ? <Badge pill variant="danger">Drums</Badge> : null
        const bassBadge = row.bass ? <Badge pill variant="warning">Bass</Badge> : null
        const otherBadge = row.other ? <Badge pill variant="secondary">Other</Badge> : null
        return (
          <h5>{vocalBadge} {drumsBadge} {bassBadge} {otherBadge}</h5>
        );
      }
    },
    {
      dataField: 'status',
      text: 'Status',
      formatter: (cellValue) => {
        const variant = cellValue ? statusVariantMap[cellValue] : 'secondary'
        const badgeLabel = cellValue ? cellValue : 'Other'
        return (
          <h5><Badge variant={variant}>{badgeLabel}</Badge></h5>
        );
      }
    },
    {
      dataField: 'file',
      text: 'Download',
      formatter: downloadFormatter
    },
  ]

  render() {
    const { data } = this.props
    if (data.length > 0) {
      return (
        <div>
          <BootstrapTable
            bootstrap4
            keyField='id'
            data={data}
            columns={this.columns}
            striped />
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
