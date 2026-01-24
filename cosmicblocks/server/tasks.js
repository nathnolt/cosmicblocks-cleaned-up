const fs = require('fs')
const sass = require('sass')
const path = require('path')

function convert_client_sass_to_css() {
	const folder = path.join(__dirname, '../')
	const scssPath = folder + 'style.scss'
	const sass_compile_result = sass.compile(scssPath)
	const minified_css_string = sass_compile_result.css
	fs.writeFileSync(folder + 'client/style.css', minified_css_string)
	// console.log('written output css to /client/style.css')
}

// @TODO, maybe minify client.js to save some bandwidth optionally later.

module.exports = {
	convert_client_sass_to_css,
}