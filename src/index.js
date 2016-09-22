import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// my imports
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { Home, Teams, Champions, Players, MatchHistory } from './App.js';
import store from './Store.js';

ReactDOM.render(
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/" component={Home} />
            <Route path="/teams" component={Teams} />
            <Route path="/champions" component={Champions} />
            <Route path="/players" component={Players} />
            <Route path="/match_history(/:page)" component={MatchHistory} />
        </Router>
    </Provider>,
    document.getElementById('root')
);
