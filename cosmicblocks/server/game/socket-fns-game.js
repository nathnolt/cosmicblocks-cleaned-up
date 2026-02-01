const {
	userData,
	gameData
} = require('./vars.js')

const {
	sub_returnDisplayElo,
	sub_updateLobby,
	sub_renderLobby,
} = require('./subs.js')

const {
	setupgame_exMode,
	setupgame_practiceMode,
	setupgame_randomMode
} = require('./gameplay/game-modes.js')


const {
	getGameID,
	optionsDetection2,
	wipePossession,
	get_linearBoardArrayPos_from_xyPos,
	checkForPlayerExit,
	getColor,
	updateBlock,
	gameOver,
} = require('./gameplay/gameplay.js')

const { 
	redMsg,
	dimMsg
} = require('../util/util.js')

let io

function socketGame_setIo(ioValue) {
	io = ioValue
}



function getEmptyGameDataObject(socket, type) {
	const gameObj = {
		// who made the game?
		creator: socket.id,
		
		// what's the name of the game?
		title: null,
		
		// start with 1, up to 4 or maybe more later.
		maxPlayers: null,
		
		// how many rounds were played?
		totalGames: 0, 
		
		// @TODO: What is this?
		remainingPlayers: false,
		
		// the board data, very important.
		board: [], 
		
		// need to make this
		// @TODO: is this used?
		initialBoard: [], 
		
		// need to make this
		moveList: [], 
		
		// default number
		rows: 11, 
		
		// default number
		cols: 20, 
		
		// player data in the game (key is socket.id)
		players: {}, 
		
		// array of socket.ids
		// this is for the spectators
		specsList: [], 
		
		// number of turns
		moveCount: 0, 
		
		// amount of seconds per turn. 'false' for no time limit.
		timeLimit: false, 
		
		// figure out what this is for.
		timerValue: null,
		
		// this will be a function later on.
		gameTimer: false, 
		
		// figure out what this is for
		gameType: null,
		 
		// true when finished calculating (W/D/L and rating)
		ratingsCalculated: false, 
		
		// figure out what this is for. this is only set in the game case.
		// noRematch: false,
		
		// 'open', 'inprogress', 'gameover'
		gameState: 'open', 
		
		// what is this?
		tempBlock: 'pass',
		
		// what is this?
		blockList: {},
		
		// this is for when collisions occur?
		collisionMode: { 
			permanence: true
		}
	}
	
	
	if(type == 'practice') {
		gameObj.title = userData[socket.id].username + '\'s practice'
		gameObj.maxPlayers = 1
		
		// timer
		gameObj.timeLimit = false
		gameObj.timerValue = false
		
		
		gameObj.gameType = 'practice'
		
	} else 
	if(type == 'game') {
		gameObj.title = userData[socket.id].username + '\'s game'
		gameObj.maxPlayers = 2
		
		// timer
		gameObj.timeLimit = 30
		gameObj.timerValue = 30
		
		
		gameObj.gameType = 'new'
		
		gameObj.noRematch = false
		
	}
	
	return gameObj
}


function socket_practiceMode() {
	const socket = this
	if (userData[socket.id].room !== 'lobby') {
		socket.emit('log', redMsg('cannot create practice room unless in lobby.'));
	} else {
		const gameID = getGameID()
		gameData[gameID] = getEmptyGameDataObject(socket, 'practice')
		setupgame_practiceMode(gameID)
		
		//socket.broadcast.to('lobby').emit('log', '<span style="color: ' + userData[socket.id].color + '";>' + userData[socket.id].username + '</span> created a game.');
		socket.broadcast.to('lobby').emit('log', dimMsg(userData[socket.id].username + ' created a practice room.'));
		setupGame(socket, gameID);
		sub_updateLobby();
	}
}

function socket_newGame(special) {
	const socket = this
	
	if (userData[socket.id].room !== 'lobby') {
		socket.emit('log', redMsg('cannot create new game unless in lobby.'))
	} else {
		if (userData[socket.id].ghost) {
			socket.emit('log', redMsg('ghost cannot create game.'))
		} else {
			const gameID = getGameID()
			gameData[gameID] = getEmptyGameDataObject(socket, 'game')
			
			// the way I set up games right now, has the client pass in a special word "random" to determine what kind of game it should be 
			// (in this case, the only two options are standard and random.
			//
			// standard (or exMode) here, sets up a board with no real terrain, in a specific configuration.
			// it includes 3 mines, 1 reclaim, a standardized sort of block loadout for each player.
			//
			//random mode gives randomized terrain, start positions, and blocklist, within some limitations.
			//rematches in random mode will not shuffle the board, so a new game has to be created for a new board.
			//
			// the issue is that...
			// there should be only one new game button
			// which leads to a screen DIFFERENT from how it is now,
			// a screen with options and settings, a game setup page
			if (special !== 'random') {
				// now with mines and reclaim!
				setupgame_exMode(gameID)
			} else {
				// random board;
				setupgame_randomMode(gameID)
			}
			
			
			// I used to use this for connect but I'm using it for new game now.
			io.emit('connect audio'); 
			io.emit('log', dimMsg(userData[socket.id].username + ' created a game.'));
			
			
			setupGame(socket, gameID);
			sub_updateLobby();
		}
	}
}

