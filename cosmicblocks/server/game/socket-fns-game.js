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
	get_xyPos_from_linearBoardArrayPos,
	checkForPlayerExit,
	getBoardCellColor,
	updateBlock,
	gameOver,
	setPossessionToSingleCell,
} = require('./gameplay/gameplay.js')

const {
	blocklist_circleable,
} = require('./gameplay/game-static.js')

const { 
	redMsg,
	dimMsg
} = require('../util/html.js')

const { 
	deepClone
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
		return
	}
	
	const gameID = getGameID()
	gameData[gameID] = getEmptyGameDataObject(socket, 'practice')
	setupgame_practiceMode(gameID)
	
	socket.broadcast.to('lobby').emit('log', dimMsg(userData[socket.id].username + ' created a practice room.'));
	setupGame(socket, gameID);
	sub_updateLobby();
}

function socket_newGame(special) {
	const socket = this
	
	if (userData[socket.id].room !== 'lobby') {
		socket.emit('log', redMsg('cannot create new game unless in lobby.'))
		return
	}
	
	if (userData[socket.id].ghost) {
		socket.emit('log', redMsg('ghost cannot create game.'))
		return
	}
	
	const gameID = getGameID()
	gameData[gameID] = getEmptyGameDataObject(socket, 'game')
	
	// the way I set up games right now, has the client pass in a special word "random" to 
	// determine what kind of game it should be 
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
	io.emit('connect audio')
	io.emit('log', dimMsg(userData[socket.id].username + ' created a game.'))
	
	setupGame(socket, gameID)
	sub_updateLobby()
}

function socket_joinGame(gameID, joinStatus) {
	const socket = this
	
	if(userData[socket.id].room != 'lobby') {
		return
	}
	
	// handle game not existing
	if(!gameExists(gameID)) {
		log_invalidGame(socket)
		return
	}
	
	if(userData[socket.id].ghost) {
		joinStatus = 'spec'
	}
	
	setupGame(socket, gameID, joinStatus)
}


// executed when you press ready
function socket_handleGameReady() {
	const socket = this
	
	function allPlayersReady(gameID) {
		const gameObj = gameData[gameID]
		if (Object.keys(gameObj.players).length !== gameObj.maxPlayers) {
			return false
		}
		for (id in gameObj.players) {
			if (gameObj.players[id].ready !== true) { 
				return false 
			}
		}
		return true;
	}
	
	const user = userData[socket.id]
	const gameID = user.room
	
	// log error if game does not exist
	if(!gameExists(gameID)) {
		log_invalidGame(socket)
		return
	}
	
	const gameObj = gameData[gameID]
	
	// log error if you're not in the game
	if(!socket_isPlayer_in_game(gameObj, socket)) {
		log_notInGame(socket)
		return
	}
	
	const playerObj = gameObj.players[socket.id]
	
	// don't do anything if already ready
	if(playerObj.ready === true) {
		return
	}
	
	if (gameObj.gameType !== 'practice') {
		io.to(gameID).emit('log', `<span style="color:${playerObj.color}">${user.username} is ready!</span>`)
	}
	
	playerObj.ready = true
	
	optionsDetection2(gameID, playerObj.baseX, playerObj.baseY, socket.id)
	
	//io.to(gameID).emit('add to heading', socket.id, user.username, playerObj.color, x)
	io.to(gameID).emit('render board', gameObj.board)
	
	if(allPlayersReady(gameID)) {
		gameObj.initialBoard = deepClone(gameObj.board)
		startGame(gameID)
	}
	
}

// Executed when you press unready
function socket_handleGameUnready() {
	const socket = this
	const gameID = userData[socket.id].room
	
	if(!gameExists(gameID)) {
		log_invalidGame(socket)
		return
	}
	
	const gameObj = gameData[gameID]
	
	if(!socket_isPlayer_in_game(gameObj, socket)) {
		log_notInGame(socket)
		return
	}
	
	if(unready(gameID, socket.id)) {
		io.to(gameID).emit('render board', gameObj.board);
	}
}


