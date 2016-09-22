import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

class Pagination extends Component {
    render() {
        //FIXME Using <Link> means that <Pagination> is not re-rendered, thus currentPage is out of sync...
        //connect() issue?
        let currentPage = parseInt(window.location.pathname.split('/').pop());

        const previous = <Link to={"/match_history/page/" + String(currentPage - 1)}>&lt;&lt;Previous</Link>;
        const next = <Link to={"/match_history/page/" + String(currentPage + 1)}>Next&gt;&gt;</Link>;

        const showPrevious = currentPage > 1;
        const showNext = currentPage * 5 < this.props.match_history_length;

        if (showPrevious && showNext) {
            return(
                <span className="centered-flex">
                    {previous} &nbsp;
                    {next}
                </span>
            );
        }
        else if (!showPrevious && showNext) {
            return(
                <span className="centered-flex">
                    <span>&lt;&lt;Previous</span> &nbsp;
                    {next}
                </span>
            );
        }
        else if (showPrevious && !showNext) {
            return(
                <span className="centered-flex">
                    {previous}
                    <span>Next&gt;&gt;</span> &nbsp;
                </span>
            );
        }
        else {
            return(
                <span className="centered-flex">
                    <span>&lt;&lt;Previous</span> &nbsp;
                    <span>Next&gt;&gt;</span> &nbsp;
                </span>
            );
        }
    } 
};

const Items = ({ items} ) => (
    <div>
        {items.map((item, index) => (
            <img key={index} className="thumbnail-small"
                src={item.image} alt={item.name ? item.name : ''}
                title={item.name ? item.name + ": " + item.description : "None"}
            />
        ))}
    </div>
); 

const WinBar = ({ win }) => {
    if (win) {
        return (
            <div id="victory-bar"/>
        );
    }
    else {
        return (
            <div id="defeat-bar"/>
        );
    }
};

const Player = ({ player }) => (
    <tr>
        <td><WinBar win={player.win}/></td>
        <td><img className="thumbnail-big" src={player.championImage} alt="champion"/></td>
        <td>
            <img className="thumbnail-small" src={player.spell1Image} alt="spell1"/> 
            <br/>
            <img className="thumbnail-small" src={player.spell2Image} alt="spell2"/>
        </td>
        <td>{player.name}</td>
        <td><Items items={player.items}/></td>
        <td>{player.kills}/{player.deaths}/{player.assists}</td>
        <td>
            <p>
                {player.gold}<img className="thumbnail-small" src='http://ddragon.leagueoflegends.com/cdn/5.5.1/img/ui/gold.png' alt="gold"/>
            </p>
            <p>
                {player.cs}<img className="thumbnail-small" src='http://ddragon.leagueoflegends.com/cdn/5.5.1/img/ui/minion.png' alt="cs"/>
            </p>
        </td>
        <td><a href={player.link}>Details</a></td>
    </tr>
);

const Match = ({ match }) => {
    if (match.name) {
        return (
            <div className="centered">
                <h4>{match.name} -- {new Date(match.date).toISOString().split('T')[0]}</h4>
                <table>
                    <tbody>
                        {match.players.map((player, index) =>
                                <Player key={index} player={player}/>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
    // default/loading state
    else {
        return (
            <p className="centered">{match}</p>
        );
    }
};

const Matches = ({ matches, length}) => {
    return (
        <div>
            <Pagination match_history_length={length}/>
            {matches.map((match, index) =>
                    <Match match={match} key={index}/>
            )}
            <Pagination match_history_length={length}/>
        </div>
    );
};

export default Matches;
