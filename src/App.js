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

const App = ({ teams }) => {
    return (
        <div className="App">
        <div className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h2>lcsbuilds-react</h2>
        </div>
        <ArrayList array={teams}/>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        teams: state
    };
};

export default connect(mapStateToProps, null)(App);