function socket_attemptMove(x, y, blockType, moveCount) {
	
	function allPlayersMoved(players) {
		for(const playerSocketID in players) {
			if(players[playerSocketID].hasMoved == false) { 
				return false
			} 
		} 
		return true
	}
	
	
	function validateMove(gameID, blockType, pos, playerID) {
		const gameObj = gameData[gameID]
		const cellObj = gameObj.board[pos]
		const initialType = cellObj.type
		
		const playerObj = gameObj.players[playerID]
		const playerObj_blocklistItem = playerObj.blockList[blockType]
		
		if(playerObj_blocklistItem == undefined || playerObj_blocklistItem.ammo < 1) {
			return false
		}
		playerObj_blocklistItem.ammo--
		
		
		if(blockType === 'circle') {
			const blockIsCircleable = blocklist_circleable.includes(initialType)
			
			if(blockIsCircleable) {
				return blockType
			}
			return false
			
		} else 
		if(blockType === 'reclaim') {
			
			const non_reclaimable = ['blank', 'base', 'blockade', 'mine']
			const invalid_reclaim_action = non_reclaimable.includes(initialType)
			
			if(invalid_reclaim_action) {
				return false
			}
			
			// we can only reclaim a tile if we are the sole owner
			if(cellObj.possession.length === 1 && cellObj.possession[0] === playerID) {
				return 'reclaim';
			}
			
			return false
			
		} else
		if(initialType === 'blank') {
			return blockType
		} else
		if(initialType === 'mine') {
			return 'mine explosion'
		}
		
		return false
	}
	
	
	const socket = this
	
	// x,y was never checked as valid, fake shit can pass into here and mess everything up.
	var gameID = userData[socket.id].room
	
	// obtain gameID
	const gameObj = gameData[gameID]
	if(gameObj == undefined) {
		socket.emit('log', redMsg('undefined game in <i>attempt move</i>'));
		return
	}
	
	const weArePlaying = youArePlaying(gameObj.players, socket.id)
	const gameIsInProgress = gameObj.gameState == 'inprogress'
	
	const goodCase = weArePlaying && gameIsInProgress
	if(!goodCase) {
		socket.emit('log', redMsg('spectator cannot make moves'));
		return
	}
	
	
	const pos = get_linearBoardArrayPos_from_xyPos(gameID, x, y)
	
	// Check if the move is valid:
	try {
		blockType = validateMove(gameID, blockType, pos, socket.id)
		// validateMove returns false if invalid.
	} catch(err) {
		blockType = false
	}
	const validMove = blockType !== false
	const moveCountMatches = moveCount == gameObj.moveCount
	
	const completelyValidMove = validMove && moveCountMatches
	
	if(!completelyValidMove) {
		socket.emit('log', redMsg('invalid move'))
		return
	}
	
	// When the move is valid:
	const playerObj = gameObj.players[socket.id]
	playerObj.hasMoved = true
	if(allPlayersMoved(gameObj.players)) {
		var tempBlock2 = [x, y, blockType, socket.id]
		
		// this shit is a problem for 4 player mode!
		performTurn(gameID, gameObj.tempBlock, tempBlock2)
	} else {
		// still waiting for other players
		
		// @TODO
		// store the mutated block on the global gameObj.
		// this is going to be a problem when playing with multiple players.
		// Instead, it would be better to put in on the playerObj of the gameObj???
		// or to put it even somewhere else.
		gameObj.tempBlock = [x, y, blockType, socket.id]
		
		playerObj.onStandby = true
		socket.broadcast.to(gameID).emit('log', '<span class="waitMsg blinkText">' + playerObj.username + ' has moved.'); // let the opponent know
		
		
		
		// print out waiting message.
		const opponentSocketIDs = []
		for(const playerSocketID in playerObj.players) {
			
			if(socket.id != playerSocketID) {
				opponentSocketIDs.push(playerSocketID)
			}
		}
		
		if(opponentSocketIDs.length == 1) {
			const opponent = gameObj.players[ opponentSocketIDs[0] ]
			socket.emit('log', '<span class="waitMsg blinkText">Waiting for '+ opponent.username +'.</span>')
		} else {
			socket.emit('log', '<span class="waitMsg blinkText">Waiting for opponents.</span>')
		}
	}
	
}

function socket_exitGameToLobby() {
	const socket = this
	
	const user = userData[socket.id]
	const current_room = user.room
	
	if(current_room == 'lobby') {
		socket.emit('log', redMsg('already in lobby!'))
		return
	}
	
	socket.leave(current_room)
	
	io.to('lobby').emit('log', dimMsg(user.username + ' joined lobby.'))
	socket.emit('log', '<div class="roomChange">joining lobby</div>', true)
	
	socket.join('lobby')
	user.room = 'lobby'
	io.to(current_room).emit('log', dimMsg(user.username + ' left.') )
	
	checkForPlayerExit(current_room, socket)
	
	sub_renderLobby(socket)
}




