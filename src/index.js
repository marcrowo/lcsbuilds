import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
// my imports
import { createStore } from 'redux';
import { combineReducers } from 'redux';
import { Provider } from 'react-redux';
import axios from 'axios';

const httpReducer = (successString, errorString) => {
    return (state = ['empty'], action ) => {
        switch (action.type) {
            case successString:
                return action.data;
            case errorString:
                return ['error'];
            default:
                return state;
        }
    }
};

const lcsbuilds = combineReducers({
    teams: httpReducer('TEAMS_SUCCESS', 'TEAMS_ERROR'),
    champions: httpReducer('CHAMPIONS_SUCCESS', 'CHAMPIONS_ERROR'),
    players: httpReducer('PLAYERS_SUCCESS', 'PLAYERS_ERROR')
});

const store = createStore(lcsbuilds);

const getData = (url, successString, errorString) => {
    axios.get(url)
        .then(function(response) {
            store.dispatch({
                type: successString,
                data: response.data,
            })
        })
        .catch(function(err) {
            store.dispatch({
                type: errorString,
            })
        });
};

getData('/teams', 'TEAMS_SUCCESS', 'TEAMS_ERROR');
getData('/champions', 'CHAMPIONS_SUCCESS', 'CHAMPIONS_ERROR');
getData('/players', 'PLAYERS_SUCCESS', 'PLAYERS_ERROR');

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
