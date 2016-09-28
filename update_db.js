"use strict";
var axios = require('axios');
var mongo = require('mongodb')
var MongoClient = mongo.MongoClient;
var url = 'mongodb://localhost/lcsbuilds-test';

// Globals to keep track of completion
var TOTAL = 0;
var COUNTER = 0;
var BAD_COUNTER = 0;

// Set up axios instance in order to have timeout
var axios_instance = axios.create();
//axios_instance.defaults.timeout = 60000;

// Set up the MongoClient connection once and re-use
var db;
MongoClient.connect(url, function(err, connected_db){
    if (err) {
        console.error(err);
    }
    else {
        db = connected_db;
        db.collection('games').createIndex({'game_game_stats.gameCreation': -1});
    }
});

// Helper functions
var generate_md_url = function(tournamentId, matchId) {
    return 'http://api.lolesports.com/api/v2/highlanderMatchDetails?tournamentId=' + tournamentId + '&matchId=' + matchId;
};

var generate_acs_url = function(realm, gameId, gameHash) {
	return 'https://acs.leagueoflegends.com/v1/stats/game/' + realm + '/' + gameId + '?gameHash=' + gameHash;
};

var generate_match_history_url = function(realm, gameId, gameHash) {
    return "http://matchhistory.na.leagueoflegends.com/en/#match-details/" + realm + "/" + gameId + "?gameHash=" + gameHash;
};

var format_game_version = function(gameVersion) {
    var shortVersion = gameVersion.split(".").splice(0, 2);
    //hard code to 6.13.1 etc.
    shortVersion[2] = 1;
    shortVersion = shortVersion.join('.');
    return shortVersion;
};

var check_completion = function() {
	// hacky terminal clear
    /*var lines = process.stdout.getWindowSize()[1];
	for(var i = 0; i < lines; i++) {
	    console.log('\r\n');
    }*/
	var counted = COUNTER + BAD_COUNTER;
	console.log('COUNTER: ' + COUNTER + '; BAD_COUNTER: ' + BAD_COUNTER + "; TOTAL: " + counted + "/" + TOTAL);
	if (COUNTER + BAD_COUNTER == TOTAL) {
        console.log("Added a total of " + COUNTER + " games to db and did not process " + BAD_COUNTER + " games.");
        db.collection('games').find().count()
            .then(function(count) {
                console.log("There are a total of " + count + " items in the database.");
                process.exit();
            })
            .catch(function(err) {
                console.log(err);
                process.exit();
            });
	}	
};

var axios_error_handler = function(error) {
    console.log('AXIOS_ERROR_HANDLER');
    console.log(error.stack);
    //debugging
    //process.exit();

    if (error.response) {
        // The request was made, but the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
    }
    else {
        // Something happened in setting up the request that triggered an Error
        if (error.message) {
            console.log('Error', error.message);
        }
        else {
            console.log(error);
            console.log(error.stack);
        }
    }
    if (error.config) {
        console.log(error.config);
    }
	BAD_COUNTER++;
	check_completion();	
};
// End of helper functions

