const { port } = require('./settings.js')
const { serve } = require('@hono/node-server')
const { Hono } = require('hono')

const { startIO } = require('./game/socket.js')

const app = new Hono()

const server = serve({
  fetch: app.fetch,
  port: port,
})

console.log('running on port ' + port)

startIO(server)

module.exports = {
	app
}