const Fastify = require('fastify')
const fastifySession = require('@fastify/session')
const fastifyCookie = require('@fastify/cookie')
const fastifyFormbody = require('@fastify/formbody')
const FastifyStatic = require('@fastify/static')
const { getCookieSignerSecret } = require('./util.js')


const http = require('http')
const path = require('path')

const { startIO } = require('./game/game.js')
const { port } = require('./settings.js')

// 3. server stuff
let server
function serverFactory(handler, opts) {
	server = http.createServer(function(req, res) {
		handler(req, res)
	})
	
	return server
}

const fastify = Fastify({
	//logger: true,
	serverFactory: serverFactory
})

fastify.register(fastifyCookie)
fastify.register(fastifySession, {
	secret: getCookieSignerSecret(),
	cookie: {
		secure: 'auto',
	}
})
fastify.register(fastifyFormbody)

// register plugins on fastify
const clientPath = path.join(__dirname, '../client')
fastify.register(FastifyStatic, {
  root: clientPath,
  prefix: '/',
  // prefix: '/public/', // optional: default '/'
  // constraints: { host: 'example.com' } // optional: default {}
})




// start the server
fastify.ready(function() {
	server.listen({port: port})
	console.log("Started server on port " + port)
})




startIO(server)

module.exports = {
	fastify
}