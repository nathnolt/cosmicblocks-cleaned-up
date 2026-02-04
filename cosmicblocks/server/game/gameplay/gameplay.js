const crypto = require('crypto')

const {
	gameData,
	userData
} = require('../vars.js')

const {
	emptyColor
} = require('../constants.js')

const {
	blocklist_moves,
	blocklist_readableNames,
	blocklist_circled
} = require('./game-static.js')

const {
	sub_updateLobby
} = require('../subs.js')

const {
	b,
	div,
	dimMsg,
} = require('../../util/html.js')

const {
	// hslToHex,
	// getRandomUserColor,
	// hexColorDelta,
	// increase_brightness,
	mix
} = require('../../util/color.js')

const {
	random_inclusive_int,
} = require('../../util/util.js')

const {
	saveData
} = require('../../settings.js')
const { db_updateUserWithGameResults } = require('../../db/db.js')

let io
function gameplay_setio(ioValue) {
	io = ioValue
}


function getGameID() {
	return 'game-' + crypto.randomBytes(8).toString('hex')
}


/** 
* update an individual block, server-side \
* initialType is resolved to actual blockType, which is different in some cases. \
* when origin is set, both a chat message, and a history message is put on the board
*/
function updateBlock(gameID, x, y, initialType, origin) {
	
	// 1. get the board position
	const pos = get_linearBoardArrayPos_from_xyPos(gameID, x, y);
	const cellObj = gameData[gameID].board[pos]
	
	// 2. Get the actual block type
	let blockType = initialType;
	if (initialType == 'mine explosion') {
		blockType = 'blockade';
	}
	if (initialType == 'reclaim') {
		blockType = 'blank';
	}
	if (initialType == 'circle') {
		
		// @TODO: test what the game does when we hack the front-end to transformCircle on a tile that's not valid, 
		// so that blockType becomes false.
		blockType = blocklist_circled[cellObj.type]
		if(blockType == undefined) {
			blockType = false
		}
		
	}
	
	
	// 3. update the block:
	cellObj.type    = blockType;
	cellObj.moveNum = gameData[gameID].moveCount;
	
	
	// 4. Does something with permanence. 
	//    I think that's for the collision system, which ticks down every turn?
	var permanence = gameData[gameID].collisionMode.permanence;
	if ((blockType == 'blockade') && (permanence !== true)) {
		
		// It probably does permanence + 1 because it's -1'd at the end of every turn
		cellObj.duration = permanence + 1
	} else {
		cellObj.duration = false
	}
	
	
	// 5. Generate HTML strings for the chat and the history.
	//    The history string is put on the gameData board position object for that tile
	//    and the chat string is sent to the chatLog
	// 
	//    origin either is: socket.id or 'collision' or 'collision fade'
	if (typeof origin !== 'undefined') {
		cellObj.origin = origin;
		
		let historyString = ''
		let chatHistoryString = ''
		
		if (initialType !== 'mine') {
			chatHistoryString += x + ',' + y + ': '
		}
		
		const turnNumber = gameData[gameID].moveCount - 1
		
		if (origin == 'collision' || origin == 'collision fade') {
			historyString += `${b(origin)} on turn ${turnNumber}.`;
			chatHistoryString += b(origin)
		} else {
			
			const player = gameData[gameID].players[origin]
			cellObj.originColor = player.color
			
			const typeStrMap = {
				'circle': 'circled',
				'mine explosion': 'mine tripped',
				'reclaim': 'reclaimed'
			}
			const types = Object.keys(typeStrMap)
			const typeStr = typeStrMap[initialType]
			
			if(types.includes(initialType)) {
				historyString     += b(typeStr) + ' '
				chatHistoryString += b(typeStr) + ' '
			} else {
				const blockPlacedStr = b(readableBlockName(blockType)) + ' placed '
				
				historyString     += blockPlacedStr
				chatHistoryString += blockPlacedStr
			}
			
			
			const byColoredUsernameStr = 'by <b style="color:' + player.color + '">' + player.username + '</b>'
			historyString     += byColoredUsernameStr + ' on turn ' + b(turnNumber) + '.'
			chatHistoryString += byColoredUsernameStr + '.'
		}
		
		// Set the strings on the board position, and send the chatString to the clients
		gameData[gameID].board[pos].history.push( div(historyString) )
		io.to(gameID).emit('log', div(chatHistoryString, 'dimMsg') )
		
		
		// Commented code. Probably a different way of trying to do the same thing.
		/*
		var historyObj = {
			turn: gameData[gameID].moveCount - 1,
			blockType: blockType
		}
		if (origin == 'collision' || origin == 'collision fade') {
			historyObj.cause = origin;
			gameData[gameID].board[pos].origin = origin;
		} else {
			historyObj.cause = 'player';
			historyObj.playerDisplayName = gameData[gameID].players[origin].username;
			historyObj.playerColor = gameData[gameID].players[origin].color;
			gameData[gameID].board[pos].origin = origin;
			gameData[gameID].board[pos].originColor = gameData[gameID].players[origin].color;
		}
		gameData[gameID].board[pos].history.push(historyObj);
		*/
	}
	
}

