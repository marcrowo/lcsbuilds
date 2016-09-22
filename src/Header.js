import React, { Component } from 'react';
import { Link } from 'react-router';
import { withRouter } from 'react-router';

class Header extends Component {
    render() {
        return (
            <div className="App-header">
                <Link to="/">
                    <h2>lcsbuilds-react</h2>
                </Link>
                <Link to="/teams" activeClassName="active">Teams</Link> &nbsp;
                <Link to="/champions" activeClassName="active">Champions</Link> &nbsp;
                <Link to="/players" activeClassName="active">Players</Link> &nbsp;
                <Link to="/match_history/page/1"
                    className={window.location.pathname.search('match_history') !== -1 ? "active" : null}>
                    Match History
                </Link> &nbsp;
            </div>
        );
    };
};

export default withRouter(Header);
