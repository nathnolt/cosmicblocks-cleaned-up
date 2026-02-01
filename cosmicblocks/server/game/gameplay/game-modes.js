const {
	gameData
} = require('../vars.js')

const {
	emptyColor
} = require('../constants.js')

const {
	updateBlock
} = require('./gameplay.js')

const {
	random_inclusive_int
} = require('../../util/util.js')

// GAME MODES
function classicMode(gameID) {
	gameData[gameID].gameType = 'classic';
	gameData[gameID].rows = 9;
	gameData[gameID].cols = 20;
	initializeBoard (gameID, gameData[gameID].rows, gameData[gameID].cols);
	updateBlock(gameID, 5, 5, "base");
	updateBlock(gameID, 16, 5, "base");
	gameData[gameID].timeLimit = 60;
	gameData[gameID].timerValue = 60;
	gameData[gameID].collisionMode = { 
		permanence: 3
	};
	gameData[gameID].blockList = {
		plus: {	ammo: false },
		cross: {ammo: false },
		arrow4: { ammo: 5 },
		arrow6: { ammo: 5 },
		arrow7: { ammo: 5 },
		arrow9: { ammo: 5 },
		//ice: { ammo: false },
		//knight: { ammo: false },
		
		oplus: { ammo: 5 },
		ocross: { ammo: 5 },
		arrow8: { ammo: 5 },
		arrow2: { ammo: 5 },
		arrow1: { ammo: 5 },
		arrow3: { ammo: 5 }
	};
	//  +  x  4  6  7  9
	// o+ ox  8  2  1  3
}
function advancedMode(gameID) {
	gameData[gameID].gameType = 'advanced';
	gameData[gameID].rows = 11;
	gameData[gameID].cols = 21;
	initializeBoard (gameID, gameData[gameID].rows, gameData[gameID].cols);
	updateBlock(gameID, 5, 6, "base");
	updateBlock(gameID, 17, 6, "base");
	
	// middle ice thing:
	/*
	updateBlock(gameID, 10, 5, "ice");
	updateBlock(gameID, 11, 5, "ice");
	updateBlock(gameID, 12, 5, "ice");
	updateBlock(gameID, 10, 6, "ice");
	updateBlock(gameID, 11, 6, "blockade");
	updateBlock(gameID, 12, 6, "ice");
	updateBlock(gameID, 10, 7, "ice");
	updateBlock(gameID, 11, 7, "ice");
	updateBlock(gameID, 12, 7, "ice");
	*/
	gameData[gameID].timeLimit = 30;
	gameData[gameID].timerValue = 30;
	gameData[gameID].blockList = {
		star: { ammo: 1 },
		plus: {	ammo: false },
		cross: { ammo: false },
		arrow4: { ammo: 2 },
		arrow6: { ammo: 2 },
		arrow7: { ammo: 2 },
		arrow9: { ammo: 2 },
		
		circle: { ammo: 2 },
		oplus: { ammo: 2 },
		ocross: { ammo: 2 },
		arrow8: { ammo: 2 },
		arrow2: { ammo: 2 },
		arrow1: { ammo: 2 },
		arrow3: { ammo: 2 }
	};
	gameData[gameID].collisionMode = { 
		permanence: 5
		// use false for no limit
	};
}

function setupgame_exMode(gameID) {
	gameData[gameID].gameType = 'ex';
	gameData[gameID].rows = 11;
	gameData[gameID].cols = 21;
	initializeBoard (gameID, gameData[gameID].rows, gameData[gameID].cols);
	updateBlock(gameID, 5, 6, "base");
	updateBlock(gameID, 17, 6, "base");
	gameData[gameID].timeLimit = 30;
	gameData[gameID].timerValue = 30;
	gameData[gameID].blockList = {
		star: { ammo: 1 },
		plus: {	ammo: 'inf' },
		cross: { ammo: 'inf' },
		arrow4: { ammo: 2 },
		arrow6: { ammo: 2 },
		arrow7: { ammo: 2 },
		arrow9: { ammo: 2 },
		reclaim: { ammo: 1 },
		
		circle: { ammo: 2 },
		oplus: { ammo: 2 },
		ocross: { ammo: 2 },
		arrow8: { ammo: 2 },
		arrow2: { ammo: 2 },
		arrow1: { ammo: 2 },
		arrow3: { ammo: 2 },
		mine: { ammo: 3 }
	};
	gameData[gameID].collisionMode = { 
		permanence: 5
		// use false for no limit
	};
}

