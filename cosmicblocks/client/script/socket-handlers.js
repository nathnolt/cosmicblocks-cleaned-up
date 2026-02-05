import {
	globals
} from './globals.js'

import {
	log,
	toggleAudioButton,
	renderLeaderboard,
	renderGames,
	resizeFunction,
	buildBlockMenu,
	buildBoard,
	renderBoard,
	blockHoverData,
	renderExitButton,
	addHeading,
	updateTimer,
	joinGame,
	cleanup,
	exitGame,
} from './subs.js'

import {
	audioButtonSVG
} from './static.js'
import { playAudio } from './audio.js'

export function socket_connect_error(err) {
	console.log('connection error', err)
}

export function socket_connect() {
	console.log('socket connected')
	//log('<span class="greenMsg" style="font-weight:bold">Connected</span>');
	//$("#disconnected").remove();
}

export function socket_disconnect() {
	log('<b class="redMsg">Disconnected</b>');
	$("#username").remove();
	$(".dynamicStyle").remove();
	globals.gameplay.show.winstate = false;
	$("#sidebar").empty();
	$("#container").empty();
	
	playAudio('disconnect')
	
	//changeFavIcon('img/favico.png');
	//location.reload();
	
	globals.socket = false;
}

export function socket_update_user_count(totalusers){
	if (totalusers == 1) {
		log('<span class="greenMsg">1 user online.</span>');
	} else {
		log('<span class="greenMsg">' + totalusers + ' users online.</span>');
	}
	
}

export function socket_make_chat_available(username) {
	$("#chat").remove();
	$("#chatPanel").append('<div id="chat"><input id="chatInput" type="text" maxlength="140" value="" autocomplete="off" /></div>');
	$("#chatInput").on('keydown', function (e) {
		if (e.keyCode == 13) {
			let chatMessage = $("#chatInput").val();
			$("#chatInput").val('');
			if (!$.trim(chatMessage)) {
				// no msg
			} else {
				globals.socket.emit('send chat message', chatMessage);
			}
		}
	});
}

export function socket_update_lobby(lobbyData, leaderData) {
	$("#open").empty();
	$("#inprogress").empty();
	
	$("#eloRank").empty();
	
	renderLeaderboard(leaderData);
	renderGames(lobbyData);
}



