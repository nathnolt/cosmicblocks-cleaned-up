// Cosmic Blocks
// by Narcissa Wright
// code cleanup by nathnolt

//   ****  ****   **      ***   ** **  //
//  **     ** **  **     ** **   ***   //
//  **     ****   **     ** **    *    //
//  **     ** **  **     ** **   ***   //
//   ****  ****   *****   ***   ** **  //
import { globals } from './globals.js'

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

import './handle-event-listeners.js'





// Handle socket
{
	const socket = io();
	globals.socket = socket
	
	console.log('socket', socket)
	
	socket.onAny(function(event, ...data) {
		console.log('socket-event', event, data)
	})
	
	
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
	socket.on('rematch-offered', socket_rematch_offered)
	socket.on('setup rematch', socket_setup_rematch)
	socket.on('draw offered', socket_draw_offered)
	socket.on('console log', socket_console_log)
	
}
