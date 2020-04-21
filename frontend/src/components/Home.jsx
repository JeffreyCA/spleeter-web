import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Home extends Component {
  render() {
    return (
      <div className="jumbotron jumbotron-fluid bg-transparent">
        <div className="container secondary-color">
          <h1 className="display-4">Spleeter Web</h1>
          <p className="lead">
            Source separation on the go.
          </p>
          <hr className="my-4" />
        </div>
      </div>
    );
  }
}

export default Home;