function get_linearBoardArrayPos_from_xyPos(gameID, x, y) {
	return (y - 1) * gameData[gameID].cols + x - 1
}

function get_xyPos_from_linearBoardArrayPos(gameID, pos) {
	const x = (pos % gameData[gameID].cols) + 1
	const y = ((pos - x + 1) / gameData[gameID].cols) + 1
	return {x, y}
}


// This function is only used in 1 location.
// But as it's used within the client, I think it's better to keep it this way, and eventually move it into a shared js so that both ends use the same code.
// And maybe eventually only have it run on 1 end and not on both ends?
function readableBlockName(blockType) { 
	if (blocklist_readableNames.hasOwnProperty(blockType)) {
		return blocklist_readableNames[blockType]
	} else {
		return blockType
	}
}


// 
// right, this is complicated because optionsDetection is called from within a loop, 
// which dynamically adds new items, which are looped over again, 
// calling optionsDetection again, with other parameters.
// 
// It feels a bit like recursion, because in recursion you frequenty do the same kind of thing.
// 
// The way that this function is called, is where x and y are the base of a player.
// So this probably tries to figure out whether you have won, or something.
// 
function optionsDetection2(gameID, x, y, playerID) {

	var queue = [
		[gameID, x, y, playerID, undefined, 0, undefined]
	];
	
	while (queue.length) {
		var newCollection = optionsDetection(queue[0][0], queue[0][1], queue[0][2], queue[0][3], queue[0][4], queue[0][5], queue[0][6])
		
		// loop through newCollection, essentially appending to queue the result of the previous call.
		for (var i = 0; i < newCollection.length; i++) {
			queue.push(newCollection[i]);
		}
		
		// remove item[0], aka: the item that we just handled.
		queue.shift();	
	}
}


