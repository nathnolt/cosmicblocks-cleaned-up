//
// @TODO: read through all of this and figure out what each function tries to do. 
// And see if it offers interesting functionality that we want.
//

function isGameCreator(socket) {
	console.log('@TODO: implement')
}

function socket_classicMode() {
	var gameID = userData[socket.id].room;
	if (isGameCreator(socket, gameID)) {
		classicMode(gameID);
		io.to(gameID).emit('log', '<span class="dimMsg">classic mode</span>');
		unreadyAll(gameID);
		io.to(gameID).emit('game preset', gameData[gameID].board, gameData[gameID].timeLimit, gameData[gameID].rows, gameData[gameID].cols, gameData[gameID].blockList, gameData[gameID].creator, gameData[gameID].collisionMode);
	}
}

function socket_advancedMode() {
	var gameID = userData[socket.id].room;
	if (isGameCreator(socket, gameID)) {
		advancedMode(gameID);
		// How Deep Is Your Love by Calvin Harris & Disciples is a great song.
		io.to(gameID).emit('log', '<span class="dimMsg">advanced mode</span>');
		unreadyAll(gameID);
		io.to(gameID).emit('game preset', gameData[gameID].board, gameData[gameID].timeLimit, gameData[gameID].rows, gameData[gameID].cols, gameData[gameID].blockList, gameData[gameID].creator, gameData[gameID].collisionMode);
	}
}

function socket_doneEditingGame() {
	var gameID = userData[socket.id].room;
	if (isGameCreator(socket, gameID)) {
		socket.emit('setup game', 
			gameID,
			'creator',
			gameData[gameID].title,
			gameData[gameID].rows, 
			gameData[gameID].cols, 
			gameData[gameID].board, 
			gameData[gameID].players,
			gameData[gameID].gameState,
			gameData[gameID].blockList,
			gameData[gameID].timeLimit,
			gameData[gameID].collisionMode
		);
	}
}

function socket_randomizeGame() {
	var gameID = userData[socket.id].room;
	if (isGameCreator(socket, gameID)) {
		if (gameData[gameID].maxPlayers == 2) {
			
			randomMode(gameID);
			io.to(gameID).emit('log', '<span class="dimMsg">board randomly generated.</span>');
			unreadyAll(gameID);
			io.to(gameID).emit('game preset', gameData[gameID].board, gameData[gameID].timeLimit, gameData[gameID].rows, gameData[gameID].cols, gameData[gameID].blockList, gameData[gameID].creator, gameData[gameID].collisionMode);
		} else {
			// sorry this was only built for 2 players.
			io.to(gameID).emit('log', 'randomization function only works with 2 player games.');
		}
	}
}

function socket_chooseToSpectate() {
	var gameID = userData[socket.id].room;
	
	// @TODO: check if we wanted to check isGameCreator, or just if the gameExists yes / no
	if (gameExists(gameID)) {
		if (gameData[gameID].gameState == 'open') {
			unready(gameID, socket.id);
			delete gameData[gameID].players[socket.id];
			io.to(gameID).emit('log', '<span class="dimMsg">' + userData[socket.id].username + ' is spectating.');
			//io.to(gameID).emit('update colors', gameData[gameID].players, baseColors, gameData[gameID].maxPlayers, gameData[gameID].board);
		}
	} else {
		log_invalidGame(socket)
	}
}


