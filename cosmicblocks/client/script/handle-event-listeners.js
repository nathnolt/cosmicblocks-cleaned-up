import {
	globals
} from './globals.js'

import {
	blocklist_readableNames
} from './static.js'

import { 
	resizeFunction,
	exitGame,
	log
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




// socket dependant event handlers:


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