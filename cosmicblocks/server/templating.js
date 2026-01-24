// Handle the HTML templating using eta
const path = require('path')
const { Eta } = require('eta')

const eta = new Eta({
	views: path.join(__dirname, 'templates')
})

module.exports = { eta }
