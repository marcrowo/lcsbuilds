import React, { Component } from 'react';
import { Link } from 'react-router'

const Header = () => {
    return (
        <div className="App-header">
            <Link to="/">
                <h2>lcsbuilds-react</h2>
            </Link>
            <Link to="/teams" activeClassName="active">Teams</Link> &nbsp;
            <Link to="/champions" activeClassName="active">Champions</Link> &nbsp;
            <Link to="/players" activeClassName="active">Players</Link> &nbsp;
            <Link to="/match_history" activeClassName="active">Match History</Link> &nbsp;
        </div>
    );
};

export default Header;
