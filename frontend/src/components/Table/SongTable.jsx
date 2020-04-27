import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { Button, Badge, Card, Col, ListGroup, Row } from 'react-bootstrap';
import { CaretDownFill, CaretUpFill, ChevronDown, ChevronUp } from 'react-bootstrap-icons';
import CustomAudioPlayer from './CustomAudioPlayer'
import SeparatedSongTable from './SeparatedSongTable'
import SpleetButton from './SpleetButton'

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-h5-audio-player/lib/styles.css';
import './SongTable.css'

const SCREEN_WIDTH_BREAKPOINT = 992

const actionFormatter = (cell, row, rowIndex, formatExtraData) => {
  const { minimal, onSpleetClick } = formatExtraData
  const { source_url } = row

  return (
    <div className="d-flex align-items-center">
      <CustomAudioPlayer isMinimal={minimal} sourceUrl={source_url} />
      <SpleetButton isMinimal={minimal} onSpleetClick={onSpleetClick} song={row} />
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
      windowWidth: 0,
      sort: { dataField: 'title', order: 'asc' }
    }
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
  }

  updateWindowDimensions = () => {
    this.setState({ windowWidth: window.innerWidth });
  };

  render() {
    const { windowWidth, sort } = this. state;
    const { data, onSpleetClick } = this.props;
    const columns = [
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
        dataField: 'source_url',
        text: '',
        formatter: actionFormatter,
        formatExtraData: { minimal: windowWidth < SCREEN_WIDTH_BREAKPOINT, onSpleetClick: onSpleetClick }
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
