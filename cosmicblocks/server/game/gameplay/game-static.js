// finds out where each block can move to
// base, star, and various others aren't used right now.
// I will add more blocks later too, such as the knight block.
// I want to also add ice block, which is complex...
// I'll have to figure out not only which squares can be accessed
// but also which direction the player came from...
const blocklist_moves = {
	'base': [[-1,-1], [0,-1], [1,-1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]],
	'star': [[-1,-1], [0,-1], [1,-1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]],
	'ostar': [[-2,-2], [0,-2], [2,-2], [-2, 0], [2, 0], [-2, 2], [0, 2], [2, 2]],
	'plus': [[0,-1], [-1, 0], [1, 0], [0, 1]],
	'oplus': [[0,-2], [-2, 0], [2, 0], [0, 2]],
	'cross': [[-1,-1], [1,-1], [-1, 1], [1, 1]],
	'ocross': [[-2,-2], [2,-2], [-2, 2], [2, 2]],
	'hbar': [[-1, 0], [1, 0]],
	'ohbar': [[-2, 0], [2, 0]],
	'vbar': [[0, -1], [0, 1]],
	'ovbar': [[0, -2], [0, 2]],
	'tlbr': [[-1, -1], [1, 1]],
	'otlbr': [[-2, -2], [2, 2]],
	'bltr': [[-1, 1], [1, -1]],
	'obltr': [[-2, 2], [2, -2]],
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
	'blockade': [[]],
	'blank': [[]],
	'mine': [[]],
	'reclaim': [[]],
	'ice': [[]],
	'knight': [[1, 2], [2, 1], [-1, 2], [2, -1], [1, -2], [-2, 1], [-1, -2], [-2, -1]]
}

module.exports = {
	blocklist_moves,
}