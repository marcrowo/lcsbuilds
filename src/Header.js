import React, { Component } from 'react';
import { Link } from 'react-router'

const Header = () => {
    return (
        <div className="App-header">
            <Link to="/">
                <h2>lcsbuilds-react</h2>
            </Link>
            <Link to="/teams">Teams</Link> &nbsp;
            <Link to="/champions">Champions</Link> &nbsp;
            <Link to="/players">Players</Link> &nbsp;
            <Link to="/match_history">Match History</Link> &nbsp;
        </div>
    );
};

export default Header;
