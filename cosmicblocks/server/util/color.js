const {
	random_inclusive_int,
} = require('./util.js')

// 
// Putting small requires flattened out here, 
// in order to reduce dependencies
// 

// This was hsl npm package.
function hslToHex(hue, saturation, luminosity) {
	
	// resolve degrees to 0 - 359 range
	{
		hue = Math.abs(hue)
		
		// for safety:
		hue = clamp(hue, 0, 1e8)
		hue = hue % 360
	}
	
	// enforce constraints
	saturation = clamp(saturation, 0, 100)
	luminosity = clamp(luminosity, 0, 100)

	// convert to 0 to 1 range used by hsl-to-rgb-for-reals
	saturation /= 100
	luminosity /= 100

	// let hsl-to-rgb-for-reals do the hard work
	var rgb = hslToRgb(hue, saturation, luminosity)
	
	return '#' + 
		rgb[0].toString(16).padStart(2, 0) +
		rgb[1].toString(16).padStart(2, 0) +
		rgb[2].toString(16).padStart(2, 0)
}

function clamp(value, min, max) {
	if(value < min) {
		return min
	}
	if(value > max) {
		return max
	}
	return value
}

// expected hue range: [0, 360)
// expected saturation range: [0, 1]
// expected lightness range: [0, 1]
function hslToRgb(hue, saturation, lightness) {
	// based on algorithm from http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
	if( hue == undefined ){
		return [0, 0, 0]
	}

	var chroma = (1 - Math.abs((2 * lightness) - 1)) * saturation
	var huePrime = hue / 60
	var secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1))

	huePrime = Math.floor(huePrime)
	var red
	var green
	var blue

	if( huePrime === 0 ){
		red = chroma
		green = secondComponent
		blue = 0
	} else if( huePrime === 1 ){
		red = secondComponent
		green = chroma
		blue = 0
	} else if( huePrime === 2 ){
		red = 0
		green = chroma
		blue = secondComponent
	} else if( huePrime === 3 ){
		red = 0
		green = secondComponent
		blue = chroma
	} else if( huePrime === 4 ){
		red = secondComponent
		green = 0
		blue = chroma
	} else if( huePrime === 5 ){
		red = chroma
		green = 0
		blue = secondComponent
	}

	var lightnessAdjustment = lightness - (chroma / 2)
	red += lightnessAdjustment
	green += lightnessAdjustment
	blue += lightnessAdjustment

	return [
			Math.abs(Math.round(red * 255)),
			Math.abs(Math.round(green * 255)),
			Math.abs(Math.round(blue * 255))
	]

}




function assignColor() {
	var randomHue = random_inclusive_int(1, 360);
	var randomSaturation = random_inclusive_int(40, 75);
	var lightnessBonus = random_inclusive_int(-5, 5); // this is hacky but w/e.
	if ((randomHue > 50) && (randomHue < 190)) {
		// when in the green/cyan range, decrease brightness a bit.
		lightnessBonus = random_inclusive_int(-20, -10);
	} else if ((randomHue > 210) && (randomHue < 300)) {
		// in the blue/purple range, increase brightness a bit.
		lightnessBonus = random_inclusive_int(10, 20);
	}
	var randomLightness = (random_inclusive_int(50, 75) + lightnessBonus);
	return hslToHex(randomHue,randomSaturation,randomLightness);
}

function hexColorDelta(hex1, hex2) {
	// this function finds the difference between two colors.
	// stole this from stackoverflow :D
	
	hex1 = hex1.replace(/^\s*#|\s*$/g, '');
	hex2 = hex2.replace(/^\s*#|\s*$/g, '');
	
	// get red/green/blue int values of hex1
	var r1 = parseInt(hex1.substring(0, 2), 16);
	var g1 = parseInt(hex1.substring(2, 4), 16);
	var b1 = parseInt(hex1.substring(4, 6), 16);
	// get red/green/blue int values of hex2
	var r2 = parseInt(hex2.substring(0, 2), 16);
	var g2 = parseInt(hex2.substring(2, 4), 16);
	var b2 = parseInt(hex2.substring(4, 6), 16);
	// calculate differences between reds, greens and blues
	var r = 255 - Math.abs(r1 - r2);
	var g = 255 - Math.abs(g1 - g2);
	var b = 255 - Math.abs(b1 - b2);
	// limit differences between 0 and 1
	r /= 255;
	g /= 255;
	b /= 255;
	// 0 means opposit colors, 1 means same colors
	return (r + g + b) / 3;
}

function increase_brightness(hex, percent){
	// strip the leading # if it's there
	hex = hex.replace(/^\s*#|\s*$/g, '');

	// convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
	if(hex.length == 3){
		hex = hex.replace(/(.)/g, '$1$1');
	}

	var r = parseInt(hex.substr(0, 2), 16),
		g = parseInt(hex.substr(2, 2), 16),
		b = parseInt(hex.substr(4, 2), 16);

	return '#' +
		((0|(1<<8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
		((0|(1<<8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
		((0|(1<<8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}

function mix(color_1, color_2, weight) {
	color_1 = color_1.slice(1);
	color_2 = color_2.slice(1);
	function d2h(d) { return d.toString(16); }  // convert a decimal value to hex
	function h2d(h) { return parseInt(h, 16); } // convert a hex value to decimal 
	weight = (typeof(weight) !== 'undefined') ? weight : 50; // set the weight to 50%, if that argument is omitted
	var color = "#";
	for(var i = 0; i <= 5; i += 2) { // loop through each of the 3 hex pairs�red, green, and blue
		var v1 = h2d(color_1.substr(i, 2)), // extract the current pairs
			v2 = h2d(color_2.substr(i, 2)),
			// combine the current pairs from each source color, according to the specified weight
			val = d2h(Math.floor(v2 + (v1 - v2) * (weight / 100.0))); 		
		while(val.length < 2) { val = '0' + val; } // prepend a '0' if val results in a single digit
		color += val; // concatenate val to our new color string
	}
	return color;
}


module.exports = {
	hslToHex,
	assignColor,
	hexColorDelta,
	increase_brightness,
	mix
}