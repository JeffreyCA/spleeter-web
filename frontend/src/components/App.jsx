import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MyNavBar from './MyNavBar'
import Home from './Home'
import UploadDialog from './Upload/UploadDialog'

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      showUploadModal: false
    };
  }

  onUploadClick = () => {
    this.setState({ showUploadModal: true });
  }

  handleUploadModalClose = () => {
    this.setState({ showUploadModal: false });
  }

  render() {
    const { showUploadModal } = this.state;

    return (
      <div className="App">
        <Router>
          <div>
            <MyNavBar onUploadClick={this.onUploadClick} />
            <Switch>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </div>
        </Router>
        <UploadDialog show={showUploadModal} close={this.handleUploadModalClose} />
      </div>
    );
  }
}

export default App;
