import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
import getData from './getData.js';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { browserHistory } from 'react-router';

//https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
function escapeRegexCharacters(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSuggestions(props, value) {
    //generate master suggestions array from props
    let teams = props.teams.map(function(team) {
        return {value: team, display: team + ' (team)', type: 'TEAM'};
    });
    let champions = props.champions.map(function(champion) {
        return {value: champion, display: champion + ' (champion)', type: 'CHAMPION'};
    });
    let players = props.players.map(function(player) {
        return {value: player, display: player + ' (player)', type: 'PLAYER'};
    });

    let suggestions = teams.concat(champions).concat(players);

    const escapedValue = escapeRegexCharacters(value.trim());

    if (escapedValue === '') {
        return [];
    }

    const regex = new RegExp(escapedValue, 'i');

    return suggestions.filter(input => regex.test(input.value));
}

function getSuggestionValue(suggestion) {
    return suggestion.value;
}

function renderSuggestion(suggestion) {
    return (
        <span>{suggestion.display}</span>
    );
}

function onSuggestionSelected(event, { suggestion, suggestionValue, sectionIndex, method }) {
    // navigate to route based on suggestion type
    switch(suggestion.type) {
        case 'TEAM':
            browserHistory.push('/teams/' + suggestion.value + '/1');
            break;
        case 'CHAMPION':
            browserHistory.push('/champions/' + suggestion.value + '/1');
            break;
        case 'PLAYER':
            browserHistory.push('/players/' + suggestion.value + '/1');
            break;
    }
}

class Example extends Component {
    constructor() {
        super();

        //initialize suggestions data with getData? or just use axios and add another GET route?
        getData('/teams', 'TEAMS_SUCCESS', 'TEAMS_ERROR');
        getData('/champions', 'CHAMPIONS_SUCCESS', 'CHAMPIONS_ERROR');
        getData('/players', 'PLAYERS_SUCCESS', 'PLAYERS_ERROR');

        this.state = {
            value: '',
            suggestions: []
        };    
    }

    onChange = (event, { newValue, method }) => {
        this.setState({
            value: newValue
        });
    };

    onSuggestionsFetchRequested = ({ value }) => {
        this.setState({
            suggestions: getSuggestions(this.props, value)
        });
    };

    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });
    };

    render() {
        const { value, suggestions } = this.state;
        const inputProps = {
            placeholder: "Search for a team, player, or champion below.",
            value,
            onChange: this.onChange
        };

        return (
            <Autosuggest 
                suggestions={suggestions}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                onSuggestionSelected={onSuggestionSelected}
                renderSuggestion={renderSuggestion}
                inputProps={inputProps}
                focusFirstSuggestion={true}
            />
        );
    }
}

const mapStateToProps = (state) => {
    return {
        teams: state.teams,
        champions: state.champions,
        players: state.players
    };
};

export default withRouter(connect(mapStateToProps, null)(Example));
