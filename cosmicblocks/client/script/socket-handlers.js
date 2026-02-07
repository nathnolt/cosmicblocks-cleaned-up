import {
	globals
} from './globals.js'

import {
	dimMsg
} from './html.js'

import {
	log,
	renderLeaderboard,
	renderGames,
	resizeFunction,
	buildBlockMenu,
	buildEmptyBoard,
	renderBoard,
	renderExitButton,
	addHeading,
	updateTimer,
	joinGame,
	cleanup,
	exitGame,
} from './subs.js'

import { playAudio } from './audio.js'

export function socket_connect_error(err) {
	console.log('connection error', err)
}

export function socket_connect() {
//s
	console.log('socket connected')
	//log('<span class="greenMsg" style="font-weight:bold">Connected</span>');
	//$("#disconnected").remove();
	//
}

export function socket_disconnect() {
	log('<b class="redMsg">Disconnected</b>')
	globals.gameplay.show.winstate = false;
	
	$('#logContainer #log').empty()
	
	playAudio('disconnect')
	//changeFavIcon('img/favico.png');
	//location.reload();
}

export function socket_update_user_count(totalusers){
	if (totalusers == 1) {
		log('<span class="greenMsg">1 user online.</span>');
	} else {
		log('<span class="greenMsg">' + totalusers + ' users online.</span>');
	}
	
}

export function socket_make_chat_available(username) {
	console.log('make chat available...')
}

export function socket_update_lobby(lobbyData, leaderData) {
	renderLeaderboard(leaderData)
	renderGames(lobbyData)
}



export function socket_render_lobby(lobbyData, leaderData, lobbyUserData) {
	$('#container')
			.addClass('in-lobby')
			.removeClass('in-gameplay')
	
	globals.isPlayer = false
	
	$('#lobby .yourname').css('color', lobbyUserData.color).text(lobbyUserData.username)
	
	renderLeaderboard(leaderData);
	
	renderGames(lobbyData);
	
	if(!globals.isGhost) {
		$('#stat-games-played').text(lobbyUserData.gamesPlayed)
		$('#stat-games-won').text(lobbyUserData.wins)
		$('#stat-games-drawn').text(lobbyUserData.draws)
		$('#stat-games-lost').text(lobbyUserData.losses)
		$('#stat-display-elo').text(lobbyUserData.displayElo)
	}
	
}


export function socket_setup_game(
	gameID, 
	joinStatus, 
	title, 
	rows, 
	cols, 
	board, 
	players, 
	gameState, 
	blockList, 
	timeLimit, 
	collisionMode, 
	moveCount, 
	timerValue, 
	gameType
) {
	$('#container')
		.addClass('in-gameplay')
		.removeClass('in-lobby')
	
	// this runs when:
	// - a game is started
	// - a game is joined in progress.
	
	// @TODO: continue with this function
	buildBlockMenu(blockList);
	// $(".winState").remove(); // ??
	
	buildEmptyBoard(rows, cols);
	
	renderBoard(board);
	
	$(".block").addClass('nohover');
	
	renderExitButton()
	
	
	// set game ready button
	$("#ready")
		.html('Ready Up')
		.addClass('notready')
	
	// empty some elements
	$('#playerRight').empty()
	$("#timeRemaining").empty()
	
	
	//renderRoomTitle(title);
	for (var playerID in players) {
		addHeading(playerID, players[playerID].username, players[playerID].color, players[playerID].displayElo);
	}
	
	
	// IF THE GAME IS OPEN, AND HAS NOT STARTED YET:
	if (gameState == 'open') {
		if (gameType === 'practice') {
			globals.socket.emit('ready');
		} else if (joinStatus !== 'spectator') {
			
		}
		// see gameState == 'open' && unused_functionality in unused.js
		
	} else if (gameState == 'inprogress') {
		globals.gameplay.moveCount = moveCount;
		$("#timeRemaining").append('<div id="timer">Turn <b>' + moveCount + '</b>, Time <b>' + timerValue + '</b></div>');
		updateTimer(timerValue, moveCount);
	}
	
	$(".menu_block").addClass('nohover disabled');
	//menuHideBlocksAndResize();
	
}


