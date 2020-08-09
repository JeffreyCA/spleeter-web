import * as React from 'react';
import PlainNavBar from './Nav/PlainNavBar';

class NotFound extends React.Component {
  render(): JSX.Element {
    return (
      <div>
        <PlainNavBar />
        <div className="jumbotron jumbotron-fluid bg-transparent">
          <div className="container secondary-color">
            <h1>Not Found</h1>
          </div>
        </div>
      </div>
    );
  }
}

export default NotFound;