function socket_timeLimitSetting(moreOrLess) {
	var gameID = userData[socket.id].room;
	if (isGameCreator(socket, gameID)) {
		var problem = false;
		if (moreOrLess === 'more') {
			if (gameData[gameID].timeLimit >= 100) {
				gameData[gameID].timeLimit = false;
			} else if (gameData[gameID].timeLimit == false) {
				gameData[gameID].timeLimit = 10;
			} else {
				gameData[gameID].timeLimit += 5;
			}
		} else if (moreOrLess === 'less') {
			if (gameData[gameID].timeLimit == false) {
				gameData[gameID].timeLimit = 100;
			} else if (gameData[gameID].timeLimit <= 10) {
				gameData[gameID].timeLimit = false;
			} else {
				gameData[gameID].timeLimit -= 5;
			}
		} else if (moreOrLess == 'infin') {
			if (gameData[gameID].timeLimit == false) {
				gameData[gameID].timeLimit = 60; 
			} else {
				gameData[gameID].timeLimit = false;
			}
		} else {
			problem = true;
		}
		if (problem) {
			socket.emit('log', '<span class="redMsg">passed incorrect value to <i>time limit setting</i>.</span>');
		} else {
			gameData[gameID].gameType = 'custom';
			gameData[gameID].timerValue = gameData[gameID].timeLimit;
			unreadyAll(gameID);
			io.to(gameID).emit('time limit update', gameData[gameID].timeLimit);
		}
	}
}

function socket_collisionSetting(setting) {
	var gameID = userData[socket.id].room;
	if (isGameCreator(socket, gameID)) {
		var problem = false;
		if ((setting === 3) || (setting === 4) || (setting === 5)) {
			// this code makes me nervous.
			// I'm using both true and 1 as valid, different values.
			// it's a bit scary to me.
			gameData[gameID].collisionMode.permanence = setting;
		} else if (setting === "Permanent") {
			gameData[gameID].collisionMode.permanence = true;
		} else {
			problem = true;
		}
		if (problem) {
			io.to(gameID).emit('log', '<span class="redMsg">passed incorrect value to <i>collision setting</i></span>');
		} else {
			unreadyAll(gameID);
			io.to(gameID).emit('collision update', gameData[gameID].collisionMode);
			updateLobby(); // render lobby because I now show this data in lobby.
		}
	}
}

function socket_boardEdit(x, y, blockType) {
	var gameID = userData[socket.id].room;
	if (isGameCreator(socket, gameID)) {
		updateBlock(gameID, x, y, blockType);
		if (gameData[gameID].gameType !== 'custom') {
			gameData[gameID].gameType = 'custom';
		}
		io.to(gameID).emit('render board', gameData[gameID].board);
	}
}

function socket_blocklistUpdate(blockType, active) {
	var gameID = userData[socket.id].room;
	if (isGameCreator(socket, gameID)) {
		if (active) {
			if (typeof gameData[gameID].blockList[blockType] === 'undefined') {
				gameData[gameID].blockList[blockType] = { ammo: false }
			}
			io.to(gameID).emit('log', '<span class="dimMsg">' + userData[socket.id].username + ' enabled ' + blockType + '.</span>');
		} else {
			delete gameData[gameID].blockList[blockType];
			io.to(gameID).emit('log', '<span class="dimMsg">' + userData[socket.id].username + ' disabled ' + blockType + '.</span>');
		}
		unreadyAll(gameID);
		gameData[gameID].gameType = 'custom';
		//io.to(gameID).emit('blocklist updated', blockType, active, false); // also send ammo later.
		socket.broadcast.to(gameID).emit('build menu', gameData[gameID].blockList);
	}
}


function socket_ammoUpdate(blockType, ammoAmount) {
	var gameID = userData[socket.id].room;
	if (isGameCreator(socket, gameID)) {
		function validAmmo() {
			if (ammoAmount === '&infin;') {
				ammoAmount = false;
				return true;
			} else {
				if (ammoAmount >= 1 && ammoAmount <= 20) {
					return true;
				} else {
					return false;
				}
			}
		}
		
		if (validAmmo()) {
			gameData[gameID].blockList[blockType].ammo = ammoAmount; //crash
			io.to(gameID).emit('log', '<span class="dimMsg">' + blockType + ' ammo = ' + ammoAmount + '.</span>');
			unreadyAll(gameID);
			gameData[gameID].gameType = 'custom';
			// io.to(gameID).emit('update ammo or w/e');
			socket.emit('update creator ammo', blockType, ammoAmount);
			socket.broadcast.to(gameID).emit('build menu', gameData[gameID].blockList);
		} else {
			io.to(gameID).emit('log', '<span class="redMsg">invalid amount!</span>');
		}
	}
}