function socket_joinGame(gameID, joinStatus) {
	const socket = this
	
	if (userData[socket.id].room == 'lobby') { // if in lobby
		if (gameExists(socket, undefined, gameID)) { // if game exist
			if (userData[socket.id].ghost) {
				joinStatus = 'spec';
			}
			setupGame(socket, gameID, joinStatus);
		}
	}
}


// executed when you press ready
function socket_handleGameReady() {
	const socket = this
	
	
	function allPlayersReady(gameID) {
		if (Object.keys(gameData[gameID].players).length !== gameData[gameID].maxPlayers) {
			return false;
		}
		for (id in gameData[gameID].players) {
			if (gameData[gameID].players[id].ready !== true) { 
				return false 
			}
		}
		return true;
	}
	
	
	var gameID = userData[socket.id].room;
	if (gameExists(socket) && (typeof gameData[gameID].players[socket.id] !== 'undefined')) {
		if (gameData[gameID].players[socket.id].ready !== true) {
			var user = userData[socket.id].username;
			if (gameData[gameID].gameType !== 'practice') {
				io.to(gameID).emit('log', '<span style="color: '+ gameData[gameID].players[socket.id].color +';">' + user + ' is ready!</span>');
			}
			gameData[gameID].players[socket.id].ready = true;
			
			optionsDetection2(gameID, gameData[gameID].players[socket.id].baseX, gameData[gameID].players[socket.id].baseY, socket.id);
			
			//io.to(gameID).emit('add to heading', socket.id, userData[socket.id].username, gameData[gameID].players[socket.id].color, x);
			io.to(gameID).emit('render board', gameData[gameID].board);
			
			if (allPlayersReady(gameID)) {
				// clone object... dangerous if the obj has methods or date, etc. but it works here imo
				gameData[gameID].initialBoard = JSON.parse(JSON.stringify(gameData[gameID].board));
				startGame(gameID);
			}
		}
	}
}

// executed when you press unready
function socket_handleGameUnready() {
	const socket = this
	var gameID = userData[socket.id].room;
	if ((typeof gameData[gameID] !== 'undefined') && (typeof gameData[gameID].players[socket.id] !== 'undefined')) {
		if (unready(gameID, socket.id)) {
			io.to(gameID).emit('render board', gameData[gameID].board);
		}
	} else {
		socket.emit('log', redMsg('undefined in <i>unready</i>'))
	}
}

function socket_attemptMove(x, y, blockType, moveCount) {
	
	
	function allPlayersMoved(players) {
		for (id in players) { 
			if (players[id].hasMoved == false) { 
				return false; 
			} 
		} 
		return true; 
	}
	
	
	function validateMove(gameID, blockType, pos, playerID) {
		var initialType = gameData[gameID].board[pos].type;
		if (typeof gameData[gameID].players[playerID].blockList[blockType] !== 'undefined') {
			if (gameData[gameID].players[playerID].blockList[blockType].ammo === 0) {
				return false
			} else {
				gameData[gameID].players[playerID].blockList[blockType].ammo--;
			}
		} else {
			return false
		}
		if (blockType === 'circle') { 
			var validTypes = ['star','plus','cross','hbar','vbar','tlbr','bltr','arrow1','arrow2','arrow3','arrow4','arrow6','arrow7','arrow8','arrow9'];
			if (validTypes.includes(initialType)) {
				return blockType;
			} else {
				return false;
			}
		} else if (blockType === 'reclaim') {
			if ((initialType !== 'blank' && initialType !== 'base' && initialType !== 'blockade' && initialType !== 'mine')) {
				if (gameData[gameID].board[pos].possession.length === 1) {
					if (gameData[gameID].board[pos].possession[0] === playerID) {
						return 'reclaim';
					}
				}
				
			}
			return false;
		} else {
			if (initialType === 'blank') { return blockType; }
			if (initialType === 'mine') { return 'mine explosion'; }
			else { return false; }
		}
	}
	
	
	
	const socket = this
	
	// x,y was never checked as valid, fake shit can pass into here and mess everything up.
	
	var gameID = userData[socket.id].room;
	// obtain gameID
	
	if (typeof gameData[gameID] !== 'undefined') {
	// if the game exists
	
		if ((youArePlaying(gameData[gameID].players, socket.id)) && (gameData[gameID].gameState == 'inprogress')) {
		// if you are playing, and the game is in progress
		
			var pos = get_linearBoardArrayPos_from_xyPos(gameID, x, y);
			// get move position for the board array
			
			try {
				blockType = validateMove(gameID, blockType, pos, socket.id);
				// validateMove returns false if invalid.
			} catch(err) {
				blockType = false;
			}
			
			if (blockType !== false && moveCount == gameData[gameID].moveCount) {
				// make sure the move is valid
				
				gameData[gameID].players[socket.id].hasMoved = true;
				if (allPlayersMoved(gameData[gameID].players)) {
					var tempBlock2 = [x,y,blockType,socket.id];
					
					// this shit is a problem for 4 player mode!
					
					performTurn(gameID, gameData[gameID].tempBlock, tempBlock2);
				} else {
					// still waiting for other players
					gameData[gameID].tempBlock = [x,y,blockType,socket.id]; // store data temporarily
					gameData[gameID].players[socket.id].onStandby = true;
					socket.broadcast.to(gameID).emit('log', '<span class="waitMsg blinkText">' + gameData[gameID].players[socket.id].username + ' has moved.'); // let the opponent know
					
					var opponentList = [];
					for (player in gameData[gameID].players) {
						if (socket.id != player) {
							opponentList.push(player);
						}
					}
					if (opponentList.length == 1) {
						socket.emit('log', '<span class="waitMsg blinkText">Waiting for '+ gameData[gameID].players[opponentList[0]].username +'.</span>');
					} else {
						socket.emit('log', '<span class="waitMsg blinkText">Waiting for opponents.</span>');
					}
				}
			} else {
				// invalid move.
				socket.emit('log', redMsg('invalid move'))
			}
		} else {
			socket.emit('log', redMsg('spectator cannot make moves'));
		}
	} else {
		socket.emit('log', redMsg('undefined game in <i>attempt move</i>'));
	}
}

