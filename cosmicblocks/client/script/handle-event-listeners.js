import {
	globals
} from './globals.js'

import {
	blocklist_readableNames
} from './static.js'

import {
	get_linearBoardArrayPos_from_xyPos
} from './util.js'

import { 
	resizeFunction,
	exitGame,
	log,
	updateBlock,
	renderstandby
} from './subs.js'

import {
	playAudio
} from './audio.js'

import {
	audioButtonSVG
} from './static.js'


// chat toggle
$(".chat__toggle").on('click', function() {
	if ($(".chat").is(":visible")) {
		$(".chat").hide();
		$(".chat__toggle").html('&raquo;');
		
		resizeFunction();
	} else {
		$(".chat").show();
		$(".chat__toggle").html('&laquo;');
		
		resizeFunction();
	}
})
	

// audio toggle button
$('.toggleAudio').append(audioButtonSVG)

function toggleAudioIconShapes() {
	if(globals.audioEnabled) {
		$(".audioOn").show()
		$(".audioOff").hide()
	} else {
		$(".audioOn").hide()
		$(".audioOff").show()
	}
}

toggleAudioIconShapes()

// @TODO: see if I can inline this function at the start of the whole thing, once all the HTML has been inlined.
$(".toggleAudio").on("click", function() {
	if (globals.audioEnabled) {
		globals.audioEnabled = false
		log('<span class="dimMsg">Audio disabled.</span>')
		toggleAudioIconShapes()
	} else {
		globals.audioEnabled = true
		playAudio('move')
		log('<span class="dimMsg">Audio enabled.</span>')
		toggleAudioIconShapes()
	}
})


// Exit game button
$("#exit").on('click', function() {
	exitGame()
})


$( window ).resize(resizeFunction)
resizeFunction()


// join games

$('.lobby__games').on('click', ".joinGameButton", function () {
	var tempID = $(this).parent().parent().data("gameid");
	
	globals.socket.emit('join game', tempID);
	// should remove click handlers here or somethin.
})

$('.lobby__games').on('click', ".spectateGameButton", function() {
	var tempID = $(this).parent().parent().data("gameid");
	globals.socket.emit('join game', tempID, 'spec');
})



// block hover data:
$(".game__board").on({
	mouseenter: function () {
		//stuff to do on mouse enter
		var blockType = ($(this).data('blockType'));
		blockType = blocklist_readableNames[blockType] ?? blockType;
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
				const blockType = history[i].blockType
				appendString += '<div><b>' + (blocklist_readableNames[blockType] ?? blockType) + '</b>';
				if (history[i].cause == 'player') {
					appendString += ' placed by <b style="color: ' + history[i].playerColor + '">' + history[i].playerDisplayName + '</b>';
				} else {
					appendString += ' caused by <b>' + history[i].cause + '</b>';
				}
				appendString += ' on turn <b>' + history[i].turn + '</b>.</div>'
				*/
			}
		}
		
		$(".game__buttons-bottominfo").append(appendString);
	},
	mouseleave: function () {
		// this is a mouse out function for when the hover ends
		$(".game__buttons-bottominfo").html('');
	}
}, ".block"); //pass the element as an argument to .on


