import React, { Component } from 'react';
import SongTable from './SongTable'
import UploadDialog from './Upload/UploadDialog'
import SpleetModal from './SpleetModal'
import MyNavBar from './MyNavBar'
import axios from 'axios'

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSpleetModal: false,
      showUploadModal: false,
      songData: [],
      sourceId: -1
    }
  }

  onUploadClick = () => {
    this.setState({ showUploadModal: true });
  }

  handleUploadModalClose = () => {
    this.setState({ showUploadModal: false });
  }

  onSpleetClick = (sourceId) => {
    console.log("one spleet clicked: ", sourceId)
    this.setState({ showSpleetModal: true, sourceId: sourceId });
  }

  handleSpleetModalClose = () => {
    this.setState({ showSpleetModal: false, sourceId: -1 });
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    axios.get('/api/song/')
    .then(({ data }) => {
      if (data) {
        this.setState({ songData: data })
      }
    })
    .catch(error => console.log('API errors:', error))
  }

  render() {
    const { songData, showSpleetModal, showUploadModal } = this.state;

    return (
      <div>
        <MyNavBar onUploadClick={this.onUploadClick} />
        <div className="jumbotron jumbotron-fluid bg-transparent">
          <div className="container secondary-color">
            <h1 className="display-4">Spleeter Web</h1>
            <p className="lead">
              Source separation on the go.
            </p>
            <hr className="my-4" />
            <SongTable data={songData} onSpleetClick={this.onSpleetClick} />
          </div>
        </div>
        <UploadDialog show={showUploadModal} close={this.handleUploadModalClose} refresh={this.loadData} />
        <SpleetModal show={showSpleetModal} close={this.handleSpleetModalClose} refresh={this.loadData} />
      </div>
    );
  }
}

export default Home;
