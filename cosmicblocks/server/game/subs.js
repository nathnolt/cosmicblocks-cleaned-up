const {
	userData,
	gameData
} = require('./vars.js')

let io

function sub_setIo(ioValue) {
	io = ioValue
}

function sub_returnDisplayElo(socketID) {
	var displayElo = Math.round(userData[socketID].elo) - 1000;
	if ((displayElo < 0) || (userData[socketID].gamesPlayed < 10)) {
		displayElo = 0;
	}
	return displayElo;
}


function sub_getLobbyData() {
	var lobbyData = [];
	for (var game in gameData) {
		if (gameData[game].gameState !== 'gameover'); {
			if (typeof userData[gameData[game].creator] !== 'undefined') {
				// this crashed from undefined before. be careful!
				
				// _full is a var used to determine if an open room is full
				// if it is full, then do not render the "Play" button in the lobby.
				var _full, _elo, _opponent, _opponentColor, _opponentElo;
				
				var playerCount = Object.keys(gameData[game].players).length;
				if ((playerCount < gameData[game].maxPlayers)) {
					_full = false;
				} else {
					_full = true;
				}
	
				_elo = sub_returnDisplayElo(gameData[game].creator);

				if (_full) {
					for (player in gameData[game].players) {
						if (player !== gameData[game].creator) {
							if (typeof userData[player] !== 'undefined') {
								_opponent = userData[player].username;
								_opponentColor = userData[player].color;
								_opponentElo = sub_returnDisplayElo(player);
							}
						}
					}
				}
				
				lobbyData.push({
					id: game,
					title: gameData[game].title,
					gameState: gameData[game].gameState,
					full: _full,
					creator: userData[gameData[game].creator].username,
					creatorColor: userData[gameData[game].creator].color,
					opponent: _opponent,
					opponentColor: _opponentColor,
					opponentElo: _opponentElo,
					gameType: gameData[game].gameType,
					creatorElo: _elo
				});
			}
		}
	}
	return lobbyData;
}




function sub_leaderData(callback) {
	console.log('@TODO: implement leader data...')
	
	if(false) {
		
		db.driver.execQuery("SELECT * FROM users ORDER BY elo DESC LIMIT 100", function (err, data) {
			if (err) {
				return callback(err);
			}
			
			var leaderData = [];
			for (var i = 0; i < data.length; i++) {
				if ((data[i].gamesPlayed >= 10) && (Math.round(data[i].elo) > 1000)) {
					leaderData.push({
						displayName: decodeURI(data[i].displayName),
						color: data[i].color,
						gamesPlayed: data[i].gamesPlayed,
						wins: data[i].wins,
						draws: data[i].draws,
						losses: data[i].losses,
						elo: (Math.round(data[i].elo) - 1000)
					});
				}
			}
			return callback(null, leaderData);
		});
		
	}
	if(false) {
		const users = db_getUsersSortedByElo()
		console.log(users)
		const leaderData = []
		for(const user of users) {
			
		}
	} 
	
	
	return callback(null, [
		{displayName: 'testName', color: '#ff0000', gamesPlayed: 10, wins: 10, draws: 0, losses: 0, elo: 250}
	]);
	
}


function sub_updateLobby() {
	// the primary difference between 'update lobby' and 'render lobby'
	// is that 'update lobby' only updates Games and Leaderboard
	// while 'render lobby' renders the lobby including user stats, welcome message, option buttons.
	
	// callback function after gathering data from DB:
	var handleResult = function(err, leaderD) {
		if (err) {
			console.log("handleResult err");
			return;
		}
		// no error
		
		io.to("lobby").emit('update lobby', lobbyD, leaderD);
	}

	var lobbyD = sub_getLobbyData();
	sub_leaderData(handleResult);
}


function sub_renderLobby(socket) {

	// callback function after gathering data from DB:
	var handleResult = function(err, leaderD) {
		if (err) {
			console.log("handleResult err");
			return;
		}
		// no error
		if (lobbyUserData !== false) {
			socket.emit('render lobby', lobbyD, leaderD, lobbyUserData);
		}
	}

	var lobbyD = sub_getLobbyData();
	var lobbyUserData = false;
	if (typeof socket !== 'undefined') {
		lobbyUserData = {
			username : userData[socket.id].username,
			color : userData[socket.id].color,
			gamesPlayed: userData[socket.id].gamesPlayed,
			timePlayed: userData[socket.id].timePlayed,
			wins : userData[socket.id].wins,
			draws : userData[socket.id].draws,
			losses : userData[socket.id].losses,
			displayElo : sub_returnDisplayElo(socket.id),
			remainingRerolls : userData[socket.id].remainingRerolls
		}
	}
	sub_leaderData(handleResult); // gets data from DB
}


module.exports = {
	sub_leaderData,
	sub_returnDisplayElo,
	sub_getLobbyData,
	sub_updateLobby,
	sub_renderLobby,
	sub_setIo,
}