// play the audio for placing a block onto the board.
export function socket_play_detonate_sfx() {
	playAudio('detonate')
}



export function socket_game_preset(board, timeLimit, rows, cols, blockList, creator, collisionMode) {
	timeLimitUpdate(timeLimit);
	collisionUpdate(collisionMode);
	buildEmptyBoard(rows, cols);
	renderBoard(board);
	buildBlockMenu(blockList);
	$(".block").addClass('nohover');
	if (globals.socket.id == creator) {
		menuBlockEnableDisable();
	} else {
		$("#menu").css('opacity', '0.5'); // dim the menu
	}
}


// I don't think this is used yet
// but it's a cool idea
export function socket_rebuild_board(rows, cols) {
	rebuildBoard(rows, cols);
}

export function socket_blocklist_updated(blockType, active, ammo) {
	if (active) {
		$("#" + blockType).removeClass('disabled');
	} else {
		$("#" + blockType).addClass('disabled');
	}
}

export function socket_exit_game() {
	exitGame();
}

export function socket_ran_out_of_rerolls(color) {
	// not important
	// $("#rerollColor").remove();
}

export function socket_update_lobby_name_color(color) {
	$(".lobbyName").css('color', color);
}

export function socket_remove_player_heading() {
	$("#playerRight").empty();
}

export function socket_time_limit_update(timeLimit) {
	timeLimitUpdate(timeLimit);
}

export function socket_collision_update(collisionMode) {
	collisionUpdate(collisionMode);
}

export function socket_build_menu(blockList) {
	buildBlockMenu(blockList);
}

export function socket_add_to_heading(id, username, color, elo) {
	addHeading(id, username, color, elo)
}

export function socket_remove_from_heading(user) {
	$(".heading-" + user).remove();
	$("#ready").html('[ ] Ready').addClass('notready');
}

export function socket_update_lobby_welcome_name_color(color) {
	$("#lobby > h1 > span").css('color', color);
}

export function socket_all_players_ready(gameID, timeLimit, players, rows, cols, board, gameType) {
	if (gameType !== 'practice') {
		console.log('do some button hiding @TODO: fix this logic')
		// $("#gameButtons > *:not('#toggleAudio')").remove();
		
	} else {
		// practice mode reset cleanup:
		for (var i = 0; i < globals.priorColorList.length; i++) {
			$(".block").removeClass(globals.priorColorList[i]); // this is longer than it needs to be for each game, oh well maybe fix later.
		}
		$(".highlighted").removeClass('highlighted');
		//$("#menu").css('opacity', '0.5'); // dim the menu
		$(".menu_block").addClass('disabled');
	}
	if (timeLimit == false) {
		timeLimit = '&infin;';
	}
	if ($("#timer").length === 0) {
		$("#timeRemaining").append('<div id="timer">Turn <b>1</b>, Time <b>' + timeLimit + '</b></div>');
	}
	globals.gameplay.moveCount = 1;
	$("#menu").css('opacity', '1'); // dim the menu
	playAudio('newgame')
	joinGame(gameID, globals.gameplay.moveCount, timeLimit, players, rows, cols, board, gameType);
}

export function socket_new_move(board, noMove, blockList) {
	globals.gameplay.moveCount++;
	$(".waitMsg").parent().remove();
	$(".block").removeClass("nohover").removeClass('disabled');
	if (typeof blockList !== 'undefined') {
		buildBlockMenu(blockList);
	}
	$(".menu_block").addClass('disabled');
	globals.menuState = false; // disable the menu, because a move was made.
	/*
	//$(".block").removeClass(function (index, css) {
	//	return (css.match (/\bprior-\S+/g) || []).join(' ');
	//
	*/
	$(".highlighted").removeClass("highlighted"); // remove the highlighted moves
	if (noMove == false) {
		// play the audio for placing a block onto the board.
		playAudio('move')
	}
	renderBoard(board);
	globals.gameplay.standby = false;
	//checkForVictory(players);
}

