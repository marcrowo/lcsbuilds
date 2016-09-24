import { combineReducers } from 'redux';
import { createStore } from 'redux';

const httpReducer = (successString, errorString) => {
    return (state = ['loading...'], action ) => {
        switch (action.type) {
            case successString:
                return action.data;
            case errorString:
                return [errorString];
            default:
                return state;
        }
    }
};

const lcsbuilds = combineReducers({
    teams: httpReducer('TEAMS_SUCCESS', 'TEAMS_ERROR'),
    champions: httpReducer('CHAMPIONS_SUCCESS', 'CHAMPIONS_ERROR'),
    players: httpReducer('PLAYERS_SUCCESS', 'PLAYERS_ERROR'),
    match_history: httpReducer('MATCH_HISTORY_SUCCESS', 'MATCH_HISTORY_ERROR'),
    team_match_history: httpReducer('TEAM_MATCH_HISTORY_SUCCESS', 'TEAM_MATCH_HISTORY_ERROR'),
    champion_match_history: httpReducer('CHAMPION_MATCH_HISTORY_SUCCESS', 'CHAMPION_MATCH_HISTORY_ERROR'),
    player_match_history: httpReducer('PLAYER_MATCH_HISTORY_SUCCESS', 'PLAYER_MATCH_HISTORY_ERROR')
});

export default createStore(lcsbuilds);
