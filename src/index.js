import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
// my imports
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import axios from 'axios';

const teams = (state = [], action ) => {
    switch (action.type) {
        case 'TEAMS_FETCHED':
            return action.teams
        case 'ERROR':
            return ["http error"]
        default:
            return ['empty']
    }
}

const store = createStore(teams);

axios.get('/teams')
    .then(function(response) {
        store.dispatch({
            type: 'TEAMS_FETCHED',
            teams: response.data 
        })
    })
    .catch(function(err) {
        store.dispatch({
            type: 'ERROR'
        })
    });

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