var get_schedule_items = function(league) {
	var schedulePromise = axios.get('http://api.lolesports.com/api/v1/scheduleItems?leagueId=' + league);
	schedulePromise.then(function(response) {
	    var tournaments = response.data.highlanderTournaments;
		
		// Calculate total
		tournaments.forEach(function(t_o) {
			Object.keys(t_o.brackets).forEach(function(id) {
				var bracket = t_o.brackets[id];
				Object.keys(bracket.matches).forEach(function(id) {
					var match = bracket.matches[id];
					TOTAL += Object.keys(match.games).length;
				});
			});
		});
				
	    tournaments.forEach(function(t_o) {
	        var db_object = {'tournament_title': t_o.title, 'tournament_description': t_o.description,
			'leagueId': league, 'tournament_id': t_o.id};
	        Object.keys(t_o.brackets).forEach(function(id) {
	            var bracket = t_o.brackets[id];
	            Object.assign(db_object, {'bracket': bracket.name, 'bracket_id': bracket.id});

	            Object.keys(bracket.matches).forEach(function(id) {
	                var match = bracket.matches[id];
	                Object.assign(db_object, {'match': match.name, 'match_id': match.id});

	                Object.keys(match.games).forEach(function(id) {
	                    var game = match.games[id];
	                    var slim_game = {'game_realm': game.gameRealm,
	                                     'game_name': game.name,									
	                                     'game_generatedName': game.generatedName,									
	                                     'game_gameId': game.gameId,
	                                     'game_id': game.id,
	                                     'game_matchDetailsURL': generate_md_url(t_o.id, match.id)};
		                Object.assign(db_object, slim_game);
					
						// Use JSON.parse(JSON.stringify(db_object)) to deep copy db_object
						if (db_object.game_gameId !== undefined) {
							get_match_details(JSON.parse(JSON.stringify(db_object)));	
						}
						else { 
							// we don't care about games that don't exist
							TOTAL--;
							check_completion();
						}
	                });
	            });
	        });
	    });
	})
	.catch(function(error) { axios_error_handler(error); });
}

// Use function as closure
var get_match_details = function(db_object) {
	axios_instance.get(db_object.game_matchDetailsURL).then(function(response) {
		db_object.scheduledTime = new Date(response.data.scheduleItems[0].scheduledTime);
		db_object.teams = response.data.teams;
		db_object.players = response.data.players;
		for (let i = 0; i < response.data.videos.length; i++) {
			if (response.data.videos[i].game === db_object.game_id) {
				db_object.videos = response.data.videos[i].source;
				break;
			}
		}
		for (let i = 0; i < response.data.gameIdMappings.length; i++) {
			if (response.data.gameIdMappings[i].id === db_object.game_id) {
				db_object.game_gameHash = response.data.gameIdMappings[i].gameHash;
				db_object.game_acs_url = generate_acs_url(db_object.game_realm, db_object.game_gameId, db_object.game_gameHash);
				db_object.game_match_history_url = generate_match_history_url(db_object.game_realm, db_object.game_gameId, db_object.game_gameHash);
				break;
			}
		}
		if (db_object.game_acs_url !== undefined) {
			get_game_stats(JSON.parse(JSON.stringify(db_object)));
		}
		else {
			TOTAL--;
			check_completion();
		}
	})
	.catch(function(error) { axios_error_handler(error) });
};

