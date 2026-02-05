// Cosmic Blocks
// by Narcissa Wright
// code cleanup by nathnolt

//   ****  ****   **      ***   ** **  //
//  **     ** **  **     ** **   ***   //
//  **     ****   **     ** **    *    //
//  **     ** **  **     ** **   ***   //
//   ****  ****   *****   ***   ** **  //


import { resizeFunction } from './subs.js'

import { globals } from './globals.js'

import { emptyColor } from './static.js'

import {
	ColorLuminance,
	mix,
	hex2rgba
} from './color.js'

import {
	socket_connect_error,
	socket_connect,
	socket_disconnect,
	socket_update_user_count,
	socket_make_chat_available,
	socket_update_lobby,
	socket_render_lobby,
	socket_setup_game,
	socket_play_detonate_sfx,
	socket_game_preset,
	socket_rebuild_board,
	socket_blocklist_updated,
	socket_exit_game,
	socket_ran_out_of_rerolls,
	socket_update_lobby_name_color,
	socket_remove_player_heading,
	socket_time_limit_update,
	socket_collision_update,
	socket_build_menu,
	socket_add_to_heading,
	socket_remove_from_heading,
	socket_update_lobby_welcome_name_color,
	socket_all_players_ready,
	socket_new_move,
	socket_victory,
	socket_log,
	socket_store_id,
	socket_play_connect_audio_sfx,
	socket_remove_rematch_button,
	socket_render_board,
	socket_collision,
	socket_update_timer,
	socket_time_out,
	socket_rematch_offered,
	socket_setup_rematch,
	socket_draw_offered,
	socket_console_log
} from './socket-handlers.js'



// new color rendering setup
// preference is either 'server' or 'client'
// server has the database name color of player1 and player2
// client has your personal preference for player1 / player2, 
var colors = {
	preference: 'server',
	server: ['', ''],
	client: ['', '']
}

updateStyle('nocolor', "#d5ccbd")


$( window ).resize(resizeFunction)
resizeFunction()

$("#chatToggle").on('click', function() {
	if ($("#chatPanel").is(":visible")) {
		$("#chatPanel").hide();
		$("#chatToggle").html('&raquo;');
		
		resizeFunction();
	} else {
		$("#chatPanel").show();
		$("#chatToggle").html('&laquo;');
		
		resizeFunction();
	}
})

onlinePlay()

function onlinePlay() {
	const socket = io();
	globals.socket = socket
	
	console.log('socket', socket)
	
	// handle socket on methods.
	socket.on("connect_error", socket_connect_error)
	socket.on('connect', socket_connect)
	socket.on('disconnect', socket_disconnect)
	socket.on('update user count', socket_update_user_count)
	socket.on('make chat available', socket_make_chat_available)
	socket.on('update lobby', socket_update_lobby)
	socket.on('render lobby', socket_render_lobby)
	socket.on('ran out of rerolls', socket_ran_out_of_rerolls)
	socket.on('update lobby name color', socket_update_lobby_name_color)
	socket.on('remove player heading', socket_remove_player_heading)
	socket.on('setup game', socket_setup_game)
	socket.on('detonate', socket_play_detonate_sfx)
	socket.on('time limit update', socket_time_limit_update)
	socket.on('collision update', socket_collision_update)
	socket.on('game preset', socket_game_preset)
	socket.on('blocklist updated', socket_blocklist_updated)
	socket.on('rebuild board', socket_rebuild_board)
	socket.on('kill game', socket_exit_game)
	socket.on('build menu', socket_build_menu)
	socket.on('add to heading', socket_add_to_heading)
	socket.on('remove from heading', socket_remove_from_heading)
	socket.on('update lobby welcome name color', socket_update_lobby_welcome_name_color);
	socket.on('all players ready', socket_all_players_ready)
	socket.on('new move', socket_new_move)
	socket.on('victory', socket_victory)
	socket.on('log', socket_log)
	socket.on('store id', socket_store_id)
	socket.on('connect audio', socket_play_connect_audio_sfx)
	socket.on('remove rematch button', socket_remove_rematch_button)
	socket.on('render board', socket_render_board)
	socket.on('collision', socket_collision)
	socket.on('update timer', socket_update_timer)
	socket.on('time out', socket_time_out)
	socket.on('rematch offered', socket_rematch_offered)
	socket.on('setup rematch', socket_setup_rematch)
	socket.on('draw offered', socket_draw_offered)
	socket.on('console log', socket_console_log);
}






// @TODO: see what happens if we remove this function, as this is only used from within client.js really
function updateStyle(styleID, color) {
	// empty what was already there
	$("#" + styleID).empty();
	
	// BLOCK
	var rule = '.' + styleID + ' { background-color: ' + color + '; } ';
	rule += '.' + styleID + ' svg .border { fill: '+ ColorLuminance(color, -0.65) +' }';
	rule += '.' + styleID + '.empty svg .border { opacity: 0; }';
	rule += '.' + styleID + ' svg .border2 { stroke: '+ ColorLuminance(color, 0.125) +' }';
	
	if (color !== emptyColor) {
		// SVG OUTLINE
		rule += '.' + styleID + ' svg .outline { fill: '+ ColorLuminance(color, 0.125) +'; }';

		// SVG BASE JEWEL
		rule += '.' + styleID + ' svg .jewel { fill: '+ color +'; animation: jewel-' + color.substr(1) +' 1s infinite alternate ease-in-out; }';
		rule += '@keyframes jewel-'+ color.substr(1) +' { 0% { opacity: 0.2; } 100% { opacity: 1; } }';

	}
	
	// EMPTY
	var mixed = mix(color, emptyColor, 55); // old was 35
	var mixed2 = ColorLuminance(color, -0.09);
	rule += '.' + styleID + '.empty { background-color: ' + mixed + '; box-shadow: inset 0 0 0 1px '+ mixed2 +';  }';

	// HOVER
	rule += '.' + styleID + ':hover:not(.nohover):not(.disabled), .' + styleID + '.highlighted { background-color: ' + ColorLuminance(mixed, 0.125) +'; cursor:pointer; }';
	
	// PRIOR
	rule += '.prior-' + color.substr(1) + '::before { animation: origin-' + color.substr(1) + ' 0.25s infinite alternate; content:""; display: block; height: 100%; width: 100%; position: absolute; left: 0; top: 0; background-color: '+ hex2rgba(mix(color, '#ffffff', 50), 50) +'; box-shadow: inset 0 0 0 1px '+ ColorLuminance(color,-0.3) +', inset 0 0 0 3px '+ color +'; }';
	globals.priorColorList.push('prior-' + color.substr(1)); // global var holds all prior classes.
	
	// ANIMATION
	rule += '@keyframes origin-' + color.substr(1) +' { 0% { opacity: 0.2; } 40% { opacity: 0.25; } 60% { opacity: 0.95; } 100% { opacity: 1 } }';
	
	// append
	$("#" + styleID).append(rule);
}