function socket_exitGameToLobby() {
	const socket = this
	
	
	var gameID = userData[socket.id].room;
	if (gameID !== 'lobby') {
		socket.leave(gameID);
		io.to('lobby').emit('log', dimMsg(userData[socket.id].username + ' joined lobby.'));
		socket.emit('log', '<div class="roomChange">joining lobby</div>', true);
		socket.join('lobby');
		userData[socket.id].room = 'lobby';
		io.to(gameID).emit('log', dimMsg(userData[socket.id].username + ' left.') );
		checkForPlayerExit(gameID, socket);
		sub_renderLobby(socket);
	} else {
		socket.emit('log', redMsg('already in lobby!'));
	}
}

function socket_practiceGameReset() {
	const socket = this
	
	var gameID = userData[socket.id].room;
	if (gameExists(socket, 'creator')) {
		if (gameData[gameID].gameType == 'practice') {
			gameData[gameID].board = JSON.parse(JSON.stringify(gameData[gameID].initialBoard));
			for (player in gameData[gameID].players) {
				gameData[gameID].players[player].blockList = JSON.parse(JSON.stringify(gameData[gameID].blockList));
				gameData[gameID].players[player].winner = false;
				gameData[gameID].players[player].winPath = [];
				gameData[gameID].players[player].hasMoved = false;
				gameData[gameID].players[player].onStandby = false;
				gameData[gameID].players[player].offeredDraw = false;
				gameData[gameID].players[player].disconnected = false;
				gameData[gameID].players[player].forfeit = false;
			}
			io.to(gameID).emit('setup rematch', gameData[gameID].blockList);
			io.to(gameID).emit('log', dimMsg('Reset.'));
			io.to(gameID).emit('render board', gameData[gameID].board);
			startGame(gameID);
		}
	}
}