// 
// Only used from optionsDetection2
// This function looks complicated.
// It will get cleaned up eventually
function optionsDetection(gameID, x, y, playerID, passedWinPath, currentLayer, iceDir) {
	
	var collection = []
	var pos = get_linearBoardArrayPos_from_xyPos(gameID, x,y);
	var dir
	
	const gameObj = gameData[gameID]
	
	if (typeof iceDir === 'undefined') {
		iceDir = false;
	}
	if (iceDir !== false) {
		dir = iceDir;
		iceDir = false;
	} else {
		var someType = gameObj.board[pos].type;
		
		
		// set dir for type
		if(blocklist_moves[someType] == undefined) {
			io.emit('log', '<span class="redMsg">blockType not a function in getMoves()</span>');
			dir = [[]]
		}
		dir = blocklist_moves[someType]
		
	}
	
	if (typeof passedWinPath === 'undefined') { 
		var winPath = [];
		currentLayer = 0;
	} else {
		var winPath = passedWinPath.slice();
	}
	
	winPath[currentLayer] = pos
	
	// loop through the moves that this block has, for the + for example, it's 4 directions,
	// [        [0, -1],
	//   [-1, 0],       [1, 0],
	//          [0,  1]
	// ]
	// it's an array with moves which is an array of offsets from the base position.
	
	// loop through each move
	for(var i = 0; i < dir.length; i++) {
		
		// calculate the new position
		var newX = x + dir[i][0]
		var newY = y + dir[i][1]
		
		const newPositionInBounds = (
			(
				(newX >= 1) && 
				(newX <= gameObj.cols)
			) && 
			(
				(newY >= 1) && 
				(newY <= gameObj.rows)
			)
		)
		
		if(!newPositionInBounds) {
			continue
		}
		
		// When the position is in bounds:
		const newPos = get_linearBoardArrayPos_from_xyPos(gameID, newX, newY)
		const cellObj = gameObj.board[newPos]
		const newType = cellObj.type
		
		let run = true
		const wePossessTheCellObj = cellObj.possession.indexOf(playerID) >= 0
		if(wePossessTheCellObj) {
			run = false
			if(currentLayer < cellObj.possessionSpread[playerID]) { // always false with the queue, redundant.
				cellObj.possessionSpread[playerID] = currentLayer
				run = true
			}
			
		} else if (newType !== 'ice' && newType !== 'blockade') {
			// set possession and color, if not ice.
			cellObj.possession.push(playerID);
			cellObj.possessionSpread[playerID] = currentLayer;
			if (cellObj.possession.length == 2) {
				cellObj.possessionDisplayName = 'Both';
			} else {
				cellObj.possessionDisplayName = userData[cellObj.possession[0]].username;
			}
			cellObj.color = getBoardCellColor(gameID, cellObj.possession);
		} else if (someType === 'knight' && newType === 'ice') {
			// knights may not jump on ice.
			run = false;
		}
		
		
		// 
		if ((newType != "blank") && (run == true)) {
			
			// handle code that checks for win
			if (newType == 'base') {
				
				// @TODO: this does not do what's intended. 
				//        As this will always be false, 
				//        resulting in the contents being run.
				if(cellObj.possession !== [playerID]) {
					gameObj.players[playerID].winner = true; 
					gameObj.gameState = 'gameover';
					if (gameObj.players[playerID].winPath.length == 0 ) {
						gameObj.players[playerID].winPath = winPath.slice(0, currentLayer+1);
						gameObj.players[playerID].winPath.push(newPos);
					}
				}
				
			} else 
			// handle ice case
			if (newType == 'ice') {
				var iceX = 0;
				var iceY = 0;
				if (dir[i][0] < 0) { iceX = -1 }
				if (dir[i][0] > 0) { iceX = 1 }
				if (dir[i][1] < 0) { iceY = -1 }
				if (dir[i][1] > 0) { iceY = 1 }
				iceDir = [ [iceX, iceY] ];
			}
			
			newLayer = currentLayer + 1;
			
			// push the next thing into collection.
			//optionsDetection(gameID, newX, newY, playerID, winPath, newLayer, iceDir);
			collection.push([gameID, newX, newY, playerID, winPath, newLayer, iceDir]);
			iceDir = false;
		}
		
	} // end of for loop
	
	return collection;
}

function getBoardCellColor(gameID, possession) {
	// send a possession array here after splicing or adding to return the color the block should be.
	
	if (possession.length == 0) {
		return emptyColor;
	}
	
	if (possession.length == 1) {
		return gameData[gameID].players[possession[0]].color;
	}
	
	if (possession.length == 2) {
		var color_1 = gameData[gameID].players[possession[0]].color;
		var color_2 = gameData[gameID].players[possession[1]].color;
		return mix(color_1, color_2);
	}
	
	if (possession.length > 2) {
		io.to(gameID).emit('log', '<b>sorry i need to add mixing of 3 or more colors.');
		return emptyColor;
	}
}


/** 
* removes all possessions from the board of a certain socketID (user)
*/
function wipePossession(gameID, socketID) {
	const gameObj = gameData[gameID]
	
	// loop through every cell (or tile) within the gameBoard
	for(const cellObj of gameObj.board) {
		// and for every cell:
		// 1. go through the posessions
		// 2. check if a tile is posessed by socketID
		// 3. if it is, remove the posession
		// 4. and set the displayname and color
		for (var j = 0; j < cellObj.possession.length; j++) {
			
			if (cellObj.possession[j] == socketID) {
				cellObj.possession.splice(j, 1)
				
				if (cellObj.possession.length == 0) {
					cellObj.possessionDisplayName = false
				} else {
					// assuming only 1 name then
					cellObj.possessionDisplayName = userData[cellObj.possession[0]].username
				}
				
				cellObj.color = getBoardCellColor(gameID, cellObj.possession)
			}
		}
		
	}
}

