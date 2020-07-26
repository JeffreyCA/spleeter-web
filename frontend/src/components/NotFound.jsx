import React, { Component } from 'react'
import HomeNavBar from './Nav/HomeNavBar'

class NotFound extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <HomeNavBar onUploadClick={this.onUploadClick} />
        <div className="jumbotron jumbotron-fluid bg-transparent">
          <div className="container secondary-color">
            <h1>Not Found</h1>
          </div>
        </div>
      </div>
    )
  }
}

export default NotFound;