function socket_yesRematch() {
	const socket = this
	
	var gameID = userData[socket.id].room;
	if (gameExists(socket)) {
		if (gameData[gameID].gameState == 'gameover' && gameData[gameID].noRematch == false) {
			var hacking = true;
			for (player in gameData[gameID].players) {
				if (player == socket.id) {
					hacking = false;
				}
			}
			if (!hacking) {
				gameData[gameID].players[socket.id].rematchOffered = true;
				var numPlayers = 0;
				var numYesRematch = 0;
				for (player in gameData[gameID].players) {
					numPlayers++;
					if (gameData[gameID].players[player].rematchOffered == true) {
						numYesRematch++;
					}
				}
				if (numPlayers !== numYesRematch) {
					socket.broadcast.to(gameID).emit('rematch offered');
					io.to(gameID).emit('log', dimMsg(userData[socket.id].username +' offered a rematch.'));
				} else {
					// REMATCH INITIATED!!
					gameData[gameID].board = JSON.parse(JSON.stringify(gameData[gameID].initialBoard));
					gameData[gameID].ratingsCalculated = false;
					
					var over1000 = 0;
					var creatorElo = sub_returnDisplayElo(gameData[gameID].creator);
					var playerElo = creatorElo; // initially set this to creatorElo but change it if it's found to be different.
					for (player in gameData[gameID].players) {
						gameData[gameID].players[player].blockList = JSON.parse(JSON.stringify(gameData[gameID].blockList));
						gameData[gameID].players[player].winner = false;
						gameData[gameID].players[player].winPath = [];
						gameData[gameID].players[player].hasMoved = false;
						gameData[gameID].players[player].onStandby = false;
						gameData[gameID].players[player].offeredDraw = false;
						gameData[gameID].players[player].rematchOffered = false;
						gameData[gameID].players[player].disconnected = false;
						gameData[gameID].players[player].forfeit = false;
						if (userData[player].elo !== creatorElo) { 
							// if it's different, set it to the other player's elo.
							playerElo = sub_returnDisplayElo(player);
						}
						
						
						/*
						if (userData[player].elo > 1000) {
							over1000++;
						}
						*/
					}
					gameData[gameID].totalGames++;
					
					var iceBoard = false;
					/*
					if ((gameData[gameID].totalGames >= 4) && (over1000 == 2)) {
						// if at least 4 games were played, and both players are over 1000 elo
						if (random_inclusive_int(1,7) == 7) {
							// if 1/7
							console.log('ice board');
							iceBoard = true;
							for (var i = 0; i < (gameData[gameID].board.length / 2); i++) {
								if (gameData[gameID].board[i].type == 'blank' && (random_inclusive_int(1,15) == 15)) {
									gameData[gameID].board[i].type = 'ice';
									gameData[gameID].board[(gameData[gameID].board.length - i - 1)].type = 'ice';
								}
							}
							
							// clear surrounding. this shit sucks for different board sizes just FYI!!!
							updateBlock(gameID, 4, 5, "blank");
							updateBlock(gameID, 5, 5, "blank");
							updateBlock(gameID, 6, 5, "blank");
							updateBlock(gameID, 4, 6, "blank");
							updateBlock(gameID, 6, 6, "blank");
							updateBlock(gameID, 4, 7, "blank");
							updateBlock(gameID, 5, 7, "blank");
							updateBlock(gameID, 6, 7, "blank");
							
							updateBlock(gameID, 16, 5, "blank");
							updateBlock(gameID, 17, 5, "blank");
							updateBlock(gameID, 18, 5, "blank");
							updateBlock(gameID, 16, 6, "blank");
							updateBlock(gameID, 18, 6, "blank");
							updateBlock(gameID, 16, 7, "blank");
							updateBlock(gameID, 17, 7, "blank");
							updateBlock(gameID, 18, 7, "blank");
						}
					}
					*/
					
					io.to(gameID).emit('setup rematch', gameData[gameID].blockList, creatorElo, playerElo);
					io.to(gameID).emit('log', dimMsg('Rematch initiated'));
					if (iceBoard) {
						io.to(gameID).emit('log', '<span class="coldWeather">Cold weather!</span>');
					}
					io.to(gameID).emit('render board', gameData[gameID].board);
					startGame(gameID);
				}
			} else {
				socket.emit('log', redMsg('No hacking!'));
			}
		} else {
			socket.emit('log', redMsg('rematch not possible in <i>offer rematch</i>!'));
		}
	}
}


function socket_forfeit() {
	const socket = this
	
	gameID = userData[socket.id].room;
	
	if(gameExists(socket)) {
		if (youArePlaying(gameData[gameID].players, socket.id)) {
			wipePossession(gameID, socket.id);
			gameData[gameID].remainingPlayers--;
			gameData[gameID].players[socket.id].forfeit = true;
			io.to(gameID).emit('render board', gameData[gameID].board);
			if (gameData[gameID].remainingPlayers <= 1) {
				var winner = false;
				for (playerID in gameData[gameID].players) {
					if ((gameData[gameID].players[playerID].disconnected) || (gameData[gameID].players[playerID].forfeit)) {
						// this player is not the winner
					} else {
						gameData[gameID].players[playerID].winner = true;
					}
				}
				gameOver(gameID);
			}
		} else {
			socket.emit('log', redMsg('spectator cannot forfeit'));	
		}
	}
}



function gameExists(socket, client, gameID) {
	
	if (typeof gameID === 'undefined') {
		var gameID = userData[socket.id].room;
	}
	
	if (typeof gameData[gameID] !== 'undefined') {
		if (typeof client !== 'undefined' && client === 'creator') {
			if (gameData[gameID].creator === socket.id) {
				return true;
			} else {
				socket.emit('log', redMsg('not the creator'));
				return false;
			}
		} else {
			return true;
		}
	} else {
		socket.emit('log', redMsg('not in a valid game'));
		return false;
	}
}

function youArePlaying(players, socketID) {
	for (id in players) { 
		if (id == socketID) { 
			return true; 
		} 
	} 
	return false; 
}


