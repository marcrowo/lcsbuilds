import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
// my imports
import { createStore } from 'redux';
import axios from 'axios';

const teams = (state = [], action ) => {
    switch (action.type) {
        case 'TEAMS_FETCHED':
            return action.teams
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
        console.log(err);
    });

const render = () => {
    ReactDOM.render(
        <App teams={store.getState()}/>,
        document.getElementById('root')
    );
};

store.subscribe(render);
render();
