//
// @TODO: read through all of this and figure out what each function tries to do. 
// And see if it offers interesting functionality that we want.
//

function socket_newColor(color) {
	var gameID = userData[socket.id].room;
	if (typeof gameObj != 'undefined') {
		if (gameObj.gameState == 'open') {
			if (typeof gameObj.players[socket.id] == 'undefined') {
				addPlayerToGameObj();
				io.to(gameID).emit('log', '<span style="color: ' + color + '">' + userData[socket.id].username + ' is playing.</span>');
			} else {
				io.to(gameID).emit('log', '<span style="color: ' + color + '">' + userData[socket.id].username + ' changed colors.</span>');
			}
			gameObj.players[socket.id].color = color;
			
			for (var i = 0; i < gameObj.board.length; i++) {
				if (gameObj.board[i].possession.length == 1) {
					if (gameObj.board[i].possession[0] == socket.id) {
						gameObj.board[i].color = color;
					}
				}
			}
			
			io.to(gameID).emit('update colors', gameObj.players, baseColors, gameObj.maxPlayers, gameObj.board);
		} else {
			io.emit('log', '<span class="redMsg">gameState not open in <i>new color</i></span>');
		}
	} else {
		io.emit('log', '<span class="redMsg">gameData[' + gameID + '] undefined in <i>new color</i></span>');
	}
}

function socket_handleNameChosen(name) { 
	userData[socket.id].username = name;
	userData[socket.id].color = getRandomUserColor();
	if (shortID(socket.id) != name) {
		socket.broadcast.emit('log', '<span style="color: '+ userData[socket.id].color +';">' + shortID(socket.id) + '\'s name is <span style="font-weight: bold">' + userData[socket.id].username + '</span>.</span>' )
	}
	socket.emit('log', '<span style="color: '+ userData[socket.id].color +';">Your name is <span style="font-weight:bold">' + userData[socket.id].username + '</span>.</span>' );
	io.to('lobby').emit('log', '<span class="dimMsg">' + userData[socket.id].username + ' joined lobby.');
	socket.emit('make chat available', userData[socket.id].username);
	socket.join('lobby'); // joins the socket io room "lobby"
	userData[socket.id].room = 'lobby';
	updateLobby(); // render lobby.
	
	//db.push("/userData", userData);
	//db.push("/gameData", gameData);
	//var data = db.getData("/");
	//console.log(data);
	
}








function shortID(socketID) {
	return socketID.toString().substring(0,5); // create a truncated ID
}

function getName(socketID) {
	for (var i = 0; i < userData.length; i++) {
		if (socketID == userData[i].socketid) {
			return userData[i].username;
		}
	}
	return shortID(socketID);
}

function updateName(socketID, name) {
	for (var i = 0; i < userData.length; i++) {
		if (socketID == userData[i].socketid) {
			userData[i].username = name;
		}
	}
}





/* function wipe_unused_Possession(gameID) {
// this will clear possession everywhere except the player's base.
// wait... do I even need to set the player's base??
// oh I think I do bc the base itself must be colored the base color
// lol
	
	for (var i = 0; i < gameObj.board.length; i++) {
		gameObj.board[i].possession = 0;
	}
	if (gameObj.player1 != false) {
		var pos = get_linearBoardArrayPos_from_xyPos(gameID, gameObj.p1x, gameObj.p1y);
		gameObj.board[pos].possession = 1;
	}
	if (gameObj.player2 != false) {
		var pos = get_linearBoardArrayPos_from_xyPos(gameID, gameObj.p2x, gameObj.p2y);
		gameObj.board[pos].possession = 2;
	}
} */

function findBase (gameID, playerID) {
	// this is only capable of finding one base.. does that matter for 4player games?
	for (var i = 0; i < gameObj.board.length; i++) {
		if (gameObj.board[i].type == 'base') {
			if (gameObj.board[i].possession[0] == playerID) {
				var x = gameObj.board[i].x + 1;
				var y = gameObj.board[i].y + 1;
				return [x,y];
			}
		}
	}
}


export {
	socket_newColor,
	socket_handleNameChosen
}