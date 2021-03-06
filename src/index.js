import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// my imports
import { Provider } from 'react-redux';
import { Router, Route, Redirect, browserHistory } from 'react-router';
import { Home, Teams, Champions, Players, MatchHistory } from './App.js';
import store from './Store.js';

ReactDOM.render(
    <Provider store={store}>
        <Router onUpdate={() => window.scrollTo(0, 0)} history={browserHistory}>
            <Route path="/" component={Home} />
            <Route path="/teams" component={Teams} />
            <Route path="/teams/:team/:page" component={MatchHistory} />
            <Route path="/champions" component={Champions} />
            <Route path="/champions/:champion/:page" component={MatchHistory} />
            <Route path="/players" component={Players} />
            <Route path="/players/:player/:page" component={MatchHistory} />
            <Route path="/match_history/page/:page" component={MatchHistory} />
            <Redirect from='/match_history' to='/match_history/page/1'/>
            <Redirect from='*' to='/'/>
        </Router>
    </Provider>,
    document.getElementById('root')
);
