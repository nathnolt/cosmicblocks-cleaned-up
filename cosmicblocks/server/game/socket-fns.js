const {
	adminUsernames,
	saveData
} = require('../settings.js')

const {
	b,
	dimMsg,
	redMsg,
	htmlEntities,
} = require('../util/html.js')

const {
	getRandomUserColor
} = require('../util/color.js')

const {
	db_updateColor
} = require('../db/db.js')

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
	
	chatMessage = htmlEntities(chatMessage)
	
	
	const messageParts = chatMessage.split(" ")
	const firstPart = messageParts[0]
	
	
	if(isAdmin) {
		if(firstPart == '/debug') {
			
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
			return
		}
		
		if(firstPart == '/auth') {
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
			return
		}
		
		if(firstPart == '/revoke') {
			socket.emit('log', redMsg('revoke not created yet'))
			return
		}
	}
	
	// routes everyone can do
	if(firstPart == '/newcolor' && room == 'lobby') {
		attemptColorReroll(socket)
		return
	}
	
	// regular message
	io.to(room).emit('log', `<span style="color:${color}; font-weight:bold;">${username}</span>${dimMsg(':')} ${chatMessage}`)
	console.log (username + ": " + chatMessage);
}

function socket_attemptColorReroll() {
	const socket = this
	attemptColorReroll(socket)
}


function attemptColorReroll(socket) {
	const user = userData[socket.id]
	
	if(user.remainingRerolls < 1) {
		socket.emit('log', redMsg('you have no color rerolls remaining.'))
		return
	}
	
	user.remainingRerolls--
	user.color = getRandomUserColor()
	io.to(user.room).emit(
		'log', 
		`<span style="color:${user.color}">${b(user.username)} has a new color.</span>`
	)
	socket.emit('update lobby welcome name color', user.color)
	
	if(saveData) {
		console.log('@TODO, set the color.')
		db_updateColor(user.id, user.color)
		
		// render lobby cause leaderboard name color.. wow maybe I need a better way of coding this.
		sub_updateLobby()
	}
	
	socket.emit('update lobby name color', user.color)
	
	if(user.remainingRerolls < 1) {
		socket.emit('ran out of rerolls')
	}
}

module.exports = {
	fns_setIo,
	socket_error,
	socket_disconnect,
	socket_sendChatMessage,
	socket_attemptColorReroll,
}