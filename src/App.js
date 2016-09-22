import React, { Component } from 'react';
import './App.css';
//my imports
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Header from './Header.js';
import HeaderArray from './HeaderArray.js';
import Matches from './Match.js';
import getData from './getData.js';

const Home = () => {
    return (
        <div>
            <Header/>
            <p className="centered">Search for a team, player, or champion below.</p>
            <input type="text"/>
        </div>
    );
};

const TeamsPresentational = ({ teams }) => {
    return (
        <HeaderArray title={'Teams'} array={teams}/>
    );
};

const ChampionsPresentational = ({ champions }) => {
    return (
        <HeaderArray title={'Champions'} array={champions}/>
    );
};

const PlayersPresentational = ({ players }) => {
    return (
        <HeaderArray title={'Players'} array={players}/>
    );
};

const MatchHistoryPresentational = ({ match_history, length }) => {
    return (
        <div>
            <Header/>
            <h3 className="centered">Match History</h3>
            <Matches matches={match_history} length={length}/>
        </div>
    );
};

class Teams extends Component {
    componentDidMount() {
        getData('/teams', 'TEAMS_SUCCESS', 'TEAMS_ERROR');
    }
    render() {
        return <TeamsPresentational {...this.props}/>;
    }
}

class Champions extends Component {
    componentDidMount() {
        getData('/champions', 'CHAMPIONS_SUCCESS', 'CHAMPIONS_ERROR');
    }
    render() {
        return <ChampionsPresentational {...this.props}/>;
    }
}

class Players extends Component {
    componentDidMount() {
        getData('/players', 'PLAYERS_SUCCESS', 'PLAYERS_ERROR');
    }
    render() {
        return <PlayersPresentational {...this.props}/>;
    }
}

class MatchHistory extends Component {
    componentDidMount() {
        getData('/match_history', 'MATCH_HISTORY_SUCCESS', 'MATCH_HISTORY_ERROR');
    }
    render() {
        if (this.props.match_history.length > 1) {
            return <MatchHistoryPresentational match_history={this.props.match_history.slice(5 * this.props.params.page - 5, 5 * this.props.params.page)} length={this.props.match_history.length}/>;
        }
        else {
            return <MatchHistoryPresentational match_history={this.props.match_history}
                length={this.props.match_history.length}/>
        }
    }
}

const mapStateToProps = (state) => {
    return {
        teams: state.teams,
        champions: state.champions,
        players: state.players,
        match_history: state.match_history
    };
};

Teams = connect(mapStateToProps, null)(Teams);
Champions = connect(mapStateToProps, null)(Champions);
Players = connect(mapStateToProps, null)(Players);
MatchHistory = withRouter(connect(mapStateToProps, null)(MatchHistory));

export {Home, Teams, Champions, Players, MatchHistory};