function socket_practiceGameReset() {
	const socket = this
	
	const gameID = userData[socket.id].room
	const gameObj = gameData[gameID]
	
	// If this game does not exist, 
	// or if this game does exist, but we are not the creator, we bail out.
	if(gameObj == undefined || gameObj.creator != socket.id) {
		return
	}
	
	// bail out if the game is not a practice game.
	if(gameObj.gameType != 'practice') {
		return
	}
	
	gameObj.board = deepClone(gameObj.initialBoard)
	
	for(const playerSocketID in gameObj.players) {
		const playerObj = gameObj.players[playerSocketID]
		
		playerObj.blockList = deepClone(gameObj.blockList)
		playerObj.winner = false
		playerObj.winPath = []
		playerObj.hasMoved = false
		playerObj.onStandby = false
		playerObj.offeredDraw = false
		playerObj.disconnected = false
		playerObj.forfeit = false
	}
	
	io.to(gameID).emit('setup rematch', gameObj.blockList)
	io.to(gameID).emit('log', dimMsg('Reset.'))
	io.to(gameID).emit('render board', gameObj.board)
	
	startGame(gameID)
}


// @TODO: Allow A user to revoke their rematch offer.
function socket_yesRematch() {
	const socket = this
	
	const user = userData[socket.id]
	const gameID = user.room
	
	if(user.ghost) {
		socket.emit('log', redMsg('You cannot initiate rematch as a ghost'));
		return
	}
	
	if(!gameExists(gameID)) {
		log_invalidGame(socket)
		return
	}
	
	const gameObj = gameData[gameID]
	
	const rematchPossible = gameObj.gameState == 'gameover' && gameObj.noRematch == false
	
	if(!rematchPossible) {
		socket.emit('log', redMsg('rematch not possible in <i>offer rematch</i>!'))
		return
	}
	
	let weArePlaying = youArePlaying(gameObj.players, socket.id)
	
	if(!weArePlaying) {
		socket.emit('log', redMsg('You are not in this game.'));
		return
	}
	
	const playerObj = gameObj.players[socket.id]
	
	playerObj.rematchOffered = true
	
	
	const amountOfPlayers = Object.keys(gameObj.players).length
	let amountOfPlayersWhoWantToRematch = 0
	for(const playerSocketID in gameObj.players) {
		if(gameObj.players[playerSocketID].rematchOffered == true) {
			amountOfPlayersWhoWantToRematch++
		}
	}
	
	if(amountOfPlayers !== amountOfPlayersWhoWantToRematch) {
		socket.broadcast.to(gameID).emit('rematch offered');
		io.to(gameID).emit('log', dimMsg(user.username +' offered a rematch.'))
		return
	}
	
	
	// REMATCH INITIATED!!
	gameObj.board = deepClone(gameObj.initialBoard)
	gameObj.ratingsCalculated = false
	
	
	const creatorElo = sub_returnDisplayElo(gameObj.creator)
	// initially set this to creatorElo but change it if it's found to be different.
	let playerElo = creatorElo
	
	let playersWithMoreThan1000Elo = 0
	
	for(const playerSocketID in gameObj.players) {
		const loop_userData = userData[playerSocketID]
		const loop_playerObj = gameObj.players[playerSocketID]
		loop_playerObj.blockList = deepClone(gameObj.blockList)
		loop_playerObj.winner = false
		loop_playerObj.winPath = []
		loop_playerObj.hasMoved = false
		loop_playerObj.onStandby = false
		loop_playerObj.offeredDraw = false
		loop_playerObj.rematchOffered = false
		loop_playerObj.disconnected = false
		loop_playerObj.forfeit = false
		
		if(loop_userData.elo !== creatorElo) {
			// if it's different, set it to the other player's elo.
			playerElo = sub_returnDisplayElo(playerSocketID)
		}
		
		
		
		if (loop_userData.elo > 1000) {
			playersWithMoreThan1000Elo++
		}
		
	}
	gameObj.totalGames++
	
	let is_iceBoard = false
	const enable_iceBoard_functionality = false
	if(enable_iceBoard_functionality) {
		
		const atleast4GamesPlayed = gameObj.totalGames >= 4
		const bothPlayersHaveMoreThan1000Elo = (playersWithMoreThan1000Elo == 2)
		const diceRollOneOutOf7 = random_inclusive_int(1,7) == 7
		
		
		if(atleast4GamesPlayed && bothPlayersHaveMoreThan1000Elo && diceRollOneOutOf7) {
			is_iceBoard = true
			
			for(var i = 0; i < (gameObj.board.length / 2); i++) {
				if(gameObj.board[i].type == 'blank' && (random_inclusive_int(1,15) == 15)) {
					gameObj.board[i].type = 'ice';
					gameObj.board[(gameObj.board.length - i - 1)].type = 'ice';
				}
			}
			
			// I think the goal of this code is to clear the surrounding blocks of the base block. Considering it's 8 block updates twice.
			// But test to see if this is what it does.
			// @TODO: We could clean this up.
			// clear surrounding. this shit sucks for different board sizes just FYI!!!
			updateBlock(gameID, 4, 5, "blank")
			updateBlock(gameID, 5, 5, "blank")
			updateBlock(gameID, 6, 5, "blank")
			updateBlock(gameID, 4, 6, "blank")
			updateBlock(gameID, 6, 6, "blank")
			updateBlock(gameID, 4, 7, "blank")
			updateBlock(gameID, 5, 7, "blank")
			updateBlock(gameID, 6, 7, "blank")
			
			updateBlock(gameID, 16, 5, "blank")
			updateBlock(gameID, 17, 5, "blank")
			updateBlock(gameID, 18, 5, "blank")
			updateBlock(gameID, 16, 6, "blank")
			updateBlock(gameID, 18, 6, "blank")
			updateBlock(gameID, 16, 7, "blank")
			updateBlock(gameID, 17, 7, "blank")
			updateBlock(gameID, 18, 7, "blank")
		}
	}
	
	
	io.to(gameID).emit('setup rematch', gameObj.blockList, creatorElo, playerElo)
	io.to(gameID).emit('log', dimMsg('Rematch initiated'))
	
	if(is_iceBoard) {
		io.to(gameID).emit('log', '<span class="coldWeather">Cold weather!</span>')
	}
	
	io.to(gameID).emit('render board', gameObj.board)
	startGame(gameID)
}


