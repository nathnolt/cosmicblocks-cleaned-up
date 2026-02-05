export const globals = {
	audioEnabled: true,
	
	// this will hold all the colors used for highlighting with the .prior-* class.
	priorColorList: [],
	socket: null,
	
	mySocketID: null,
	isGhost: null,
	
	// are you a player
	isPlayer: false,
	name: '',
	// used for checking if renderGames function was run multiple times for ghostFlow delay....
	debounce: null,
	
	
	// is the menu disabled?
	menuState: null,
	
	// what turn is it
	gameplay: {
		moveCount: null,
		timer: null,
		
		// who u playin against
		opponents: [], 
		
		// should the winState be shown?
		show: {
			winstate: false,
		},
		
		// waiting for other player
		standby: null,
	},
}