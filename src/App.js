import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
//my imports
import { connect } from 'react-redux';

const ArrayList = ({ array }) => (
    <ul>
        {array.map(element =>
                <li key={element}>
                    {element}
                </li>
        )}
    </ul>
);

const App = ({ teams, champions, players }) => {
    return (
        <div className="App">
        <div className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h2>lcsbuilds-react</h2>
        </div>
        <h3>Teams</h3>
        <ArrayList array={teams}/>
        <h3>Champions</h3>
        <ArrayList array={champions}/>
        <h3>Players</h3>
        <ArrayList array={players}/>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        teams: state.teams,
        champions: state.champions,
        players: state.players
    };
};

export default connect(mapStateToProps, null)(App);
