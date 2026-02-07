

// this is the empty block color passed in from server later on
export const emptyColor = "#d5ccbd"

export const audioButtonSVG = document.querySelector('#audio-button').innerHTML.trim()


// @TODO: move this over to load from ../../shared/static.js
export const blocklist_readableNames = {
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


// 
// For SVG blocks
// 
export const svg_block_header = `<svg 
	version="1.2"
	baseProfile="tiny"
	xmlns="http://www.w3.org/2000/svg"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	width="80px"
	height="80px"
	viewBox="0 0 80 80"
	xml:space="preserve"
>`

const svg_block_circled = `<circle fill="none" class="oShape" stroke="#000000" stroke-width="5" cx="40" cy="40" r="30"/>`

// Unused thing.
const svg_block_circled_outline = `<path class="outline" d="M40,74.5C20.977,74.5,5.5,59.023,5.5,40S20.977,5.5,40,5.5S74.5,20.977,74.5,40S59.023,74.5,40,74.5L40,74.5 z"/>`

export const svg_block_star = `<polygon 
	class="shape" 
	points="62.5,45 62.499,34.999 52.071,35 59.445,27.625 52.374,20.555 44.999,27.93 44.999,17.5 35,17.5 35,27.929 27.625,20.555 20.555,27.625 27.928,35 17.5,35 17.5,45 27.929,45 20.555,52.374 27.625,59.445 35,52.072 34.999,62.499 45,62.5 44.999,52.07 52.374,59.445 59.445,52.374 52.071,45"
/>`
export const svg_block_base_jewel = `<circle class="jewel" cx="40" cy="40" r="7.5"/>`

const svg_block_plus = `<polygon
	class="shape" 
	points="62.5,35 45,35 45,17.5 35,17.5 35,35 17.5,35 17.5,45 35,45 35,62.5 45,62.5 45,45 62.5,45"
/>`

const svg_block_cross = `<polygon
	class="shape"
	points="59.445,52.374 47.071,40 59.445,27.625 52.374,20.555 40,32.929 27.625,20.555 20.555,27.625 32.929,40 20.555,52.374 27.625,59.445 40,47.071 52.374,59.445"
/>`

const svg_block_arrow1 = `<polygon class="shape" points="22.42,57.58 46.762,52.419 40,47.071 59.445,27.626 52.374,20.555 32.929,40 27.582,33.238 "/>`
const svg_block_arrow2 = `<polygon class="shape" points="40,64.861 53.563,44 45,45 45,17.5 35,17.5 35,45 26.438,44 "/>`
const svg_block_arrow3 = `<polygon class="shape" points="57.58,57.58 52.419,33.238 47.071,40 27.626,20.555 20.555,27.626 40,47.071 33.238,52.419 "/>`
const svg_block_arrow4 = `<polygon class="shape" points="15.139,40 36,53.563 35,45 62.5,45 62.5,35 35,35 36,26.438 "/>`
const svg_block_arrow6 = `<polygon class="shape" points="64.861,40 44,26.438 45,35 17.5,35 17.5,45 45,45 44,53.563 "/>`
const svg_block_arrow7 = `<polygon class="shape" points="22.42,22.42 27.582,46.762 32.929,40 52.374,59.445 59.445,52.374 40,32.929 46.762,27.582 "/>`
const svg_block_arrow8 = `<polygon class="shape" points="40,15.139 26.438,36 35,35 35,62.5 45,62.5 45,35 53.563,36 "/>`
const svg_block_arrow9 = `<polygon class="shape" points="57.58,22.42 33.238,27.581 40,32.929 20.555,52.374 27.626,59.445 47.071,40 52.419,46.762 "/>`

const svg_block_hbar = `<rect class="shape" x="17.5" y="35" width="45" height="10"/>`
const svg_block_vbar = `<rect class="shape" x="35" y="17.5" width="10" height="45"/>`
const svg_block_tlbr = `<rect class="shape" x="17.5" y="35" transform="matrix(-0.7071 -0.7071 0.7071 -0.7071 40 96.5684)" width="45" height="10"/>`
const svg_block_bltr = `<rect class="shape" x="17.5" y="34.999" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -16.5682 40.0007)" width="45" height="10"/>`

const svg_block_ice = `<rect fill="#B6E3FF" width="80" height="80"/>
<polygon fill="#CFF1FF" points="80,38.375 0,29.375 0,17.125 80,24 "/>
<polygon fill="#CFF1FF" points="80,65 0,49.375 0,37.125 80,50.5 "/>
<polygon fill="#FFFFFF" stroke="#B6E3FF" points="25.536,43.786 28.788,54.874 39.875,58.125 28.788,61.377 25.536,72.464 22.285,61.377 11.197,58.125 22.285,54.874 "/>
<polygon fill="#FFFFFF" stroke="#B6E3FF" points="53.339,11.322 56.591,22.41 67.678,25.661 56.591,28.913 53.339,40 50.088,28.913 39,25.661 50.088,22.41 "/>
`

const svg_block_knight = `<path 
	d="M24.457,70.447c0,0,0.238-11.977,6.288-17.872C43.651,40,41.666,37.022,41.666,37.022s-4.964-1.986-11.694,4.082 c-6.729,6.066-11.692,8.493-12.134,3.86c0,0-6.288,0.221-5.957-3.86c0.331-4.082,13.127-19.084,14.893-24.159 c1.765-5.074,1.985-7.391,1.985-7.391s5.185,2.427,6.839,5.074c0,0,3.751-5.185,6.73-5.074l1.103,4.412 c0,0,12.024,1.765,16.988,14.672c4.964,12.907,4.964,41.809,4.964,41.809"
/>
<path fill="#AD0000" d="M31.347,22.019c0,0-6.067,3.162-6.067,7.281c0,0.184,0,0.441,0,0.441s4.964-1.765,5.516-4.743"/>
`

const svg_block_mine = `
<g class="mineMetal">
	<circle cx="40" cy="40" r="4.2"/>
	<path d="M59.7,49.5C59.7,49.5,59.7,49.5,59.7,49.5c0.2-0.4,0.3-0.7,0.5-1.1c0,0,0-0.1,0-0.1c0.1-0.3,0.3-0.6,0.4-1
	c0-0.1,0.1-0.2,0.1-0.3c0.1-0.3,0.2-0.5,0.3-0.8c0-0.1,0.1-0.3,0.1-0.4c0.1-0.2,0.1-0.5,0.2-0.7c0-0.1,0.1-0.3,0.1-0.4
	c0.1-0.2,0.1-0.5,0.1-0.7c0-0.1,0.1-0.3,0.1-0.4c0-0.2,0.1-0.5,0.1-0.7c0-0.1,0-0.3,0.1-0.4c0-0.3,0.1-0.5,0.1-0.8
	c0-0.1,0-0.3,0-0.4c0-0.4,0-0.8,0-1.2c0-0.4,0-0.8,0-1.2c0-0.1,0-0.3,0-0.4c0-0.3,0-0.5-0.1-0.8c0-0.1,0-0.3-0.1-0.4
	c0-0.3-0.1-0.5-0.1-0.8c0-0.1,0-0.3-0.1-0.4c0-0.3-0.1-0.5-0.2-0.8c0-0.1-0.1-0.3-0.1-0.4c-0.1-0.3-0.1-0.5-0.2-0.8
	c0-0.1-0.1-0.2-0.1-0.3c-0.1-0.3-0.2-0.6-0.3-0.9c0-0.1,0-0.1-0.1-0.2c-0.3-0.7-0.6-1.5-0.9-2.2c0,0,0,0,0,0
	c-2.5-5.1-6.9-9.1-12.3-11c0,0,0,0,0,0c-0.4-0.1-0.7-0.2-1.1-0.4c-0.1,0-0.2,0-0.2-0.1c-0.3-0.1-0.6-0.2-0.9-0.2
	c-0.1,0-0.2-0.1-0.3-0.1c-0.3-0.1-0.5-0.1-0.8-0.2c-0.1,0-0.3,0-0.4-0.1c-0.3,0-0.5-0.1-0.8-0.1c-0.1,0-0.3,0-0.4-0.1
	c-0.3,0-0.6-0.1-0.8-0.1c-0.1,0-0.2,0-0.4,0c-0.4,0-0.8,0-1.2,0c-0.4,0-0.8,0-1.2,0c-0.1,0-0.3,0-0.4,0c-0.3,0-0.5,0-0.8,0.1
	c-0.1,0-0.3,0-0.4,0.1c-0.2,0-0.5,0.1-0.7,0.1c-0.1,0-0.3,0.1-0.4,0.1c-0.2,0-0.5,0.1-0.7,0.1c-0.1,0-0.3,0.1-0.4,0.1
	c-0.2,0.1-0.5,0.1-0.7,0.2c-0.1,0-0.3,0.1-0.4,0.1c-0.3,0.1-0.5,0.2-0.8,0.3c-0.1,0-0.2,0.1-0.3,0.1c-0.3,0.1-0.6,0.2-1,0.4
	c0,0-0.1,0-0.1,0c-6,2.5-10.6,7.6-12.5,13.9c0,0.1,0,0.1-0.1,0.2c-0.1,0.3-0.2,0.6-0.2,0.9c0,0.1,0,0.2-0.1,0.3
	c-0.1,0.3-0.1,0.6-0.2,0.8c0,0.1,0,0.3-0.1,0.4c0,0.3-0.1,0.5-0.1,0.8c0,0.1,0,0.3-0.1,0.4c0,0.3-0.1,0.6-0.1,0.8
	c0,0.1,0,0.2,0,0.4c0,0.4,0,0.8,0,1.2c0,0.4,0,0.8,0,1.2c0,0.1,0,0.2,0,0.4c0,0.3,0,0.6,0.1,0.8c0,0.1,0,0.3,0.1,0.4
	c0,0.3,0.1,0.5,0.1,0.8c0,0.1,0,0.3,0.1,0.4c0,0.3,0.1,0.5,0.2,0.8c0,0.1,0.1,0.2,0.1,0.3c0.1,0.3,0.1,0.6,0.2,0.9
	c0,0.1,0,0.2,0.1,0.2c0.1,0.4,0.2,0.7,0.4,1.1c0,0,0,0,0,0c1.9,5.4,5.9,9.8,11,12.3c0,0,0,0,0,0c0.7,0.3,1.4,0.7,2.2,0.9
	c0.1,0,0.1,0,0.2,0.1c0.3,0.1,0.6,0.2,0.9,0.3c0.1,0,0.2,0.1,0.3,0.1c0.3,0.1,0.5,0.1,0.8,0.2c0.1,0,0.3,0.1,0.4,0.1
	c0.3,0.1,0.5,0.1,0.8,0.2c0.1,0,0.3,0.1,0.4,0.1c0.3,0,0.5,0.1,0.8,0.1c0.1,0,0.3,0,0.4,0.1c0.3,0,0.5,0.1,0.8,0.1
	c0.1,0,0.3,0,0.4,0c0.4,0,0.8,0,1.2,0c0.4,0,0.8,0,1.2,0c0.1,0,0.2,0,0.4,0c0.3,0,0.6,0,0.8-0.1c0.1,0,0.3,0,0.4-0.1
	c0.3,0,0.5-0.1,0.8-0.1c0.1,0,0.3,0,0.4-0.1c0.3-0.1,0.6-0.1,0.8-0.2c0.1,0,0.2,0,0.3-0.1c0.3-0.1,0.6-0.2,0.9-0.2
	c0.1,0,0.1,0,0.2-0.1c1.2-0.4,2.3-0.8,3.4-1.3c0,0,0,0,0,0C54,57.4,57.5,53.9,59.7,49.5z M40,46.2c-3.4,0-6.2-2.8-6.2-6.2
	s2.8-6.2,6.2-6.2s6.2,2.8,6.2,6.2S43.4,46.2,40,46.2z"/>
	<path fill="#1C1C1C" d="M18.9,51.1l-1,1c-1.6,1.6-1.6,4.1,0,5.7l4.4,4.4c1.6,1.6,4.1,1.6,5.7,0l1-1C24.7,58.9,21.2,55.4,18.9,51.1z "/>';
	<path fill="#1C1C1C" d="M61.1,29l1.3-1.3c1.6-1.6,1.6-4.1,0-5.7L58,17.7c-1.6-1.6-4.1-1.6-5.7,0l-1.3,1.3 C55.4,21.2,58.9,24.7,61.1,29z"/>';
	<path fill="#1C1C1C" d="M61.1,51c-2.2,4.3-5.7,7.8-10,10.1l1.1,1.1c1.6,1.6,4.1,1.6,5.7,0l4.4-4.4c1.6-1.6,1.6-4.1,0-5.7L61.1,51z" />';
	<path fill="#1C1C1C" d="M18.9,28.9c2.3-4.3,5.8-7.8,10.1-10l-1.2-1.2c-1.6-1.6-4.1-1.6-5.7,0L17.8,22c-1.6,1.6-1.6,4.1,0,5.7 L18.9,28.9z"/>';
</g>
<circle class="mineLights" cx="30" cy="30" r="2"/>
<circle class="mineLights" cx="50" cy="30" r="2"/>
<circle class="mineLights" cx="30" cy="50" r="2"/>
<circle class="mineLights" cx="50" cy="50" r="2"/>
`

const svg_block_reclaim = `
<polygon fill="#E3FFE1" points="13.2,21.3 15.1,27.8 21.5,29.7 15.1,31.6 13.2,38 11.3,31.6 4.8,29.7 11.3,27.8 	"/>
<polygon fill="#E3FFE1" points="40.8,60 42.7,66.4 49.2,68.3 42.7,70.2 40.8,76.7 38.9,70.2 32.5,68.3 38.9,66.4 	"/>
<polygon fill="#E3FFE1" points="64.5,37.2 66.3,43.6 72.8,45.5 66.3,47.4 64.5,53.8 62.6,47.4 56.1,45.5 62.6,43.6 	"/>
<polygon fill="#E3FFE1" points="62.7,11.2 64.6,17.6 71,19.5 64.6,21.4 62.7,27.8 60.8,21.4 54.3,19.5 60.8,17.6 	"/>
<polygon fill="#E3FFE1" points="32.5,3.8 34.4,10.3 40.8,12.2 34.4,14.1 32.5,20.5 30.6,14.1 24.1,12.2 30.6,10.3 	"/>
<polygon fill="#E3FFE1" points="15.5,50.3 17.4,56.8 23.9,58.7 17.4,60.6 15.5,67 13.7,60.6 7.2,58.7 13.7,56.8 	"/>
<path fill="#006616" d="M45.5,62.8l-0.4-0.6c-0.5-0.8-1.3-2.7-3.1-10.3c-1.1-5-2.6-5.8-5.7-5.9h-1.6v16.8H22.6V18.3l1-0.2
c3.5-0.6,8.3-0.9,13.1-0.9c6.9,0,11.4,1.1,14.6,3.6c2.9,2.3,4.4,5.7,4.4,9.9c0,5-2.9,8.7-6.3,10.7c2.6,2,3.7,5.2,4.4,7.6
c0.4,1.3,0.7,2.7,1.1,4c0.9,3.3,1.8,6.7,2.3,7.8l0.9,1.8H45.5z M37.2,36.5c4,0,6.4-1.8,6.4-4.9c0-3.1-2-4.6-5.9-4.7
c-1.2,0-2.2,0.1-3.1,0.1v9.4H37.2z"/>
<path fill="#B3FFC1" d="M36.7,18.5c6.3,0,10.8,1,13.8,3.4c2.5,2,3.9,5,3.9,8.9c0,5.4-3.9,9.2-7.5,10.5v0.2c3,1.2,4.6,4.1,5.7,8
c1.3,4.8,2.7,10.4,3.5,12h-9.9c-0.7-1.2-1.7-4.7-3-9.9c-1.1-5.3-3-6.8-6.9-6.8h-2.9v16.8h-9.6V19.4C27,18.9,31.6,18.5,36.7,18.5
M33.4,37.8h3.8c4.8,0,7.7-2.4,7.7-6.1c0-3.9-2.7-5.9-7.1-6c-2.3,0-3.7,0.2-4.4,0.3V37.8 M36.7,16c-4.8,0-9.7,0.3-13.3,0.9
l-2.1,0.3v2.1v42.1V64h2.5h9.6h2.5v-2.5V47.2h0.4c2.3,0,3.5,0.3,4.5,4.9l0,0l0,0c1.8,7.6,2.7,9.7,3.2,10.6l0.7,1.2h1.4h9.9h4
l-1.8-3.6c-0.5-1-1.4-4.5-2.2-7.5c-0.4-1.3-0.7-2.7-1.1-4.1c-0.6-2.2-1.6-5-3.6-7.2c3.1-2.3,5.5-6.1,5.5-10.9
c0-4.6-1.7-8.3-4.9-10.9C48.7,17.2,44,16,36.7,16L36.7,16z M35.9,28.2c0.6,0,1.2,0,1.9,0c4.6,0.1,4.6,2.4,4.6,3.5
c0,3.2-3.2,3.6-5.2,3.6h-1.3V28.2L35.9,28.2z"/>`

export const svg_block_border = `<path class="border" d="M80,80H0V0h80V80L80,80z M2.5,77.5h75v-75h-75V77.5L2.5,77.5z"/>`

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