/**
* Sets possession to a single cell.
*/
function setPossessionToSingleCell(cellObj, socketID, username, color) {
	cellObj.possession.push(socketID)
	cellObj.possessionDisplayName = username
	cellObj.color = color
}


function checkForPlayerExit(gameID, socket) {
	// @TODO: handle this function later.
	// console.log('check for player exit')
	const gameObj = gameData[gameID]
	
	if(gameObj == null) {
		return
	}
	
	// console.log('checkForPlayerExit', Object.keys(game))
	
	// remove from specs list if found there.
	// specsList is for the spectators
	for(var j = 0; j < gameObj.specsList.length; j++) {
		if (gameObj.specsList[j] == socket.id) {
			gameObj.specsList.splice(j,1);
		}
	}
	
	if(gameObj.gameState == 'open') {
		if(gameObj.creator == socket.id) {
			// creator left an open game, so kill the game.
			socket.broadcast.to(gameID).emit('kill game')
			delete gameData[gameID] // remove game.
			sub_updateLobby() // player spot opened?
		} else {
			// player left an open game, so remove them.
			for(const playerID in game.players) {
				if (playerID == socket.id) {
					wipePossession(gameID, playerID);
					delete gameObj.players[playerID];
					sub_updateLobby(); // player spot opened?
					io.to(gameID).emit('log', '<span class="dimMsg">removed ' + userData[socket.id].username + ' as player.</span>');
					io.to(gameID).emit('remove player heading');
					io.to(gameID).emit('render board', game.board);
				}
			}
		}
	} else if (gameObj.gameState == 'inprogress') {
		for(const playerID in gameObj.players) {
			if (playerID == socket.id) {
				// player left an in-progress game, so they lose.
				wipePossession(gameID, playerID);
				gameObj.players[playerID].disconnected = true;
				gameObj.remainingPlayers--;
				io.to(gameID).emit('render board', gameObj.board);
				if (gameObj.remainingPlayers <= 1) {
					for (playerID in gameObj.players) {
						if ((gameObj.players[playerID].disconnected) || (gameData[gameID].players[playerID].forfeit)) {
							// this player is not the winner
						} else {
							gameObj.players[playerID].winner = true;
						}
					}
					gameOver(gameID);
					//io.to(gameID).emit('game over', winner, 'dc');
				}
			}
		}
	} else if (gameObj.gameState == 'gameover') {
		for(const playerID in gameObj.players) {
			if (playerID == socket.id) {
				io.to(gameID).emit('remove rematch button');
				gameObj.noRematch = true;
			}
		}
	}
}