function socket_forfeit() {
	const socket = this
	
	const gameID = userData[socket.id].room
	const gameObj = gameData[gameID]
	
	if(!gameExists(gameID)) {
		log_invalidGame(socket)
		return
	}
	
	const weArePlaying = youArePlaying(gameObj.players, socket.id)
	if(!weArePlaying) {
		socket.emit('log', redMsg('spectator cannot forfeit'))
		return
	}
	
	wipePossession(gameID, socket.id)
	
	
	gameObj.remainingPlayers--
	gameObj.players[socket.id].forfeit = true
	
	io.to(gameID).emit('render board', gameObj.board)
	
	if (gameObj.remainingPlayers <= 1) {
		var winner = false
		for (const playerID in gameObj.players) {
			const playerObj = gameObj.players[playerID]
			if ((playerObj.disconnected) || (playerObj.forfeit)) {
				// this player is not the winner
			} else {
				gameObj.players[playerID].winner = true
			}
		}
		
		gameOver(gameID)
	}
}


function gameExists(gameID) {
	return gameData[gameID] != undefined
}

function log_invalidGame(socket) {
	socket.emit('log', redMsg('not in a valid game'))
}

function socket_isPlayer_in_game(gameObj, socket) {
	return gameObj.players[socket.id] != undefined
}

function log_notInGame(socket) {
	socket.emit('log', redMsg('you are not in this game'))
}


function youArePlaying(players, findSocketID) {
	for(const playerSocketId in players) {
		if(playerSocketId == findSocketID) {
			return true
		}
	}
	return false
}


// @TODO: make this easier.
function setupGame(socket, gameID, passedStatus) {
	const gameObj = gameData[gameID]
	if(gameObj == null) {
		return
	}
	
	const socketID = socket.id
	socket.leave('lobby')
	
	
	if (passedStatus === 'spec') {
		socket.emit('log', '<div class="roomChange">spectating game</div>', true);
	} else {
		if (gameObj.creator == socketID) {
			socket.emit('log', '<div class="roomChange">creating game</div>', true);
		} else {
			socket.emit('log', '<div class="roomChange">joining game</div>', true);
		}
	}
	
	var joinStatus = 'spectator'; // by default you're a specatator
	var displayBoard = gameObj.board;
	
	if (passedStatus !== 'spec') {
		if (gameObj.gameState == 'open') {
			
			// if the game is open, check if there are vacant slots
			var playerCount = Object.keys(gameObj.players).length
			if (playerCount < gameObj.maxPlayers) {
				addPlayerToGameObj(gameObj, socketID);
				
				// check if this is the creator of the game
				if (gameObj.creator == socket.id) {
					joinStatus = 'creator';
				} else {
					joinStatus = 'player';
					var playerCount = Object.keys(gameObj.players).length;
					if (playerCount < gameObj.maxPlayers) {
						//gameObj.gameState == 'full';
					}
				}
			}
		}
		
		// log
		if (joinStatus !== 'creator') {
			io.to('lobby').emit('log', '<span style="color:' + userData[socket.id].color + ';">' + userData[socket.id].username + '</span> joined ' + gameObj.title + '.');
		}
	} else {
		
		// handle spectator join
		gameObj.specsList.push(socket.id);
		if (gameObj.gameState == 'inprogress') {
			// spec board.
			displayBoard = deepClone(gameObj.board)
			for (var i = 0; i < displayBoard.length; i++) {
				if (displayBoard[i].type == 'mine') {
					hiddenInformation(displayBoard[i]);
				}
			}
		}
	}
	
	var color = "#8474a4"
	if (typeof gameObj.players[socket.id] != 'undefined') {
		color = gameObj.players[socket.id].color;
	}
	
	const username = userData[socket.id].username
	
	io.to(gameID).emit('log', '<span style="color: ' + color + '">' + username + ' joined as ' +  joinStatus + '.</span>');
	if (joinStatus !== 'spectator') {
		io.to(gameID).emit('add to heading', socket.id, username, gameObj.players[socket.id].color, gameObj.players[socket.id].elo);
		io.to(gameID).emit('render board', gameObj.board);
	}
	
	socket.join(gameID);
	userData[socket.id].room = gameID;
	
	socket.emit('setup game', 
		gameID,
		joinStatus,
		gameObj.title,
		gameObj.rows, 
		gameObj.cols, 
		displayBoard, 
		gameObj.players,
		gameObj.gameState,
		gameObj.blockList,
		gameObj.timeLimit,
		gameObj.collisionMode,
		gameObj.moveCount,
		gameObj.timerValue,
		gameObj.gameType
	);
	
	if (gameObj.gameState == 'gameover') {
		gameOver(gameID);
	}
	
	sub_updateLobby();
	// io.to(gameID).emit('update user list', userList(gameID));

}

