import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/Home/Home';
import Mixer from './components/Mixer/Mixer';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

const routing = (
  <Router>
    <div>
      <Switch>
        <Route path="/mixer/:mixId" component={Mixer} />
        <Route component={Home} />
      </Switch>
    </div>
  </Router>
);

ReactDOM.render(routing, document.getElementById('react'));