export function socket_victory(winners, winPaths, color, gameType) {
	
	function showPath(winPath, color) {
		
		var winAnimation1, winAnimation2;
		
		$.each(winPath, function( index, value ) {
			$( '.block:eq(' + value + ')' ).removeClass('disabled').addClass('nohover');
			winAnimation1 = setTimeout(function(){
				if (globals.gameplay.show.winstate == true) {
					$( '.block:eq(' + value + ')' ).addClass('prior-' + color.substr(1));
				} else {
					$('.block').removeClass('prior' + color.substr(1));
					clearTimeout(winAnimation1);
					clearTimeout(winAnimation2);
				}
			}, 500 * index);
			winAnimation2 = setTimeout(function(){
				$( '.block:eq(' + value + ')' ).removeClass('prior-' + color.substr(1));
				if (index == winPath.length - 1) {
					if (globals.gameplay.show.winstate == true) {
						showPath(winPath, color);
					} else {
						clearTimeout(winAnimation1);
						clearTimeout(winAnimation2);
					}
				}
			}, 500 * (index + 1));
		});
	}
	
	
	if (globals.gameplay.show.winstate == false) {
		cleanup(winners, gameType);
		globals.gameplay.show.winstate = true;
		for (var i = 0; i < winners.length; i++) {
			showPath(winPaths[i], color);
		}
	}
}

// special messages don't have padding built in so I can alter BGcolor without it looking bad lol
export function socket_log(msg, special) {
	log(msg, special)
}

export function socket_store_id(id, displayName, ghost) {
	// globals.socket.id = id
	globals.name = displayName
	globals.isGhost = ghost
	if(globals.isGhost) {
		$('#container').addClass('is-ghost')
	}
}

export function socket_play_connect_audio_sfx() {
	playAudio('connect')
}

export function socket_remove_rematch_button(){
	//log('<span class="dimMsg">remove rematch button</span>');
	$("#rematch").remove();
	if (globals.isGhost) {
		setTimeout(function(){ 
			exitGame();
		}, 3000);
	}
}

export function socket_render_board(data) {
	renderBoard(data);
}

export function socket_collision() {
	//log('<span style="dimMsg">collision</span>');
	playAudio('collision')
}

export function socket_update_timer(timerValue, turnCount) {
	updateTimer(timerValue, turnCount);
}

export function socket_time_out(playerWhoMoved) {
	log('<span class="dimMsg">time out</span>');
	// we're passing in the player who moved
	// ideally this would only send to the player who disconnected but this was an easy hacky way
	// of getting it to work quickly. by sending to all players. and checking ID.
	//log (playerWhoMoved);
	if (globals.socket.id != playerWhoMoved) {
		// opponent function gets opposite player.
		playAudio('timeout')
	}
}

export function socket_rematch_offered(data) {
	
	const wasMyRematchRequest = data.id == globals.socket.id
	if(wasMyRematchRequest) {
		$("#rematch > span").text("Offered Rematch").addClass("blinkText")
	} else {
		$("#rematch > span").text("Accept Rematch").addClass("blinkText");
		log(dimMsg(data.username + ' offered a rematch.'))
	}
}

export function socket_setup_rematch(blockList, creatorElo, playerElo) {
	globals.debounce = Math.random();
	$(".block").removeClass('nohover disabled ice');
	buildBlockMenu(blockList);
	globals.gameplay.show.winstate = false;
	if ((typeof creatorElo !== 'undefined') && (creatorElo > 0)) {
		$("#playerLeft > div > span").html('(' + creatorElo + ')');
	}
	if ((typeof playerElo !== 'undefined') && (playerElo > 0)) {
		$("#playerRight > div > span").html('(' + playerElo + ')');
	}
}

export function socket_draw_offered(gameID) {
	log('Draw Offered');
	drawOffered(gameID);
}

export function socket_console_log(data) {
	console.log(data);
}
