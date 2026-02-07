import {
	emptyColor,
	blocklist_readableNames,
	svg_block_map,
	svg_block_border,
	svg_block_header,
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
		$(".app-container").removeClass("timeWarning");
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
				$(".game__buttons").prepend('<div class="buttonStyle" id="reset">Reset</div>');
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
		
		$(".game__menu-container").on({
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
		$(".game__menu-container").on("mouseover", ".menu_block:not(.nohover)", function() {
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
		$('.game__menu-container').on("click", ".menu_block:not(.nohover)", function() {
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
	$(".app-container").removeClass("timeWarning");
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

	$(".block", ".game__board").addClass('disabled').off();
	for (var i = 0; i < globals.priorColorList.length; i++) {
		$(".block").removeClass(globals.priorColorList[i]); // this is longer than it needs to be for each game, oh well maybe fix later.
	}
	$(".highlighted").removeClass('highlighted');
	//$(".game__menu").css('opacity', '0.5'); // dim the menu
	//$(".game__menu-container").off();
	$(".menu_block").addClass('disabled');
	
	// $("#offerDraw").remove();
	// $("#forfeit").remove();
	
	$(".moveStatus").remove(); // remove the move status
	$("#timer").remove();
	$(".waitMsg").parent().remove();
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
	$(".app-container").removeClass("timeWarning");
	clearInterval(globals.gameplay.timer);
	$(".waitMsg").parent().remove();
	globals.gameplay.show.winstate = false;
	globals.socket.emit('exit to lobby');
}



export function buildEmptyBoard(rows, cols) {
	// clear the board
	$(".game__board").empty()
	
	const gameboardEl = $(".game__board").get(0)
	gameboardEl.style.setProperty('--rows', rows)
	gameboardEl.style.setProperty('--cols', cols)
	
	// begin building the physical board (as <div>s)
	for (var i = 0; i < rows; i++) {
		var buildstring = '<div class="board_row">';
		for (var j = 0; j < cols; j++) {
			// blocks start as empty blocks
			buildstring += '<div id="x' + (j+1) + 'y' + (i+1) + '" class="block empty"></div>';
		}
		buildstring += '</div>';
		$(".game__board").append(buildstring);
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
		$('.chat').css('width', initialWidth + 'px');
		$('#leaderboard').css('width', initialWidth + 'px');
	}
	
	
	if ($(".game__menu-container").length > 0) {
		menuResize();
	}
	
	if ($(".game__board").length > 0) {
		sizeBoard();
	}
	
	if ($("#blockListEditor").length > 0) {
		let hWidth = hSpace();
		$("#blockListEditor").css('width', hWidth);
	}
	
}




function sizeBoard() {
	
	console.log('sizeBoard return')
	return
	
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
	
	$(".game__board").css('width', boardWidth);
	$(".game__board").css('height', boardHeight);
	$(".board_row").css('height', blockSize);
	$(".block").css('width', blockSize);
	$(".block").css('height', blockSize);
}



export function buildBlockMenu (blockList) {
	$(".game__menu").empty();
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
	$('.game__menu').append(buildString);
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
	//$(".game__menu").css('width', horizontalSpace * 0.8);
}


function hSpace () {
    // for board/menu sizing.
	let horizontalSpace = $(window).width();
	if ($(".chat").is(":visible")) {
		horizontalSpace -= $(".chat").width();
	}
	return horizontalSpace;
}
function vSpace () {
	let verticalSpace = $(window).height() - 38 - $(".game__menu-container").height() - 10; // 38 is $(".game__header").height() but hardcoded for now.
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
	
	if(blockType === 'blank') {
		return ''
	}
	
	let SVGString = svg_block_header + svg_block_map[blockType] + svg_block_border
	
	// @TODO: find out what this is.
	if (!(blockType === 'mine' && where === 'board')) {
		SVGString += '<rect class="border2" x="2.5" y="2.5" fill="none" stroke-width="1.5" width="75" height="75"/>';
	}
	
	SVGString += '</svg>'
	
	return SVGString
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
	var headingLocation = '.game__player-right';
	if ($('.game__player-left').is(':empty')){
		headingLocation = '.game__player-left';
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
	$("#eloRank").empty()
	
	for (var i = 0; i < leaderData.length; i++) {
		$("#eloRank").append(
			'<tr><td>' + (i+1) + '</td><td style="color:' + leaderData[i].color + '">' + 
			leaderData[i].displayName + '</td><td class="alignRight">' + leaderData[i].elo + '</td></tr>'
		);
	}
}





export function renderGames(lobbyData) {
	console.log('function renderGames', lobbyData)
	
	$('.lobby__games-open').empty()
	$('.lobby__games-in-progress').empty()
	
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
	
	$(".lobby__games-open").prepend('<div class="lobbyLabel">open games:</div>');
	$(".lobby__games-in-progress").prepend('<div class="lobbyLabel">in progress:</div>');
	
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
	$(".app-container").removeClass("timeWarning");
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
					 $(".app-container").addClass("timeWarning");
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
		$(".chat__contents").append('<div class="logLine special">' + str + '</div>');
	} else {
		$(".chat__contents").append('<div class="logLine">' + str + '</div>');
	}
	
	const logEl = $('.chat__contents')[0]
	if(logEl != null) {
		$(".chat__scrollwrapper").scrollTop(logEl.scrollHeight);
	}
}