const {
	adminUsernames
} = require('../settings.js')

const {
	dimMsg,
	redMsg,
	htmlEntities,
} = require('../util.js')

const {
	userData,
} = require('./vars.js')

const {
	sub_updateLobby,
} = require('./subs.js')

const {
	checkForPlayerExit
} = require('./gameplay/gameplay.js')

let io
function fns_setIo(ioValue) {
	io = ioValue
}

function socket_error(err) {
	const socket = this
	console.error(err.stack)
	socket.emit('log', redMsg('socket error'))
}

function socket_disconnect() {
	const socket = this
	
	console.log(userData[socket.id].username, 'disconnected', socket.id)
	
	// Handle room disconnect
	if (userData[socket.id].room !== false) {
		io.emit('log', 
			dimMsg(userData[socket.id].username + ' disconnected.') + 
			redMsg(Object.keys(userData).length - 1, 'float:right')
		)
		
		const gameID = userData[socket.id].room;
		checkForPlayerExit(gameID, socket);
		
		sub_updateLobby();
	}
	
	delete userData[socket.id];
}

function socket_sendChatMessage(chatMessage) {
	const socket = this
	
	const room = userData[socket.id].room;
	const username = userData[socket.id].username;
	const color = userData[socket.id].color;
	const isAdmin = adminUsernames.includes(username)
	
	chatMessage = htmlEntities(chatMessage);
	var splitMessage = chatMessage.split(" ");
	if (chatMessage === '/newcolor' && room === 'lobby' && isAdmin) {
		updateUserColor(socket);
	} else if (splitMessage[0] === '/debug' && isAdmin) {
		socket.emit('console log', 'USER DATA:');
		for (user in userData) {
			socket.emit('console log', user);
			socket.emit('console log', userData[user]);
		}
		socket.emit('console log', 'GAME PLAYER DATA:');
		for (game in gameData) {
			socket.emit('console log', gameData[game].players);
		}
		socket.emit('log', '<span class="dimMsg">Data acquired.</span>');
	} else if (splitMessage[0] === '/auth' && isAdmin) {
		/* this is old DB code...
		var newAccess = new AccessList({
			username: splitMessage[1]
		});
		newAccess.save(function (err, newAccess) {
			if (err) return console.error(err);
			twitterAuthList2.push(splitMessage[1]);
			socket.emit('log', '<b>Access Granted to @' + splitMessage[1] + '</b>');
		});
		*/
	} else if (splitMessage[0] === '/revoke' && isAdmin) {
		socket.emit('log', '<span class="redMsg">revoke not created yet</span>');
	} else {
		io.to(room).emit('log', '<span style="color: ' + color + '; font-weight:bold;">' + username + '</span><span class="dimMsg">:</span> ' + chatMessage);
		console.log (username + ": " + chatMessage);
	}
}

function socket_attemptColorReroll() {
	if (userData[socket.id].remainingRerolls > 0) {
		userData[socket.id].remainingRerolls--;
		updateUserColor(socket);
		if (userData[socket.id].remainingRerolls <= 0) {
			socket.emit('ran out of rerolls');
		}
	} else {
		socket.emit('log', redMsg('you have no color rerolls remaining.'));
	}
}


function updateUserColor(socket) {
	const newRandomColor = assignColor()
	userData[socket.id].color = newRandomColor;
	var room = userData[socket.id].room;
	io.to(room).emit('log', '<span style="color: ' + userData[socket.id].color + ';"><b>' + userData[socket.id].username + '</b> has a new color.</span>');
	socket.emit('update lobby welcome name color', userData[socket.id].color);
	
	if (saveData) {
		console.log('@TODO, set the color.')
		const user = userData[socket.id]
		db_updateColor(user.id, newRandomColor)
		sub_updateLobby() // render lobby cause leaderboard name color.. wow maybe I need a better way of coding this.
	}

	socket.emit('update lobby name color', userData[socket.id].color);
}









module.exports = {
	fns_setIo,
	socket_error,
	socket_disconnect,
	socket_sendChatMessage,
	socket_attemptColorReroll,
}