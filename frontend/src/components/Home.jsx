import React, { Component } from 'react';
import SongTable from './SongTable'
import UploadDialog from './Upload/UploadDialog'
import MyNavBar from './MyNavBar'
import axios from 'axios'

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showUploadModal: false,
      songData: []
    }
  }

  onUploadClick = () => {
    this.setState({ showUploadModal: true });
  }

  handleUploadModalClose = () => {
    this.setState({ showUploadModal: false });
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
    const { songData, showUploadModal } = this.state;

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
            <SongTable data={songData} />
          </div>
        </div>
        <UploadDialog show={showUploadModal} close={this.handleUploadModalClose} refresh={this.loadData} />
      </div>
    );
  }
}

export default Home;