// function userList(gameID) {
// 	var userList = {};
// }


/**
 * Adds the player to the gameObj
 */
function addPlayerToGameObj(gameObj, socketID) {
	const user = userData[socketID]
	
	const playerObj = {
		username: user.username,
		displayElo: sub_returnDisplayElo(socketID),
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
		color: user.color,
		blockList: {},
		wins: 0,
		draws: 0,
		losses: 0
	}
	
	gameObj.players[socketID] = playerObj
	
	// @TODO: Try to change the color of players when their colors are too close to each other.
	// this is what was used before:
	//
	// this color brightness fix sucks too bad to use, need to do something different. disabling it for now.
	/*
	// it's time to figure out if player colors are too close to eachother...
	var playerColors = [];
	var playerIDs = [];
	for (const playerID in gameObj.players) {
		playerColors.push(gameObj.players[playerID].color);
		playerIDs.push(playerID);
	}
	if (playerColors.length == 2) {
		// somewhat problematic for 4 player games.
		// i won't worry about it at the moment though.
		if (hexColorDelta(playerColors[0], playerColors[1]) > 0.95) {
			// if the difference between colors is small (0.2)
			// then brighten or darken one of them...
			gameObj.players[playerIDs[1]].color = increase_brightness(playerColors[1], 40); // inc brightness by 40%
			//io.to(gameID).emit('log', '<span class="dimMsg">player colors nearly match; brightened ' + userData[playerID].username + '\'s color.</span>');
		}
	}
	*/
	
	// get the list of linear index of the base cells/blocks from the game board
	const bases = []
	for (var i = 0; i < gameObj.board.length; i++) {
		const cell = gameObj.board[i]
		if (cell.type == 'base') {
			bases.push(cell)
		}
	}
	
	// This code won't work for >2 players either.
	let leftBase
	let rightBase
	if(bases[0].x < bases[1].x) {
		leftBase = bases[0]
		rightBase = bases[1]
	} else { // bases[0].x >= bases[1].x
		rightBase = bases[0]
		leftBase = bases[1]
	}
	
	let myBase
	// if we are the creator
	if (gameObj.creator == socketID) {
		// find the base with a left-most x-position and use that for creator slot
		myBase = leftBase
	} else {
		// find the base with a right-most position and use that for joining player
		myBase = rightBase
	}
	
	myBase.history[0] = { 
		turn: 0,
		cause: 'source', 
		playerColor: user.color,
		playerDisplayName: user.username
	}
	
	playerObj.baseX = myBase.x + 1
	playerObj.baseY = myBase.y + 1
	
	setPossessionToSingleCell(myBase, socketID, user.username, user.color)
}




function unready(gameID, socketID) {
	const gameObj = gameData[gameID]
	const playerObj = gameObj.players[socketID]
	const username = userData[socketID].username
	if(!playerObj.ready) {
		return false
	}
	
	io.to(gameID).emit('log', dimMsg(username + ' isn\'t ready.'))
	playerObj.ready = false
	
	// remove all possession of playerID from the board.
	wipePossession(gameID, socketID)
	
	// Add possession back to just the base cell.
	const pos = get_linearBoardArrayPos_from_xyPos(gameID, playerObj.baseX , playerObj.baseY)
	const cellObj = gameObj.board[pos]
	setPossessionToSingleCell(cellObj, socketID, username, playerObj.color)
	
	//io.to(gameID).emit('remove from heading', playerID)
	return true
}


