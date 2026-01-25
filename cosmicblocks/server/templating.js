// Handle the HTML templating using eta
const path = require('path')
const { Eta } = require('eta')

const eta = new Eta({
	views: path.join(__dirname, 'templates')
})

function eta_render(template, vars) {
	const renderVars = Object.assign({}, vars)
	return eta.render(template, renderVars)
}

module.exports = { eta_render }
