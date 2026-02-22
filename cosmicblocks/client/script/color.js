export function ColorLuminance(hex, lum) { // thanks Craig Buckler for this function

	//hex � a hex color value such as �#abc� or �#123456� (the hash is optional)
	//lum � the luminosity factor, i.e. -0.1 is 10% darker, 0.2 is 20% lighter, etc.
	
	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (let i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
}
export function mix(color_1, color_2, weight) {
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
};

export function hex2rgba(hex,opacity){
	hex = hex.replace('#','');
	var r = parseInt(hex.substring(0,2), 16);
	var g = parseInt(hex.substring(2,4), 16);
	var b = parseInt(hex.substring(4,6), 16);

	var result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
	return result;
}