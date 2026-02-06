import {
	emptyColor
} from './static.js'

import {
	globals
} from './globals.js'

import {
	playAudio
} from './audio.js'

import {
	ColorLuminance,
	mix,
	hex2rgba
} from './color.js'

export function rebuildBoard(rows, cols) {
	buildEmptyBoard(rows, cols);
	log('<span class="dimMsg">New dimensions: ' + cols + ' x ' + rows + '</span>');
	$(".block").addClass('nohover');
}







// joinGame sets things up for in-game play
// only called from 'all players ready', so joining in-progress will not call this function.
// 
// This adds handlers to things dynamically.
// 
export function joinGame(gameID, moveCount, timeLeft, players, rows, cols, board, gameType) {
	
	// declare functions only used inside of joinGame
	function getCircleType (initialType) {
		if (initialType == 'star') { return 'ostar'; }
		else if (initialType == 'plus') { return 'oplus'; }
		else if (initialType == 'cross') { return 'ocross'; }
		else if (initialType == 'hbar') { return 'ohbar'; }
		else if (initialType == 'vbar') { return 'ovbar'; }
		else if (initialType == 'tlbr') { return 'otlbr'; }
		else if (initialType == 'bltr') { return 'obltr'; }
		else if (initialType == 'arrow1') { return 'arrow11'; }
		else if (initialType == 'arrow2') { return 'arrow22'; }
		else if (initialType == 'arrow3') { return 'arrow33'; }
		else if (initialType == 'arrow4') { return 'arrow44'; }
		else if (initialType == 'arrow6') { return 'arrow66'; }
		else if (initialType == 'arrow7') { return 'arrow77'; }
		else if (initialType == 'arrow8') { return 'arrow88'; }
		else if (initialType == 'arrow9') { return 'arrow99'; }
		else { return false; }
	}
	
	function get_pos(x,y,cols) {
		return (y - 1) * cols + x - 1;
	}
	
	function obtainID (object) {
		//this gets the ID from the object. this is hard because x/y can be 1 or 2 characters long.
		var id = $(object).attr('id');
		var index = id.indexOf("y");  // breaks the ID into two sections at the "y" symbol
		var x = parseInt(id.substr(1, index), 10); // Gets the first part as an int
		var y = parseInt(id.substr(index + 1), 10);  // Gets the second part as an int
		return [x,y];
	}
	
	
	function highlight(x,y, someType, rows, cols) {
		
		
		// used for highlighting blocks
		function getMoves(blockType) { 
			var blockList = {
				'base': function () { return [[-1,-1], [0,-1], [1,-1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]; },
				'star': function () { return [[-1,-1], [0,-1], [1,-1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]; },
				'ostar': function () { return [[-2,-2], [0,-2], [2,-2], [-2, 0], [2, 0], [-2, 2], [0, 2], [2, 2]]; },
				'p1': function () { return [[-1,-1], [0,-1], [1,-1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]; },
				'p2': function () { return [[-1,-1], [0,-1], [1,-1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]; },
				'plus': function () { return [[0,-1], [-1, 0], [1, 0], [0, 1]]; },
				'oplus': function () { return [[0,-2], [-2, 0], [2, 0], [0, 2]]; },
				'cross': function () { return [[-1,-1], [1,-1], [-1, 1], [1, 1]]; },
				'ocross': function () { return [[-2,-2], [2,-2], [-2, 2], [2, 2]]; },
				'hbar': function () { return [[-1, 0], [1, 0]]; },
				'ohbar': function () { return [[-2, 0], [2, 0]]; },
				'vbar': function () { return [[0, -1], [0, 1]]; },
				'ovbar': function () { return [[0, -2], [0, 2]]; },
				'tlbr': function () { return [[-1, -1], [1, 1]]; },
				'otlbr': function () { return [[-2, -2], [2, 2]]; },
				'bltr': function () { return [[-1, 1], [1, -1]]; },
				'obltr': function () { return [[-2, 2], [2, -2]]; },
				'arrow1': function () { return [[-1, 1]]; },
				'arrow11': function () { return [[-2, 2]]; },
				'arrow2': function () { return [[0, 1]]; },
				'arrow22': function () { return [[0, 2]]; },
				'arrow3': function () { return [[1, 1]]; },
				'arrow33': function () { return [[2, 2,]]; },
				'arrow4': function () { return [[-1, 0]]; },
				'arrow44': function () { return [[-2, 0]]; },
				'arrow6': function () { return [[1, 0]]; },
				'arrow66': function () { return [[2, 0]]; },
				'arrow7': function () { return [[-1, -1]]; },
				'arrow77': function () { return [[-2, -2]]; },
				'arrow8': function () { return [[0, -1]]; },
				'arrow88': function () { return [[0, -2]]; },
				'arrow9': function () { return [[1, -1]]; },
				'arrow99': function () { return [[2, -2,]]; },
				'blockade': function () { return [[]]; },
				'blank': function () { return [[]]; },
				'ice': function () { return [[]]; },
				'knight': function () { return [[1, 2], [2, 1], [-1, 2], [2, -1], [1, -2], [-2, 1], [-1, -2], [-2, -1]]; },
				'mine': function () { return [[]]; },
				'reclaim': function () { return [[]]; }
			};
		
			if (typeof blockList[blockType] !== 'function') {
				console.log ("SHIT! SHIT!");
				throw new Error('Invalid action.');
			}
		
			return blockList[blockType]();
		}
		
		
		// handle highlight function
		var dir = [];
		dir = getMoves(someType);
		
		// for each direction,
		$.each(dir, function( index, value ) {
			
			//get the actual x/y coord from the relative position
			var newX = x + value[0];
			var newY = y + value[1];
				
			// if we're not out of bounds
			if (((newX >= 1) && (newX <= cols)) && ((newY >= 1) && (newY <= rows))) {
				$('#x' + newX + 'y' + newY).addClass('highlighted'); // highlight the block
			}
		});
	}
	
	function renderstandby() {
		globals.gameplay.standby = true;
		$("#container").removeClass("timeWarning");
		$(".menu_block").addClass("disabled");
		$(".block").addClass("nohover").removeClass('highlighted').addClass('disabled');
		globals.menuState = false; // disable the menu, because a move was made.
	}
	
	
	
	//=======================
	// handle joinGame code. 
	//=======================
	
	$(".menu_block").removeClass('nohover');
	function youArePlaying() {
		for (var id in players) {
			if (id == globals.socket.id) {
				return true;
			}
		}
		return false;
	}
	globals.gameplay.opponents = [];
	if (youArePlaying()) {
		$(".block").removeClass('nohover');
		globals.isPlayer = true
		
		for (var id in players) {
			if (id != globals.socket.id) {
				globals.gameplay.opponents.push(id);
			}
		}
		
		if (gameType === 'practice') {
			if ($("#reset").length === 0) {
				$("#gameButtons").prepend('<div class="buttonStyle" id="reset">Reset</div>');
				$("#reset").on("click",function() {
					if (globals.gameplay.moveCount > 1) {
						globals.socket.emit('practice reset');
					}
				});
			}
		} else {
			console.log('show forfeit button')
		}
		
		/*
		if (players[globals.socket.id].offeredDraw) {
			$("#sidebar").prepend('<div id="offerDraw">Offered Draw</div>');
		} else {
			
			for (var i = 0; i < globals.gameplay.opponents.length; i++) {
				if (opponent[i].offeredDraw) {
					$("#sidebar").prepend('<div class="sideButton" id="offerDraw">Offer Draw</div>')
					drawOffered(gameID);
				}
			}
			
			opponent(trackPlayerNum) == offeredDraw) {
			$("#sidebar").prepend('<div class="sideButton" id="offerDraw">Offer Draw</div>')
			drawOffered(gameID);
		} else {
			$("#sidebar").prepend('<div class="sideButton" id="offerDraw">Offer Draw</div>')
			$("#offerDraw").on("click",function() {
				socket.emit('offer draw', gameID);
				$("#offerDraw").html('Offered Draw');
				$("#offerDraw").removeClass('sideButton');
				$("#offerDraw").off();
			});
		}
		*/
		//buildBlockMenu();
		
		var x = false, y = false, xy = false, type, initialType = 'blank';
		
		$(document).off('click');
		$(document).on("click", function(e) {
			if ((globals.gameplay.standby == false) && (globals.menuState == true)) {
				if ($(e.target).closest(".block").length === 0) {
					if ($(e.target).closest(".menu_block:not(.nohover)").length === 0) {
						outsideClick();
					}
				}
			}
		});
		
		function outsideClick() {
			$('#x' + x + 'y' + y).removeClass('prior-' + players[globals.socket.id].color.substr(1)).removeClass('highlighted');
			$(".menu_block").addClass("disabled");
			globals.menuState = false;
			//log('<span class="dimMsg">outside click</span>');
		}
		$('.block').off();
		$('.block').on("click",function() {
			//log(globals.gameplay.standby + " " + globals.menuState + " " + players[globals.socket.id].color);
			// if the game is active
			if (globals.gameplay.standby == false) {
				xy = obtainID($(this));
				x = xy[0];
				y = xy[1];
				$(".highlighted").removeClass('highlighted');
				$(this).addClass('highlighted');
				//$('.prior-' + collisionColor.substr(1)).removeClass('prior-' + collisionColor.substr(1));
				$('.prior-collision').removeClass('prior-collision');
				
				if ($(this).hasClass('prior-' + players[globals.socket.id].color.substr(1))) {
				// if this block is already activated by you, deactivate it.
				
					$('.prior-' + players[globals.socket.id].color.substr(1)).removeClass('prior-' + players[globals.socket.id].color.substr(1)).removeClass('highlighted');
					$(".menu_block").addClass("disabled");
					globals.menuState = false;
					
				} else {
				// else, activate this block.
				
					$('.prior-' + players[globals.socket.id].color.substr(1)).removeClass('prior-' + players[globals.socket.id].color.substr(1));
					$(this).addClass('prior-' + players[globals.socket.id].color.substr(1));
					
					if ($(this).hasClass('empty')) {
						$(".menu_block:not(.nohover)").removeClass("disabled");
						$("#circle").addClass("disabled");
						$("#reclaim").addClass("disabled");
						globals.menuState = true;
						//type = $(this).data('blockType');
						//highlight(x, y, type, rows, cols);
					} else {
						initialType = $('#x' + x + 'y' + y).data('blockType');
						$(".menu_block").addClass('disabled');
						globals.menuState = true;
						if (getCircleType(initialType) != false) {
							$("#circle:not(.nohover)").removeClass('disabled');
						}
						var possession = $('#x' + x + 'y' + y).data('possession');
						if (possession.length == 1) {
							if ((possession[0] == globals.socket.id) && (initialType !== 'base') && (initialType !== 'blockade')) {
								$("#reclaim:not(.nohover)").removeClass('disabled');
							}
						}
					}
				}
				for (var i = 0; i < globals.gameplay.opponents.length; i++) {
					$('.prior-' + players[globals.gameplay.opponents[i]].color.substr(1)).removeClass('prior-' + players[globals.gameplay.opponents[i]].color.substr(1));
					// this put undefined?? idk.
				}
			}
		});
		
		$( ".block" ).hover(function() {
			if (globals.gameplay.standby == false) {
				let tempXY = obtainID($(this));
				let tempX = tempXY[0];
				let tempY = tempXY[1];
				type = $(this).data('blockType');
				highlight(tempX, tempY, type, rows, cols); // show what moves are possible from that block
			}
		}, function() {
			if (globals.gameplay.standby == false) {
				// remove prior highlight
				$('.highlighted').removeClass('highlighted');
			}
		});
		
		//log("off2");
		//$( ".menu_block" ).off(); // remove prior click handlers if needed....
		
		$("#menuContainer").on({
			mouseenter: function () {
				//stuff to do on mouse enter
				if ($(this).hasClass('disabled') || (globals.menuState == false)) {
					//log ('hover failed');
				} else {
					type = $(this).attr('id');
					initialType = $('#x' + x + 'y' + y).data('blockType');
					var pos = get_pos(x, y, cols);
					if (type == 'circle') {
						type = getCircleType(initialType);
					}
					updateBlock (x,y,type);
					highlight(x, y, type, rows, cols); // show what moves are possible from that block
					playAudio('hover')
				}
			},
			mouseleave: function () {
				// this is a mouse out function for when the hover ends
				if ($(this).hasClass('disabled') || (globals.menuState == false)) {
					// no hover.
				} else {
					updateBlock(x,y,initialType);
					$(".highlighted").not('#x' + x + 'y' + y).removeClass("highlighted"); // remove the highlighted moves, keep the selected square highlighted though.
				}
			}
		}, ".menu_block:not(.nohover)"); //pass the element as an argument to .on
		
		/*
		// hover over a menu block
		$("#menuContainer").on("mouseover", ".menu_block:not(.nohover)", function() {
		//$( ".menu_block:not(.nohover)" ).hover(function() {
			if ($(this).hasClass('disabled') || (globals.menuState == false)) {
				//log ('hover failed');
			} else {
				type = $(this).attr('id');
				initialType = $('#x' + x + 'y' + y).data('blockType');
				var pos = get_pos(x, y, cols);
				if (type == 'circle') {
					type = getCircleType(initialType);
				}
				updateBlock (x,y,type);
				highlight(x, y, type, rows, cols); // show what moves are possible from that block
				playAudio('hover')
			}
		}, function() {
			// this is a mouse out function for when the hover ends
			if ($(this).hasClass('disabled') || (globals.menuState == false)) {
				// no hover.
			} else {
				updateBlock(x,y,initialType);
				$(".highlighted").not('#x' + x + 'y' + y).removeClass("highlighted"); // remove the highlighted moves, keep the selected square highlighted though.
			}
		});
		*/
		
		// when a menu block is clicked
		$('#menuContainer').on("click", ".menu_block:not(.nohover)", function() {
		//$('.menu_block:not(.nohover)').on("click",function() {
			if (globals.menuState == true && globals.gameplay.standby == false) { // if menu and game are both active
				if ($(this).hasClass('disabled')) {
					outsideClick();
				} else {
					renderstandby();
					type = $(this).attr('id');
					if ($(this).find('.ammo').length != 0) {
						var ammo = parseInt($('#' + type + '-ammo').html());
						ammo--;
						$('#' + type + '-ammo').html(ammo);
						if (ammo == 0) {
							$(this).addClass('nohover disabled noammo'); //.css('opacity', '0.5'); //.off();
							// the css opacity 0.5 doesn't work anymore cause that's set in the disabled class now.
							// off doesn't seem to matter bc i check for 0 ammo anyway, it only interferes w/ blockHoverData();
						}
					}
					globals.socket.emit('attempt move', x, y, type, globals.gameplay.moveCount); // moveCount to check if it was placed at the last split second before the turn: returns invalid move.
				}
			}
		});
		
		var opponent = false;
		
		if (globals.gameplay.opponents.length < 1) {
			// practice mode.
			globals.gameplay.standby = false;
		} else {
			
			// dunno if this chunk of code matters anymore, players cannot quit a game in progress anymore..?
			if (players[globals.socket.id].onstandby) {
				globals.gameplay.standby = true;
				//$('#x' + tempBlock[0] + 'y' + tempBlock[1]).removeClass('prior1').removeClass('prior2').removeClass('prior3').addClass('prior' + playerNum);
				var pos = get_pos(tempBlock[0], tempBlock[1], numCols);
				updateBlock(tempBlock[0],tempBlock[1],tempBlock[2], undefined, undefined, boardData[pos].randInt); // show what block you selected
				renderstandby();
			} else if (globals.gameplay.opponents[0].onstandby) {
				globals.gameplay.standby = true;
				// really need to work in more than 2 players for this.
				//waitMsg(opponent(trackPlayerNum));
			} else {
				globals.gameplay.standby = false;
			}
		}
		
	} else {
		renderExitButton();
		$(".block").addClass('nohover');
	}
	
	globals.menuState = false;
	
} // end of joinGame




export function timeLimitUpdate(timeLimit) {
	if (timeLimit == false) {
			$("#timeLimit").html('&infin;');
		} else {
			$("#timeLimit").html(timeLimit);
		}
	log ('<span class="dimMsg">time limit set to ' + ($('#timeLimit').html()));
}


export function collisionUpdate(collisionMode) {
	if (typeof collisionMode !== 'undefined') {
		if (collisionMode.permanence === true) {
			$("#collisionSetting").html('Permanent');
			log('<span class="dimMsg">permanent collisions</span>');
		} else {
			var sString = 's';
			if (collisionMode.permanence === 1) {
				sString = '';
			}
			$("#collisionSetting").html('<span class="collisionTurnCount">' + collisionMode.permanence.toString() + '</span> Turn' + sString);
			log('<span class="dimMsg">collisions last ' + collisionMode.permanence.toString() + ' turn' + sString);
		}
	}
}


export function drawOffered(gameID) {
	$("#offerDraw").off(); // remove clickhandler from offerDraw
	$("#offerDraw").addClass('offered');
	$("#offerDraw").html('Accept Draw');
	$("#offerDraw").on('click', function() {
		cleanup(3, 'drawAccepted');
		globals.socket.emit('draw accepted', gameID); // let the other players know the draw was accepted.
	});
}



export function cleanup(winners, reason) {
	//log('The game is over.');
	$("#container").removeClass("timeWarning");
	clearInterval(globals.gameplay.timer);
	
	if (winners.length > 1) {
		playAudio('drawgame')
	} else {
		if (winners[0] == globals.socket.id) {
			playAudio('youwin')
		} else {
			playAudio('gameover')
		}
	}
	
	if (globals.isPlayer) {
		if (reason !== 'dc' && reason !== 'practice') {
			console.log('show rematchbutton')
		}
	}

	$(".block", "#board").addClass('disabled').off();
	for (var i = 0; i < globals.priorColorList.length; i++) {
		$(".block").removeClass(globals.priorColorList[i]); // this is longer than it needs to be for each game, oh well maybe fix later.
	}
	$(".highlighted").removeClass('highlighted');
	//$("#menu").css('opacity', '0.5'); // dim the menu
	//$("#menuContainer").off();
	$(".menu_block").addClass('disabled');
	$("#offerDraw").remove();
	$("#forfeit").remove();
	$(".moveStatus").remove(); // remove the move status
	$("#timer").remove();
	$(".waitMsg").parent().remove();
	//blockHoverData();
	renderExitButton();
	
	globals.debounce = Math.random();
	var temp = globals.debounce;
	if (globals.isGhost) {
		setTimeout(function(){ 
			if (globals.debounce == temp) {
				exitGame();
			}
		}, 60000);
	}
}





export function blockHoverData() {
	
	function readableBlockName(blockType) { // returns blocknames for hover info that don't suck
		var blockList = {
			'base': 'source',
			'ostar': 'jump star',
			'plus': '+',
			'oplus': 'jump +',
			'cross': 'x',
			'ocross': 'jump x',
			'ohbar': 'jump hbar',
			'ovbar': 'jump vbar',
			'otlbr': 'jump tlbr',
			'obltr': 'jump bltr',
			'arrow1': 'arrow1',
			'arrow11': 'jump arrow1',
			'arrow2': 'arrow2',
			'arrow22': 'jump arrow2',
			'arrow3': 'arrow3',
			'arrow33': 'jump arrow3',
			'arrow4': 'arrow4',
			'arrow44': 'jump arrow4',
			'arrow6': 'arrow6',
			'arrow66': 'jump arrow6',
			'arrow7': 'arrow7',
			'arrow77': 'jump arrow7',
			'arrow8': 'arrow8',
			'arrow88': 'jump arrow8',
			'arrow9': 'arrow9',
			'arrow99': 'jump arrow9',
			'mine': 'stealthy mine'
		}
		
		if (blockList.hasOwnProperty(blockType)) {
			return blockList[blockType];
		} else {
			return blockType;
		}
	}
	
	
	
	// 
	// handle blockHoverData code.
	// 
	
	
	$("#board").on({
		mouseenter: function () {
			//stuff to do on mouse enter
			var blockType = ($(this).data('blockType'));
			blockType = readableBlockName(blockType);
			var history = $(this).data('history');
			var possessionColor = $(this).data('possessionColor');
			var xx = $(this).data('x'); //x pos
			var yy = $(this).data('y'); //y pos
			var showHistory = true;
			
			var possessionDisplayName = $(this).data('possessionDisplayName');
			var possessionSpread = $(this).data('possessionColorSpread');

			if (blockType == 'source') {
				if (typeof history[0] !== 'undefined') {
					blockType = '<span style="color: ' + history[0].playerColor + ';">' + history[0].playerDisplayName + '\'s source</span>';
					showHistory = false;
				} else {
					blockType = 'unclaimed source';
					showHistory = false;
				}
			}
			
			var appendString = '<div class="dimMsg">x: <b>' + xx + '</b>,&ensp;y: <b>' + yy + '</b></div>';
			appendString += '<div style="font-weight: bold; color:white; font-size:15px;">' + blockType + '</div>';
			
			if (showHistory && possessionDisplayName !== false && blockType !== 'blockade') {
				appendString += '<div>possessed by <b style="color: ' + possessionColor + '">' + possessionDisplayName + '</b></div>';
			}
			
			if (showHistory) {
				for (var i = 0; i < history.length; i++) {
					
					appendString += history[i];
					
					/*
					appendString += '<div><b>' + readableBlockName(history[i].blockType) + '</b>';
					if (history[i].cause == 'player') {
						appendString += ' placed by <b style="color: ' + history[i].playerColor + '">' + history[i].playerDisplayName + '</b>';
					} else {
						appendString += ' caused by <b>' + history[i].cause + '</b>';
					}
					appendString += ' on turn <b>' + history[i].turn + '</b>.</div>'
					*/
				}
			}
			
			$("#bottomInfo").append(appendString);
		},
		mouseleave: function () {
			// this is a mouse out function for when the hover ends
			$("#bottomInfo").html('');
		}
	}, ".block"); //pass the element as an argument to .on
	
	
	$("#menuContainer").on({
		mouseenter: function () {
			//stuff to do on mouse enter
			var type = $(this).attr('id');
			var blockType = readableBlockName(type);
			var appendString = '';
			if (globals.isPlayer) {
				
				appendString += '<div>' + globals.name + '\'s stockpile</div>';
				// appendString += '<div>' + 'my name' + '\'s stockpile</div>';
			} else {
				appendString += '<div class="dimMsg">starting stockpile</div>';
			}
			appendString += '<div style="font-weight: bold; color:white; font-size:15px;">' + blockType + '</div>';
			var ammo;
			if ($(this).find('.ammo').length != 0) {
				ammo = parseInt($('#' + type + '-ammo').html());
				appendString += '<div><b>' + ammo + '</b> remaining</div>';
			}
			/*
			if (type == 'star') {
				appendString += `<div>a <i>star</i>, similar to the player's <i>source</i>, spreads color to all 8 adjacent squares.</div>`;
			}
			if (type == 'plus') {
				appendString += `<div>a <i>+</i> is a basic block that spreads color to the 4 adjacent non-diagonal squares.</div>`;
			}
			if (type == 'cross') {
				appendString += `<div>an <i>x</i> is a basic block that spreads color to the 4 adjacent diagonal squares.</div>`;
			}
			if (type == 'circle') {
				appendString += `<div>a <i>circle</i> turns an uncircled block into a jump block. a circle may be placed on any uncircled block already on the board, 
				including blocks placed by the opponent. you may not circle a <i>source</i>, however.</div>`;
			}
			if (type == 'reclaim') {
				appendString += `<div>you may <i>reclaim</i> any block that you have sole possession over, including blocks placed by the opponent. 
				a reclaimed block becomes a blank space on the board, and will add to your stockpile. you cannot reclaim your <i>source</i>.</div>`;
			}
			if (type == 'mine') {
				appendString += `<div>a <i>stealthy mine</i> may be placed on any blank space. it is invisible to the opponent and spectators. 
				attempting to place a block where a mine is will result in a blockade being formed. mines are un-reclaimable.</div>`;
			}
			*/
			$("#bottomInfo").append(appendString);
		},
		mouseleave: function () {
			// this is a mouse out function for when the hover ends
			$("#bottomInfo").html('');
		}
	}, ".menu_block"); //pass the element as an argument to .on
}




export function renderExitButton() {
	const $exitBtn = $("#exit")
	
	console.log('render exit button')
	
	/*
	if ($exitBtn.length === 0) {
		$exitBtn.show()
	} else {
		$exitBtn.hide()
	}
	*/
}

export function exitGame() {
	$("#sidebar").empty();
	$("#container").removeClass("timeWarning");
	clearInterval(globals.gameplay.timer);
	$(".waitMsg").parent().remove();
	globals.gameplay.show.winstate = false;
	globals.socket.emit('exit to lobby');
}



export function buildEmptyBoard(rows, cols) {
	// clear the board
	$("#board").empty()
	
	// begin building the physical board (as <div>s)
	for (var i = 0; i < rows; i++) {
		var buildstring = '<div class="board_row">';
		for (var j = 0; j < cols; j++) {
			// blocks start as empty blocks
			buildstring += '<div id="x' + (j+1) + 'y' + (i+1) + '" class="block empty"></div>';
		}
		buildstring += '</div>';
		$("#board").append(buildstring);
	}
	
	sizeBoard()
}





export function resizeFunction() {
	
	// Note, I think that we can do the same thing purely within CSS, probably
	return
	
	// 1. resize sidebars
	{
		let initialWidth
		if ($(window).width() > 1450) {
			initialWidth = 222 + (($(window).width() - 1450) / 3);
		if (initialWidth > 300) { initialWidth = 300; }
		} else {
			initialWidth = 222;
		}
		
		console.log('intialWidth', initialWidth)
		$('#chatPanel').css('width', initialWidth + 'px');
		$('#leaderboard').css('width', initialWidth + 'px');
	}
	
	
	if ($("#menuContainer").length > 0) {
		menuResize();
	}
	
	if ($("#board").length > 0) {
		sizeBoard();
	}
	
	if ($("#blockListEditor").length > 0) {
		let hWidth = hSpace();
		$("#blockListEditor").css('width', hWidth);
	}
	
}




function sizeBoard() {
	
	function getBlockSize(rows, cols) {
		let blockSize = 50;
		
		// find available space
		var horizontalSpace = hSpace();
		var verticalSpace = vSpace();
		
		let windowRatio = horizontalSpace / verticalSpace;
		let boardRatio = cols / rows;
		
		//if board ratio wider than window ratio then horizontally max the board!
		//if board ratio taller than the window ratio then vertically max the board!!
		if (boardRatio > windowRatio) {
			blockSize = Math.floor(horizontalSpace / cols);
		} else {
			blockSize = Math.floor(verticalSpace / rows);
		}
	
		return blockSize;
	}
	
	
	
	var arr = []; //populate the length of children into this array.
	$('.board_row').map(function (i) {
		arr[i] = $(this).children().length;
	});
	
	//get the max value from the array
	var cols = Math.max.apply(Math, arr);
	
	var rows = $(".board_row").length;
	
	let blockSize = getBlockSize(rows, cols);
	let boardWidth = (cols * blockSize) + 'px';
	let boardHeight = (rows * blockSize) + 'px';
	
	$("#board").css('width', boardWidth);
	$("#board").css('height', boardHeight);
	$(".board_row").css('height', blockSize);
	$(".block").css('width', blockSize);
	$(".block").css('height', blockSize);
}



export function buildBlockMenu (blockList) {
	$("#menu").empty();
	// define what blocks are used in the menu.
	var menuBlocks = blockList;
	var buildString = '';
	var ammoString = '';
	buildString += '<div class="menu_row">';
	//<div class="menu_block nohover disabled" style="opacity:0"></div> dummy block
	
	var position = 0;
	var splitPoint = Math.floor(Object.keys(menuBlocks).length / 2);
	
	for (var block in blockList) {
		position++;
		if (position > splitPoint) {
			splitPoint = 9001; // it's over 9000!!!
			buildString += '</div><div class="menu_row">'; // new row
		}
		buildString += '<div class="menu_block';
		if (blockList[block].ammo == 0) {
			buildString += ' disabled nohover noammo';
			ammoString = '';
		}
		// idk why it's "null" but w/e
		if ((blockList[block].ammo !== null) && (blockList[block].ammo !== 'inf')) {
			ammoString = '<div class="ammo" id="'+ block +'-ammo">'+ blockList[block].ammo +'</div>';
		} else {
			ammoString = '';
		}
		var SVGString = getSVG8by8(block);
		buildString += '" id="' + block + '" >' + ammoString + SVGString + '</div>';
	}
	buildString += '</div>';
	$('#menu').append(buildString);
	menuResize();
}

function menuResize () {
	var horizontalSpace = hSpace();
	
	var arr = []; //populate the length of children into this array.
	$('.menu_row').map(function (i) {
		arr[i] = $(this).children().length;
	});
	var menuLength = Math.max.apply(Math, arr); //get the max value from the array
	
	//let menuLength = $(".menu_block").length;
	let menuBlockSize = ((Math.floor(horizontalSpace / menuLength)) * 0.5) - 10;
	if (menuBlockSize > 75) {
		menuBlockSize = 75;
	}
	$(".menu_block").css('height', menuBlockSize);
	$(".menu_block").css('width', menuBlockSize);
	//$(".menu_block").css('margin', menuBlockSize / 15);
	//$("#menu").css('width', horizontalSpace * 0.8);
}


function hSpace () {
    // for board/menu sizing.
	let horizontalSpace = $(window).width();
	if ($("#chatPanel").is(":visible")) {
		horizontalSpace -= $("#chatPanel").width();
	}
	return horizontalSpace;
}
function vSpace () {
	let verticalSpace = $(window).height() - 38 - $("#menuContainer").height() - 10; // 38 is $("#gameHead").height() but hardcoded for now.
	return verticalSpace;
}





export function renderBoard(data) {
	
	for (var i = 0; i < globals.priorColorList.length; i++) {
		$(".block").removeClass(globals.priorColorList[i]);
	}
	
	$.each(data, function( index, value ) {
		let tempX = value.x + 1;
		let tempY = value.y + 1;
		updateBlock(
			tempX, 
			tempY, 
			value.type, 
			value.possessionDisplayName, 
			value.moveNum, 
			value.origin, 
			value.color, 
			value.duration, 
			value.history, 
			value.originColor, 
			value.possession, 
			value.possessionColorSpread
		)
	})
	//log ('<span class="dimMsg">rendered board</span>');
}





export function getSVG8by8(blockType, where) {
	var SVGString = '';
	if (blockType !== 'blank') {
		var oShape = '<circle fill="none" class="oShape" stroke="#000000" stroke-width="5" cx="40" cy="40" r="30"/>';
		var oOutline = '<path class="outline" d="M40,74.5C20.977,74.5,5.5,59.023,5.5,40S20.977,5.5,40,5.5S74.5,20.977,74.5,40S59.023,74.5,40,74.5L40,74.5 z"/>';
		
		SVGString += '<svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/" x="0px" y="0px" width="80px" height="80px" viewBox="0 0 80 80" xml:space="preserve"><defs></defs>';

		if (blockType == 'circle') {
			//SVGString += oOutline;
			SVGString += oShape;
		} else if (blockType == 'base') {
			SVGString += '<polygon class="shape" points="62.5,45 62.499,34.999 52.071,35 59.445,27.625 52.374,20.555 44.999,27.93 44.999,17.5 35,17.5 35,27.929 27.625,20.555 20.555,27.625 27.928,35 17.5,35 17.5,45 27.929,45 20.555,52.374 27.625,59.445 35,52.072 34.999,62.499 45,62.5 44.999,52.07 52.374,59.445 59.445,52.374 52.071,45 "/>';
			SVGString += '<circle class="jewel" cx="40" cy="40" r="7.5"/>';
		} else if (blockType == 'star') {
			SVGString += '<polygon class="shape" points="62.5,45 62.499,34.999 52.071,35 59.445,27.625 52.374,20.555 44.999,27.93 44.999,17.5 35,17.5 35,27.929 27.625,20.555 20.555,27.625 27.928,35 17.5,35 17.5,45 27.929,45 20.555,52.374 27.625,59.445 35,52.072 34.999,62.499 45,62.5 44.999,52.07 52.374,59.445 59.445,52.374 52.071,45 "/>';
		} else if (blockType == 'ostar') {
			SVGString += oShape;
			SVGString += '<polygon class="shape" points="62.5,45 62.499,34.999 52.071,35 59.445,27.625 52.374,20.555 44.999,27.93 44.999,17.5 35,17.5 35,27.929 27.625,20.555 20.555,27.625 27.928,35 17.5,35 17.5,45 27.929,45 20.555,52.374 27.625,59.445 35,52.072 34.999,62.499 45,62.5 44.999,52.07 52.374,59.445 59.445,52.374 52.071,45 "/>';
		} else if (blockType == 'plus') {
			SVGString += '<polygon class="shape" points="62.5,35 45,35 45,17.5 35,17.5 35,35 17.5,35 17.5,45 35,45 35,62.5 45,62.5 45,45 62.5,45 "/>';
		} else if (blockType == 'oplus') {
			//SVGString += oOutline;
			SVGString += oShape;
			SVGString += '<polygon class="shape" points="62.5,35 45,35 45,17.5 35,17.5 35,35 17.5,35 17.5,45 35,45 35,62.5 45,62.5 45,45 62.5,45 "/>';
		} else if (blockType == 'cross') {
			SVGString += '<polygon class="shape" points="59.445,52.374 47.071,40 59.445,27.625 52.374,20.555 40,32.929 27.625,20.555 20.555,27.625 32.929,40 20.555,52.374 27.625,59.445 40,47.071 52.374,59.445 "/>';
		} else if (blockType == 'ocross') {
			SVGString += oShape;
			SVGString += '<polygon class="shape" points="59.445,52.374 47.071,40 59.445,27.625 52.374,20.555 40,32.929 27.625,20.555 20.555,27.625 32.929,40 20.555,52.374 27.625,59.445 40,47.071 52.374,59.445 "/>';
		} else if (blockType == 'arrow1') {
			SVGString += '<polygon class="shape" points="22.42,57.58 46.762,52.419 40,47.071 59.445,27.626 52.374,20.555 32.929,40 27.582,33.238 "/>';
		} else if (blockType == 'arrow11') {
			SVGString += oShape;
			SVGString += '<polygon class="shape" points="22.42,57.58 46.762,52.419 40,47.071 59.445,27.626 52.374,20.555 32.929,40 27.582,33.238 "/>';
		} else if (blockType == 'arrow2') {
			SVGString += '<polygon class="shape" points="40,64.861 53.563,44 45,45 45,17.5 35,17.5 35,45 26.438,44 "/>';
		} else if (blockType == 'arrow22') {
			SVGString += oShape;
			SVGString += '<polygon class="shape" points="40,64.861 53.563,44 45,45 45,17.5 35,17.5 35,45 26.438,44 "/>';
		} else if (blockType == 'arrow3') {
			SVGString += '<polygon class="shape" points="57.58,57.58 52.419,33.238 47.071,40 27.626,20.555 20.555,27.626 40,47.071 33.238,52.419 "/>';
		} else if (blockType == 'arrow33') {
			SVGString += oShape;
			SVGString += '<polygon class="shape" points="57.58,57.58 52.419,33.238 47.071,40 27.626,20.555 20.555,27.626 40,47.071 33.238,52.419 "/>';
		} else if (blockType == 'arrow4') {
			SVGString += '<polygon class="shape" points="15.139,40 36,53.563 35,45 62.5,45 62.5,35 35,35 36,26.438 "/>';
		} else if (blockType == 'arrow44') {
			SVGString += oShape;
			SVGString += '<polygon class="shape" points="15.139,40 36,53.563 35,45 62.5,45 62.5,35 35,35 36,26.438 "/>';
		} else if (blockType == 'arrow6') {
			SVGString += '<polygon class="shape" points="64.861,40 44,26.438 45,35 17.5,35 17.5,45 45,45 44,53.563 "/>';
		} else if (blockType == 'arrow66') {
			SVGString += oShape;
			SVGString += '<polygon class="shape" points="64.861,40 44,26.438 45,35 17.5,35 17.5,45 45,45 44,53.563 "/>';
		} else if (blockType == 'arrow7') {
			SVGString += '<polygon class="shape" points="22.42,22.42 27.582,46.762 32.929,40 52.374,59.445 59.445,52.374 40,32.929 46.762,27.582 "/>';
		} else if (blockType == 'arrow77') {
			SVGString += oShape;
			SVGString += '<polygon class="shape" points="22.42,22.42 27.582,46.762 32.929,40 52.374,59.445 59.445,52.374 40,32.929 46.762,27.582 "/>';
		} else if (blockType == 'arrow8') {
			SVGString += '<polygon class="shape" points="40,15.139 26.438,36 35,35 35,62.5 45,62.5 45,35 53.563,36 "/>';
		} else if (blockType == 'arrow88') {
			SVGString += oShape;
			SVGString += '<polygon class="shape" points="40,15.139 26.438,36 35,35 35,62.5 45,62.5 45,35 53.563,36 "/>';
		} else if (blockType == 'arrow9') {
			SVGString += '<polygon class="shape" points="57.58,22.42 33.238,27.581 40,32.929 20.555,52.374 27.626,59.445 47.071,40 52.419,46.762 "/>';
		} else if (blockType == 'arrow99') {
			SVGString += oShape;
			SVGString += '<polygon class="shape" points="57.58,22.42 33.238,27.581 40,32.929 20.555,52.374 27.626,59.445 47.071,40 52.419,46.762 "/>';
		} else if (blockType == 'hbar') {
			SVGString += '<rect class="shape" x="17.5" y="35" width="45" height="10"/>';
		} else if (blockType == 'ohbar') {
			SVGString += oShape;
			SVGString += '<rect class="shape" x="17.5" y="35" width="45" height="10"/>';
		} else if (blockType == 'vbar') {
			SVGString += '<rect class="shape" x="35" y="17.5" width="10" height="45"/>';
		} else if (blockType == 'ovbar') {
			SVGString += oShape;
			SVGString += '<rect class="shape" x="35" y="17.5" width="10" height="45"/>';
		} else if (blockType == 'tlbr') {
			SVGString += '<rect class="shape" x="17.5" y="35" transform="matrix(-0.7071 -0.7071 0.7071 -0.7071 40 96.5684)" width="45" height="10"/>';
		} else if (blockType == 'otlbr') {
			SVGString += oShape;
			SVGString += '<rect class="shape" x="17.5" y="35" transform="matrix(-0.7071 -0.7071 0.7071 -0.7071 40 96.5684)" width="45" height="10"/>';
		} else if (blockType == 'bltr') {
			SVGString += '<rect class="shape" x="17.5" y="34.999" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -16.5682 40.0007)" width="45" height="10"/>';
		} else if (blockType == 'obltr') {
			SVGString += oShape;
			SVGString += '<rect class="shape" x="17.5" y="34.999" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -16.5682 40.0007)" width="45" height="10"/>';
		} else if (blockType == 'ice') {
			SVGString += '<rect fill="#B6E3FF" width="80" height="80"/>';
			SVGString += '<polygon fill="#CFF1FF" points="80,38.375 0,29.375 0,17.125 80,24 "/>';
			SVGString += '<polygon fill="#CFF1FF" points="80,65 0,49.375 0,37.125 80,50.5 "/>';
			SVGString += '<polygon fill="#FFFFFF" stroke="#B6E3FF" points="25.536,43.786 28.788,54.874 39.875,58.125 28.788,61.377 25.536,72.464 22.285,61.377 11.197,58.125 22.285,54.874 "/>';
			SVGString += '<polygon fill="#FFFFFF" stroke="#B6E3FF" points="53.339,11.322 56.591,22.41 67.678,25.661 56.591,28.913 53.339,40 50.088,28.913 39,25.661 50.088,22.41 "/>';
		} else if (blockType == 'knight') {
			SVGString += '<path d="M24.457,70.447c0,0,0.238-11.977,6.288-17.872C43.651,40,41.666,37.022,41.666,37.022s-4.964-1.986-11.694,4.082 c-6.729,6.066-11.692,8.493-12.134,3.86c0,0-6.288,0.221-5.957-3.86c0.331-4.082,13.127-19.084,14.893-24.159 c1.765-5.074,1.985-7.391,1.985-7.391s5.185,2.427,6.839,5.074c0,0,3.751-5.185,6.73-5.074l1.103,4.412 c0,0,12.024,1.765,16.988,14.672c4.964,12.907,4.964,41.809,4.964,41.809"/>';
			SVGString += '<path fill="#AD0000" d="M31.347,22.019c0,0-6.067,3.162-6.067,7.281c0,0.184,0,0.441,0,0.441s4.964-1.765,5.516-4.743"/>';
		} else if (blockType == 'mine') {
			SVGString += `
				<g class="mineMetal">
					<circle cx="40" cy="40" r="4.2"/>
					<path d="M59.7,49.5C59.7,49.5,59.7,49.5,59.7,49.5c0.2-0.4,0.3-0.7,0.5-1.1c0,0,0-0.1,0-0.1c0.1-0.3,0.3-0.6,0.4-1
					c0-0.1,0.1-0.2,0.1-0.3c0.1-0.3,0.2-0.5,0.3-0.8c0-0.1,0.1-0.3,0.1-0.4c0.1-0.2,0.1-0.5,0.2-0.7c0-0.1,0.1-0.3,0.1-0.4
					c0.1-0.2,0.1-0.5,0.1-0.7c0-0.1,0.1-0.3,0.1-0.4c0-0.2,0.1-0.5,0.1-0.7c0-0.1,0-0.3,0.1-0.4c0-0.3,0.1-0.5,0.1-0.8
					c0-0.1,0-0.3,0-0.4c0-0.4,0-0.8,0-1.2c0-0.4,0-0.8,0-1.2c0-0.1,0-0.3,0-0.4c0-0.3,0-0.5-0.1-0.8c0-0.1,0-0.3-0.1-0.4
					c0-0.3-0.1-0.5-0.1-0.8c0-0.1,0-0.3-0.1-0.4c0-0.3-0.1-0.5-0.2-0.8c0-0.1-0.1-0.3-0.1-0.4c-0.1-0.3-0.1-0.5-0.2-0.8
					c0-0.1-0.1-0.2-0.1-0.3c-0.1-0.3-0.2-0.6-0.3-0.9c0-0.1,0-0.1-0.1-0.2c-0.3-0.7-0.6-1.5-0.9-2.2c0,0,0,0,0,0
					c-2.5-5.1-6.9-9.1-12.3-11c0,0,0,0,0,0c-0.4-0.1-0.7-0.2-1.1-0.4c-0.1,0-0.2,0-0.2-0.1c-0.3-0.1-0.6-0.2-0.9-0.2
					c-0.1,0-0.2-0.1-0.3-0.1c-0.3-0.1-0.5-0.1-0.8-0.2c-0.1,0-0.3,0-0.4-0.1c-0.3,0-0.5-0.1-0.8-0.1c-0.1,0-0.3,0-0.4-0.1
					c-0.3,0-0.6-0.1-0.8-0.1c-0.1,0-0.2,0-0.4,0c-0.4,0-0.8,0-1.2,0c-0.4,0-0.8,0-1.2,0c-0.1,0-0.3,0-0.4,0c-0.3,0-0.5,0-0.8,0.1
					c-0.1,0-0.3,0-0.4,0.1c-0.2,0-0.5,0.1-0.7,0.1c-0.1,0-0.3,0.1-0.4,0.1c-0.2,0-0.5,0.1-0.7,0.1c-0.1,0-0.3,0.1-0.4,0.1
					c-0.2,0.1-0.5,0.1-0.7,0.2c-0.1,0-0.3,0.1-0.4,0.1c-0.3,0.1-0.5,0.2-0.8,0.3c-0.1,0-0.2,0.1-0.3,0.1c-0.3,0.1-0.6,0.2-1,0.4
					c0,0-0.1,0-0.1,0c-6,2.5-10.6,7.6-12.5,13.9c0,0.1,0,0.1-0.1,0.2c-0.1,0.3-0.2,0.6-0.2,0.9c0,0.1,0,0.2-0.1,0.3
					c-0.1,0.3-0.1,0.6-0.2,0.8c0,0.1,0,0.3-0.1,0.4c0,0.3-0.1,0.5-0.1,0.8c0,0.1,0,0.3-0.1,0.4c0,0.3-0.1,0.6-0.1,0.8
					c0,0.1,0,0.2,0,0.4c0,0.4,0,0.8,0,1.2c0,0.4,0,0.8,0,1.2c0,0.1,0,0.2,0,0.4c0,0.3,0,0.6,0.1,0.8c0,0.1,0,0.3,0.1,0.4
					c0,0.3,0.1,0.5,0.1,0.8c0,0.1,0,0.3,0.1,0.4c0,0.3,0.1,0.5,0.2,0.8c0,0.1,0.1,0.2,0.1,0.3c0.1,0.3,0.1,0.6,0.2,0.9
					c0,0.1,0,0.2,0.1,0.2c0.1,0.4,0.2,0.7,0.4,1.1c0,0,0,0,0,0c1.9,5.4,5.9,9.8,11,12.3c0,0,0,0,0,0c0.7,0.3,1.4,0.7,2.2,0.9
					c0.1,0,0.1,0,0.2,0.1c0.3,0.1,0.6,0.2,0.9,0.3c0.1,0,0.2,0.1,0.3,0.1c0.3,0.1,0.5,0.1,0.8,0.2c0.1,0,0.3,0.1,0.4,0.1
					c0.3,0.1,0.5,0.1,0.8,0.2c0.1,0,0.3,0.1,0.4,0.1c0.3,0,0.5,0.1,0.8,0.1c0.1,0,0.3,0,0.4,0.1c0.3,0,0.5,0.1,0.8,0.1
					c0.1,0,0.3,0,0.4,0c0.4,0,0.8,0,1.2,0c0.4,0,0.8,0,1.2,0c0.1,0,0.2,0,0.4,0c0.3,0,0.6,0,0.8-0.1c0.1,0,0.3,0,0.4-0.1
					c0.3,0,0.5-0.1,0.8-0.1c0.1,0,0.3,0,0.4-0.1c0.3-0.1,0.6-0.1,0.8-0.2c0.1,0,0.2,0,0.3-0.1c0.3-0.1,0.6-0.2,0.9-0.2
					c0.1,0,0.1,0,0.2-0.1c1.2-0.4,2.3-0.8,3.4-1.3c0,0,0,0,0,0C54,57.4,57.5,53.9,59.7,49.5z M40,46.2c-3.4,0-6.2-2.8-6.2-6.2
					s2.8-6.2,6.2-6.2s6.2,2.8,6.2,6.2S43.4,46.2,40,46.2z"/>
					<path fill="#1C1C1C" d="M18.9,51.1l-1,1c-1.6,1.6-1.6,4.1,0,5.7l4.4,4.4c1.6,1.6,4.1,1.6,5.7,0l1-1C24.7,58.9,21.2,55.4,18.9,51.1z "/>';
					<path fill="#1C1C1C" d="M61.1,29l1.3-1.3c1.6-1.6,1.6-4.1,0-5.7L58,17.7c-1.6-1.6-4.1-1.6-5.7,0l-1.3,1.3 C55.4,21.2,58.9,24.7,61.1,29z"/>';
					<path fill="#1C1C1C" d="M61.1,51c-2.2,4.3-5.7,7.8-10,10.1l1.1,1.1c1.6,1.6,4.1,1.6,5.7,0l4.4-4.4c1.6-1.6,1.6-4.1,0-5.7L61.1,51z" />';
					<path fill="#1C1C1C" d="M18.9,28.9c2.3-4.3,5.8-7.8,10.1-10l-1.2-1.2c-1.6-1.6-4.1-1.6-5.7,0L17.8,22c-1.6,1.6-1.6,4.1,0,5.7 L18.9,28.9z"/>';
				</g>
				<circle class="mineLights" cx="30" cy="30" r="2"/>
				<circle class="mineLights" cx="50" cy="30" r="2"/>
				<circle class="mineLights" cx="30" cy="50" r="2"/>
				<circle class="mineLights" cx="50" cy="50" r="2"/>
				`;
		} else if (blockType == 'reclaim') {
			SVGString += `<polygon fill="#E3FFE1" points="13.2,21.3 15.1,27.8 21.5,29.7 15.1,31.6 13.2,38 11.3,31.6 4.8,29.7 11.3,27.8 	"/>
			<polygon fill="#E3FFE1" points="40.8,60 42.7,66.4 49.2,68.3 42.7,70.2 40.8,76.7 38.9,70.2 32.5,68.3 38.9,66.4 	"/>
			<polygon fill="#E3FFE1" points="64.5,37.2 66.3,43.6 72.8,45.5 66.3,47.4 64.5,53.8 62.6,47.4 56.1,45.5 62.6,43.6 	"/>
			<polygon fill="#E3FFE1" points="62.7,11.2 64.6,17.6 71,19.5 64.6,21.4 62.7,27.8 60.8,21.4 54.3,19.5 60.8,17.6 	"/>
			<polygon fill="#E3FFE1" points="32.5,3.8 34.4,10.3 40.8,12.2 34.4,14.1 32.5,20.5 30.6,14.1 24.1,12.2 30.6,10.3 	"/>
			<polygon fill="#E3FFE1" points="15.5,50.3 17.4,56.8 23.9,58.7 17.4,60.6 15.5,67 13.7,60.6 7.2,58.7 13.7,56.8 	"/>
			<path fill="#006616" d="M45.5,62.8l-0.4-0.6c-0.5-0.8-1.3-2.7-3.1-10.3c-1.1-5-2.6-5.8-5.7-5.9h-1.6v16.8H22.6V18.3l1-0.2
			c3.5-0.6,8.3-0.9,13.1-0.9c6.9,0,11.4,1.1,14.6,3.6c2.9,2.3,4.4,5.7,4.4,9.9c0,5-2.9,8.7-6.3,10.7c2.6,2,3.7,5.2,4.4,7.6
			c0.4,1.3,0.7,2.7,1.1,4c0.9,3.3,1.8,6.7,2.3,7.8l0.9,1.8H45.5z M37.2,36.5c4,0,6.4-1.8,6.4-4.9c0-3.1-2-4.6-5.9-4.7
			c-1.2,0-2.2,0.1-3.1,0.1v9.4H37.2z"/>
			<path fill="#B3FFC1" d="M36.7,18.5c6.3,0,10.8,1,13.8,3.4c2.5,2,3.9,5,3.9,8.9c0,5.4-3.9,9.2-7.5,10.5v0.2c3,1.2,4.6,4.1,5.7,8
			c1.3,4.8,2.7,10.4,3.5,12h-9.9c-0.7-1.2-1.7-4.7-3-9.9c-1.1-5.3-3-6.8-6.9-6.8h-2.9v16.8h-9.6V19.4C27,18.9,31.6,18.5,36.7,18.5
			 M33.4,37.8h3.8c4.8,0,7.7-2.4,7.7-6.1c0-3.9-2.7-5.9-7.1-6c-2.3,0-3.7,0.2-4.4,0.3V37.8 M36.7,16c-4.8,0-9.7,0.3-13.3,0.9
			l-2.1,0.3v2.1v42.1V64h2.5h9.6h2.5v-2.5V47.2h0.4c2.3,0,3.5,0.3,4.5,4.9l0,0l0,0c1.8,7.6,2.7,9.7,3.2,10.6l0.7,1.2h1.4h9.9h4
			l-1.8-3.6c-0.5-1-1.4-4.5-2.2-7.5c-0.4-1.3-0.7-2.7-1.1-4.1c-0.6-2.2-1.6-5-3.6-7.2c3.1-2.3,5.5-6.1,5.5-10.9
			c0-4.6-1.7-8.3-4.9-10.9C48.7,17.2,44,16,36.7,16L36.7,16z M35.9,28.2c0.6,0,1.2,0,1.9,0c4.6,0.1,4.6,2.4,4.6,3.5
			c0,3.2-3.2,3.6-5.2,3.6h-1.3V28.2L35.9,28.2z"/>`;
		}
		SVGString += '<path class="border" d="M80,80H0V0h80V80L80,80z M2.5,77.5h75v-75h-75V77.5L2.5,77.5z"/>';
		
		if (!(blockType === 'mine' && where === 'board')) {
			SVGString += '<rect class="border2" x="2.5" y="2.5" fill="none" stroke-width="1.5" width="75" height="75"/>';
		}
		SVGString += '</svg>';
	}
	return SVGString;
}





function updateBlock (x, y, blockType, possessionDisplayName, moveNum, origin, color, duration, history, originColor, possession, possessionColorSpread) {
	
	function addNewStyle(color) {
		
		// I will sometimes call this not just when setting up the page
		// but also when a new color mix is found on a block.
		// because I don't want to pre-generate those
		// I'll do it on the spot.
		// in the updateBlock() function.
		
		var styleID = "color-" + color.substr(1);
		$("head").append('<style class="dynamicStyle" id="' + styleID + '"></style>');
		var rule = ''
		
		// BLOCK
		rule += '.' + styleID + ' { background-color: ' + color + '; } ';
		
		/*box-shadow: inset 0 0 0 1px '+ ColorLuminance(color, -0.3) +', inset 0 0 0 2px '+ ColorLuminance(color, -0.01) +', inset 0 0 0 4px '+ ColorLuminance(color, -0.05) + ';}';*/
		
		// SVG BORDER
		//rule += '.' + styleID + ' svg .border { stroke: '+ ColorLuminance(color, 0.25) +'; fill: '+ ColorLuminance(color, -0.45) + ' }';
		
		rule += '.' + styleID + ' svg .border { fill: '+ ColorLuminance(color, -0.65) +' }';
		rule += '.' + styleID + '.empty svg .border { opacity: 0; }';
		rule += '.' + styleID + ' svg .border2 { stroke: '+ ColorLuminance(color, 0.125) +' }';
		
		if (color !== emptyColor) {
			// SVG OUTLINE
			rule += '.' + styleID + ' svg .outline { fill: '+ ColorLuminance(color, 0.125) +'; }';
			//rule += '.' + styleID + ' svg .circleoutline { stroke: '+ ColorLuminance(color, 0.25) +'; }';
			
			// SVG BASE JEWEL
			rule += '.' + styleID + ' svg .jewel { fill: '+ color +'; animation: jewel-' + color.substr(1) +' 1s infinite alternate ease-in-out; }';
			rule += '@keyframes jewel-'+ color.substr(1) +' { 0% { opacity: 0.2; } 100% { opacity: 1; } }';
	
		}
		
		// EMPTY
		var mixed = mix(color, emptyColor, 55); // old was 35
		//var mixed2 = mix(color, emptyColor, 50);
		//mixed2 = ColorLuminance(mixed2, -0.09);
		var mixed2 = ColorLuminance(color, -0.09);
		rule += '.' + styleID + '.empty { background-color: ' + mixed + '; box-shadow: inset 0 0 0 1px '+ mixed2 +';  }';
		//rule += '.' + styleID + '.empty { box-shadow: inset 0 0 0 1px '+ mixed2 +'; }';
		
		// HOVER
		rule += '.' + styleID + ':hover:not(.nohover):not(.disabled), .' + styleID + '.highlighted { background-color: ' + ColorLuminance(mixed, 0.125) +'; cursor:pointer; }';
		
		// PRIOR
		//rule += '.prior-' + color.substr(1) + ' {  }';
		rule += '.prior-' + color.substr(1) + '::before { animation: origin-' + color.substr(1) + ' 0.25s infinite alternate; content:""; display: block; height: 100%; width: 100%; position: absolute; left: 0; top: 0; background-color: '+ hex2rgba(mix(color, '#ffffff', 50), 50) +'; box-shadow: inset 0 0 0 1px '+ ColorLuminance(color,-0.3) +', inset 0 0 0 3px '+ color +'; }';
		globals.priorColorList.push('prior-' + color.substr(1)); // global var holds all prior classes.
		
		// ANIMATION
		rule += '@keyframes origin-' + color.substr(1) +' { 0% { opacity: 0.2; } 40% { opacity: 0.25; } 60% { opacity: 0.95; } 100% { opacity: 1 } }';
		
		$("#" + styleID).append(rule);
	}
	
	
	
	
	
	
	var id = '#x' + x + 'y' + y;
	if (blockType == "blank") {
		$(id).empty().addClass('empty').css('background-color', '');
	} else if (blockType == "blockade") {
		$(id).empty().removeClass('empty').css('background-color', '#000000');
		if (duration !== false) {
			if (typeof moveNum !== 'undefined' && moveNum > 0) {
				$(id).append('<span class="duration">' + (duration) + '</span>');
			}
		}
	} else if (blockType != "blank") {
		var SVGString = getSVG8by8(blockType, 'board');
		
		// newly added mine code.
		if (blockType !== 'mine') {
			$(id).html(SVGString).removeClass('empty');
		} else {
			$(id).html(SVGString).addClass('empty');
		}
		
		if (blockType == 'ice') {
			$(id).addClass('ice');
		}
		
		/*
		if (typeof color != 'undefined') {
			if (color == emptyColor && blockType !== 'mine') {
				$(id).css('background-color', ColorLuminance(color, 0.1));
			} else {
				$(id).css('background-color', '');
			}
		}*/
		
		if (typeof possession != 'undefined') {
			if (possession.length == 0 && blockType !== 'mine') {
				$(id).css('background-color', ColorLuminance(color, 0.1));
			} else {
				$(id).css('background-color', '');
			}
		}
	}
	
	// set data attr
	$(id).data("blockType", blockType); 
	$(id).data("possession", possession); 
	$(id).data("possessionDisplayName", possessionDisplayName); 
	$(id).data("moveNum", moveNum); 
	$(id).data("x", x); 
	$(id).data("y", y); 
	$(id).data("history", history); 
	$(id).data("possessionColorSpread", possessionColorSpread);
	
	
	// NEW COLOR ENGINE WIP
	
	/*
	
	if (typeof possession !== 'undefined') {
		
		$(id).data("possessionColor", color); 
		
		// remove any prior color class
		$(id).removeClass('nocolor p1color p2color mixedcolor')
		
		if (typeof possessionColorSpread !== 'undefined') {
			if (possessionColorSpread.length > 0) {
				for (var i = 0; i < possessionColorSpread.length; i++) {
					
					var colorClass = 'color-' + possessionColorSpread[i].color.substr(1);
					var tempColor = possessionColorSpread[i].color;
					$(id).addClass('color-d5ccbd');
					if (blockType !== 'blank') {
						$(id).css('background-color', ColorLuminance(emptyColor, 0.1));
					}
					setTimeout(function(){ 
						// add the new one
						$(id).removeClass('color-d5ccbd');
						var mixed = mix(emptyColor, tempColor, 60);
						$(id).css('background-color', mixed); 
						$(id).addClass(colorClass);
						setTimeout(function() {
							$(id).css('background-color', '');
						}, 100);
					}, ((possessionColorSpread[i].layer+1) * 100) + 100);
				}
			} else {
				$(id).addClass('color-' + color.substr(1));
			}
		} else {
			$(id).addClass('color-' + color.substr(1));
		}
		if ((moveNum == globals.gameplay.moveCount) && (globals.gameplay.moveCount > 0) && (globals.gameplay.show.winstate == false)) {
			if (origin == 'collision' || origin == 'collision fade') {
				$(id).addClass("prior-collision");
			} else {
				$(id).addClass("prior-" + originColor.substr(1));
			}
		}
	}
	
	*/
	
	
	
	
	if (typeof color !== 'undefined') {
		
		$(id).data("possessionColor", color); 
		// remove any prior color class
		
		$(id).removeClass('prior-collision');
		$(id).removeClass(function (index, css) {
			return (css.match (/\bcolor-\S+/g) || []).join(' ');
		});
		
		if ($('#color-' + color.substr(1)).length < 1) {
			addNewStyle(color);
		}
		
		if (typeof possessionColorSpread !== 'undefined') {
			if (possessionColorSpread.length > 0) {
				for (var i = 0; i < possessionColorSpread.length; i++) {
					
					var colorClass = 'color-' + possessionColorSpread[i].color.substr(1);
					var tempColor = possessionColorSpread[i].color;
					$(id).addClass('color-d5ccbd');
					if (blockType !== 'blank') {
						$(id).css('background-color', ColorLuminance(emptyColor, 0.1));
					}
					setTimeout(function(){ 
						// add the new one
						$(id).removeClass('color-d5ccbd');
						var mixed = mix(emptyColor, tempColor, 60);
						$(id).css('background-color', mixed); 
						$(id).addClass(colorClass);
						setTimeout(function() {
							$(id).css('background-color', '');
						}, 100);
					}, ((possessionColorSpread[i].layer+1) * 100) + 100);
				}
			} else {
				$(id).addClass('color-' + color.substr(1));
			}
		} else {
			$(id).addClass('color-' + color.substr(1));
		}
		
		
		if ((moveNum == globals.gameplay.moveCount) && (globals.gameplay.moveCount > 0) && (globals.gameplay.show.winstate == false)) {
			if (origin == 'collision' || origin == 'collision fade') {
				//$(id).addClass("prior-" + collisionColor.substr(1));
				$(id).addClass("prior-collision");
				
				
				/*
				$(id).addClass("newMove");
				setTimeout(function(){ 
					$(id).removeClass("newMove");
				}, 1000);
				*/
			} else {
				$(id).addClass("prior-" + originColor.substr(1));
				/*
				$(id).addClass("newMove");
				setTimeout(function(){ 
					$(id).removeClass("newMove");
				}, 1000);
				*/
			}
		}
		
		/*
		if (typeof origin == 'string') {
			if ((moveNum == globals.gameplay.moveCount) && (globals.gameplay.moveCount > 0) && (globals.gameplay.show.winstate == false)) {
				if (origin == 'collision') {
					origin = collisionColor;
				}
				$(id).addClass("prior-" + origin.substr(1));
			} else {
				$(id).removeClass("prior-" + origin.substr(1));
			}
		}*/
	}
}






export function addHeading (user, name, color, elo) {
	var headingLocation = '#playerRight';
	if ($('#playerLeft').is(':empty')){
		headingLocation = '#playerLeft';
	}
	var appendString = '<div class="heading-'+user+'" style="color: ' + color + ';">' + name + ' <span style="font-weight:normal; color:white;">';
	if (elo > 0) {
		appendString += '(' + elo + ')';
	}
	appendString += '</span></div>';
	$(headingLocation).append(appendString);
}




export function menuBlockEnableDisable() {
	$(".menu_block:not(.nohover)").on('click', function() {
		if ($(this).hasClass('disabled')) {
			$(this).removeClass('disabled');
			globals.socket.emit('blocklist update', this.id, true);
		} else {
			$(this).addClass('disabled');
			globals.socket.emit('blocklist update', this.id, false);
		}
	});
}



export function renderLeaderboard(leaderData) {
	for (var i = 0; i < leaderData.length; i++) {
		$("#eloRank").append(
			'<tr><td>' + (i+1) + '</td><td style="color:' + leaderData[i].color + '">' + 
			leaderData[i].displayName + '</td><td class="alignRight">' + leaderData[i].elo + '</td></tr>'
		);
	}
}





export function renderGames(lobbyData) {
	console.log('function renderGames', lobbyData)
	
	$('#gameTypes #open').empty()
	$('#gameTypes #inprogress').empty()
	
	// RENDER GAMES!
	for (var i = 0; i < lobbyData.length; i++) {
		var gameLocation = '#' + lobbyData[i].gameState;
		var appendString = '<div class="lobbyGame" style="border: 2px ' + lobbyData[i].creatorColor + ' solid" data-gameid=' + lobbyData[i].id + '>';
		appendString += '<span class="WhoVsWho"><b>' + lobbyData[i].creator + '</b>';
		if (lobbyData[i].creatorElo > 0) {
			appendString += '&ensp;(' + lobbyData[i].creatorElo + ')';
		}
		
		if (lobbyData[i].gameType === 'practice') {
			appendString += '&emsp;<span class="dimMsg">[practice room]</span>';
		} else if (lobbyData[i].full) {
			appendString += '&emsp;<span class="dimMsg">vs</span>&emsp;<b>' + lobbyData[i].opponent + '</b>';
			if (lobbyData[i].opponentElo > 0) {
				appendString += '&ensp;(' + lobbyData[i].opponentElo + ')';
			}
		}
		appendString += '</span>'

		
		if (lobbyData[i].gameType === 'random') {
			appendString += '<span class="gameSettings">Random</span>';
		}
		
		appendString += '<div class="lobbyButtons"><span class="lobbyButton spectateGameButton">Spectate</span>';
		if (globals.isGhost == false) {
			if ((lobbyData[i].gameState !== 'inprogress') && (lobbyData[i].full == false)) {
				appendString += '<span class="lobbyButton joinGameButton">Play</span>';
			}
		}
		appendString += '</div></div>';
		$(gameLocation).append(appendString);
	}
	
	$("#open").prepend('<div class="lobbyLabel">open games:</div>');
	$("#inprogress").prepend('<div class="lobbyLabel">in progress:</div>');
	
	if (globals.isGhost == false) {
		$(".joinGameButton").on('click', function () {
			var tempID = $(this).parent().parent().data("gameid");
			
			globals.socket.emit('join game', tempID);
			// should remove click handlers here or somethin.
		});
	}
		
	$(".spectateGameButton").on('click', function() {
		var tempID = $(this).parent().parent().data("gameid");
		globals.socket.emit('join game', tempID, 'spec');
	});
	
	globals.debounce = Math.random();
	var temp = globals.debounce;
	if (globals.isGhost) {
		setTimeout(function(){ 
			var enticingGame = 'none';
			var combinedElo = -9999999;
			for (var i = 0; i < lobbyData.length; i++) {
				if ((lobbyData[i].gameState == 'open') || (lobbyData[i].gameState == 'inprogress')) {
					if ((lobbyData[i].full) && (lobbyData[i].creatorElo + lobbyData[i].opponentElo > combinedElo)) {
						if (lobbyData[i].creatorElo + lobbyData[i].opponentElo > combinedElo) {
							if (lobbyData[i].gameType !== 'practice') {
								combinedElo = lobbyData[i].creatorElo + lobbyData[i].opponentElo;
								enticingGame = i;
							}
						}
					}
				}
			}
			if (enticingGame !== 'none') {
				if (globals.debounce = temp) {
					globals.socket.emit('join game', lobbyData[enticingGame].id, 'spec');
				}
			}
		}, 3000);
	}
}






// toggles audio 




export function updateTimer(timerValue, turnCount) {
	$("#container").removeClass("timeWarning");
	if (timerValue == false) {
		$('#timer').html('Turn <b>' + turnCount + '</b>, Time <b>&infin;</b>');
	} else {
		$('#timer').html('Turn <b>' + turnCount + '</b>, Time <b>' + timerValue + '</b>');
		
		clearInterval(globals.gameplay.timer);
		// set global "globals.gameplay.timer" to a setInterval.
		globals.gameplay.timer = setInterval( function () { 
			timerValue--;
			if (timerValue == 0) {
				clearInterval(globals.gameplay.timer);
			} else if ((timerValue <= 10) && (globals.gameplay.standby == false)) {
				$('#timer').html('Turn <b>' + turnCount + '</b>, Time <b class="redMsg">' + timerValue + '</b>');
				if (timerValue == 10) {
					 $("#container").addClass("timeWarning");
				}
				
				// time running out audio
				const volume = 1 - (timerValue / 15)
				playAudio('beep', volume)
				
			} else {
				$('#timer').html('Turn <b>' + turnCount + '</b>, Time <b>' + timerValue + '</b>');
			}
		}, 1000);
	}
}





export function log(str, special) {
	if ($(".logLine").length >= 500) {
		// don't let the DOM get out of control.
		$(".logLine").first().remove();
	}
	if (special) {
		$("#log").append('<div class="logLine special">' + str + '</div>');
	} else {
		$("#log").append('<div class="logLine">' + str + '</div>');
	}
	
	const logEl = $('#log')[0]
	if(logEl != null) {
		$("#logContainer").scrollTop(logEl.scrollHeight);
	}
}