function setupGame(socket, gameID, passedStatus) {
	if(gameData[gameID] == null) {
		return
	}
	
	socket.leave('lobby');
	
	
	if (passedStatus === 'spec') {
		socket.emit('log', '<div class="roomChange">spectating game</div>', true);
	} else {
		if (gameData[gameID].creator == socket.id) {
			socket.emit('log', '<div class="roomChange">creating game</div>', true);
		} else {
			socket.emit('log', '<div class="roomChange">joining game</div>', true);
		}
	}
	
	var joinStatus = 'spectator'; // by default you're a specatator
	var displayBoard = gameData[gameID].board;
	
	if (passedStatus !== 'spec') {
		if (gameData[gameID].gameState == 'open') {
			
			// if the game is open, check if there are vacant slots
			var playerCount = Object.keys(gameData[gameID].players).length;
			if (playerCount < gameData[gameID].maxPlayers) {
				setPlayer(socket, gameID, socket.id);
				
				// check if this is the creator of the game
				if (gameData[gameID].creator == socket.id) {
					joinStatus = 'creator';
				} else {
					joinStatus = 'player';
					var playerCount = Object.keys(gameData[gameID].players).length;
					if (playerCount < gameData[gameID].maxPlayers) {
						//gameData[gameID].gameState == 'full';
					}
				}
			}
		}
		
		// log
		if (joinStatus !== 'creator') {
			io.to('lobby').emit('log', '<span style="color:' + userData[socket.id].color + ';">' + userData[socket.id].username + '</span> joined ' + gameData[gameID].title + '.');
		}
	} else {
		
		// handle spectator join
		gameData[gameID].specsList.push(socket.id);
		if (gameData[gameID].gameState == 'inprogress') {
			// spec board.
			displayBoard = JSON.parse(JSON.stringify(gameData[gameID].board));
			for (var i = 0; i < displayBoard.length; i++) {
				if (displayBoard[i].type == 'mine') {
					hiddenInformation(displayBoard[i]);
				}
			}
		}
	}
	
	var color = "#8474a4"
	if (typeof gameData[gameID].players[socket.id] != 'undefined') {
		color = gameData[gameID].players[socket.id].color;
	}
	
	const username = userData[socket.id].username
	
	io.to(gameID).emit('log', '<span style="color: ' + color + '">' + username + ' joined as ' +  joinStatus + '.</span>');
	if (joinStatus !== 'spectator') {
		io.to(gameID).emit('add to heading', socket.id, username, gameData[gameID].players[socket.id].color, gameData[gameID].players[socket.id].elo);
		io.to(gameID).emit('render board', gameData[gameID].board);
	}
	
	socket.join(gameID);
	userData[socket.id].room = gameID;
	
	socket.emit('setup game', 
		gameID,
		joinStatus,
		gameData[gameID].title,
		gameData[gameID].rows, 
		gameData[gameID].cols, 
		displayBoard, 
		gameData[gameID].players,
		gameData[gameID].gameState,
		gameData[gameID].blockList,
		gameData[gameID].timeLimit,
		gameData[gameID].collisionMode,
		gameData[gameID].moveCount,
		gameData[gameID].timerValue,
		gameData[gameID].gameType
	);
	
	if (gameData[gameID].gameState == 'gameover') {
		gameOver(gameID);
	}
	
	sub_updateLobby();
	// io.to(gameID).emit('update user list', userList(gameID));

}

// function userList(gameID) {
// 	var userList = {};
// }


function setPlayer(socket, gameID, playerID) {
	gameData[gameID].players[playerID] = {
		username: userData[socket.id].username,
		displayElo: sub_returnDisplayElo(playerID),
		winner: false, 
		winPath: [], 
		hasMoved: false,
		onStandby: false,
		offeredDraw: false,
		rematchOffered: false,
		ready: false,
		forfeit: false,
		disconnected: false,
		baseX: false,
		baseY: false,
		color: false,
		blockList: {},
		wins: 0,
		draws: 0,
		losses: 0
	};
	
	// assign player color to game
	gameData[gameID].players[playerID].color = userData[playerID].color;
	
	
	// this color brightness fix sucks too bad to use, need to do something different. disabling it for now.
	/*
	// it's time to figure out if player colors are too close to eachother...
	var playerColors = [];
	var playerIDs = [];
	for (playerID in gameData[gameID].players) {
		playerColors.push(gameData[gameID].players[playerID].color);
		playerIDs.push(playerID);
	}
	if (playerColors.length == 2) {
		// somewhat problematic for 4 player games.
		// i won't worry about it at the moment though.
		if (hexColorDelta(playerColors[0], playerColors[1]) > 0.95) {
			// if the difference between colors is small (0.2)
			// then brighten or darken one of them...
			gameData[gameID].players[playerIDs[1]].color = increase_brightness(playerColors[1], 40); // inc brightness by 40%
			//io.to(gameID).emit('log', '<span class="dimMsg">player colors nearly match; brightened ' + userData[playerID].username + '\'s color.</span>');
		}
	}
	*/
	
	var bases = [];
	for (var i = 0; i < gameData[gameID].board.length; i++) {
		if (gameData[gameID].board[i].type == 'base') {
			bases.push(i); //  push base position into bases array
		}
	}
	if (gameData[gameID].creator == socket.id) {
		// find the base with a left-most x-position and use that for creator slot
		if (gameData[gameID].board[bases[0]].x < gameData[gameID].board[bases[1]].x) {
			var pos = bases[0];
		} else {
			var pos = bases[1];
		}
	} else {
		// find the base with a right-most position and use that for joining player
		if (gameData[gameID].board[bases[0]].x < gameData[gameID].board[bases[1]].x) {
			var pos = bases[1];
		} else {
			var pos = bases[0];
		}
	}
	var x = gameData[gameID].board[pos].x + 1;
	var y = gameData[gameID].board[pos].y + 1;
	gameData[gameID].board[pos].history[0] = { 
		turn: 0,
		cause: 'source', 
		playerColor: gameData[gameID].players[socket.id].color,
		playerDisplayName: userData[socket.id].username
	};
	gameData[gameID].players[socket.id].baseX = x;
	gameData[gameID].players[socket.id].baseY = y;
	gameData[gameID].board[pos].possession.push(socket.id); // ??
	gameData[gameID].board[pos].possessionDisplayName = userData[socket.id].username;
	gameData[gameID].board[pos].color = gameData[gameID].players[socket.id].color;
	
}

