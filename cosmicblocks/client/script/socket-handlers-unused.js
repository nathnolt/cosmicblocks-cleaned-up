/* unused
socket.on('choose name', function(userID) {
	$("#flexcontainer").append('<div style="color:white; margin: auto auto;">What is your name?<div id="nameEntry"><form id="nameform"><input id="ne" type="text" maxlength="16" value="' + userID + '" autocomplete="off" /><button id="sendName">Send</button></form></span></div>');
	$("#ne").mousedown('mousedown', function() {
		$("#ne").off('mousedown').val(''); // first time you click, empty the default name.
	});
	
	let name = $("#ne").val();
	$("#ne").keyup(function() {
		keyPress();
	});
	$("#ne").keypress(function() {
		keyPress();
	});
	function keyPress() {
		if (name != $("#ne").val()) { // if the name has been updated
			name = $("#ne").val(); // set it
			name = name.replace(/\s+/g, ' '); // remove multi spaces
			if (name.charAt(0) == ' ') {
				name = name.substr(1); // remove initial space
			}
			$("#ne").val(name); // update input value
		}
	}
	
	// when the button is clicked, say if it is a valid name or not!
	$("#sendName").on('click', function(e) {
		e.preventDefault();
		name = $("#ne").val();
		name = $.trim(name); // for remove trailing spaces.
		name = name.replace(/\s+/g, ' ');
		$("#ne").val(name);
		
		if (name.search(/^[\w\-\s]+$/) == -1) {
			log('<span class="redMsg">invalid name</span>');
		} else {
			//log('valid name "' + name + '"');
			$("#flexcontainer").empty();
			socket.emit('name chosen', name);
			$(".app-container").append('<div id="username">' + name + '</div>');
		}
	});
});
*/



/*
	socket.on('render lobby user data', function(lobbyUserData) {
		//$(".app-container").css('background-color', lobbyUserData.color); //experimental
		var appendString = '<div class="lobbyName" style="color: ' + lobbyUserData.color + '">'+ lobbyUserData.username +'</div>';
		if (lobbyUserData.gamesPlayed !== 0) {
			appendString += '<ul id="lobbyUserData">';
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
			
			if (lobbyUserData.elo != -99999) {
				appendString += '<li>Elo<span class="stat">' + Math.round(lobbyUserData.elo) + '</span></li>';
			}
			appendString += '</ul>';
		}
		$("#sidebar").prepend(appendString);
		if (lobbyUserData.remainingRerolls !== 0) {
			$("#sidebar").append('<div class="sideButton" id="rerollColor">New Color</div>');
			$("#rerollColor").on('click', function() {
				socket.emit('attempt color reroll');
			});
		}
	});
	*/
	
	/*	function baseChosen(gameID, pnum) {
		// this is a waiting function
		$(".p1base").off();
		$(".p2base").off();
		$("#chooseBase").remove();
		console.log ("player chose base " + pnum);
		socket.emit('base chosen', gameID, pnum);
	}
	*/
	
	/*	socket.on('opponent disconnected', function() {
		log('<span style="color:red">opponent disconnected</span>');
		opponentdisconnectedAudio.play();
	});
	*/
	/*
	socket.on('game over', function(winner, reason) {
		log(winner + ' wins because of ' + reason + '.');
		cleanup(winner, reason);
	});
	*/