function setupgame_practiceMode(gameID) {
	gameData[gameID].gameType = 'practice';
	gameData[gameID].rows = 11;
	gameData[gameID].cols = 21;
	initializeBoard (gameID, gameData[gameID].rows, gameData[gameID].cols);
	updateBlock(gameID, 5, 6, "base");
	updateBlock(gameID, 17, 6, "base");
	gameData[gameID].timeLimit = false;
	gameData[gameID].timerValue = false;
	gameData[gameID].blockList = {
		star: { ammo: 1 },
		plus: {	ammo: 'inf' },
		cross: { ammo: 'inf' },
		arrow4: { ammo: 2 },
		arrow6: { ammo: 2 },
		arrow7: { ammo: 2 },
		arrow9: { ammo: 2 },
		reclaim: { ammo: 1 },
		
		circle: { ammo: 2 },
		oplus: { ammo: 2 },
		ocross: { ammo: 2 },
		arrow8: { ammo: 2 },
		arrow2: { ammo: 2 },
		arrow1: { ammo: 2 },
		arrow3: { ammo: 2 },
		mine: { ammo: 3 }
	};
	gameData[gameID].collisionMode = { 
		permanence: 5
		// use false for no limit
	};
}

function setupgame_randomMode(gameID) {
	gameData[gameID].gameType = 'random';
	var quadrant = (Math.floor(Math.random() * 2));
	var p1x, p1y, p2x, p2y;
	
	function getRandomStartPos() {
		return random_inclusive_int(2, 4)
	}
	
	p1x = 1 + getRandomStartPos();
	p2x = gameData[gameID].cols - getRandomStartPos();
	if (quadrant == 0) {
		p1y = 1 + getRandomStartPos();
		p2y = gameData[gameID].rows - getRandomStartPos();
	} else if (quadrant == 1) {
		p1y = gameData[gameID].rows - getRandomStartPos();
		p2y = 1 + getRandomStartPos();
	}
	initializeBoard(gameID,gameData[gameID].rows,gameData[gameID].cols);

	function randomTerrain() {
		// get random blockType for the random board generator
		// this is just something I threw together
		// might try improving it later on

		var random = Math.round(Math.random());
		if (random) {
			var random = Math.round(Math.random());
			if (random) {
				// ~25% chance for an arrow block
				random = Math.ceil(Math.random() * 13);
				if (random == 5) {
					// unless it's a 5. then it's a jump block
					random = Math.round(Math.random());
					if (random) {
						return ('ocross');
					} else {
						return ('oplus');
					}
				} else {
					// give a random arrow block.
					if (random == 10) {
						return 'hbar';
					} else if (random == 11) {
						return 'vbar';
					} else if (random == 12) {
						return 'tlbr';
					} else if (random == 13) {
						return 'bltr';
					} else {
						return ('arrow' + random)
					}
				}
			} else {
				// it's not an arrow or ice. so give a plus or a cross.
				random = Math.round(Math.random());
				if (random) {
					return 'plus';
				} else {
					return 'cross';
				}
			}
		} else {
			return 'ice'; // half is ice
		}
	}

	// generate some terrain!
	// the 0.12 figure is used to fill up (at most) 12% of the board with terrain
	// it could be less, though, if randX & randY end up the same as a prior update.
	// i don't care too much tho, bc it's just a bit of variance in how the randomness plays out.
	for (var i = 0; i < (0.12 * gameData[gameID].rows * gameData[gameID].cols); i++) {
		var randX = Math.ceil(Math.random() * gameData[gameID].cols);
		var randY = Math.ceil(Math.random() * gameData[gameID].rows);
		var randType = randomTerrain();
		updateBlock(gameID,randX,randY,randType);
	}
	
	// clear space around bases
	updateBlock(gameID, p1x, p1y, "base");
	updateBlock(gameID, p1x - 1, p1y - 1, "blank");
	updateBlock(gameID, p1x - 1, p1y, "blank");
	updateBlock(gameID, p1x - 1, p1y + 1, "blank");
	updateBlock(gameID, p1x, p1y - 1, "blank");
	updateBlock(gameID, p1x, p1y + 1, "blank");
	updateBlock(gameID, p1x + 1, p1y - 1, "blank");
	updateBlock(gameID, p1x + 1, p1y, "blank");
	updateBlock(gameID, p1x + 1, p1y + 1, "blank");
	
	updateBlock(gameID, p2x, p2y, "base");
	updateBlock(gameID, p2x - 1, p2y - 1, "blank");
	updateBlock(gameID, p2x - 1, p2y, "blank");
	updateBlock(gameID, p2x - 1, p2y + 1, "blank");
	updateBlock(gameID, p2x, p2y - 1, "blank");
	updateBlock(gameID, p2x, p2y + 1, "blank");
	updateBlock(gameID, p2x + 1, p2y - 1, "blank");
	updateBlock(gameID, p2x + 1, p2y, "blank");
	updateBlock(gameID, p2x + 1, p2y + 1, "blank");
	
	var rand1 = random_inclusive_int(1,3);
	var rand2 = random_inclusive_int(1,3);
	var rand3 = random_inclusive_int(1,3);
	var rand4 = random_inclusive_int(1,3);
	
	gameData[gameID].blockList = {
		plus: {	ammo: 'inf' },
		cross: { ammo: 'inf' },
		arrow4: { ammo: rand1 },
		arrow6: { ammo: rand1 },
		arrow7: { ammo: rand2 },
		arrow9: { ammo: rand4 },
		
		oplus: { ammo: random_inclusive_int(1,3) },
		ocross: { ammo: random_inclusive_int(1,3) },
		arrow8: { ammo: rand3 },
		arrow2: { ammo: rand3 },
		arrow1: { ammo: rand4 },
		arrow3: { ammo: rand2 }
	};
	
	if (random_inclusive_int(1,2) == 2) { 
		gameData[gameID].blockList['reclaim'] = { ammo: (random_inclusive_int(1,2)) }
	}
	gameData[gameID].blockList['circle'] = { ammo: (random_inclusive_int(1,3)) }
	if (random_inclusive_int(1,4) !== 4) { 
		gameData[gameID].blockList['mine'] = { ammo: (random_inclusive_int(1,5)) }
	}
	if (random_inclusive_int(1,3) !== 2) { 
		gameData[gameID].blockList['star'] = { ammo: (random_inclusive_int(1,2)) }
	}
	if (random_inclusive_int(1,4) == 4) { 
		gameData[gameID].blockList['knight'] = { ammo: 1 }
	}
	
	gameData[gameID].collisionMode = { 
		permanence: 5
	};
	gameData[gameID].timeLimit = 40;
	gameData[gameID].timerValue = 40;
}






function initializeBoard(gameID, rows, cols) {
	gameData[gameID].board = [];
	function addBlockInfo(x, y) {
		gameData[gameID].board.push ({
			x:x, // x position
			y:y, // y position
			
			type: "blank", // blockType
			duration: false, // how long does this block last (used for collision mode)
			
			possession: [], // who can access this block? (socket id)
			color: emptyColor, // current block color
			possessionDisplayName: false, // display name of whoever possesses the block
			possessionSpread: {}, // order of the spread. format is playerID: int.
			possessionColorSpread: [], // another format for spread simply giving color & layer.
			
			moveNum: 0, // which turn was it placed on?
			origin: false, // who placed this block? (socket.id)
			originColor: false, // what is the hex color of the player who placed this block?
			
			history: [] // will contain cause, turn, playerDisplayName, playerColor, blockType.
		});
	}
	
	// loop thru every row and column and add the empty blocks
	for (var i = 0; i < gameData[gameID].rows; i++) {
		for (var j = 0; j < gameData[gameID].cols; j++) {
			addBlockInfo(j, i);
		}
	}
}



module.exports = {
	setupgame_practiceMode,
	setupgame_exMode,
	setupgame_randomMode,
}