function socket_updateBoardSize(rows, cols) {
	var gameID = userData[socket.id].room;
	if (gameExists(gameID)) {
		if (gameData[gameID].creator == socket.id) {
			gameData[gameID].rows = rows;
			gameData[gameID].cols = cols;
			socket.broadcast.to(gameID).emit('rebuild board', rows, cols);
		} else {
			socket.emit('log', '<span class="redMsg">you\'re not the creator!</span>');
		}
	}
}

function socket_offerDraw(gameID) {
	var whichPlayer = getPlayerNumber(gameID, socket.id);
	if ((whichPlayer == 1) || (whichPlayer == 2)) {
		gameData[gameID].playerOfferedDraw = whichPlayer;
		socket.broadcast.to(gameID).emit('draw offered', gameID);
	}
}

function socket_drawAccepted(gameID) {
	var whichPlayer = getPlayerNumber(gameID, socket.id);
	if (whichPlayer == 1 && gameData[gameID].playerOfferedDraw == 2) {
		drawGameCleanup();
		socket.broadcast.to(gameID).emit('game over', 3, 'drawAccepted');
	} else if (whichPlayer == 2 && gameData[gameID].playerOfferedDraw == 1) {
		drawGameCleanup();
		socket.broadcast.to(gameID).emit('game over', 3, 'drawAccepted');
	} else {
		socket.emit('log', '<span class="redMsg">draw accept failed</span>');
	}
	
	function drawGameCleanup() {
		var playerList = [];
		for (playerID in gameData[gameID].players) {
			if ((gameData[gameID].players[playerID].disconnected == false) && (gameData[gameID].players[playerID].forfeit == false)) {
				gameData[gameID].players[playerID].winner = true;
				playerList.push[playerID]
			}
		}
		for (var i = 0; i < gameData[gameID].board.length; i++) {
			if (gameData[gameID].board[i].possession.length != 0) {
				gameData[gameID].board[i].possession = playerList;
			}
		}
		io.to(gameID).emit('render board', gameData[gameID].board);
	}
}

function socket_titleUpdate(title) {
	var gameID = userData[socket.id].room;
	if (gameData[gameID].creator == socket.id) {
		gameData[gameID].title = title;
		//updateLobby();
	} else {
		socket.emit('log', '<span class="redMsg">you\'re not the creator!</span>');
	}
}





function unreadyAll (gameID) {
	var refresh = false;
	for (playerID in gameData[gameID].players) {
		if (unready(gameID, playerID)) {
			refresh = true;
		}
	}
	if (refresh) {
		io.to(gameID).emit('render board', gameData[gameID].board);
	}
}






function getPlayerNumber (gameID, id) {
// pass in the socket.id and return player number.
	if (id == gameData[gameID].player1) {
		return 1;
	}
	if (id == gameData[gameID].player2) {
		return 2;
	}
	return 'spectator';
}

function getGameID (socket) {
	return socket.rooms[1].split("-").pop();
	
	/*
	for (var i = 0; i < gameData.length; i++) {
		if ((socketID == gameData[i].player1) || (socketID == gameData[i].player2)) {
			return i;
		}
	}
	return false;
	*/
}


module.exports = {
	socket_classicMode,
	socket_advancedMode,
	socket_doneEditingGame,
	socket_randomizeGame,
	socket_chooseToSpectate,
	socket_timeLimitSetting,
	socket_collisionSetting,
	socket_boardEdit,
	socket_blocklistUpdate,
	socket_ammoUpdate,
	socket_updateBoardSize,
	socket_offerDraw,
	socket_drawAccepted,
	socket_titleUpdate
}