function unready (gameID, playerID) {
	if (gameData[gameID].players[playerID].ready) {
		io.to(gameID).emit('log', dimMsg(userData[playerID].username + ' isn\'t ready.'));
		gameData[gameID].players[playerID].ready = false;
		wipePossession(gameID, playerID); 
		
		var pos = get_linearBoardArrayPos_from_xyPos(gameID, gameData[gameID].players[playerID].baseX , gameData[gameID].players[playerID].baseY)
		gameData[gameID].board[pos].possession.push(playerID); // ??
		gameData[gameID].board[pos].possessionDisplayName = userData[playerID].username;
		gameData[gameID].board[pos].color = gameData[gameID].players[playerID].color;
		
		//io.to(gameID).emit('remove from heading', playerID);
		return true;
	} else {
		return false;
	}
}


function startGame(gameID) {
	io.to(gameID).emit('log', '<span style="font-weight:bold">Starting ' + gameData[gameID].title + '.</span>');
	
	gameData[gameID].gameState = 'inprogress';
	gameData[gameID].remainingPlayers = gameData[gameID].maxPlayers;
	gameData[gameID].moveCount = 1;
	
	if (gameData[gameID].timeLimit != false) {
		resetTimer(gameID);
	}
				
	for (block in gameData[gameID].blockList) {
		for (player in gameData[gameID].players) {
			gameData[gameID].players[player].blockList[block] = { ammo: gameData[gameID].blockList[block].ammo };
		}
	}
	
	io.to(gameID).emit('log', dimMsg('Turn <b>1</b>'));
	io.to(gameID).emit('all players ready', 
		gameID, 
		gameData[gameID].timeLimit,
		gameData[gameID].players,
		gameData[gameID].rows,
		gameData[gameID].cols,
		gameData[gameID].board,
		gameData[gameID].gameType
	);
	sub_updateLobby();
}




function resetTimer(gameID) {
	// called when:
	// * a new game is started
	// * after each turn
	
	if(gameData[gameID] == null) {
		io.emit('log', redMsg('gameID undefined in resetTimer()'));
		return
	}
	
	// stop ticking the timer.
	clearInterval(gameData[gameID].gameTimer)
	
	// set the timer to max value
	gameData[gameID].timerValue = gameData[gameID].timeLimit
	
	// update timer
	io.to(gameID).emit('update timer', gameData[gameID].timerValue, gameData[gameID].moveCount)
	
	// tick it down
	gameData[gameID].timerValue--
	
	
	function gameTickSecond() {
		if (typeof gameData[gameID] === 'undefined') {
			io.emit('log', redMsg('gameID undefined in resetTimer() setInterval'));
			//clearInterval(gameData[gameID].gameTimer); // hope this works. it doesnt.
		} else {
			if (gameData[gameID].timerValue == 0) {
				// out of time!
				gameData[gameID].timerValue = gameData[gameID].timeLimit; // reset the timer
				performTurn(gameID, gameData[gameID].tempBlock, 'pass'); // next turn!
			} else {
				
				// this is where it sends, every second, to the client, the updated time.
				// this is really inefficient because there's latency and the timer ticks down irregularly.
				// instead, when a new turn happens the client itself should have a timer tick down.
				// when that timer hits 0 it locks it so you cannot move and waits for the server to send the command that it's time out.
				/*
				io.to(gameID).emit('update timer', gameData[gameID].timerValue, gameData[gameID].moveCount); // update timer
				*/
				
				
				gameData[gameID].timerValue--; // tick it down
			}
		}
	}
	
	// this causes it to tick once per second
	gameData[gameID].gameTimer = setInterval(gameTickSecond, 1000)
}

