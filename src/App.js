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


let get_match_history_array = (props) => {
    let match_history_array;
    if (props.params.team) {
        match_history_array = props.team_match_history;
    }
    else {
        match_history_array = props.match_history;
    }
    return match_history_array;
};

class MatchHistory extends Component {
    componentDidMount() {
        if (this.props.params.team) {
            getData('/team_match_history/' + this.props.params.team, 'TEAM_MATCH_HISTORY_SUCCESS', 'TEAM_MATCH_HISTORY_ERROR', 'team_match_history');
        }
        else {
            getData('/match_history', 'MATCH_HISTORY_SUCCESS', 'MATCH_HISTORY_ERROR');
        }
    }
    componentDidUpdate(prevProps) {
        //TODO
        if (this.props.params.team !== prevProps.params.team) {
            if (this.props.params.team) {
                getData('/team_match_history/' + this.props.params.team, 'TEAM_MATCH_HISTORY_SUCCESS', 'TEAM_MATCH_HISTORY_ERROR', 'team_match_history');
            }
            else {
                getData('/match_history', 'MATCH_HISTORY_SUCCESS', 'MATCH_HISTORY_ERROR');
            }
        }
    }

    render() {
        //FIXME Cannot only getData on render; ex: match_history -> team_history is only 1 get request
        //Current hacky fix does 2 get requests for match_history, also a no no
        //Two different components? But that won't solve team problem (ie. TSM -> CLG will only render once)
        //getData on route change instead would be best, see redux notes ?
        let match_history_array = get_match_history_array(this.props);

        if (match_history_array.length > 1) {
            return <MatchHistoryPresentational match_history={match_history_array.slice(5 * this.props.params.page - 5, 5 * this.props.params.page)} length={match_history_array.length}/>;
        }
        else {
            return <MatchHistoryPresentational match_history={match_history_array}
                length={match_history_array.length}/>
        }
    }
}

const mapStateToProps = (state) => {
    return {
        teams: state.teams,
        champions: state.champions,
        players: state.players,
        match_history: state.match_history,
        team_match_history: state.team_match_history
    };
};

Teams = withRouter(connect(mapStateToProps, null)(Teams));
Champions = connect(mapStateToProps, null)(Champions);
Players = connect(mapStateToProps, null)(Players);
MatchHistory = withRouter(connect(mapStateToProps, null)(MatchHistory));

export {Home, Teams, Champions, Players, MatchHistory};