$(".game__menu-container").on({
	mouseenter: function () {
		//stuff to do on mouse enter
		var blockType = $(this).attr('id');
		blockType = blocklist_readableNames[blockType] ?? blockType;
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
			ammo = parseInt($('#' + blockType + '-ammo').html());
			appendString += '<div><b>' + ammo + '</b> remaining</div>';
		}
		
		/*
		if (blockType == 'star') {
			appendString += `<div>a <i>star</i>, similar to the player's <i>source</i>, spreads color to all 8 adjacent squares.</div>`;
		}
		if (blockType == 'plus') {
			appendString += `<div>a <i>+</i> is a basic block that spreads color to the 4 adjacent non-diagonal squares.</div>`;
		}
		if (blockType == 'cross') {
			appendString += `<div>an <i>x</i> is a basic block that spreads color to the 4 adjacent diagonal squares.</div>`;
		}
		if (blockType == 'circle') {
			appendString += `<div>a <i>circle</i> turns an uncircled block into a jump block. a circle may be placed on any uncircled block already on the board, 
			including blocks placed by the opponent. you may not circle a <i>source</i>, however.</div>`;
		}
		if (blockType == 'reclaim') {
			appendString += `<div>you may <i>reclaim</i> any block that you have sole possession over, including blocks placed by the opponent. 
			a reclaimed block becomes a blank space on the board, and will add to your stockpile. you cannot reclaim your <i>source</i>.</div>`;
		}
		if (blockType == 'mine') {
			appendString += `<div>a <i>stealthy mine</i> may be placed on any blank space. it is invisible to the opponent and spectators. 
			attempting to place a block where a mine is will result in a blockade being formed. mines are un-reclaimable.</div>`;
		}
		*/
		
		$(".game__buttons-bottominfo").append(appendString);
	},
	mouseleave: function () {
		// this is a mouse out function for when the hover ends
		$(".game__buttons-bottominfo").html('');
	}
}, ".menu_block"); //pass the element as an argument to .on

$(".game__menu-container").on({
	mouseenter: function () {
		
		var x = globals.gameplay.clickedCell.x
		var y = globals.gameplay.clickedCell.y
		var cols = globals.gameplay.boardSize.cols
		var rows = globals.gameplay.boardSize.rows
		
		//stuff to do on mouse enter
		if ($(this).hasClass('disabled') || (globals.menuState == false)) {
			//log ('hover failed');
		} else {
			var type = $(this).attr('id');
			var initialType = $('#x' + x + 'y' + y).data('blockType');
			// var pos = get_linearBoardArrayPos_from_xyPos(x, y, cols);
			if (type == 'circle') {
				type = getCircleType(initialType);
			}
			updateBlock (x,y,type);
			highlight(x, y, type, rows, cols); // show what moves are possible from that block
			playAudio('hover')
		}
	},
	mouseleave: function () {
		var x = globals.gameplay.clickedCell.x
		var y = globals.gameplay.clickedCell.y
		var initialType = globals.gameplay.clickedCell.type
		
		// this is a mouse out function for when the hover ends
		if ($(this).hasClass('disabled') || (globals.menuState == false)) {
			// no hover.
		} else {
			updateBlock(x,y,initialType);
			$(".highlighted").not('#x' + x + 'y' + y).removeClass("highlighted"); // remove the highlighted moves, keep the selected square highlighted though.
		}
	}
}, ".menu_block:not(.nohover)"); //pass the element as an argument to .on





$(document).on("click", function(e) {
	if ((globals.gameplay.standby == false) && (globals.menuState == true)) {
		if ($(e.target).closest(".block").length === 0) {
			if ($(e.target).closest(".menu_block:not(.nohover)").length === 0) {
				block_outsideClick();
			}
		}
	}
})

function block_outsideClick() {
	const x = globals.clickedCell.x
	const y = globals.clickedCell.y
	
	$('#x' + x + 'y' + y).removeClass('prior-' + globals.gameplay.players[globals.socket.id].color.substr(1)).removeClass('highlighted');
	$(".menu_block").addClass("disabled");
	globals.menuState = false;
	//log('<span class="dimMsg">outside click</span>');
}

function obtainID (object) {
	//this gets the ID from the object. this is hard because x/y can be 1 or 2 characters long.
	var id = $(object).attr('id');
	var index = id.indexOf("y");  // breaks the ID into two sections at the "y" symbol
	var x = parseInt(id.substr(1, index), 10); // Gets the first part as an int
	var y = parseInt(id.substr(index + 1), 10);  // Gets the second part as an int
	return [x,y];
}

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