function performTurn(gameID, tBlock, tBlock2) {
	
	// called when:
	// * both players move
	// * turn time runs out
	
	// tBlock(2) structure:
	// [0] = X position
	// [1] = Y position
	// [2] = blockType
	// [3] = playerID / socket.id
	
	gameData[gameID].playerOnStandby = false; // no longer on standby
	gameData[gameID].moveCount++;   // increase the move count
	
	var passedTurn = false;  // did a player pass?
	var noMove = false;  // assume no at first.
	var thisX, thisY, thisType, thisOrigin, thatX, thatY, thatType, thatOrigin;
	var collision = false;
	
	if ((tBlock == 'pass') || (tBlock2 == 'pass')) {
		// somebody ran out of time...
		passedTurn = true;
	}
	
	// get the block data if it exists:
	if (tBlock != 'pass') {
		thisX = tBlock[0];
		thisY = tBlock[1];
		thisType = tBlock[2];
		thisOrigin = tBlock[3];
	}
	if (tBlock2 != 'pass') {
		thatX = tBlock2[0];
		thatY = tBlock2[1];
		thatType = tBlock2[2];
		thatOrigin = tBlock2[3];
	}
	
	
	function reclaim(type, x, y, origin) {
		var pos = get_linearBoardArrayPos_from_xyPos(gameID, x, y);
		var reclaimed = gameData[gameID].board[pos].type;
		if (typeof gameData[gameID].players[origin].blockList[reclaimed] !== 'undefined') {
			if (gameData[gameID].players[origin].blockList[reclaimed].ammo !== 'inf') {
				gameData[gameID].players[origin].blockList[reclaimed].ammo++;
			}
		} else {
			gameData[gameID].players[origin].blockList[reclaimed] = {ammo: 1};
			console.log(gameData[gameID].players[origin].blockList);
		}
	}
	
	if ((thisX == thatX) && (thisY == thatY)) {
		// if there is a collision then reclaim should fail.
	} else {
		if (thisType == 'reclaim') {
			reclaim(thisType, thisX, thisY, thisOrigin)
		}
		if (thatType == 'reclaim') {
			reclaim(thatType, thatX, thatY, thatOrigin)
		}
	}
	
	if (gameData[gameID].gameType == "practice") {
		updateBlock(gameID, thatX, thatY, thatType, thatOrigin); // not fully sure why it uses tBlock2 / thatX but yeah alright.
	} else {
	
		// update blocks:
		if (!passedTurn) { // if nobody ran out of time...
			if ((thisX == thatX) && (thisY == thatY)) { // check for collision.
				collision = true;
				io.to(gameID).emit('collision'); // COLLISION!!!! this plays client-side sfx.
				updateBlock(gameID, thisX, thisY, "blockade", 'collision');
			} else {
				// no collision. proper turn; update blocks.
				updateBlock(gameID, thisX, thisY, thisType, thisOrigin);
				updateBlock(gameID, thatX, thatY, thatType, thatOrigin);
			}
		} else {
		// one or both players ran out of time.
			if (tBlock !== 'pass') {
				// one player didn't run out of time.
				updateBlock(gameID, thisX, thisY, thisType, thisOrigin);
				io.to(gameID).emit('time out', thisOrigin);
			} else {
				noMove = true;
			}
		}
	
	}
	
	var playersArray = [];
	for (playerID in gameData[gameID].players) {
		gameData[gameID].players[playerID].hasMoved = false;
		playersArray.push(playerID);
	}
	
	// detect possession.
	wipeAndDetect(gameID);
	
	// if game is not over:
	if (gameData[gameID].gameState == 'inprogress') {
		gameData[gameID].tempBlock = 'pass'; // reset the temp block to nothing (so if time runs out...)
		io.to(gameID).emit('log', dimMsg('Turn <b>' + (gameData[gameID].moveCount) + '</b>'))
		
		if (thatType == 'mine explosion' || thisType == 'mine explosion') {
			io.to(gameID).emit('detonate'); // sfx;
		}
		
		if (gameData[gameID].gameType == "practice") {
			io.to(gameID).emit('new move', gameData[gameID].board, noMove, gameData[gameID].players[playersArray[0]].blockList);
		} else {
			// not practice mode.
			// in the case of mines we need to send a separate board to each player now:
			var thisBoard = JSON.parse(JSON.stringify(gameData[gameID].board));
			for (var i = 0; i < thisBoard.length; i++) {
				if (thisBoard[i].type == 'mine') {
					if (thisBoard[i].origin !== playersArray[0]) {
						hiddenInformation(thisBoard[i]);
					}
				}
			}
			var thatBoard = JSON.parse(JSON.stringify(gameData[gameID].board));
			for (var i = 0; i < thatBoard.length; i++) {
				if (thatBoard[i].type == 'mine') {
					if (thatBoard[i].origin !== playersArray[1]) {
						hiddenInformation(thatBoard[i]);
					}
				}
			}
			var specBoard = JSON.parse(JSON.stringify(gameData[gameID].board));
			for (var i = 0; i < specBoard.length; i++) {
				if (specBoard[i].type == 'mine') {
					hiddenInformation(specBoard[i]);
				}
			}
			
			io.to(playersArray[0]).emit('new move', thisBoard, noMove, gameData[gameID].players[playersArray[0]].blockList);
			io.to(playersArray[1]).emit('new move', thatBoard, noMove, gameData[gameID].players[playersArray[1]].blockList);
			
			// specslist is for the spectators
			for (var i = 0; i < gameData[gameID].specsList.length; i++) {
				io.to(gameData[gameID].specsList[i]).emit('new move', specBoard, noMove);
			}
		}
	}
	
	// if game IS over:
	if (gameData[gameID].gameState == 'gameover') {
		io.to(gameID).emit('new move', gameData[gameID].board, noMove);			
		gameOver(gameID);
	} else if (gameData[gameID].timeLimit != false) {
		resetTimer(gameID);
	} else {
		io.to(gameID).emit('update timer', false, gameData[gameID].moveCount); // update turn count.
	}
}