export function socket_render_lobby(lobbyData, leaderData, lobbyUserData) {
	globals.isPlayer = false
	
	$("#lobby").remove();
	$("#leaderboard").remove();
	$("#headBoardContainer").remove();

	var appendString = '<div id="lobby"><h1><span style="color:' + lobbyUserData.color + '">' + lobbyUserData.username + '</span>, ';
	appendString += "welcome to Cosmic Blocks!";
	appendString += '</h1><div style="padding:20px;"><div id="optionButtons">';
	if (!globals.isGhost) {
		appendString += '<div id="newgame" class="buttonStyle">Create Game</div><div id="randgame" class="buttonStyle">Random Game</div><div id="practice" class="buttonStyle">Practice Mode</div>';
	}
	appendString += '<a id="howToPlay" class="buttonStyle" href="https://docs.google.com/document/d/1c_rIYxdl2udNHXPFnHj5ELoYPjtej4hDjy7nCHnceG0/edit" target="_blank">How to Play</a><a class="buttonStyle" href="https://docs.google.com/document/d/1cIwGEWhQYZUPRn1sBzatFuVSNau3VPHxOu9ffszejU4/edit" target="_blank">Documentation</a><div id="toggleAudio" class="buttonStyle">' + audioButtonSVG +'</div></div>';
	if (!globals.isGhost) {
		appendString += '<div id="playerStats"></div>';
	}
	appendString += '<div id="gameTypes"><div id="open"></div><div id="inprogress"></div></div></div></div>	<div id="leaderboard"><h1>World Ranking</h1><div id="rankingContainer"><table id="eloRank"></table></div></div>'
	$("#container").append(appendString);
			
	$('#newgame').on("click",function() {
		globals.socket.emit('new game'); // send the server new game command
	});
	$('#randgame').on("click",function() {
		globals.socket.emit('new game', 'random'); // send the server new game [random board] command
	});
	$('#practice').on("click",function() {
		globals.socket.emit('practice mode');
	});	
	
	
	toggleAudioButton();
	
	// RENDER LEADERBOARD!
	renderLeaderboard(leaderData);
	
	// RENDER GAMES!
	renderGames(lobbyData);
	
	// RENDER PLAYER STATS (not a separate function because it is only called within renderLobby();
	if (!globals.isGhost) {
		if (lobbyUserData.gamesPlayed !== 0) {
			var appendString = '<ul id="lobbyUserData">';
			appendString += '<li>Games Played<span class="stat">' + lobbyUserData.gamesPlayed + '</span></li>';
			
			if (lobbyUserData.wins !== 0) {
				appendString += '<li>Games Won<span class="stat">' + lobbyUserData.wins + '</span></li>';
			}
			
			if (lobbyUserData.draws !== 0) {
				appendString += '<li>Games Drawn<span class="stat">' + lobbyUserData.draws + '</span></li>';
			}
			
			if (lobbyUserData.losses !== 0) {
				appendString += '<li>Games Lost<span class="stat">' + lobbyUserData.losses + '</span></li>';
			}
			
			if (lobbyUserData.displayElo > 0) {
				appendString += '<li>Points<span class="stat">' + lobbyUserData.displayElo + '</span></li>';
			}
			appendString += '</ul>';
			$("#playerStats").append(appendString);
		}
		if (lobbyUserData.remainingRerolls !== 0) {
			$("#optionButtons").append('<div class="buttonStyle" id="rerollColor">New Color</div>');
			$("#rerollColor").on('click', function() {
				globals.socket.emit('attempt color reroll');
			});
		}
	}
	resizeFunction(); // visually shows the resize, would be ideal to not have it be visible
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
	// this runs when:
	// - a game is started
	// - a game is joined in progress.
	
	setupGame(); // why is this a function? 
	function setupGame() {
		$("#lobby").remove();
		$("#leaderboard").remove();
		$("#container").append(`
			<div id="headBoardContainer">
				<div id="gameHead">
					<div id="playerLeft"></div>
					<div id="timeRemaining"></div>
					<div id="playerRight"></div>
				</div>
				<div id="board"></div>
				<div id="menuContainer">
					<div id="menuRightContainer">
						<div id="gameButtons"></div>
						<div id="bottomInfo"></div>
					</div>
				</div>
			</div>`);
		buildBlockMenu(blockList);
		$(".winState").remove(); // ??
		buildBoard(rows, cols);
		renderBoard(board);
		$(".block").addClass('nohover');
		blockHoverData();
		renderExitButton();
		//renderRoomTitle(title);
		for (var playerID in players) {
			addHeading(playerID, players[playerID].username, players[playerID].color, players[playerID].displayElo);
		}
		
		// IF THE GAME IS OPEN, AND HAS NOT STARTED YET:
		if (gameState == 'open') {
			if (gameType === 'practice') {
				globals.socket.emit('ready');
			} else if (joinStatus !== 'spectator') {
				// you are a player in the game
				$("#gameButtons").append('<div class="buttonStyle notready" id="ready">Ready Up</div>');
				$("#ready").on('click', function() {
					if ($(this).hasClass("unbound")) {
						log('<span class="redMsg">cannot ready as spectator</span>');
					} else {
						if ($(this).hasClass("notready")) {
							globals.socket.emit('ready');
							$(this).html('Unready').removeClass('notready');
						} else {
							globals.socket.emit('not ready');
							$(this).html('Ready Up').addClass('notready');
						}
					}
				});
			}
			
			/*
			// TIME LIMIT
			if (timeLimit == false) { timeLimit = '&infin;'}
			//$("#sidebar").append('<div id="timeLimitContainer">Time Limit: <span id="timeLimit">' + timeLimit + '</span></div>');
			
			// COLLISION MODE
			var collisionString = '<div id="collisionContainer">Collisions: <span id="collisionSetting">';
			if (collisionMode.permanence === true) {
				collisionString += 'Permanent';
			} else {
				collisionString += '<span class="collisionTurnCount">' + collisionMode.permanence.toString() + '</span> Turn';
			}
			collisionString += '</span></div>';
			//$("#gameButtons").append(collisionString);
			*/
			
			
			// CREATOR SETTINGS:
			
			// function creatorSettings() {...} // now in unused.js
			
		} else if (gameState == 'inprogress') {
			globals.gameplay.moveCount = moveCount;
			$("#timeRemaining").append('<div id="timer">Turn <b>' + moveCount + '</b>, Time <b>' + timerValue + '</b></div>');
			updateTimer(timerValue, moveCount);
		}
		$("#gameButtons").append('<div id="toggleAudio" class="buttonStyle">' + audioButtonSVG + '</div>');
		toggleAudioButton();
		$(".menu_block").addClass('nohover disabled');
		//menuHideBlocksAndResize();
	}
}


// play the audio for placing a block onto the board.
export function socket_play_detonate_sfx() {
	playAudio('detonate')
}



export function socket_game_preset(board, timeLimit, rows, cols, blockList, creator, collisionMode) {
	timeLimitUpdate(timeLimit);
	collisionUpdate(collisionMode);
	buildBoard(rows, cols);
	renderBoard(board);
	buildBlockMenu(blockList);
	$(".block").addClass('nohover');
	if (globals.socket.id == creator) {
		menuBlockEnableDisable();
	} else {
		$("#menu").css('opacity', '0.5'); // dim the menu
	}
}

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
	$("#rerollColor").remove();
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
	$(".block", "#board").off(); // for joinGame();
	$("#menuContainer").off(); // for joinGame() && blockHoverData();
	$("#board").off(); // for blockHoverData(); I could combine (".block, #board") and ("#board") together.
	blockHoverData();
	if (gameType !== 'practice') {
		$("#gameButtons > *:not('#toggleAudio')").remove();
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

export function socket_rematch_offered() {
	$("#rematch > span").text("Accept Rematch").addClass("blinkText");
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