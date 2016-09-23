import React, { Component } from 'react';
import './App.css';
//my imports
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router';
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
        <div>
            <Header/>
            <h3>Teams</h3>
            <ul>
                {teams.map((team) => 
                        <li key={team}><Link to={"/teams/" + team + "/1"}>{team}</Link></li>
                )}
            </ul>
        </div>
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

const getDataBasedOnProps = (props) => {
    if (props.params.team) {
        getData('/team_match_history/' + props.params.team, 'TEAM_MATCH_HISTORY_SUCCESS', 'TEAM_MATCH_HISTORY_ERROR', 'team_match_history', true);
    }
    else if (props.params.champion) {
        getData('/champion_match_history/' + props.params.champion, 'CHAMPION_MATCH_HISTORY_SUCCESS', 'CHAMPION_MATCH_HISTORY_ERROR', 'champion_match_history', true);
    }
    // default case is match_history
    else {
        getData('/match_history', 'MATCH_HISTORY_SUCCESS', 'MATCH_HISTORY_ERROR');
    }
};

class MatchHistory extends Component {
    componentDidMount() {
        getDataBasedOnProps(this.props);
    }
    componentDidUpdate(prevProps) {
        //if team changed or went from defined to undefined, same for champion
        if (this.props.params.team !== prevProps.params.team
            || this.props.params.champion !== prevProps.params.champion) {
                getDataBasedOnProps(this.props);
        }
    }

    render() {
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

//TODO Multiple mapStateToProps? Most components only need one state prop
const mapStateToProps = (state) => {
    return {
        teams: state.teams,
        champions: state.champions,
        players: state.players,
        match_history: state.match_history,
        team_match_history: state.team_match_history,
        champion_match_history: state.team_match_history
    };
};

Teams = withRouter(connect(mapStateToProps, null)(Teams));
Champions = connect(mapStateToProps, null)(Champions);
Players = connect(mapStateToProps, null)(Players);
MatchHistory = withRouter(connect(mapStateToProps, null)(MatchHistory));

export {Home, Teams, Champions, Players, MatchHistory};