// @TODO: clean up.
function gameOver(gameID) {
	
	function stopTimer(gameID) {
		if( 
			gameData[gameID] == null || 
			gameData[gameID].gameTimer === false
		) { return }
		
		clearInterval(gameData[gameID].gameTimer)
		gameData[gameID].gameTimer = false
		//io.to(gameID).emit('log', '<span class="dimMsg">timer stopped</span>');
	}
	
	gameData[gameID].gameState = 'gameover';
	
	stopTimer(gameID);
	
	
	var winners = [];
	var winPaths = [];
	var color = [];
	var playerIDs = [];
	var drawGame;
	
	for (playerID in gameData[gameID].players) {
		playerIDs.push (playerID);
		if (gameData[gameID].players[playerID].winner) {
			winners.push(playerID);
			color.push(gameData[gameID].players[playerID].color);
			winPaths.push(gameData[gameID].players[playerID].winPath);
		} else {
			wipePossession(gameID, playerID);
		}
	}
	
	if (winners.length == 1) {
		drawGame = false;
	} else {
		drawGame = true;
	}
	
	if (color.length == 1) {
		color = color[0];
	} else {
		if ((typeof color[0] !== 'undefined') && (typeof color[1] !== 'undefined')) {
			// without this if, this actually crashed once.. somehow undefined?
			color = mix(color[0], color[1]);
		}
	}
	
	
	// use a label here so that we can break to after the label, in order to do a guard clause thing
	// but not being in a function.
	label: {
		
		if(gameData[gameID].gameType === 'practice') {
			break label
		}
		
		if(gameData[gameID].moveCount <= 1) {
			gameData[gameID].ratingsCalculated = true;
			io.to(gameID).emit('log', 'No stats collected.');
			break label
		}
		
		if(gameData[gameID].ratingsCalculated != false) {
			break label
		}
		
		
		for(playerID in gameData[gameID].players) {
			if (drawGame == false) {
				if (playerID === winners[0]) {
					gameData[gameID].players[playerID].wins++;
					userData[playerID].wins++;
					userData[playerID].gamesPlayed++;
					if (random_inclusive_int(1,5) !== 5) {
						userData[playerID].remainingRerolls++;
					}
				} else {
					gameData[gameID].players[playerID].losses++;
					userData[playerID].losses++;
					userData[playerID].gamesPlayed++;
					if (random_inclusive_int(1,5) === 5) {
						userData[playerID].remainingRerolls++;
					}
				}
			} else {
				gameData[gameID].players[playerID].draws++;
				userData[playerID].draws++;
				userData[playerID].gamesPlayed++;
				if (random_inclusive_int(1,5) > 2) {
					userData[playerID].remainingRerolls++;
				}
			}
		}
		
		// Elo
		var kFactor = 20;
		if (gameData[gameID].gameType == 'random') {
			kFactor = 7.5;
		}
		
		if (gameData[gameID].moveCount < 8) {
			kFactor *= (gameData[gameID].moveCount / 8);
		}
		
		var winner, loser;
		if (gameData[gameID].players[playerIDs[0]].winner) {
			winner = playerIDs[0];
			loser = playerIDs[1];
		} else {
			winner = playerIDs[1];
			loser = playerIDs[0];
		}
		if (userData[winner].elo === -99999) { 
			userData[winner].elo = 1000;
		}
		if (userData[loser].elo === -99999) {
			userData[loser].elo = 1000;
		}
		var ratingDifference = userData[loser].elo - userData[winner].elo;
		var expectedScoreWinner = 1 / ( 1 + Math.pow(10, ratingDifference/400) );
		var actualScore = 1;
		if (drawGame) { actualScore = 0.5; }
		var e = kFactor * (actualScore - expectedScoreWinner);
		userData[winner].oldElo = userData[winner].elo;
		userData[winner].elo += e;
		userData[loser].oldElo = userData[loser].elo;
		userData[loser].elo -= e;
		
		gameData[gameID].ratingsCalculated = true;
		
		var p1Score = gameData[gameID].players[playerIDs[0]].wins + (gameData[gameID].players[playerIDs[0]].draws / 2);
		var p2Score = gameData[gameID].players[playerIDs[1]].wins + (gameData[gameID].players[playerIDs[1]].draws / 2);
		
		var postGameMsg = '<div class="postGame">';
		if (drawGame) {
			postGameMsg += '<span class="result">Draw Game!</span>';
		} else {
			postGameMsg += '<span class="result" style="color: ' + userData[winners[0]].color + '">' + userData[winners[0]].username + ' Wins!</span>';
		}
		postGameMsg += '<div class="seriesScore"><div style="color: '+ userData[playerIDs[1]].color + '"><span>' + p2Score + '</span></div><div style="color: '+ userData[playerIDs[0]].color + '"><span>' + p1Score + '</span></div></div>';
		for (var j = 0; j <= 1; j++) {			
			if (userData[playerIDs[j]].gamesPlayed >= 10) {
				// if user has not played at least 10 games, do not show rating change.
				var prior = Math.round(userData[playerIDs[j]].oldElo) - 1000;
				var post = Math.round(userData[playerIDs[j]].elo) - 1000;
				if ((prior > 0) || (post > 0)) {
					if (prior <= 0) {
						prior = 0;
					}
					if (post <= 0) {
						post = 0;
					}
					
					var change = post - prior;
					postGameMsg += '<div><span style="color:'+ gameData[gameID].players[playerIDs[j]].color +'; font-weight:bold;">'+ userData[playerIDs[j]].username +'</span><span class="dimMsg">: ';
					postGameMsg += prior + '&rarr;</span>' + post +' </span>';
					if (change > 0) {
						postGameMsg += '<span class="greenMsg">(+' + change + ')</span>';
					} else if (change == 0) {
						postGameMsg += '<span>(&plusmn;0)</span>';
					} else {
						postGameMsg += '<span class="redMsg">(&minus;' + Math.abs(change) + ')</span>';
					}
					postGameMsg += '</div>';
				}
			}
		}
		
		postGameMsg += '</div>';
		io.to(gameID).emit('log', postGameMsg, true);
		
		// @TODO: handle sync
		if(saveData) {
			
			for(const playerID of playerIDs) {
				const user = userData[playerID]
				const userAvgMoveCount = user.avgMoveCount + (gameData[gameID].moveCount - user.avgMoveCount) / user.gamesPlayed
				
				db_updateUserWithGameResults(
					user.id, 
					user.elo, 
					user.gamesPlayed, 
					user.wins, 
					user.losses, 
					user.draws, 
					userAvgMoveCount
				)
			}
			
			
			const old_sync = false
			if(old_sync) {
				db.sync(function(err) {
					if (err) throw err;
					for(const playerID of playerIDs) {
						const user = userData[playerID]
						const userAvgMoveCount = user.avgMoveCount + (gameData[gameID].moveCount - user.avgMoveCount) / user.gamesPlayed
						
						db_updateUserWithGameResults(
							user.id, 
							user.elo, 
							user.gamesPlayed, 
							user.wins, 
							user.losses, 
							user.draws, 
							userAvgMoveCount
						)
						
					}
					
					if (typeof userData[playerIDs[0]] !== 'undefined') {
						User.find({ twitterID: userData[playerIDs[0]].twitterid }, function (err, users){
							if (err) throw err;
							if ((users[0].gamesPlayed + 1) !== userData[playerIDs[0]].gamesPlayed) {
								io.emit('log', '<span class="redMsg">FAILED STATS UPDATE FOR ' + userData[playerIDs[0]].username + '</span>');
								io.emit('log', '<span class="redMsg">' + playerIDs[0] + '</span>');
							} else {
								// sync with userData, which is already done updating.
								users[0].elo = userData[playerIDs[0]].elo;
								users[0].gamesPlayed = userData[playerIDs[0]].gamesPlayed;
								users[0].wins = userData[playerIDs[0]].wins;
								users[0].losses = userData[playerIDs[0]].losses;
								users[0].draws = userData[playerIDs[0]].draws;
								users[0].avgMoveCount += ((gameData[gameID].moveCount - users[0].avgMoveCount) / users[0].gamesPlayed);
								users[0].save(function (err) {
									if (err) throw err;
									console.log("success: " + userData[playerIDs[0]].username);
								});
							}
						});
					}
					
					
					if (typeof userData[playerIDs[1]] !== 'undefined') {
						User.find({ twitterID: userData[playerIDs[1]].twitterid }, function (err, users2){
							if (err) throw err;
							if ((users2[0].gamesPlayed + 1) !== userData[playerIDs[1]].gamesPlayed) {
								io.emit('log', '<span class="redMsg">FAILED STATS UPDATE FOR ' + userData[playerIDs[1]].username + '</span>');
								io.emit('log', '<span class="redMsg">' + playerIDs[1] + '</span>');
							} else {
								//afaik can only update one user at a time.
								users2[0].elo = userData[playerIDs[1]].elo;
								users2[0].gamesPlayed = userData[playerIDs[1]].gamesPlayed;
								users2[0].wins = userData[playerIDs[1]].wins;
								users2[0].losses = userData[playerIDs[1]].losses;
								users2[0].draws = userData[playerIDs[1]].draws;
								users2[0].avgMoveCount += ((gameData[gameID].moveCount - users2[0].avgMoveCount) / users2[0].gamesPlayed);
								users2[0].save(function (err) {
									if (err) throw err;
									console.log("success: " + userData[playerIDs[1]].username);
								});
							}
						});
					}
				});
			}
		}
		
	} // end of label statement

	// else {
	// 	gameData[gameID].ratingsCalculated = true;
	// 	io.to(gameID).emit('log', 'No stats collected.');
	// }
	
	io.to(gameID).emit('victory', winners, winPaths, color, gameData[gameID].gameType);
	sub_updateLobby();
}


module.exports = {
	getGameID,
	updateBlock,
	get_linearBoardArrayPos_from_xyPos,
	get_xyPos_from_linearBoardArrayPos,
	optionsDetection2,
	gameplay_setio,
	getBoardCellColor,
	
	setPossessionToSingleCell,
	wipePossession,
	checkForPlayerExit,
	
	gameOver,
}