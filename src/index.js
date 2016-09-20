import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
// my imports
import { createStore } from 'redux';
import { combineReducers } from 'redux';
import { Provider } from 'react-redux';
import axios from 'axios';

const httpReducer = (success, error) => {
    return (state = ['empty'], action ) => {
        switch (action.type) {
            case success:
                return action.data;
            case error:
                return ['error'];
            default:
                return state;
        }
    }
}

const lcsbuilds = combineReducers({
    teams: httpReducer('TEAMS_SUCCESS', 'TEAMS_ERROR'),
    champions: httpReducer('CHAMPIONS_SUCCESS', 'CHAMPIONS_ERROR'),
});

const store = createStore(lcsbuilds);

axios.get('/teams')
    .then(function(response) {
        store.dispatch({
            type: 'TEAMS_SUCCESS',
            data: response.data,
        })
    })
    .catch(function(err) {
        store.dispatch({
            type: 'TEAMS_ERROR',
        })
    });

axios.get('/champions')
    .then(function(response) {
        store.dispatch({
            type: 'CHAMPIONS_SUCCESS',
            data: response.data,
        })
    })
    .catch(function(err) {
        store.dispatch({
            type: 'CHAMPIONS_ERROR',
        })
    });

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
