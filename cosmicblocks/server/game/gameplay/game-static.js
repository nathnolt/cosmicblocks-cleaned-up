// finds out where each block can move to
// base, star, and various others aren't used right now.
// I will add more blocks later too, such as the knight block.
// I want to also add ice block, which is complex...
// I'll have to figure out not only which squares can be accessed
// but also which direction the player came from...



// @TODO: figure out if it's x, y or y, x   - and figure out if -1 means above or below for Y.
const blocklist_moves = {
	
	// base is your base, aka, where you start and what the capture goal is.
	'base': [
		[-1,-1], [ 0,-1], [ 1,-1], 
		[-1, 0],          [ 1, 0],
		[-1, 1], [ 0, 1], [ 1, 1]
	],
	
	// star is the one that combines plus and cross
	'star': [
		[-1,-1], [ 0,-1], [ 1,-1], 
		[-1, 0],          [ 1, 0], 
		[-1, 1], [ 0, 1], [ 1, 1]
	],
	'ostar': [
		[-2,-2], 
		[0,-2], 
		[2,-2], 
		[-2, 0], 
		[2, 0], 
		[-2, 2], 
		[0, 2], 
		[2, 2]
	],
	
	// plus
	'plus': [
		        [0,-1], 
		[-1, 0],       [1, 0], 
		        [0, 1]
	],
	'oplus': [
		              [0,-2], 
		
		[-2, 0],      /* B */       [2, 0], 
		
		              [0, 2]
	],
	
	// cross
	'cross': [
		[-1,-1],           [1,-1], 
		         // block
		[-1, 1],            [1, 1]],
	'ocross': [
		[-2,-2],        [2,-2], 
		       // block
		[-2, 2],        [2, 2]
	],
	
	// horizontal
	'hbar': [[-1, 0], [1, 0]],
	'ohbar': [[-2, 0], [2, 0]],
	
	// vertical
	'vbar': [[0, -1], [0, 1]],
	'ovbar': [[0, -2], [0, 2]],
	
	// top left bottom right
	'tlbr': [[-1, -1], [1, 1]],
	'otlbr': [[-2, -2], [2, 2]],
	
	// bottom left top right
	'bltr': [[-1, 1], [1, -1]],
	'obltr': [[-2, 2], [2, -2]],
	
	
	// 1 2 3
	// 4 - 6
	// 7 8 9
	'arrow1': [[-1, 1]],
	'arrow11': [[-2, 2]],
	'arrow2': [[0, 1]],
	'arrow22': [[0, 2]],
	'arrow3': [[1, 1]],
	'arrow33': [[2, 2,]],
	'arrow4': [[-1, 0]],
	'arrow44': [[-2, 0]],
	'arrow6': [[1, 0]],
	'arrow66': [[2, 0]],
	'arrow7': [[-1, -1]],
	'arrow77': [[-2, -2]],
	'arrow8': [[0, -1]],
	'arrow88': [[0, -2]],
	'arrow9': [[1, -1]],
	'arrow99': [[2, -2,]],
	
	// squares which don't capture anything
	'blockade': [[]],
	'blank': [[]],
	'mine': [[]],
	'reclaim': [[]],
	'ice': [[]],
	
	// special thing
	'knight': [
		[1, 2], 
		[2, 1], 
		[-1, 2], 
		[2, -1], 
		[1, -2], 
		[-2, 1], 
		[-1, -2], 
		[-2, -1]
	]
}

const blocklist_readableNames = {
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

const blocklist_circled = {
	star: 'ostar',
	plus: 'oplus',
	cross: 'ocross',
	
	// horizontal vertical
	hbar: 'ohbar',
	vbar: 'ovbar',
	
	// diagonals
	tlbr: 'otlbr',
	bltr: 'obltr',
	
	// arrows
	arrow1: 'arrow11',
	arrow2: 'arrow22',
	arrow3: 'arrow33',
	arrow4: 'arrow44',
	arrow6: 'arrow66',
	arrow7: 'arrow77',
	arrow8: 'arrow88',
	arrow9: 'arrow99',
}

const blocklist_circleable = Object.keys(blocklist_circled)

module.exports = {
	blocklist_moves,
	blocklist_readableNames,
	blocklist_circled,
	blocklist_circleable
}