var get_game_stats = function(db_object) {
    axios_instance.get(db_object.game_acs_url)
        .then(function(response) {
            var gameVersion = format_game_version(response.data.gameVersion);
            var staticDataPromises = [axios.get('http://ddragon.leagueoflegends.com/cdn/' + gameVersion + '/data/en_US/champion.json'), axios.get('http://ddragon.leagueoflegends.com/cdn/' + gameVersion + '/data/en_US/summoner.json'), axios.get('http://ddragon.leagueoflegends.com/cdn/' + gameVersion + '/data/en_US/mastery.json'), axios.get('http://ddragon.leagueoflegends.com/cdn/' + gameVersion + '/data/en_US/rune.json'), axios.get('http://ddragon.leagueoflegends.com/cdn/' + gameVersion + '/data/en_US/item.json')];
            //add response to array so we can use Promise.all 
            staticDataPromises.unshift(response);
            return Promise.all(staticDataPromises);
        })
        .then(function(responseAndStaticData) {
            var response = responseAndStaticData[0];
            var gameVersion = format_game_version(response.data.gameVersion);
            var CHAMPIONS = responseAndStaticData[1].data;
            var SUMMONERS = responseAndStaticData[2].data;
            var MASTERIES = responseAndStaticData[3].data;
            var RUNES = responseAndStaticData[4].data;
            var ITEMS = responseAndStaticData[5].data;

            db_object.game_game_stats = response.data;

            var participants = db_object.game_game_stats.participants;
            participants.forEach(function(participant, index) {
                Object.keys(CHAMPIONS.data).forEach(function(champName) {
                    if (CHAMPIONS.data[champName].key === participant.championId.toString()) {
                        participants[index].championName = champName;
                        participants[index].championImage = 'http://ddragon.leagueoflegends.com/cdn/' + gameVersion + '/img/champion/' + CHAMPIONS.data[champName].image.full;
                    }
                });

                Object.keys(SUMMONERS.data).forEach(function(summonerName) {
                    if (SUMMONERS.data[summonerName].key === participant.spell1Id.toString()) {
                        participants[index].spell1Name = SUMMONERS.data[summonerName].name;
                        participants[index].spell1Image = 'http://ddragon.leagueoflegends.com/cdn/' + gameVersion + '/img/spell/' + SUMMONERS.data[summonerName].image.full;
                    }
                    if (SUMMONERS.data[summonerName].key === participant.spell2Id.toString()) {
                        participants[index].spell2Name = SUMMONERS.data[summonerName].name;
                        participants[index].spell2Image = 'http://ddragon.leagueoflegends.com/cdn/' + gameVersion + '/img/spell/' + SUMMONERS.data[summonerName].image.full;
                    }
                });

                participant.masteries.forEach(function(mastery, masteryIndex) {
                    participants[index].masteries[masteryIndex].name = MASTERIES.data[mastery.masteryId].name;
                    participants[index].masteries[masteryIndex].description = MASTERIES.data[mastery.masteryId].description;
                    participants[index].masteries[masteryIndex].image = 'http://ddragon.leagueoflegends.com/cdn/' + gameVersion + '/img/mastery/' + MASTERIES.data[mastery.masteryId].image.full;
                });

                participant.runes.forEach(function(rune, runeIndex) {
                    participants[index].runes[runeIndex].name = RUNES.data[rune.runeId].name;
                    participants[index].runes[runeIndex].description = RUNES.data[rune.runeId].description;
                    participants[index].runes[runeIndex].image = 'http://ddragon.leagueoflegends.com/cdn/' + gameVersion + '/img/rune/' + RUNES.data[rune.runeId].image.full;
                });

                let itemIds = [participant.stats.item0, participant.stats.item1, participant.stats.item2,
                    participant.stats.item3, participant.stats.item4, participant.stats.item5,
                    participant.stats.item6];

                participants[index].stats.items = [];
                itemIds.forEach(function(itemId, itemIdIndex) {
                    var itemObject = {};

                    // there is no item
                    if (itemId === 0) {
                        itemObject.name = null;
                        itemObject.description = null;
                        itemObject.image = null;
                    }
                    else {
                        itemObject.name = ITEMS.data[itemId].name;
                        itemObject.description = ITEMS.data[itemId].plaintext;
                        itemObject.image = 'http://ddragon.leagueoflegends.com/cdn/' + gameVersion + '/img/item/' + ITEMS.data[itemId].image.full;
                    }
                    participants[index].stats.items.push(itemObject);
                });
            });

            db.collection('games').find({"game_id": db_object.game_id}).count().then(function(count) {
                if (count == 0) {
                    db.collection('games').insert(db_object).then(function(response) {
                        COUNTER++;
                        check_completion();
                    })
                        .catch(function(error) {
                            BAD_COUNTER++;
                            check_completion();
                        });
                }
                else {
                    COUNTER++;
                    check_completion();
                }
            })
                .catch(function(error) {
                    BAD_COUNTER++;
                    check_completion();
                });
        })
        .catch(function(error) { axios_error_handler(error) });
};

var main = function() {
	// In future, check DB for last update
	// If more than X days, update DB
	get_schedule_items(2);
};

if (require.main === module) {
	main();
}