$('.game__board').on("click", '.block', function() {
	const players = globals.gameplay.players
	
	//log(globals.gameplay.standby + " " + globals.menuState + " " + players[globals.socket.id].color);
	// if the game is active
	if (globals.gameplay.standby == false) {
		const $block = $(this)
		var xy = obtainID($block);
		var x = xy[0];
		var y = xy[1];
		globals.gameplay.clickedCell.type = $block.data('blockType')
		globals.gameplay.clickedCell.x = x
		globals.gameplay.clickedCell.y = y
		
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
				let initialType = $('#x' + x + 'y' + y).data('blockType');
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

/* @TODO: this won't work anymore. Change this into a delegate with a combination of mouseover and mouseout (I think at least) */ 
$(  ".block" ).hover(function() {
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




/*
// hover over a menu block
$(".game__menu-container").on("mouseover", ".menu_block:not(.nohover)", function() {
//$( ".menu_block:not(.nohover)" ).hover(function() {
	if ($(this).hasClass('disabled') || (globals.menuState == false)) {
		//log ('hover failed');
	} else {
		type = $(this).attr('id');
		initialType = $('#x' + x + 'y' + y).data('blockType');
		var pos = get_linearBoardArrayPos_from_xyPos(x, y, cols);
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

// when a menu block is clicked, after you highlighted a cell, and such.
// Aka: this actually builds the block.
$('.game__menu-container').on("click", ".menu_block:not(.nohover)", function() {
	//$('.menu_block:not(.nohover)').on("click",function() {
	const menuAndGameActive = globals.menuState == true && globals.gameplay.standby == false
	if(!menuAndGameActive) {
		return
	}
	
	// menu and game are both active
	if ($(this).hasClass('disabled')) {
		outsideClick();
	} else {
		renderstandby();
		var type = $(this).attr('id');
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
		
		const x = globals.gameplay.clickedCell.x
		const y = globals.gameplay.clickedCell.y
		// moveCount to check if it was placed at the last split second before the turn: returns invalid move.
		globals.socket.emit('attempt move', x, y, type, globals.gameplay.moveCount); 
	}
	
});

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



//--------------------------------------
//
// socket dependant event handlers:
//
//--------------------------------------

// Handle sending chat messages
$(".chat__form").on('submit', function(e) {
	e.preventDefault()
	// get the message from the input
	let chatMessage = $(".chat__input").val().trim()
	
	// clear the input
	$(".chat__input").val('')
	
	// send the message
	if(chatMessage != '') {
		globals.socket.emit('send chat message', chatMessage)
	}
	
})







// send the server new game command
$('#newgame').on("click",function() {
	globals.socket.emit('new game')
})

// send the server new game [random board] command
$('#randgame').on("click",function() {
	globals.socket.emit('new game', 'random')
})

$('#practice').on("click",function() {
	globals.socket.emit('practice mode')
})

$("#rerollColor").on('click', function() {
	globals.socket.emit('attempt color reroll');
})


// handle game ready button
$("#ready").on('click', function() {
	
	const $btn = $(this)
	if ($btn.hasClass("notready")) {
		globals.socket.emit('ready');
		$btn.html('Unready').removeClass('notready');
	} else {
		globals.socket.emit('not ready');
		$btn.html('Ready Up').addClass('notready');
	}
	
	/*
	if ($(this).hasClass("unbound")) {
		log('<span class="redMsg">cannot ready as spectator</span>');
	} else {
		if ($(this).hasClass("notready")) {
			socket.emit('ready');
			$(this).html('Unready').removeClass('notready');
		} else {
			socket.emit('not ready');
			$(this).html('Ready Up').addClass('notready');
		}
	}
	*/
})


$("#rematch").on('click', function() {
	globals.socket.emit('offer-rematch')
	
	console.log('@TODO: fix the rematch button text. Make the system more robust.')
	/*
	$("#rematch").off()
	$("#rematch > span").text("Offered Rematch").addClass("blinkText")
	*/
})

$("#forfeit").on("click",function() {
	globals.socket.emit('forfeit')
})