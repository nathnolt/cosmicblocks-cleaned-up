

// this is the empty block color passed in from server later on
export const emptyColor = "#d5ccbd"

export const audioButtonSVG = document.querySelector('#audio-button').innerHTML.trim()

export {
	blocklist_readableNames,
	blocklist_moves,
	getCircleType,
} from '/shared/game-static.js'




import {
	svg_block_header,
	svg_block_circled,
	svg_block_star,
	svg_block_base_jewel,
	svg_block_plus,
	svg_block_cross,
	svg_block_arrow1,
	svg_block_arrow2,
	svg_block_arrow3,
	svg_block_arrow4,
	svg_block_arrow6,
	svg_block_arrow7,
	svg_block_arrow8,
	svg_block_arrow9,
	svg_block_hbar,
	svg_block_vbar,
	svg_block_tlbr,
	svg_block_bltr,
	svg_block_ice,
	svg_block_knight,
	svg_block_mine,
	svg_block_reclaim,
	svg_block_border
} from './svg-shapes.js'

export { 
	svg_block_header,
	svg_block_border,
}

export const svg_block_map = {
	circle: svg_block_circled, // + svg_block_circled_outline
	
	base: svg_block_star + svg_block_base_jewel,
	
	star: svg_block_star,
	ostar: svg_block_circled + svg_block_star,
	
	plus: svg_block_plus,
	oplus: svg_block_circled + svg_block_plus, // + svg_block_circled_outline
	
	cross: svg_block_cross,
	ocross: svg_block_circled + svg_block_cross,
	
	arrow1: svg_block_arrow1,
	arrow11: svg_block_circled + svg_block_arrow1,
	
	arrow2: svg_block_arrow2,
	arrow22: svg_block_circled + svg_block_arrow2,
	
	arrow3: svg_block_arrow3,
	arrow33: svg_block_circled + svg_block_arrow3,
	
	arrow4: svg_block_arrow4,
	arrow44: svg_block_circled + svg_block_arrow4,
	
	arrow6: svg_block_arrow6,
	arrow66: svg_block_circled + svg_block_arrow6,
	
	arrow7: svg_block_arrow7,
	arrow77: svg_block_circled + svg_block_arrow7,
	
	arrow8: svg_block_arrow8,
	arrow88: svg_block_circled + svg_block_arrow8,
	
	arrow9: svg_block_arrow8,
	arrow99: svg_block_circled + svg_block_arrow9,
	
	hbar: svg_block_hbar,
	ohbar: svg_block_circled + svg_block_hbar,
	
	vbar: svg_block_vbar,
	ovbar: svg_block_circled + svg_block_vbar,
	
	tlbr: svg_block_tlbr,
	otlbr: svg_block_circled + svg_block_tlbr,
	
	bltr: svg_block_bltr,
	obltr: svg_block_circled + svg_block_bltr,
	
	ice: svg_block_ice,
	knight: svg_block_knight,
	mine: svg_block_mine,
	reclaim: svg_block_reclaim,
}