function startGame(gameID) {
	const gameObj = gameData[gameID]
	io.to(gameID).emit('log', '<span style="font-weight:bold">Starting ' + gameObj.title + '.</span>');
	
	gameObj.gameState = 'inprogress';
	gameObj.remainingPlayers = gameObj.maxPlayers;
	gameObj.moveCount = 1;
	
	if (gameObj.timeLimit != false) {
		resetTimer(gameID);
	}
				
	for (block in gameObj.blockList) {
		for (player in gameObj.players) {
			gameObj.players[player].blockList[block] = { ammo: gameObj.blockList[block].ammo };
		}
	}
	
	io.to(gameID).emit('log', dimMsg('Turn <b>1</b>'));
	io.to(gameID).emit('all players ready', 
		gameID, 
		gameObj.timeLimit,
		gameObj.players,
		gameObj.rows,
		gameObj.cols,
		gameObj.board,
		gameObj.gameType
	);
	sub_updateLobby();
}




function resetTimer(gameID) {
	// called when:
	// * a new game is started
	// * after each turn
	const gameObj = gameData[gameID]
	
	if(gameObj == null) {
		io.emit('log', redMsg('gameID undefined in resetTimer()'));
		return
	}
	
	// stop ticking the timer.
	clearInterval(gameObj.gameTimer)
	
	// set the timer to max value
	gameObj.timerValue = gameObj.timeLimit
	
	// update timer
	io.to(gameID).emit('update timer', gameObj.timerValue, gameObj.moveCount)
	
	// tick it down
	gameObj.timerValue--
	
	
	function gameTickSecond() {
		if (typeof gameObj === 'undefined') {
			io.emit('log', redMsg('gameID undefined in resetTimer() setInterval'));
			//clearInterval(gameObj.gameTimer); // hope this works. it doesnt.
		} else {
			if (gameObj.timerValue == 0) {
				// out of time!
				gameObj.timerValue = gameObj.timeLimit; // reset the timer
				performTurn(gameID, gameObj.tempBlock, 'pass'); // next turn!
			} else {
				
				// this is where it sends, every second, to the client, the updated time.
				// this is really inefficient because there's latency and the timer ticks down irregularly.
				// instead, when a new turn happens the client itself should have a timer tick down.
				// when that timer hits 0 it locks it so you cannot move and waits for the server to send the command that it's time out.
				/*
				io.to(gameID).emit('update timer', gameObj.timerValue, gameObj.moveCount); // update timer
				*/
				
				
				gameObj.timerValue--; // tick it down
			}
		}
	}
	
	// this causes it to tick once per second
	gameObj.gameTimer = setInterval(gameTickSecond, 1000)
}


