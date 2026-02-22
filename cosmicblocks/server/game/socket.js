import { Server as SocketIOServer } from 'socket.io'

import {
	sub_renderLobby,
	sub_setIo,
} from './subs.js'

import {
	ghostColor,
} from './constants.js'

import {
	getSessionValue
} from '../cookie/session.js'

import {
	// session
	db_getUseridFromSession,
	db_getUserById,
} from '../db/db.js'

import settings from '../settings.js'

const saveData = settings.saveData

import {
	userData,
} from './vars.js'

import {
	fns_setIo,
	socket_error,
	socket_disconnect,
	socket_attemptColorReroll,
	socket_sendChatMessage,
} from './socket-fns.js'

import {
	socket_practiceMode,
	socket_newGame,
	socket_joinGame,
	socket_handleGameReady,
	socket_handleGameUnready,
	socket_attemptMove,
	socket_exitGameToLobby,
	socket_practiceGameReset,
	socket_offer_rematch,
	socket_forfeit,
	socketGame_setIo,
} from './socket-fns-game.js'

import {
	gameplay_setio
} from './gameplay/gameplay.js'

import {
	dimMsg,
	redMsg,
} from '../util/html.js'


// @TODO: Split this file out further

//   ****  ****   **      ***   ** **  //
//  **     ** **  **     ** **   ***   //
//  **     ****   **     ** **    *    //
//  **     ** **  **     ** **   ***   //
//   ****  ****   *****   ***   ** **  //
let io

export function startIO(server) {
	// socket.io is used for having a realtime application.
	// all of the game-related stuff is passed between client and server via socket.io.
	
	io = new SocketIOServer(server)
	fns_setIo(io)
	socketGame_setIo(io)
	sub_setIo(io)
	gameplay_setio(io)
	
	// New Connection!
	io.on('connection', handleConnection)
}

// handle connection
function handleConnection(socket) {
	console.log('new connection')
	
	const wasSuccess = setUserDataAndGreet(socket, userData)
	if(!wasSuccess) {
		return
	}
	
	socket.on('error', socket_error)
	socket.on('disconnect', socket_disconnect)
	
	// other functionality
	socket.on('send chat message', socket_sendChatMessage)
	socket.on('attempt color reroll', socket_attemptColorReroll)
	
	// game
	socket.on('practice mode', socket_practiceMode)
	socket.on('new game', socket_newGame)
	socket.on('join game', socket_joinGame)
	socket.on('ready', socket_handleGameReady)
	socket.on('not ready', socket_handleGameUnready)
	socket.on('attempt move', socket_attemptMove)
	socket.on('exit to lobby', socket_exitGameToLobby)
	socket.on('practice reset', socket_practiceGameReset)
	socket.on('offer-rematch', socket_offer_rematch);
	socket.on('forfeit', socket_forfeit);
	
	commented_out_socket_ons(socket)
}



function setUserDataAndGreet(socket, userData) {
	// 1. Get userdata from the session.
	const sessionValue = getSessionValue(socket.request)
	if(sessionValue == undefined) {
		return false
	}
	
	const userId = db_getUseridFromSession(sessionValue)
	if(userId == undefined) {
		return false
	}
	
	const user = db_getUserById(userId)
	
	let isGhost = false
	// 2. Handle ghost code:
	// loop through all users in userData in order to find if a user already exists with the same id.
	// if it does exist, then the user is already logged in somewhere else, which means that this new user is a ghost.
	for(const socketId in userData) {
		const userDataItem = userData[socketId]
		if(userDataItem.ghost) {
			continue
		}
		
		if(userDataItem.id == user.id) {
			isGhost = true
		}
	}
	
	// 3. create the userObject
	let userObject
	if(!isGhost) {
		userObject = {
			id: user.id,
			username: user.username,
			room: false,
			color: user.color,
			gamesPlayed: user.games_played,
			timePlayed: user.time_played,
			wins: user.wins,
			draws: user.draws,
			losses: user.losses,
			
			// I'm not sure about why I would limit this?
			remainingRerolls: 99999,
			elo: user.elo,
			ghost: false
		}
	} else {
		userObject = {
			id: user.id,
			username: user.username + '(g)',
			room: false,
			color: ghostColor,
			ghost: true
		}
	}
	
	const username = userObject.username
	const color = userObject.color
	
	// 4. put the object on userData
	userData[socket.id] = userObject
	
	// 5. welcome the user
	socket.emit('store id', socket.id, username, isGhost)
	
	const connectedHTML = `<span style="color: ${color}"><b>${username}</b> connected.</span>` +
	`<span style="float:right;" class="greenMsg">${Object.keys(userData).length} </span>`
	io.emit('log', connectedHTML)
	
	if (saveData) {
		socket.emit('log', '<b>Welcome to Cosmic Blocks!</b>');
		
		// Discord out of date.
		// socket.emit('log', 'Consider joining <a href="https://discord.gg/szpznUj" target="_blank">Narcissa\'s Castle</a>, where game discussion happens.');
		
	} else {
		socket.emit('log', `<b>Development mode</b>: game results and rating changes will ${redMsg('not')} be saved.`);
	}
	
	io.to('lobby').emit('log', dimMsg(`${username} joined lobby.`) )
	socket.emit('log', '<div class="roomChange">joining lobby</div>', true)
	
	// joins the socket io room "lobby"
	socket.join('lobby')
	userData[socket.id].room = 'lobby'
	sub_renderLobby(socket)
	
	return true
}


function commented_out_socket_ons(socket) {
	/* Commented out functions
	socket.on('name chosen', socket_handleNameChosen);
	
	socket.on('classic mode', socket_classicMode);
	socket.on('advanced mode', socket_advancedMode);
	socket.on('done editing', socket_doneEditingGame);
	socket.on('randomize', socket_randomizeGame);
	
	socket.on('new color', socket_newColor);
	socket.on('choose to spectate', socket_chooseToSpectate);
	
	socket.on('time limit setting', socket_timeLimitSetting);
	socket.on('collision setting', socket_collisionSetting);
	socket.on('board edit', socket_boardEdit);
	socket.on('blocklist update', socket_blocklistUpdate);
	socket.on('ammo update', socket_ammoUpdate);
	socket.on('update board size', socket_updateBoardSize);
	
	socket.on('offer draw', socket_offerDraw);
	socket.on('draw accepted', socket_drawAccepted);
	socket.on('title update', socket_titleUpdate);
	*/
}

