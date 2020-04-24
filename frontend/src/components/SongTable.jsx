import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { Button, Col, Row } from 'react-bootstrap';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './SongTable.css'


import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { Icon } from '@iconify/react'
import playCircle from '@iconify/icons-mdi/play-circle'
import pauseCircle from '@iconify/icons-mdi/pause-circle'
import stopCircle from '@iconify/icons-mdi/stop-circle'

const SCREEN_WIDTH_BREAKPOINT = 992

const actionFormatter = (cell, row, rowIndex, formatExtraData) => {
  const { minimal } = formatExtraData
  const onPause = (e) => {
    if (minimal) {
      const { target } = e;
      target.currentTime = 0
      console.log('stopped playback')
    } else {
      console.log('paused playback')
    }
  }

  const pauseIcon = minimal ? <Icon className="stop-icon" icon={stopCircle}/>
                            : <Icon className="pause-icon" icon={pauseCircle}/>

  return (
    <AudioPlayer
      src="https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3"
      showJumpControls={false}
      customVolumeControls={[]}
      customAdditionalControls={[]}
      layout="horizontal"
      onPause={onPause}
      customIcons={{ pause: pauseIcon }}
    />
  );
}

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
    const { data } = this.props;
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
        formatExtraData: { minimal: windowWidth < SCREEN_WIDTH_BREAKPOINT }
      }]
    return (
      <BootstrapTable bootstrap4={true}
        keyField='id'
        data={data}
        columns={columns}
        sort={sort}
        striped
        hover />
    );
  }
}

export default SongTable;
