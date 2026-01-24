const fs = require('fs')
const sass = require('sass')

// ---------------
// static tasks to run 
// Convert the SASS into CSS
function runTasks() {
	sass_to_css()
}


function sass_to_css() {
	const sass_compile_result = sass.compile('./cosmicblocks/client/style.css')
	const minified_css_string = sass_compile_result.css
	fs.writeFileSync('./cosmicblocks/client/style.css', minified_css_string)
	console.log('written output css to /client/style.css')
}

module.exports = {
	runTasks,
}