function renderRoomTitle(title) {
	$("#sidebar").prepend('<div id="roomTitle"><span>' + title + '</span></div>');
	$("body").append('<span id="titleWidth">'+ title +'</span>')
	let width = $("#titleWidth").width();
	$("#titleWidth").remove();
	let maxwidth = 211; // sidebar width minus margin... minus one.
	let ratio = maxwidth / width;
	if (ratio <= 1) {
		$("#roomTitle > span").css('transform', 'scale(' + ratio +',1)');
	}
}

function addHeadingOld (user, name, color, x) {
	var blockWidth = $('.block').width();
	var marginLeft = blockWidth * (x - 1);
	$("#gameHead").append('<div class="heading-'+user+'" style="left: '+ marginLeft +'px; color: ' + color + ';">' + name + '</div>');
	var textWidth = $('.heading-' + user).width() + 40; // 40 for the padding;
	var difference = textWidth - $('.block').width();
	var marginLeft = marginLeft - (difference / 2);
	$('.heading-' + user).css('left', marginLeft);
}


// was originally within
// socket.on('setup game', function
function creatorSettings() {
	if(joinStatus != 'creator') {
		return
	}
	

	// TIME LIMIT
	$("#timeLimit").addClass('creatorHighlight');
	$("#timeLimit").on('click', function() {
		socket.emit('time limit setting', 'infin');
	});
	$("#timeLimitContainer").append('<div class="plusMinusButtons"><span id="moreTime" class="greenMsg">[+]</span><span id="lessTime" class="redMsg">[&minus;]</span></div>');
	$('#moreTime').on('click', function() {
		socket.emit('time limit setting', 'more');
	});
	$('#lessTime').on('click', function() {
		socket.emit('time limit setting', 'less');
	});
	
	// COLLISION PERMANENCE
	$("#collisionSetting").addClass('creatorHighlight');
	$("#collisionSetting").on('click', function() {
		if ($(this).html() == 'Permanent') {
			socket.emit('collision setting', 5);
		} else {
			var collisionTurnCount = parseInt($(".collisionTurnCount").html());
			if (collisionTurnCount == 5) {
				socket.emit('collision setting', 'Permanent');
			}
			//else {
			//	socket.emit('collision setting', collisionTurnCount + 1);
			//}
		}
	});
	
	// CLASSIC
	//$("#sidebar").append('<div class="sideButton" id="classic">Classic</div>');
	$("#classic").on('click', function() {
		socket.emit('classic mode');
	});
	
	// ADVANCED
	//$("#sidebar").append('<div class="sideButton" id="circlemode">Advanced</div>');
	$("#circlemode").on('click', function() {
		socket.emit('advanced mode');
	});
	
	// RANDOMIZE
	//$("#sidebar").append('<div class="sideButton" id="randomize">Randomize</div>');
	$("#randomize").on('click', function (){
		socket.emit('randomize');
	});
	
	// BOARD EDITOR
	//$("#sidebar").append('<div class="sideButton" id="boardEditor">Board Editor</div>');
	$("#boardEditor").on('click', function() {
		$("#sidebar > *:not('#roomTitle')").remove();
		//$("#sidebar > *:not('#roomTitle')").css('display','none');
		$("#sidebar").append('<div class="sideButton" id="doneEditingBlockList">Done Editing</div>');
		/*
		$("#sidebar").append('<div>Cols: <span id="numCols">' + cols + '</span><div class="rowcolButtons"><span id="moreCols" class="greenMsg">[+]</span><span id="lessCols" class="redMsg">[&minus;]</span></div>');
		$("#sidebar").append('<div>Rows: <span id="numRows">' + rows + '</span><div class="rowcolButtons"><span id="moreRows" class="greenMsg">[+]</span><span id="lessRows" class="redMsg">[&minus;]</span></div>');
		let minRows = 5;  // I suppose these should have come from the server
		let maxRows = 20; // cause I'll wanna validate their legitness later on server.
		let minCols = 7;
		let maxCols = 30;
		let greyOut = "#888";
		
		$("#lessRows").on("click",function() {
			if (rows > minRows) {
				rows--;
				customUpdate();
				if (rows == minRows) { $("#lessRows").css('color', greyOut); }
				if (rows == maxRows - 1) { $("#moreRows").css('color', ''); }
			}
		});
		
		$("#moreRows").on("click",function() {
			if (rows < maxRows) {
				rows++;
				customUpdate();
				if (rows == minRows + 1) { $("#lessRows").css('color', ''); }
				if (rows == maxRows) { $("#moreRows").css('color', greyOut); }
			}
		});
		
		$("#lessCols").on("click",function() {
			if (cols > minCols) {
				cols--;
				customUpdate();
				if (cols == minCols) { $("#lessCols").css('color', greyOut); }
				if (cols == maxCols - 1) { $("#moreCols").css('color', ''); }
			}
		});
		
		$("#moreCols").on("click",function() {
			if (cols < maxCols) {
				cols++;
				customUpdate();
				if (cols == minCols + 1) { $("#lessCols").css('color', ''); }
				if (cols == maxCols) { $("#moreCols").css('color', greyOut); }
			}
		});
		
		function customUpdate() {
			$("#numRows").html(rows);
			$("#numCols").html(cols);
			rebuildBoard(rows, cols);
			socket.emit('update board size', rows, cols);
		}
		*/
		
		
		$("#doneEditingBlockList").on('click', function() {
			//$("blockListEditor").remove();
			$(".block").off();
			$(".menu_block").off();
			socket.emit('done editing');
		});
		
		let boardEditorBlockList = {
			'blank' : { ammo: false },
			'blockade' : { ammo: false },
			'ice' : { ammo: false }
		};
		
		buildBlockMenu(boardEditorBlockList);
		var currentType = 'blank';
		
		$("#blank").addClass('active');
		$("#blockade").css('background', '#000');
		
		$("#menu").on('click', '.menu_block', function() {
			if (!($(this).hasClass('active'))) {
				$('.active').removeClass('active');
				$(this).addClass('active');
				currentType = $(this).attr('id');
				log ('now painting with ' + currentType);
			}
		});
		$("#board").on('click', '.block', function () {
			let xy = obtainID($(this));
			let x = xy[0];
			let y = xy[1];
			let blockType = $(this).data("blockType");
			if (blockType != currentType && (blockType != 'base')) {
				updateBlock(x,y,currentType);
				socket.emit('board edit', x, y, currentType);
			}
		});
	});
	
	// BLOCKLIST EDITOR
	//$("#sidebar").append('<div class="sideButton" id="blockListEditorBtn">BlockList Editor</div>');
	$("#blockListEditorBtn").on('click', function() {
		$("#sidebar > *:not('#roomTitle')").remove();
		//$("#sidebar > *:not('#roomTitle')").css('display','none');
		$("#sidebar").append('<div class="sideButton" id="doneEditingBlockList">Done Editing</div>');
		$("#doneEditingBlockList").on('click', function() {
			//$("blockListEditor").remove();
			socket.emit('done editing');
		});
		//$("#headBoardContainer").remove();
		$("#headBoardContainer").css('display','none');
		let hWidth = hSpace();
		$("#container").append('<div id="blockListEditor" style="width: '+ hWidth +'px"></div>');
		
		let fullSet = [
			'plus',
			'oplus',
			'cross',
			'ocross',
			'arrow1',
			'arrow2',
			'arrow3',
			'arrow4',
			'arrow6',
			'arrow7',
			'arrow8',
			'arrow9',
			'arrow11',
			'arrow22',
			'arrow33',
			'arrow44',
			'arrow66',
			'arrow77',
			'arrow88',
			'arrow99',
			'hbar',
			'vbar',
			'tlbr',
			'bltr',
			'ohbar',
			'ovbar',
			'otlbr',
			'obltr',
			'star',
			'ostar',
			'ice',
			'knight',
			'circle'
		];
		
		let blockListForEditor = {};
		for (var i = 0; i < fullSet.length; i++) {
			let block = fullSet[i];
			if (typeof blockList[block] === 'undefined') {
				blockListForEditor[block] = false;
			} else {
				if (blockList[block].ammo == false) { // if ammo is unlimited
					blockListForEditor[block] = true; // set true in the list
					// I know this is kinda wonky, w/e.
				} else {
					blockListForEditor[block] = blockList[block].ammo;
				}
			}
		}
		
		/*
		for (block in blockList) {
			if (!(fullSet.indexOf(block) > -1)) {
			// if it doesn't exist
				blockListForEditor[block] = false;
			} else {
				if (blockList[block].ammo == false) { // if ammo is unlimited
					blockListForEditor[block] = true; // set true in the list
					// I know this is kinda wonky, could fix this mess later.
				} else {
					blockListForEditor[block] = blockList[block].ammo;
				}
			}
		}
		*/
		
		/*
		let blockListForEditor = {
			//'blank' : false,
			//'blockade' : false,
			//'base' : false,
			'ice' : false,
			'circle' : false,
			'knight' : false,
			'star' : false,
			'ostar' : false,
			'plus' : true,
			'oplus' : true,
			'cross' : true,
			'ocross' : true,
			'hbar': false,
			'ohbar': false,
			'vbar' : false,
			'ovbar' : false,
			'tlbr' : false,
			'otlbr' : false,
			'bltr' : false,
			'obltr' : false,
			'arrow1' : true,
			'arrow11' : false,
			'arrow2' : true,
			'arrow22' : false,
			'arrow3' : true,
			'arrow33' : false,
			'arrow4' : true,
			'arrow44' : false,
			'arrow6' : true,
			'arrow66' : false,
			'arrow7' : true,
			'arrow77' : false,
			'arrow8' : true,
			'arrow88' : false,
			'arrow9' : true,
			'arrow99' : false
		};
		*/
		
		for (block in blockListForEditor) {
			let blockSVGString = getSVG8by8(block);
			let appendString = '<div class="blockInfoContainer"><div class="blockInList';
			if (blockListForEditor[block] === false) {
				appendString += ' disabled';
			}
			if (block === 'blockade') {
				appendString += '" style="background-color:#000';
			}
			appendString += '" data-blockType="'+ block +'">' + blockSVGString + '</div><br/><span data-blockType="'+ block +'">&minus;</span><span ';
			
			if (blockListForEditor[block] === false) {
				appendString += 'style="color:#777">0';
			} else if (blockListForEditor[block] === true) {
				appendString += '>&infin;';
			} else {
				appendString += '>' + blockListForEditor[block];
			}
			
			appendString += '</span><span data-blockType="'+ block +'">+</span></div>';
			$("#blockListEditor").append(appendString);
		}
		
		$(".blockInList").on('click', function(evt) {
			blockType = ($(this).attr('data-blockType'));
			let blockDisabled = false;
			if ($(this).hasClass('disabled')) {
				blockDisabled = true;
			}
			socket.emit('blocklist update', blockType, blockDisabled);
			blockDisabled = !blockDisabled;
			if (blockDisabled) {
				$(this).addClass('disabled');
				$(this).siblings("span:nth-of-type(2)").html('0').css('color', '#777');
			} else {
				$(this).removeClass('disabled');
				$(this).siblings("span:nth-of-type(2)").html('&infin;').css('color', '');
			}
		});
		
		var maxAmmo = 20;
		$(".blockInfoContainer > span:nth-of-type(1)").on('click', function(evt) {
			// subtracting
			let value = $(this).siblings("span:nth-of-type(2)").html();
			if (parseInt(value) !== 0) {
				let blockType = $(this).attr("data-blockType");
				if (value == '\u221E') { // if &infin;
					value = maxAmmo;
				} else {
					if (parseInt(value) === 1) {
						value = '&infin;';
					} else {
						value = (parseInt(value) - 1);
					}
				}
				$(this).siblings("span:nth-of-type(2)").html(value);
				socket.emit('ammo update', blockType, value);
			}
		});
		$(".blockInfoContainer > span:nth-of-type(3)").on('click', function(evt) {
			// adding
			let value = $(this).siblings("span:nth-of-type(2)").html();
			if (parseInt(value) !== 0) {
				let blockType = $(this).attr("data-blockType");
				if (value == '\u221E') { //if &infin;
					value = 1;
				} else {
					if (parseInt(value) === maxAmmo) {
						value = '&infin;';
					} else {
						value = (parseInt(value) + 1);
					}
				}
				$(this).siblings("span:nth-of-type(2)").html(value);
				socket.emit('ammo update', blockType, value);
			}
		});
		
		/*
		$("#blockListEditor").on('click', function(evt) {
			if (evt.target === document.getElementById("blockListEditor")) {
				// didn't click relevant area
			} else {
				let parentElement = evt.target.parentNode;
				while (!$(parentElement).hasClass("blockInList")) {
					parentElement = parentElement.parentNode;
				}
				let blockType = ($(parentElement).attr('data-blockType'));
				let blockDisabled = false;
				if ($(parentElement).hasClass('disabled')) {
					blockDisabled = true;
				}
				socket.emit('blocklist update', blockType, blockDisabled);
				blockDisabled = !blockDisabled;
				if (blockDisabled) {
					$(parentElement).addClass('disabled');
					$(parentElement).siblings("span:nth-of-type(2)").html('0').css('color', '#777');
				} else {
					$(parentElement).removeClass('disabled');
					$(parentElement).siblings("span:nth-of-type(2)").html('&infin;').css('color', '');
				}
			}
		});
		*/
	});
	
	/*
	//$("#sidebar").append('<div class="sideButton" id="customize">Customize</div>');
	$("#customize").on('click', function (){
		$("#customize").off();
		
		// change board size (rows/cols)
		$("#sidebar").append('<div>Cols: <span id="numCols">' + cols + '</span><div class="rowcolButtons"><span id="moreCols" class="greenMsg">[+]</span><span id="lessCols" class="redMsg">[&minus;]</span></div>');
		$("#sidebar").append('<div>Rows: <span id="numRows">' + rows + '</span><div class="rowcolButtons"><span id="moreRows" class="greenMsg">[+]</span><span id="lessRows" class="redMsg">[&minus;]</span></div>');
		let minRows = 5;  // I suppose these should have come from the server
		let maxRows = 20; // cause I'll wanna validate their legitness later on server.
		let minCols = 7;
		let maxCols = 30;
		let greyOut = "#888";
		
		$("#lessRows").on("click",function() {
			if (rows > minRows) {
				rows--;
				customUpdate();
				if (rows == minRows) { $("#lessRows").css('color', greyOut); }
				if (rows == maxRows - 1) { $("#moreRows").css('color', ''); }
			}
		});
		
		$("#moreRows").on("click",function() {
			if (rows < maxRows) {
				rows++;
				customUpdate();
				if (rows == minRows + 1) { $("#lessRows").css('color', ''); }
				if (rows == maxRows) { $("#moreRows").css('color', greyOut); }
			}
		});
		
		$("#lessCols").on("click",function() {
			if (cols > minCols) {
				cols--;
				customUpdate();
				if (cols == minCols) { $("#lessCols").css('color', greyOut); }
				if (cols == maxCols - 1) { $("#moreCols").css('color', ''); }
			}
		});
		
		$("#moreCols").on("click",function() {
			if (cols < maxCols) {
				cols++;
				customUpdate();
				if (cols == minCols + 1) { $("#lessCols").css('color', ''); }
				if (cols == maxCols) { $("#moreCols").css('color', greyOut); }
			}
		});
		
		function customUpdate() {
			$("#numRows").html(rows);
			$("#numCols").html(cols);
			rebuildBoard(rows, cols);
			socket.emit('update board size', rows, cols);
		}
	
	});
		*/
		
	//$(".menu_block").removeClass('disabled');
	
	// UPDATE BLOCKLIST:
	//menuBlockEnableDisable();
	
	// change blocklist, and ammo
	// change start position
	// change time limit (inc. infinite)
	// change start positions and terrain
	// choose to spectate or play
	// choose color
	// ready up
	
	// when you edit anything
	// it sends the change to the server
	// and updates it on everyone else in the room
	// and maybe unreadies them, like worms


}


function updateStyles(p1hex, p2hex) {
	// this will be called when a player joins a game or when you join a game,
	// or when you click a button to swap to default/custom colors,
	var mixed = mix(p1hex, p2hex, 50);
	updateStyle('p1color', p1hex);
	updateStyle('p2color', p2hex);
	updateStyle('mixedcolor', mixed);
}

function menuHideBlocksAndResize () {
	$(".menu_block.disabled").addClass('nohover').css('opacity', 0);
	menuResize();
}


/* function changeFavIcon(src) {
	$('link[rel="shortcut icon"]').attr('href', src + '?v=' + Date.now());
	//$('link[rel="shortcut icon"]').attr('href', src);
}
*/