function wipeAndDetect(gameID) {
	
	function wipeCollisions(gameID) {
		
		// opposite of get_linearBoardArrayPos_from_xyPos, takes the position in array and returns x/y coords.
		function get_coords(gameID, pos) {
			var x = (pos % gameData[gameID].cols) + 1;
			var y = ((pos - x + 1) / gameData[gameID].cols) + 1;
			return [x,y];
		}
		
		var permanence = gameData[gameID].collisionMode.permanence;
		// collisionMode.permanence is an int that says how many turns the block should stick around for.
		for (var i = 0; i < gameData[gameID].board.length; i++) {
		// loop the entire board
			if (gameData[gameID].board[i].duration !== false) {
				// if we find a block with a duration
				if (gameData[gameID].board[i].moveNum <= (gameData[gameID].moveCount - permanence)) {
					xy = get_coords(gameID, i);
					updateBlock(gameID, xy[0], xy[1], 'blank', 'collision fade');
				} else {
					gameData[gameID].board[i].duration--;
				}
			}
		}
	}
	
	
	
	
	if (gameData[gameID].collisionMode.permanence !== true) {
		wipeCollisions(gameID);
	}
	for (var i = 0; i < gameData[gameID].board.length; i++) {
		gameData[gameID].board[i].possessionSpread = {}; // wipe possessionSpread
		gameData[gameID].board[i].possessionColorSpread = [];
	}
	for (playerID in gameData[gameID].players) {
		wipePossession(gameID, playerID);
		if ((gameData[gameID].players[playerID].disconnected) || (gameData[gameID].players[playerID].forfeit)) {
			io.to(gameID).emit('log', dimMsg('not relighting forfeit/dc\'d player'))
		} else {
			var x = gameData[gameID].players[playerID].baseX;
			var y = gameData[gameID].players[playerID].baseY;
			var pos = get_linearBoardArrayPos_from_xyPos(gameID, x, y);
			gameData[gameID].board[pos].possession.push(playerID);
			gameData[gameID].board[pos].color = getColor(gameID, gameData[gameID].board[pos].possession);
			optionsDetection2(gameID, x, y, playerID);
		}
	}
	
	for (var i = 0; i < gameData[gameID].board.length; i++) {
		// set possessionSpread color...
		var length = Object.keys(gameData[gameID].board[i].possessionSpread).length
		if (length === 1) {
			
			// if the length is 1 we just need to know which spread layer.
			// along with the player color.
			
			for (playerID in gameData[gameID].board[i].possessionSpread) {
				var passedColor = getColor(gameID, [playerID]);
				var passedLayer = gameData[gameID].board[i].possessionSpread[playerID];	
				gameData[gameID].board[i].possessionColorSpread = [{
					color: passedColor,
					layer: passedLayer
				}];
			}
		} else if (length === 2) {
			
			// if the length is 2 then we need to know which player's spread hit the square when.
			// the second player to hit the square w/ the spread uses the mixed color
			
			var collection = [];
			var players = [];
			for (playerID in gameData[gameID].board[i].possessionSpread) {
				var passedColor = getColor(gameID, [playerID]);
				var passedLayer = gameData[gameID].board[i].possessionSpread[playerID];
				collection.push({
					color: passedColor,
					layer: passedLayer
				});
				players.push(playerID); // push playerIDs into an array for use in getColor (for mixed colors)
			}
			if (collection[0].layer == collection[1].layer) {
				// both player spread hit at the same time so just add the mixed color for that layer.
				gameData[gameID].board[i].possessionColorSpread = [{
					color: getColor(gameID, players),
					layer: collection[0].layer
				}];
			} else if (collection[0].layer < collection[1].layer) {
				// 0 before 1.
				gameData[gameID].board[i].possessionColorSpread.push({
					color: collection[0].color,
					layer: collection[0].layer
				});
				gameData[gameID].board[i].possessionColorSpread.push({
					color: getColor(gameID, players),
					layer: collection[1].layer
				});
			} else if (collection[0].layer > collection[1].layer) {
				// 1 before 0.
				gameData[gameID].board[i].possessionColorSpread.push({
					color: collection[1].color,
					layer: collection[1].layer
				});
				gameData[gameID].board[i].possessionColorSpread.push({
					color: getColor(gameID, players),
					layer: collection[0].layer
				});
			}
		}
	}
	
}

function hiddenInformation(block) {
	block.type = 'blank';
	block.moveNum = 0;
	block.origin = false;
	block.originColor = false;
	block.history = [];
}



module.exports = {
	socketGame_setIo,
	socket_practiceMode,
	socket_newGame,
	socket_joinGame,
	socket_handleGameReady,
	socket_handleGameUnready,
	socket_attemptMove,
	socket_exitGameToLobby,
	socket_practiceGameReset,
	socket_yesRematch,
	socket_forfeit,
}