// The function that:
// - updates the blocks for the users, 
// - updates moveCount, 
// - sets player.hasMoved to false
// - executes gameOver when the game is won by a player
//
function performTurn(gameID, tBlock, tBlock2) {
	
	// called when:
	// * both players move
	// * turn time runs out
	
	// tBlock(2) structure:
	// [0] = X position
	// [1] = Y position
	// [2] = blockType
	// [3] = playerID / socket.id
	
	const gameObj = gameData[gameID]
	
	gameObj.playerOnStandby = false; // no longer on standby
	gameObj.moveCount++;   // increase the move count
	
	var passedTurn = false;  // did a player pass?
	var noMove = false;  // assume no at first.
	var thisX, 
	    thisY, 
	    thisType,
	    thisOrigin,
	    thatX,
	    thatY, 
	    thatType, 
	    thatOrigin;
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
	
	
	// Handle ammo increasing when reclaim.
	function reclaim(type, x, y, origin) {
		const pos = get_linearBoardArrayPos_from_xyPos(gameID, x, y)
		const reclaimed = gameObj.board[pos].type
		const playerObj = gameObj.players[origin]
		
		// handle no ammo case
		if(playerObj.blockList[reclaimed] == undefined) {
			playerObj.blockList[reclaimed] = {ammo: 1}
			return
		}
		
		// handle finite ammo case
		if(playerObj.blockList[reclaimed].ammo !== 'inf') {
			playerObj.blockList[reclaimed].ammo++
			return
		}
	}
	
	
	const positionsAreTheSame = (thisX == thatX) && (thisY == thatY)
	
	// Handle reclaim code
	if(!positionsAreTheSame) {
		if (thisType == 'reclaim') {
			reclaim(thisType, thisX, thisY, thisOrigin)
		}
		if (thatType == 'reclaim') {
			reclaim(thatType, thatX, thatY, thatOrigin)
		}
	}
	
	// update the blocks
	if (gameObj.gameType == "practice") {
		updateBlock(gameID, thatX, thatY, thatType, thatOrigin); // not fully sure why it uses tBlock2 / thatX but yeah alright.
	} else {
		
		// update blocks:
		if (!passedTurn) { // if nobody ran out of time...
			if (positionsAreTheSame) { // check for collision.
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
	
	// set hasMoved to false, and build an array with the player socketID values.
	const playersArray = [];
	for (const playerID in gameObj.players) {
		gameObj.players[playerID].hasMoved = false;
		playersArray.push(playerID);
	}
	
	// @TODO figure out what this does.
	wipeAndDetect(gameID)
	
	
	// if game is not over:
	if (gameObj.gameState == 'inprogress') {
		gameObj.tempBlock = 'pass'; // reset the temp block to nothing (so if time runs out...)
		io.to(gameID).emit('log', dimMsg('Turn <b>' + (gameObj.moveCount) + '</b>'))
		
		if (thatType == 'mine explosion' || thisType == 'mine explosion') {
			io.to(gameID).emit('detonate'); // sfx;
		}
		
		if (gameObj.gameType == "practice") {
			io.to(gameID).emit('new move', gameObj.board, noMove, gameObj.players[playersArray[0]].blockList);
		} else {
			
			// @TODO: it seems slow to loop 3 more times through each cell.
			// I think I can improve this.
			
			// not practice mode.
			// in the case of mines we need to send a separate board to each player now:
			
			
			// Newer more optimized version of the code. Not that it matters hugely, 
			// but we do avoid looping through the same data structure 2 more times. 
			// and avoiding a lot of serialization.
			const do_new_version = true
			if(do_new_version) {
				var thisBoard = []
				var thatBoard = []
				var specBoard = []
				for(const cellObj of gameObj.board) {
					
					var hideCellForSpectators = false
					var hideCellForThisBoard = false
					var hideCellForThatBoard = false
					
					if(cellObj.type == 'mine') {
						hideCellForSpectators = true
						
						if(cellObj.origin !== playersArray[0]) {
							hideCellForThisBoard = true
						} else
						if(cellObj.origin !== playersArray[1]) {
							hideCellForThatBoard = true
						}
					}
					
					var specBoardCellItem = cellObj
					var thisBoardCellItem = cellObj
					var thatBoardCellItem = cellObj
					
					if(hideCellForSpectators) { specBoardCellItem = hiddenInformation(deepClone(cellObj)) }
					if(hideCellForThisBoard ) { thisBoardCellItem = hiddenInformation(deepClone(cellObj)) }
					if(hideCellForThatBoard ) { thatBoardCellItem = hiddenInformation(deepClone(cellObj)) } 
					
					specBoard.push(specBoardCellItem)
					thisBoard.push(thisBoardCellItem)
					thatBoard.push(thatBoardCellItem)
					
				}
			}
			
			// old version of the code that's verified to work.
			if(!do_new_version) {
				var thisBoard = deepClone(gameObj.board)
				for (var i = 0; i < thisBoard.length; i++) {
					if (thisBoard[i].type == 'mine') {
						if (thisBoard[i].origin !== playersArray[0]) {
							hiddenInformation(thisBoard[i]);
						}
					}
				}
				
				var thatBoard = deepClone(gameObj.board)
				for (var i = 0; i < thatBoard.length; i++) {
					if (thatBoard[i].type == 'mine') {
						if (thatBoard[i].origin !== playersArray[1]) {
							hiddenInformation(thatBoard[i]);
						}
					}
				}
				
				var specBoard = deepClone(gameObj.board)
				for (var i = 0; i < specBoard.length; i++) {
					if (specBoard[i].type == 'mine') {
						hiddenInformation(specBoard[i]);
					}
				}
			}
			
			
			io.to(playersArray[0]).emit('new move', thisBoard, noMove, gameObj.players[playersArray[0]].blockList);
			io.to(playersArray[1]).emit('new move', thatBoard, noMove, gameObj.players[playersArray[1]].blockList);
			
			// specslist is for the spectators
			for(var i = 0; i < gameObj.specsList.length; i++) {
				io.to(gameObj.specsList[i]).emit('new move', specBoard, noMove);
			}
			
		}
	}
	
	
	// if game IS over:
	if (gameObj.gameState == 'gameover') {
		io.to(gameID).emit('new move', gameObj.board, noMove);			
		gameOver(gameID);
	} else if (gameObj.timeLimit != false) {
		resetTimer(gameID);
	} else {
		io.to(gameID).emit('update timer', false, gameObj.moveCount); // update turn count.
	}
}

// Solely executed from within performTurn
// 
function wipeAndDetect(gameID) {
	const gameObj = gameData[gameID]
	const permanence = gameObj.collisionMode.permanence
	
	function wipeCollisions(gameID) {
		const gameObj = gameData[gameID]
		
		// collisionMode.permanence is an int that says how many turns the block should stick around for.
		const permanence = gameObj.collisionMode.permanence
		
		// loop the entire board
		for(let cellIndex = 0; cellIndex < gameObj.board.length; cellIndex++) {
			const cellObj = gameObj.board[cellIndex]
			
			// if we find a block with a duration
			if(cellObj.duration !== false) {
				
				// @TODO: figure out what the logic is here. As I don't get it. And what does cellObj.duration have to do with it?
				if(cellObj.moveNum <= (gameObj.moveCount - permanence)) {
					
					// this is when it can be returned to a blank square.
					const posObj = get_xyPos_from_linearBoardArrayPos(gameID, cellIndex)
					updateBlock(gameID, posObj.x, posObj.y, 'blank', 'collision fade')
				} else {
					cellObj.duration--
				}
			}
		}
	}
	
	
	// only wipe collisions when permanence is not true.
	// a true value meaning permanent collisions.
	if(permanence !== true) {
		wipeCollisions(gameID);
	}
	
	// @TODO: test if we can put this code below the next block, 
	// into the block which also loops through every single cell.
	for(const cellObj of gameObj.board) {
		cellObj.possessionSpread = {} // wipe possessionSpread
		cellObj.possessionColorSpread = []
	}
	
	
	// For some reason we completely calculate many things on every turn.
	// which is fine I guess.
	// and at least it won't result in an incorrect state. 
	// Although we could probably make it more performant by combining some loops and/or inverting some loops.
	for(const playerID in gameObj.players) {
		wipePossession(gameID, playerID)
		
		const playerObj = gameObj.players[playerID]
		
		if(
			(playerObj.disconnected) || 
			(playerObj.forfeit)
		) {
			io.to(gameID).emit('log', dimMsg('not relighting forfeit/dc\'d player'))
		} else {
			const baseX = playerObj.baseX;
			const baseY = playerObj.baseY;
			const pos = get_linearBoardArrayPos_from_xyPos(gameID, baseX, baseY);
			
			const cellObj = gameObj.board[pos]
			cellObj.possession.push(playerID)
			cellObj.color = getBoardCellColor(gameID, cellObj.possession)
			
			optionsDetection2(gameID, baseX, baseY, playerID)
		}
	}
	
	
	for(const cellObj of gameObj.board) {
		
		// set possessionSpread color...
		const length = Object.keys(cellObj.possessionSpread).length
		
		// @TODO: figure out why this does not mess up. 
		//   I assume, since before cellObj.possessionSpread is 0. 
		//   But maybe cellObj.possessionSpread is set within optionsDetection2? Yes.
		if(length === 1) {
			
			// if the length is 1 we just need to know which spread layer.
			// along with the player color.
			
			// @TODO: figure this out.
			
			for(const playerID in cellObj.possessionSpread) {
				
				const passedColor = getBoardCellColor(gameID, [playerID])
				const passedLayer = cellObj.possessionSpread[playerID]
				
				cellObj.possessionColorSpread = [{
					color: passedColor,
					layer: passedLayer
				}]
			}
			
		} else if (length === 2) {
			
			// if the length is 2 then we need to know which player's spread hit the square when.
			// the second player to hit the square w/ the spread uses the mixed color
			
			// @TODO: figure this out.
			
			const collection = []
			const players = []
			
			for(const playerID in cellObj.possessionSpread) {
				const passedColor = getBoardCellColor(gameID, [playerID])
				const passedLayer = cellObj.possessionSpread[playerID]
				
				collection.push({
					color: passedColor,
					layer: passedLayer
				})
				
				// push playerIDs into an array for use in getBoardCellColor (for mixed colors)
				players.push(playerID);
			}
			
			if (collection[0].layer == collection[1].layer) {
				
				// both player spread hit at the same time so just add the mixed color for that layer.
				cellObj.possessionColorSpread = [{
					color: getBoardCellColor(gameID, players),
					layer: collection[0].layer
				}]
				
			} else if (collection[0].layer < collection[1].layer) {
				
				// 0 before 1.
				cellObj.possessionColorSpread.push({
					color: collection[0].color,
					layer: collection[0].layer
				})
				
				cellObj.possessionColorSpread.push({
					color: getBoardCellColor(gameID, players),
					layer: collection[1].layer
				})
				
			} else if (collection[0].layer > collection[1].layer) {
				
				// 1 before 0.
				cellObj.possessionColorSpread.push({
					color: collection[1].color,
					layer: collection[1].layer
				})
				
				cellObj.possessionColorSpread.push({
					color: getBoardCellColor(gameID, players),
					layer: collection[0].layer
				})
			}
		} // end of length == 2
		
	} // end of for loop for each cellObj
	
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
