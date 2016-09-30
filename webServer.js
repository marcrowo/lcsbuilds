"use strict";

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var axios = require('axios');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = 'mongodb://localhost/lcsbuilds-test';
var keys = require('./secretKeys');

// Set up the MongoClient connection once and re-use
var db;
var games;

MongoClient.connect(url, function(err, connected_db){
    if (err) {
        console.error(err);
    }
    else {
        db = connected_db;
        games = db.collection('games');
    }
});

//Use the body parser in order to parse JSON POST requests
app.use(bodyParser.json());

//Enable CORS requests
app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
});

app.get('/teams', function(request, response) {
    //TODO Efficient way of getting both team and acronym? Probably need to change update_db.js or use 
    //aggregate query (see stackoverflow)
    //This will make teams page look nicer, though not needed for functionality purposes (unless two teams
    //have the same acronym!)
    games.distinct('teams.acronym')
        .then(function(teams) {
            teams.sort();
            console.log('Found ' + teams.length + ' teams.');
            response.status(200).send(teams);
        })
        .catch(function(err) {
            console.error(err);
            response.status(400).send(err);
        })
});

app.get('/players', function(request, response) {
    games.distinct('game_game_stats.participantIdentities.player.summonerName')
        .then(function(players) {
            players.sort();
            console.log('Found ' + players.length + ' players.');
            response.status(200).send(players);
        })
        .catch(function(err) {
            console.error(err);
            response.status(400).send(err);
        })
});

app.get('/champions', function(request, response) {
    // Riot static API 
    axios.get('https://global.api.pvp.net/api/lol/static-data/na/v1.2/champion?api_key=' + keys.RIOT_API_KEY);
        .then(function(champions_response) {
            var champions = [];
            for (var champion_key in champions_response.data.data) {
                champions.push(champions_response.data.data[champion_key].name);
            } 
            champions.sort();
            console.log("Found " + champions.length + " champions.");
            response.status(200).send(champions);
        })
        .catch(function(err) {
            console.error(err);
            response.status(400).send(err);
        })
});

var format_games = function(games, championName = null, playerName = null) {
    let formattedGames = [];
    games.forEach(function(game) {
        let gameObject = {};
        let split = game.game_generatedName.split('|');
        split.pop();
        let gameNum = split.pop();
        //keep team names in alpha order for consistency
        split.sort();
        split.push(gameNum);

        gameObject.name = split[0] + ' vs. ' + split[1] + ' ' + split[2];
        gameObject.date = game.game_game_stats.gameCreation;

        gameObject.players = [];
        game.game_game_stats.participants.forEach(function(participant, index) {
            let player = {};

            game.game_game_stats.teams.forEach(function(team) {
                if (team.teamId === participant.teamId) {
                    player.win = team.win === "Win";
                }
            });

            player.name = game.game_game_stats.participantIdentities[index].player.summonerName;

            player.championName = participant.championName;

            // if querying for specific champion / player
            if (championName !== null && player.championName !== championName
                || playerName !== null && player.name !== playerName) {
                    return;
                }

            player.championImage = participant.championImage;

            player.spell1 = participant.spell1Name;
            player.spell1Image = participant.spell1Image;
            player.spell2 = participant.spell2Name;
            player.spell2Image = participant.spell2Image;

            player.kills = participant.stats.kills;
            player.deaths = participant.stats.deaths;
            player.assists = participant.stats.assists;

            player.items = participant.stats.items;

            player.gold = participant.stats.goldEarned;
            player.cs = participant.stats.totalMinionsKilled;

            player.role = participant.timeline.role;
            player.lane = participant.timeline.lane;

            player.link = game.game_match_history_url + '&tab=builds&participant=' + participant.participantId;

            gameObject.players.push(player);
        });

        formattedGames.push(gameObject);
    });
    return formattedGames;
};

app.get('/match_history', function(request, response) {
    //Don't forget to add game_game_stats.gameCreation -1 index!
    //TODO Limit to most recent (100?) games... BEFORE SENDING (ie. keep iterating until hit 100
    //This may help speed as well? USE LIMIT ON QUERY!!!
    games.find({}, {_id: 0, 'game_generatedName': 1, 'game_game_stats': 1, 'game_match_history_url': 1}).sort({'game_game_stats.gameCreation': -1}).toArray()
        .then(function(games) {
            let formattedGames = format_games(games);
            response.status(200).send(formattedGames);
        })
        .catch(function(err) {
            console.log(err);
            response.status(400).send(err);
        });
});

app.get('/team_match_history/:team', function(request, response) {
    games.find({'teams': {$elemMatch: {'acronym': request.params.team}}}, {_id: 0, 'game_generatedName': 1, 'game_game_stats': 1, 'game_match_history_url': 1}).sort({'game_game_stats.gameCreation': -1}).toArray()
        .then(function(games) {
            if (games.length !== 0) {
                let formattedGames = format_games(games);
                console.log(formattedGames.length);
                response.status(200).send(formattedGames);
            }
            else {
                response.status(200).send(['No Games Found']);
            }
        })
        .catch(function(err) {
            console.log(err);
            response.status(400).send(err);
        });
});

app.get('/champion_match_history/:champion', function(request, response) {
    games.find({'game_game_stats.participants.championName': request.params.champion}, {_id: 0, 'game_generatedName': 1, 'game_game_stats': 1, 'game_match_history_url': 1}).sort({'game_game_stats.gameCreation': -1}).toArray()
        .then(function(games) {
            if (games.length !== 0) {
                let formattedGames = format_games(games, request.params.champion);
                console.log(formattedGames.length);
                response.status(200).send(formattedGames);
            }
            else {
                response.status(200).send(['No Games Found']);
            }
        })
        .catch(function(err) {
            console.log(err);
            response.status(400).send(err);
        });
});

app.get('/player_match_history/:player', function(request, response) {
    games.find({'game_game_stats.participantIdentities': {$elemMatch: {'player.summonerName': request.params.player}}}, {_id: 0, 'game_generatedName': 1, 'game_game_stats': 1, 'game_match_history_url': 1}).sort({'game_game_stats.gameCreation': -1}).toArray()
        .then(function(games) {
            if (games.length !== 0) {
                let formattedGames = format_games(games, null, request.params.player);
                console.log(formattedGames.length);
                response.status(200).send(formattedGames);
            }
            else {
                response.status(200).send(['No Games Found']);
            }
        })
        .catch(function(err) {
            console.log(err);
            response.status(400).send(err);
        });
});

app.listen(3000);
